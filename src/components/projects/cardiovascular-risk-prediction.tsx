import { Link } from "@tanstack/react-router";
import cardiovascularNotebookCode from "@/data/cardiovascular-disease-risk-prediction.py?raw";
import { ArrowLeft, ExternalLink, FileText, Database, Activity, BrainCircuit } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const metrics = [
  { model: "Logistic Regression", accuracy: 72.61, precision: 75.74, recall: 65.50, f1: 70.25, auc: 0.7911 },
  { model: "Decision Tree", accuracy: 72.76, precision: 74.66, recall: 67.85, f1: 71.09, auc: 0.7891 },
  { model: "Random Forest", accuracy: 73.03, precision: 74.83, recall: 68.35, f1: 71.45, auc: 0.7975 },
  { model: "Gradient Boosting", accuracy: 72.29, precision: 73.47, recall: 68.67, f1: 70.99, auc: 0.7858 },
  { model: "XGBoost", accuracy: 72.47, precision: 73.91, recall: 68.35, f1: 71.02, auc: 0.7892 },
];

const variables = [
  ["id", "Record identifier; not a clinical measurement.", "Integer identifier", "Excluded"],
  ["age", "Age in days in the source data.", "Numeric, days", "Excluded; use age_years"],
  ["gender", "Gender category supplied by the dataset.", "Categorical code (1 or 2)", "Predictor; one-hot encoded"],
  ["height", "Patient height.", "Centimetres", "Predictor"],
  ["weight", "Patient weight.", "Kilograms", "Predictor in the full feature set"],
  ["ap_hi", "Systolic blood pressure.", "mmHg", "Predictor"],
  ["ap_lo", "Diastolic blood pressure.", "mmHg", "Predictor"],
  ["cholesterol", "Cholesterol category.", "1 = normal; 2 = above normal; 3 = well above normal", "Predictor; one-hot encoded"],
  ["gluc", "Blood glucose category.", "1 = normal; 2 = above normal; 3 = well above normal", "Predictor; one-hot encoded"],
  ["smoke", "Recorded smoking status.", "0 = no; 1 = yes", "Predictor; one-hot encoded"],
  ["alco", "Recorded alcohol consumption.", "0 = no; 1 = yes", "Predictor; one-hot encoded"],
  ["active", "Recorded physical activity status.", "0 = no; 1 = yes", "Predictor; one-hot encoded"],
  ["cardio", "Recorded cardiovascular disease status.", "0 = no disease; 1 = disease", "Target"],
  ["age_years", "Age converted from days to years in the processed dataset.", "Numeric, years", "Predictor"],
  ["bmi", "Body mass index derived from height and weight.", "kg/m²", "Predictor"],
  ["bp_category", "Blood pressure category derived from systolic and diastolic readings.", "Category label", "EDA and model predictor; one-hot encoded"],
  ["bp_category_encoded", "Duplicate category field in the processed data; observed values are labels, despite the column name.", "Category label", "Excluded as duplicate"],
];

const methods = [
  ["01", "Data review and exploration", "Reviewed the 68,205 records, variable types, target balance, clinical measurements and category-level disease rates."],
  ["02", "Feature preparation", "Removed the record identifier and redundant representations, one-hot encoded categorical columns, and retained a stratified 80/20 train-test split."],
  ["03", "Model development", "Compared Logistic Regression, a tuned Decision Tree, Random Forest, Gradient Boosting and XGBoost."],
  ["04", "Model evaluation", "Compared accuracy, precision, recall, F1 score and ROC AUC using the same held-out test set."],
];

const xgbImportance = [
  ["Systolic blood pressure (ap_hi)", 27.84],
  ["Cholesterol category 3", 19.67],
  ["Cholesterol category 1", 4.83],
  ["Age in years", 4.59],
  ["Glucose category 3", 4.28],
];

