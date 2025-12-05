/**
 * Reusable location list component (for LocationList and FavouriteList)
 */

import { Button } from "@/components/ui/Button"
import { Check, X } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions }  from "@/components/ui/data-table-view-options"
import { Input } from "@/components/ui/input"
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
import { Slider } from "@/components/ui/slider"
import { useEffect, useState } from "react"

import { newTerritoriesDistricts, kowloonDistricts, hkIslandDistricts } from "@/constants/districts"

export function LocationListComponent({ isFavourite }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [maxDist, setMaxDist] = useState(0)
  const [distRange, setDistRange] = useState([0, 0])

  useEffect(() => {
    let isCancelled = false

    async function fetchData() {
      await loadLocationData(
        (data) => { if (!isCancelled) setLocations(data) },
        (value) => { if (!isCancelled) setLoading(value) },
        (msg) => { if (!isCancelled) setErrorMsg(msg) },
        isFavourite,
      )
    }

    fetchData();

    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    if (locations.length > 0) {
      const newMax = Math.max(...locations.map((item) => item.distance));
      setMaxDist(newMax)
      setDistRange(([min]) => [min, newMax]);
    }
  }, [locations])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <div className="text-red-500">{errorMsg}</div>
      <div className="container mx-auto">
      <DataTable
        columns={getColumns(isFavourite)}
        data={locations}
        renderToolbar={
          (table) => toolBar(table, maxDist, distRange, setDistRange)
        } 
      />
      </div>
    </>
  )
}

async function loadLocationData(setLocations, setLoading, setErrorMsg, isFavourite) {
  setLoading(true);

  try {
    // TODO: database call to backend

    /* Fake data */
    const locationData = [
      {
        id: "22512700",
        name: "Hong Kong Heritage Museum (Thematic Galleries 1 & 2)",
        distance: 10.17,
        district: "Sha Tin",
        num_events: 3,
        isFavourite: true,
      },
      {
        id: "3110267",
        name: "North District Town Hall (Function Room (2))",
        distance: 12.17,
        district: "Sha Tin",
        num_events: 3,
        isFavourite: true,
      },
      {
        id: "35510044",
        name: "Tai Po Civic Centre (Black Box Theatre)",
        distance: 14.17,
        district: "Sha Tin",
        num_events: 3,
        isFavourite: false,
      },
      {
        id: "35517396",
        name: "Tai Po Civic Centre (Function Room (2))",
        distance: 16.17,
        district: "Sha Tin",
        num_events: 3,
        isFavourite: false,
      },
      {
        id: "826817417",
        name: "East Kowloon Cultural Centre (The Hall)",
        distance: 18.17,
        district: "Sha Tin",
        num_events: 3,
        isFavourite: false,
      },
      {
        id: "87110023",
        name: "Kwai Tsing Theatre (Auditorium)",
        distance: 20.17,
        district: "Sha Tin",
        num_events: 3,
        isFavourite: false,
      },
      {
        id: "87310051",
        name: "Yuen Long Theatre (Auditorium)",
        distance: 10.17,
        district: "Sha Tin",
        num_events: 3,
        isFavourite: false,
      },
      {
        id: "87410030",
        name: "Ngau Chi Wan Civic Centre (Theatre)",
        distance: 20.17,
        district: "Sha Tin",
        num_events: 7,
        isFavourite: false,
      },
      {
        id: "87510494",
        name: "Hong Kong City Hall (Exhibition Gallery)",
        distance: 30.17,
        district: "Sha Tin",
        num_events: 8,
        isFavourite: false,
      },
      {
        id: "87616551",
        name: "Ko Shan Theatre (New Wing Auditorium)",
        distance: 40.17,
        district: "Wan Chai",
        num_events: 4,
        isFavourite: false,
      },
    ];

    setLocations(isFavourite ? locationData.filter(location => location.isFavourite) : locationData);
  } catch (err) {
    console.error(err);
    setErrorMsg("Failed to load locations.");
  } finally {
    setLoading(false);
  }
}

function getColumns(isFavourite) {
  return [
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
    {
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
    },
    isFavourite ? 
    {
      id: "actions",
      cell: () => {
        return (
          <div className="flex justify-end">
            <Button
              align="end"
              variant="destructive"
              size="sm"
            >
              <X />
            </Button>
          </div>
        )
      },
    } :
    {
      accessorKey: "isFavourite",
      title: "Favourite",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Favourite" />
      ),
      cell: ({ row }) => {
        const isFavourite = row.getValue("isFavourite")
        return (
          <Button
            variant={isFavourite ? "default" : "outline"}
            size="sm"
          >
            <Check />
          </Button>
        )
      },
    },
  ]
}

function toolBar(table, maxDist, distRange, setDistRange) {
  return (
    <div className="flex items-end gap-x-2">
      <DataTableViewOptions table={table} />
      <Input
        placeholder="Search by name"
        value={(table.getColumn("name")?.getFilterValue()) ?? ""}
        onChange={(event) =>
          table.getColumn("name")?.setFilterValue(event.target.value)
        }
      />
      <Select
        value={(table.getColumn("district")?.getFilterValue()) ?? ""}
        onValueChange={(value) =>
          table.getColumn("district")?.setFilterValue(value == "all" ? "" : (value || ""))
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a district" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All districts</SelectItem>
          <SelectSeparator />
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
      <div className="flex flex-col text-muted-foreground dark:bg-input/30 border-input w-full rounded-md border bg-transparent md:h-14 px-3 py-1 pb-3 gap-y-2 text-base shadow-xs md:text-sm">
        <p>Distance Range ({distRange[0]} km - {distRange[1]} km)</p>
        <Slider
          value={distRange}
          onValueChange={(newValue) => {
            setDistRange(newValue)
            table.getColumn("distance")?.setFilterValue(newValue)
          }}
          max={maxDist}
          step={0.01}
        />
      </div>
    </div>
  )
}