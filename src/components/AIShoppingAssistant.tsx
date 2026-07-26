import { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  ArrowUpRight, 
  ShoppingBag, 
  Star, 
  Bot, 
  User as UserIcon, 
  Minimize2, 
  RefreshCw 
} from "lucide-react";
import { CATALOG_PRODUCTS, CatalogProduct } from "@/lib/products.data";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: CatalogProduct[];
  timestamp: Date;
}

interface AIShoppingAssistantProps {
  onAddToCart: (product: CatalogProduct, qty?: number) => void;
  onShowSignUpNotice: () => void;
  user: User | null;
}

const SUGGESTIONS = [
  "I need a quiet keyboard under ₱6,000",
  "Recommend an ergonomic setup for coding",
  "Do you have video editing monitors?",
  "What is your return policy?"
];

export function AIShoppingAssistant({ onAddToCart, onShowSignUpNotice, user }: AIShoppingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Welcome to Northlane Studio! I'm your AI Shopping Concierge. I can help you find products, compare specifications, compile workspace setups, or answer store policy questions. What are you looking to craft today?",
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function handleSend(textToSend: string) {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // 1. Attempt to hit the backend AI endpoint
      const response = await fetch("http://localhost:3000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          sessionId: "session-" + (user?.id || "guest"),
          userId: user?.id || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            role: "assistant",
            content: data.reply,
            products: data.products,
            timestamp: new Date()
          }
        ]);
        return;
      }
    } catch (e: any) {
      console.warn("[ConciergeUI] Live API endpoint unreachable, attempting fallback:", e.message);
    }

    // 2. Client-side Simulation Fallback if API server is offline
    setTimeout(() => {
      const lower = textToSend.toLowerCase();
      let matched: CatalogProduct[] = [];
      let reply = "";

      // Simple keywords parser
      const isKeyboard = lower.includes("keyboard") || lower.includes("typing") || lower.includes("keys");
      const isMouse = lower.includes("mouse") || lower.includes("pointing") || lower.includes("mice");
      const isAudio = lower.includes("audio") || lower.includes("headphone") || lower.includes("headphones") || lower.includes("sound") || lower.includes("speaker");
      const isDesk = lower.includes("desk") || lower.includes("table") || lower.includes("standing");
      const isChair = lower.includes("chair") || lower.includes("seating") || lower.includes("sit");
      const isAccessory = lower.includes("lamp") || lower.includes("light") || lower.includes("accessories") || lower.includes("gear");

      // Budget detection
      const budgetMatch = lower.match(/(?:under|below|budget of|max|price of|₱|p)\s*([\d,]+)/i);
      const budgetMax = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, "")) : Infinity;

      if (isKeyboard) {
        matched = CATALOG_PRODUCTS.filter(p => p.category.toLowerCase().includes("keyboard") && p.price <= budgetMax);
        reply = matched.length > 0
          ? `I've found ${matched.length} mechanical keyboard(s) designed for silent, focused typing. Here are my recommendations:`
          : `I see you are looking for keyboards under ₱${budgetMax.toLocaleString()}, but we don't have matches in that exact price range right now. Here are other option(s) in stock:`;
        if (matched.length === 0) matched = CATALOG_PRODUCTS.filter(p => p.category.toLowerCase().includes("keyboard"));
      } else if (isMouse) {
        matched = CATALOG_PRODUCTS.filter(p => p.category.toLowerCase().includes("mouse") && p.price <= budgetMax);
        reply = matched.length > 0
          ? `Here are ergonomic, high-precision mice crafted for professional creator setups:`
          : `No matching mice under that budget, but here are our high-performance models:`;
        if (matched.length === 0) matched = CATALOG_PRODUCTS.filter(p => p.category.toLowerCase().includes("mouse"));
      } else if (isAudio) {
        matched = CATALOG_PRODUCTS.filter(p => p.category.toLowerCase().includes("audio") && p.price <= budgetMax);
        reply = `To help block out ambient noise, I highly recommend our high-fidelity acoustic gear:`;
        if (matched.length === 0) matched = CATALOG_PRODUCTS.filter(p => p.category.toLowerCase().includes("audio"));
      } else if (isDesk) {
        matched = CATALOG_PRODUCTS.filter(p => p.category.toLowerCase().includes("desk") && p.price <= budgetMax);
        reply = `For active ergonomics, here are our solid wood standing desks:`;
        if (matched.length === 0) matched = CATALOG_PRODUCTS.filter(p => p.category.toLowerCase().includes("desk"));
      } else if (isChair) {
        matched = CATALOG_PRODUCTS.filter(p => p.category.toLowerCase().includes("seating") && p.price <= budgetMax);
        reply = `Investing in comfortable seating is crucial. Check out our high-back task chairs:`;
        if (matched.length === 0) matched = CATALOG_PRODUCTS.filter(p => p.category.toLowerCase().includes("seating"));
      } else if (lower.includes("policy") || lower.includes("return") || lower.includes("refund") || lower.includes("ship")) {
        reply = "Northlane offers **Free Express Shipping** on all orders. We also provide a **30-Day Risk-Free Trial**—if you are not completely satisfied with your studio equipment, you can return it within 30 days for a full refund (original packaging required).";
      } else if (lower.includes("setup") || lower.includes("workspace") || lower.includes("recommend")) {
        matched = CATALOG_PRODUCTS.filter(p => p.featured).slice(0, 3);
        reply = "To create a premium workspace setup geared for focus, I recommend starting with a solid wood standing desk, a quiet mechanical keyboard, and matching desk accessories. Here are our top featured essentials:";
      } else {
        // Failed query fallback
        reply = "We don't currently carry that specific item. I've recorded your inquiry so our studio sourcing team can better understand what workspace products customers are looking for. In the meantime, I can help you find premium keyboards, audio monitors, desks, or ergonomic chairs!";
      }

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          content: reply,
          products: matched.slice(0, 2),
          timestamp: new Date()
        }
      ]);
    }, 1500);
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-6 w-6 text-accent animate-pulse" />
        {/* Glowing badge */}
        <span className="absolute top-0 right-0 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
        </span>
      </button>

      {/* Slide-out Chat Drawer */}
      <div
        className={`fixed bottom-0 right-0 top-0 z-50 w-full max-w-md border-l border-hairline bg-background/95 backdrop-blur-2xl shadow-3xl flex flex-col justify-between transition-all duration-500 ease-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
      >
        {/* Sleek top ambient accent gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-indigo-500 to-accent" />

        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4 bg-surface/20">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                Northlane Studio Concierge
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </h2>
              <p className="text-[10px] text-muted-foreground">AI Shopping Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setMessages([
                  {
                    id: "welcome-reset",
                    role: "assistant",
                    content: "Let's restart! How can I help you find the right premium workspace essentials today?",
                    timestamp: new Date()
                  }
                ]);
                toast.success("Conversation reset");
              }}
              title="Reset Chat"
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5 bg-gradient-to-b from-transparent to-surface/20">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full text-xs font-semibold ${
                  msg.role === "user"
                    ? "bg-foreground text-background"
                    : "bg-accent/10 text-accent border border-accent/20"
                }`}
              >
                {msg.role === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div className="space-y-3">
                <div
                  className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-foreground text-background font-medium rounded-tr-none"
                      : "bg-surface border border-hairline text-foreground rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Inline Product Recommendations */}
                {msg.products && msg.products.length > 0 && (
                  <div className="grid gap-2.5 mt-2">
                    {msg.products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3.5 rounded-2xl border border-hairline bg-surface p-3 transition hover:border-foreground/30 shadow-xs"
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
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs font-bold text-foreground">
                              ₱{product.price.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-0.5 text-[10px] text-amber-500 font-bold">
                              ★ {product.rating}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => onAddToCart(product, 1)}
                          className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-background transition hover:bg-foreground/90 active:scale-90 cursor-pointer shrink-0"
                          title="Add to Bag"
                        >
                          <ShoppingBag className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 mr-auto max-w-[85%]">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent border border-accent/20">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-none border border-hairline bg-surface px-4 py-3 flex items-center justify-center min-w-[60px]">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips (Horizontal Scrollable) */}
        {messages.length === 1 && (
          <div className="px-5 py-2.5 border-t border-hairline flex flex-col gap-1.5 bg-surface/5 overflow-hidden">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Suggested Queries</p>
            <div className="flex flex-nowrap overflow-x-auto gap-2 py-1 scrollbar-none scroll-smooth -mx-1 px-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 py-1.5 text-[10px] text-muted-foreground transition hover:border-foreground hover:text-foreground cursor-pointer shrink-0 whitespace-nowrap"
                >
                  {s} <ArrowUpRight className="h-3 w-3 text-accent shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="border-t border-hairline p-4 flex gap-2 bg-surface/30 backdrop-blur-md"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder="Ask the studio concierge..."
            className="flex-1 rounded-full border border-hairline bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition disabled:opacity-70"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background hover:bg-foreground/90 transition disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </>
  );
}
