import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Code2, Target, Users } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { CodeBlock } from "@/components/code-block";

const sourceUrl = "https://www.kaggle.com/competitions/streaming-subscription-churn-model/data";

const modelResults = [
  { model: "Decision Tree", short: "Tree", color: "#60a5fa", accuracy: 84.176, precision: 84.784, recall: 84.309, f1: 84.546, auc: 93.237 },
  { model: "Random Forest", short: "RF", color: "#a78bfa", accuracy: 84.456, precision: 84.743, recall: 85.033, f1: 84.888, auc: 93.581 },
  { model: "Gradient Boosting", short: "GB", color: "#34d399", accuracy: 84.616, precision: 85.816, recall: 83.903, f1: 84.849, auc: 94.029 },
] as const;

const churnDistribution = [["Active", 60826], ["Churned", 64174]] as const;
const subscriptionChurn = [["Free", 79.41], ["Student", 57.39], ["Family", 34.58], ["Premium", 33.91]] as const;
const inquiryChurn = [["High", 74.33], ["Medium", 50.92], ["Low", 28.92]] as const;
const behaviorComparison = [
  ["Weekly hours", 29.525461, 20.782675, "hours"],
  ["Song skip rate", 0.453300, 0.545826, "rate"],
  ["Subscription pauses", 1.724723, 2.243666, "pauses"],
  ["Unique songs", 149.077566, 152.400131, "songs"],
] as const;
const featureImportance = [
  ["weekly_hours", 23.6042],
  ["subscription_type_Free", 20.4905],
  ["customer_service_inquiries_Low", 18.1286],
  ["num_subscription_pauses", 8.8381],
  ["song_skip_rate", 7.4210],
  ["age", 7.3369],
  ["customer_service_inquiries_Medium", 6.2924],
  ["subscription_type_Student", 5.8017],
  ["notifications_clicked", 1.3831],
  ["weekly_unique_songs", 0.6492],
  ["subscription_type_Premium", 0.0491],
  ["TenureDays", 0.0052],
] as const;

