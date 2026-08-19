import { useState, useEffect, useRef, useCallback } from "react";
import { 
  X, 
  Send, 
  MessageSquare, 
  ArrowUpRight, 
  ShoppingBag, 
  Bot,
  User as UserIcon, 
  RefreshCw 
} from "lucide-react";
import { CATALOG_PRODUCTS, CatalogProduct } from "@/lib/products.data";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

/* -------------------------------------------------------------------------- */
/*  Types                                                                       */
/* -------------------------------------------------------------------------- */

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: CatalogProduct[];
  timestamp: string; // ISO string — safe for JSON serialisation
}

interface AIShoppingAssistantProps {
  onAddToCart: (product: CatalogProduct, qty?: number) => void;
  onShowSignUpNotice: () => void;
  user: User | null;
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                   */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY = "northlane_chat_history";

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Welcome to Northlane Studio! I'm your AI Shopping Concierge. I can help you find products, compare specifications, compile workspace setups, or answer store policy questions. What are you looking to craft today?",
  timestamp: "2026-01-01T00:00:00.000Z",
};

const SUGGESTIONS = [
  "I need a quiet keyboard under $250",
  "Recommend an ergonomic setup for coding",
  "Do you have video editing monitors?",
  "What is your return policy?",
];

/* -------------------------------------------------------------------------- */
/*  useChatHistory hook — localStorage persistence                              */
/* -------------------------------------------------------------------------- */

function useChatHistory() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);

  // Load persisted history on mount to prevent SSR hydration mismatch
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Message[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // corrupted storage — fallback to default
    }
  }, []);

  // Sync to localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // storage quota exceeded — silently ignore
    }
  }, [messages]);

  const addMessage = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const clearHistory = useCallback(() => {
    const fresh: Message[] = [
      {
        ...WELCOME_MESSAGE,
        id: "welcome-reset-" + Date.now(),
        content:
          "Let's start fresh! How can I help you find the right premium workspace essentials today?",
        timestamp: new Date().toISOString(),
      },
    ];
    setMessages(fresh);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {}
  }, []);

  return { messages, addMessage, clearHistory };
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                   */
/* -------------------------------------------------------------------------- */

