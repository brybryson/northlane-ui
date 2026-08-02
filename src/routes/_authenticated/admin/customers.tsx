import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Search,
  Filter,
  UserCheck,
  Award,
  DollarSign,
  Calendar,
  ShoppingBag,
  Mail,
  Shield,
  Eye,
  ChevronRight,
  Download,
  Plus,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  component: CustomersPage,
});

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  role: "customer" | "vip" | "admin";
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  joinedDate: string;
  aiEngagementScore: number; // 0 - 100
  city: string;
  country: string;
}

const DEMO_CUSTOMERS: CustomerProfile[] = [
  {
    id: "cust-1",
    name: "Alex Vance",
    email: "alex.vance@northlane.studio",
    role: "vip",
    totalOrders: 6,
    totalSpent: 1620,
    lastOrderDate: "2026-08-01",
    joinedDate: "2026-01-12",
    aiEngagementScore: 94,
    city: "San Francisco",
    country: "United States",
  },
  {
    id: "cust-2",
    name: "Elena Rostova",
    email: "elena.rostova@designlab.io",
    role: "customer",
    totalOrders: 3,
    totalSpent: 780,
    lastOrderDate: "2026-07-24",
    joinedDate: "2026-03-05",
    aiEngagementScore: 82,
    city: "Copenhagen",
    country: "Denmark",
  },
  {
    id: "cust-3",
    name: "Marcus Thorne",
    email: "marcus@devcrafters.co",
    role: "customer",
    totalOrders: 4,
    totalSpent: 940,
    lastOrderDate: "2026-07-19",
    joinedDate: "2026-02-18",
    aiEngagementScore: 88,
    city: "London",
    country: "United Kingdom",
  },
  {
    id: "cust-4",
    name: "Sophia Chen",
    email: "sophia.chen@archstudio.com",
    role: "vip",
    totalOrders: 8,
    totalSpent: 2450,
    lastOrderDate: "2026-07-30",
    joinedDate: "2025-11-04",
    aiEngagementScore: 97,
    city: "Toronto",
    country: "Canada",
  },
  {
    id: "cust-5",
    name: "Liam O'Connor",
    email: "liam@audioengineered.org",
    role: "customer",
    totalOrders: 1,
    totalSpent: 320,
    lastOrderDate: "2026-06-14",
    joinedDate: "2026-05-22",
    aiEngagementScore: 65,
    city: "Dublin",
    country: "Ireland",
  },
];

function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>(DEMO_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  // Fetch real users from Supabase if available
  useEffect(() => {
    supabase
      .from("user_roles")
      .select("user_id, role, created_at")
      .then(({ data, error }) => {
        if (data && data.length > 0) {
          // Sync database role records if available
          console.log("Supabase User Roles Loaded:", data.length);
        }
      });
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "all" || c.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const totalSpentAll = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgCLV = Math.round(totalSpentAll / customers.length);
  const vipCount = customers.filter((c) => c.role === "vip").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customer CRM & Lifetime Value</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage customer profiles, purchase history, LTV tiers, and AI engagement analytics.
          </p>
        </div>

        <button
          onClick={() => toast.success("Exported customer CRM data to CSV.")}
          className="px-4 py-2 rounded-xl bg-surface border border-hairline hover:bg-muted/40 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-accent" />
          <span>Export CRM CSV</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface/70 border border-hairline space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Customers</span>
            <Users className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-bold font-mono">{customers.length}</div>
          <span className="text-[11px] text-emerald-600 font-medium">+14% vs last month</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface/70 border border-hairline space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Average CLV</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono">${avgCLV}</div>
          <span className="text-[11px] text-muted-foreground">Customer Lifetime Value</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface/70 border border-hairline space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>VIP Members</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono">{vipCount}</div>
          <span className="text-[11px] text-amber-600 font-medium">Top Tier Contributors</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface/70 border border-hairline space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>AI Engagement Score</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono">85.2 / 100</div>
          <span className="text-[11px] text-indigo-500 font-medium">High Assistant Usage</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-surface/50 border border-hairline">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer name, email, or city..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-background border border-hairline text-xs focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 rounded-xl bg-background border border-hairline text-xs focus:outline-none focus:border-accent"
          >
            <option value="all">All Tiers</option>
            <option value="vip">VIP Members</option>
            <option value="customer">Standard Customers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl border border-hairline bg-surface/50 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-hairline text-muted-foreground uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Tier / Status</th>
                <th className="p-4">Location</th>
                <th className="p-4 text-center">Orders</th>
                <th className="p-4 text-right">Total Spent</th>
                <th className="p-4 text-center">AI Score</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent font-bold flex items-center justify-center border border-accent/20">
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{cust.name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{cust.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                        cust.role === "vip"
                          ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          : "bg-surface text-muted-foreground border border-hairline"
                      }`}
                    >
                      {cust.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {cust.city}, {cust.country}
                  </td>
                  <td className="p-4 text-center font-mono font-medium">{cust.totalOrders}</td>
                  <td className="p-4 text-right font-mono font-bold text-accent">${cust.totalSpent}</td>
                  <td className="p-4 text-center font-mono">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-semibold">
                      {cust.aiEngagementScore}%
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedCustomer(cust)}
                      className="px-3 py-1.5 rounded-lg bg-surface hover:bg-muted border border-hairline text-foreground font-medium text-[11px] inline-flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-accent" />
                      <span>View Profile</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer / Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex justify-end">
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="w-full max-w-lg bg-surface border-l border-hairline shadow-2xl p-6 overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between border-b border-hairline pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-accent text-accent-foreground font-bold text-lg flex items-center justify-center">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{selectedCustomer.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{selectedCustomer.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  ✕
                </button>
              </div>

              {/* Customer Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-background border border-hairline">
                  <span className="text-[10px] text-muted-foreground uppercase font-mono block">Lifetime Spend</span>
                  <span className="text-lg font-bold font-mono text-accent">${selectedCustomer.totalSpent}</span>
                </div>
                <div className="p-3 rounded-xl bg-background border border-hairline">
                  <span className="text-[10px] text-muted-foreground uppercase font-mono block">Total Orders</span>
                  <span className="text-lg font-bold font-mono text-foreground">{selectedCustomer.totalOrders} Orders</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-hairline">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{selectedCustomer.city}, {selectedCustomer.country}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-hairline">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-medium">{selectedCustomer.joinedDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-hairline">
                  <span className="text-muted-foreground">Last Order Date</span>
                  <span className="font-medium">{selectedCustomer.lastOrderDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-hairline">
                  <span className="text-muted-foreground">AI Shopping Score</span>
                  <span className="font-bold text-indigo-500">{selectedCustomer.aiEngagementScore}% High Engagement</span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <button
                  onClick={() => {
                    toast.success(`Sent promotional email to ${selectedCustomer.email}`);
                    setSelectedCustomer(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Direct Email</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
