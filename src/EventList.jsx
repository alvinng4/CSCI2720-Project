import { adminStore } from "@/lib/adminStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions }  from "@/components/ui/data-table-view-options"
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/page-shell";
import { 
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { useAuth, isAdmin } from "@/lib/AuthContext";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

const { listEvents, createEvent, updateEvent, deleteEvent } = adminStore;
const EventTableContext = createContext(null);

export function EventList() {
  const { user } = useAuth();
  const admin = isAdmin(user);

  const [rows, setRows] = useState([]);
  useEffect(() => {
    setRows(listEvents())
  },[]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState(null);
  const [editingDescription, setEditingDescription] = useState(null);
  const [editingDateTime, setEditingDateTime] = useState(null);
  const [editingPrice, setEditingPrice] = useState(null);
  const [editingPresenters, setEditingPresenters] = useState(null);

  /* Handlers */
  function onCreate(eventData) {
    console.log("creating");
    createEvent(eventData);
    setRows(listEvents());
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
      setEditingDateTime(editingEvent.dateTime);
      setEditingPrice(editingEvent.price);
      setEditingPresenters(editingEvent.presenters);
    }
  }

  function stopEditing() {
    setEditingId(null);
    setEditingTitle(null);
    setEditingDescription(null);
    setEditingDateTime(null);
    setEditingPrice(null);
    setEditingPresenters(null);
  }

  function saveEdit(id) {
    const patch = { 
      title: editingTitle,
      description: editingDescription,
      dateTime: editingDateTime,
      price: editingPrice,
      presenters: editingPresenters 
    };
    const updated = updateEvent(id, patch);
    setRows(listEvents());
    stopEditing(null);
  }

  function handleDelete(id) {
    const userConsent = confirm("Delete this event?");
    if (!userConsent) {
      return ;
    }

    deleteEvent(id);
    setRows(listEvents());
  }

  /* Columns (created once only to prevent input issues) */
  const columns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: "title",
        title: "Title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
        cell: ({ row }) => <TitleCell row={row} />,
      },
      {
        accessorKey: "description",
        title: "Description",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
        cell: ({ row }) => <DescriptionCell row={row} />,
      },
      // {
      //   accessorKey: "venue",
      //   title: "Venue",
      //   header: ({ column }) => <DataTableColumnHeader column={column} title="Venue" />,
      //   cell: ({ row }) => <VenueCell row={row} />,
      // },
      {
        accessorKey: "dateTime",
        title: "Date & Time",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date & Time" />,
        cell: ({ row }) => <DateTimeCell row={row} />,
      },
      {
        accessorKey: "price",
        title: "Price",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
        cell: ({ row }) => <PriceCell row={row} />,
      },
      {
        accessorKey: "presenters",
        title: "Presenter(s)",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Presenter(s)" />,
        cell: ({ row }) => <PresentersCell row={row} />,
      },
    ]

    if (admin) {
      baseColumns.push({
        id: "actions",
        cell: ({ row }) => <ActionsCell row={row} />,
      })
    }

    return baseColumns
  }, [admin]);

  /* Context values for table */
  const contextValue = {
    editingId,
    editingTitle,
    setEditingTitle,
    editingDescription,
    setEditingDescription,
    editingDateTime,
    setEditingDateTime,
    editingPrice,
    setEditingPrice,
    editingPresenters,
    setEditingPresenters,
    startEditing,
    stopEditing,
    saveEdit,
    handleDelete,
  };

  return (
    <PageShell title="Event List">
      {admin && 
        <CreateNewEventSheet
          isCreating={isCreating}
          onCreate={onCreate}
          onCancel={cancelCreating}
        />
      }
      <EventTableContext.Provider value={contextValue}>
        <DataTable
          columns={columns}
          data={rows}
          renderToolbar={() => 
            admin ? <Toolbar startCreating={startCreating} /> : null
          }
          renderSideMenu={(table) => <EventSideMenu table={table} />} 
        />
      </EventTableContext.Provider>
    </PageShell>
  )
}

function TitleCell({ row }) {
  const { editingId, editingTitle, setEditingTitle } = useContext(EventTableContext);
  const isEditing = (editingId === row.original.id);

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
  const { editingId, editingDescription, setEditingDescription } = useContext(EventTableContext);
  const isEditing = (editingId === row.original.id);

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
  /**
   * TODO: This is complicated. This should not be a string, but id to a venue
   * When editing, it should be a dropdown menu to all available venues.
  */ 
}

function DateTimeCell({ row }) {
  // This may not be a string? but the data has very complicated 
  // dateTime format, which can be hard to parse. Maybe just treat it
  // as a string.
  const { editingId, editingDateTime, setEditingDateTime } = useContext(EventTableContext);
  const isEditing = (editingId === row.original.id);

  if (isEditing) {
    return (
      <Input 
        value={editingDateTime ?? ""} 
        onChange={(e) => setEditingDateTime(e.target.value)} 
        autoFocus
      />
    );
  }
  return row.original.dateTime;
}

function PriceCell({ row }) {
  const { editingId, editingPrice, setEditingPrice } = useContext(EventTableContext);
  const isEditing = (editingId === row.original.id);

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
  const { editingId, editingPresenters, setEditingPresenters } = useContext(EventTableContext);
  const isEditing = (editingId === row.original.id);

  if (isEditing) {
    return (
      <Input 
        value={editingPresenters ?? ""} 
        onChange={(e) => setEditingPresenters(e.target.value)} 
        autoFocus
      />
    );
  }
  return row.original.presenters;
}

function ActionsCell({ row }) {
  const { 
    editingId,
    startEditing, 
    stopEditing, 
    saveEdit, 
    handleDelete 
  } = useContext(EventTableContext);
  
  const isEditing = (editingId === row.original.id);

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
      <Button size="sm" variant="outline" onClick={() => startEditing(row.original.id)}>
        Edit
      </Button>
      <Button size="sm" variant="destructive" onClick={() => handleDelete(row.original.id)}>
        Delete
      </Button>
    </div>
  );
}

function Toolbar({ startCreating }) {
  return (
    <Button
      size="sm"
      onClick={startCreating}
      className="ml-auto h-8"
    >
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
  )
}

function CreateNewEventSheet({ isCreating, onCreate, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // const [venue, setVenue] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [price, setPrice] = useState("");
  const [presenters, setPresenters] = useState("");

  function onSubmit() {
    if (!title.trim()) return alert("Title is required");
    onCreate({ 
      title: title,
      description: description,
      dateTime: dateTime,
      price: price,
      presenters: presenters 
    });
    setTitle("");
    setDescription("");
    setDateTime("");
    setPrice("");
    setPresenters("");
  }

  return (
    <Sheet
      open={isCreating}
      onOpenChange={onCancel}
    >
      <SheetContent side="left" className="w-200 flex flex-col">
        <SheetHeader className="px-4">
          <SheetTitle>
            Create Location (Admin)
          </SheetTitle>
        </SheetHeader>
        <form
          onSubmit={(e) => { 
            e.preventDefault();
            onSubmit();
          }}
          className="flex flex-col gap-3"
        >
          <div className="flex-1 overflow-y-auto px-4 space-y-2">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input placeholder="dateTime" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
            <Input placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
            <Input placeholder="Presenter(s)" value={presenters} onChange={(e) => setPresenters(e.target.value)} />
          </div>
          <SheetFooter>
            <Button type="submit">
              Create
            </Button>
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
  const t = dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  //"1 Dec 2024 (Sun) 7:30pm"
  return `${day} ${mon} ${yr} (${wk}) ${t}`.replace("AM","am").replace("PM","pm");
}
