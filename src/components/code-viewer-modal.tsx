import { useState, useMemo, useEffect } from "react";
import { X, Copy, Check, FileCode } from "lucide-react";

interface PythonCodeFile {
  filename: string;
  projectName: string;
  description: string;
  code: string;
}

const pythonCodeByProject: Record<string, PythonCodeFile> = {
  "retail-sales-intelligence": {
    filename: "retail_sales_analysis.py",
    projectName: "Retail Sales Intelligence & Customer Analytics",
    description: "Python workflow for data preparation, feature engineering, sales analysis, product performance, and customer analytics",
    code: `"""
Retail Sales Intelligence & Customer Analytics
Dataset: UCI Online Retail (ID 352)
Author: Ahmed Billoo
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from ucimlrepo import fetch_ucirepo

# 1. Load the public UCI dataset
online_retail = fetch_ucirepo(id=352)
df = online_retail.data.features.copy()

# 2. Inspect data quality before making cleaning decisions
print(df.shape)
print(df.info())
print(df.isnull().sum())
print("Duplicate rows:", df.duplicated().sum())

# 3. Convert the transaction timestamp to datetime
df["InvoiceDate"] = pd.to_datetime(df["InvoiceDate"])

# 4. Create transaction revenue
df["Revenue"] = df["Quantity"] * df["UnitPrice"]

# 5. Define valid sales for the core sales analysis
# Negative quantities represent returns/adjustments and are excluded from
# completed-sales reporting while remaining available in the source data.
sales = df[(df["Quantity"] > 0) & (df["UnitPrice"] > 0)].copy()

# 6. Executive KPIs
number_of_orders = sales["InvoiceDate"].groupby(sales["InvoiceDate"].dt.to_period("D")).ngroups
summary = {
    "revenue": sales["Revenue"].sum(),
    "customers": sales["CustomerID"].nunique(),
    "units": sales["Quantity"].sum(),
}
print(summary)

# 7. Monthly revenue trend
monthly_revenue = (
    sales.set_index("InvoiceDate")
         .resample("ME")["Revenue"]
         .sum()
)

monthly_revenue.plot(figsize=(10, 5), title="Monthly Revenue")
plt.xlabel("Month")
plt.ylabel("Revenue")
plt.tight_layout()
plt.show()

# 8. Top products by revenue
top_products = (
    sales.groupby("Description")["Revenue"]
         .sum()
         .sort_values(ascending=False)
         .head(10)
)

sns.barplot(x=top_products.values, y=top_products.index)
plt.title("Top 10 Products by Revenue")
plt.xlabel("Revenue")
plt.ylabel("Product")
plt.tight_layout()
plt.show()

# 9. Build a customer-level analytical table
customer_analysis = (
    sales.dropna(subset=["CustomerID"])
         .groupby("CustomerID")
         .agg(
             TotalRevenue=("Revenue", "sum"),
             Orders=("InvoiceDate", "nunique"),
             UnitsPurchased=("Quantity", "sum"),
             FirstPurchase=("InvoiceDate", "min"),
             LastPurchase=("InvoiceDate", "max")
         )
)

customer_analysis["AverageOrderValue"] = (
    customer_analysis["TotalRevenue"] / customer_analysis["Orders"]
)

# 10. Highest-value customers
print(customer_analysis.sort_values("TotalRevenue", ascending=False).head(10))

# 11. Revenue by country
country_revenue = (
    sales.groupby("Country")["Revenue"]
         .sum()
         .sort_values(ascending=False)
)
print(country_revenue.head(10))

# 12. Customer revenue concentration
customer_sorted = customer_analysis["TotalRevenue"].sort_values(ascending=False)
top_10_share = customer_sorted.head(10).sum() / customer_sorted.sum()
print(f"Top 10 customer revenue share: {top_10_share:.2%}")
`,
  },

  "business-intelligence-forecasting": {
    filename: "sarimax_demand_forecasting.py",
    projectName: "Business Intelligence & Demand Forecasting",
    description: "SARIMAX Time-Series Demand Forecasting Pipeline with Exogenous Variables",
    code: `"""
SARIMAX Time-Series Demand Forecasting Pipeline
Project: Pharmaceutical Supply Chain BI & Demand Forecasting Platform
Author: Ahmed Billoo
"""

import logging
from typing import Dict, Any, Optional, Tuple
import numpy as np
import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.metrics import mean_absolute_percentage_error, mean_squared_error

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def train_and_forecast_sku(
    ts_data: pd.Series,
    exog_data: Optional[pd.DataFrame] = None,
    forecast_periods: int = 90,
    order: Tuple[int, int, int] = (1, 1, 2),
    seasonal_order: Tuple[int, int, int, int] = (1, 1, 1, 7),
    confidence_level: float = 0.95
) -> Dict[str, Any]:
    split_idx = int(len(ts_data) * 0.8)
    train, test = ts_data.iloc[:split_idx], ts_data.iloc[split_idx:]
    exog_train = exog_data.iloc[:split_idx] if exog_data is not None else None
    exog_test = exog_data.iloc[split_idx:] if exog_data is not None else None

    val_model = SARIMAX(
        train, exog=exog_train, order=order, seasonal_order=seasonal_order,
        enforce_stationarity=False, enforce_invertibility=False
    )
    val_fitted = val_model.fit(disp=False, maxiter=200)
    test_pred = np.maximum(val_fitted.forecast(steps=len(test), exog=exog_test), 0)

    mape = mean_absolute_percentage_error(test, test_pred)
    rmse = np.sqrt(mean_squared_error(test, test_pred))

    full_model = SARIMAX(
        ts_data, exog=exog_data, order=order, seasonal_order=seasonal_order,
        enforce_stationarity=False, enforce_invertibility=False
    )
    full_fitted = full_model.fit(disp=False, maxiter=250)
    forecast_res = full_fitted.get_forecast(steps=forecast_periods)
    pred_mean = np.maximum(forecast_res.predicted_mean, 0)
    conf_int = forecast_res.conf_int(alpha=1 - confidence_level)

    return {
        "metrics": {
            "test_mape_pct": round(float(mape) * 100, 2),
            "test_rmse": round(float(rmse), 2),
            "aic": round(float(full_fitted.aic), 2),
            "bic": round(float(full_fitted.bic), 2)
        },
        "forecast": pd.DataFrame({
            "forecast_units": np.round(pred_mean, 1),
            "ci_lower": np.round(np.maximum(conf_int.iloc[:, 0], 0), 1),
            "ci_upper": np.round(conf_int.iloc[:, 1], 1)
        })
    }`,
  },

  "customer-churn-prediction": {
    filename: "customer_churn_prediction.py",
    projectName: "Customer Churn Prediction & Retention Analytics",
    description: "Python workflow for subscriber churn analysis, feature preparation, classification model comparison, and Random Forest feature importance",
    code: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, classification_report,
    ConfusionMatrixDisplay
)
from dmba import classificationSummary
import kagglehub

kagglehub.login()
path = kagglehub.competition_download(
    "streaming-subscription-churn-model"
)

DATA = Path(path)
data = pd.read_csv(DATA / "train.csv")

print("Train:", data.shape)
data.head()

# ════════════════════════════════════════════════════════════

data.info()

data.isna().sum()
data.describe(include="all").T

print("Duplicate rows:", data.duplicated().sum())
print(
    "Duplicate customer IDs:",
    data["customer_id"].duplicated().sum()
)

data["churned"].value_counts()
data["churned"].value_counts(normalize=True) * 100

churn_counts = data["churned"].value_counts().sort_index()
ax = churn_counts.plot(kind="bar", figsize=(7, 5))
ax.set_title("Subscriber Churn Distribution")
ax.set_xlabel("Churned")
ax.set_ylabel("Subscribers")
ax.set_xticklabels(["Active", "Churned"], rotation=0)
plt.tight_layout()
plt.show()

# ════════════════════════════════════════════════════════════

data["TenureDays"] = -data["signup_date"]
data["SongsPerHour"] = (
    data["weekly_songs_played"] /
    data["weekly_hours"].replace(0, np.nan)
)

numeric_analysis = [
    "TenureDays", "weekly_hours", "average_session_length",
    "song_skip_rate", "weekly_songs_played",
    "weekly_unique_songs", "num_subscription_pauses"
]

summary = data.groupby("churned")[numeric_analysis].mean().T
summary.columns = ["Active", "Churned"]
summary

fig, axes = plt.subplots(1, 2, figsize=(12, 5))
data.boxplot(column="weekly_hours", by="churned", ax=axes[0])
axes[0].set_title("Weekly Listening Hours by Churn")
axes[0].set_xlabel("Churned")
axes[0].set_ylabel("Weekly Hours")

data.boxplot(column="song_skip_rate", by="churned", ax=axes[1])
axes[1].set_title("Song Skip Rate by Churn")
axes[1].set_xlabel("Churned")
axes[1].set_ylabel("Skip Rate")

plt.suptitle("")
plt.tight_layout()
plt.show()

subscription_churn = pd.crosstab(
    data["subscription_type"], data["churned"], normalize="index"
) * 100
subscription_churn.columns = ["Active %", "Churned %"]
subscription_churn.sort_values("Churned %", ascending=False)

plan_churn = pd.crosstab(
    data["payment_plan"], data["churned"], normalize="index"
) * 100
plan_churn.columns = ["Active %", "Churned %"]
plan_churn

inquiry_churn = pd.crosstab(
    data["customer_service_inquiries"], data["churned"], normalize="index"
).mul(100)
inquiry_churn.columns = ["Active %", "Churned %"]
inquiry_churn.sort_values("Churned %", ascending=False)

categorical_features = data.select_dtypes(include="object").columns.tolist()
numeric_features = data.select_dtypes(exclude="object").columns.tolist()

corr = data[numeric_features].corr()
plt.figure(figsize=(12, 8))
sns.heatmap(corr, cmap="coolwarm", center=0)
plt.title("Feature Correlation Matrix")
plt.show()

# ════════════════════════════════════════════════════════════

features = [
    "age", "location", "subscription_type", "payment_plan",
    "num_subscription_pauses", "payment_method",
    "customer_service_inquiries", "weekly_hours",
    "average_session_length", "song_skip_rate",
    "weekly_songs_played", "weekly_unique_songs",
    "num_favorite_artists", "num_platform_friends",
    "num_playlists_created", "num_shared_playlists",
    "notifications_clicked", "TenureDays", "SongsPerHour"
]

X = data[features]
y = data["churned"]

X = pd.get_dummies(
    X, columns=categorical_features, drop_first=True, dtype=int
)

train_X, test_X, train_y, test_y = train_test_split(
    X, y, test_size=0.20, random_state=1, stratify=y
)

param_grid = {
    "max_depth": [5, 10, 20, 30],
    "min_samples_split": [20, 40, 60, 80, 100],
    "min_impurity_decrease": [0, 0.0005, 0.001, 0.005, 0.01],
}

gridSearch = GridSearchCV(
    DecisionTreeClassifier(criterion="gini"),
    param_grid, cv=3, n_jobs=-1, verbose=3
)
gridSearch.fit(train_X, train_y)

bestClassTree = gridSearch.best_estimator_

tree_importance = pd.DataFrame({
    "Feature": train_X.columns,
    "Importance": bestClassTree.feature_importances_
}).sort_values("Importance", ascending=False)

tree_importance

# ════════════════════════════════════════════════════════════

features_final = [
    "age",
    "subscription_type",
    "num_subscription_pauses",
    "customer_service_inquiries",
    "weekly_hours",
    "song_skip_rate",
    "weekly_unique_songs",
    "notifications_clicked",
    "TenureDays",
]

categorical_features = data[features_final].select_dtypes(
    include="object"
).columns.tolist()

X = data[features_final]
X = pd.get_dummies(
    X,
    columns=categorical_features,
    drop_first=False,
    dtype=int
)

y = data["churned"]

train_X, test_X, train_y, test_y = train_test_split(
    X, y,
    test_size=0.20,
    random_state=1,
    stratify=y
)

# ════════════════════════════════════════════════════════════

param_grid = {
    "max_depth": [5, 10, 20, 30],
    "min_samples_split": [20, 40, 60, 80, 100],
    "min_impurity_decrease": [0, 0.0005, 0.001, 0.005, 0.01],
}

gridSearch = GridSearchCV(
    DecisionTreeClassifier(criterion="gini"),
    param_grid,
    cv=3,
    n_jobs=-1,
    verbose=3
)

gridSearch.fit(train_X, train_y)
print("Initial score:", gridSearch.best_score_)
print("Initial parameters:", gridSearch.best_params_)

bestClassTree = gridSearch.best_estimator_
predictions = gridSearch.predict(test_X)
probabilities = gridSearch.predict_proba(test_X)[:, 1]

classificationSummary(train_y, gridSearch.predict(train_X))
classificationSummary(test_y, gridSearch.predict(test_X))

print("Accuracy:", accuracy_score(test_y, predictions))
print("Precision:", precision_score(test_y, predictions))
print("Recall:", recall_score(test_y, predictions))
print("F1 Score:", f1_score(test_y, predictions))
print("ROC-AUC:", roc_auc_score(test_y, probabilities))

print(classification_report(
    test_y, predictions,
    target_names=["Active", "Churned"]
))

ConfusionMatrixDisplay.from_predictions(
    test_y, predictions,
    display_labels=["Active", "Churned"]
)
plt.title("Decision Tree Confusion Matrix")
plt.show()

# ════════════════════════════════════════════════════════════

rf = RandomForestClassifier(
    n_estimators=300,
    random_state=1,
    n_jobs=-1
)
rf.fit(train_X, train_y)

classificationSummary(train_y, rf.predict(train_X))
classificationSummary(test_y, rf.predict(test_X))

rf_predictions = rf.predict(test_X)
rf_probabilities = rf.predict_proba(test_X)[:, 1]

print("Random Forest Results")
print("---------------------")
print("Accuracy:", accuracy_score(test_y, rf_predictions))
print("Precision:", precision_score(test_y, rf_predictions))
print("Recall:", recall_score(test_y, rf_predictions))
print("F1 Score:", f1_score(test_y, rf_predictions))
print("ROC-AUC:", roc_auc_score(test_y, rf_probabilities))

print(classification_report(
    test_y, rf_predictions,
    target_names=["Active", "Churned"]
))

rf_importance = pd.DataFrame({
    "Feature": train_X.columns,
    "Importance": rf.feature_importances_
}).sort_values("Importance", ascending=False)

rf_importance

# ════════════════════════════════════════════════════════════

boost = GradientBoostingClassifier(
    n_estimators=300,
    learning_rate=0.05,
    random_state=1
)

boost.fit(train_X, train_y)

classificationSummary(train_y, boost.predict(train_X))
classificationSummary(test_y, boost.predict(test_X))

gb_predictions = boost.predict(test_X)
gb_probabilities = boost.predict_proba(test_X)[:, 1]

print("Gradient Boosting Results")
print("-------------------------")
print("Accuracy:", accuracy_score(test_y, gb_predictions))
print("Precision:", precision_score(test_y, gb_predictions))
print("Recall:", recall_score(test_y, gb_predictions))
print("F1 Score:", f1_score(test_y, gb_predictions))
print("ROC-AUC:", roc_auc_score(test_y, gb_probabilities))

print(classification_report(
    test_y, gb_predictions,
    target_names=["Active", "Churned"]
))

ConfusionMatrixDisplay.from_predictions(
    test_y, gb_predictions,
    display_labels=["Active", "Churned"]
)
plt.title("Gradient Boosting Confusion Matrix")
plt.show()

gb_importance = pd.DataFrame({
    "Feature": train_X.columns,
    "Importance": boost.feature_importances_
}).sort_values("Importance", ascending=False)

gb_importance

# ════════════════════════════════════════════════════════════

model_results = pd.DataFrame({
    "Model": [
        "Decision Tree",
        "Random Forest",
        "Gradient Boosting"
    ],
    "Accuracy": [
        accuracy_score(test_y, predictions),
        accuracy_score(test_y, rf_predictions),
        accuracy_score(test_y, gb_predictions)
    ],
    "Precision": [
        precision_score(test_y, predictions),
        precision_score(test_y, rf_predictions),
        precision_score(test_y, gb_predictions)
    ],
    "Recall": [
        recall_score(test_y, predictions),
        recall_score(test_y, rf_predictions),
        recall_score(test_y, gb_predictions)
    ],
    "F1 Score": [
        f1_score(test_y, predictions),
        f1_score(test_y, rf_predictions),
        f1_score(test_y, gb_predictions)
    ],
    "ROC-AUC": [
        roc_auc_score(test_y, probabilities),
        roc_auc_score(test_y, rf_probabilities),
        roc_auc_score(test_y, gb_probabilities)
    ]
})

model_results.sort_values(
    "ROC-AUC",
    ascending=False
)`,
  },

  "loan-default-prediction": {
    filename: "credit_risk_pipeline.py",
    projectName: "Loan Default Prediction & Credit Risk Scoring",
    description: "Scikit-Learn ML Pipeline with SMOTE Oversampling and Random Forest Classifier",
    code: `"""
Machine Learning Credit Risk & Loan Default Prediction Pipeline
Project: Credit Risk Scoring
Author: Ahmed Billoo
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline

def build_and_evaluate_credit_pipeline(csv_path: str):
    df = pd.read_csv(csv_path)

    df['revolving_to_income_ratio'] = df['revol_bal'] / (df['annual_inc'] + 1e-5)
    df['inquiry_density'] = df['inq_last_6mths'] / (df['open_acc'] + 1)
    df['monthly_income'] = df['annual_inc'] / 12.0
    df['installment_burden'] = df['installment'] / (df['monthly_income'] + 1e-5)

    feature_cols = [
        'fico_score', 'dti', 'annual_inc', 'loan_amnt', 'int_rate',
        'revol_util', 'total_acc', 'revolving_to_income_ratio',
        'inquiry_density', 'installment_burden'
    ]

    X = df[feature_cols]
    y = df['is_default']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    pipeline = ImbPipeline([
        ('scaler', StandardScaler()),
        ('smote', SMOTE(sampling_strategy=0.5, random_state=42)),
        ('classifier', RandomForestClassifier(
            n_estimators=300, max_depth=12, min_samples_split=8,
            min_samples_leaf=4, class_weight='balanced_subsample',
            random_state=42, n_jobs=-1
        ))
    ])

    pipeline.fit(X_train, y_train)
    y_pred_proba = pipeline.predict_proba(X_test)[:, 1]
    y_pred = (y_pred_proba >= 0.38).astype(int)

    return {
        "roc_auc": roc_auc_score(y_test, y_pred_proba),
        "report": classification_report(y_test, y_pred, output_dict=True),
        "confusion_matrix": confusion_matrix(y_test, y_pred),
        "pipeline": pipeline
    }`,
  },

  "cardiovascular-risk-prediction": {
    filename: "cardio_model_training.py",
    projectName: "Cardiovascular Disease Risk Prediction",
    description: "Clinical Biometric Risk Modeling with Hemodynamic Biomarkers and Recall Calibration",
    code: `"""
Cardiovascular Disease Risk Modeling
Dataset: 70,000 Patient Records
Author: Ahmed Billoo
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import RobustScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score, recall_score, precision_score, f1_score

def train_cardiovascular_models(df: pd.DataFrame):
    df = df[(df['ap_hi'] >= 80) & (df['ap_hi'] <= 220)].copy()
    df = df[(df['ap_lo'] >= 50) & (df['ap_lo'] <= 140)].copy()
    df = df[df['ap_hi'] > df['ap_lo']].copy()

    df['age_years'] = df['age'] / 365.25
    df['bmi'] = df['weight'] / ((df['height'] / 100.0) ** 2)
    df['map'] = df['ap_lo'] + (df['ap_hi'] - df['ap_lo']) / 3.0
    df['pulse_pressure'] = df['ap_hi'] - df['ap_lo']

    features = [
        'age_years', 'gender', 'ap_hi', 'ap_lo', 'map', 'pulse_pressure',
        'bmi', 'cholesterol', 'gluc', 'smoke', 'alco', 'active'
    ]

    X = df[features]
    y = df['cardio']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    scaler = RobustScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = RandomForestClassifier(
        n_estimators=250, max_depth=10, min_samples_leaf=4,
        random_state=42, n_jobs=-1
    )
    model.fit(X_train_scaled, y_train)

    probabilities = model.predict_proba(X_test_scaled)[:, 1]
    predictions = (probabilities >= 0.42).astype(int)

    return {
        "roc_auc": roc_auc_score(y_test, probabilities),
        "recall": recall_score(y_test, predictions),
        "precision": precision_score(y_test, predictions),
        "f1": f1_score(y_test, predictions),
        "model": model,
        "scaler": scaler
    }`,
  },
};

interface CodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSlug?: string;
}

export function CodeViewerModal({
  isOpen,
  onClose,
  initialSlug = "business-intelligence-forecasting",
}: CodeViewerModalProps) {
  const [copied, setCopied] = useState(false);

  const fileData = useMemo(() => {
    return pythonCodeByProject[initialSlug] || pythonCodeByProject["business-intelligence-forecasting"];
  }, [initialSlug]);

  const lines = useMemo(() => fileData.code.split("\n"), [fileData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fileData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="code-viewer-title" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 flex h-[88vh] max-h-[820px] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-zinc-700/70 bg-[#0d1117] text-[#c9d1d9] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex h-13 shrink-0 items-center justify-between border-b border-[#30363d] bg-[#161b22] px-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <FileCode className="size-4.5 shrink-0 text-[#e3b341]" />
            <span id="code-viewer-title" className="truncate font-mono text-sm font-semibold text-[#f0f6fc]">{fileData.filename}</span>
            <span className="hidden rounded border border-[#238636]/40 bg-[#238636]/20 px-2 py-0.5 text-[11px] font-medium text-[#7ee787] sm:inline-block">Python</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={handleCopy} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${copied ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-400" : "bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]"}`}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button type="button" onClick={onClose} aria-label="Close code viewer" className="rounded-md p-1.5 text-[#8b949e] transition-colors hover:bg-[#21262d] hover:text-[#f0f6fc]"><X className="size-4.5" /></button>
          </div>
        </div>
        <div className="flex items-center justify-between border-b border-[#30363d] bg-[#0d1117] px-4 py-2 sm:px-5">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-[#f0f6fc]">{fileData.projectName}</p>
            <p className="mt-0.5 truncate text-[11px] text-[#8b949e]">{fileData.description}</p>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-[#0d1117] p-4 sm:p-5">
          <pre className="min-w-max font-mono text-[12px] leading-5 sm:text-[13px]">{lines.map((line, index) => (
            <div key={index} className="flex">
              <span className="mr-4 inline-block w-8 select-none text-right text-[#484f58]">{index + 1}</span>
              <code className="text-[#c9d1d9]">{line || " "}</code>
            </div>
          ))}</pre>
        </div>
      </div>
    </div>
  );
}
