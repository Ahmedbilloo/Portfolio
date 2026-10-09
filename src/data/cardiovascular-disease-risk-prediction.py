# Cardiovascular Disease Risk Prediction
# Source code from the notebook's executable cells; Markdown and cell labels are omitted.

%pip install -q kagglehub xgboost

import pandas as pd
from IPython.display import display
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

import kagglehub
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegressionCV
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, roc_curve, classification_report,
    ConfusionMatrixDisplay
)

sns.set_theme(style="whitegrid")

dataset_path = Path(kagglehub.dataset_download("colewelkins/cardiovascular-disease"))
csv_matches = list(dataset_path.rglob("cardio_data_processed.csv"))
if not csv_matches:
    raise FileNotFoundError("cardio_data_processed.csv was not found in the downloaded dataset.")

data = pd.read_csv(csv_matches[0])
print("Dataset shape:", data.shape)
display(data.head())

data.info()
display(data.isna().sum().to_frame("Missing values"))
print("Duplicate rows:", data.duplicated().sum())
display(data.describe(include="all").T)

target_counts = data["cardio"].value_counts().sort_index()
target_pct = data["cardio"].value_counts(normalize=True).sort_index().mul(100)
display(pd.DataFrame({"Count": target_counts, "Percent": target_pct.round(2)}))

target_counts.rename(index={0: "No Disease", 1: "Disease"}).plot(
    kind="bar", figsize=(7, 4), color=["#64748b", "#0f766e"]
)
plt.title("Cardiovascular Disease Target Distribution")
plt.xlabel("Recorded Disease Status")
plt.ylabel("Number of Records")
plt.xticks(rotation=0)
plt.tight_layout()
plt.show()

# Disease rates by cholesterol category
cholesterol_rates = pd.crosstab(data["cholesterol"], data["cardio"], normalize="index").mul(100)
cholesterol_rates.columns = ["No Disease", "Disease"]
display(cholesterol_rates.round(2))
cholesterol_rates.plot(kind="bar", figsize=(8, 4))
plt.title("Disease Rate by Cholesterol Category")
plt.xlabel("Cholesterol Category")
plt.ylabel("Share of Records (%)")
plt.xticks(rotation=0)
plt.tight_layout()
plt.show()

# Disease rates by blood pressure category
bp_rates = pd.crosstab(data["bp_category"], data["cardio"], normalize="index").mul(100)
bp_rates.columns = ["No Disease", "Disease"]
display(bp_rates.round(2))
bp_rates.plot(kind="bar", figsize=(9, 4))
plt.title("Disease Rate by Blood Pressure Category")
plt.xlabel("Blood Pressure Category")
plt.ylabel("Share of Records (%)")
plt.xticks(rotation=25, ha="right")
plt.tight_layout()
plt.show()

# Compare selected clinical averages by target class
clinical_cols = ["age_years", "height", "weight", "bmi", "ap_hi", "ap_lo"]
display(data.groupby("cardio")[clinical_cols].mean().round(2))

fig, axes = plt.subplots(1, 3, figsize=(14, 4))
for ax, col, title in zip(
    axes,
    ["age_years", "bmi", "ap_hi"],
    ["Age by Disease Status", "BMI by Disease Status", "Systolic BP by Disease Status"]
):
    sns.boxplot(data=data, x="cardio", y=col, ax=ax)
    ax.set_title(title)
    ax.set_xlabel("Cardio (0 = No, 1 = Yes)")
plt.tight_layout()
plt.show()

# Disease rates by activity and smoking
for col, title in [("active", "Physical Activity"), ("smoke", "Smoking Status")]:
    rates = pd.crosstab(data[col], data["cardio"], normalize="index").mul(100)
    rates.columns = ["No Disease", "Disease"]
    print(title)
    display(rates.round(2))
    rates.plot(kind="bar", figsize=(6, 3))
    plt.title("Disease Rate by " + title)
    plt.xlabel(col)
    plt.ylabel("Share of Records (%)")
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.show()

