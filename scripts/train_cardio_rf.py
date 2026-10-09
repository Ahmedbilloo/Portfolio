from pathlib import Path
import json
import subprocess
import pandas as pd
import kagglehub
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score, brier_score_loss

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "data" / "cardiovascular-rf-model.json"

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
print(f"Records: {len(data)}")
print(f"Encoded features: {feature_columns}")
print(f"Test ROC-AUC: {roc_auc_score(test_y, probabilities):.4f}")
print(f"Test Brier score: {brier_score_loss(test_y, probabilities):.4f}")

# Serialize the fitted sklearn forest to a compact, framework-independent JSON
# format so the production Node server can run the exact fitted trees.
trees = []
for estimator in model.estimators_:
    tree = estimator.tree_
    nodes = []
    for i in range(tree.node_count):
        values = tree.value[i][0].tolist()
        total = sum(values)
        nodes.append({
            "left": int(tree.children_left[i]),
            "right": int(tree.children_right[i]),
            "feature": int(tree.feature[i]),
            "threshold": float(tree.threshold[i]),
            "p1": float(values[1] / total) if total else 0.0,
        })
    trees.append(nodes)

payload = {
    "format_version": 1,
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
    "test_roc_auc": float(roc_auc_score(test_y, probabilities)),
    "test_brier_score": float(brier_score_loss(test_y, probabilities)),
    "feature_importances": {
        feature_columns[i]: float(value)
        for i, value in enumerate(model.feature_importances_)
    },
    "trees": trees,
}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")
print(f"Wrote {OUT} ({OUT.stat().st_size:,} bytes)")
