import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronLeft,
  Loader2,
  ShoppingBag,
  Building,
  User,
  Mail,
  MapPin,
  Globe,
} from "lucide-react";
import { useCart } from "../context/cart-context";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, discountAmount, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex.morgan@northlane.studio",
    address: "742 Evergreen Terrace",
    city: "San Francisco",
    state: "CA",
    zip: "94107",
    country: "United States",
  });

  const [shippingMethod, setShippingMethod] = useState<"standard" | "express" | "priority">("express");

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "4242 •••• •••• 4242",
    expDate: "12/28",
    cvc: "888",
    nameOnCard: "Alex Morgan",
  });

  const shippingCost = shippingMethod === "standard" ? 0 : shippingMethod === "express" ? 15 : 30;
  const grandTotal = total + shippingCost;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!shippingInfo.firstName || !shippingInfo.email || !shippingInfo.address) {
        toast.error("Please fill in all required shipping fields");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const orderId = `NL-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Pass order summary state to success page
      const orderSummary = {
        orderId,
        items,
        shippingInfo,
        shippingMethod,
        grandTotal,
        date: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      };

      localStorage.setItem("northlane_last_order", JSON.stringify(orderSummary));
      clearCart();
      toast.success("Payment authorized! Order confirmed.");
      navigate({ to: "/checkout/success" });
    }, 1800);
  };

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground opacity-40" />
          <h2 className="text-xl font-semibold">Your bag is empty</h2>
          <p className="text-sm text-muted-foreground">Add items to your bag before proceeding to checkout.</p>
          <Button onClick={() => navigate({ to: "/shop" })} className="bg-foreground text-background">
            Return to Shop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Header Bar */}
      <header className="border-b border-hairline bg-surface/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight text-lg">
            <span className="h-7 w-7 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-sm">
              N
            </span>
            NORTHLANE
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Lock className="h-3.5 w-3.5 text-emerald-500" /> Secure SSL Checkout
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Progress Tracker */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-hairline z-0" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-foreground transition-all duration-300 z-0"
              style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
            />

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center gap-1.5 bg-background px-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= 1 ? "bg-foreground text-background" : "bg-surface border border-hairline text-muted-foreground"
                }`}
              >
                1
              </div>
              <span className="text-xs font-medium">Shipping</span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center gap-1.5 bg-background px-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= 2 ? "bg-foreground text-background" : "bg-surface border border-hairline text-muted-foreground"
                }`}
              >
                2
              </div>
              <span className="text-xs font-medium">Method</span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center gap-1.5 bg-background px-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === 3 ? "bg-foreground text-background" : "bg-surface border border-hairline text-muted-foreground"
                }`}
              >
                3
              </div>
              <span className="text-xs font-medium">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Step Section */}
          <div className="lg:col-span-7 space-y-6">
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-4 rounded-2xl border border-hairline bg-surface/30 p-6">
                  <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" /> Contact & Delivery Address
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-xs font-medium">First Name</Label>
                      <Input
                        id="firstName"
                        value={shippingInfo.firstName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                        required
                        className="bg-background text-xs rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-xs font-medium">Last Name</Label>
                      <Input
                        id="lastName"
                        value={shippingInfo.lastName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                        required
                        className="bg-background text-xs rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium">Email Address (for order tracking)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                      required
                      className="bg-background text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-xs font-medium">Street Address</Label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      required
                      className="bg-background text-xs rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-xs font-medium">City</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        required
                        className="bg-background text-xs rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="state" className="text-xs font-medium">State / Province</Label>
                      <Input
                        id="state"
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                        required
                        className="bg-background text-xs rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <Label htmlFor="zip" className="text-xs font-medium">Postal Code</Label>
                      <Input
                        id="zip"
                        value={shippingInfo.zip}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                        required
                        className="bg-background text-xs rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Link to="/cart" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <ChevronLeft className="h-4 w-4" /> Return to Cart
                  </Link>
                  <Button type="submit" className="bg-foreground text-background hover:bg-foreground/90 rounded-xl">
                    Continue to Shipping Method <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleNextStep} className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-4 rounded-2xl border border-hairline bg-surface/30 p-6">
                  <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" /> Select Delivery Option
                  </h2>

                  <RadioGroup
                    value={shippingMethod}
                    onValueChange={(v) => setShippingMethod(v as any)}
                    className="space-y-3"
                  >
                    <label className="flex items-center justify-between p-4 rounded-xl border border-hairline bg-background hover:border-foreground/30 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="standard" id="standard" />
                        <div>
                          <p className="text-sm font-medium">Standard Ground Courier</p>
                          <p className="text-xs text-muted-foreground">3-5 business days</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold">Free</span>
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-xl border border-foreground bg-background hover:border-foreground transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="express" id="express" />
                        <div>
                          <p className="text-sm font-medium flex items-center gap-2">
                            Express Air Dispatch <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full">RECOMMENDED</span>
                          </p>
                          <p className="text-xs text-muted-foreground">1-2 business days with insured tracking</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold">$15.00</span>
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-xl border border-hairline bg-background hover:border-foreground/30 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="priority" id="priority" />
                        <div>
                          <p className="text-sm font-medium">Priority Studio White-Glove</p>
                          <p className="text-xs text-muted-foreground">Same-day / Next-day morning delivery</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold">$30.00</span>
                    </label>
                  </RadioGroup>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back to Shipping
                  </button>
                  <Button type="submit" className="bg-foreground text-background hover:bg-foreground/90 rounded-xl">
                    Continue to Payment <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handlePlaceOrder} className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-4 rounded-2xl border border-hairline bg-surface/30 p-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" /> Payment Method
                    </h2>
                    <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Encrypted Stripe Checkout
                    </span>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="cardName" className="text-xs font-medium">Name on Card</Label>
                      <Input
                        id="cardName"
                        value={paymentInfo.nameOnCard}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, nameOnCard: e.target.value })}
                        required
                        className="bg-background text-xs rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="cardNumber" className="text-xs font-medium">Card Number</Label>
                      <div className="relative">
                        <Input
                          id="cardNumber"
                          value={paymentInfo.cardNumber}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                          required
                          className="bg-background text-xs rounded-xl pr-10"
                        />
                        <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="expDate" className="text-xs font-medium">Expiration Date</Label>
                        <Input
                          id="expDate"
                          placeholder="MM/YY"
                          value={paymentInfo.expDate}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, expDate: e.target.value })}
                          required
                          className="bg-background text-xs rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cvc" className="text-xs font-medium">CVC / CVV</Label>
                        <Input
                          id="cvc"
                          placeholder="3 digits"
                          value={paymentInfo.cvc}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, cvc: e.target.value })}
                          required
                          className="bg-background text-xs rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={isProcessing}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back to Delivery
                  </button>
                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="bg-foreground text-background hover:bg-foreground/90 rounded-xl h-12 px-8 font-semibold text-sm"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing Order...
                      </>
                    ) : (
                      <>
                        Authorize & Pay ${grandTotal.toFixed(2)}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-hairline bg-surface/40 p-6 space-y-6">
              <h3 className="text-base font-semibold tracking-tight border-b border-hairline pb-3">
                Cart Summary ({items.reduce((acc, i) => acc + i.quantity, 0)} items)
              </h3>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 divide-y divide-hairline">
                {items.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-14 w-14 rounded-lg border border-hairline object-cover bg-surface"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-hairline pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-500 font-medium">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-foreground font-medium">
                    {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-hairline pt-3 flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
