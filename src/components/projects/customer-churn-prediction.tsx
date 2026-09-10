import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Code2, Target, Users } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { CodeBlock } from "@/components/code-block";

const featureImportance = [
  ["ActiveMonths", 35.8],
  ["CancellationRate", 24.4],
  ["UniqueProducts", 11.8],
  ["Recency", 9.5],
  ["Frequency", 8.3],
  ["Monetary", 4.1],
  ["AvgOrderValue", 3.2],
  ["TotalQuantity", 2.8],
] as const;

const codeSnippets = [
  {
    title: "Customer Features & Target",
    description: "Builds customer-level behavioral features from transactions before the cutoff and creates the three-month inactivity target.",
    code: `# Observation period ends three months before the dataset's final date
max_date = data["InvoiceDate"].max()
cutoff_date = max_date - pd.DateOffset(months=3)

history = data[data["InvoiceDate"] <= cutoff_date].copy()

customers = (
    history.groupby("CustomerID")
    .agg(
        Recency=("InvoiceDate", lambda x: (cutoff_date - x.max()).days),
        Frequency=("InvoiceNo", "nunique"),
        Monetary=("Revenue", "sum"),
    )
    .reset_index()
)

customers["AvgOrderValue"] = (
    customers["Monetary"] / customers["Frequency"]
)

# Additional behavioral features
quantity = history.groupby("CustomerID")["Quantity"].sum()
products = history.groupby("CustomerID")["StockCode"].nunique()
months = (
    history.assign(Month=history["InvoiceDate"].dt.to_period("M"))
    .groupby("CustomerID")["Month"].nunique()
)

# Customers who purchased after the cutoff remain active
future_customers = set(
    data.loc[data["InvoiceDate"] > cutoff_date, "CustomerID"]
)
customers["Churn"] = (
    ~customers["CustomerID"].isin(future_customers)
).astype(int)`,
  },
  {
    title: "Model Training & Evaluation",
    description: "Splits the customer dataset using stratification and benchmarks Decision Tree, Random Forest, and Gradient Boosting classifiers.",
    code: `from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score
)

features = [
    "Recency", "Frequency", "Monetary", "AvgOrderValue",
    "TotalQuantity", "UniqueProducts", "ActiveMonths",
    "CancellationRate"
]

X = customers[features]
y = customers["Churn"]

train_X, test_X, train_y, test_y = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)

# Random Forest
rf = RandomForestClassifier(
    n_estimators=300,
    max_depth=8,
    min_samples_leaf=10,
    random_state=42,
    n_jobs=-1
)
rf.fit(train_X, train_y)
rf_predictions = rf.predict(test_X)
rf_probabilities = rf.predict_proba(test_X)[:, 1]

# Gradient Boosting
boost = GradientBoostingClassifier(
    n_estimators=300,
    learning_rate=0.05,
    max_depth=1,
    random_state=42
)
boost.fit(train_X, train_y)
gb_predictions = boost.predict(test_X)
gb_probabilities = boost.predict_proba(test_X)[:, 1]

print("Accuracy:", accuracy_score(test_y, gb_predictions))
print("Recall:", recall_score(test_y, gb_predictions))
print("ROC-AUC:", roc_auc_score(test_y, gb_probabilities))`,
  },
];

const modelResults = [
  {
    model: "Decision Tree",
    accuracy: "69.2%",
    precision: "61.0%",
    recall: "78.9%",
    f1: "68.8%",
    auc: "0.736",
    note: "Highest recall, so it caught the largest share of customers labeled as churned.",
  },
  {
    model: "Random Forest",
    accuracy: "71.0%",
    precision: "65.0%",
    recall: "70.6%",
    f1: "67.7%",
    auc: "0.769",
    note: "More balanced performance than the single tree, with stronger ranking ability.",
  },
  {
    model: "Gradient Boosting",
    accuracy: "72.1%",
    precision: "66.1%",
    recall: "71.6%",
    f1: "68.8%",
    auc: "0.777",
    note: "Best overall accuracy and ROC-AUC among the three tested models.",
  },
];

