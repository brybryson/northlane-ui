import { createFileRoute } from "@tanstack/react-router";
import { Workflow } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/automation")({
  component: AutomationPage,
});

function AutomationPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Automation Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your n8n visual workflows and integrations.</p>
      </div>

      <div className="rounded-2xl border border-hairline bg-surface/50 p-8 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[400px]">
        <Workflow className="h-8 w-8 mb-4 opacity-50" />
        <p>n8n Automation dashboard is coming soon.</p>
        <p className="text-xs mt-2">Monitor webhook statuses, error logs, and execution times here.</p>
      </div>
    </div>
  );
}
