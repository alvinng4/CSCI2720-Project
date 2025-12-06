/**
 * Reusable location list component (for LocationList and FavouriteList)
 */

import { Button } from "@/components/ui/Button"
import { Check, X } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableViewOptions }  from "@/components/ui/data-table-view-options"
import { LocationSideMenu } from "@/components/location-side-menu";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export function LocationListComponent({ isFavourite }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [maxDist, setMaxDist] = useState(0);
  const [distRange, setDistRange] = useState([0, 0]);
  
  const navigate = useNavigate();

  useEffect(() => {
    let isCancelled = false

    async function fetchData() {
      await loadLocationData(
        (data) => { if (!isCancelled) setLocations(data) },
        (value) => { if (!isCancelled) setLoading(value) },
        (msg) => { if (!isCancelled) setErrorMsg(msg) },
        isFavourite,
      );
    }

    fetchData();

    return () => {
      isCancelled = true;
    }
  }, [])

  useEffect(() => {
    if (locations.length > 0) {
      const newMax = Math.max(...locations.map((item) => item.distance));
      setMaxDist(newMax);
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
        onRowClick={ (row) => navigate(`/location/${row.id}`) }
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
      latitude: 22.31368,
      longitude: 114.18556,
      isFavourite: true,
    },
    {
      id: "3110267",
      name: "North District Town Hall (Function Room (2))",
      distance: 12.17,
      district: "Sha Tin",
      num_events: 3,
      latitude: 22.2818,
      longitude: 114.222501,
      isFavourite: true,
    },
    {
      id: "35510044",
      name: "Tai Po Civic Centre (Black Box Theatre)",
      distance: 14.17,
      district: "Sha Tin",
      num_events: 3,
      latitude: 22.32427,
      longitude: 114.21494,
      isFavourite: false,
    },
    {
      id: "35517396",
      name: "Tai Po Civic Centre (Function Room (2))",
      distance: 16.17,
      district: "Sha Tin",
      num_events: 3,
      latitude: 22.356656,
      longitude: 114.12623,
      isFavourite: false,
    },
    {
      id: "826817417",
      name: "East Kowloon Cultural Centre (The Hall)",
      distance: 18.17,
      district: "Sha Tin",
      num_events: 3,
      latitude: 22.31368,
      longitude: 114.18556,
      isFavourite: false,
    },
    {
      id: "87110023",
      name: "Kwai Tsing Theatre (Auditorium)",
      distance: 20.17,
      district: "Sha Tin",
      num_events: 3,
      latitude: 22.334583,
      longitude: 114.208766,
      isFavourite: false,
    },
    {
      id: "87310051",
      name: "Yuen Long Theatre (Auditorium)",
      distance: 10.17,
      district: "Sha Tin",
      num_events: 3,
      latitude: 22.282279,
      longitude: 114.161545,
      isFavourite: false,
    },
    {
      id: "87410030",
      name: "Ngau Chi Wan Civic Centre (Theatre)",
      distance: 20.17,
      district: "Sha Tin",
      num_events: 7,
      latitude: 22.44152,
      longitude: 114.02289,
      isFavourite: false,
    },
    {
      id: "87510494",
      name: "Hong Kong City Hall (Exhibition Gallery)",
      distance: 30.17,
      district: "Sha Tin",
      num_events: 8,
      latitude: 22.501639,
      longitude: 114.128911,
      isFavourite: false,
    },
    {
      id: "87616551",
      name: "Ko Shan Theatre (New Wing Auditorium)",
      distance: 40.17,
      district: "Wan Chai",
      num_events: 4,
      latitude: 22.28602,
      longitude: 114.14967,
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
