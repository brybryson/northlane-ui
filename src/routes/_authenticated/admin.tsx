import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin } from "@/lib/cms.functions";
import {
  Loader2, LogOut, Package, ShoppingCart, Users, Layers, Sparkles,
  TrendingUp, BarChart3, Settings, Activity, PenTool, Workflow, Tag,
  FileText, Menu, X, ChevronLeft, ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Dashboard — Northlane" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const NAV_GROUPS = [
  {
    label: "Commerce",
    items: [
      { name: "Overview",   to: "/admin",            icon: BarChart3,  exact: true },
      { name: "Orders",     to: "/admin/orders",      icon: ShoppingCart },
      { name: "Products",   to: "/admin/products",    icon: Package },
      { name: "Inventory",  to: "/admin/inventory",   icon: Layers },
      { name: "Customers",  to: "/admin/customers",   icon: Users },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { name: "AI Intelligence",  to: "/admin/ai-intelligence",  icon: Sparkles },
      { name: "Customer Demand",  to: "/admin/customer-demand",  icon: TrendingUp },
    ],
  },
  {
    label: "Operations",
    items: [
      { name: "Automation",  to: "/admin/automation",    icon: Workflow },
      { name: "Analytics",   to: "/admin/analytics",     icon: BarChart3 },
      { name: "Reports",     to: "/admin/reports",       icon: FileText },
      { name: "Content CMS", to: "/admin/cms",           icon: PenTool },
    ],
  },
  {
    label: "Marketing",
    items: [
      { name: "Campaigns", to: "/admin/marketing", icon: Tag },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Settings",      to: "/admin/settings",      icon: Settings },
      { name: "System Health", to: "/admin/system-health", icon: Activity },
    ],
  },
];

/* ─── Sidebar nav content (shared between desktop rail + mobile drawer) ─── */
function SidebarContent({
  collapsed,
  onNavClick,
}: {
  collapsed: boolean;
  onNavClick?: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto py-5 no-scrollbar">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="mb-6">
          {/* Group label — hidden when icon-only rail */}
          {!collapsed && (
            <h3 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
              {group.label}
            </h3>
          )}
          {collapsed && (
            /* Thin divider instead of label when collapsed */
            <div className="mx-3 mb-2 border-t border-hairline" />
          )}
          <nav className="space-y-0.5 px-2">
            {group.items.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                onClick={onNavClick}
                activeProps={{
                  className:
                    "text-foreground font-medium",
                }}
                inactiveProps={{
                  className:
                    "text-muted-foreground hover:text-foreground",
                }}
                activeOptions={{ exact: item.exact }}
                title={collapsed ? item.name : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0 opacity-75" />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            ))}
          </nav>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Layout ─── */
function AdminLayout() {
  const navigate = useNavigate();
  const checkAdmin = useServerFn(isAdmin);
  const [adminChecked, setAdminChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  // Desktop: collapsed rail vs full sidebar
  const [collapsed, setCollapsed] = useState(false);
  // Mobile: drawer open state
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    checkAdmin({})
      .then((r) => {
        setAllowed(r.isAdmin);
        setAdminChecked(true);
      })
      .catch(() => {
        setAdminChecked(true);
        setAllowed(false);
      });
  }, [checkAdmin]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (!adminChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-background">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">Not an editor</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account isn't marked as an admin editor. Ask an existing admin to grant you access.
          </p>
          <button
            onClick={handleSignOut}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-foreground/40 transition"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-accent selection:text-white">

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 flex flex-col
          border-r border-hairline bg-background shadow-2xl
          transition-transform duration-300 ease-out
          md:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Mobile drawer header */}
        <div className="flex h-14 items-center justify-between px-5 border-b border-hairline">
          <a href="/admin" className="flex items-center gap-2 text-[14px] font-semibold tracking-tight">
            <img src="/northlane-logo.png" alt="Northlane" className="h-10 w-10 rounded-md object-cover" />
            <span>Northlane</span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-muted-foreground uppercase">
              Console
            </span>
          </a>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <SidebarContent collapsed={false} onNavClick={() => setMobileOpen(false)} />

        <div className="p-4 border-t border-hairline">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut className="h-4 w-4 opacity-70" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Desktop sidebar ── */}
      <aside
        className={`
          hidden md:flex flex-col flex-shrink-0
          border-r border-hairline bg-surface/40
          transition-all duration-300 ease-out
          ${collapsed ? "w-[68px]" : "w-64"}
        `}
      >
        {/* Desktop header */}
        <div className={`h-14 flex items-center border-b border-hairline ${collapsed ? "justify-center px-0" : "justify-between px-5"}`}>
          {!collapsed ? (
            <a href="/admin" className="flex items-center gap-2 text-[14px] font-semibold tracking-tight transition hover:opacity-90">
              <img src="/northlane-logo.png" alt="Northlane" className="h-10 w-10 rounded-md object-cover" />
              <span>Northlane</span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-muted-foreground uppercase">
                Console
              </span>
            </a>
          ) : (
            <a href="/admin" title="Northlane Console" onClick={() => setCollapsed(false)} className="flex items-center justify-center">
              <img src="/northlane-logo.png" alt="Northlane" className="h-10 w-10 rounded-md object-cover" />
            </a>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <SidebarContent collapsed={collapsed} />

        {/* Sign out */}
        <div className={`p-3 border-t border-hairline ${collapsed ? "flex justify-center" : ""}`}>
          <button
            onClick={handleSignOut}
            title={collapsed ? "Sign out" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500 ${
              collapsed ? "justify-center w-full" : "w-full"
            }`}
          >
            <LogOut className="h-4 w-4 opacity-70 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-hairline bg-background/95 backdrop-blur-xl px-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <a href="/admin" className="flex items-center gap-2 text-[14px] font-semibold tracking-tight">
            <img src="/northlane-logo.png" alt="Northlane" className="h-9 w-9 rounded-md object-cover" />
            <span>Northlane</span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-muted-foreground uppercase">
              Console
            </span>
          </a>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