numeric_cols = ["age_years", "height", "weight", "ap_hi", "ap_lo",
                "cholesterol", "gluc", "smoke", "alco", "active", "bmi", "cardio"]
plt.figure(figsize=(10, 7))
sns.heatmap(data[numeric_cols].corr(), annot=True, fmt=".2f", cmap="coolwarm", center=0)
plt.title("Correlation Matrix for Numeric and Encoded Variables")
plt.tight_layout()
plt.show()

y = data["cardio"]

features_reduced = [
    "age_years", "ap_hi", "ap_lo", "cholesterol",
    "active", "weight", "height", "smoke"
]
categorical_features = ["cholesterol", "active", "smoke"]

X_raw = data[features_reduced].copy()
X = pd.get_dummies(X_raw, columns=categorical_features, dtype=int)

train_X, test_X, train_y, test_y = train_test_split(
    X, y, test_size=0.20, random_state=1, stratify=y
)
feature_columns = train_X.columns.tolist()
test_X = test_X.reindex(columns=feature_columns, fill_value=0)

print("Reduced input features:", features_reduced)
print("Encoded model features:", feature_columns)
print("Training set:", train_X.shape)
print("Test set:", test_X.shape)
print("Target distribution in training set:")
display(train_y.value_counts(normalize=True).sort_index().mul(100).round(2))

scaler = StandardScaler()
train_X_scaled = scaler.fit_transform(train_X)
test_X_scaled = scaler.transform(test_X)

logit = LogisticRegressionCV(
    penalty="l1", Cs=10, solver="liblinear",
    cv=5, random_state=1, n_jobs=-1
)
logit.fit(train_X_scaled, train_y)

logit_pred = logit.predict(test_X_scaled)
logit_probabilities = logit.predict_proba(test_X_scaled)[:, 1]
print("Selected C:", logit.C_[0])
print(classification_report(test_y, logit_pred, target_names=["No Disease", "Disease"]))

param_grid = {
    "max_depth": [5, 10, 20, 30],
    "min_samples_split": [20, 40, 60, 80, 100],
    "min_impurity_decrease": [0, 0.0005, 0.001, 0.005, 0.01],
}
tree_search = GridSearchCV(
    DecisionTreeClassifier(criterion="gini", random_state=1),
    param_grid, cv=3, scoring="roc_auc", n_jobs=-1, verbose=1
)
tree_search.fit(train_X, train_y)
tree_model = tree_search.best_estimator_
print("Best CV ROC AUC:", round(tree_search.best_score_, 4))
print("Best parameters:", tree_search.best_params_)

tree_pred = tree_model.predict(test_X)
tree_probabilities = tree_model.predict_proba(test_X)[:, 1]
print(classification_report(test_y, tree_pred, target_names=["No Disease", "Disease"]))

plt.figure(figsize=(18, 8))
plot_tree(tree_model, feature_names=train_X.columns,
          class_names=["No Disease", "Disease"], filled=True,
          max_depth=4, fontsize=8)
plt.title("Decision Tree (First Four Levels)")
plt.tight_layout()
plt.show()

rf = RandomForestClassifier(
    n_estimators=500,
    min_samples_split=10,
    class_weight="balanced",
    random_state=1,
    n_jobs=-1
)
rf.fit(train_X, train_y)
rf_pred = rf.predict(test_X)
rf_probabilities = rf.predict_proba(test_X)[:, 1]
print(classification_report(test_y, rf_pred, target_names=["No Disease", "Disease"]))
print("Random Forest ROC-AUC:", round(roc_auc_score(test_y, rf_probabilities), 4))

from sklearn.metrics import brier_score_loss
import joblib
import json

print("Random Forest Brier score:", round(brier_score_loss(test_y, rf_probabilities), 4))

