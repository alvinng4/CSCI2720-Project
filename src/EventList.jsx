import React from "react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, isAdmin } from "@/lib/AuthContext";
import { adminStore } from "@/lib/adminStore";

const { listEvents, createEvent, updateEvent, deleteEvent } = adminStore;

export function EventList() {
  const { user } = useAuth();
  const admin = isAdmin(user);
  return admin ? <EventListAdmin /> : <EventListPublic />;
}

/*Public*/
function EventListPublic() {
  const [rows, setRows] = React.useState([]);
  React.useEffect(() => setRows(listEvents()), []);
  return (
    <PageShell title="Event List">
      <div className="rounded-2xl border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Venue</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Price</th>
              <th className="px-3 py-2 text-left">Presenter(s)</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td className="px-3 py-6 text-center text-muted-foreground" colSpan={5}>No events.</td></tr>
            ) : rows.map(r => (
              <tr key={r.id} className="border-b last:border-none">
                <td className="px-3 py-3">{r.title}</td>
                <td className="px-3 py-3">{r.venue}</td>
                <td className="px-3 py-3">{fmtDateTime(r.date)}</td>
                <td className="px-3 py-3">{r.price ?? "—"}</td>
                <td className="px-3 py-3">{r.presenters ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}

/*Admin*/
function EventListAdmin() {
  const [allRows, setAllRows] = React.useState([]);
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [showCreate, setShowCreate] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [lastUpdated, setLastUpdated] = React.useState(new Date());

  React.useEffect(() => {
    setAllRows(listEvents());
    setLastUpdated(new Date());
  }, []);

  const rows = React.useMemo(() => {
    const filtered = q.trim()
      ? allRows.filter(r => r.title?.toLowerCase().includes(q.trim().toLowerCase()))
      : allRows;
    return filtered;
  }, [allRows, q]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  function onCreate(payload) {
    const doc = createEvent(payload);
    setAllRows(prev => [doc, ...prev]);
    setShowCreate(false);
    setLastUpdated(new Date());
    setPage(1);
  }

  function onSave(id, patch) {
    const updated = updateEvent(id, patch);
    setAllRows(prev => prev.map(x => (x.id === id ? updated : x)));
    setEditing(null);
    setLastUpdated(new Date());
  }

  function onDelete(id) {
    if (!confirm("Delete this event?")) return;
    deleteEvent(id);
    setAllRows(prev => prev.filter(x => x.id !== id));
    setLastUpdated(new Date());
  }

  return (
    <PageShell>
      {/* Top Toolbar */}
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border p-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreate(true)}>New Event</Button>
          <Input
            className="w-[280px]"
            placeholder="Search events by title..."
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
          />
        </div>

        <div className="text-xs text-muted-foreground">
          Last Updated on {fmtLastUpdated(lastUpdated)}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-xs">Page {page} of {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Create panel*/}
      {showCreate && (
        <CreateEventPanel
          onCancel={() => setShowCreate(false)}
          onCreate={onCreate}
        />
      )}

      {/* Table */}
      <div className="rounded-2xl border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 text-left">EVENT TITLE</th>
              <th className="px-3 py-2 text-left">DESCRIPTION</th>
              <th className="px-3 py-2 text-left">VENUE</th>
              <th className="px-3 py-2 text-left">PRICE</th>
              <th className="px-3 py-2 text-left">PRESENTER(S)</th>
              <th className="px-3 py-2 text-left">DATE &amp; TIME</th>
              <th className="px-3 py-2 text-left">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-muted-foreground" colSpan={7}>
                  No events.
                </td>
              </tr>
            ) : (
              pageRows.map((r) => (
                <tr key={r.id} className="border-b last:border-none align-top">
                  <td className="px-3 py-3">
                    {editing?.id === r.id ? (
                      <InlineEdit
                        initial={r}
                        onCancel={() => setEditing(null)}
                        onSave={(patch) => onSave(r.id, patch)}
                      />
                    ) : (
                      <div className="max-w-[260px] pr-2">{r.title}</div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {editing?.id === r.id ? null : (r.description ?? "N/A")}
                  </td>
                  <td className="px-3 py-3">{editing?.id === r.id ? null : r.venue}</td>
                  <td className="px-3 py-3">{editing?.id === r.id ? null : (r.price ?? "—")}</td>
                  <td className="px-3 py-3">
                    {editing?.id === r.id ? null : (
                      r.presenters ? (
                        <span className="inline-block rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                          Presented by {r.presenters}
                        </span>
                      ) : "—"
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {editing?.id === r.id ? null : fmtDateTime(r.date)}
                  </td>
                  <td className="px-3 py-3">
                    {editing?.id === r.id ? null : (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditing(r)}>Update</Button>
                        <Button size="sm" variant="outline" onClick={() => onDelete(r.id)}>Delete</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}

/* create panel */
function CreateEventPanel({ onCreate, onCancel }) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [venue, setVenue] = React.useState("");
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [presenters, setPresenters] = React.useState("");

  function submit() {
    if (!title || !venue || !date) return;
    const iso = time ? `${date}T${time}` : date;
    onCreate({ title, description, venue, date: iso, price, presenters });
  }

  return (
    <div className="mb-4 rounded-2xl border p-4">
      <h3 className="mb-3 font-semibold">New Event</h3>
      <div className="grid gap-3 md:grid-cols-[1fr,1fr,180px,140px,1fr,1fr]">
        <Input placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} required />
        <Input placeholder="Venue" value={venue} onChange={(e)=>setVenue(e.target.value)} required />
        <Input type="date" value={date} onChange={(e)=>setDate(e.target.value)} required />
        <Input type="time" value={time} onChange={(e)=>setTime(e.target.value)} />
        <Input placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} />
        <Input placeholder="Presenter(s) / Price" value={presenters} onChange={(e)=>setPresenters(e.target.value)} />
      </div>
      <div className="mt-3 flex gap-2">
        <Button variant="outline" onClick={submit}>Create</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

/* inline editor (same fields aligned with table) */
function InlineEdit({ initial, onSave, onCancel }) {
  const [title, setTitle] = React.useState(initial.title);
  const [description, setDescription] = React.useState(initial.description ?? "");
  const [venue, setVenue] = React.useState(initial.venue ?? "");
  const [date, setDate] = React.useState((initial.date || "").slice(0,10));
  const [time, setTime] = React.useState(initial.date?.slice(11,16) || "");
  const [price, setPrice] = React.useState(initial.price ?? "");
  const [presenters, setPresenters] = React.useState(initial.presenters ?? "");

  function submit() {
    const iso = time ? `${date}T${time}` : date;
    onSave({ title, description, venue, date: iso, price, presenters });
  }

  return (
    <div className="rounded-lg border p-3">
      <div className="grid gap-3 md:grid-cols-[1fr,1fr,160px,120px,1fr,1fr]">
        <Input value={title} onChange={e=>setTitle(e.target.value)} />
        <Input value={venue} onChange={e=>setVenue(e.target.value)} />
        <Input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <Input type="time" value={time} onChange={e=>setTime(e.target.value)} />
        <Input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" />
        <Input value={presenters} onChange={e=>setPresenters(e.target.value)} placeholder="Presenter(s) / Price" />
      </div>
      <div className="flex gap-2 pt-3">
        <Button variant="outline" onClick={submit}>Save changes</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

/* helpers */
function fmtLastUpdated(d) {
  //"24/10/2025, 14:07:12"
  const pad = (n) => String(n).padStart(2, "0");
  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${dd}/${mm}/${yyyy}, ${hh}:${mi}:${ss}`;
}

function fmtDateTime(iso) {
  if (!iso) return "—";
  const dt = new Date(iso);
  if (isNaN(dt)) return iso;
  const day = dt.toLocaleDateString(undefined, { day: "2-digit" });
  const mon = dt.toLocaleDateString(undefined, { month: "short" });
  const yr = dt.getFullYear();
  const wk = dt.toLocaleDateString(undefined, { weekday: "short" });
  const t = dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  //"1 Dec 2024 (Sun) 7:30pm"
  return `${day} ${mon} ${yr} (${wk}) ${t}`.replace("AM","am").replace("PM","pm");
}
