import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/projects/business-intelligence-forecasting")({
  component: () => <Navigate to="/" hash="projects" replace />,
});
