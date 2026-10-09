from pathlib import Path
import gzip
import json
import struct
import pandas as pd
import kagglehub
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score, brier_score_loss

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "src" / "data"
META_OUT = DATA_DIR / "cardiovascular-rf-metadata.json"
TREES_OUT = DATA_DIR / "cardiovascular-rf-trees.bin.gz"
OLD_OUT = DATA_DIR / "cardiovascular-rf-model.json.gz"

dataset_path = Path(kagglehub.dataset_download("colewelkins/cardiovascular-disease"))
csv_matches = list(dataset_path.rglob("cardio_data_processed.csv"))
if not csv_matches:
    raise FileNotFoundError("cardio_data_processed.csv was not found in the downloaded Kaggle dataset.")
data = pd.read_csv(csv_matches[0])

raw_features = ["age_years", "ap_hi", "ap_lo", "cholesterol", "active", "weight", "height", "smoke"]
categorical_features = ["cholesterol", "active", "smoke"]
X_raw = data[raw_features].copy()
X = pd.get_dummies(X_raw, columns=categorical_features, dtype=int)
y = data["cardio"]
train_X, test_X, train_y, test_y = train_test_split(
    X, y, test_size=0.20, random_state=1, stratify=y
)
feature_columns = train_X.columns.tolist()
test_X = test_X.reindex(columns=feature_columns, fill_value=0)

model = RandomForestClassifier(
    n_estimators=500,
    min_samples_split=10,
    class_weight="balanced",
    random_state=1,
    n_jobs=-1,
)
model.fit(train_X, train_y)
probabilities = model.predict_proba(test_X)[:, 1]
roc_auc = float(roc_auc_score(test_y, probabilities))
brier = float(brier_score_loss(test_y, probabilities))
print(f"Records: {len(data)}")
print(f"Encoded features: {feature_columns}")
print(f"Test ROC-AUC: {roc_auc:.4f}")
print(f"Test Brier score: {brier:.4f}")

# Store each node as a fixed-width binary record to avoid huge JS object graphs
# in the serverless runtime. Record layout is little-endian <iiidd:
# left child, right child, split feature, split threshold, class-1 probability.
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
    "format_version": 2,
    "model": "RandomForestClassifier",
    "target": "cardio",
    "target_meaning": "recorded cardiovascular disease status (0 = no disease recorded, 1 = disease recorded)",
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
    "test_roc_auc": roc_auc,
    "test_brier_score": brier,
    "feature_importances": {
        feature_columns[i]: float(value)
        for i, value in enumerate(model.feature_importances_)
    },
    "tree_node_counts": tree_node_counts,
    "tree_record_bytes": 13,
}
META_OUT.write_text(json.dumps(metadata, separators=(",", ":")), encoding="utf-8")
# Remove the earlier JSON-tree export from the repository in the next commit.
OLD_OUT.unlink(missing_ok=True)
print(f"Wrote metadata {META_OUT} ({META_OUT.stat().st_size:,} bytes)")
print(f"Wrote compressed binary trees {TREES_OUT} ({TREES_OUT.stat().st_size:,} bytes)")
