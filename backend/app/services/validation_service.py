import pandas as pd
from typing import List
from app.models.pipeline import ValidationResult, ValidationIssue


def validate_dataframe(df: pd.DataFrame) -> ValidationResult:
    """
    Validates DataFrame structure, missing values, duplicates, and column anomalies.
    """
    issues: List[ValidationIssue] = []
    total_rows, total_cols = df.shape

    if total_rows == 0:
        issues.append(ValidationIssue(
            severity="error",
            message="Dataset is completely empty (0 rows)."
        ))
        return ValidationResult(
            is_valid=False,
            total_rows=0,
            total_columns=total_cols,
            missing_cells_count=0,
            duplicate_rows_count=0,
            issues=issues
        )

    # Missing cells check
    missing_cells = int(df.isna().sum().sum())
    total_cells = total_rows * total_cols
    missing_percent = (missing_cells / total_cells * 100) if total_cells > 0 else 0.0

    if missing_percent > 20.0:
        issues.append(ValidationIssue(
            severity="warning",
            message=f"High proportion of missing data ({missing_percent:.1f}% missing cells across dataset)."
        ))

    # Column-level null checks
    for col in df.columns:
        null_count = int(df[col].isna().sum())
        if null_count == total_rows:
            issues.append(ValidationIssue(
                severity="warning",
                column=str(col),
                message=f"Column '{col}' is 100% empty (all values are missing)."
            ))

    # Duplicate rows check
    duplicate_rows = int(df.duplicated().sum())
    if duplicate_rows > 0:
        issues.append(ValidationIssue(
            severity="info",
            message=f"Detected {duplicate_rows} duplicate rows in dataset."
        ))

    is_valid = not any(issue.severity == "error" for issue in issues)

    return ValidationResult(
        is_valid=is_valid,
        total_rows=total_rows,
        total_columns=total_cols,
        missing_cells_count=missing_cells,
        duplicate_rows_count=duplicate_rows,
        issues=issues
    )