const codeSnippets = [
  {
    title: "01 · Setup & Data Loading",
    description: "Import the analysis libraries, authenticate with Kaggle, download the competition data, and load the labeled training set.",
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
data.head()`
  },
  {
    title: "02 · Data Quality",
    description: "Inspect the dataset structure, missing values, duplicates, descriptive statistics, and the target distribution.",
    code: `data.info()

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
plt.show()`
  },
  {
    title: "03 · Exploratory Analysis",
    description: "Create derived variables, compare numeric behavior by churn status, and calculate churn rates for subscription and service segments.",
    code: `data["TenureDays"] = -data["signup_date"]
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
plt.show()`
  },
  {
    title: "04 · Initial Feature Review",
    description: "Start with the full candidate feature set, encode the categorical variables, fit a tuned Decision Tree, and inspect feature importance before reducing the original variables.",
    code: `features = [
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

tree_importance`
  },
  {
    title: "05 · Final Feature Set",
    description: "Reduce the original variables based on the initial feature review, then rebuild the encoded dataset and stratified train-test split.",
    code: `features_final = [
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
    drop_first=True,
    dtype=int
)

y = data["churned"]

train_X, test_X, train_y, test_y = train_test_split(
    X, y,
    test_size=0.20,
    random_state=1,
    stratify=y
)`
  },
  {
    title: "06 · Decision Tree",
    description: "Tune the final Decision Tree with three-fold cross-validation using accuracy as the scoring measure, then evaluate it on the held-out test set.",
    code: `param_grid = {
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
plt.show()`
  },
  {
    title: "07 · Random Forest",
    description: "Fit the 500-tree Random Forest on the same training split and evaluate its predictions, probabilities, and feature importance.",
    code: `rf = RandomForestClassifier(
    n_estimators=500,
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

rf_importance`
  },
  {
    title: "08 · Gradient Boosting",
    description: "Fit Gradient Boosting with 300 estimators and a 0.05 learning rate, then evaluate predictions, probabilities, and feature importance.",
    code: `boost = GradientBoostingClassifier(
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

gb_importance`
  },
  {
    title: "09 · Model Comparison",
    description: "Build the final comparison table from the same held-out test set using accuracy, precision, recall, F1, and ROC-AUC.",
    code: `model_results = pd.DataFrame({
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
)`
  },
] as const;

function BarList({ data, colors = ["#60a5fa"] }: { data: readonly (readonly [string, number])[]; colors?: readonly string[] }) {
  const max = Math.max(...data.map((x) => x[1]));
  return (
    <div className="space-y-4">
      {data.map(([label, value], index) => (
        <div key={label}>
          <div className="mb-1 flex justify-between gap-3 text-xs">
            <span className="font-medium">{index + 1}. {label}</span>
            <span className="font-semibold" style={{ color: colors[index % colors.length] }}>{value.toFixed(2)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, backgroundColor: colors[index % colors.length] }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChurnDistributionChart() {
  const max = Math.max(...churnDistribution.map((x) => x[1]));
  return (
    <div className="space-y-5">
      {churnDistribution.map(([label, value], index) => (
        <div key={label}>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold">{label}</span>
            <span className="font-bold text-foreground">{value.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">({((value / 125000) * 100).toFixed(2)}%)</span></span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, backgroundColor: index === 0 ? "#60a5fa" : "#f87171" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function BehaviorChart() {
  const colors = ["#60a5fa", "#f87171"];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-end gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ backgroundColor: colors[0] }} /> Active</span>
        <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ backgroundColor: colors[1] }} /> Churned</span>
      </div>
      {behaviorComparison.map(([label, active, churned, unit]) => {
        const max = Math.max(active, churned);
        const format = (value: number) => unit === "rate" ? `${(value * 100).toFixed(1)}%` : value.toFixed(1);
        return (
          <div key={label}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <span className="text-xs font-semibold">{label}</span>
              <span className="text-[11px] text-muted-foreground">Active {format(active)} · Churned {format(churned)}</span>
            </div>
            <div className="grid grid-cols-[64px_1fr] items-center gap-3">
              <span className="text-[10px] text-muted-foreground">Active</span>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${(active / max) * 100}%`, backgroundColor: colors[0] }} /></div>
              <span className="text-[10px] text-muted-foreground">Churned</span>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${(churned / max) * 100}%`, backgroundColor: colors[1] }} /></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ModelComparisonChart() {
  const metrics = ["Accuracy", "Precision", "Recall", "F1", "ROC-AUC"] as const;
  const values = (model: (typeof modelResults)[number]) => [model.accuracy, model.precision, model.recall, model.f1, model.auc];
  const width = 920, height = 380, left = 64, right = 24, top = 52, bottom = 70, min = 80, max = 96;
  const plotW = width - left - right, plotH = height - top - bottom, groupW = plotW / metrics.length, barW = 22, gap = 8;
  const y = (v: number) => height - bottom - ((v - min) / (max - min)) * plotH;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label="Model performance comparison">
      {[80, 84, 88, 92, 96].map((tick) => (
        <g key={tick}>
          <line x1={left} y1={y(tick)} x2={width - right} y2={y(tick)} stroke="currentColor" opacity=".1" />
          <text x={left - 9} y={y(tick) + 4} textAnchor="end" fontSize="12" fill="currentColor" opacity=".65">{tick}%</text>
        </g>
      ))}
      <line x1={left} y1={top} x2={left} y2={height - bottom} stroke="currentColor" opacity=".2" />
      <line x1={left} y1={height - bottom} x2={width - right} y2={height - bottom} stroke="currentColor" opacity=".2" />
      {metrics.map((metric, metricIndex) => {
        const center = left + (metricIndex + 0.5) * groupW;
        return (
          <g key={metric}>
            {modelResults.map((model, modelIndex) => {
              const value = values(model)[metricIndex];
              const x = center + (modelIndex - 1) * (barW + gap) - barW / 2;
              const barHeight = ((value - min) / (max - min)) * plotH;
              return (
                <g key={model.model}>
                  <rect x={x} y={height - bottom - barHeight} width={barW} height={barHeight} rx="3" fill={model.color} opacity="0.9" />
                  <text x={x + barW / 2} y={height - bottom - barHeight - 7} textAnchor="middle" fontSize="10" fontWeight="600" fill="currentColor" opacity=".78">{value.toFixed(1)}</text>
                </g>
              );
            })}
            <text x={center} y={height - bottom + 20} textAnchor="middle" fontSize="11" fill="currentColor" opacity=".7">{metric}</text>
          </g>
        );
      })}
      <text x="22" y={(top + height - bottom) / 2} textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor" opacity=".7" transform={`rotate(-90 22 ${(top + height - bottom) / 2})`}>Score</text>
      <g transform="translate(600, 12)">
        {modelResults.map((model, index) => (
          <g key={model.model} transform={`translate(${index * 105}, 0)`}>
            <rect width="12" height="12" rx="2" fill={model.color} />
            <text x="18" y="10" fontSize="11" fill="currentColor" opacity=".78">{model.short}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

export function CustomerChurnPrediction() {
  const [activeCode, setActiveCode] = useState(0);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      <SiteNav />
      <main className="pb-20">
        <header className="border-b border-border bg-surface/60">
          <div className="container-page py-10 sm:py-14">
            <Link to="/" hash="projects" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> Back to all projects
            </Link>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">Machine Learning</span>
              <span>•</span><span>Streaming Subscription Churn Model</span><span>•</span><span>Python &amp; Scikit-learn</span>
            </div>
            <h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight sm:text-5xl">Customer Churn Prediction &amp; Retention Analytics</h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">Predicting which subscribers are most likely to churn and identifying the behaviors associated with that risk.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Python", "Pandas", "Scikit-learn", "Decision Tree", "Random Forest", "Gradient Boosting"].map((tool) => <span key={tool} className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">{tool}</span>)}
            </div>
          </div>
        </header>

        <div className="container-page mt-12 space-y-16">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Subscribers analyzed", "125,000", "Rows in the training dataset"],
              ["Churned subscribers", "64,174", "51.34% of the training data"],
              ["Final predictors", "9", "Selected before dummy encoding"],
              ["Best ROC-AUC", "0.940", "Gradient Boosting on the test set"],
            ].map(([label, value, detail]) => (
              <div key={label} className="card-surface p-5">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <p className="mt-2 text-3xl font-extrabold tracking-tight">{value}</p>
                <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">{detail}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-8 lg:grid-cols-2">
            <div className="card-surface p-7">
              <div className="flex items-center gap-2 text-primary"><Target className="size-5" /><h2 className="text-lg font-bold">Business Question</h2></div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Which subscribers are most likely to churn, and which customer behaviors provide useful signals of that risk? The analysis compares subscriber behavior and builds classification models that can be used to prioritize retention activity.</p>
            </div>
            <div className="card-surface p-7">
              <div className="flex items-center gap-2 text-primary"><Users className="size-5" /><h2 className="text-lg font-bold">Dataset &amp; Target</h2></div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">The project uses 125,000 labeled subscriber records from the Streaming Subscription Churn Model dataset. The target is <span className="font-mono text-foreground">churned</span>, with 0 representing active subscribers and 1 representing churned subscribers.</p>
              <a href={sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-xs font-semibold text-primary hover:underline">View dataset on Kaggle →</a>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="card-surface p-7">
              <div><span className="text-xs font-semibold uppercase tracking-wider text-primary">Target distribution</span><h2 className="mt-1 text-xl font-bold">Active vs. Churned Subscribers</h2><p className="mt-2 text-xs leading-relaxed text-muted-foreground">The training data is close to balanced, with churned subscribers making up 51.34% of the sample.</p></div>
              <div className="mt-7"><ChurnDistributionChart /></div>
            </div>
            <div className="card-surface p-7">
              <div><span className="text-xs font-semibold uppercase tracking-wider text-primary">Customer segments</span><h2 className="mt-1 text-xl font-bold">Churn by Subscription Type</h2><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Percentage of subscribers in each subscription type who churned.</p></div>
              <div className="mt-7"><BarList data={subscriptionChurn} colors={["#f87171", "#fb923c", "#fbbf24", "#60a5fa"]} /></div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="card-surface p-7">
              <div><span className="text-xs font-semibold uppercase tracking-wider text-primary">Customer service</span><h2 className="mt-1 text-xl font-bold">Churn by Inquiry Level</h2><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Churn percentage across the low, medium, and high customer service inquiry groups.</p></div>
              <div className="mt-7"><BarList data={inquiryChurn} colors={["#f87171", "#fbbf24", "#60a5fa"]} /></div>
            </div>
            <div className="card-surface p-7">
              <div><span className="text-xs font-semibold uppercase tracking-wider text-primary">Behavioral comparison</span><h2 className="mt-1 text-xl font-bold">Average Customer Behavior</h2><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Average values calculated separately for active and churned subscribers.</p></div>
              <div className="mt-7"><BehaviorChart /></div>
            </div>
          </section>

          <section className="space-y-5">
            <div><span className="text-xs font-semibold uppercase tracking-wider text-primary">Data Preparation</span><h2 className="mt-1 text-2xl font-bold tracking-tight">From Subscriber Records to Model Features</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">The dataset contains 20 original columns. After exploratory analysis and feature importance review, the final model used nine original predictor variables before categorical variables were converted to dummy columns.</p></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Age", "Subscriber age"], ["Subscription type", "Free, Student, Family or Premium"], ["Subscription pauses", "Number of subscription pauses"],
                ["Customer service inquiries", "Low, Medium or High inquiry level"], ["Weekly hours", "Time spent listening each week"], ["Song skip rate", "Share of songs skipped"],
                ["Weekly unique songs", "Distinct songs played per week"], ["Notifications clicked", "Notifications clicked by the subscriber"], ["Tenure days", "Days since signup, derived from signup_date"],
              ].map(([name, description]) => <div key={name} className="card-surface p-5"><p className="font-mono text-sm font-semibold text-foreground">{name}</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p></div>)}
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Interpretation</span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">What the Analysis Tells Us</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">The charts point to a clear set of behavioral and subscription characteristics associated with churn. These are predictive signals in this dataset, not evidence that any single factor directly causes customers to leave.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="card-surface p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Engagement</p>
                <h3 className="mt-2 text-lg font-bold">Lower listening activity stands out</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Churned subscribers averaged 20.8 weekly hours versus 29.5 for active subscribers, about 30% lower. Weekly hours was also the largest feature importance in the Gradient Boosting model at 23.6%.</p>
              </div>
              <div className="card-surface p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Subscription risk</p>
                <h3 className="mt-2 text-lg font-bold">Free subscribers show a much higher churn rate</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">The churn chart shows 79.41% for Free subscribers compared with 33.91% for Premium subscribers. Subscription type therefore provides an important segmentation signal in the model.</p>
              </div>
              <div className="card-surface p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Service signals</p>
                <h3 className="mt-2 text-lg font-bold">Inquiry level separates customer groups</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Churn rises from 28.92% for Low inquiry customers to 74.33% for High inquiry customers. The Gradient Boosting model also assigns substantial importance to the customer service inquiry variables.</p>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="card-surface p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Behavioral pattern</p>
                <h3 className="mt-2 text-lg font-bold">Churned subscribers show a different engagement profile</h3>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <li>• <span className="font-semibold text-foreground">Weekly hours:</span> 20.8 vs. 29.5 for active subscribers.</li>
                  <li>• <span className="font-semibold text-foreground">Song skip rate:</span> 54.6% vs. 45.3%, roughly 20% higher.</li>
                  <li>• <span className="font-semibold text-foreground">Subscription pauses:</span> 2.24 vs. 1.72 on average, roughly 30% higher.</li>
                  <li>• <span className="font-semibold text-foreground">Weekly unique songs:</span> 152.4 vs. 149.1, a relatively small difference.</li>
                </ul>
              </div>
              <div className="card-surface p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Model interpretation</p>
                <h3 className="mt-2 text-lg font-bold">The model can support prioritization, not replace judgment</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Gradient Boosting reached a ROC-AUC of 0.940 on the held-out test set. Its feature importance highlights weekly hours, Free subscription status, customer service inquiry level, subscription pauses, and song skip rate as the most prominent predictors among the final encoded features.</p>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Business Impact</span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">Turning Churn Signals into Retention Actions</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">The business value is not simply predicting churn. It is using the model and the observed customer segments to focus retention resources where they can be investigated and tested.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="card-surface p-6">
                <h3 className="text-lg font-bold">1. Prioritize at-risk subscribers</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Use predicted churn probabilities to create an at-risk queue for retention teams. This allows teams to focus outreach on customers flagged by multiple signals rather than contacting the entire subscriber base.</p>
              </div>
              <div className="card-surface p-6">
                <h3 className="text-lg font-bold">2. Build engagement interventions</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">The lower weekly listening hours among churned subscribers suggests that declining engagement can be monitored as an early warning signal. Product teams could test personalized content, discovery prompts, or re-engagement campaigns and measure whether engagement improves before churn occurs.</p>
              </div>
              <div className="card-surface p-6">
                <h3 className="text-lg font-bold">3. Investigate service friction</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">The large difference in churn rates across inquiry levels makes customer service a practical area for investigation. Teams can review recurring issues, resolution times, and customer feedback for high-inquiry subscribers rather than assuming inquiries themselves cause churn.</p>
              </div>
              <div className="card-surface p-6">
                <h3 className="text-lg font-bold">4. Segment retention strategy</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">The subscription chart supports differentiated retention analysis by plan. Free subscribers show substantially higher observed churn than Premium subscribers, so the next step would be to test whether targeted conversion, value communication, or product engagement initiatives change retention outcomes.</p>
              </div>
            </div>
            <div className="card-surface p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-bold">How this could be used operationally</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">A production workflow could score active subscribers periodically, rank them by predicted churn probability, attach the key behavioral signals used for prioritization, and route selected customers into retention experiments. Success should then be measured with downstream retention and revenue metrics rather than model accuracy alone.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <div><span className="text-xs font-semibold uppercase tracking-wider text-primary">Model Evaluation</span><h2 className="mt-1 text-2xl font-bold tracking-tight">Comparing Churn Classifiers</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">All three models were evaluated on the same stratified 20% test set. The colored bars make the three classifiers easy to distinguish across the five metrics.</p></div>
            <div className="card-surface p-5 sm:p-7"><div className="h-[360px] w-full"><ModelComparisonChart /></div></div>
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="border-b border-border bg-surface text-muted-foreground"><tr><th className="px-4 py-3">Model</th><th className="px-4 py-3">Accuracy</th><th className="px-4 py-3">Precision</th><th className="px-4 py-3">Recall</th><th className="px-4 py-3">F1</th><th className="px-4 py-3">ROC-AUC</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {modelResults.map((r) => <tr key={r.model}><td className="px-4 py-3 font-semibold"><span className="mr-2 inline-block size-2 rounded-full" style={{ backgroundColor: r.color }} />{r.model}</td><td className="px-4 py-3 text-muted-foreground">{r.accuracy.toFixed(2)}%</td><td className="px-4 py-3 text-muted-foreground">{r.precision.toFixed(2)}%</td><td className="px-4 py-3 text-muted-foreground">{r.recall.toFixed(2)}%</td><td className="px-4 py-3 text-muted-foreground">{r.f1.toFixed(2)}%</td><td className="px-4 py-3 font-bold text-primary">{(r.auc / 100).toFixed(3)}</td></tr>)}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-5">
            <div><span className="text-xs font-semibold uppercase tracking-wider text-primary">Model Interpretation</span><h2 className="mt-1 text-2xl font-bold tracking-tight">Features Used Most by Gradient Boosting</h2><p className="mt-2 max-w-3xl text-sm text-muted-foreground">Feature importance from the final Gradient Boosting model, shown at the same dummy-column level as the notebook output.</p></div>
            <div className="card-surface p-6"><BarList data={featureImportance} colors={["#34d399", "#60a5fa", "#a78bfa", "#fbbf24", "#fb923c", "#f87171"]} /></div>
          </section>

          <section className="space-y-5">
            <div><span className="text-xs font-semibold uppercase tracking-wider text-primary">Code</span><h2 className="mt-1 text-2xl font-bold tracking-tight">Python Implementation</h2><p className="mt-2 text-sm text-muted-foreground">The code below follows the notebook workflow and is organized into the main analysis stages.</p></div>
            <div className="flex flex-wrap gap-2 border-b border-border pb-3">
              {codeSnippets.map((snippet, index) => <button key={snippet.title} type="button" onClick={() => setActiveCode(index)} className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium ${activeCode === index ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:text-foreground"}`}><Code2 className="size-3.5" /> {snippet.title}</button>)}
            </div>
            <div className="rounded-lg border border-border bg-surface/70 p-3 text-xs text-muted-foreground"><span className="font-semibold text-foreground">{codeSnippets[activeCode].title}: </span>{codeSnippets[activeCode].description}</div>
            <CodeBlock code={codeSnippets[activeCode].code} language="python" filename="churn_analysis.py" />
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            {[
              "Feature selection was performed at the original-variable level before categorical encoding.",
              "The test set was kept separate from the training process and used for the final model comparison.",
              "Retention teams can use churn probabilities to prioritize subscribers for further review or intervention.",
            ].map((learning) => <div key={learning} className="card-surface p-5"><CheckCircle2 className="size-5 text-primary" /><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{learning}</p></div>)}
          </section>

          <div className="flex items-center justify-between border-t border-border pt-8">
            <Link to="/projects/retail-sales-intelligence" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" /> Previous project</Link>
            <Link to="/projects/business-intelligence-forecasting" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground">Next project <ArrowRight className="size-3.5" /> </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