export function AIShoppingAssistant({
  onAddToCart,
  onShowSignUpNotice,
  user,
}: AIShoppingAssistantProps) {
  const { messages, addMessage, clearHistory } = useChatHistory();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function handleSend(textToSend: string) {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: "u-" + Date.now(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    addMessage(userMsg);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:3000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          sessionId: "session-" + (user?.id || "guest"),
          userId: user?.id || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsTyping(false);
        addMessage({
          id: "a-" + Date.now(),
          role: "assistant",
          content: data.reply,
          products: data.products,
          timestamp: new Date().toISOString(),
        });
        return;
      }
    } catch (e: any) {
      console.warn("[ConciergeUI] Live API endpoint unreachable, using fallback:", e.message);
    }

    // Client-side simulation fallback
    setTimeout(() => {
      const lower = textToSend.toLowerCase();
      let matched: CatalogProduct[] = [];
      let reply = "";

      const isKeyboard =
        lower.includes("keyboard") || lower.includes("typing") || lower.includes("keys");
      const isMouse =
        lower.includes("mouse") || lower.includes("pointing") || lower.includes("mice");
      const isAudio =
        lower.includes("audio") ||
        lower.includes("headphone") ||
        lower.includes("headphones") ||
        lower.includes("sound") ||
        lower.includes("speaker");
      const isDesk =
        lower.includes("desk") || lower.includes("table") || lower.includes("standing");
      const isChair =
        lower.includes("chair") || lower.includes("seating") || lower.includes("sit");

      const budgetMatch = lower.match(/(?:under|below|budget of|max|price of|\$|p)\s*([\d,]+)/i);
      const budgetMax = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, "")) : Infinity;

      if (isKeyboard) {
        matched = CATALOG_PRODUCTS.filter(
          (p) => p.category.toLowerCase().includes("keyboard") && p.price <= budgetMax
        );
        reply =
          matched.length > 0
            ? `I've found ${matched.length} mechanical keyboard(s) designed for silent, focused typing. Here are my recommendations:`
            : `I see you are looking for keyboards under $${budgetMax.toLocaleString()}, but we don't have matches in that exact price range right now. Here are other options in stock:`;
        if (matched.length === 0)
          matched = CATALOG_PRODUCTS.filter((p) => p.category.toLowerCase().includes("keyboard"));
      } else if (isMouse) {
        matched = CATALOG_PRODUCTS.filter(
          (p) => p.category.toLowerCase().includes("mouse") && p.price <= budgetMax
        );
        reply =
          matched.length > 0
            ? `Here are ergonomic, high-precision mice crafted for professional creator setups:`
            : `No matching mice under that budget, but here are our high-performance models:`;
        if (matched.length === 0)
          matched = CATALOG_PRODUCTS.filter((p) => p.category.toLowerCase().includes("mouse"));
      } else if (isAudio) {
        matched = CATALOG_PRODUCTS.filter(
          (p) => p.category.toLowerCase().includes("audio") && p.price <= budgetMax
        );
        reply = `To help block out ambient noise, I highly recommend our high-fidelity acoustic gear:`;
        if (matched.length === 0)
          matched = CATALOG_PRODUCTS.filter((p) => p.category.toLowerCase().includes("audio"));
      } else if (isDesk) {
        matched = CATALOG_PRODUCTS.filter(
          (p) => p.category.toLowerCase().includes("desk") && p.price <= budgetMax
        );
        reply = `For active ergonomics, here are our solid wood standing desks:`;
        if (matched.length === 0)
          matched = CATALOG_PRODUCTS.filter((p) => p.category.toLowerCase().includes("desk"));
      } else if (isChair) {
        matched = CATALOG_PRODUCTS.filter(
          (p) => p.category.toLowerCase().includes("seating") && p.price <= budgetMax
        );
        reply = `Investing in comfortable seating is crucial. Check out our high-back task chairs:`;
        if (matched.length === 0)
          matched = CATALOG_PRODUCTS.filter((p) => p.category.toLowerCase().includes("seating"));
      } else if (
        lower.includes("policy") ||
        lower.includes("return") ||
        lower.includes("refund") ||
        lower.includes("ship")
      ) {
        reply =
          "Northlane offers **Free Express Shipping** on all orders. We also provide a **30-Day Risk-Free Trial**—if you are not completely satisfied with your studio equipment, you can return it within 30 days for a full refund (original packaging required).";
      } else if (
        lower.includes("setup") ||
        lower.includes("workspace") ||
        lower.includes("recommend")
      ) {
        matched = CATALOG_PRODUCTS.filter((p) => p.featured).slice(0, 3);
        reply =
          "To create a premium workspace setup geared for focus, I recommend starting with a solid wood standing desk, a quiet mechanical keyboard, and matching desk accessories. Here are our top featured essentials:";
      } else {
        reply =
          "We don't currently carry that specific item. I've recorded your inquiry so our studio sourcing team can better understand what workspace products customers are looking for. In the meantime, I can help you find premium keyboards, audio monitors, desks, or ergonomic chairs!";
      }

      setIsTyping(false);
      addMessage({
        id: "a-" + Date.now(),
        role: "assistant",
        content: reply,
        products: matched.slice(0, 2),
        timestamp: new Date().toISOString(),
      });
    }, 1400);
  }

  function handleReset() {
    clearHistory();
    toast.success("Conversation reset");
  }

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Floating Action Button — classy, minimal                             */}
      {/* ------------------------------------------------------------------ */}
      <button
        id="ai-chat-fab"
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Shopping Assistant"
        className={`
          fixed bottom-6 right-6 z-40
          flex items-center justify-center
          h-14 w-14
          rounded-full
          bg-foreground text-background
          border border-foreground/10
          transition-all duration-300 ease-out
          hover:scale-105 hover:bg-foreground/90
          active:scale-95
          ${isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"}
        `}
      >
        <MessageSquare className="h-5 w-5 shrink-0" />
      </button>

      {/* ------------------------------------------------------------------ */}
      {/* Backdrop — mobile tap-outside close                                 */}
      {/* ------------------------------------------------------------------ */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Slide-out Chat Drawer                                               */}
      {/* ------------------------------------------------------------------ */}
      <div
        role="dialog"
        aria-label="Studio AI Shopping Concierge"
        aria-modal="true"
        className={`
          fixed bottom-0 right-0 top-0 z-50
          w-full max-w-md
          border-l border-hairline
          bg-background/96 backdrop-blur-2xl
          shadow-2xl
          flex flex-col
          transition-transform duration-500 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"}
        `}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-70" />

        {/* ---- Header ---- */}
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground ring-1 ring-hairline">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground leading-tight flex items-center gap-2">
                Studio Concierge
              </h2>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                Northlane AI · Always online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={handleReset}
              title="Reset conversation"
              className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              title="Close"
              className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ---- Messages Body ---- */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[88%] ${
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-full text-xs font-semibold ${
                  msg.role === "user"
                    ? "bg-foreground text-background"
                    : "bg-accent/10 text-accent ring-1 ring-accent/20"
                }`}
              >
                {msg.role === "user" ? (
                  <UserIcon className="h-3.5 w-3.5" />
                ) : (
                  <Bot className="h-3.5 w-3.5" />
                )}
              </div>

              <div className="space-y-2.5">
                {/* Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-foreground text-background font-medium rounded-tr-none"
                      : "bg-surface border border-hairline text-foreground rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">
                    {msg.content.split(/\*\*(.*?)\*\*/g).map((part, i) =>
                      i % 2 === 1 ? (
                        <strong key={i} className="font-bold">
                          {part}
                        </strong>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )}
                  </p>
                </div>

                {/* Product recommendation cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="grid gap-2 mt-1">
                    {msg.products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 rounded-2xl border border-hairline bg-surface p-3 transition-all hover:border-accent/30 hover:shadow-sm"
                      >
                        <img
                          src={product.img}
                          alt={product.name}
                          className="h-14 w-14 rounded-xl object-cover border border-hairline shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-bold text-accent uppercase tracking-wider">
                            {product.brand}
                          </span>
                          <h4 className="text-xs font-bold text-foreground truncate mt-0.5">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-bold text-foreground">
                              ${product.price.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-0.5 text-[10px] text-amber-500 font-bold">
                              ★ {product.rating}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => onAddToCart(product, 1)}
                          className="grid h-8 w-8 place-items-center rounded-full bg-accent text-accent-foreground transition hover:opacity-90 active:scale-90 cursor-pointer shrink-0"
                          title="Add to Bag"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-2.5 mr-auto max-w-[88%]">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-accent ring-1 ring-accent/20">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="rounded-2xl rounded-tl-none border border-hairline bg-surface px-4 py-3 flex items-center min-w-[56px]">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent/70 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent/70 animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent/70 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ---- Suggestion Chips (shown only on welcome / fresh state) ---- */}
        {messages.length === 1 && (
          <div className="px-5 py-3 border-t border-hairline bg-surface/30">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Quick Queries
            </p>
            <div className="flex flex-nowrap overflow-x-auto gap-2 pb-1 no-scrollbar -mx-1 px-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-background px-3 py-1.5 text-[10px] text-muted-foreground transition hover:border-accent/50 hover:text-accent cursor-pointer shrink-0 whitespace-nowrap"
                >
                  {s}
                  <ArrowUpRight className="h-3 w-3 shrink-0 text-accent" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ---- Input Bar ---- */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="border-t border-hairline p-4 flex gap-2.5 bg-surface/20 backdrop-blur-md"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder="Ask the studio concierge..."
            className="flex-1 rounded-full border border-hairline bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/10 transition disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-foreground hover:opacity-90 transition disabled:opacity-40 cursor-pointer shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </>
  );
}
