import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Sparkles, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: DashboardOverview,
});

function DashboardOverview() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <div className="eyebrow mb-2">Studio Console</div>
        <h1 className="headline text-3xl font-semibold tracking-tight text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Here's what's happening with your store today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <KPICard title="Revenue Today" value="$2,430.00" trend="+14%" isPositive={true} icon={DollarSign} />
        <KPICard title="Orders Today" value="18" trend="+2" isPositive={true} icon={ShoppingCart} />
        <KPICard title="Active Customers" value="1,284" trend="+12%" isPositive={true} icon={Users} />
        <KPICard title="Conversion Rate" value="3.9%" trend="-0.4%" isPositive={false} icon={TrendingUp} />
        <KPICard title="AI Assisted Sales" value="41%" trend="+5%" isPositive={true} icon={Sparkles} />
        <KPICard title="Average Order Value" value="$128.50" trend="+$12" isPositive={true} icon={DollarSign} />
        <KPICard title="Inventory Alerts" value="12" alert={true} icon={AlertCircle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2 rounded-2xl border border-hairline bg-surface/50 p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-semibold tracking-tight">Revenue (Last 30 Days)</h3>
            <select className="text-xs border border-border bg-background rounded-lg px-2 py-1 outline-none">
              <option>Last 30 Days</option>
              <option>This Year</option>
              <option>All Time</option>
            </select>
          </div>
          <div className="h-[250px] w-full flex items-end justify-between gap-2">
            {/* Minimalist simulated bar chart */}
            {Array.from({ length: 30 }).map((_, i) => {
              const height = 20 + Math.random() * 80;
              return (
                <div key={i} className="w-full bg-muted/50 rounded-t-sm relative group hover:bg-foreground/20 transition-colors" style={{ height: `${height}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    ${Math.round(height * 10)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Activity Feed */}
        <div className="rounded-2xl border border-hairline bg-surface/50 p-6 flex flex-col">
          <h3 className="font-semibold tracking-tight mb-6 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            Live AI Activity
          </h3>
          <div className="flex-1 space-y-6">
            <ActivityItem time="10:31 AM" title="Customer searched 'MacBook charger'" status="Logged to Demand Intelligence" type="alert" />
            <ActivityItem time="10:28 AM" title="AI recommended Flow75 Keyboard" status="Customer added to cart" type="success" />
            <ActivityItem time="10:15 AM" title="Customer asked about shipping times" status="AI provided FAQ link" type="info" />
            <ActivityItem time="09:42 AM" title="Customer searched 'standing desk'" status="Logged to Demand Intelligence" type="alert" />
          </div>
          <button className="w-full mt-6 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors">
            View all activity
          </button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-2xl border border-hairline bg-surface/50 overflow-hidden">
        <div className="p-6 border-b border-hairline flex items-center justify-between">
          <h3 className="font-semibold tracking-tight">Recent Orders</h3>
          <button className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">View all orders</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground border-b border-hairline">
              <tr>
                <th className="px-6 py-4 font-medium">Order</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              <TableRow order="#1042" customer="John Doe" status="Paid" amount="$230.00" />
              <TableRow order="#1041" customer="Sarah Smith" status="Processing" amount="$120.50" />
              <TableRow order="#1040" customer="Michael Johnson" status="Paid" amount="$89.99" />
              <TableRow order="#1039" customer="Emily Chen" status="Refunded" amount="$45.00" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, trend, isPositive, alert, icon: Icon }: any) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface/50 p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between text-muted-foreground mb-4">
        <span className="text-xs font-medium">{title}</span>
        <Icon className="h-4 w-4 opacity-70" />
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
        {trend && (
          <span className={`text-xs font-medium flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend}
          </span>
        )}
        {alert && (
          <span className="text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">Requires attention</span>
        )}
      </div>
    </div>
  );
}

function ActivityItem({ time, title, status, type }: any) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`h-2 w-2 rounded-full mt-1.5 ${type === 'success' ? 'bg-green-500' : type === 'alert' ? 'bg-amber-500' : 'bg-blue-500'}`} />
        <div className="w-px h-full bg-border mt-2" />
      </div>
      <div>
        <div className="text-[10px] text-muted-foreground mb-1">{time}</div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground mt-1">{status}</div>
      </div>
    </div>
  );
}

function TableRow({ order, customer, status, amount }: any) {
  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-6 py-4 font-medium">{order}</td>
      <td className="px-6 py-4 text-muted-foreground">{customer}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
          status === 'Paid' ? 'bg-green-500/10 text-green-500' :
          status === 'Processing' ? 'bg-amber-500/10 text-amber-500' :
          'bg-muted text-muted-foreground'
        }`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-right font-medium">{amount}</td>
    </tr>
  );
}
