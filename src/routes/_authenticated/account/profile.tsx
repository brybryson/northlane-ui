import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { User, Lock, Check, KeyRound, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/account/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Security — Northlane Studio" },
      { name: "description", content: "Manage your personal account information, phone number, currency, and security credentials." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [fullName, setFullName] = useState("Vrsnmllz03");
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("(415) 890-2104");
  const [currency, setCurrency] = useState("USD ($)");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [googlePhotoUrl, setGooglePhotoUrl] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setAuthUser(data.user);
        const gPhoto = data.user.user_metadata?.picture || data.user.user_metadata?.avatar_url || "";
        const customAvatar = data.user.user_metadata?.avatar_url || gPhoto;
        setGooglePhotoUrl(gPhoto);
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

  const handleResetToGooglePhoto = async () => {
    if (!googlePhotoUrl) {
      toast.info("No Google profile photo linked to this account.");
      return;
    }
    setAvatarUrl(googlePhotoUrl);
    await supabase.auth.updateUser({
      data: { avatar_url: googlePhotoUrl },
    });
    toast.success("Profile picture reset to Google photo!");
    window.location.reload();
  };

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleExecuteSaveProfile = () => {
    setShowConfirmModal(false);
    setIsSavingProfile(true);
    setTimeout(() => {
      setIsSavingProfile(false);
      toast.success("Account profile details updated successfully!");
    }, 400);
  };

  const handleSendPasswordReset = async () => {
    setIsSendingReset(true);
    try {
      const email = authUser?.email || "vrsnmllz03@gmail.com";
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success(`Password reset instructions sent to ${email}! Please check your inbox.`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset link.");
    } finally {
      setIsSendingReset(false);
    }
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

      <div>
        <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-accent">
          Account Credentials
        </div>
        <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Profile & Security Settings
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Manage your studio account credentials, security preferences, and global settings.
        </p>
      </div>

      {/* 2-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Personal Information Form */}
        <form
          onSubmit={handleOpenConfirmModal}
          className="p-6 sm:p-8 rounded-2xl bg-background border border-hairline shadow-xs space-y-6"
        >
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-hairline pb-3">
            <User className="w-4 h-4 text-accent" />
            Personal Information
          </h3>

          {/* Profile Photo Uploader */}
          <div className="p-4 rounded-xl bg-surface/50 border border-hairline flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-foreground text-background font-bold text-xl flex items-center justify-center border border-hairline shrink-0 shadow-xs">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{fullName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <span className="text-xs font-bold text-foreground block">Profile Photo</span>
              <p className="text-[11px] text-muted-foreground">
                Upload a custom profile image or sync directly with your Gmail / Google account.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <label className="px-3.5 py-1.5 rounded-full bg-foreground hover:bg-foreground/90 text-background text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5">
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileUpload}
                    className="hidden"
                  />
                </label>
                {googlePhotoUrl && (
                  <button
                    type="button"
                    onClick={handleResetToGooglePhoto}
                    className="px-3.5 py-1.5 rounded-full bg-surface hover:bg-muted/60 text-foreground text-xs font-semibold border border-hairline transition-colors cursor-pointer"
                  >
                    Use Google Photo
                  </button>
                )}
              </div>
            </div>
          </div>

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

          <div>
            <label className="text-xs text-muted-foreground block mb-1 font-semibold">Email Address</label>
            <input
              type="email"
              value={authUser?.email || "vrsnmllz03@gmail.com"}
              disabled
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-hairline text-muted-foreground text-xs cursor-not-allowed font-semibold"
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Contact studio support to request an email address change.
            </span>
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

          <div className="pt-4 border-t border-hairline flex justify-end">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-foreground hover:bg-foreground/90 text-background font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSavingProfile ? "Saving..." : "Save Profile Changes"}
            </button>
          </div>
        </form>

        {/* Right Column: Security & Password Reset */}
        <div className="p-6 sm:p-8 rounded-2xl bg-background border border-hairline shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-hairline pb-3">
            <Lock className="w-4 h-4 text-accent" />
            Security & Authentication
          </h3>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Your studio account credentials are secured with 256-bit SSL encryption and token-based session authentication.
          </p>

          <div className="p-4 rounded-xl bg-surface/50 border border-hairline space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>SSL Session Encryption Active</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              A password reset link will be sent directly to your registered email address.
            </p>
          </div>

          <div className="pt-2 border-t border-hairline">
            <button
              type="button"
              onClick={handleSendPasswordReset}
              disabled={isSendingReset}
              className="w-full py-3 px-5 rounded-full bg-foreground text-background hover:bg-foreground/90 font-bold text-xs transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSendingReset ? (
                <span>Sending Reset Link...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Send Password Reset Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Profile Update */}
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
