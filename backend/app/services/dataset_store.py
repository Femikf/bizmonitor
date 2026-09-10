import threading
from typing import Dict, Optional, List, Any
import pandas as pd
from app.models.opspilot_models import OpsPilotOverview


class DatasetStore:
    """
    In-memory thread-safe registry of uploaded datasets and their
    dynamically synthesized OpsPilot 5-Stage overviews.
    """
    def __init__(self):
        self._lock = threading.Lock()
        self._datasets: Dict[str, Dict[str, Any]] = {}
        self._latest_dataset_id: Optional[str] = None

    def register_dataset(
        self,
        dataset_id: str,
        df: pd.DataFrame,
        metadata: Dict[str, Any],
        overview: OpsPilotOverview
    ) -> None:
        with self._lock:
            self._datasets[dataset_id] = {
                "id": dataset_id,
                "df": df.copy(),
                "metadata": metadata,
                "overview": overview,
            }
            self._latest_dataset_id = dataset_id

    def get_dataset(self, dataset_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        with self._lock:
            target_id = dataset_id or self._latest_dataset_id
            if not target_id:
                return None
            return self._datasets.get(target_id)

    def get_latest_dataset_id(self) -> Optional[str]:
        with self._lock:
            return self._latest_dataset_id

    def get_all_datasets(self) -> List[Dict[str, Any]]:
        with self._lock:
            return list(self._datasets.values())

    def get_overview(self, dataset_id: Optional[str] = None) -> Optional[OpsPilotOverview]:
        with self._lock:
            target_id = dataset_id or self._latest_dataset_id
            if not target_id or target_id not in self._datasets:
                return None
            return self._datasets[target_id].get("overview")

    def has_data(self) -> bool:
        with self._lock:
            return bool(self._datasets)

    def clear(self) -> None:
        with self._lock:
            self._datasets.clear()
            self._latest_dataset_id = None


# Global singleton instance
dataset_store = DatasetStore()
