import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Fragment, useCallback, useEffect, useState } from "react";

import CommonTableToolBar from "@/components/common-table-toolbar";
import CreateNewEventSheet from "./CreateNewEventSheet";
import { deleteEvent, getAllEvents } from "./event.api";
import EditEventSheet from "./EditEventSheet";
import EventSideMenu from "./EventSideMenu";
import { getUser, isAdmin } from "@/lib/AuthHelpers";
import { LoadingScreen } from "@/components/ui/loading-screen";
import {
  MessageTypes,
  MessageTypeToColor,
  useMessage,
} from "@/hooks/use-message";
import ToggleLike from "@/components/toggle-like";
import useAsync from "@/hooks/use-async";
import PageShell from "@/components/page-shell";

export function EventList() {
  const admin = isAdmin(getUser());
  const [events, setEvents] = useState([]);
  const { message, isShowMessage, messageType, showMessage, resetMessage } =
    useMessage();
  const {
    isLoading,
    isForegroundLoading,
    lastSyncTime,
    startForegroundLoading,
    stopForegroundLoading,
    startBackgroundLoading,
    stopBackgroundLoading,
  } = useAsync({ initialForegroundLoading: true });
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [_selectedEvent, setSelectedEvent] = useState(null);

  function startCreating() {
    setIsCreating(true);
  }

  function stopCreating() {
    setIsCreating(false);
  }

  const fetchEvents = useCallback(async () => {
    startForegroundLoading();
    const result = await getAllEvents();
    stopForegroundLoading();
    if (!result.ok || !result?.data) {
      showMessage(
        result?.error || "Error: Something went wrong.",
        MessageTypes.ERROR
      );
      return;
    }
    const mappedData = result.data.map((event) => ({
      ...event,
      id: event._id,
    }));
    setEvents(mappedData);
  }, [showMessage, startForegroundLoading, stopForegroundLoading]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const refresh = useCallback(() => {
    fetchEvents();
    resetMessage();
  }, [fetchEvents, resetMessage]);

  function startEditing(id) {
    setEditingEventId(id);
    setIsEditing(true);
  }

  function stopEditing() {
    setIsEditing(false);
    setEditingEventId(null);
  }

  function onIsLikeUpdate(id, isLike, numLikes) {
    setEvents(
      events.map((e) => (e.id === id ? { ...e, isLike, numLikes } : e))
    );
  }

  const onDelete = useCallback(
    async (e, eventId) => {
      e.stopPropagation();
      const userConsent = confirm("Delete this event?");
      if (!userConsent) {
        return;
      }

      if (isLoading) {
        showMessage(
          "Processing. Please wait before submitting!",
          MessageTypes.ERROR
        );
        return;
      }

      startBackgroundLoading();
      showMessage("Connecting to database...");
      const result = await deleteEvent(eventId);
      stopBackgroundLoading();

      if (!result.ok) {
        const errMsg =
          "Error occurred when deleting event: " +
          (result?.error || "Unknown error");
        showMessage(errMsg, MessageTypes.ERROR);
        return;
      }
      showMessage(
        `Success! Event with id ${eventId} is deleted.`,
        MessageTypes.SPECIAL
      );
      fetchEvents();
    },
    [
      fetchEvents,
      isLoading,
      showMessage,
      startBackgroundLoading,
      stopBackgroundLoading,
    ]
  );

  const columns = getColumns(admin, startEditing, onDelete, onIsLikeUpdate);

  return (
    <>
      {admin && isCreating && (
        <CreateNewEventSheet
          isCreating={isCreating}
          stopCreating={stopCreating}
          refresh={refresh}
        />
      )}
      {admin && isEditing && (
        <EditEventSheet
          id={editingEventId}
          isEditing={isEditing}
          stopEditing={stopEditing}
          refresh={refresh}
        />
      )}
      <PageShell title="Event List">
        {/* Feedback message */}
        <p hidden={!isShowMessage} className={MessageTypeToColor[messageType]}>
          {message}
        </p>
        {isForegroundLoading ? (
          <LoadingScreen />
        ) : (
          /* Table */
          <div className="flex flex-col gap-y-4">
            <DataTable
              columns={columns}
              data={events}
              renderToolbar={() => (
                <CommonTableToolBar
                  lastSyncTime={lastSyncTime}
                  admin={admin}
                  caption={"Create Event (Admin)"}
                  onClick={startCreating}
                />
              )}
              renderSideMenu={(table) => (
                <EventSideMenu table={table} refresh={refresh} />
              )}
              onRowClick={(row) => setSelectedEvent(row)}
            />
          </div>
        )}
      </PageShell>
    </>
  );
}

function getColumns(isAdmin, startEditing, onDelete, onIsLikeUpdate) {
  const columns = [
    {
      accessorKey: "titleE",
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
    {
      accessorKey: "isLike",
      title: "Likes",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Likes" />
      ),
      cell: ({ row }) => {
        return <ToggleLike event={row.original} onUpdate={onIsLikeUpdate} />;
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
              onClick={(e) => onDelete(e, row.original.id)}
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
