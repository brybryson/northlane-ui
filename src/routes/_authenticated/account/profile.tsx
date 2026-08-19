import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { User, KeyRound, AlertCircle, ArrowLeft, Camera, Trash2, Check, X, ShieldCheck, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SavedAddressesSection } from "@/components/account/SavedAddressesSection";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

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
  const [pendingPhotoUrl, setPendingPhotoUrl] = useState<string>("");
  const [showUploadConfirmModal, setShowUploadConfirmModal] = useState(false);
  const [showRemoveConfirmModal, setShowRemoveConfirmModal] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setAuthUser(data.user);
        const meta = data.user.user_metadata || {};
        // If avatar_url is explicitly set (including empty string), respect it over picture
        const customAvatar =
          meta.avatar_url !== undefined && meta.avatar_url !== null
            ? meta.avatar_url
            : (meta.picture || "");
        setAvatarUrl(customAvatar);
        if (data.user.email) {
          const emailName = data.user.email.split("@")[0];
          setFullName(meta.full_name || emailName.charAt(0).toUpperCase() + emailName.slice(1));
        }
      }
    });
  }, []);

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      setPendingPhotoUrl(base64Url);
      setShowUploadConfirmModal(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleConfirmPhotoUpload = async () => {
    if (!pendingPhotoUrl) return;
    setIsUpdatingPhoto(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: pendingPhotoUrl, picture: null },
      });
      if (error) throw error;

      setAvatarUrl(pendingPhotoUrl);
      setAuthUser((prev: any) => ({
        ...prev,
        user_metadata: { ...(prev?.user_metadata || {}), avatar_url: pendingPhotoUrl, picture: null },
      }));
      window.dispatchEvent(new CustomEvent("northlane_user_profile_updated"));
      toast.success("Profile photo updated successfully!");
      setShowUploadConfirmModal(false);
      setPendingPhotoUrl("");
    } catch (err) {
      toast.error("Failed to update profile photo.");
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  const handleConfirmPhotoRemove = async () => {
    setIsUpdatingPhoto(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: "", picture: null },
      });
      if (error) throw error;

      setAvatarUrl("");
      setAuthUser((prev: any) => ({
        ...prev,
        user_metadata: { ...(prev?.user_metadata || {}), avatar_url: "", picture: null },
      }));
      window.dispatchEvent(new CustomEvent("northlane_user_profile_updated"));
      toast.success("Profile photo removed.");
      setShowRemoveConfirmModal(false);
    } catch (err) {
      toast.error("Failed to remove profile photo.");
    } finally {
      setIsUpdatingPhoto(false);
    }
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
                  onChange={handleAvatarFileSelect}
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
                onChange={handleAvatarFileSelect}
                className="hidden"
              />
            </label>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setShowRemoveConfirmModal(true)}
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

      {/* Profile Changes Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={(open) => !open && setShowConfirmModal(false)}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl p-6 border-hairline bg-background shadow-2xl overflow-hidden z-[100]">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent via-indigo-500 to-accent" />
          
          <DialogHeader className="text-center sm:text-center mt-2 flex flex-col items-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 mb-4 text-accent">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground text-center">
              Confirm Profile Update
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed text-center">
              Save account credentials and preference changes for <strong className="text-foreground">{fullName}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="my-6 flex flex-col gap-3">
            <div className="group flex items-center gap-4 rounded-2xl bg-surface/40 p-3.5 transition-all border border-hairline/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border border-hairline/30 text-muted-foreground shadow-sm">
                <User className="h-4 w-4" />
              </div>
              <div className="flex flex-col text-left">
                <h4 className="text-xs font-semibold text-foreground tracking-wide">Studio Account Credentials</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 pr-2">
                  Updates phone number ({countryCode} {phone}) and currency preferences ({currency}).
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-col sm:space-x-0 w-full">
            <button
              type="button"
              onClick={handleExecuteSaveProfile}
              disabled={isSavingProfile}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-background hover:bg-foreground/90 transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              {isSavingProfile ? "Saving..." : "Confirm & Save Changes"} <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              disabled={isSavingProfile}
              className="w-full inline-flex items-center justify-center rounded-full border border-hairline bg-surface/50 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Upload Confirmation Modal */}
      <Dialog open={showUploadConfirmModal} onOpenChange={(open) => !open && setShowUploadConfirmModal(false)}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl p-6 border-hairline bg-background shadow-2xl overflow-hidden z-[100]">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent via-indigo-500 to-accent" />
          
          <DialogHeader className="text-center sm:text-center mt-2 flex flex-col items-center">
            <div className="mx-auto h-20 w-20 rounded-full overflow-hidden border-2 border-accent shadow-md mb-4 shrink-0">
              <img src={pendingPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground text-center">
              Confirm Profile Photo
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed text-center">
              Would you like to set this image as your official studio profile picture?
            </DialogDescription>
          </DialogHeader>

          <div className="my-6 flex flex-col gap-3">
            <div className="group flex items-center gap-4 rounded-2xl bg-surface/40 p-3.5 transition-all border border-hairline/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border border-hairline/30 text-accent shadow-sm">
                <Camera className="h-4 w-4" />
              </div>
              <div className="flex flex-col text-left">
                <h4 className="text-xs font-semibold text-foreground tracking-wide">In-Place Profile Update</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 pr-2">
                  Replaces existing avatar data directly on your studio user profile without duplicate records.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-col sm:space-x-0 w-full">
            <button
              type="button"
              onClick={handleConfirmPhotoUpload}
              disabled={isUpdatingPhoto}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-background hover:bg-foreground/90 transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              {isUpdatingPhoto ? "Uploading..." : "Confirm & Save Photo"} <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUploadConfirmModal(false);
                setPendingPhotoUrl("");
              }}
              disabled={isUpdatingPhoto}
              className="w-full inline-flex items-center justify-center rounded-full border border-hairline bg-surface/50 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Remove Confirmation Modal */}
      <Dialog open={showRemoveConfirmModal} onOpenChange={(open) => !open && setShowRemoveConfirmModal(false)}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl p-6 border-hairline bg-background shadow-2xl overflow-hidden z-[100]">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent via-indigo-500 to-accent" />
          
          <DialogHeader className="text-center sm:text-center mt-2 flex flex-col items-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 mb-4 text-accent">
              <Trash2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground text-center">
              Remove Profile Photo
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed text-center">
              Are you sure you want to remove your custom profile photo? This will delete your custom avatar image.
            </DialogDescription>
          </DialogHeader>

          <div className="my-6 flex flex-col gap-3">
            <div className="group flex items-center gap-4 rounded-2xl bg-surface/40 p-3.5 transition-all border border-hairline/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border border-hairline/30 text-muted-foreground shadow-sm">
                <User className="h-4 w-4" />
              </div>
              <div className="flex flex-col text-left">
                <h4 className="text-xs font-semibold text-foreground tracking-wide">Default Account Initials</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 pr-2">
                  Your profile avatar will revert to your account initials ({fullName ? fullName.charAt(0).toUpperCase() : "U"}).
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-col sm:space-x-0 w-full">
            <button
              type="button"
              onClick={handleConfirmPhotoRemove}
              disabled={isUpdatingPhoto}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-background hover:bg-foreground/90 transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              {isUpdatingPhoto ? "Removing..." : "Confirm & Remove Photo"} <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowRemoveConfirmModal(false)}
              disabled={isUpdatingPhoto}
              className="w-full inline-flex items-center justify-center rounded-full border border-hairline bg-surface/50 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all cursor-pointer disabled:opacity-50"
            >
              Keep Photo
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
