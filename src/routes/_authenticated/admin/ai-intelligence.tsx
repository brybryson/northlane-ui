import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, TrendingUp, ThumbsUp, ThumbsDown, MessageSquare, Target } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/ai-intelligence")({
  component: AIIntelligencePage,
});

function AIIntelligencePage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">Analyze how the AI Shopping Assistant is interacting with your customers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AICard title="Total AI Conversations" value="4,812" icon={MessageSquare} />
        <AICard title="Recommendation Acceptance" value="82%" icon={Target} />
        <AICard title="Products Recommended" value="9,420" icon={Sparkles} />
        <AICard title="AI Assisted Orders" value="1,126" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-hairline bg-surface/50 p-6 flex flex-col">
          <h3 className="font-semibold tracking-tight mb-6">Popular Customer Questions</h3>
          <div className="flex-1 space-y-4">
            <QuestionItem text="What are the best mechanical keyboards for programming?" count={142} />
            <QuestionItem text="Can you recommend a monitor for the MacBook Pro M3?" count={98} />
            <QuestionItem text="What are the dimensions of the standing desk?" count={87} />
            <QuestionItem text="Do you have any USB-C hubs with HDMI?" count={64} />
            <QuestionItem text="How long does shipping take to Australia?" count={51} />
          </div>
        </div>

        <div className="rounded-2xl border border-hairline bg-surface/50 p-6 flex flex-col">
          <h3 className="font-semibold tracking-tight mb-6">AI Performance & Satisfaction</h3>
          <div className="space-y-8">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Average Recommendation Confidence</span>
                <span className="font-medium">94%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: '94%' }} />
              </div>
            </div>
            
            <div className="pt-4 border-t border-hairline flex gap-8">
              <div className="flex-1 rounded-xl bg-green-500/5 border border-green-500/10 p-4 text-center">
                <ThumbsUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-semibold tracking-tight text-green-500">1,204</div>
                <div className="text-xs text-green-600/70 uppercase tracking-widest mt-1">Helpful</div>
              </div>
              <div className="flex-1 rounded-xl bg-red-500/5 border border-red-500/10 p-4 text-center">
                <ThumbsDown className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-semibold tracking-tight text-red-500">42</div>
                <div className="text-xs text-red-600/70 uppercase tracking-widest mt-1">Not Helpful</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AICard({ title, value, icon: Icon }: any) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface/50 p-5 flex flex-col justify-between group">
      <div className="flex items-center justify-between text-muted-foreground mb-4">
        <span className="text-xs font-medium">{title}</span>
        <Icon className="h-4 w-4 opacity-70 group-hover:text-accent transition-colors" />
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-semibold tracking-tight">{value}</span>
      </div>
    </div>
  );
}

function QuestionItem({ text, count }: any) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-sm text-foreground/80 line-clamp-1">"{text}"</span>
      <span className="text-xs font-medium bg-muted px-2 py-1 rounded-md text-muted-foreground">{count} times</span>
    </div>
  );
}
