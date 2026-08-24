import { createFileRoute } from "@tanstack/react-router";
import { ProjectDetailView } from "@/components/project-detail-view";

const SLUG = "business-intelligence-forecasting";
const TITLE = "Business Intelligence & Demand Forecasting Platform — Ahmed Billoo";
const DESCRIPTION =
  "Automated demand forecasting and BI analytics platform for pharmaceutical distribution using Python, SQL Server, and Tableau.";

export const Route = createFileRoute("/projects/business-intelligence-forecasting")({
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
