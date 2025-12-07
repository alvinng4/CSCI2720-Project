/**
 * Reusable location list table component (for LocationList and FavouriteList)
 */

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions }  from "@/components/ui/data-table-view-options"
import { Input } from "@/components/ui/input";
import { LoadingScreen } from "@/components/ui/loading-screen"
import { LocationSheet } from "@/LocationSheet";
import { LocationSideMenu } from "@/components/location-side-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select"
import { 
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { ToggleFavourite } from "@/components/toggle-favourite"
import { useLocationsWithDistance } from "@/hooks/use-locations-with-distance";
import { useState } from "react"
import { 
  useAuth,
  isAdmin 
} from "@/lib/AuthContext";

import { newTerritoriesDistricts, kowloonDistricts, hkIslandDistricts } from "@/constants/districts"

export function LocationListTable({ isFavourite }) {
  const { user } = useAuth();
  const admin = isAdmin(user);

  const [isCreating, setIsCreating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  function startCreating() {
    setIsCreating(true);
  }

  function stopCreating() {
    setIsCreating(false);
  }

  function onCreateLocation({ locationData }) {
    alert("This function is not implemented yet!");
  }

  const {
    haveUserCoords,
    locations,
    loading,
    errorMsg,
    maxDist,
    distRange,
    setDistRange,
  } = useLocationsWithDistance({isFavouriteOnly: isFavourite});

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <>
      <LocationSheet
        location={selectedLocation}
        setSelectedLocation={setSelectedLocation}
      />
      { isCreating && admin &&
        <CreateNewLocationSheet
          isCreating={isCreating}
          onCancel={stopCreating}
          onCreate={onCreateLocation} 
        />
      }
      <div className="text-red-500">{errorMsg}</div>
      <div className="flex flex-col gap-y-4">
        <DataTable
          columns={getColumns(isFavourite, haveUserCoords)}
          data={locations}
          renderToolbar={() => 
            admin ? <Toolbar startCreating={startCreating} /> : null
          }
          renderSideMenu={(table) => (
            <LocationSideMenu
              getFilterName={() => table.getColumn("name")?.getFilterValue() ?? ""}
              setFilterName={(value) => table.getColumn("name")?.setFilterValue(value)}
              getFilterDistrict={() => table.getColumn("district")?.getFilterValue() ?? ""}
              setFilterDistrict={(value) =>
                table.getColumn("district")?.setFilterValue(value === "all" ? "" : (value || ""))
              }
              maxDist={maxDist}
              getDistRange={() => distRange}
              setDistRange={(newValue) => {
                setDistRange(newValue)
                table.getColumn("distance")?.setFilterValue(newValue)
              }}
              extraComponents={() => <DataTableViewOptions table={table} />}
            />
          )}
          onRowClick={ (row) => setSelectedLocation(row) }
        />
      </div>
    </>
  )
}

function getColumns(isFavourite, haveUserCoords) {
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
        const stringA = rowA.getValue(columnId)
        const stringB = rowB.getValue(columnId)
        const a = Number(stringA)
        const b = Number(stringB)
        if (Number.isNaN(a) || Number.isNaN(b)) {
          return stringA.localeCompare(stringB)
        }
        return a - b
      },
    },
    {
      accessorKey: "district",
      title: "District",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="District" />
      ),
    },
  ]

  if (haveUserCoords) {
    columns.push({
      accessorKey: "distance",
      title: "Distance (km)",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Distance (km)" />
      ),
      sortingFn: (rowA, rowB, columnId) => {
        const stringA = rowA.getValue(columnId)
        const stringB = rowB.getValue(columnId)
        const a = Number(stringA)
        const b = Number(stringB)
        if (Number.isNaN(a) || Number.isNaN(b)) {
          return stringA.localeCompare(stringB)
        }
        return a - b
      },
    })

    if (isFavourite) {
      columns.push({
        id: "actions",
        cell: () => {
          return <ToggleFavourite isFavourite={isFavourite} />;
        },
      })
    } else {
      columns.push({
        accessorKey: "isFavourite",
        title: "Favourite",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Favourite" />
        ),
        cell: ({ row }) => {
          const isFavourite = row.getValue("isFavourite")
          return <ToggleFavourite isFavourite={isFavourite} />;
        },
      })
    }
  }

  return columns
}

function Toolbar({ startCreating }) {
  return (
    <Button
      size="sm"
      onClick={startCreating}
      className="ml-auto h-8"
    >
      Create Location (Admin)
    </Button>
  );
}

function CreateNewLocationSheet({ isCreating, onCancel, onCreate }) {
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationDistrict, setNewLocationDistrict] = useState("");
  const [newLocationLatitude, setNewLocationLatitude] = useState(null);
  const [newLocationLongitude, setNewLocationLongitude] = useState(null);

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
        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          <Input
            placeholder="Location name"
            value={newLocationName}
            onChange={(event) =>
              setNewLocationName(event.target.value)
            }
          />
          <Select
            value={newLocationDistrict}
            onValueChange={(value) =>
              setNewLocationDistrict(value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a district" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Hong Kong Island</SelectLabel>
                  {hkIslandDistricts.map((district) => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Kowloon</SelectLabel>
                  {kowloonDistricts.map((district) => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>New Territories</SelectLabel>
                  {newTerritoriesDistricts.map((district) => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Input
            placeholder="Latitude"
            value={newLocationLatitude}
            type="number"
            onChange={(event) =>
              setNewLocationLatitude(event.target.value)
            }
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
        <SheetFooter>
          <Button onClick={onCreate}>Create location</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}