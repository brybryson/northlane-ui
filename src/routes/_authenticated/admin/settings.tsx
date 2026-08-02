import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure global store options, API keys, and AI system behaviors.</p>
      </div>

      <div className="rounded-2xl border border-hairline bg-surface/50 p-8 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[400px]">
        <Settings className="h-8 w-8 mb-4 opacity-50" />
        <p>System settings panel is coming soon.</p>
        <p className="text-xs mt-2">Manage WooCommerce credentials, Groq model thresholds, and user access levels.</p>
      </div>
    </div>
  );
}
