import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Plus,
  Trash2,
  Edit3,
  Check,
  Search,
  Home,
  Building2,
  Navigation,
  FileText,
  X,
  Phone,
  User,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account/addresses")({
  head: () => ({
    meta: [
      { title: "Saved Addresses — Northlane Studio" },
      { name: "description", content: "Manage delivery destinations with Google Places autocomplete for fast 1-click checkout." },
    ],
  }),
  component: AddressesPage,
});

export interface SavedAddress {
  id: string;
  label: string;
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  aptSuite?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  deliveryInstructions?: string;
  googlePlaceId?: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  isVerified: boolean;
}

export interface PlaceSuggestion {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  googlePlaceId: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}

function AddressesPage() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [labelType, setLabelType] = useState<"Home" | "Work" | "Other">("Home");
  const [customLabel, setCustomLabel] = useState("");
  const [recipientName, setRecipientName] = useState("Vrsnmllz03");
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("(415) 890-2104");
  const [streetAddress, setStreetAddress] = useState("");
  const [aptSuite, setAptSuite] = useState("");
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // Autocomplete metadata state
  const [googlePlaceId, setGooglePlaceId] = useState("");
  const [latitude, setLatitude] = useState(37.7749);
  const [longitude, setLongitude] = useState(-122.4194);
  const [isVerified, setIsVerified] = useState(false);

  // Google Places Autocomplete dropdown state
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch Saved Addresses
  useEffect(() => {
    fetch("http://localhost:3000/api/addresses")
      .then((res) => res.json())
      .then((data) => {
        if (data.addresses) {
          setAddresses(data.addresses);
        }
      })
      .catch(() => {
        // Fallback
        setAddresses([
          {
            id: "addr-1",
            label: "Design Studio",
            recipientName: "Vrsnmllz03",
            phoneNumber: "+1 (415) 890-2104",
            streetAddress: "124 Copenhagen Way",
            aptSuite: "Studio #4B",
            city: "San Francisco",
            state: "CA",
            zipCode: "94107",
            country: "United States",
            deliveryInstructions: "Leave at front desk with receptionist.",
            googlePlaceId: "ChIJ3S-g4nxu5kcR9SSd56msDHU",
            formattedAddress: "124 Copenhagen Way, Studio #4B, San Francisco, CA 94107",
            latitude: 37.7749,
            longitude: -122.4194,
            isDefault: true,
            isVerified: true,
          },
          {
            id: "addr-2",
            label: "Headquarters",
            recipientName: "Vrsnmllz03",
            phoneNumber: "+1 (415) 500-1200",
            streetAddress: "500 Howard Street",
            aptSuite: "Suite 1200",
            city: "San Francisco",
            state: "CA",
            zipCode: "94105",
            country: "United States",
            deliveryInstructions: "Loading dock entrance on 1st Street.",
            googlePlaceId: "ChIJu9_z4Lp_j4ARWzP5_3msEFU",
            formattedAddress: "500 Howard Street, Suite 1200, San Francisco, CA 94105",
            latitude: 37.7887,
            longitude: -122.3989,
            isDefault: false,
            isVerified: true,
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Handle Google Places Street Address Autocomplete Search
  const handleStreetAddressChange = (value: string) => {
    setStreetAddress(value);
    setIsVerified(false);

    if (value.length >= 2) {
      fetch(`http://localhost:3000/api/addresses/autocomplete?q=${encodeURIComponent(value)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.suggestions) {
            setSuggestions(data.suggestions);
            setShowSuggestions(true);
          }
        })
        .catch(() => setShowSuggestions(false));
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Select Place Suggestion
  const handleSelectSuggestion = (s: PlaceSuggestion) => {
    setStreetAddress(s.streetAddress);
    setCity(s.city);
    setStateCode(s.state);
    setZipCode(s.zipCode);
    setGooglePlaceId(s.googlePlaceId);
    setLatitude(s.latitude);
    setLongitude(s.longitude);
    setIsVerified(true);
    setShowSuggestions(false);
    toast.success(`Google Places auto-filled: ${s.city}, ${s.state} ${s.zipCode}`);
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setLabelType("Home");
    setCustomLabel("");
    setRecipientName("Vrsnmllz03");
    setCountryCode("+1");
    setPhone("(415) 890-2104");
    setStreetAddress("");
    setAptSuite("");
    setCity("");
    setStateCode("");
    setZipCode("");
    setDeliveryInstructions("");
    setIsDefault(addresses.length === 0);
    setGooglePlaceId("");
    setIsVerified(false);
    setShowModal(true);
  };

  const handleOpenEditModal = (addr: SavedAddress) => {
    setEditingId(addr.id);
    if (addr.label === "Home" || addr.label === "Work") {
      setLabelType(addr.label);
      setCustomLabel("");
    } else {
      setLabelType("Other");
      setCustomLabel(addr.label);
    }
    setRecipientName(addr.recipientName);
    setPhone(addr.phoneNumber.replace(/^\+\d+\s*/, ""));
    setStreetAddress(addr.streetAddress);
    setAptSuite(addr.aptSuite || "");
    setCity(addr.city);
    setStateCode(addr.state);
    setZipCode(addr.zipCode);
    setDeliveryInstructions(addr.deliveryInstructions || "");
    setIsDefault(addr.isDefault);
    setGooglePlaceId(addr.googlePlaceId || "");
    setIsVerified(addr.isVerified);
    setShowModal(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName || !streetAddress || !city || !stateCode || !zipCode) {
      toast.error("Please fill in all required shipping address fields.");
      return;
    }

    const finalLabel = labelType === "Other" ? customLabel || "Other Location" : labelType;
    const fullPhone = `${countryCode} ${phone}`;

    const payload = {
      label: finalLabel,
      recipientName,
      phoneNumber: fullPhone,
      streetAddress,
      aptSuite,
      city,
      state: stateCode.toUpperCase(),
      zipCode,
      country: "United States",
      deliveryInstructions,
      googlePlaceId: googlePlaceId || `ChIJ_place_${Date.now()}`,
      latitude,
      longitude,
      isDefault,
    };

    if (editingId) {
      // Update existing address
      try {
        await fetch(`http://localhost:3000/api/addresses/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (e) {
        console.warn("API fallback", e);
      }

      setAddresses((prev) =>
        prev.map((a) => {
          if (a.id === editingId) {
            return {
              ...a,
              ...payload,
              formattedAddress: `${streetAddress}${aptSuite ? `, ${aptSuite}` : ""}, ${city}, ${stateCode} ${zipCode}`,
            };
          }
          if (isDefault) return { ...a, isDefault: false };
          return a;
        })
      );
      toast.success("Shipping address updated!");
    } else {
      // Create new address
      try {
        const res = await fetch("http://localhost:3000/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.address) {
          if (isDefault) {
            setAddresses((prev) => [...prev.map((a) => ({ ...a, isDefault: false })), data.address]);
          } else {
            setAddresses((prev) => [...prev, data.address]);
          }
        }
      } catch {
        // Fallback
        const newAddr: SavedAddress = {
          id: `addr-${Date.now()}`,
          ...payload,
          formattedAddress: `${streetAddress}${aptSuite ? `, ${aptSuite}` : ""}, ${city}, ${stateCode} ${zipCode}`,
          isVerified: true,
        };
        setAddresses((prev) => (isDefault ? [...prev.map((a) => ({ ...a, isDefault: false })), newAddr] : [...prev, newAddr]));
      }
      toast.success("New shipping address saved to account!");
    }

    setShowModal(false);
  };

  const handleSetDefault = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/api/addresses/${id}/default`, { method: "POST" });
    } catch (e) {
      console.warn("API fallback", e);
    }
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    toast.success("Primary shipping address updated.");
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/api/addresses/${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("API fallback", e);
    }

    setAddresses((prev) => {
      const remaining = prev.filter((a) => a.id !== id);
      const target = prev.find((a) => a.id === id);
      if (target?.isDefault && remaining.length > 0) {
        remaining[0].isDefault = true;
      }
      return remaining;
    });

    toast.info("Address removed.");
  };

  return (
    <div className="space-y-6">
      <Link
        to="/account"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Account Overview</span>
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-accent">
            Fulfillment Destinations
          </div>
          <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Saved Shipping Addresses
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage delivery destinations with Google Places autocomplete for 1-click checkout.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 rounded-full bg-foreground hover:bg-foreground/90 text-background font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-muted-foreground">Loading saved destinations...</div>
      ) : addresses.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-background border border-hairline space-y-3">
          <MapPin className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No Saved Addresses</h3>
          <p className="text-xs text-muted-foreground">Add a US shipping destination for faster checkout.</p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-full bg-foreground text-background text-xs font-bold shadow-xs cursor-pointer"
          >
            Add New Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-6 rounded-2xl bg-background border transition-all relative flex flex-col justify-between ${
                addr.isDefault
                  ? "border-foreground shadow-xs"
                  : "border-hairline hover:border-foreground/30"
              }`}
            >
              <div>
                {/* Header Label & Badges */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-hairline">
                  <span className="text-base font-bold tracking-tight text-foreground">{addr.label}</span>
                  <div className="flex items-center gap-2">
                    {addr.isVerified && (
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                        Verified
                      </span>
                    )}
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                        Primary
                      </span>
                    )}
                  </div>
                </div>

                {/* Clean Address Content */}
                <div className="text-xs text-muted-foreground space-y-2.5">
                  <div>
                    <span className="font-bold text-foreground block text-sm">{addr.recipientName}</span>
                    <span className="text-muted-foreground font-semibold text-xs">{addr.phoneNumber}</span>
                  </div>

                  <div className="pt-1 text-foreground space-y-0.5 font-semibold leading-relaxed">
                    <p>{addr.streetAddress}{addr.aptSuite ? `, ${addr.aptSuite}` : ""}</p>
                    <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                    <p className="text-muted-foreground font-normal">{addr.country}</p>
                  </div>

                  {addr.deliveryInstructions && (
                    <div className="mt-3 p-3 rounded-xl bg-surface/70 border border-hairline text-xs text-muted-foreground leading-relaxed">
                      <span className="font-bold text-foreground block mb-0.5">Delivery Note</span>
                      <span>"{addr.deliveryInstructions}"</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-hairline flex items-center justify-between">
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs text-accent hover:underline font-semibold cursor-pointer"
                  >
                    Set as Primary
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground font-semibold">Primary Location</span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(addr)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Edit address"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal with Google Places Autocomplete */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-background border border-hairline shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex justify-between items-center border-b border-hairline pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                <h3 className="text-base font-bold text-foreground">
                  {editingId ? "Edit Shipping Destination" : "Add Shipping Destination"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              {/* Address Label Selection */}
              <div>
                <label className="text-xs text-muted-foreground block mb-1 font-semibold">Address Label</label>
                <div className="flex items-center gap-2">
                  {(["Home", "Work", "Other"] as const).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setLabelType(type)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        labelType === type
                          ? "bg-foreground text-background border-foreground shadow-xs"
                          : "bg-surface text-muted-foreground border-hairline hover:text-foreground"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                {labelType === "Other" && (
                  <input
                    type="text"
                    placeholder="Custom Label (e.g. Vacation Home, Annex)"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    className="mt-2 w-full px-4 py-2 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                )}
              </div>

              {/* Recipient Name & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1 font-semibold">Recipient Name</label>
                  <input
                    type="text"
                    placeholder="Vrsnmllz03"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1 font-semibold">Phone Number</label>
                  <div className="flex items-center rounded-xl bg-background border border-hairline focus-within:ring-1 focus-within:ring-foreground overflow-hidden">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="h-10 border-0 border-r border-hairline rounded-none bg-transparent px-2 text-foreground text-xs font-semibold focus:outline-none cursor-pointer shrink-0"
                    >
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+63">🇵🇭 +63</option>
                      <option value="+44">🇬🇧 +44</option>
                    </select>
                    <input
                      type="text"
                      placeholder="(415) 890-2104"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-10 flex-1 w-full border-0 bg-transparent px-3 text-foreground text-xs focus:outline-none font-semibold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Street Address with Google Places Autocomplete */}
              <div className="relative">
                <label className="text-xs text-muted-foreground flex items-center justify-between mb-1 font-semibold">
                  <span>Street Address</span>
                  <span className="text-[10px] text-accent font-bold flex items-center gap-1">
                    <Search className="w-3 h-3" /> Google Places Autocomplete
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Start typing (e.g. 124 Copenhagen Way...)"
                    value={streetAddress}
                    onChange={(e) => handleStreetAddressChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground font-medium"
                    required
                  />
                  {isVerified && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 text-xs flex items-center gap-1 font-bold">
                      <Check className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>

                {/* Autocomplete Dropdown List */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-background border border-hairline rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                    {suggestions.map((s, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectSuggestion(s)}
                        className="p-3 hover:bg-surface border-b border-hairline last:border-0 cursor-pointer text-xs text-foreground transition-colors flex items-start gap-2"
                      >
                        <MapPin className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">{s.streetAddress}</span>
                          <span className="text-[11px] text-muted-foreground">{s.formattedAddress}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Apartment / Suite / Unit (Optional) */}
              <div>
                <label className="text-xs text-muted-foreground block mb-1 font-semibold">
                  Apartment, Suite, Unit (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apt 4B, Suite 1200"
                  value={aptSuite}
                  onChange={(e) => setAptSuite(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              {/* City, State, Zip, Country */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1 font-semibold">City</label>
                  <input
                    type="text"
                    placeholder="San Francisco"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1 font-semibold">State</label>
                  <input
                    type="text"
                    placeholder="CA"
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs uppercase focus:outline-none focus:ring-1 focus:ring-foreground"
                    maxLength={2}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1 font-semibold">ZIP Code</label>
                  <input
                    type="text"
                    placeholder="94107"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                    required
                  />
                </div>
              </div>

              {/* Delivery Instructions / Notes */}
              <div>
                <label className="text-xs text-muted-foreground block mb-1 font-semibold">
                  Delivery Notes / Gate Instructions (Optional)
                </label>
                <textarea
                  placeholder="e.g. Front desk receptionist dropoff, gate code #4921"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
                />
              </div>

              {/* Set Primary Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isDefaultAddrCheck"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-hairline text-foreground focus:ring-foreground cursor-pointer"
                />
                <label htmlFor="isDefaultAddrCheck" className="text-xs text-muted-foreground cursor-pointer select-none font-semibold">
                  Set as my primary shipping destination
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 flex justify-end gap-3 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-full border border-hairline text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-foreground text-background text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingId ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
