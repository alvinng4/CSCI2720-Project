import {
  fetchEvents,
  createEventAPI,
  updateEventAPI,
  deleteEventAPI,
} from "@/lib/events.api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/page-shell";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getUser, isAdmin } from "@/lib/AuthHelpers";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchLocations } from "@/lib/locations.api";

const EventTableContext = createContext(null);

export function EventList() {
  const user = getUser();
  const admin = isAdmin(user);
  const [errorMsg, setErrorMsg] = useState("");
  const [rows, setRows] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(() => {
    const v = localStorage.getItem("events/lastUpdatedAt");
    return v ? new Date(v) : null; // null until you mutate
  });

  function bumpUpdatedAt() {
    const now = new Date();
    setUpdatedAt(now);
    localStorage.setItem("events/lastUpdatedAt", now.toISOString());
  }

  useEffect(() => {
    (async () => {
      try {
        setErrorMsg("");
        const data = await fetchEvents();
        const arr = Array.isArray(data) ? data : (data?.data ?? []);
        setRows(
          arr.map((e) => ({
            id: e._id,
            title: e.title,
            description: e.description ?? "",
            price: e.price ?? "",
            presenters: e.presenter ?? e.presenters ?? "",
            venue: e.venue,
            venueId: e.venueId,
            dateTime: [e.date, e.time].filter(Boolean).join(" "),
            date: e.date,
            time: e.time,
          }))
        );
      } catch (e) {
        console.error(e);
        setErrorMsg(e.message || "Failed to fetch events");
        setRows([]);
      }
    })();
  }, []);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState(null);
  const [editingDescription, setEditingDescription] = useState(null);
  const [editingDate, setEditingDate] = useState(null);
  const [editingTime, setEditingTime] = useState(null);
  const [editingPrice, setEditingPrice] = useState(null);
  const [editingPresenters, setEditingPresenters] = useState(null);
  const [editingVenueId, setEditingVenueId] = useState(null);
  const [editingVenueName, setEditingVenueName] = useState(null);
  const [venues, setVenues] = useState([]);

  /* Handlers */
  async function onCreate(eventData) {
    try {
      setErrorMsg("");
      const created = await createEventAPI(buildEventPayload(eventData));
      setRows((prev) => [
        {
          id: created._id,
          title: created.title,
          description: created.description ?? "",
          price: created.price ?? "",
          presenters: created.presenter ?? "",
          venue: created.venue,
          venueId: created.venueId,
          dateTime: [created.date, created.time].filter(Boolean).join(" "),
          date: created.date,
          time: created.time,
        },
        ...prev,
      ]);
      setIsCreating(false);
      bumpUpdatedAt();
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to create event");
      setErrorMsg(e.message || "Failed to create event");
    }
  }

  function buildEventPayload({
    title,
    description,
    date,
    time,
    price,
    presenters,
    venueId,
    venue,
  }) {
    return {
      title: title?.trim(),
      description: description || undefined,
      date, // REQUIRED by backend
      time, // REQUIRED by backend
      price: price || undefined,
      presenter: presenters || undefined,
      venueId, // REQUIRED by backend
      venue, // REQUIRED by backend (denormalized venue name)
    };
  }

  function startCreating() {
    setIsCreating(true);
  }

  function cancelCreating() {
    setIsCreating(false);
  }

  function startEditing(id) {
    const editingEvent = rows.find((event) => event.id === id);
    if (editingEvent) {
      setEditingId(id);
      setEditingTitle(editingEvent.title);
      setEditingDescription(editingEvent.description);
      setEditingDate(editingEvent.date);
      setEditingTime(editingEvent.time);
      setEditingPrice(editingEvent.price);
      setEditingPresenters(editingEvent.presenters);
      setEditingVenueId(editingEvent.venueId);
      setEditingVenueName(editingEvent.venue);
    }
  }

  function stopEditing() {
    setEditingId(null);
    setEditingTitle(null);
    setEditingDescription(null);
    setEditingDate(null);
    setEditingTime(null);
    setEditingPrice(null);
    setEditingPresenters(null);
  }

  async function saveEdit(id) {
    try {
      setErrorMsg("");
      const patch = buildEventPayload({
        title: editingTitle,
        description: editingDescription,
        date: editingDate,
        time: editingTime,
        price: editingPrice,
        presenters: editingPresenters,
        venueId: editingVenueId,
        venue: editingVenueName,
      });
      const updated = await updateEventAPI(id, patch);
      setRows((prev) =>
        prev.map((x) =>
          x.id === id
            ? {
                id: updated._id,
                title: updated.title,
                description: updated.description ?? "",
                price: updated.price ?? "",
                presenters: updated.presenter ?? "",
                venue: updated.venue,
                venueId: updated.venueId,
                dateTime: [updated.date, updated.time]
                  .filter(Boolean)
                  .join(" "),
                date: updated.date,
                time: updated.time,
              }
            : x
        )
      );
      stopEditing();
      bumpUpdatedAt();
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to save event");
      setErrorMsg(e.message || "Failed to save event");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this event?")) return;
    try {
      setErrorMsg("");
      await deleteEventAPI(id);
      setRows((prev) => prev.filter((x) => x.id !== id));
      bumpUpdatedAt();
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to delete event");
      setErrorMsg(e.message || "Failed to delete event");
    }
  }

  /* Columns (created once only to prevent input issues) */
  const columns = useMemo(() => {
    const W = {
      title: 320,
      desc: 160,
      venue: 160,
      dt: 140,
      price: 140,
      presenters: 220,
      actions: 180,
    };

    const baseColumns = [
      {
        accessorKey: "title",
        title: "Title",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Title" />
        ),
        cell: ({ row }) => {
          const { editingId, editingTitle, setEditingTitle } =
            useContext(EventTableContext);
          const isEditing = editingId === row.original.id;
          if (isEditing) {
            return (
              <div style={{ width: W.title }}>
                <Input
                  value={editingTitle ?? ""}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  autoFocus
                />
              </div>
            );
          }
          return (
            <div
              style={{ width: W.title }}
              className="whitespace-pre-wrap break-words leading-6 py-4"
              title={row.original.title}
            >
              {row.original.title}
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        title: "Description",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ row }) => {
          const { editingId, editingDescription, setEditingDescription } =
            useContext(EventTableContext);
          const isEditing = editingId === row.original.id;
          if (isEditing) {
            return (
              <div style={{ width: W.desc }}>
                <Input
                  value={editingDescription ?? ""}
                  onChange={(e) => setEditingDescription(e.target.value)}
                />
              </div>
            );
          }
          return (
            <div
              style={{ width: W.desc }}
              className="whitespace-pre-wrap break-words leading-6 py-4 text-muted-foreground"
              title={row.original.description}
            >
              {row.original.description || "N/A"}
            </div>
          );
        },
      },
      {
        accessorKey: "venue",
        title: "Venue",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Venue" />
        ),
        cell: ({ row }) => {
          const {
            editingId,
            venues,
            editingVenueId,
            setEditingVenueId,
            editingVenueName,
            setEditingVenueName,
          } = useContext(EventTableContext);
          const isEditing = editingId === row.original.id;

          if (isEditing) {
            return (
              <div style={{ width: W.venue }}>
                <select
                  className="border rounded-md px-2 py-2 w-full"
                  value={editingVenueId ?? ""}
                  onChange={(e) => {
                    const id = e.target.value;
                    setEditingVenueId(id);
                    const v = venues.find((x) => (x._id || x.id) === id);
                    setEditingVenueName(v?.nameE || v?.name || "");
                  }}
                >
                  <option value="">Select a venue</option>
                  {venues.map((v) => (
                    <option key={v._id || v.id} value={v._id || v.id}>
                      {v.nameE || v.name}
                    </option>
                  ))}
                </select>
              </div>
            );
          }
          return (
            <div
              style={{ width: W.venue }}
              className="truncate"
              title={row.original.venue}
            >
              {row.original.venue || "—"}
            </div>
          );
        },
      },
      {
        accessorKey: "dateTime",
        title: "Date & Time",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Date & Time" />
        ),
        cell: ({ row }) => {
          const {
            editingId,
            editingDate,
            setEditingDate,
            editingTime,
            setEditingTime,
          } = useContext(EventTableContext);
          const isEditing = editingId === row.original.id;

          if (isEditing) {
            return (
              <div style={{ width: W.dt }} className="flex items-center gap-2">
                <Input
                  type="date"
                  value={editingDate ?? ""}
                  onChange={(e) => setEditingDate(e.target.value)}
                />
                <Input
                  type="time"
                  value={editingTime ?? ""}
                  onChange={(e) => setEditingTime(e.target.value)}
                />
              </div>
            );
          }

          const d = row.original.date;
          const t = row.original.time;
          const txt =
            !d && !t ? "—" : `${d ?? ""}${d && t ? " " : ""}${t ?? ""}`;
          return (
            <div
              style={{ width: W.dt }}
              className="truncate whitespace-nowrap"
              title={txt}
            >
              {txt}
            </div>
          );
        },
      },
      {
        accessorKey: "price",
        title: "Price",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Price" />
        ),
        cell: ({ row }) => {
          const { editingId, editingPrice, setEditingPrice } =
            useContext(EventTableContext);
          const isEditing = editingId === row.original.id;
          if (isEditing) {
            return (
              <div style={{ width: W.price }}>
                <Input
                  value={editingPrice ?? ""}
                  onChange={(e) => setEditingPrice(e.target.value)}
                />
              </div>
            );
          }
          return (
            <div
              style={{ width: W.price }}
              className="truncate"
              title={row.original.price}
            >
              {row.original.price || "—"}
            </div>
          );
        },
      },
      {
        accessorKey: "presenters",
        title: "Presenter(s)",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Presenter(s)" />
        ),
        cell: ({ row }) => {
          const { editingId, editingPresenters, setEditingPresenters } =
            useContext(EventTableContext);
          const isEditing = editingId === row.original.id;

          if (isEditing) {
            return (
              <div style={{ width: W.presenters }}>
                <Input
                  value={editingPresenters ?? ""}
                  onChange={(e) => setEditingPresenters(e.target.value)}
                />
              </div>
            );
          }

          const txt = row.original.presenters || "—";
          return (
            <div style={{ width: W.presenters }} className="py-4">
              {row.original.presenters ? (
                <span
                  className="inline-block max-w-full whitespace-normal break-words rounded-md bg-green-100 text-green-800 px-3 py-2 text-sm leading-6"
                  title={txt}
                >
                  {txt}
                </span>
              ) : (
                "—"
              )}
            </div>
          );
        },
      },
    ];

    if (admin) {
      baseColumns.push({
        id: "actions",
        cell: ({ row }) => <ActionsCell row={row} />,
        enableSorting: false,
      });
    }

    return baseColumns;
  }, [admin]);

  /* Context values for table */
  const contextValue = {
    editingId,
    editingTitle,
    setEditingTitle,
    editingDescription,
    setEditingDescription,
    editingDate,
    setEditingDate,
    editingTime,
    setEditingTime,
    editingPrice,
    setEditingPrice,
    editingPresenters,
    setEditingPresenters,
    editingVenueId,
    setEditingVenueId,
    editingVenueName,
    setEditingVenueName,
    venues,
    startEditing,
    stopEditing,
    saveEdit,
    handleDelete,
  };

  return (
    <PageShell title="Event List">
      {admin && (
        <CreateNewEventSheet
          isCreating={isCreating}
          onCreate={onCreate}
          onCancel={cancelCreating}
        />
      )}
      <EventTableContext.Provider value={contextValue}>
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={rows}
            renderToolbar={() => (
              <div className="ml-auto flex items-center gap-3">
                {updatedAt && (
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    Last Updated on {fmtLastUpdated(updatedAt)}
                  </span>
                )}
                {admin && <Toolbar startCreating={startCreating} />}
              </div>
            )}
            renderSideMenu={(table) => <EventSideMenu table={table} />}
          />
        </div>
      </EventTableContext.Provider>
    </PageShell>
  );
}

