from pathlib import Path
import gzip
import json
import struct
import numpy as np
import pandas as pd
import kagglehub
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, brier_score_loss, log_loss

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "src" / "data"
META_OUT = DATA_DIR / "cardiovascular-rf-metadata.json"
TREES_OUT = DATA_DIR / "cardiovascular-rf-trees.bin.gz"
EPS = 1e-6

dataset_path = Path(kagglehub.dataset_download("colewelkins/cardiovascular-disease"))
csv_matches = list(dataset_path.rglob("cardio_data_processed.csv"))
if not csv_matches:
    raise FileNotFoundError("cardio_data_processed.csv was not found in the downloaded Kaggle dataset.")
data = pd.read_csv(csv_matches[0])

raw_features = ["age_years", "ap_hi", "ap_lo", "cholesterol", "active", "weight", "height", "smoke"]
categorical_features = ["cholesterol", "active", "smoke"]
X = pd.get_dummies(data[raw_features].copy(), columns=categorical_features, dtype=int)
y = data["cardio"]

# Keep calibration and final evaluation separate. The model sees 60%, calibration
# uses 20%, and the untouched final test set is 20%.
train_cal_X, test_X, train_cal_y, test_y = train_test_split(
    X, y, test_size=0.20, random_state=1, stratify=y
)
train_X, calibration_X, train_y, calibration_y = train_test_split(
    train_cal_X, train_cal_y, test_size=0.25, random_state=2, stratify=train_cal_y
)
feature_columns = train_X.columns.tolist()
calibration_X = calibration_X.reindex(columns=feature_columns, fill_value=0)
test_X = test_X.reindex(columns=feature_columns, fill_value=0)

model = RandomForestClassifier(
    n_estimators=500,
    min_samples_split=10,
    class_weight="balanced",
    random_state=1,
    n_jobs=-1,
)
model.fit(train_X, train_y)

def logit(p):
    p = np.clip(np.asarray(p, dtype=float), EPS, 1 - EPS)
    return np.log(p / (1 - p)).reshape(-1, 1)

# Class-weighted Random Forest probabilities are not necessarily calibrated.
# Fit Platt scaling on a dedicated calibration split, not the final test set.
calibration_raw = model.predict_proba(calibration_X)[:, 1]
calibrator = LogisticRegression(random_state=1, solver="lbfgs")
calibrator.fit(logit(calibration_raw), calibration_y)
test_raw = model.predict_proba(test_X)[:, 1]
test_probabilities = calibrator.predict_proba(logit(test_raw))[:, 1]
roc_auc = float(roc_auc_score(test_y, test_probabilities))
brier = float(brier_score_loss(test_y, test_probabilities))
test_log_loss = float(log_loss(test_y, np.clip(test_probabilities, EPS, 1 - EPS)))
print(f"Records: {len(data)}")
print(f"Train/calibration/test: {len(train_X)}/{len(calibration_X)}/{len(test_X)}")
print(f"Encoded features: {feature_columns}")
print(f"Calibrated held-out test ROC-AUC: {roc_auc:.4f}")
print(f"Calibrated held-out test Brier score: {brier:.4f}")
print(f"Calibrated held-out test log loss: {test_log_loss:.4f}")

# Fixed-width per-node layout: left/right uint16, feature int8, threshold float32,
# leaf class-1 probability float32. Sentinel child indexes are 65535.
tree_bytes = bytearray()
tree_node_counts = []
for estimator in model.estimators_:
    tree = estimator.tree_
    tree_node_counts.append(int(tree.node_count))
    for i in range(tree.node_count):
        values = tree.value[i][0].tolist()
        total = sum(values)
        p1 = float(values[1] / total) if total else 0.0
        tree_bytes.extend(struct.pack(
            "<HHbff",
            int(tree.children_left[i]) if tree.children_left[i] >= 0 else 65535,
            int(tree.children_right[i]) if tree.children_right[i] >= 0 else 65535,
            int(tree.feature[i]),
            float(tree.threshold[i]),
            p1,
        ))

DATA_DIR.mkdir(parents=True, exist_ok=True)
TREES_OUT.write_bytes(gzip.compress(bytes(tree_bytes), compresslevel=6, mtime=0))
metadata = {
    "format_version": 3,
    "model": "RandomForestClassifier",
    "target": "cardio",
    "target_meaning": "recorded cardiovascular disease status (0 = no disease recorded, 1 = disease recorded)",
    "probability_meaning": "Platt-calibrated estimate of the dataset label probability; not a prospective clinical risk",
    "raw_features": raw_features,
    "categorical_features": categorical_features,
    "encoded_feature_columns": feature_columns,
    "parameters": {
        "n_estimators": 500,
        "min_samples_split": 10,
        "class_weight": "balanced",
        "random_state": 1,
    },
    "dataset_records": int(len(data)),
    "split_records": {"train": int(len(train_X)), "calibration": int(len(calibration_X)), "test": int(len(test_X))},
    "calibration": {
        "method": "Platt scaling (logistic regression on raw model log-odds)",
        "intercept": float(calibrator.intercept_[0]),
        "coefficient": float(calibrator.coef_[0][0]),
        "calibration_records": int(len(calibration_X)),
    },
    "test_roc_auc": roc_auc,
    "test_brier_score": brier,
    "test_log_loss": test_log_loss,
    "feature_importances": {
        feature_columns[i]: float(value)
        for i, value in enumerate(model.feature_importances_)
    },
    "tree_node_counts": tree_node_counts,
    "tree_record_bytes": 13,
}
META_OUT.write_text(json.dumps(metadata, separators=(",", ":")), encoding="utf-8")
print(f"Wrote metadata {META_OUT} ({META_OUT.stat().st_size:,} bytes)")
print(f"Wrote compressed binary trees {TREES_OUT} ({TREES_OUT.stat().st_size:,} bytes)")
