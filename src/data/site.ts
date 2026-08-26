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
    slug: "business-intelligence-forecasting",
    to: "/projects/business-intelligence-forecasting",
    title: "Business Intelligence & Forecasting Platform",
    category: "Business Intelligence",
    description:
      "Developed an end-to-end BI and forecasting platform with interactive dashboards and automated reporting to optimize inventory planning and support data-driven decisions.",
    tech: ["Python", "SQL Server", "Tableau", "Tableau Prep"],
  },
  {
    slug: "loan-default-prediction",
    to: "/projects/loan-default-prediction",
    title: "Loan Default Prediction",
    category: "Machine Learning",
    description:
      "Developed and evaluated loan default prediction models using feature engineering and Random Forest classification to identify high-risk borrowers and support credit risk assessment.",
    tech: ["Python", "Scikit-learn", "Pandas", "Machine Learning"],
    codeUrl: "https://github.com/ahmedbilloo",
  },
  {
    slug: "cardiovascular-risk-prediction",
    to: "/projects/cardiovascular-risk-prediction",
    title: "Cardiovascular Disease Risk Prediction",
    category: "Machine Learning",
    description:
      "Built and evaluated Logistic Regression, Random Forest, and SVM models for cardiovascular disease risk prediction using feature engineering and performance-based model selection.",
    tech: ["Python", "Scikit-learn", "Pandas", "Machine Learning"],
    codeUrl: "https://github.com/ahmedbilloo",
  },
];