function TitleCell({ row }) {
  const { editingId, editingTitle, setEditingTitle } =
    useContext(EventTableContext);
  const isEditing = editingId === row.original.id;

  if (isEditing) {
    return (
      <Input
        value={editingTitle ?? ""}
        onChange={(e) => setEditingTitle(e.target.value)}
        autoFocus
      />
    );
  }
  return row.original.title;
}

function DescriptionCell({ row }) {
  const { editingId, editingDescription, setEditingDescription } =
    useContext(EventTableContext);
  const isEditing = editingId === row.original.id;

  if (isEditing) {
    return (
      <Input
        value={editingDescription ?? ""}
        onChange={(e) => setEditingDescription(e.target.value)}
        autoFocus
      />
    );
  }
  return row.original.description;
}

function VenueCell({ row }) {
  const {
    editingId,
    venues,
    editingVenueId,
    setEditingVenueId,
    editingVenueName,
    setEditingVenueName,
  } = useContext(EventTableContext);

  const isEditing = editingId === row.original.id;

  if (isEditing) {
    return (
      <select
        className="border rounded-md px-2 py-2 w-full"
        value={editingVenueId ?? ""}
        onChange={(e) => {
          const id = e.target.value;
          setEditingVenueId(id);
          const v = venues.find((x) => (x._id || x.id) === id);
          setEditingVenueName(v?.nameE || v?.name || "");
        }}
      >
        <option value="">Select a venue</option>
        {venues.map((v) => (
          <option key={v._id || v.id} value={v._id || v.id}>
            {v.nameE || v.name}
          </option>
        ))}
      </select>
    );
  }

  // read-only view
  return row.original.venue || "—";
}

