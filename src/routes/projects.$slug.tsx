import { createFileRoute, useParams } from "@tanstack/react-router";
import { ProjectDetailView } from "@/components/project-detail-view";
import { RetailSalesIntelligence } from "@/components/projects/retail-sales-intelligence";

export const Route = createFileRoute("/projects/$slug")({
  component: DynamicProjectPage,
});

function DynamicProjectPage() {
  const { slug } = useParams({ from: "/projects/$slug" });

  if (slug === "retail-sales-intelligence") {
    return <RetailSalesIntelligence />;
  }

  return <ProjectDetailView slug={slug} />;
}
