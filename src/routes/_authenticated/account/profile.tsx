import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { User, KeyRound, AlertCircle, ArrowLeft, Camera } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SavedAddressesSection } from "@/components/account/SavedAddressesSection";

export const Route = createFileRoute("/_authenticated/account/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Security — Northlane Studio" },
      { name: "description", content: "Manage your studio account credentials, security preferences, and global settings." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("(415) 890-2104");
  const [countryCode, setCountryCode] = useState("+1");
  const [currency, setCurrency] = useState("USD ($)");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setAuthUser(data.user);
        const gPhoto = data.user.user_metadata?.picture || data.user.user_metadata?.avatar_url || "";
        const customAvatar = data.user.user_metadata?.avatar_url || gPhoto;
        setAvatarUrl(customAvatar);
        if (data.user.email) {
          const emailName = data.user.email.split("@")[0];
          setFullName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
        }
      }
    });
  }, []);

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Url = reader.result as string;
      setAvatarUrl(base64Url);
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: base64Url },
      });
      if (error) {
        toast.error("Failed to update profile photo.");
      } else {
        toast.success("Profile photo updated successfully!");
        window.location.reload();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    setAvatarUrl("");
    await supabase.auth.updateUser({
      data: { avatar_url: "" },
    });
    toast.success("Profile photo removed.");
    window.location.reload();
  };

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleExecuteSaveProfile = async () => {
    setShowConfirmModal(false);
    setIsSavingProfile(true);
    try {
      if (authUser) {
        const fullPhone = `${countryCode} ${phone}`;
        await supabase.auth.updateUser({
          data: {
            full_name: fullName,
            phone_number: fullPhone,
            preferred_currency: currency,
          },
        });
      }
      toast.success("Profile settings updated successfully!");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!authUser?.email) {
      toast.error("No valid email address found.");
      return;
    }
    setIsSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(authUser.email, {
        redirectTo: window.location.origin + "/auth",
      });
      if (error) throw error;
      toast.success("Password reset link sent to your email!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset link");
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="space-y-8">
      <Link
        to="/account"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Account Overview</span>
      </Link>

      <div>
        <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-accent">
          Account Credentials
        </div>
        <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Profile & Account Settings
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Manage your personal details, profile picture, password reset, and delivery addresses.
        </p>
      </div>

      <form
        onSubmit={handleOpenConfirmModal}
        className="p-6 sm:p-8 rounded-2xl bg-background border border-hairline shadow-xs space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-hairline pb-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-foreground text-background font-bold text-xl flex items-center justify-center border-2 border-hairline shadow-xs shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{fullName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <label className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-xs cursor-pointer hover:scale-110 transition-transform">
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <h3 className="text-base font-bold text-foreground">{fullName || "Personal Profile"}</h3>
              <p className="text-xs text-muted-foreground">{authUser?.email || "vrsnmllz03@gmail.com"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="px-4 py-2 rounded-full bg-foreground hover:bg-foreground/90 text-background text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarFileUpload}
                className="hidden"
              />
            </label>
            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="px-4 py-2 rounded-full bg-surface hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30 text-muted-foreground text-xs font-semibold border border-hairline transition-colors cursor-pointer"
              >
                Remove Photo
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1 font-semibold">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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
                  className="h-10 border-0 border-r border-hairline rounded-none bg-transparent px-2.5 text-foreground text-xs font-semibold focus:outline-none cursor-pointer shrink-0"
                >
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+63">🇵🇭 +63</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+49">🇩🇪 +49</option>
                  <option value="+33">🇫🇷 +33</option>
                  <option value="+81">🇯🇵 +81</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+65">🇸🇬 +65</option>
                </select>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 flex-1 w-full border-0 bg-transparent px-3 text-foreground text-xs focus:outline-none font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1 font-semibold">Email Address</label>
              <input
                type="email"
                value={authUser?.email || "vrsnmllz03@gmail.com"}
                disabled
                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-hairline text-muted-foreground text-xs cursor-not-allowed font-semibold"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1 font-semibold">Preferred Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground cursor-pointer font-semibold"
              >
                <option value="USD ($)">USD ($) — US Dollar</option>
                <option value="EUR (€)">EUR (€) — Euro</option>
                <option value="GBP (£)">GBP (£) — British Pound</option>
                <option value="CAD ($)">CAD ($) — Canadian Dollar</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSendPasswordReset}
              disabled={isSendingReset}
              className="w-full sm:w-auto px-4 py-2 rounded-full border border-hairline bg-surface hover:bg-muted/50 text-foreground text-xs font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <KeyRound className="w-3.5 h-3.5 text-accent" />
              <span>{isSendingReset ? "Sending Reset Link..." : "Reset Password"}</span>
            </button>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-foreground hover:bg-foreground/90 text-background font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSavingProfile ? "Saving..." : "Save Profile Changes"}
            </button>
          </div>
        </div>
      </form>

      <SavedAddressesSection />

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-background border border-hairline shadow-2xl space-y-4 text-left"
          >
            <div className="flex items-center gap-3 border-b border-hairline pb-3">
              <AlertCircle className="w-5 h-5 text-accent" />
              <h3 className="text-base font-bold text-foreground">Confirm Profile Update</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to save these profile changes for <strong className="text-foreground">{fullName}</strong>?
            </p>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-hairline">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-full border border-hairline text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSaveProfile}
                className="px-5 py-2 rounded-full bg-foreground text-background text-xs font-bold shadow-xs cursor-pointer"
              >
                Confirm & Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
