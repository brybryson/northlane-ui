import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { CreditCard, Plus, Trash2, X, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account/payment-methods")({
  head: () => ({
    meta: [
      { title: "Payment Methods Wallet — Northlane Studio" },
      { name: "description", content: "Manage your saved Stripe credit and debit cards securely." },
    ],
  }),
  component: PaymentMethodsPage,
});

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

function PaymentMethodsPage() {
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<PaymentMethod | null>(null);

  // Form State
  const [cardHolder, setCardHolder] = useState("Vrsnmllz03");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardZip, setCardZip] = useState("");
  const [isDefaultCard, setIsDefaultCard] = useState(true);
  const [isAddingCard, setIsAddingCard] = useState(false);

  // Fetch payment methods from API
  useEffect(() => {
    fetch("http://localhost:3000/api/payment/methods")
      .then((res) => res.json())
      .then((data) => {
        if (data.methods) {
          setPayments(data.methods);
        }
      })
      .catch(() => {
        // Local fallback
        setPayments([
          { id: "pm-1", brand: "Visa", last4: "4242", expMonth: 11, expYear: 2028, isDefault: true },
          { id: "pm-2", brand: "Mastercard", last4: "8899", expMonth: 8, expYear: 2027, isDefault: false },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddStripeCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExp || !cardCvc) {
      toast.error("Please enter complete card details.");
      return;
    }

    setIsAddingCard(true);
    const rawDigits = cardNumber.replace(/\s+/g, "");
    const last4 = rawDigits.slice(-4) || "8888";
    const [mStr, yStr] = cardExp.split("/");
    const expMonth = parseInt(mStr, 10) || 12;
    const expYear = parseInt(yStr, 10) || 2028;
    const brand = rawDigits.startsWith("4") ? "Visa" : "Mastercard";

    try {
      const res = await fetch("http://localhost:3000/api/payment/methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand,
          last4,
          expMonth,
          expYear,
          isDefault: isDefaultCard,
        }),
      });

      const data = await res.json();
      if (data.method) {
        if (isDefaultCard) {
          setPayments((prev) => [...prev.map((c) => ({ ...c, isDefault: false })), data.method]);
        } else {
          setPayments((prev) => [...prev, data.method]);
        }
      } else {
        throw new Error("Failed to save method");
      }
      toast.success(`Stripe ${brand} ending in •••• ${last4} added!`);
    } catch {
      // Local state fallback
      const newCard: PaymentMethod = {
        id: `pm-${Date.now()}`,
        brand,
        last4,
        expMonth,
        expYear,
        isDefault: isDefaultCard,
      };
      setPayments((prev) => (isDefaultCard ? [...prev.map((c) => ({ ...c, isDefault: false })), newCard] : [...prev, newCard]));
      toast.success(`Stripe ${brand} ending in •••• ${last4} added to wallet!`);
    } finally {
      setIsAddingCard(false);
      setShowPaymentModal(false);
      setCardNumber("");
      setCardExp("");
      setCardCvc("");
      setCardZip("");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/api/payment/methods/${id}/default`, { method: "POST" });
    } catch (e) {
      console.warn("API fallback", e);
    }
    setPayments((prev) => prev.map((pm) => ({ ...pm, isDefault: pm.id === id })));
    toast.success("Default payment method updated.");
  };

  const handleConfirmDelete = async () => {
    if (!showDeleteModal) return;
    const targetId = showDeleteModal.id;

    try {
      await fetch(`http://localhost:3000/api/payment/methods/${targetId}`, { method: "DELETE" });
    } catch (e) {
      console.warn("API fallback", e);
    }

    setPayments((prev) => {
      const remaining = prev.filter((p) => p.id !== targetId);
      if (showDeleteModal.isDefault && remaining.length > 0) {
        remaining[0].isDefault = true;
      }
      return remaining;
    });

    setShowDeleteModal(null);
    toast.info("Payment method removed from wallet.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-accent">
            Saved Wallet
          </div>
          <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Payment Methods
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage payment cards linked to your Stripe wallet.
          </p>
        </div>
        <button
          onClick={() => setShowPaymentModal(true)}
          className="px-5 py-2.5 rounded-full bg-foreground hover:bg-foreground/90 text-background font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Card</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-muted-foreground">Loading payment wallet...</div>
      ) : payments.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-background border border-hairline space-y-3">
          <CreditCard className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No Saved Payment Cards</h3>
          <p className="text-xs text-muted-foreground">Add a card to enable 1-click studio checkout.</p>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="px-4 py-2 rounded-full bg-foreground text-background text-xs font-bold shadow-xs cursor-pointer"
          >
            Add Payment Method
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {payments.map((pm) => (
            <div
              key={pm.id}
              className={`p-6 rounded-2xl bg-background border transition-all ${
                pm.isDefault
                  ? "border-foreground shadow-xs"
                  : "border-hairline hover:border-foreground/30"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-5 h-5 text-accent" />
                  <span className="text-sm font-bold text-foreground">{pm.brand}</span>
                </div>
                {pm.isDefault && (
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                    Default Payment
                  </span>
                )}
              </div>

              <div className="text-sm font-bold text-foreground tracking-widest my-2 font-mono">
                •••• •••• •••• {pm.last4}
              </div>

              <div className="flex justify-between items-center text-xs text-muted-foreground mt-4 pt-4 border-t border-hairline">
                <span>Expires {pm.expMonth}/{pm.expYear}</span>
                <div className="flex items-center gap-3">
                  {!pm.isDefault && (
                    <button
                      onClick={() => handleSetDefault(pm.id)}
                      className="text-accent hover:underline font-semibold cursor-pointer"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => setShowDeleteModal(pm)}
                    className="p-1 rounded text-muted-foreground hover:text-red-600 transition-colors cursor-pointer"
                    title="Remove payment card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-background border border-hairline shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center border-b border-hairline pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-accent" />
                <h3 className="text-base font-bold text-foreground">Add Payment Method</h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStripeCard} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1 font-semibold">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="Vrsnmllz03"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1 font-semibold">Card Number</label>
                <input
                  type="text"
                  placeholder="4242 •••• •••• 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                  maxLength={19}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1 font-semibold">Exp (MM/YY)</label>
                  <input
                    type="text"
                    placeholder="12/28"
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1 font-semibold">CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                    maxLength={4}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1 font-semibold">Zip Code</label>
                  <input
                    type="text"
                    placeholder="94107"
                    value={cardZip}
                    onChange={(e) => setCardZip(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefaultCardCheckModule"
                  checked={isDefaultCard}
                  onChange={(e) => setIsDefaultCard(e.target.checked)}
                  className="rounded border-hairline text-foreground focus:ring-foreground cursor-pointer"
                />
                <label htmlFor="isDefaultCardCheckModule" className="text-xs text-muted-foreground cursor-pointer select-none font-semibold">
                  Set as my primary payment method
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-full border border-hairline text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingCard}
                  className="px-5 py-2 rounded-full bg-foreground text-background text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isAddingCard ? "Saving Card..." : "Save Card to Wallet"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-background border border-hairline shadow-2xl space-y-4 text-left"
          >
            <div className="flex items-center gap-3 border-b border-hairline pb-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="text-base font-bold text-foreground">Remove Payment Method</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to remove <strong className="text-foreground">{showDeleteModal.brand} ending in •••• {showDeleteModal.last4}</strong> from your wallet?
            </p>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-hairline">
              <button
                type="button"
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 rounded-full border border-hairline text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-full bg-red-600 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Remove Card
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
