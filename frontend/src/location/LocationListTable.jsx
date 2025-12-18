// Group 33:
// Chan Darren Jun Rong (1155256148)
// Li Clement (1155214128)
// Ng Ching Yin (1155175606)
// Zhao Yiming (1155211152)

/**
 * Reusable location list table component (for LocationList and FavouriteList)
 */

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { useCallback, useEffect, useState } from "react";

import CommonTableToolBar from "@/components/common-table-toolbar";
import CreateNewLocationSheet from "./CreateNewLocationSheet";
import EditLocationSheet from "./EditLocationSheet";
import { deleteLocation, getAllLocations } from "./location.api";
import { getUserLocation, haversineDistance } from "@/lib/utils";
import { getUser, isAdmin } from "@/lib/AuthHelpers";
import LoadingScreen from "@/components/ui/loading-screen";
import LocationSheet from "@/location/LocationSheet";
import LocationSideMenu from "./location-side-menu";
import {
  MessageTypes,
  MessageTypeToColor,
  useMessage,
} from "@/hooks/use-message";
import ToggleFavourite from "@/components/toggle-favourite";
import useAsync from "@/hooks/use-async";

export function LocationListTable({ isFavourite }) {
  const user = getUser();
  const admin = isAdmin(user);

  const [locations, setLocations] = useState([]);
  const [maxDist, setMaxDist] = useState(0);
  const [distRange, setDistRange] = useState([0, 0]);

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
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  function startCreating() {
    setIsCreating(true);
  }

  function stopCreating() {
    setIsCreating(false);
  }

  function startEditing(id) {
    setEditingLocationId(id);
    setIsEditing(true);
  }

  function stopEditing() {
    setIsEditing(false);
    setEditingLocationId(null);
  }

  function onIsFavouriteUpdate(id, isFavourite) {
    setLocations(
      locations.map((loc) => (loc.id === id ? { ...loc, isFavourite } : loc))
    );
    setSelectedLocation((prev) =>
      prev && prev.id === id ? { ...prev, isFavourite } : prev
    );
  }

  const onDelete = useCallback(
    async (e, locationId) => {
      e.stopPropagation();
      const userConsent = confirm("Delete this location?");
      if (!userConsent) {
        return;
      }

      if (isLoading) {
        showMessage(
          "Processing. Please wait and try again later.",
          MessageTypes.ERROR
        );
        return;
      }

      startBackgroundLoading();
      showMessage("Connecting to database...");
      const result = await deleteLocation(locationId);
      stopBackgroundLoading();

      if (!result.ok) {
        const errMsg =
          "Error occurred when deleting location: " +
          (result?.error || "Unknown error");
        showMessage(errMsg, MessageTypes.ERROR);
        return;
      }
      showMessage(
        `Success! Location with id ${locationId} is deleted.`,
        MessageTypes.SPECIAL
      );
      setLocations((prev) => prev.filter((loc) => loc.id !== locationId));
    },
    [
      setLocations,
      isLoading,
      showMessage,
      startBackgroundLoading,
      stopBackgroundLoading,
    ]
  );

  const fetchLocations = useCallback(async () => {
    startForegroundLoading();
    const result = await getAllLocations();
    if (!result.ok || !result?.data) {
      showMessage(
        result?.error || "Error: Something went wrong.",
        MessageTypes.ERROR
      );
      stopForegroundLoading();
      return;
    }

    const mappedData = result.data.map((loc) => ({
      ...loc,
      id: loc._id,
      name: loc.nameE,
      district: loc.district,
      num_events: loc.numEvents,
      latitude: Number(loc.latitude),
      longitude: Number(loc.longitude),
      isFavourite: loc?.isFavourite ?? false,
    }));

    /* Filter isFavourite */
    const filtered = isFavourite
      ? mappedData.filter((x) => x.isFavourite)
      : mappedData;

    /* Compute distance */
    let userCoords = null;
    try {
      userCoords = await getUserLocation();
    } catch {
      showMessage(
        "Failed to get user location. Showing data without distance.",
        MessageTypes.ERROR
      );
      setLocations(filtered);
      stopForegroundLoading();
      return;
    }

    const locationsWithDist = filtered.map((loc) => ({
      ...loc,
      distance: haversineDistance(
        userCoords.latitude,
        userCoords.longitude,
        loc.latitude,
        loc.longitude
      ),
    }));

    const distances = locationsWithDist
      .map((x) => x.distance)
      .filter((d) => typeof d === "number" && !Number.isNaN(d));
    if (distances.length) {
      const m = Math.max(...distances);
      setMaxDist(m);
      setDistRange(([min]) => [min, m]);
    }

    setLocations(locationsWithDist);
    stopForegroundLoading();
  }, [isFavourite, showMessage, startForegroundLoading, stopForegroundLoading]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const refresh = useCallback(() => {
    resetMessage();
    fetchLocations();
  }, [fetchLocations, resetMessage]);

  const columns = getColumns(
    maxDist > 0,
    admin,
    startEditing,
    onDelete,
    isFavourite,
    onIsFavouriteUpdate
  );

  return (
    <>
      {admin && isCreating && (
        <CreateNewLocationSheet
          isCreating={isCreating}
          stopCreating={stopCreating}
          refresh={refresh}
        />
      )}
      {admin && isEditing && (
        <EditLocationSheet
          locationId={editingLocationId}
          isEditing={isEditing}
          stopEditing={stopEditing}
          refresh={refresh}
        />
      )}
      <LocationSheet
        location={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        onIsFavouriteUpdate={onIsFavouriteUpdate}
      />
      {/* Feedback message */}
      <p hidden={!isShowMessage} className={MessageTypeToColor[messageType]}>
        {message}
      </p>
      {isForegroundLoading ? (
        <LoadingScreen />
      ) : (
        <div className="flex flex-col gap-y-4">
          <DataTable
            columns={columns}
            data={locations}
            renderToolbar={() => (
              <CommonTableToolBar
                lastSyncTime={lastSyncTime}
                admin={admin}
                caption={"Create Location (Admin)"}
                onClick={startCreating}
              />
            )}
            renderSideMenu={(table) => (
              <LocationSideMenu
                getFilterName={() =>
                  table.getColumn("name")?.getFilterValue() ?? ""
                }
                setFilterName={(value) =>
                  table.getColumn("name")?.setFilterValue(value)
                }
                getFilterDistrict={() =>
                  table.getColumn("district")?.getFilterValue() ?? ""
                }
                setFilterDistrict={(value) =>
                  table
                    .getColumn("district")
                    ?.setFilterValue(value === "all" ? "" : value || "")
                }
                maxDist={maxDist}
                getDistRange={() => distRange}
                setDistRange={(newValue) => {
                  setDistRange(newValue);
                  table.getColumn("distance")?.setFilterValue(newValue);
                }}
                extraComponents={() => {
                  return (
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" className="h-8" onClick={refresh}>
                        Refresh
                      </Button>
                      <DataTableViewOptions table={table} className="!ml-0" />
                    </div>
                  );
                }}
              />
            )}
            onRowClick={(row) => setSelectedLocation(row)}
          />
        </div>
      )}
    </>
  );
}

function getColumns(
  haveUserCoords,
  isAdmin,
  startEditing,
  onDelete,
  isFavourite,
  onIsFavouriteUpdate
) {
  const columns = [
    {
      accessorKey: "name",
      title: "Name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "num_events",
      title: "# Events",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="# Events" />
      ),
      sortingFn: (rowA, rowB, columnId) => {
        const stringA = rowA.getValue(columnId);
        const stringB = rowB.getValue(columnId);
        const a = Number(stringA);
        const b = Number(stringB);
        if (Number.isNaN(a) || Number.isNaN(b)) {
          return stringA.localeCompare(stringB);
        }
        return a - b;
      },
    },
    {
      accessorKey: "district",
      title: "District",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="District" />
      ),
    },
  ];

  if (haveUserCoords) {
    columns.push({
      accessorKey: "distance",
      title: "Distance (km)",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Distance (km)" />
      ),
      sortingFn: (rowA, rowB, columnId) => {
        const stringA = rowA.getValue(columnId);
        const stringB = rowB.getValue(columnId);
        const a = Number(stringA);
        const b = Number(stringB);
        if (Number.isNaN(a) || Number.isNaN(b)) {
          return stringA.localeCompare(stringB);
        }
        return a - b;
      },
    });
  }

  columns.push({
    accessorKey: "isFavourite",
    title: "Favourite",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Favourite" />
    ),
    cell: ({ row }) => {
      return (
        <ToggleFavourite
          location={row.original}
          onUpdate={onIsFavouriteUpdate}
        />
      );
    },
    enableSorting: !isFavourite,
  });

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
