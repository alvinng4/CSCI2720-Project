/**
 * Reusable location list table component (for LocationList and FavouriteList)
 */

import { Button } from "@/components/ui/button";
import { CreateNewLocationSheet } from "./CreateNewLocationSheet";
import {
  createLocation,
  deleteLocation,
  saveEditLocation,
} from "./location.api";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { EditLocationSheet } from "./EditLocationSheet";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { LocationSheet } from "@/location/LocationSheet";
import { LocationSideMenu } from "./location-side-menu";
import { ToggleFavourite } from "@/components/toggle-favourite";
import { useLocationsWithDistance } from "./use-locations-with-distance";
import { useEffect, useState } from "react";
import { getUser, isAdmin } from "@/lib/AuthHelpers";

export function LocationListTable({ isFavourite }) {
  const user = getUser();
  const admin = isAdmin(user);

  const [locations, setLocations] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

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

  function onIsFavouriteUpdate(id, isFavourite) {
    setLocations(
      locations.map((loc) => (loc.id === id ? { ...loc, isFavourite } : loc))
    );
  }

  const {
    haveUserCoords,
    locations: fetchedLocations,
    loading,
    errorMsg,
    setErrorMsg,
    maxDist,
    distRange,
    setDistRange,
    refresh,
  } = useLocationsWithDistance({ isFavouriteOnly: isFavourite });

  useEffect(() => {
    setLocations(fetchedLocations);
  }, [fetchedLocations]);

  const columns = getColumns(
    haveUserCoords,
    admin,
    startEditing,
    (id) => deleteLocation(id, setErrorMsg, refresh),
    isFavourite,
    onIsFavouriteUpdate
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <LocationSheet
        locationId={selectedLocation?.id}
        setSelectedLocation={setSelectedLocation}
        onIsFavouriteUpdate={onIsFavouriteUpdate}
      />
      {admin && isCreating && (
        <CreateNewLocationSheet
          isCreating={isCreating}
          onCancel={stopCreating}
          onCreate={(locationData) =>
            createLocation(locationData, setErrorMsg, stopCreating, refresh)
          }
        />
      )}
      {admin && isEditing && (
        <EditLocationSheet
          isEditing={isEditing}
          location={editingLocation}
          onCancel={stopEditing}
          onSave={(id, locationData) =>
            saveEditLocation(
              id,
              locationData,
              setErrorMsg,
              stopEditing,
              refresh
            )
          }
        />
      )}
      <div className="text-red-500">{errorMsg}</div>
      <div className="flex flex-col gap-y-4">
        <DataTable
          columns={columns}
          data={locations}
          renderToolbar={() =>
            admin ? <Toolbar startCreating={startCreating} /> : null
          }
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
    </>
  );
}

function getColumns(
  haveUserCoords,
  isAdmin,
  startEditing,
  handleDelete,
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
      Create Location (Admin)
    </Button>
  );
}