function DateTimeCell({ row }) {
  const {
    editingId,
    editingDate,
    setEditingDate,
    editingTime,
    setEditingTime,
  } = useContext(EventTableContext);

  const isEditing = editingId === row.original.id;

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={editingDate ?? ""}
          onChange={(e) => setEditingDate(e.target.value)}
        />
        <Input
          type="time"
          value={editingTime ?? ""}
          onChange={(e) => setEditingTime(e.target.value)}
        />
      </div>
    );
  }

  const d = row.original.date;
  const t = row.original.time;
  if (!d && !t) return "—";
  return `${d ?? ""}${d && t ? " " : ""}${t ?? ""}`;
}

function PriceCell({ row }) {
  const { editingId, editingPrice, setEditingPrice } =
    useContext(EventTableContext);
  const isEditing = editingId === row.original.id;

  if (isEditing) {
    return (
      <Input
        value={editingPrice ?? ""}
        onChange={(e) => setEditingPrice(e.target.value)}
        autoFocus
      />
    );
  }
  return row.original.price;
}

function PresentersCell({ row }) {
  const { editingId, editingPresenters, setEditingPresenters } =
    useContext(EventTableContext);
  const isEditing = editingId === row.original.id;

  if (isEditing) {
    return (
      <Input
        value={editingPresenters ?? ""}
        onChange={(e) => setEditingPresenters(e.target.value)}
        autoFocus
      />
    );
  }

  const txt = row.original.presenters || "—";

  return (
    <div style={{ width: 220 }} className="overflow-hidden">
      <span
        className="inline-block max-w-full truncate
                   bg-green-100 text-green-700 px-4 py-2 rounded-xl
                   ring-1 ring-green-200"
        title={txt}
      >
        {txt}
      </span>
    </div>
  );
}

