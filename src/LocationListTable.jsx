/**
 * Reusable location list table component (for LocationList and FavouriteList)
 */

import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions }  from "@/components/ui/data-table-view-options"
import { 
  getUserLocation,
  haversineDistance
} from "@/lib/utils";
import { LoadingScreen } from "@/components/ui/loading-screen"
import { LocationSheet } from "@/LocationSheet";
import { LocationSideMenu } from "@/components/location-side-menu";
import { ToggleFavourite } from "@/components/toggle-favourite"
import { getLocationsWithDistance } from "@/hooks/get-locations-with-distance";
import { useState } from "react"

export function LocationListTable({ isFavourite }) {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const {
    haveUserCoords,
    locations,
    loading,
    errorMsg,
    maxDist,
    distRange,
    setDistRange,
  } = getLocationsWithDistance();

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <>
      <LocationSheet
        location={selectedLocation}
        setSelectedLocation={setSelectedLocation}
      />
      <div className="text-red-500">{errorMsg}</div>
      <div className="container mx-auto">
      <DataTable
        columns={getColumns(isFavourite, haveUserCoords)}
        data={locations}
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
