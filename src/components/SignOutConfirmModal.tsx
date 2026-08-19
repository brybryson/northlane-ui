import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { LogOut, ShoppingBag, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SignOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSignOut?: () => void;
}

export function SignOutConfirmModal({ isOpen, onClose, onConfirmSignOut }: SignOutConfirmModalProps) {
  const handleSignOut = async () => {
    try {
      // Clear localStorage cache for cart & wishlist so they reset to 0 immediately upon logout
      localStorage.removeItem("northlane_cart_v1");
      localStorage.removeItem("northlane_wishlist");
      window.dispatchEvent(new Event("northlane_wishlist_updated"));
      window.dispatchEvent(new Event("northlane_cart_cleared"));

      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      if (onConfirmSignOut) {
        onConfirmSignOut();
      }
    } catch {
      toast.error("Failed to sign out");
    } finally {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] rounded-3xl p-6 border-hairline bg-background shadow-2xl overflow-hidden z-[100]">
        {/* Sleek top ambient accent gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500" />
        
        <DialogHeader className="text-center sm:text-center mt-2 flex flex-col items-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 mb-4 text-rose-500">
            <LogOut className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground text-center">
            Sign Out of Northlane?
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed text-center">
            Are you sure you want to sign out of your account? Your saved cart items and curated wishlist will remain safely stored.
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 flex flex-col gap-3">
          <div className="group flex items-center gap-4 rounded-2xl bg-surface/40 p-3.5 transition-all hover:bg-surface/80 border border-transparent hover:border-hairline/50">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border border-hairline/30 text-muted-foreground group-hover:text-foreground transition-colors shadow-sm">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-xs font-semibold text-foreground tracking-wide">Active Studio Bag</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 pr-2">
                Your cart items will be ready when you sign back in.
              </p>
            </div>
          </div>

          <div className="group flex items-center gap-4 rounded-2xl bg-surface/40 p-3.5 transition-all hover:bg-surface/80 border border-transparent hover:border-hairline/50">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border border-hairline/30 text-muted-foreground group-hover:text-foreground transition-colors shadow-sm">
              <Heart className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-xs font-semibold text-foreground tracking-wide">Curated Wishlist</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 pr-2">
                Your favorite studio gear setups remain saved.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col sm:space-x-0 w-full">
          <button
            onClick={handleSignOut}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-background hover:bg-foreground/90 transition-all duration-300 cursor-pointer shadow-md"
          >
            Confirm Sign Out
          </button>
          <button
            onClick={onClose}
            className="w-full inline-flex items-center justify-center rounded-full border border-hairline bg-surface/50 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all cursor-pointer"
          >
            Stay Signed In
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
