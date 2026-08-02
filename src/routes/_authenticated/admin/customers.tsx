import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">View customer profiles, LTV, and AI engagement scores.</p>
      </div>

      <div className="rounded-2xl border border-hairline bg-surface/50 p-8 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[400px]">
        <Users className="h-8 w-8 mb-4 opacity-50" />
        <p>Customer management module is coming soon.</p>
        <p className="text-xs mt-2">View complete CRM profiles and purchase histories here.</p>
      </div>
    </div>
  );
}
