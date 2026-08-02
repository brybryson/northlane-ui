import { createFileRoute } from "@tanstack/react-router";
import { Activity, CheckCircle, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/system-health")({
  component: SystemHealthPage,
});

function SystemHealthPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System Health</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor the connection and latency of your integration APIs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <HealthCard service="WooCommerce REST API" status="healthy" latency="142ms" />
        <HealthCard service="Supabase Database" status="healthy" latency="45ms" />
        <HealthCard service="Groq LLM Service" status="healthy" latency="820ms" />
        <HealthCard service="n8n Workflows" status="healthy" latency="65ms" />
        <HealthCard service="SMTP Email Server" status="healthy" latency="110ms" />
        <HealthCard service="Payment Gateways" status="degraded" latency="1840ms" note="Slightly higher latency detected" />
      </div>
    </div>
  );
}

function HealthCard({ service, status, latency, note }: any) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface/50 p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-foreground/90">{service}</span>
          {status === 'healthy' ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
              <CheckCircle className="h-3 w-3" /> Healthy
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
              <AlertTriangle className="h-3 w-3" /> Degraded
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Response Latency: <span className="font-semibold text-foreground">{latency}</span>
        </div>
      </div>
      {note && (
        <div className="mt-4 text-[10px] text-amber-600 bg-amber-500/5 border border-amber-500/10 p-2 rounded-lg">
          {note}
        </div>
      )}
    </div>
  );
}
