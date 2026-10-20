export interface MetricCard {
  label: string;
  value: string;
  change?: string;
  description: string;
}

export interface CodeSnippet {
  title: string;
  language: "python" | "sql";
  code: string;
  description: string;
}

export interface ProjectDetail {
  slug: string;
  to: string;
  title: string;
  category: string;
  tagline: string;
  summary: string;
  role: string;
  timeline: string;
  tools: string[];
  githubUrl?: string;
  liveDemoUrl?: string;
  metrics: MetricCard[];
  problemStatement: string;
  keyChallenges: string[];
  solutionOverview: string;
  methodologySteps: {
    step: string;
    title: string;
    description: string;
    details: string[];
  }[];
  codeSnippets: CodeSnippet[];
  modelResults?: {
    model: string;
    accuracy: string;
    precision: string;
    recall: string;
    f1Score: string;
    rocAuc: string;
    notes: string;
  }[];
  featureImportance?: {
    feature: string;
    importance: number;
    description: string;
  }[];
  businessImpact: {
    title: string;
    metric: string;
    detail: string;
  }[];
  keyLearnings: string[];
}

export const projectDetails: Record<string, ProjectDetail> = {
  "cardiovascular-risk-prediction": {
    slug: "cardiovascular-risk-prediction",
    to: "/projects/cardiovascular-risk-prediction",
    title: "Cardiovascular Disease Risk Prediction",
    category: "Healthcare Analytics & Predictive Modeling",
    tagline: "This project explores the use of machine learning to predict cardiovascular disease risk using patient health data. Five classification models were developed and compared to evaluate their predictive performance and identify the most effective approach.",
    summary:
      "Analyzed 68,205 processed patient records and compared Logistic Regression, Decision Tree, Random Forest, Gradient Boosting, and XGBoost to predict recorded cardiovascular disease status. The project includes exploratory analysis, a data dictionary, model evaluation, and feature importance review.",
    role: "Data Analyst & Machine Learning Practitioner",
    timeline: "Portfolio Project",
    tools: ["Python", "Pandas", "Scikit-Learn", "XGBoost", "Matplotlib", "Seaborn"],
    githubUrl: "https://github.com/Ahmedbilloo/Portfolio",
    metrics: [
      {
        label: "Best Test Accuracy",
        value: "73.03%",
        change: "Random Forest",
        description: "Accuracy on the stratified held-out test set in the recorded notebook run.",
      },
      {
        label: "Best ROC-AUC",
        value: "0.7975",
        change: "Random Forest",
        description: "Area under the ROC curve on the held-out test set.",
      },
      {
        label: "Records Analyzed",
        value: "68,205",
        change: "Processed dataset",
        description: "Patient records with demographic, clinical, lifestyle, and derived variables.",
      },
      {
        label: "Models Compared",
        value: "5",
        change: "Common test set",
        description: "Logistic Regression, Decision Tree, Random Forest, Gradient Boosting, and XGBoost.",
      },
    ],
    problemStatement:
      "The project investigates whether demographic, blood pressure, cholesterol, glucose, body mass index, and lifestyle variables contain useful patterns for classifying recorded cardiovascular disease status in a processed patient dataset.",
    keyChallenges: [
      "Reviewing duplicated and derived fields before model preparation.",
      "Encoding categorical variables consistently across the candidate classifiers.",
      "Comparing models using multiple evaluation metrics rather than accuracy alone.",
      "Avoiding clinical or causal conclusions from observational data and feature importance scores.",
    ],
    solutionOverview:
      "Loaded and reviewed the processed dataset, performed exploratory analysis, documented all 17 variables, prepared a stratified 80/20 train-test split, and compared five classifiers. Logistic Regression used standardized predictors; tree-based models used the encoded features without standardization. Evaluation covered accuracy, precision, recall, F1 score, ROC-AUC, and ROC curve comparison.",
    methodologySteps: [
      {
        step: "01",
        title: "Data Review and Exploration",
        description: "Inspected dataset structure, category frequencies, summary statistics, and target balance.",
        details: [
          "Analyzed 68,205 rows and 17 original or derived columns.",
          "Compared disease rates across cholesterol, blood pressure category, physical activity, and smoking status.",
        ],
      },
      {
        step: "02",
        title: "Data Dictionary and Feature Preparation",
        description: "Documented variables and prepared the predictors for classification.",
        details: [
          "Excluded the record identifier, used age_years instead of age, and excluded the duplicate bp_category_encoded field.",
          "One-hot encoded categorical variables and used a stratified 80/20 split with random_state=1.",
        ],
      },
      {
        step: "03",
        title: "Classification Models",
        description: "Compared five models using the same training and test partitions.",
        details: [
          "Evaluated Logistic Regression, a cross-validated Decision Tree, Random Forest, Gradient Boosting, and XGBoost.",
          "Standardized predictors for Logistic Regression; tree-based models were trained without scaling.",
        ],
      },
      {
        step: "04",
        title: "Evaluation and Interpretation",
        description: "Compared predictive metrics and reviewed feature importance.",
        details: [
          "Random Forest recorded the highest test accuracy (73.03%), F1 score (71.45%), and ROC-AUC (0.7975) in the notebook run.",
          "Systolic blood pressure and cholesterol categories ranked prominently in the recorded XGBoost feature importance output; importance is not evidence of causation.",
        ],
      },
    ],
    codeSnippets: [
      {
        title: "Notebook: Cardiovascular Disease Classification",
        language: "python",
        description:
          "The complete notebook contains data loading, the 17-variable data dictionary, exploratory analysis, model training, evaluation metrics, and ROC curve comparison.",
        code: `# Target and candidate predictors
y = data["cardio"]

features = [
    "age_years", "gender", "height", "weight", "ap_hi", "ap_lo",
    "cholesterol", "gluc", "smoke", "alco", "active", "bmi",
    "bp_category"
]

X = data[features].copy()
categorical_features = [
    "gender", "cholesterol", "gluc", "smoke", "alco", "active",
    "bp_category"
]
X = pd.get_dummies(X, columns=categorical_features, dtype=int)

train_X, test_X, train_y, test_y = train_test_split(
    X, y, test_size=0.20, random_state=1, stratify=y
)`,
      },
    ],
    businessImpact: [
      {
        title: "Model Comparison",
        metric: "5 Classifiers",
        detail: "The same held-out test set and multiple metrics were used to compare baseline, single-tree, and ensemble approaches.",
      },
      {
        title: "Model Transparency",
        metric: "Data Dictionary + Feature Importance",
        detail: "Documented source and derived variables and reviewed the features most used by the XGBoost model.",
      },
      {
        title: "Responsible Interpretation",
        metric: "Exploratory Only",
        detail: "Results are presented as an educational prediction exercise, not as a validated clinical screening or diagnostic system.",
      },
    ],
    keyLearnings: [
      "Random Forest provided the strongest overall test metrics among the five recorded models, though differences were modest.",
      "Accuracy alone does not fully describe classification performance; precision, recall, F1 score, and ROC-AUC provide complementary views.",
      "Derived and duplicate columns should be identified and documented before modeling.",
      "Associations and feature importance in observational data should not be interpreted as causal effects or clinical guidance.",
    ],
  },
};