export function CustomerChurnPrediction() {
  const [activeCode, setActiveCode] = useState(0);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      <SiteNav />
      <main className="pb-20">
        <header className="border-b border-border bg-surface/60">
          <div className="container-page py-10 sm:py-14">
            <Link
              to="/"
              hash="projects"
              className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" /> Back to all projects
            </Link>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">Machine Learning</span>
              <span>•</span>
              <span>UCI Online Retail</span>
              <span>•</span>
              <span>Python &amp; Scikit-learn</span>
            </div>
            <h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight sm:text-5xl">
              Customer Churn Prediction &amp; Retention Analytics
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Predicting which customers are likely to become inactive and identifying the purchasing behaviors most associated with churn.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Python", "Pandas", "Scikit-learn", "Decision Tree", "Random Forest", "Gradient Boosting"].map((tool) => (
                <span key={tool} className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </header>

        <div className="container-page mt-12 space-y-16">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Customers analyzed", "3,365", "Customer-level records used for modeling"],
              ["Labeled inactive", "1,445", "42.9% had no purchase in the future window"],
              ["Active customers", "1,920", "57.1% made a later purchase"],
              ["Best ROC-AUC", "0.777", "Gradient Boosting on the test set"],
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
              <div className="flex items-center gap-2 text-primary">
                <Target className="size-5" />
                <h2 className="text-lg font-bold">Business Question</h2>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Which customers are at risk of becoming inactive, and what customer behaviors are associated with that outcome? The analysis turns transaction history into customer-level behavioral features that can support retention prioritization.
              </p>
            </div>
            <div className="card-surface p-7">
              <div className="flex items-center gap-2 text-primary">
                <Users className="size-5" />
                <h2 className="text-lg font-bold">Churn Definition</h2>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Because the UCI dataset does not contain a churn label, churn was operationalized as no purchase after the three-month cutoff through the end of the available data. The model uses only the customer history before that cutoff to make the prediction.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Feature Engineering</span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">Customer Behavior Before Churn</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Each customer was summarized using recency, purchase frequency, historical revenue, order value, quantity, product breadth, months active, and cancellation behavior.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Recency", "Days since last purchase"],
                ["Frequency", "Number of unique invoices"],
                ["Monetary", "Total historical revenue"],
                ["AvgOrderValue", "Revenue per order"],
                ["TotalQuantity", "Units purchased"],
                ["UniqueProducts", "Distinct products bought"],
                ["ActiveMonths", "Months with purchases"],
                ["CancellationRate", "Share of customer invoices cancelled"],
              ].map(([name, description]) => (
                <div key={name} className="card-surface p-5">
                  <p className="font-mono text-sm font-semibold text-foreground">{name}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Behavioral Comparison</span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">Active vs. Inactive Customers</h2>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full min-w-[680px] text-left text-xs">
                <thead className="border-b border-border bg-surface text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Feature</th>
                    <th className="px-4 py-3">Active</th>
                    <th className="px-4 py-3">Inactive</th>
                    <th className="px-4 py-3">What it suggests</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["Recency", "72.9 days", "121.9 days", "Inactive customers had longer gaps since purchase"],
                    ["Frequency", "4.79", "1.86", "Inactive customers purchased less often"],
                    ["Monetary", "£2,295.70", "£715.13", "Inactive customers had lower historical spend"],
                    ["UniqueProducts", "65.4", "29.2", "Inactive customers bought a narrower range"],
                    ["ActiveMonths", "3.22", "1.62", "Inactive customers showed less sustained engagement"],
                  ].map(([feature, active, inactive, insight]) => (
                    <tr key={feature}>
                      <td className="px-4 py-3 font-semibold">{feature}</td>
                      <td className="px-4 py-3 text-muted-foreground">{active}</td>
                      <td className="px-4 py-3 text-muted-foreground">{inactive}</td>
                      <td className="px-4 py-3 text-muted-foreground">{insight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Model Evaluation</span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">Comparing Churn Classifiers</h2>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                The models were evaluated on a stratified 20% test set. Accuracy shows how often predictions were correct overall, while recall shows how many customers labeled as churned were successfully identified.
              </p>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full min-w-[850px] text-left text-xs">
                <thead className="border-b border-border bg-surface text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Model</th>
                    <th className="px-4 py-3">Accuracy</th>
                    <th className="px-4 py-3">Precision</th>
                    <th className="px-4 py-3">Recall</th>
                    <th className="px-4 py-3">F1</th>
                    <th className="px-4 py-3">ROC-AUC</th>
                    <th className="px-4 py-3">Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {modelResults.map((r) => (
                    <tr key={r.model} className={r.model === "Gradient Boosting" ? "bg-primary/5" : ""}>
                      <td className="px-4 py-3 font-semibold">{r.model}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.accuracy}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.precision}</td>
                      <td className="px-4 py-3 font-semibold">{r.recall}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.f1}</td>
                      <td className="px-4 py-3 font-bold text-primary">{r.auc}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Model Interpretation</span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">What Drove the Predictions?</h2>
              <p className="mt-2 text-sm text-muted-foreground">Gradient Boosting feature importance from the trained model.</p>
            </div>
            <div className="card-surface p-6 space-y-4">
              {featureImportance.map(([feature, value]) => (
                <div key={feature}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{feature}</span>
                    <span className="font-mono text-muted-foreground">{value.toFixed(1)}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(value * 2, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Code</span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">Python Implementation</h2>
              <p className="mt-2 text-sm text-muted-foreground">Selected code from the churn analysis notebook.</p>
            </div>
            <div className="flex flex-wrap gap-2 border-b border-border pb-3">
              {codeSnippets.map((snippet, index) => (
                <button
                  key={snippet.title}
                  type="button"
                  onClick={() => setActiveCode(index)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium ${activeCode === index ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:text-foreground"}`}
                >
                  <Code2 className="size-3.5" /> {snippet.title}
                </button>
              ))}
            </div>
            <div className="rounded-lg border border-border bg-surface/70 p-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{codeSnippets[activeCode].title}: </span>
              {codeSnippets[activeCode].description}
            </div>
            <CodeBlock code={codeSnippets[activeCode].code} language="python" filename="churn_analysis.py" />
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            {[
              "Use customer behavior before the cutoff only when building predictors.",
              "Treat the churn label as a defined inactivity outcome, not proof of permanent customer loss.",
              "For retention, recall matters because missed at-risk customers are the ones the intervention never reaches.",
            ].map((learning) => (
              <div key={learning} className="card-surface p-5">
                <CheckCircle2 className="size-5 text-primary" />
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{learning}</p>
              </div>
            ))}
          </section>

          <div className="flex items-center justify-between border-t border-border pt-8">
            <Link to="/projects/retail-sales-intelligence" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> Previous project
            </Link>
            <Link to="/projects/business-intelligence-forecasting" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground">
              Next project <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
