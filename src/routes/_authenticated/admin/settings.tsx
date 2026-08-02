import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Settings,
  Store,
  Bot,
  Database,
  ShieldCheck,
  Check,
  Zap,
  Globe,
  DollarSign,
  Mail,
  Key,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [storeName, setStoreName] = useState("Northlane Studio");
  const [storeEmail, setStoreEmail] = useState("concierge@northlane.studio");
  const [currency, setCurrency] = useState("USD ($)");
  const [aiModel, setAiModel] = useState("groq-llama-3.3-70b");
  const [groqKeySet, setGroqKeySet] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("System and store configurations saved successfully!");
    }, 400);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System & Store Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure store identity, AI engine API integrations, database connections, and security rules.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Store Profile Settings */}
        <div className="p-6 rounded-2xl bg-surface/70 border border-hairline space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Store className="w-4 h-4 text-accent" />
            Store Details & Localization
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-hairline text-xs focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Support Email</label>
              <input
                type="email"
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-hairline text-xs focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Base Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full sm:w-1/2 px-3.5 py-2 rounded-xl bg-background border border-hairline text-xs focus:outline-none focus:border-accent"
            >
              <option value="USD ($)">USD ($) — United States Dollar</option>
              <option value="EUR (€)">EUR (€) — Euro</option>
              <option value="GBP (£)">GBP (£) — British Pound</option>
            </select>
          </div>
        </div>

        {/* AI Shopping Assistant Integration */}
        <div className="p-6 rounded-2xl bg-surface/70 border border-hairline space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-500" />
            AI Assistant Engine Configuration
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Selected LLM Model Provider</label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-hairline text-xs focus:outline-none focus:border-accent"
              >
                <option value="groq-llama-3.3-70b">Groq — Llama 3.3 70B Versatile (Ultra-Fast 600 tps)</option>
                <option value="groq-mixtral-8x7b">Groq — Mixtral 8x7B Instruct</option>
                <option value="openai-gpt4o">OpenAI — GPT-4o Commerce Engine</option>
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-background border border-hairline flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Key className="w-4 h-4 text-accent" />
                <div>
                  <span className="text-xs font-semibold block">GROQ_API_KEY</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {groqKeySet ? "Configured in Environment Variables (.env)" : "Not Configured"}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-mono font-medium">
                Active & Connected
              </span>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="p-6 rounded-2xl bg-surface/70 border border-hairline space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" />
            Database & Cloud Services
          </h3>

          <div className="p-3 rounded-xl bg-background border border-hairline flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Supabase Cloud Database (PostgreSQL 14.5)</span>
            </div>
            <span className="font-mono text-emerald-600 font-medium">Connected</span>
          </div>

          <div className="p-3 rounded-xl bg-background border border-hairline flex items-center justify-between text-xs opacity-80">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span>WooCommerce REST API Sync Engine</span>
            </div>
            <span className="font-mono text-amber-600 font-medium">Standby / Ready</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-foreground text-background font-semibold text-xs transition-colors shadow-md disabled:opacity-50"
          >
            {isSaving ? "Saving Configuration..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