# Export model and the exact one-hot encoded feature schema for app inference.
joblib.dump(rf, "cardiovascular_rf_model.joblib")
with open("cardiovascular_rf_metadata.json", "w", encoding="utf-8") as f:
    json.dump({
        "raw_features": features_reduced,
        "categorical_features": categorical_features,
        "encoded_feature_columns": feature_columns,
        "target": "cardio",
        "target_meaning": "recorded cardiovascular disease status (0/1)",
        "model": "RandomForestClassifier",
        "parameters": {
            "n_estimators": 500,
            "min_samples_split": 10,
            "class_weight": "balanced",
            "random_state": 1
        }
    }, f, indent=2)
print("Exported cardiovascular_rf_model.joblib and cardiovascular_rf_metadata.json")

boost = GradientBoostingClassifier(
    n_estimators=500, learning_rate=0.5, random_state=1
)
boost.fit(train_X, train_y)
gb_pred = boost.predict(test_X)
gb_probabilities = boost.predict_proba(test_X)[:, 1]
print(classification_report(test_y, gb_pred, target_names=["No Disease", "Disease"]))

xgb = XGBClassifier(
    n_estimators=300, learning_rate=0.05, max_depth=10,
    random_state=1, eval_metric="logloss"
)
xgb.fit(train_X, train_y)
xgb_pred = xgb.predict(test_X)
xgb_probabilities = xgb.predict_proba(test_X)[:, 1]
print(classification_report(test_y, xgb_pred, target_names=["No Disease", "Disease"]))

model_predictions = {
    "Logistic Regression": (logit_pred, logit_probabilities),
    "Decision Tree": (tree_pred, tree_probabilities),
    "Random Forest": (rf_pred, rf_probabilities),
    "Gradient Boosting": (gb_pred, gb_probabilities),
    "XGBoost": (xgb_pred, xgb_probabilities),
}

rows = []
for name, (pred, prob) in model_predictions.items():
    rows.append({
        "Model": name,
        "Accuracy": accuracy_score(test_y, pred),
        "Precision": precision_score(test_y, pred, zero_division=0),
        "Recall": recall_score(test_y, pred, zero_division=0),
        "F1 Score": f1_score(test_y, pred, zero_division=0),
        "ROC-AUC": roc_auc_score(test_y, prob),
    })

model_results = pd.DataFrame(rows).sort_values("ROC-AUC", ascending=False)
display(model_results.style.format({
    "Accuracy": "{:.2%}", "Precision": "{:.2%}", "Recall": "{:.2%}",
    "F1 Score": "{:.2%}", "ROC-AUC": "{:.4f}"
}))

# ROC curves: every model uses the probability of class 1
plt.figure(figsize=(8, 6))
for name, (_, prob) in model_predictions.items():
    fpr, tpr, _ = roc_curve(test_y, prob)
    auc = roc_auc_score(test_y, prob)
    plt.plot(fpr, tpr, label=f"{name} (AUC = {auc:.3f})")
plt.plot([0, 1], [0, 1], linestyle="--", color="gray", label="Random classifier")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ROC Curve Comparison")
plt.legend(loc="lower right")
plt.tight_layout()
plt.show()

# Confusion matrices for all models
fig, axes = plt.subplots(2, 3, figsize=(12, 8))
for ax, (name, (pred, _)) in zip(axes.flat, model_predictions.items()):
    ConfusionMatrixDisplay.from_predictions(
        test_y, pred, display_labels=["No Disease", "Disease"],
        cmap="Blues", colorbar=False, ax=ax
    )
    ax.set_title(name)
for ax in axes.flat[len(model_predictions):]:
    ax.axis("off")
plt.tight_layout()
plt.show()

xgb_importance = pd.DataFrame({
    "Feature": train_X.columns,
    "Importance": xgb.feature_importances_
}).sort_values("Importance", ascending=False)

display(xgb_importance.head(15))

top_importance = xgb_importance.head(15).sort_values("Importance")
plt.figure(figsize=(8, 6))
plt.barh(top_importance["Feature"], top_importance["Importance"])
plt.title("Top 15 XGBoost Feature Importances")
plt.xlabel("Importance")
plt.ylabel("Feature")
plt.tight_layout()
plt.show()
