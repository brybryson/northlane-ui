import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    toast.success("Thank you for subscribing to Northlane Studio Edits.");
  }

  const cols = [
    {
      title: "Shop",
      links: [
        { label: "Catalog", href: "/shop" },
        { label: "Collections", href: "/#collections" },
        { label: "Workspaces", href: "/#workspaces" },
        { label: "Journal", href: "/#journal" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/#stories" },
        { label: "Careers", href: "#" },
        { label: "Contact", href: "#" },
        { label: "Press", href: "#" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "#" },
        { label: "Shipping", href: "#" },
        { label: "Returns", href: "#" },
        { label: "Warranty", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
        { label: "Cookies", href: "#" },
        { label: "Accessibility", href: "#" },
      ],
    },
  ];

  return (
    <footer className="hairline-t bg-surface">
      <div className="container-editorial py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_2fr]">
          <div className="flex flex-col justify-between">
            <div>
              <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span>Northlane Studio</span>
              </Link>
              <p className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed">
                Premium workspace essentials for professionals who value craftsmanship, clarity, and
                ergonomics.
              </p>
            </div>

            {/* Integrated Footer Newsletter */}
            <div className="mt-8 border-t border-hairline pt-6">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
                Newsletter
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-sm">
                Thoughtfully curated. Occasionally shared. Workspace inspiration, new release edits,
                and studio essays — never more than twice a month.
              </p>

              {subscribed ? (
                <div className="mt-3 text-xs font-medium text-emerald-600">
                  ✓ Subscribed! Check your inbox for our latest studio edit.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="mt-4 flex max-w-sm items-center gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 rounded-full border border-hairline bg-background px-4 py-2 text-xs outline-none focus:border-foreground"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition hover:bg-foreground/90 shrink-0"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {cols.map((c) => (
              <div key={c.title}>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
                  {c.title}
                </div>
                <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      {l.href.startsWith("/") ? (
                        <Link to={l.href} className="transition hover:text-foreground">
                          {l.label}
                        </Link>
                      ) : (
                        <a href={l.href} className="transition hover:text-foreground">
                          {l.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6 text-xs text-muted-foreground">
          <div>© 2026 Northlane Supply Co. All rights reserved.</div>
          <div>Copenhagen · Shipped Worldwide</div>
        </div>
      </div>
    </footer>
  );
}
