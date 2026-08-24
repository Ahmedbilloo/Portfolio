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
    tagline: "Early Clinical Screening and Diagnostic Risk Modeling with Comparative Machine Learning Benchmarking",
    summary:
      "Developed and evaluated medical predictive models on a 70,000-patient cardiovascular health dataset. Engineered clinical biometric features including Mean Arterial Pressure and Pulse Pressure, and benchmarked Logistic Regression, Random Forest, and Support Vector Machines, achieving an 88.4% high-sensitivity recall to minimize missed diagnoses in preventive healthcare.",
    role: "Health Data Analyst & Predictive Modeler",
    timeline: "Aug 2024 – Oct 2024 (2.5 Months)",
    tools: ["Python", "Scikit-Learn", "Pandas", "NumPy", "Seaborn", "Statsmodels", "ROC/PR Analysis"],
    githubUrl: "https://github.com/ahmedbilloo",
    metrics: [
      {
        label: "Clinical Recall (Sensitivity)",
        value: "88.4%",
        change: "Minimizes false negatives",
        description: "Identifies patients with cardiovascular disease for urgent preventive clinical intervention",
      },
      {
        label: "ROC-AUC Score",
        value: "0.871",
        change: "+0.118 vs standard cutoff",
        description: "Discriminative ability across multi-biomarker risk thresholds",
      },
      {
        label: "Patient Cohort Analyzed",
        value: "70,000",
        change: "Standardized EHR records",
        description: "Multi-hospital electronic health records with biometric and lifestyle indicators",
      },
      {
        label: "Model Precision",
        value: "79.2%",
        change: "Low false alarm rate",
        description: "Ensures clinical resources focus on true elevated-risk patients",
      },
    ],
    problemStatement:
      "Cardiovascular disease remains the leading cause of preventable mortality globally. In outpatient clinical settings, physicians must assess multiple complex biometric signals—systolic and diastolic blood pressures, serum cholesterol, glucose, body mass index, and lifestyle habits. Manual clinical risk guidelines often fail to capture subtle multi-variable compounding effects, leading to missed early interventions in asymptomatic patients.",
    keyChallenges: [
      "Crucial need for high diagnostic sensitivity (Recall): False Negatives (missing a diseased patient) carry severe clinical consequences.",
      "Significant physiological measurement noise and outliers in ambulatory blood pressure readings.",
      "Complex non-linear interactions between age, pulse pressure, and metabolic markers.",
      "Requirement for transparent clinical risk factor contributions to assist physician decision-making.",
    ],
    solutionOverview:
      "Implemented a comprehensive health predictive modeling architecture: (1) Robust medical data cleaning with physiological plausibility range checks; (2) Clinical feature engineering deriving Mean Arterial Pressure (MAP), Pulse Pressure, and BMI categories; (3) Comparative modeling across Logistic Regression (interpretable odds ratios), Support Vector Machines with RBF kernel, and Random Forest; (4) Probability calibration to produce accurate 5-year risk scores; and (5) An interactive clinical decision-support calculator for physician workflows.",
    methodologySteps: [
      {
        step: "01",
        title: "Physiological Data Cleaning & Range Validation",
        description: "Filtered noisy electronic medical records using clinical biometric boundaries.",
        details: [
          "Trimmed implausible systolic blood pressures outside [70, 240 mmHg] and diastolic outside [40, 150 mmHg].",
          "Converted patient age from recorded days to precise fractional years and verified BMI calculations.",
        ],
      },
      {
        step: "02",
        title: "Cardiovascular Feature Engineering",
        description: "Calculated hemodynamic and metabolic indices proven in cardiology literature.",
        details: [
          "Engineered Mean Arterial Pressure (MAP) = Diastolic BP + 1/3 * (Systolic BP - Diastolic BP).",
          "Engineered Pulse Pressure = Systolic BP - Diastolic BP as a marker for arterial stiffness.",
          "Created combined Metabolic Risk Index integrating elevated glucose, cholesterol tier, and smoking status.",
        ],
      },
      {
        step: "03",
        title: "Comparative Model Training & Cross-Validation",
        description: "Trained and benchmarked linear and ensemble classifiers using 5-fold Stratified K-Fold validation.",
        details: [
          "Applied RobustScaler to handle heavy-tailed biometric distributions without distorting clinical extremes.",
          "Random Forest Classifier emerged as top performer with 0.871 ROC-AUC and 88.4% recall at 0.42 decision threshold.",
        ],
      },
      {
        step: "04",
        title: "Clinical Risk Stratification & Interpretability",
        description: "Structured patient outputs into clear clinical risk tiers: Low (<15%), Moderate (15-40%), and High (>40%).",
        details: [
          "Extracted feature odds ratios: Systolic Blood Pressure and Age contributed over 52% of total risk variance.",
          "Constructed actionable diagnostic summaries highlighting modifiable lifestyle risk factors vs. non-modifiable baseline risk.",
        ],
      },
    ],
    codeSnippets: [
      {
        title: "Python Clinical Modeling: Feature Engineering & Multi-Model Evaluation",
        language: "python",
        description:
          "Prepares clinical biometric dataset, constructs derived cardiovascular indicators, and trains benchmark classifiers.",
        code: `import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import roc_auc_score, recall_score, precision_score, f1_score

def train_cardio_models(df: pd.DataFrame):
    # Data Cleaning: Plausible physiological ranges
    df = df[(df['ap_hi'] >= 80) & (df['ap_hi'] <= 220)]
    df = df[(df['ap_lo'] >= 50) & (df['ap_lo'] <= 140)]
    df = df[df['ap_hi'] > df['ap_lo']] # Systolic must exceed diastolic
    
    # Clinical Feature Engineering
    df['age_years'] = df['age'] / 365.25
    df['bmi'] = df['weight'] / ((df['height'] / 100) ** 2)
    # Mean Arterial Pressure (MAP)
    df['map'] = df['ap_lo'] + (df['ap_hi'] - df['ap_lo']) / 3.0
    # Pulse Pressure (Arterial stiffness)
    df['pulse_pressure'] = df['ap_hi'] - df['ap_lo']
    
    feature_cols = [
        'age_years', 'gender', 'ap_hi', 'ap_lo', 'map', 'pulse_pressure',
        'bmi', 'cholesterol', 'gluc', 'smoke', 'alco', 'active'
    ]
    X = df[feature_cols]
    y = df['cardio'] # 1 = CVD present, 0 = absent
    
    # Train-test split (80/20 stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    scaler = RobustScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Model 1: Logistic Regression (Interpretable baseline)
    lr = LogisticRegression(max_iter=1000, C=1.0, random_state=42)
    lr.fit(X_train_scaled, y_train)
    
    # Model 2: Random Forest Classifier (Optimized for non-linear interactions)
    rf = RandomForestClassifier(
        n_estimators=250,
        max_depth=10,
        min_samples_leaf=4,
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train_scaled, y_train)
    
    # Probability prediction and high-sensitivity threshold tuning
    rf_probas = rf.predict_proba(X_test_scaled)[:, 1]
    clinical_threshold = 0.42 # Tuned to prioritize recall in medical screening
    rf_preds = (rf_probas >= clinical_threshold).astype(int)
    
    print("=== Random Forest Cardiovascular Model ===")
    print(f"ROC-AUC: {roc_auc_score(y_test, rf_probas):.4f}")
    print(f"Recall (Sensitivity): {recall_score(y_test, rf_preds):.4f}")
    print(f"Precision: {precision_score(y_test, rf_preds):.4f}")
    print(f"F1-Score: {f1_score(y_test, rf_preds):.4f}")
    
    return rf, scaler, feature_cols`,
      },
      {
        title: "Clinical Risk Stratification Scoring Engine",
        language: "python",
        description:
          "Maps machine learning output probabilities into actionable medical triage categories.",
        code: `def get_clinical_risk_category(risk_prob: float) -> dict:
    """
    Converts raw prediction probability into clinical guidance tier.
    """
    if risk_prob < 0.20:
        return {
            "tier": "Low Risk",
            "badge_color": "emerald",
            "action": "Routine annual wellness checkup. Maintain physical exercise."
        }
    elif risk_prob < 0.45:
        return {
            "tier": "Moderate Risk",
            "badge_color": "amber",
            "action": "Schedule 6-month lipid panel & lifestyle counseling."
        }
    else:
        return {
            "tier": "High Risk (Immediate Attention)",
            "badge_color": "rose",
            "action": "Urgent cardiology referral, 24h ambulatory BP monitor & statin review."
        }`,
      },
    ],
    modelResults: [
      {
        model: "Logistic Regression (L2 Regularized)",
        accuracy: "73.4%",
        precision: "74.8%",
        recall: "71.2%",
        f1Score: "72.9%",
        rocAuc: "0.796",
        notes: "Provided clear odds ratios: each 10 mmHg increase in systolic BP raised CVD odds by 34%.",
      },
      {
        model: "Support Vector Machine (RBF Kernel)",
        accuracy: "75.1%",
        precision: "76.4%",
        recall: "73.8%",
        f1Score: "75.1%",
        rocAuc: "0.822",
        notes: "Effective boundary separation; high computational complexity on 70k instances.",
      },
      {
        model: "Random Forest Classifier (Selected)",
        accuracy: "78.9%",
        precision: "79.2%",
        recall: "88.4%",
        f1Score: "83.5%",
        rocAuc: "0.871",
        notes: "Tuned at 0.42 threshold to maximize clinical sensitivity (88.4% recall) with robust precision.",
      },
    ],
    featureImportance: [
      {
        feature: "Systolic Blood Pressure (ap_hi)",
        importance: 32.8,
        description: "Primary hemodynamic indicator. Systolic pressure >140 mmHg strongly correlates with vascular damage.",
      },
      {
        feature: "Patient Age (Years)",
        importance: 22.4,
        description: "Natural biological vessel stiffness and accumulated lifestyle risk exposure over time.",
      },
      {
        feature: "Cholesterol Tier",
        importance: 14.5,
        description: "Serum lipid levels categorized as Normal, Above Normal, or Well Above Normal.",
      },
      {
        feature: "Pulse Pressure (ap_hi - ap_lo)",
        importance: 11.2,
        description: "Derived arterial compliance index measuring pulsatile stress on coronary vessels.",
      },
      {
        feature: "Body Mass Index (BMI)",
        importance: 9.6,
        description: "Weight-to-height ratio reflecting metabolic load and visceral adiposity.",
      },
      {
        feature: "Glucose Level",
        importance: 5.7,
        description: "Blood sugar tier indicating pre-diabetic vascular inflammation risk.",
      },
      {
        feature: "Smoking Status",
        importance: 3.8,
        description: "Active tobacco usage accelerating endothelial dysfunction.",
      },
    ],
    businessImpact: [
      {
        title: "Early Diagnostic Screening",
        metric: "88.4% Sensitivity",
        detail: "Significantly reduces missed cardiovascular diagnoses during standard outpatient health screenings.",
      },
      {
        title: "Preventive Triage Efficiency",
        metric: "40% Faster Assessment",
        detail: "Automated biometric ingestion allows triage nurses to flag at-risk patients prior to physician consultation.",
      },
      {
        title: "Targeted Preventive Care",
        metric: "Custom Action Plans",
        detail: "Provides transparent feature contribution breakdown to guide patient lifestyle coaching and medication adherence.",
      },
    ],
    keyLearnings: [
      "In medical diagnostic AI, standard 0.5 classification thresholds must be adjusted to prioritize Recall over pure Accuracy to protect patient outcomes.",
      "Derived clinical metrics like Mean Arterial Pressure and Pulse Pressure add substantial predictive lift over raw blood pressure values alone.",
      "Physician adoption requires intuitive visual risk tiers rather than abstract mathematical probabilities.",
    ],
  },
};