export function CardiovascularRiskPrediction() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteNav />
      <main>
        <header className="border-b border-border bg-surface/60">
          <div className="container-page py-10 sm:py-14">
            <Link to="/projects/" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> Back to Projects
            </Link>
            <span className="eyebrow mt-6">Healthcare Analytics · Machine Learning</span>
            <h1 className="mt-2 max-w-4xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Cardiovascular Disease Risk Prediction
            </h1>
            <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
              This project explores the use of machine learning to predict cardiovascular disease risk using patient health data. Using a dataset of 68,205 records, I developed and compared five classification models, evaluating their performance through accuracy, precision, recall, F1-score, and ROC-AUC. The project demonstrates the application of data analysis and machine learning techniques to healthcare data, with the aim of identifying an effective approach to cardiovascular risk prediction.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Python", "Pandas", "Scikit-learn", "XGBoost", "Matplotlib", "Seaborn"].map((tool) => (
                <span key={tool} className="rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">{tool}</span>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="https://github.com/Ahmedbilloo/Portfolio/blob/main/notebooks/cardiovascular-disease-risk-prediction.ipynb" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
                <FileText className="size-4" /> View Notebook <ExternalLink className="size-3.5" />
              </a>
              <a href="https://github.com/Ahmedbilloo/Portfolio/blob/main/notebooks/cardiovascular-data-dictionary.md" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-accent">
                <Database className="size-4" /> Data Dictionary <ExternalLink className="size-3.5" />
              </a>
              <a href="https://www.kaggle.com/datasets/colewelkins/cardiovascular-disease" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-accent">
                Dataset Source <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        </header>

        <div className="container-page space-y-12 py-10 sm:py-14">
          <section id="introduction" className="max-w-4xl">
            <span className="eyebrow">Introduction</span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Predicting Cardiovascular Disease Risk</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Cardiovascular disease is a major health concern, and understanding the factors linked to it can help us better assess risk. In this project, I explored health records from more than 68,000 people, looking at factors such as age, blood pressure, cholesterol, and lifestyle, and compared different computer models to see how well they could identify patterns associated with cardiovascular disease.
            </p>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="card-surface p-6 sm:p-7">
              <span className="eyebrow">Project Overview</span>
              <h2 className="mt-2 text-xl font-bold">From patient data to model evaluation</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                This project explores the use of machine learning to predict cardiovascular disease risk using patient health data. Using a dataset of 68,205 records, I developed and compared five classification models, evaluating their performance through accuracy, precision, recall, F1-score, and ROC-AUC. The project demonstrates the application of data analysis and machine learning techniques to healthcare data, with the aim of identifying an effective approach to cardiovascular risk prediction.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Random Forest achieved the strongest overall results in the recorded test run, with 73.03% accuracy and a ROC-AUC of 0.7975. The notebook and data dictionary make the workflow and variables easier to review and reproduce.
              </p>
            </div>
            <div className="card-surface p-6 sm:p-7">
              <h3 className="font-semibold">What this project demonstrates</h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <li>• Exploratory data analysis and feature preparation</li>
                <li>• Side-by-side evaluation of five machine learning classifiers</li>
                <li>• Interpretation of model metrics and feature importance</li>
                <li>• Clear documentation through a notebook and data dictionary</li>
              </ul>
              <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
                This is an educational portfolio project using observational data, not a clinically validated diagnostic or treatment tool.
              </p>
            </div>
          </section>

          <section>
            <div className="mb-5 flex items-center gap-2"><Activity className="size-5 text-primary" /><h2 className="text-xl font-bold">Project at a Glance</h2></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Records", "68,205", "Rows in the processed dataset"],
                ["Target", "cardio", "0 = no disease; 1 = disease"],
                ["Models", "5", "Compared on the same test set"],
                ["Split", "80 / 20", "Stratified train-test split"],
              ].map(([label, value, detail]) => (
                <div key={label} className="card-surface p-5">
                  <p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold text-primary">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold">Model Comparison</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Random Forest produced the highest test accuracy, F1 score and ROC AUC in the recorded run. Logistic Regression had the highest precision. Differences are modest, so no model should be treated as a clinical diagnostic system.
            </p>
            <div className="mt-5 overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-surface text-xs text-muted-foreground"><tr>{["Model", "Accuracy", "Precision", "Recall", "F1 score", "ROC AUC"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
                <tbody>{metrics.map((m) => <tr key={m.model} className="border-t border-border"><td className="px-4 py-3 font-medium">{m.model}</td><td className="px-4 py-3">{m.accuracy.toFixed(2)}%</td><td className="px-4 py-3">{m.precision.toFixed(2)}%</td><td className="px-4 py-3">{m.recall.toFixed(2)}%</td><td className="px-4 py-3">{m.f1.toFixed(2)}%</td><td className="px-4 py-3">{m.auc.toFixed(4)}</td></tr>)}</tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Metrics are from the notebook's recorded evaluation run. Accuracy, precision, recall and F1 are shown as percentages; ROC AUC is on a 0–1 scale.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold">Methodology</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {methods.map(([step, title, detail]) => <article key={step} className="card-surface p-5"><span className="text-xs font-bold text-primary">{step}</span><h3 className="mt-2 font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{detail}</p></article>)}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2"><BrainCircuit className="size-5 text-primary" /><h2 className="text-xl font-bold">XGBoost Feature Importance</h2></div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">The following are the top feature importance values reported by XGBoost in the notebook. These are relative model importance scores, not causal effects or individual disease probabilities.</p>
            <div className="mt-5 space-y-4">
              {xgbImportance.map(([label, value]) => <div key={label}><div className="mb-1 flex items-center justify-between gap-4 text-sm"><span>{label}</span><span className="tabular-nums text-muted-foreground">{Number(value).toFixed(2)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: Number(value) + "%" }} /></div></div>)}
            </div>
          </section>

          <section id="code">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="eyebrow">Notebook Source</span>
                <h2 className="mt-2 text-xl font-bold">Complete Python Notebook Code</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  The full source from the Jupyter notebook is shown below, including the exploratory analysis, data preparation, all five classification models, evaluation, and feature-importance workflow. Notebook Markdown cells are preserved as comments for readability.
                </p>
              </div>
              <a href="https://github.com/Ahmedbilloo/Portfolio/blob/main/notebooks/cardiovascular-disease-risk-prediction.ipynb" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium hover:bg-accent">
                Open original notebook <ExternalLink className="size-3.5" />
              </a>
            </div>
            <div className="mt-5 max-h-[620px] overflow-auto rounded-xl border border-border bg-[#0d1117] p-4 sm:p-5">
              <pre className="min-w-max font-mono text-[11px] leading-5 text-[#c9d1d9] sm:text-xs">{cardiovascularNotebookCode.split("\n").map((line, index) => (
                <div key={index} className="flex">
                  <span className="mr-4 inline-block w-8 shrink-0 select-none text-right text-[#484f58]">{index + 1}</span>
                  <code>{line || " "}</code>
                </div>
              ))}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold">Data Dictionary</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">All 17 columns in the processed dataset are documented below, including the derived variables and their role in the analysis.</p>
            <div className="mt-5 overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-surface text-xs text-muted-foreground"><tr>{["Variable", "Description", "Type / coding", "Analysis role"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
                <tbody>{variables.map(([name, description, coding, role]) => <tr key={name} className="border-t border-border align-top"><td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{name}</td><td className="px-4 py-3">{description}</td><td className="px-4 py-3 text-muted-foreground">{coding}</td><td className="px-4 py-3 text-muted-foreground">{role}</td></tr>)}</tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-surface/50 p-5 sm:p-6">
            <h2 className="text-lg font-bold">Interpretation and Limitations</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>In the dataset's grouped averages, the disease-positive group had higher average systolic blood pressure and BMI than the disease-negative group.</li>
              <li>Blood pressure category and cholesterol category showed useful differences in disease rates during exploratory analysis.</li>
              <li>The data is observational and reflects recorded disease status. Feature importance does not establish causation.</li>
              <li>This is a portfolio and learning project, not a validated clinical tool. It should not be used to diagnose patients or guide treatment.</li>
            </ul>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
