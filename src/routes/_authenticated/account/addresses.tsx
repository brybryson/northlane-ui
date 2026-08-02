import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SavedAddressesSection } from "@/components/account/SavedAddressesSection";

export const Route = createFileRoute("/_authenticated/account/addresses")({
  head: () => ({
    meta: [
      { title: "Saved Addresses — Northlane Studio" },
      { name: "description", content: "Manage delivery destinations with Google Places autocomplete for fast 1-click checkout." },
    ],
  }),
  component: AddressesPage,
});

function AddressesPage() {
  return (
    <div className="space-y-6">
      <Link
        to="/account"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Account Overview</span>
      </Link>

      <SavedAddressesSection />
    </div>
  );
}
