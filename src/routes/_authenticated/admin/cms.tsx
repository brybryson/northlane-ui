import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  listJournalPosts,
  upsertJournalPost,
  deleteJournalPost,
  listCustomerStories,
  upsertCustomerStory,
  deleteCustomerStory,
} from "@/lib/cms.functions";

export const Route = createFileRoute("/_authenticated/admin/cms")({
  component: CMSPage,
});

type Tab = "journal" | "stories";

function CMSPage() {
  const [tab, setTab] = useState<Tab>("journal");

  return (
    <div>
      <div className="mb-8 flex gap-2 border-b border-hairline">
        {(["journal", "stories"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium capitalize transition ${
              tab === t
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "journal" ? "Journal" : "Customer stories"}
          </button>
        ))}
      </div>

      {tab === "journal" ? <JournalManager /> : <StoriesManager />}
    </div>
  );
}

/* ----------------- Journal ----------------- */

type JournalRow = {
  id: string;
  tag: string;
  title: string;
  read_time: string;
  image_url: string | null;
  sort_order: number;
};

function emptyJournal(): JournalRow {
  return { id: "", tag: "Guide", title: "", read_time: "5 min", image_url: "", sort_order: 0 };
}

function JournalManager() {
  const qc = useQueryClient();
  const list = useServerFn(listJournalPosts);
  const upsert = useServerFn(upsertJournalPost);
  const del = useServerFn(deleteJournalPost);
  const [editing, setEditing] = useState<JournalRow | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-journal"],
    queryFn: () => list({}),
  });

  async function save(row: JournalRow) {
    try {
      await upsert({
        data: {
          id: row.id || undefined,
          tag: row.tag,
          title: row.title,
          read_time: row.read_time,
          image_url: row.image_url || undefined,
          sort_order: Number(row.sort_order) || 0,
        },
      });
      toast.success(row.id ? "Post updated" : "Post created");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-journal"] });
      qc.invalidateQueries({ queryKey: ["journal-posts"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this journal post?")) return;
    try {
      await del({ data: { id } });
      toast.success("Post deleted");
      qc.invalidateQueries({ queryKey: ["admin-journal"] });
      qc.invalidateQueries({ queryKey: ["journal-posts"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Journal posts</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage articles and guides shown on the landing page.</p>
        </div>
        <button
          onClick={() => setEditing(emptyJournal())}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> New post
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : !data?.length ? (
        <div className="rounded-2xl border border-hairline bg-surface/50 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No posts yet. The landing page shows default sample posts until you create some.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-hairline rounded-2xl border border-hairline bg-surface">
          {data.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/20">
              <div className="flex min-w-0 items-center gap-4">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg object-cover border border-hairline"
                  />
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded-lg bg-muted border border-hairline flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">No Img</span>
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {p.tag} · {p.read_time}
                  </div>
                  <div className="truncate text-sm font-medium mt-0.5">{p.title}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(p as JournalRow)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-foreground/40 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(p.id)}
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? "Edit post" : "New post"}>
          <JournalForm value={editing} onSave={save} onCancel={() => setEditing(null)} />
        </Modal>
      )}
    </section>
  );
}

function JournalForm({
  value,
  onSave,
  onCancel,
}: {
  value: JournalRow;
  onSave: (r: JournalRow) => void;
  onCancel: () => void;
}) {
  const [row, setRow] = useState(value);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(row);
      }}
      className="space-y-5"
    >
      <Field label="Tag">
        <input
          value={row.tag}
          onChange={(e) => setRow({ ...row, tag: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground/40"
          maxLength={40}
          required
        />
      </Field>
      <Field label="Title">
        <input
          value={row.title}
          onChange={(e) => setRow({ ...row, title: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground/40"
          maxLength={200}
          required
        />
      </Field>
      <Field label="Read time (e.g. 6 min)">
        <input
          value={row.read_time}
          onChange={(e) => setRow({ ...row, read_time: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground/40"
          maxLength={20}
          required
        />
      </Field>
      <Field label="Image URL (optional)">
        <input
          value={row.image_url ?? ""}
          onChange={(e) => setRow({ ...row, image_url: e.target.value })}
          placeholder="https://…"
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground/40"
        />
      </Field>
      <Field label="Sort order (lower shows first)">
        <input
          type="number"
          value={row.sort_order}
          onChange={(e) => setRow({ ...row, sort_order: Number(e.target.value) })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground/40"
        />
      </Field>
      <FormActions onCancel={onCancel} />
    </form>
  );
}

/* ----------------- Stories ----------------- */

type StoryRow = {
  id: string;
  customer_name: string;
  customer_role: string | null;
  quote: string;
  body: string | null;
  image_url: string | null;
  sort_order: number;
};

function emptyStory(): StoryRow {
  return {
    id: "",
    customer_name: "",
    customer_role: "",
    quote: "",
    body: "",
    image_url: "",
    sort_order: 0,
  };
}

function StoriesManager() {
  const qc = useQueryClient();
  const list = useServerFn(listCustomerStories);
  const upsert = useServerFn(upsertCustomerStory);
  const del = useServerFn(deleteCustomerStory);
  const [editing, setEditing] = useState<StoryRow | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-stories"],
    queryFn: () => list({}),
  });

  async function save(row: StoryRow) {
    try {
      await upsert({
        data: {
          id: row.id || undefined,
          customer_name: row.customer_name,
          customer_role: row.customer_role || undefined,
          quote: row.quote,
          body: row.body || undefined,
          image_url: row.image_url || undefined,
          sort_order: Number(row.sort_order) || 0,
        },
      });
      toast.success(row.id ? "Story updated" : "Story created");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-stories"] });
      qc.invalidateQueries({ queryKey: ["customer-stories"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this customer story?")) return;
    try {
      await del({ data: { id } });
      toast.success("Story deleted");
      qc.invalidateQueries({ queryKey: ["admin-stories"] });
      qc.invalidateQueries({ queryKey: ["customer-stories"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Customer stories</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage testimonials shown on the landing page.</p>
        </div>
        <button
          onClick={() => setEditing(emptyStory())}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> New story
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : !data?.length ? (
        <div className="rounded-2xl border border-hairline bg-surface/50 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No stories yet. The landing page shows the default sample story until you create one.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-hairline rounded-2xl border border-hairline bg-surface">
          {data.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/20">
              <div className="flex min-w-0 items-center gap-4">
                {s.image_url ? (
                  <img
                    src={s.image_url}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-full object-cover border border-hairline"
                  />
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded-full bg-muted border border-hairline flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">No Img</span>
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-sm font-medium">{s.customer_name}</div>
                  <div className="truncate text-xs text-muted-foreground mt-0.5">
                    {s.customer_role} · "{s.quote}"
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(s as StoryRow)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-foreground/40 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(s.id)}
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? "Edit story" : "New story"}>
          <StoryForm value={editing} onSave={save} onCancel={() => setEditing(null)} />
        </Modal>
      )}
    </section>
  );
}

function StoryForm({
  value,
  onSave,
  onCancel,
}: {
  value: StoryRow;
  onSave: (r: StoryRow) => void;
  onCancel: () => void;
}) {
  const [row, setRow] = useState(value);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(row);
      }}
      className="space-y-5"
    >
      <Field label="Customer name">
        <input
          value={row.customer_name}
          onChange={(e) => setRow({ ...row, customer_name: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground/40"
          maxLength={120}
          required
        />
      </Field>
      <Field label="Role · Location">
        <input
          value={row.customer_role ?? ""}
          onChange={(e) => setRow({ ...row, customer_role: e.target.value })}
          placeholder="Product Designer · Madrid"
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground/40"
          maxLength={200}
        />
      </Field>
      <Field label="Quote (short headline)">
        <input
          value={row.quote}
          onChange={(e) => setRow({ ...row, quote: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground/40"
          maxLength={400}
          required
        />
      </Field>
      <Field label="Story body (optional)">
        <textarea
          value={row.body ?? ""}
          onChange={(e) => setRow({ ...row, body: e.target.value })}
          rows={4}
          maxLength={2000}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground/40 resize-none"
        />
      </Field>
      <Field label="Portrait image URL (optional)">
        <input
          value={row.image_url ?? ""}
          onChange={(e) => setRow({ ...row, image_url: e.target.value })}
          placeholder="https://…"
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground/40"
        />
      </Field>
      <Field label="Sort order (lower shows first)">
        <input
          type="number"
          value={row.sort_order}
          onChange={(e) => setRow({ ...row, sort_order: Number(e.target.value) })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground/40"
        />
      </Field>
      <FormActions onCancel={onCancel} />
    </form>
  );
}

/* ----------------- Shared UI ----------------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium">
        {label}
      </span>
      {children}
    </label>
  );
}

function FormActions({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-hairline">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/90 transition-colors shadow-sm"
      >
        Save
      </button>
    </div>
  );
}

function Modal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-background p-8 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-6 text-xl font-semibold tracking-tight">{title}</h3>
        {children}
      </div>
    </div>
  );
}
