import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/projects/loan-default-prediction")({
  component: () => <Navigate to="/" hash="projects" replace />,
});
