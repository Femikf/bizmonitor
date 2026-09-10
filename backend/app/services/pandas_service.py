import io
import pandas as pd
from typing import Tuple


def load_dataframe_from_bytes(content: bytes, filename: str) -> Tuple[pd.DataFrame, str]:
    """
    Parses byte stream content into a pandas DataFrame based on file extension.
    Returns (df, file_format).
    """
    ext = filename.lower().split(".")[-1] if "." in filename else ""
    
    if ext == "csv":
        # Handle CSV with auto header detection
        df = pd.read_csv(io.BytesIO(content))
        return df, "csv"
    elif ext in ["json"]:
        try:
            df = pd.read_json(io.BytesIO(content))
        except Exception:
            # Fallback for line-delimited JSON
            df = pd.read_json(io.BytesIO(content), lines=True)
        return df, "json"
    elif ext in ["xlsx", "xls"]:
        # Auto-detect real table header row if title/banner rows exist at the top
        raw_preview = pd.read_excel(io.BytesIO(content), header=None, nrows=15)
        best_header = 0
        max_cols = 0
        for i in range(len(raw_preview)):
            non_nulls = [x for x in raw_preview.iloc[i] if pd.notna(x) and str(x).strip() != '']
            if len(non_nulls) > max_cols:
                max_cols = len(non_nulls)
                best_header = i
        
        df = pd.read_excel(io.BytesIO(content), skiprows=best_header)
        # Drop fully empty rows
        df = df.dropna(how='all')
        return df, ext

    elif ext in ["parquet"]:
        df = pd.read_parquet(io.BytesIO(content))
        return df, "parquet"
    else:
        # Default fallback to CSV parsing
        try:
            df = pd.read_csv(io.BytesIO(content))
            return df, "csv"
        except Exception as err:
            raise ValueError(f"Unsupported file format '.{ext}'. Please upload CSV, JSON, XLSX, or Parquet.") from err
