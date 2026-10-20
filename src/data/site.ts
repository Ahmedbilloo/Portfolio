export const site = {
  name: "Ahmed Billoo",
  role: "Data Analyst",
  headshot: "/headshot.jpg",
  email: "ajawed1995@gmail.com",
  phone: "+1 (747) 252-3297",
  linkedin: "https://www.linkedin.com/in/ahmedbilloo",
  github: "https://github.com/ahmedbilloo",
  resumeUrl: "https://raw.githubusercontent.com/Ahmedbilloo/Portfolio/main/public/Ahmed%20Billoo%20Resume.pdf",
  domain: "https://ahmedbilloo.com",
};

export const navLinks = [
  { label: "Projects", hash: "projects" },
  { label: "Experience", hash: "experience" },
  { label: "Education", hash: "education" },
  { label: "Skills", hash: "skills" },
  { label: "Contact", hash: "contact" },
] as const;

export type ProjectSummary = {
  slug: string;
  to: string;
  title: string;
  category: string;
  description: string;
  tech: string[];
  codeUrl?: string;
};

export const projects: ProjectSummary[] = [
    {
      slug: "retail-sales-intelligence",
      to: "/projects/retail-sales-intelligence",
      title: "Retail Sales Intelligence & Customer Analytics",
      category: "Business Analytics",
      description:
        "Analysis of 541,909 UCI retail transactions to quantify sales performance, customer value, product concentration, seasonality, and market opportunities using Python.",
      tech: ["Python", "Pandas", "NumPy", "Matplotlib", "Seaborn"],
    },
    {
      slug: "cardiovascular-risk-prediction",
      to: "/projects/cardiovascular-risk-prediction",
      title: "Cardiovascular Disease Risk Prediction",
      category: "Machine Learning",
      description:
        "Compared Logistic Regression, Decision Tree, Random Forest, Gradient Boosting and XGBoost on 68,205 processed patient records, with model evaluation and a data dictionary.",
      tech: ["Python", "Scikit-learn", "Pandas", "XGBoost", "Machine Learning"],
      codeUrl: "https://github.com/Ahmedbilloo/Portfolio/blob/main/notebooks/cardiovascular-disease-risk-prediction.ipynb",
    },
    {
      slug: "customer-churn-prediction",
      to: "/projects/customer-churn-prediction",
      title: "Customer Churn Prediction & Retention Analytics",
      category: "Machine Learning",
      description:
        "Built churn prediction models on 125,000 streaming subscribers to identify behavioral patterns associated with churn and compare classification performance.",
      tech: ["Python", "Pandas", "Scikit-learn", "Decision Tree", "Random Forest", "Gradient Boosting"],
    },

];
