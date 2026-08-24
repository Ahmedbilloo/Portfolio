import { createFileRoute, useParams } from "@tanstack/react-router";
import { ProjectDetailView } from "@/components/project-detail-view";

export const Route = createFileRoute("/projects/$slug")({
  component: DynamicProjectPage,
});

function DynamicProjectPage() {
  const { slug } = useParams({ from: "/projects/$slug" });
  return <ProjectDetailView slug={slug} />;
}
