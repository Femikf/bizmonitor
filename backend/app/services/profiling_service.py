import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from app.models.pipeline import ProfilingResult, ColumnProfile


def profile_dataframe(df: pd.DataFrame) -> ProfilingResult:
    """
    Computes statistical profiling breakdown for each column in DataFrame.
    """
    total_rows, total_cols = df.shape
    memory_usage_kb = round(df.memory_usage(deep=True).sum() / 1024.0, 2)
    column_profiles: List[ColumnProfile] = []

    for col in df.columns:
        col_series = df[col]
        null_count = int(col_series.isna().sum())
        null_pct = round((null_count / total_rows * 100.0), 2) if total_rows > 0 else 0.0
        unique_cnt = int(col_series.nunique(dropna=True))

        # Classify data type
        dtype = col_series.dtype
        is_numeric = pd.api.types.is_numeric_dtype(dtype) and not pd.api.types.is_bool_dtype(dtype)
        is_bool = pd.api.types.is_bool_dtype(dtype)
        is_datetime = pd.api.types.is_datetime64_any_dtype(dtype)

        min_val: Optional[Any] = None
        max_val: Optional[Any] = None
        mean_val: Optional[float] = None
        top_values: Optional[Dict[str, int]] = None

        if is_numeric:
            data_type = "numeric"
            valid_series = col_series.dropna()
            if len(valid_series) > 0:
                min_val = float(valid_series.min()) if not np.isnan(valid_series.min()) else None
                max_val = float(valid_series.max()) if not np.isnan(valid_series.max()) else None
                mean_val = float(valid_series.mean()) if not np.isnan(valid_series.mean()) else None
        elif is_datetime:
            data_type = "datetime"
            valid_series = col_series.dropna()
            if len(valid_series) > 0:
                min_val = str(valid_series.min())
                max_val = str(valid_series.max())
        elif is_bool:
            data_type = "boolean"
            counts = col_series.value_counts(dropna=True).to_dict()
            top_values = {str(k): int(v) for k, v in counts.items()}
        else:
            # String / categorical / object
            data_type = "categorical" if unique_cnt <= 20 else "text"
            valid_series = col_series.dropna()
            if len(valid_series) > 0:
                top_counts = valid_series.value_counts().head(5).to_dict()
                top_values = {str(k): int(v) for k, v in top_counts.items()}

        column_profiles.append(ColumnProfile(
            column_name=str(col),
            data_type=data_type,
            null_count=null_count,
            null_percentage=null_pct,
            unique_count=unique_cnt,
            min_val=min_val,
            max_val=max_val,
            mean_val=mean_val,
            top_values=top_values
        ))

    return ProfilingResult(
        total_rows=total_rows,
        total_columns=total_cols,
        memory_usage_kb=memory_usage_kb,
        column_profiles=column_profiles
    )
