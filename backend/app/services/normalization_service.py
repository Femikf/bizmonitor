import re
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple
from app.models.pipeline import NormalizationResult


def to_snake_case(text: str) -> str:
    """
    Converts arbitrary column strings into clean snake_case.
    Example: 'Order ID (#)' -> 'order_id'
             'Unit Price ($)' -> 'unit_price'
    """
    # Replace special symbol hints
    text = text.replace("$", "usd").replace("%", "pct").replace("#", "num")
    # Replace non-alphanumeric characters with underscore
    text = re.sub(r'[^a-zA-Z0-9]+', '_', text)
    # Strip leading/trailing underscores
    text = text.strip('_')
    # Convert camelCase to snake_case
    text = re.sub(r'([a-z0-9])([A-Z])', r'\1_\2', text).lower()
    return text if text else "column"


def normalize_dataframe(df: pd.DataFrame) -> Tuple[pd.DataFrame, NormalizationResult]:
    """
    Cleans column headers and formats rows into normalized BigQuery/Firestore ready records.
    """
    original_cols = [str(c) for c in df.columns]
    column_mapping: Dict[str, str] = {}
    used_cols = set()

    for orig in original_cols:
        norm = to_snake_case(orig)
        # Ensure unique column names if duplicates arise after normalization
        base_norm = norm
        counter = 1
        while norm in used_cols:
            norm = f"{base_norm}_{counter}"
            counter += 1
        used_cols.add(norm)
        column_mapping[orig] = norm

    # Create normalized DataFrame copy
    norm_df = df.copy()
    norm_df.rename(columns=column_mapping, inplace=True)

    # Clean missing values for JSON compliance (NaN -> None)
    cleaned_df = norm_df.replace({np.nan: None})

    # Prepare sample records (up to 50 rows) for preview
    sample_df = cleaned_df.head(50)
    sample_records: List[Dict[str, Any]] = []

    for _, row in sample_df.iterrows():
        record = {}
        for col in norm_df.columns:
            val = row[col]
            if isinstance(val, pd.Timestamp):
                val = val.isoformat()
            elif isinstance(val, (np.integer, np.int64)):
                val = int(val)
            elif isinstance(val, (np.floating, np.float64)):
                val = float(val) if not np.isnan(val) else None
            record[col] = val
        sample_records.append(record)

    norm_result = NormalizationResult(
        original_columns=original_cols,
        normalized_columns=list(norm_df.columns),
        column_mapping=column_mapping,
        rows_processed=len(norm_df),
        sample_records=sample_records
    )

    return norm_df, norm_result
