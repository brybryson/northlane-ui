import { createFileRoute } from "@tanstack/react-router";
import { Tag } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/marketing")({
  component: MarketingPage,
});

function MarketingPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Marketing Campaigns</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage promotions, coupons, and email campaigns.</p>
      </div>

      <div className="rounded-2xl border border-hairline bg-surface/50 p-8 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[400px]">
        <Tag className="h-8 w-8 mb-4 opacity-50" />
        <p>Marketing module is coming soon.</p>
        <p className="text-xs mt-2">Discount code generation and banners will be available here.</p>
      </div>
    </div>
  );
}
