import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, LogOut, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  isAdmin,
  listJournalPosts,
  upsertJournalPost,
  deleteJournalPost,
  listCustomerStories,
  upsertCustomerStory,
  deleteCustomerStory,
} from "@/lib/cms.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "CMS — Northlane" },
      { name: "description", content: "Edit journal and customer stories." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Tab = "journal" | "stories";

function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("journal");
  const checkAdmin = useServerFn(isAdmin);
  const [adminChecked, setAdminChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    checkAdmin({})
      .then((r) => {
        setAllowed(r.isAdmin);
        setAdminChecked(true);
      })
      .catch(() => {
        setAdminChecked(true);
        setAllowed(false);
      });
  }, [checkAdmin]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (!adminChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">Not an editor</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account isn't marked as an admin editor. Ask an existing admin to grant you access.
          </p>
          <button
            onClick={handleSignOut}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-foreground/40"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-hairline bg-background/80 backdrop-blur">
        <div className="container-editorial flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to site
            </a>
            <span className="text-sm font-semibold">Northlane CMS</span>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      <div className="container-editorial py-10">
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
        <h2 className="text-2xl font-semibold">Journal posts</h2>
        <button
          onClick={() => setEditing(emptyJournal())}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
        >
          <Plus className="h-4 w-4" /> New post
        </button>
      </div>

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">
          No posts yet. The landing page shows default sample posts until you create some.
        </p>
      ) : (
        <div className="divide-y divide-hairline rounded-2xl border border-hairline bg-surface">
          {data.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 items-center gap-4">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded-lg bg-muted" />
                )}
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {p.tag} · {p.read_time}
                  </div>
                  <div className="truncate text-sm font-medium">{p.title}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(p as JournalRow)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-foreground/40"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(p.id)}
                  className="rounded-full p-1.5 text-muted-foreground hover:text-red-600"
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
      className="space-y-4"
    >
      <Field label="Tag">
        <input
          value={row.tag}
          onChange={(e) => setRow({ ...row, tag: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          maxLength={40}
          required
        />
      </Field>
      <Field label="Title">
        <input
          value={row.title}
          onChange={(e) => setRow({ ...row, title: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          maxLength={200}
          required
        />
      </Field>
      <Field label="Read time (e.g. 6 min)">
        <input
          value={row.read_time}
          onChange={(e) => setRow({ ...row, read_time: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          maxLength={20}
          required
        />
      </Field>
      <Field label="Image URL (optional)">
        <input
          value={row.image_url ?? ""}
          onChange={(e) => setRow({ ...row, image_url: e.target.value })}
          placeholder="https://…"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </Field>
      <Field label="Sort order (lower shows first)">
        <input
          type="number"
          value={row.sort_order}
          onChange={(e) => setRow({ ...row, sort_order: Number(e.target.value) })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
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
        <h2 className="text-2xl font-semibold">Customer stories</h2>
        <button
          onClick={() => setEditing(emptyStory())}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
        >
          <Plus className="h-4 w-4" /> New story
        </button>
      </div>

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">
          No stories yet. The landing page shows the default sample story until you create one.
        </p>
      ) : (
        <div className="divide-y divide-hairline rounded-2xl border border-hairline bg-surface">
          {data.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 items-center gap-4">
                {s.image_url ? (
                  <img
                    src={s.image_url}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded-lg bg-muted" />
                )}
                <div className="min-w-0">
                  <div className="text-sm font-medium">{s.customer_name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {s.customer_role} · "{s.quote}"
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(s as StoryRow)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-foreground/40"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(s.id)}
                  className="rounded-full p-1.5 text-muted-foreground hover:text-red-600"
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
      className="space-y-4"
    >
      <Field label="Customer name">
        <input
          value={row.customer_name}
          onChange={(e) => setRow({ ...row, customer_name: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          maxLength={120}
          required
        />
      </Field>
      <Field label="Role · Location">
        <input
          value={row.customer_role ?? ""}
          onChange={(e) => setRow({ ...row, customer_role: e.target.value })}
          placeholder="Product Designer · Madrid"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          maxLength={200}
        />
      </Field>
      <Field label="Quote (short headline)">
        <input
          value={row.quote}
          onChange={(e) => setRow({ ...row, quote: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
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
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </Field>
      <Field label="Portrait image URL (optional)">
        <input
          value={row.image_url ?? ""}
          onChange={(e) => setRow({ ...row, image_url: e.target.value })}
          placeholder="https://…"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </Field>
      <Field label="Sort order (lower shows first)">
        <input
          type="number"
          value={row.sort_order}
          onChange={(e) => setRow({ ...row, sort_order: Number(e.target.value) })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
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
      <span className="mb-1 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function FormActions({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-full border border-border px-4 py-2 text-sm hover:border-foreground/40"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-background p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-6 text-lg font-semibold">{title}</h3>
        {children}
      </div>
    </div>
  );
}
