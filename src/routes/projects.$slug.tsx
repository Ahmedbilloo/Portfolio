import { createFileRoute, useParams } from "@tanstack/react-router";
import { ProjectDetailView } from "@/components/project-detail-view";
import { RetailSalesIntelligence } from "@/components/projects/retail-sales-intelligence";
import { CustomerChurnPrediction } from "@/components/projects/customer-churn-prediction";
import { CardiovascularRiskPrediction } from "@/components/projects/cardiovascular-risk-prediction";

export const Route = createFileRoute("/projects/$slug")({
  component: DynamicProjectPage,
});

function DynamicProjectPage() {
  const { slug } = useParams({ from: "/projects/$slug" });

  if (slug === "retail-sales-intelligence") {
    return <RetailSalesIntelligence />;
  }

  if (slug === "customer-churn-prediction") {
    return <CustomerChurnPrediction />;
  }

  if (slug === "cardiovascular-risk-prediction") {
    return <CardiovascularRiskPrediction />;
  }

  return <ProjectDetailView slug={slug} />;
}
