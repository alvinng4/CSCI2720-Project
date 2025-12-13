import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CreateNewEventSheet } from "./CreateNewEventSheet";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { deleteEvent } from "@/event/event.api";
import { Input } from "@/components/ui/input";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { PageShell } from "@/components/page-shell";
import { useFetchEvents } from "./use-fetch-events";
import { Fragment, useEffect, useState } from "react";
import { getUser, isAdmin } from "@/lib/AuthHelpers";

export function EventList() {
  const user = getUser();
  const admin = isAdmin(user);

  const [events, setEvents] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  function startCreating() {
    setIsCreating(true);
  }

  function stopCreating() {
    setIsCreating(false);
  }

  function startEditing(id) {
    if (admin) {
      setEditingLocation(locations.find((loc) => loc.id === id));
      setIsEditing(true);
      if (!locations.find((loc) => loc.id === id)) {
        alert("Location not found");
      }
    }
  }

  function stopEditing() {
    setIsEditing(false);
  }

  async function onSaveEdit(id, locationData) {
    // if (!locationData || !id) {
    //   alert("Location data is invalid.");
    //   return;
    // }
    // const res = await fetch(`${API_BASE}/locations/${id}`, {
    //   method: "PUT",
    //   headers: {
    //     "Content-Type": "application/json",
    //     authorization: `Bearer ${getToken()}`,
    //   },
    //   body: JSON.stringify({
    //     ...locationData,
    //     latitude: Number(locationData.latitude),
    //     longitude: Number(locationData.longitude),
    //   }),
    // });
    // const data = await res.json().catch(() => null);
    // if (!res.ok) {
    //   alert(data?.message || "Failed to update");
    //   return;
    // }
    // stopEditing();
    // alert("Location successfully updated");
    // refresh();
  }

  const {
    events: fetchedEvents,
    loading,
    errorMsg,
    setErrorMsg,
    lastSyncTime,
    refresh,
  } = useFetchEvents();

  useEffect(() => {
    setEvents(fetchedEvents);
  }, [fetchedEvents]);

  const columns = getColumns(admin, startEditing, (id) =>
    deleteEvent(id, setErrorMsg, refresh)
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <PageShell title="Event List">
      {admin && isCreating && (
        <CreateNewEventSheet
          isCreating={isCreating}
          onCancel={stopCreating}
          refresh={refresh}
        />
      )}
      {/*admin && isEditing && (
        <EditLocationSheet
          isEditing={isEditing}
          location={editingLocation}
          onCancel={stopEditing}
          onSave={onSaveEdit}
        />
      )} */}
      <div className="text-red-500">{errorMsg}</div>
      <div className="flex flex-col gap-y-4">
        <DataTable
          columns={columns}
          data={events}
          renderToolbar={() => (
            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Last Updated on{" "}
                {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : ""}
              </span>
              {admin && <Toolbar startCreating={startCreating} />}
            </div>
          )}
          renderSideMenu={(table) => (
            <EventSideMenu table={table} refresh={refresh} />
          )}
          onRowClick={(row) => setSelectedEvent(row)}
        />
      </div>
    </PageShell>
  );
}

function getColumns(isAdmin, startEditing, handleDelete) {
  const columns = [
    {
      accessorKey: "title",
      title: "Title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
    },
    {
      accessorKey: "descE",
      title: "Description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => {
        const desc = row.original.descE || "N/A";
        return desc.length > 150 ? desc.slice(0, 150) + "..." : desc;
      },
      filterFn: (row, _columnId, filterValue) => {
        const desc = row.original.descE || "N/A";
        const display = desc.length > 150 ? desc.slice(0, 150) + "..." : desc;
        return display.toLowerCase().includes(filterValue.toLowerCase());
      },
    },
    {
      accessorKey: "location",
      title: "Location",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => {
        const loc = row.original.location;
        return loc && typeof loc === "object" ? loc.nameE || "N/A" : "N/A";
      },
      filterFn: (row, _columnId, filterValue) => {
        const loc = row.original.location;
        const name =
          loc && typeof loc === "object" ? loc.nameE || "N/A" : "N/A";
        return name.toLowerCase().includes(filterValue.toLowerCase());
      },
    },
    {
      accessorKey: "preDateE",
      title: "Date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => {
        // Replace semicolons to line breaks
        const value = row.original.preDateE || "N/A";
        return (
          <span>
            {value
              .split(/;+/)
              .filter(Boolean)
              .map((part, idx) => (
                <Fragment key={idx}>
                  {part}
                  <br />
                </Fragment>
              ))}
          </span>
        );
      },
      filterFn: (row, _columnId, filterValue) => {
        const value = row.original.preDateE || "N/A";
        const joined = value.split(/;+/).filter(Boolean).join(" ");
        return joined.toLowerCase().includes(filterValue.toLowerCase());
      },
    },
    {
      accessorKey: "progTimeE",
      title: "Duration",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Duration" />
      ),
    },
    {
      accessorKey: "priceE",
      title: "Price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => {
        return row.original.priceE || "N/A";
      },
      filterFn: (row, _columnId, filterValue) => {
        const value = row.original.priceE || "N/A";
        return value.toLowerCase().includes(filterValue.toLowerCase());
      },
    },
    {
      accessorKey: "presenterOrgE",
      title: "Presenter(s)",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Presenter(s)" />
      ),
      cell: ({ row }) => {
        const value = row.original.presenterOrgE;
        return value ? (
          <span className="inline-block bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 px-2 py-1 rounded">
            {value}
          </span>
        ) : (
          "N/A"
        );
      },
      filterFn: (row, _columnId, filterValue) => {
        const value = row.original.presenterOrgE || "N/A";
        return value.toLowerCase().includes(filterValue.toLowerCase());
      },
    },
  ];

  if (isAdmin) {
    columns.push({
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(event) => {
                event.stopPropagation();
                startEditing(row.original.id);
              }}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={(event) => {
                event.stopPropagation();
                handleDelete(row.original.id);
              }}
            >
              Delete
            </Button>
          </div>
        );
      },
    });
  }

  return columns;
}

function Toolbar({ startCreating }) {
  return (
    <Button size="sm" onClick={startCreating} className="ml-auto h-8">
      Create Event (Admin)
    </Button>
  );
}

function EventSideMenu({ table, refresh }) {
  return (
    <Card className="bg-transparent shadow-none gap-2 min-w-80">
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
          value={table.getColumn("descE")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("descE")?.setFilterValue(event.target.value)
          }
        />
        <Input
          placeholder="Search by location"
          value={table.getColumn("location")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("location")?.setFilterValue(event.target.value)
          }
        />
        <Input
          placeholder="Search by date"
          value={table.getColumn("preDateE")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("preDateE")?.setFilterValue(event.target.value)
          }
        />
        <Input
          placeholder="Search by duration"
          value={table.getColumn("progTimeE")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("progTimeE")?.setFilterValue(event.target.value)
          }
        />
        <Input
          placeholder="Search by price"
          value={table.getColumn("priceE")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("priceE")?.setFilterValue(event.target.value)
          }
        />
        <Input
          placeholder="Search by presenters"
          value={table.getColumn("presenterOrgE")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("presenterOrgE")?.setFilterValue(event.target.value)
          }
        />
        <div className="flex gap-2 justify-end">
          <Button size="sm" className="h-8" onClick={refresh}>
            Refresh
          </Button>
          <DataTableViewOptions table={table} className="!ml-0" />
        </div>
      </CardContent>
    </Card>
  );
}
