import { createFileRoute } from "@tanstack/react-router";
import { ProjectDetailView } from "@/components/project-detail-view";

const SLUG = "loan-default-prediction";
const TITLE = "Loan Default Prediction & Credit Risk Scoring — Ahmed Billoo";
const DESCRIPTION =
  "Machine learning credit risk scoring models on a 50,000+ borrower portfolio using Python, Scikit-learn, SMOTE, and Random Forest.";

export const Route = createFileRoute("/projects/loan-default-prediction")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: () => <ProjectDetailView slug={SLUG} />,
});
