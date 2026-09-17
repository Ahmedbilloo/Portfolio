import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Code2, Target, Users } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { CodeBlock } from "@/components/code-block";

const sourceUrl = "https://www.kaggle.com/competitions/streaming-subscription-churn-model/data";

const modelResults = [
  { model: "Decision Tree", accuracy: 84.176, precision: 84.784, recall: 84.309, f1: 84.546, auc: 93.237 },
  { model: "Random Forest", accuracy: 84.456, precision: 84.743, recall: 85.033, f1: 84.888, auc: 93.581 },
  { model: "Gradient Boosting", accuracy: 84.616, precision: 85.816, recall: 83.903, f1: 84.849, auc: 94.029 },
] as const;

const subscriptionChurn = [["Free", 79.41], ["Student", 57.39], ["Family", 34.58], ["Premium", 33.91]] as const;
const inquiryChurn = [["High", 74.33], ["Medium", 50.92], ["Low", 28.92]] as const;
const behaviorComparison = [["Weekly hours", 29.525, 20.783], ["Song skip rate", 0.501, 0.500], ["Subscription pauses", 1.725, 2.244], ["Unique songs", 149.078, 152.400]] as const;
const featureImportance = [["Subscription type", 26.3399], ["Customer service inquiries", 24.4210], ["Weekly hours", 23.6042], ["Subscription pauses", 8.8381], ["Song skip rate", 7.4210], ["Age", 7.3369], ["Notifications clicked", 1.3831], ["Weekly unique songs", 0.6492], ["Tenure days", 0.0052]] as const;

const codeSnippets = [
  {
    title: "Feature Preparation",
    description: "Creates tenure and listening-intensity features, then selects the final customer variables used for modeling.",
    code: `data["TenureDays"] = -data["signup_date"]
data["SongsPerHour"] = (
    data["weekly_songs_played"] /
    data["weekly_hours"].replace(0, np.nan)
)

features_final = [
    "age", "subscription_type", "num_subscription_pauses",
    "customer_service_inquiries", "weekly_hours", "song_skip_rate",
    "weekly_unique_songs", "notifications_clicked", "TenureDays",
]

categorical_features = data[features_final].select_dtypes(
    include="object"
).columns.tolist()

X = pd.get_dummies(
    data[features_final], columns=categorical_features,
    drop_first=True, dtype=int
)
y = data["churned"]`,
  },
  {
    title: "Decision Tree Tuning",
    description: "Uses a grid search with three-fold cross-validation to tune the Decision Tree using accuracy as the scoring measure.",
    code: `param_grid = {
    "max_depth": [5, 10, 20, 30],
    "min_samples_split": [20, 40, 60, 80, 100],
    "min_impurity_decrease": [0, 0.0005, 0.001, 0.005, 0.01],
}

gridSearch = GridSearchCV(
    DecisionTreeClassifier(criterion="gini"),
    param_grid, cv=3, n_jobs=-1, verbose=3
)

gridSearch.fit(train_X, train_y)
print("Initial score:", gridSearch.best_score_)
print("Initial parameters:", gridSearch.best_params_)`,
  },
  {
    title: "Model Comparison",
    description: "Fits Random Forest and Gradient Boosting models and evaluates all three classifiers on the same 20% stratified test set.",
    code: `rf = RandomForestClassifier(
    n_estimators=500, random_state=1, n_jobs=-1
)
rf.fit(train_X, train_y)
rf_predictions = rf.predict(test_X)
rf_probabilities = rf.predict_proba(test_X)[:, 1]

boost = GradientBoostingClassifier(
    n_estimators=300, learning_rate=0.05, random_state=1
)
boost.fit(train_X, train_y)
gb_predictions = boost.predict(test_X)
gb_probabilities = boost.predict_proba(test_X)[:, 1]

model_results = pd.DataFrame({
    "Model": ["Decision Tree", "Random Forest", "Gradient Boosting"],
    "Accuracy": [accuracy_score(test_y, predictions), accuracy_score(test_y, rf_predictions), accuracy_score(test_y, gb_predictions)],
    "Precision": [precision_score(test_y, predictions), precision_score(test_y, rf_predictions), precision_score(test_y, gb_predictions)],
    "Recall": [recall_score(test_y, predictions), recall_score(test_y, rf_predictions), recall_score(test_y, gb_predictions)],
    "F1 Score": [f1_score(test_y, predictions), f1_score(test_y, rf_predictions), f1_score(test_y, gb_predictions)],
    "ROC-AUC": [roc_auc_score(test_y, probabilities), roc_auc_score(test_y, rf_probabilities), roc_auc_score(test_y, gb_probabilities)]
})`,
  },
] as const;

