import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, Heart, ShieldCheck, ArrowRight } from "lucide-react";

interface SignUpNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignUpNoticeModal({ isOpen, onClose }: SignUpNoticeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] rounded-3xl p-6 border-hairline bg-background shadow-2xl overflow-hidden z-[100]">
        {/* Sleek top ambient accent gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent via-indigo-500 to-accent" />
        
        <DialogHeader className="text-center sm:text-center mt-2 flex flex-col items-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 mb-4 text-accent">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground text-center">
            Unlock Northlane Studio
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed text-center">
            Create an account or sign in to access premium features. Non-members cannot add items to the cart or save favorites.
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 space-y-3.5">
          <div className="flex items-start gap-3 rounded-2xl bg-surface/60 p-3 border border-hairline/50">
            <div className="mt-0.5 rounded-full bg-emerald-500/10 p-1 text-emerald-600">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Active Studio Bag</h4>
              <p className="text-[11px] text-muted-foreground leading-normal mt-0.5">
                Add, manage, and checkout premium workspace gear.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-surface/60 p-3 border border-hairline/50">
            <div className="mt-0.5 rounded-full bg-accent/10 p-1 text-accent">
              <Heart className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Curated Wishlist</h4>
              <p className="text-[11px] text-muted-foreground leading-normal mt-0.5">
                Save items to customize and design your perfect desk setups.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col sm:space-x-0 w-full">
          <Link
            to="/auth"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-background hover:bg-foreground/90 transition-all duration-300"
          >
            Create Account / Sign In <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            onClick={onClose}
            className="w-full inline-flex items-center justify-center rounded-full border border-hairline bg-surface/50 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all cursor-pointer"
          >
            Maybe Later
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
