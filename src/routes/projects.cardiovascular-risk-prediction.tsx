import { createFileRoute } from "@tanstack/react-router";
import { ProjectDetailView } from "@/components/project-detail-view";

const SLUG = "cardiovascular-risk-prediction";
const TITLE = "Cardiovascular Disease Risk Prediction — Ahmed Billoo";
const DESCRIPTION =
  "Cardiovascular disease diagnostic risk modeling and clinical sensitivity benchmarking with Logistic Regression, SVM, and Random Forest.";

export const Route = createFileRoute("/projects/cardiovascular-risk-prediction")({
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
