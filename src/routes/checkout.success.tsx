import React, { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Package, ArrowRight, ShieldCheck, Printer, Home } from "lucide-react";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/checkout/success")({
  component: CheckoutSuccessPage,
});

function CheckoutSuccessPage() {
  const [order, setOrder] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("northlane_last_order");
      if (saved) {
        setOrder(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">No active order found</h2>
          <Button onClick={() => navigate({ to: "/shop" })} className="bg-foreground text-background">
            Return to Shop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-hairline bg-surface/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight text-lg">
            <span className="h-7 w-7 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-sm">
              N
            </span>
            NORTHLANE
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-500">
            <CheckCircle2 className="h-4 w-4" /> Order Confirmed
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full space-y-8">
        {/* Success Banner */}
        <div className="text-center space-y-3">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Thank you for your order!</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Your studio setup essentials are being prepared for dispatch. We've sent a detailed confirmation receipt to{" "}
            <span className="font-semibold text-foreground">{order.shippingInfo.email}</span>.
          </p>
        </div>

        {/* Receipt Card */}
        <div className="rounded-2xl border border-hairline bg-surface/40 overflow-hidden divide-y divide-hairline">
          {/* Header Specs */}
          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-surface/60 text-xs">
            <div>
              <span className="text-muted-foreground block">Order ID</span>
              <span className="font-mono font-semibold text-foreground">{order.orderId}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Date</span>
              <span className="font-semibold text-foreground">{order.date}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Total Amount</span>
              <span className="font-semibold text-foreground">${order.grandTotal.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Payment Status</span>
              <span className="font-semibold text-emerald-500">Paid (Stripe)</span>
            </div>
          </div>

          {/* Items Purchased */}
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-semibold tracking-tight">Items Included</h3>
            <div className="divide-y divide-hairline">
              {order.items.map((item: any) => (
                <div key={item.id} className="py-3 first:pt-0 flex gap-4 items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-14 w-14 rounded-xl border border-hairline object-cover bg-surface shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Details */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <h4 className="font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <Package className="h-4 w-4 text-muted-foreground" /> Shipping Address
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                <br />
                {order.shippingInfo.address}
                <br />
                {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zip}
                <br />
                {order.shippingInfo.country}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Fulfillment Guarantee
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Tracked Express Air Dispatch. Estimated delivery date:{" "}
                <span className="text-foreground font-semibold">3-4 Business Days</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="w-full sm:w-auto text-xs rounded-xl border-hairline"
          >
            <Printer className="h-3.5 w-3.5 mr-2" /> Print Receipt
          </Button>

          <Button
            onClick={() => navigate({ to: "/shop" })}
            className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 text-xs rounded-xl"
          >
            <Home className="h-3.5 w-3.5 mr-2" /> Return to Catalog
          </Button>
        </div>
      </main>
    </div>
  );
}
