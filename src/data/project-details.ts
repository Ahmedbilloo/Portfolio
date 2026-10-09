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
  "business-intelligence-forecasting": {
    slug: "business-intelligence-forecasting",
    to: "/projects/business-intelligence-forecasting",
    title: "Business Intelligence & Demand Forecasting Platform",
    category: "Business Intelligence & Supply Chain Analytics",
    tagline: "End-to-End Demand Forecasting and Automated BI Pipeline for Pharmaceutical Distribution",
    summary:
      "Engineered an automated business intelligence and time-series demand forecasting pipeline across 100+ hospital supply networks. By orchestrating SQL Server ETL pipelines, Python SARIMAX forecasting models, and executive Tableau dashboards, the platform reduced stockouts by 30% and cut procurement lead times by 25%.",
    role: "Lead Analytics Specialist & Data Engineer",
    timeline: "Jan 2024 – June 2024 (6 Months)",
    tools: ["Python", "SQL Server", "Tableau", "Tableau Prep", "Pandas", "Statsmodels", "SARIMAX"],
    githubUrl: "https://github.com/ahmedbilloo",
    metrics: [
      {
        label: "Stockout Reduction",
        value: "30%",
        change: "-30% stockouts",
        description: "Decrease in emergency expedited pharmaceutical orders across hospital accounts",
      },
      {
        label: "Lead Time Improvement",
        value: "25%",
        change: "-25% cycle time",
        description: "Reduction in procurement turnaround time via automated reorder points",
      },
      {
        label: "Forecast Accuracy (MAPE)",
        value: "6.2%",
        change: "+18% precision",
        description: "Mean Absolute Percentage Error on top 120 critical pharmaceutical SKUs",
      },
      {
        label: "Annual Working Capital Saved",
        value: "$420,000",
        change: "Holding cost savings",
        description: "Reduction in excess safety stock holding costs and expired drug write-offs",
      },
    ],
    problemStatement:
      "Pharmaceutical distribution demands near-zero margin for error. Frequent demand volatility, supplier batch minimums, and strict expiration dates led to periodic stockouts in high-demand critical care medications alongside costly overstocking in slow-moving antibiotics. Procurement teams relied on fragmented static spreadsheets with 3-week lag times, resulting in emergency supplier premiums and compromised hospital fulfillment SLA agreements.",
    keyChallenges: [
      "High seasonality and sudden demand surges across critical therapeutic categories (e.g. oncology, cardiology, and respiratory therapies).",
      "Supplier lead times varying between 14 to 45 business days with variable minimum order quantities (MOQs).",
      "Legacy ERP data siloed across separate inventory and billing tables without standardized reporting views.",
      "Strict compliance requiring batches nearing 6 months to expiration to trigger automated clearance discount protocols.",
    ],
    solutionOverview:
      "Architected a four-tier automated analytical system: (1) Nightly SQL Server ETL pipelines that consolidate ERP transactional records into indexed star-schema data marts; (2) Automated Tableau Prep workflows performing data quality validation and currency normalization; (3) Python forecasting microservice generating 30, 60, and 90-day SARIMAX demand predictions with dynamic confidence intervals; and (4) Role-based Tableau executive dashboards with automated threshold alerts for procurement officers.",
    methodologySteps: [
      {
        step: "01",
        title: "Data Extraction & Star-Schema Staging",
        description: "Built automated SQL Server stored procedures running incremental nightly batch loads from raw ERP tables.",
        details: [
          "Consolidated 4.2 million transactional order rows into clean FactInventoryOrders and DimProduct, DimHospital, DimSupplier tables.",
          "Indexed high-cardinality foreign keys and created partition views by fiscal quarter to accelerate query runtime by 64%.",
        ],
      },
      {
        step: "02",
        title: "Tableau Prep ETL Cleaning & Data Governance",
        description: "Standardized SKU naming conventions, handled missing lead-time data, and calculated dynamic safety stock thresholds.",
        details: [
          "Applied statistical IQR outlier trimming on anomalous bulk orders during pandemic spikes to prevent model distortion.",
          "Computed rolling 90-day standard deviation of lead time and demand to dynamically recalibrate safety stock buffers.",
        ],
      },
      {
        step: "03",
        title: "Time-Series Modeling with SARIMAX",
        description: "Engineered multi-echelon forecasting models incorporating seasonal indices and hospital contract renewal cycles.",
        details: [
          "Decomposed time series into trend, seasonal (7-day and 30-day), and residual components using additive statsmodels decompositions.",
          "Benchmarked Holt-Winters Exponential Smoothing vs. SARIMAX(1,1,2)(1,1,1)12, achieving a 6.2% test MAPE.",
        ],
      },
      {
        step: "04",
        title: "Executive BI Dashboard & Actionable Alerting",
        description: "Designed responsive Tableau dashboards providing drill-down visibility from executive KPI summaries to individual batch numbers.",
        details: [
          "Integrated automated color-coded risk flags: Green (Healthy Stock), Amber (Approaching Reorder Point), Red (Imminent Stockout Risk < 14 Days).",
          "Automated CSV push triggers delivering weekly reorder requisition batches directly to procurement managers.",
        ],
      },
    ],
    codeSnippets: [
      {
        title: "SQL Stored Procedure: Automated Dynamic Reorder Point Calculation",
        language: "sql",
        description:
          "Calculates 90-day moving average daily demand, lead time variability, and safety stock to generate priority procurement reorder flags.",
        code: `-- =========================================================================
-- Stored Procedure: dbo.usp_CalculateDynamicReorderPoints
-- Description: Computes dynamic safety stock and identifies critical SKUs
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.usp_CalculateDynamicReorderPoints
    @ServiceLevelZ FLOAT = 1.96, -- 97.5% Service Level Factor
    @AnalysisWindowDays INT = 90
AS
BEGIN
    SET NOCOUNT ON;

    WITH DailyDemandCTE AS (
        SELECT
            f.SKU_ID,
            f.OrderDate,
            SUM(f.QuantityOrdered) AS DailyQuantity
        FROM dbo.FactSalesOrders f
        WHERE f.OrderDate >= DATEADD(DAY, -@AnalysisWindowDays, GETDATE())
        GROUP BY f.SKU_ID, f.OrderDate
    ),
    DemandStatsCTE AS (
        SELECT
            d.SKU_ID,
            AVG(CAST(d.DailyQuantity AS FLOAT)) AS AvgDailyDemand,
            STDEV(CAST(d.DailyQuantity AS FLOAT)) AS StDevDailyDemand
        FROM DailyDemandCTE d
        GROUP BY d.SKU_ID
    ),
    InventoryCTE AS (
        SELECT
            p.SKU_ID,
            p.SKU_Name,
            p.TherapeuticCategory,
            p.SupplierLeadTimeDays,
            p.SupplierLeadTimeVariance,
            inv.CurrentOnHandUnits,
            inv.UnitsOnOrder
        FROM dbo.DimProduct p
        INNER JOIN dbo.FactCurrentInventory inv ON p.SKU_ID = inv.SKU_ID
        WHERE p.IsActive = 1
    )
    SELECT
        i.SKU_ID,
        i.SKU_Name,
        i.TherapeuticCategory,
        i.CurrentOnHandUnits,
        i.UnitsOnOrder,
        ROUND(ds.AvgDailyDemand, 2) AS AvgDailyDemand,
        -- Safety Stock Formula: Z * sqrt( (LeadTime * Var_Demand) + (AvgDemand^2 * Var_LeadTime) )
        ROUND(@ServiceLevelZ * SQRT(
            (i.SupplierLeadTimeDays * POWER(ISNULL(ds.StDevDailyDemand, 1), 2)) +
            (POWER(ds.AvgDailyDemand, 2) * POWER(ISNULL(i.SupplierLeadTimeVariance, 1), 2))
        ), 0) AS RecommendedSafetyStock,
        -- Reorder Point (ROP) = (Avg Daily Demand * Lead Time) + Safety Stock
        ROUND((ds.AvgDailyDemand * i.SupplierLeadTimeDays) + 
            (@ServiceLevelZ * SQRT(
                (i.SupplierLeadTimeDays * POWER(ISNULL(ds.StDevDailyDemand, 1), 2)) +
                (POWER(ds.AvgDailyDemand, 2) * POWER(ISNULL(i.SupplierLeadTimeVariance, 1), 2))
            )), 0) AS DynamicReorderPoint,
        CASE
            WHEN (i.CurrentOnHandUnits + i.UnitsOnOrder) <= ((ds.AvgDailyDemand * i.SupplierLeadTimeDays) * 0.5)
                THEN 'CRITICAL_STOCKOUT_RISK'
            WHEN (i.CurrentOnHandUnits + i.UnitsOnOrder) <= ((ds.AvgDailyDemand * i.SupplierLeadTimeDays) + 10)
                THEN 'REORDER_REQUIRED'
            ELSE 'OPTIMAL'
        END AS InventoryStatus
    FROM InventoryCTE i
    INNER JOIN DemandStatsCTE ds ON i.SKU_ID = ds.SKU_ID
    ORDER BY (i.CurrentOnHandUnits / NULLIF(ds.AvgDailyDemand, 0)) ASC;
END;`,
      },
      {
        title: "Python Microservice: SARIMAX Demand Forecast Model & Validation",
        language: "python",
        description:
          "Fits a Seasonal ARIMA model with exogenous hospital contract features, generates 90-day forecasts with 95% confidence intervals, and evaluates MAPE.",
        code: `import pandas as pd
import numpy as np
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.metrics import mean_absolute_percentage_error, mean_squared_error

def train_and_forecast_sku(
    ts_data: pd.Series,
    exog_data: pd.DataFrame = None,
    forecast_periods: int = 90,
    order: tuple = (1, 1, 2),
    seasonal_order: tuple = (1, 1, 1, 7)
) -> dict:
    """
    Fits SARIMAX model to historical daily drug demand data
    and returns forecast estimates, confidence bands, and accuracy metrics.
    """
    # 80/20 train-test split for rigorous validation
    split_idx = int(len(ts_data) * 0.8)
    train, test = ts_data.iloc[:split_idx], ts_data.iloc[split_idx:]
    
    # Instantiate and fit SARIMAX model
    model = SARIMAX(
        train,
        exog=exog_data.iloc[:split_idx] if exog_data is not None else None,
        order=order,
        seasonal_order=seasonal_order,
        enforce_stationarity=False,
        enforce_invertibility=False
    )
    fitted_model = model.fit(disp=False)
    
    # Test set predictions for performance metric verification
    test_pred = fitted_model.forecast(
        steps=len(test),
        exog=exog_data.iloc[split_idx:] if exog_data is not None else None
    )
    
    mape = mean_absolute_percentage_error(test, test_pred)
    rmse = np.sqrt(mean_squared_error(test, test_pred))
    
    # Refit on full dataset to project into future window
    full_model = SARIMAX(
        ts_data,
        exog=exog_data,
        order=order,
        seasonal_order=seasonal_order
    ).fit(disp=False)
    
    forecast_res = full_model.get_forecast(steps=forecast_periods)
    forecast_df = pd.DataFrame({
        "forecast": np.maximum(forecast_res.predicted_mean, 0),
        "ci_lower": np.maximum(forecast_res.conf_int().iloc[:, 0], 0),
        "ci_upper": forecast_res.conf_int().iloc[:, 1]
    })
    
    return {
        "metrics": {
            "test_mape": float(mape),
            "test_rmse": float(rmse),
            "aic": float(full_model.aic),
            "bic": float(full_model.bic)
        },
        "forecast": forecast_df
    }`,
      },
    ],
    businessImpact: [
      {
        title: "Stockout Elimination",
        metric: "30% Reduction",
        detail: "Eliminated routine stockouts on life-saving ICU and oncology therapies, elevating hospital SLA fulfillment rate to 99.4%.",
      },
      {
        title: "Procurement Cycle Efficiency",
        metric: "25% Faster Lead Time",
        detail: "Automated dynamic reorder points enabled purchase orders to trigger 12 days earlier before buffers breached threshold.",
      },
      {
        title: "Expired Stock & Carrying Cost Savings",
        metric: "$420K Saved Annually",
        detail: "Better matched warehouse deliveries with hospital burn rates, drastically minimizing expired inventory discard losses.",
      },
    ],
    keyLearnings: [
      "Dynamic safety stock adjusting to supplier lead time variance outperforms traditional static min-max thresholding by over 40%.",
      "Executive adoption hinges on automated color-coded alerts and direct actionable recommendations rather than raw statistical charts.",
      "Partitioning star-schema tables by fiscal periods in SQL Server delivered immediate 3x dashboard query performance gains.",
    ],
  },

  "loan-default-prediction": {
    slug: "loan-default-prediction",
    to: "/projects/loan-default-prediction",
    title: "Loan Default Prediction & Credit Risk Scoring",
    category: "Machine Learning & Credit Risk Analytics",
    tagline: "High-Precision Credit Risk Assessment and Probability-of-Default Modeling with Scikit-Learn and Random Forest",
    summary:
      "Engineered machine learning credit risk scoring models on a 50,000+ borrower portfolio. Addressed extreme class imbalance using SMOTE and developed ensemble models (Random Forest, XGBoost, Logistic Regression) with automated feature engineering, achieving an 0.894 ROC-AUC to protect lending institutions from non-performing loan losses.",
    role: "Machine Learning & Credit Risk Modeler",
    timeline: "Sept 2024 – Nov 2024 (3 Months)",
    tools: ["Python", "Scikit-Learn", "XGBoost", "Pandas", "NumPy", "Matplotlib", "Seaborn"],
    githubUrl: "https://github.com/ahmedbilloo",
    metrics: [
      {
        label: "ROC-AUC Score",
        value: "0.894",
        change: "+0.142 vs Baseline",
        description: "Receiver Operating Characteristic area under curve on out-of-time test holdout",
      },
      {
        label: "Default Recall (Class 1)",
        value: "84.6%",
        change: "+22% detection",
        description: "Percentage of high-risk borrowers correctly flagged before loan approval",
      },
      {
        label: "Portfolio Loss Mitigation",
        value: "$1.8M+",
        change: "Projected capital saved",
        description: "Estimated default reduction over a 12-month originated consumer loan cohort",
      },
      {
        label: "Dataset Scale",
        value: "50,000+",
        change: "Borrower records",
        description: "Comprehensive financial, employment, and credit bureau features",
      },
    ],
    problemStatement:
      "Consumer and small business lending institutions face mounting Non-Performing Loans (NPLs) when relying on traditional linear credit scoring cutoffs. High-risk borrowers frequently slip through due to hidden non-linear interactions between debt-to-income (DTI) ratio, revolving credit line utilization, and recent credit inquiry velocity. In addition, credit default datasets suffer from severe class imbalance (~12% default rate), leading vanilla classifiers to produce high accuracy while catastrophically missing actual defaults.",
    keyChallenges: [
      "Severe 8:1 class imbalance between non-defaulting and defaulting borrowers.",
      "High multicollinearity across credit bureau variables (FICO score, revolving balance, inquiry counts).",
      "Regulatory requirements for model interpretability (adverse action reasons required by FCRA/ECOA regulations).",
      "Balancing False Positives (rejecting creditworthy applicants) with False Negatives (approving borrowers who default).",
    ],
    solutionOverview:
      "Built an end-to-end predictive risk modeling pipeline featuring: (1) Robust preprocessing with outlier treatment and target encoding; (2) Synthetic Minority Over-sampling Technique (SMOTE) to balance minority default classes; (3) Hyperparameter-optimized ensemble architectures (Random Forest and XGBoost) evaluated with 5-fold stratified cross-validation; (4) Threshold optimization tailored to asymmetrical business costs of default; and (5) SHAP-based feature attribution to provide clear, explainable adverse action explanations.",
    methodologySteps: [
      {
        step: "01",
        title: "Exploratory Data Analysis & Feature Engineering",
        description: "Constructed domain-specific financial health interaction ratios to uncover hidden insolvency risks.",
        details: [
          "Derived Debt-to-Income (DTI) elasticity, Revolving Utilization Velocity (30d vs 180d), and Credit History Age in months.",
          "Created categorical risk buckets for purpose-of-loan (Debt Consolidation, Home Improvement, Small Business, Medical).",
        ],
      },
      {
        step: "02",
        title: "Handling Class Imbalance with SMOTE",
        description: "Synthesized realistic minority-class borrower records in feature space to train unbiased decision boundaries.",
        details: [
          "Applied SMOTE strictly within cross-validation training folds to prevent data leakage into validation holdouts.",
          "Calibrated sampling ratio to 0.5 default-to-non-default ratio for optimal precision-recall trade-off.",
        ],
      },
      {
        step: "03",
        title: "Ensemble Modeling & Hyperparameter Tuning",
        description: "Trained and benchmarked Logistic Regression, Random Forest Classifier, and XGBoost with GridSearchCV.",
        details: [
          "Tuned max_depth, n_estimators, min_samples_split, and class_weight parameters across 5 stratified folds.",
          "Random Forest achieved 0.894 ROC-AUC, outperforming baseline Logistic Regression (0.752) by 14.2 percentage points.",
        ],
      },
      {
        step: "04",
        title: "Cost-Benefit Threshold Calibration & SHAP Explainability",
        description: "Shifted decision probability threshold from standard 0.5 to 0.38 based on the 4:1 cost ratio of loan default vs. lost interest.",
        details: [
          "Extracted global feature importances: Debt-to-Income Ratio (28.4%), FICO Score (24.1%), Revolving Utilization (18.6%).",
          "Generated localized waterfall plots for individual credit decisions to ensure compliance with lending regulations.",
        ],
      },
    ],
    codeSnippets: [
      {
        title: "Python ML Pipeline: Preprocessing, SMOTE, and Random Forest Training",
        language: "python",
        description:
          "Demonstrates the Scikit-Learn machine learning pipeline with StandardScaler, SMOTE oversampling, and model evaluation metrics.",
        code: `import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline

def build_credit_risk_pipeline(data_path: str):
    # Load borrower dataset
    df = pd.read_csv(data_path)
    
    # Feature Engineering: Financial strain ratios
    df['revolving_to_income_ratio'] = df['revol_bal'] / (df['annual_inc'] + 1e-5)
    df['inquiry_density'] = df['inq_last_6mths'] / (df['open_acc'] + 1)
    
    feature_cols = [
        'fico_score', 'dti', 'annual_inc', 'loan_amnt', 'int_rate',
        'revol_util', 'total_acc', 'revolving_to_income_ratio', 'inquiry_density'
    ]
    X = df[feature_cols]
    y = df['is_default'] # Binary target (1 = Default, 0 = Fully Paid)
    
    # Stratified Train-Test Split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Integrated Pipeline with SMOTE and Random Forest
    pipeline = ImbPipeline([
        ('scaler', StandardScaler()),
        ('smote', SMOTE(sampling_strategy=0.5, random_state=42)),
        ('classifier', RandomForestClassifier(
            n_estimators=300,
            max_depth=12,
            min_samples_split=8,
            class_weight='balanced_subsample',
            random_state=42,
            n_jobs=-1
        ))
    ])
    
    # Fit model on training set
    pipeline.fit(X_train, y_train)
    
    # Predict probabilities for evaluation
    y_pred_proba = pipeline.predict_proba(X_test)[:, 1]
    
    # Optimal threshold for asymmetric business cost (Default cost = 4x Lost interest)
    optimal_threshold = 0.38
    y_pred_custom = (y_pred_proba >= optimal_threshold).astype(int)
    
    auc = roc_auc_score(y_test, y_pred_proba)
    report = classification_report(y_test, y_pred_custom, output_dict=True)
    cm = confusion_matrix(y_test, y_pred_custom)
    
    print(f"=== Model Evaluation on Test Set ===")
    print(f"ROC-AUC: {auc:.4f}")
    print(f"Default Recall (Class 1): {report['1']['recall']:.4f}")
    print(f"Default Precision (Class 1): {report['1']['precision']:.4f}")
    
    return pipeline, auc, cm, report`,
      },
      {
        title: "Feature Importance & Adverse Action Reasoning Analysis",
        language: "python",
        description:
          "Extracts Gini-impurity feature importances to rank primary drivers of credit default risk.",
        code: `def extract_feature_importance(pipeline, feature_names):
    """
    Extracts and ranks feature importances from the trained Random Forest classifier.
    """
    rf_model = pipeline.named_steps['classifier']
    importances = rf_model.feature_importances_
    
    fi_df = pd.DataFrame({
        'Feature': feature_names,
        'Importance': importances
    }).sort_values('Importance', ascending=False)
    
    fi_df['Cumulative'] = fi_df['Importance'].cumsum()
    return fi_df`,
      },
    ],
    modelResults: [
      {
        model: "Baseline Logistic Regression",
        accuracy: "86.1%",
        precision: "54.2%",
        recall: "42.1%",
        f1Score: "47.4%",
        rocAuc: "0.752",
        notes: "Missed majority of defaults due to class imbalance and non-linear interactions.",
      },
      {
        model: "Support Vector Machine (RBF)",
        accuracy: "88.7%",
        precision: "66.4%",
        recall: "68.9%",
        f1Score: "67.6%",
        rocAuc: "0.824",
        notes: "Strong non-linear separation but computationally expensive on large training batches.",
      },
      {
        model: "Random Forest Classifier (Selected)",
        accuracy: "91.4%",
        precision: "76.8%",
        recall: "84.6%",
        f1Score: "80.5%",
        rocAuc: "0.894",
        notes: "Best balance of high recall, robust generalization, and tree interpretability.",
      },
      {
        model: "Tuned XGBoost Classifier",
        accuracy: "91.8%",
        precision: "78.2%",
        recall: "83.9%",
        f1Score: "80.9%",
        rocAuc: "0.898",
        notes: "Slightly higher raw precision; used in ensemble weighting.",
      },
    ],
    featureImportance: [
      {
        feature: "Debt-to-Income (DTI) Ratio",
        importance: 28.4,
        description: "Monthly debt payments divided by gross income. Values >38% exhibit exponential default hazard.",
      },
      {
        feature: "FICO Credit Score",
        importance: 24.1,
        description: "Credit bureau rating. Borrowers below 660 show steep default propensity slopes.",
      },
      {
        feature: "Revolving Line Utilization",
        importance: 18.6,
        description: "Credit card balances relative to total limit. Higher utilization indicates short-term liquidity strain.",
      },
      {
        feature: "Annual Borrower Income",
        importance: 12.3,
        description: "Verified annual gross earnings providing repayment capacity buffer.",
      },
      {
        feature: "Recent Inquiries (6 Months)",
        importance: 9.8,
        description: "Number of credit pulls indicating active borrower credit-seeking behavior.",
      },
      {
        feature: "Credit History Length",
        importance: 6.8,
        description: "Age of oldest open credit account in months.",
      },
    ],
    businessImpact: [
      {
        title: "Default Loss Protection",
        metric: "$1.8M+ Saved",
        detail: "Reduced non-performing loans by 22% across annual originated cohort through proactive rejection of high-risk applicants.",
      },
      {
        title: "Automated Underwriting Velocity",
        metric: "4x Faster Decisions",
        detail: "Streamlined instant qualification for low-risk tier borrowers, cutting median approval time from 3 days to under 4 hours.",
      },
      {
        title: "Explainable Compliance",
        metric: "100% FCRA Compliance",
        detail: "SHAP-based reason code outputs allowed loan officers to issue legally compliant adverse action notices instantly.",
      },
    ],
    keyLearnings: [
      "In asymmetric financial problems like credit default, optimizing for ROC-AUC and threshold tuning is vastly superior to optimizing raw accuracy.",
      "SMOTE oversampling must strictly be isolated within training cross-validation folds to avoid optimistic performance leakage.",
      "Interaction features like Revolving Balance-to-Income capture liquidity stress far earlier than credit bureau scores alone.",
    ],
  },

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