function ActionsCell({ row }) {
  const { editingId, startEditing, stopEditing, saveEdit, handleDelete } =
    useContext(EventTableContext);

  const isEditing = editingId === row.original.id;

  if (isEditing) {
    return (
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={stopEditing}>
          Cancel
        </Button>
        <Button size="sm" onClick={() => saveEdit(row.original.id)}>
          Save
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => startEditing(row.original.id)}
      >
        Edit
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => handleDelete(row.original.id)}
      >
        Delete
      </Button>
    </div>
  );
}

function Toolbar({ startCreating }) {
  return (
    <Button size="sm" onClick={startCreating} className="ml-auto h-8">
      Create Event (Admin)
    </Button>
  );
}

function EventSideMenu({ table }) {
  return (
    <Card className="bg-transparent shadow-none gap-2 w-75">
      <CardHeader>
        <CardTitle>
          <span>Options</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Input
          placeholder="Search by title"
          value={table.getColumn("title")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
        />
        <Input
          placeholder="Search by description"
          value={table.getColumn("description")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("description")?.setFilterValue(event.target.value)
          }
        />
        <Input
          placeholder="Search by Date & Time"
          value={table.getColumn("dateTime")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("dateTime")?.setFilterValue(event.target.value)
          }
        />
        <Input
          placeholder="Search by presenters"
          value={table.getColumn("presenters")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("presenters")?.setFilterValue(event.target.value)
          }
        />
        <DataTableViewOptions table={table} />
      </CardContent>
    </Card>
  );
}

function CreateNewEventSheet({ isCreating, onCreate, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // NEW: separate date + time
  const [date, setDate] = useState(""); // "YYYY-MM-DD"
  const [time, setTime] = useState(""); // "HH:MM"

  const [price, setPrice] = useState("");
  const [presenters, setPresenters] = useState("");

  // NEW: venue select (id + label)
  const [venues, setVenues] = useState([]);
  const [venueId, setVenueId] = useState("");
  const [venueName, setVenueName] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchLocations(); // [{ _id, nameE, ... }]
        setVenues(list || []);
      } catch (e) {
        console.error(e);
        setVenues([]);
      }
    })();
  }, []);

  function submit() {
    if (!title.trim()) return alert("Title is required");
    if (!venueId) return alert("Venue is required");
    if (!date) return alert("Date is required");
    if (!time) return alert("Time is required");

    // Backend requires: time, venueId, venue (and usually date)
    onCreate({
      title: title.trim(),
      description,
      date, // required
      time, // required
      price,
      presenters, // will be mapped to `presenter`
      venueId, // required
      venue: venueName, // required
    });

    // reset
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setPrice("");
    setPresenters("");
    setVenueId("");
    setVenueName("");
  }

  return (
    <Sheet open={isCreating} onOpenChange={onCancel}>
      <SheetContent side="left" className="w-200 flex flex-col">
        <SheetHeader className="px-4">
          <SheetTitle>Create Event (Admin)</SheetTitle>
        </SheetHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex flex-col gap-3"
        >
          <div className="flex-1 overflow-y-auto px-4 space-y-2">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* Venue select */}
            <label className="text-sm font-medium">Venue</label>
            <select
              className="border rounded-md px-2 py-2"
              value={venueId}
              onChange={(e) => {
                const id = e.target.value;
                setVenueId(id);
                const v = venues.find((x) => (x._id || x.id) === id);
                setVenueName(v?.nameE || v?.name || "");
              }}
              required
            >
              <option value="">Select a venue</option>
              {venues.map((v) => (
                <option key={v._id || v.id} value={v._id || v.id}>
                  {v.nameE || v.name}
                </option>
              ))}
            </select>

            {/* Date & Time */}
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              className="border rounded-md px-2 py-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <label className="text-sm font-medium">Time</label>
            <input
              type="time"
              className="border rounded-md px-2 py-2"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />

            <Input
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <Input
              placeholder="Presenter(s)"
              value={presenters}
              onChange={(e) => setPresenters(e.target.value)}
            />
          </div>

          <SheetFooter>
            <Button type="submit">Create</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
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
  const t = dt.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  //"1 Dec 2024 (Sun) 7:30pm"
  return `${day} ${mon} ${yr} (${wk}) ${t}`
    .replace("AM", "am")
    .replace("PM", "pm");
}