function BarList({ data }: { data: readonly (readonly [string, number])[] }) {
  const max = Math.max(...data.map((x) => x[1]));
  return <div className="space-y-4">{data.map(([label, value], index) => <div key={label}><div className="mb-1 flex justify-between gap-3 text-xs"><span className="font-medium">{index + 1}. {label}</span><span className="font-semibold text-primary">{value.toFixed(2)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(value / max) * 100}%` }} /></div></div>)}</div>;
}

function ModelComparisonChart() {
  const metrics = ["Accuracy", "Precision", "Recall", "F1", "ROC-AUC"] as const;
  const values = (model: (typeof modelResults)[number]) => [model.accuracy, model.precision, model.recall, model.f1, model.auc];
  const width = 920, height = 340, left = 64, right = 24, top = 28, bottom = 64, min = 80, max = 96;
  const plotW = width - left - right, plotH = height - top - bottom, groupW = plotW / metrics.length, barW = 18, gap = 7;
  const y = (v: number) => height - bottom - ((v - min) / (max - min)) * plotH;
  return <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label="Model performance comparison">
    {[80, 84, 88, 92, 96].map((tick) => <g key={tick}><line x1={left} y1={y(tick)} x2={width - right} y2={y(tick)} stroke="currentColor" opacity=".1" /><text x={left - 9} y={y(tick) + 4} textAnchor="end" fontSize="12" fill="currentColor" opacity=".65">{tick}%</text></g>)}
    <line x1={left} y1={top} x2={left} y2={height - bottom} stroke="currentColor" opacity=".2" /><line x1={left} y1={height - bottom} x2={width - right} y2={height - bottom} stroke="currentColor" opacity=".2" />
    {metrics.map((metric, metricIndex) => { const center = left + (metricIndex + 0.5) * groupW; return <g key={metric}>{modelResults.map((model, modelIndex) => { const value = values(model)[metricIndex]; const x = center + (modelIndex - 1) * (barW + gap) - barW / 2; const barHeight = ((value - min) / (max - min)) * plotH; return <g key={model.model}><rect x={x} y={height - bottom - barHeight} width={barW} height={barHeight} rx="3" fill="currentColor" opacity={modelIndex === 2 ? "0.9" : "0.55"} /><text x={x + barW / 2} y={height - bottom - barHeight - 6} textAnchor="middle" fontSize="9" fill="currentColor" opacity=".75">{value.toFixed(1)}</text></g>; })}<text x={center} y={height - bottom + 19} textAnchor="middle" fontSize="11" fill="currentColor" opacity=".7">{metric}</text></g>; })}
    <text x="22" y={(top + height - bottom) / 2} textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor" opacity=".7" transform={`rotate(-90 22 ${(top + height - bottom) / 2})`}>Score</text>
    <g transform={`translate(${width - 205}, 10)`}>{modelResults.map((model, index) => <g key={model.model} transform={`translate(${index * 72}, 0)`}><rect width="11" height="11" rx="2" fill="currentColor" opacity={index === 2 ? "0.9" : "0.55"} /><text x="16" y="10" fontSize="10" fill="currentColor" opacity=".7">{index === 0 ? "Tree" : index === 1 ? "RF" : "GB"}</text></g>)}</g>
  </svg>;
}

function BehaviorChart() {
  const width = 920, height = 310, left = 76, right = 20, top = 28, bottom = 64, plotW = width - left - right;
  const maxValues = [35, 1, 3, 180];
  return <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label="Active versus churned customer behavior comparison">
    {[0, 0.25, 0.5, 0.75, 1].map((tick) => { const y = height - bottom - tick * (height - top - bottom); return <line key={tick} x1={left} y1={y} x2={width - right} y2={y} stroke="currentColor" opacity=".1" />; })}
    {behaviorComparison.map(([label, active, churned], i) => { const groupW = plotW / behaviorComparison.length, center = left + (i + 0.5) * groupW, scale = maxValues[i], activeH = (active / scale) * (height - top - bottom), churnedH = (churned / scale) * (height - top - bottom); return <g key={label}><rect x={center - 25} y={height - bottom - activeH} width="20" height={activeH} rx="3" fill="currentColor" opacity=".45" /><rect x={center + 5} y={height - bottom - churnedH} width="20" height={churnedH} rx="3" fill="currentColor" opacity=".9" /><text x={center - 15} y={height - bottom - activeH - 7} textAnchor="middle" fontSize="10" fill="currentColor" opacity=".65">{active.toFixed(i === 1 ? 3 : 1)}</text><text x={center + 15} y={height - bottom - churnedH - 7} textAnchor="middle" fontSize="10" fill="currentColor" opacity=".75">{churned.toFixed(i === 1 ? 3 : 1)}</text><text x={center} y={height - bottom + 19} textAnchor="middle" fontSize="11" fill="currentColor" opacity=".7">{label}</text></g>; })}
    <line x1={left} y1={height - bottom} x2={width - right} y2={height - bottom} stroke="currentColor" opacity=".2" />
    <text x={width - 115} y={height - 15} fontSize="10" fill="currentColor" opacity=".65">Active / Churned</text>
  </svg>;
}

export function CustomerChurnPrediction() {
  const [activeCode, setActiveCode] = useState(0);
  return <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20"><SiteNav /><main className="pb-20">
    <header className="border-b border-border bg-surface/60"><div className="container-page py-10 sm:py-14"><Link to="/" hash="projects" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" /> Back to all projects</Link><div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">Machine Learning</span><span>•</span><span>Streaming Subscription Churn Model</span><span>•</span><span>Python &amp; Scikit-learn</span></div><h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight sm:text-5xl">Customer Churn Prediction &amp; Retention Analytics</h1><p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">Predicting which subscribers are most likely to churn and identifying the behaviors associated with that risk.</p><div className="mt-6 flex flex-wrap gap-2">{["Python", "Pandas", "Scikit-learn", "Decision Tree", "Random Forest", "Gradient Boosting"].map((tool) => <span key={tool} className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">{tool}</span>)}</div></div></header>
    <div className="container-page mt-12 space-y-16">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Subscribers analyzed", "125,000", "Rows in the training dataset"], ["Churned subscribers", "64,174", "51.34% of the training data"], ["Final predictors", "9", "Selected before dummy encoding"], ["Best ROC-AUC", "0.940", "Gradient Boosting on the test set"]].map(([label, value, detail]) => <div key={label} className="card-surface p-5"><span className="text-xs font-medium text-muted-foreground">{label}</span><p className="mt-2 text-3xl font-extrabold tracking-tight">{value}</p><p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">{detail}</p></div>)}</section>
      <section className="grid gap-8 lg:grid-cols-2"><div className="card-surface p-7"><div className="flex items-center gap-2 text-primary"><Target className="size-5" /><h2 className="text-lg font-bold">Business Question</h2></div><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Which subscribers are most likely to churn, and which customer behaviors provide useful signals of that risk? The analysis compares subscriber behavior and builds classification models that can be used to prioritize retention activity.</p></div><div className="card-surface p-7"><div className="flex items-center gap-2 text-primary"><Users className="size-5" /><h2 className="text-lg font-bold">Dataset &amp; Target</h2></div><p className="mt-4 text-sm leading-relaxed text-muted-foreground">The project uses 125,000 labeled subscriber records from the Streaming Subscription Churn Model dataset. The target is <span className="font-mono text-foreground">churned</span>, with 0 representing active subscribers and 1 representing churned subscribers.</p><a href={sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-xs font-semibold text-primary hover:underline">View dataset on Kaggle →</a></div></section>
      <section className="space-y-6"><div><span className="text-xs font-semibold uppercase tracking-wider text-primary">Data Preparation</span><h2 className="mt-1 text-2xl font-bold tracking-tight">From Subscriber Records to Model Features</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">The dataset contains 20 original columns. Customer ID was excluded from modeling, tenure was derived from the signup date, and the final model used nine original predictor variables before categorical variables were converted to dummy columns.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[["TenureDays", "Days since signup, derived from signup_date"], ["Weekly hours", "Time spent listening each week"], ["Song skip rate", "Share of songs skipped"], ["Subscription pauses", "Number of subscription pauses"], ["Customer service inquiries", "Low, Medium or High inquiry level"], ["Subscription type", "Free, Student, Family or Premium"], ["Weekly unique songs", "Distinct songs played per week"], ["Notifications clicked", "Notifications clicked by the subscriber"], ["Age", "Subscriber age"]].map(([name, description]) => <div key={name} className="card-surface p-5"><p className="font-mono text-sm font-semibold text-foreground">{name}</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p></div>)}</div></section>
      <section className="grid gap-6 lg:grid-cols-2"><div className="card-surface p-7"><div className="flex items-center justify-between gap-4"><div><span className="text-xs font-semibold uppercase tracking-wider text-primary">Churn Analysis</span><h2 className="mt-1 text-xl font-bold">Churn by Subscription Type</h2></div><span className="text-xs text-muted-foreground">% churned</span></div><div className="mt-6"><BarList data={subscriptionChurn} /></div></div><div className="card-surface p-7"><div className="flex items-center justify-between gap-4"><div><span className="text-xs font-semibold uppercase tracking-wider text-primary">Customer Service</span><h2 className="mt-1 text-xl font-bold">Churn by Inquiry Level</h2></div><span className="text-xs text-muted-foreground">% churned</span></div><div className="mt-6"><BarList data={inquiryChurn} /></div></div></section>
      <section className="space-y-5"><div><span className="text-xs font-semibold uppercase tracking-wider text-primary">Behavioral Comparison</span><h2 className="mt-1 text-2xl font-bold tracking-tight">Active vs. Churned Subscribers</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">Average values in the training data for selected behavioral variables.</p></div><div className="card-surface p-5 sm:p-7"><div className="h-80 w-full"><BehaviorChart /></div></div></section>
      <section className="space-y-5"><div><span className="text-xs font-semibold uppercase tracking-wider text-primary">Model Evaluation</span><h2 className="mt-1 text-2xl font-bold tracking-tight">Comparing Churn Classifiers</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">All three models were evaluated on the same stratified 20% test set. The chart and table report the metrics calculated in the notebook.</p></div><div className="card-surface p-5 sm:p-7"><div className="h-80 w-full"><ModelComparisonChart /></div></div><div className="overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full min-w-[760px] text-left text-xs"><thead className="border-b border-border bg-surface text-muted-foreground"><tr><th className="px-4 py-3">Model</th><th className="px-4 py-3">Accuracy</th><th className="px-4 py-3">Precision</th><th className="px-4 py-3">Recall</th><th className="px-4 py-3">F1</th><th className="px-4 py-3">ROC-AUC</th></tr></thead><tbody className="divide-y divide-border">{modelResults.map((r) => <tr key={r.model}><td className="px-4 py-3 font-semibold">{r.model}</td><td className="px-4 py-3 text-muted-foreground">{r.accuracy.toFixed(2)}%</td><td className="px-4 py-3 text-muted-foreground">{r.precision.toFixed(2)}%</td><td className="px-4 py-3 text-muted-foreground">{r.recall.toFixed(2)}%</td><td className="px-4 py-3 text-muted-foreground">{r.f1.toFixed(2)}%</td><td className="px-4 py-3 font-bold text-primary">{(r.auc / 100).toFixed(3)}</td></tr>)}</tbody></table></div></section>
      <section className="space-y-5"><div><span className="text-xs font-semibold uppercase tracking-wider text-primary">Model Interpretation</span><h2 className="mt-1 text-2xl font-bold tracking-tight">Features Used Most by Gradient Boosting</h2><p className="mt-2 max-w-3xl text-sm text-muted-foreground">Feature importance from the final Gradient Boosting model, with dummy columns for categorical variables grouped back to their original predictor.</p></div><div className="card-surface p-6"><BarList data={featureImportance} /></div></section>
      <section className="space-y-5"><div><span className="text-xs font-semibold uppercase tracking-wider text-primary">Code</span><h2 className="mt-1 text-2xl font-bold tracking-tight">Python Implementation</h2><p className="mt-2 text-sm text-muted-foreground">Selected code taken from the churn analysis notebook.</p></div><div className="flex flex-wrap gap-2 border-b border-border pb-3">{codeSnippets.map((snippet, index) => <button key={snippet.title} type="button" onClick={() => setActiveCode(index)} className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium ${activeCode === index ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:text-foreground"}`}><Code2 className="size-3.5" /> {snippet.title}</button>)}</div><div className="rounded-lg border border-border bg-surface/70 p-3 text-xs text-muted-foreground"><span className="font-semibold text-foreground">{codeSnippets[activeCode].title}: </span>{codeSnippets[activeCode].description}</div><CodeBlock code={codeSnippets[activeCode].code} language="python" filename="churn_analysis.py" /></section>
      <section className="grid gap-4 sm:grid-cols-3">{["Feature selection was performed at the original-variable level before categorical encoding.", "The test set was kept separate from the training process and used for the final model comparison.", "Retention teams can use churn probabilities to prioritize subscribers for further review or intervention."].map((learning) => <div key={learning} className="card-surface p-5"><CheckCircle2 className="size-5 text-primary" /><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{learning}</p></div>)}</section>
      <div className="flex items-center justify-between border-t border-border pt-8"><Link to="/projects/retail-sales-intelligence" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" /> Previous project</Link><Link to="/projects/business-intelligence-forecasting" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground">Next project <ArrowRight className="size-3.5" /></Link></div>
    </div>
  </main><SiteFooter /></div>;
}
