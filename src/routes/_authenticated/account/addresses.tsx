import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account/addresses")({
  head: () => ({
    meta: [
      { title: "Saved Addresses — Northlane Studio" },
      { name: "description", content: "Manage your default shipping and billing destinations for 1-click checkout." },
    ],
  }),
  component: AddressesPage,
});

interface Address {
  id: string;
  type: "Shipping" | "Billing";
  label: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

const INITIAL_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    type: "Shipping",
    label: "Design Studio",
    name: "Vrsnmllz03",
    street: "124 Copenhagen Way, Studio #4B",
    city: "San Francisco",
    state: "CA",
    zip: "94107",
    country: "United States",
    isDefault: true,
  },
  {
    id: "addr-2",
    type: "Billing",
    label: "Headquarters",
    name: "Vrsnmllz03",
    street: "500 Howard Street, Suite 1200",
    city: "San Francisco",
    state: "CA",
    zip: "94105",
    country: "United States",
    isDefault: false,
  },
];

function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState("");
  const [newAddrStreet, setNewAddrStreet] = useState("");
  const [newAddrCity, setNewAddrCity] = useState("");
  const [newAddrState, setNewAddrState] = useState("");
  const [newAddrZip, setNewAddrZip] = useState("");

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet || !newAddrCity) {
      toast.error("Please fill in street and city.");
      return;
    }
    const newEntry: Address = {
      id: `addr-${Date.now()}`,
      type: "Shipping",
      label: newAddrLabel || "New Location",
      name: "Vrsnmllz03",
      street: newAddrStreet,
      city: newAddrCity,
      state: newAddrState || "CA",
      zip: newAddrZip || "94101",
      country: "United States",
      isDefault: false,
    };
    setAddresses((prev) => [...prev, newEntry]);
    setShowAddressModal(false);
    setNewAddrLabel("");
    setNewAddrStreet("");
    setNewAddrCity("");
    setNewAddrState("");
    setNewAddrZip("");
    toast.success("New shipping address added!");
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.info("Address removed.");
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
    toast.success("Default shipping address updated.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-accent">
            Fulfillment Destinations
          </div>
          <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Saved Shipping Addresses
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage delivery destinations for fast 1-click checkout.
          </p>
        </div>
        <button
          onClick={() => setShowAddressModal(true)}
          className="px-5 py-2.5 rounded-full bg-foreground hover:bg-foreground/90 text-background font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`p-6 rounded-2xl bg-background border transition-all relative ${
              addr.isDefault
                ? "border-foreground shadow-xs"
                : "border-hairline hover:border-foreground/30"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="text-sm font-bold text-foreground">{addr.label}</span>
              </div>
              {addr.isDefault && (
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                  Default
                </span>
              )}
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-bold text-foreground">{addr.name}</p>
              <p>{addr.street}</p>
              <p>
                {addr.city}, {addr.state} {addr.zip}
              </p>
              <p className="text-muted-foreground">{addr.country}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-hairline flex items-center justify-between">
              {!addr.isDefault ? (
                <button
                  onClick={() => handleSetDefaultAddress(addr.id)}
                  className="text-xs text-accent hover:underline font-semibold cursor-pointer"
                >
                  Set as Default
                </button>
              ) : (
                <span className="text-xs text-muted-foreground font-semibold">Primary Location</span>
              )}

              <button
                onClick={() => handleDeleteAddress(addr.id)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Delete address"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Address Modal Dialog */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-background border border-hairline shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center border-b border-hairline pb-3">
              <h3 className="text-base font-bold text-foreground">Add New Address</h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1 font-semibold">Location Label</label>
                <input
                  type="text"
                  placeholder="e.g. Home, Studio, Office"
                  value={newAddrLabel}
                  onChange={(e) => setNewAddrLabel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1 font-semibold">Street Address</label>
                <input
                  type="text"
                  placeholder="123 Market St, Suite 400"
                  value={newAddrStreet}
                  onChange={(e) => setNewAddrStreet(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1 font-semibold">City</label>
                  <input
                    type="text"
                    placeholder="San Francisco"
                    value={newAddrCity}
                    onChange={(e) => setNewAddrCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1 font-semibold">State & Zip</label>
                  <input
                    type="text"
                    placeholder="CA 94105"
                    value={newAddrState}
                    onChange={(e) => setNewAddrState(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 rounded-full border border-hairline text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-foreground text-background text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
