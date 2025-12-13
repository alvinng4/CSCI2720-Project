/**
 * Reusable location list table component (for LocationList and FavouriteList)
 */

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { Input } from "@/components/ui/input";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { LocationSheet } from "@/location/LocationSheet";
import { LocationSideMenu } from "@/location/location-side-menu";
import { MapComponent } from "@/location/map-component";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ToggleFavourite } from "@/components/toggle-favourite";
import { useLocationsWithDistance } from "@/hooks/use-locations-with-distance";
import { useEffect, useState } from "react";
import { getToken, getUser, isAdmin } from "@/lib/AuthHelpers";
import {
  newTerritoriesDistricts,
  kowloonDistricts,
  hkIslandDistricts,
} from "@/constants/districts";

const API_BASE =
  (import.meta?.env?.VITE_API_BASE ?? "http://localhost:4000") + "/api";

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

  async function onCreateLocation(locationData) {
    let res = null;
    try {
      res = await fetch(`${API_BASE}/locations/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${getToken()}`,
        },

        body: JSON.stringify({
          location: {
            ...locationData,
            latitude: Number(locationData.latitude),
            longitude: Number(locationData.longitude),
          },
        }),
      });
    } catch {
      alert("Network error. Please try again later.");
    }

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.message || "Some error occured");
      return;
    }

    setIsCreating(false);
    alert("Location successfully created");
    refresh();
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
    if (!locationData || !id) {
      alert("Location data is invalid.");
      return;
    }

    const res = await fetch(`${API_BASE}/locations/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${getToken()}`,
      },

      body: JSON.stringify({
        ...locationData,
        latitude: Number(locationData.latitude),
        longitude: Number(locationData.longitude),
      }),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      alert(data?.message || "Failed to update");
      return;
    }

    stopEditing();
    alert("Location successfully updated");
    refresh();
  }

  async function handleDelete(id) {
    const userConsent = confirm("Delete this location?");
    if (!userConsent) {
      return;
    }
    const res = await fetch(`${API_BASE}/locations/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${getToken()}`,
      },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.message || "Delete failed");
      return;
    }
    refresh();
  }

  function onIsFavouriteUpdate(id, isFavourite) {
    setLocations(
      locations.map((loc) =>
        loc.id === id ? { ...loc, isFavourite } : loc
      )
    );
  }

  const {
    haveUserCoords,
    locations: fetchedLocations,
    loading,
    errorMsg,
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
    handleDelete,
    onIsFavouriteUpdate,
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
          onCreate={onCreateLocation}
        />
      )}
      {admin && isEditing && (
        <EditLocationSheet
          isEditing={isEditing}
          location={editingLocation}
          onCancel={stopEditing}
          onSave={onSaveEdit}
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
                    <Button 
                      size="sm"
                      className="h-8"
                      onClick={refresh}
                    >
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
      <DataTableColumnHeader
        column={column}
        title="Favourite"
      />
    ),
    cell: ({ row }) => {
      return <ToggleFavourite location={row.original} onUpdate={onIsFavouriteUpdate} />;
    },
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

function CreateNewLocationSheet({ isCreating, onCancel, onCreate }) {
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationDistrict, setNewLocationDistrict] = useState("");
  const [newLocationLatitude, setNewLocationLatitude] = useState(22.3);
  const [newLocationLongitude, setNewLocationLongitude] = useState(114.2);

  return (
    <Sheet open={isCreating} onOpenChange={onCancel}>
      <SheetContent side="left" className="w-200 flex flex-col">
        <SheetHeader className="px-4">
          <SheetTitle>Create Location (Admin)</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 space-y-4">
          {/* Details */}
          <div>
            {makeSubsectionTitle("Details")}
            <div className="space-y-2">
              <Input
                placeholder="Location name"
                value={newLocationName}
                onChange={(event) => setNewLocationName(event.target.value)}
              />
              <Select
                value={newLocationDistrict}
                onValueChange={(value) => setNewLocationDistrict(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a district" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Hong Kong Island</SelectLabel>
                    {hkIslandDistricts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Kowloon</SelectLabel>
                    {kowloonDistricts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>New Territories</SelectLabel>
                    {newTerritoriesDistricts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Input
                placeholder="Latitude"
                value={newLocationLatitude}
                type="number"
                onChange={(event) => setNewLocationLatitude(event.target.value)}
              />
              <Input
                placeholder="Longitude"
                value={newLocationLongitude}
                type="number"
                onChange={(event) =>
                  setNewLocationLongitude(event.target.value)
                }
              />
            </div>
          </div>

          {/* Map */}
          <div>
            {makeSubsectionTitle("Map")}
            <div className="px-3 py-3 border rounded-md bg-muted/40">
              <MapComponent
                locations={[
                  {
                    id: 0,
                    name: newLocationName,
                    latitude: newLocationLatitude,
                    longitude: newLocationLongitude,
                  },
                ]}
                center={[newLocationLatitude, newLocationLongitude]}
                style={{ height: "200px", width: "100%", zIndex: "1" }}
              />
            </div>
          </div>
        </div>
        <SheetFooter>
          <Button
            onClick={() => {
              const locationData = {
                nameE: newLocationName,
                district: newLocationDistrict,
                latitude: newLocationLatitude,
                longitude: newLocationLongitude,
              };
              onCreate(locationData);
            }}
          >
            Create location
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function EditLocationSheet({ isEditing, location, onCancel, onSave }) {
  if (!location) {
    return (
      <Sheet open={isEditing} onOpenChange={onCancel}>
        <SheetContent side="left" className="w-200 flex flex-col">
          Error: Location data not found
        </SheetContent>
      </Sheet>
    );
  }

  const [editLocationName, setEditLocationName] = useState(
    location.name ?? location.nameE ?? ""
  );
  const [editLocationDistrict, setEditLocationDistrict] = useState(
    location.district
  );
  const [editLocationLatitude, setEditLocationLatitude] = useState(
    location.latitude
  );
  const [editLocationLongitude, setEditLocationLongitude] = useState(
    location.longitude
  );

  return (
    <Sheet open={isEditing} onOpenChange={onCancel}>
      <SheetContent side="left" className="w-200 flex flex-col">
        <SheetHeader className="px-4">
          <SheetTitle>Edit Location (Admin)</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 space-y-4">
          {/* Details */}
          <div>
            {makeSubsectionTitle("Details")}
            <div className="space-y-2">
              <Input
                placeholder="Location name"
                value={editLocationName}
                onChange={(event) => setEditLocationName(event.target.value)}
              />
              <Select
                value={editLocationDistrict}
                onValueChange={(value) => setEditLocationDistrict(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a district" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Hong Kong Island</SelectLabel>
                    {hkIslandDistricts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Kowloon</SelectLabel>
                    {kowloonDistricts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>New Territories</SelectLabel>
                    {newTerritoriesDistricts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Input
                placeholder="Latitude"
                value={editLocationLatitude}
                type="number"
                onChange={(event) =>
                  setEditLocationLatitude(event.target.value)
                }
              />
              <Input
                placeholder="Longitude"
                value={editLocationLongitude}
                type="number"
                onChange={(event) =>
                  setEditLocationLongitude(event.target.value)
                }
              />
            </div>
          </div>

          {/* Map */}
          <div>
            {makeSubsectionTitle("Map")}
            <div className="px-3 py-3 border rounded-md bg-muted/40">
              <MapComponent
                locations={[
                  {
                    id: location.id,
                    name: editLocationName,
                    district: editLocationDistrict,
                    latitude: editLocationLatitude,
                    longitude: editLocationLongitude,
                  },
                ]}
                center={[editLocationLatitude, editLocationLongitude]}
                style={{ height: "200px", width: "100%", zIndex: "1" }}
              />
            </div>
          </div>
        </div>
        <SheetFooter>
          <Button
            onClick={() => {
              const locationData = {
                nameE: editLocationName,
                district: editLocationDistrict,
                latitude: editLocationLatitude,
                longitude: editLocationLongitude,
              };

              onSave(location.id, locationData);
            }}
          >
            Save edit
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function makeSubsectionTitle(title) {
  return <h3 className="text-md font-semibold mb-2">{title}</h3>;
}
