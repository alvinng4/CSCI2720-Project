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
import { 
  useEffect,
  useState 
} from "react"

export function LocationListTable({ isFavourite }) {
  const [haveUserCoords, setHaveUserCoords] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [maxDist, setMaxDist] = useState(0);
  const [distRange, setDistRange] = useState([0, 0]);

  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    let isCancelled = false
    async function fetchData() {
      setLoading(true);
      try {
        let userCoords = null;

        try {
          userCoords = await getUserLocation();
          setHaveUserCoords(true);
        } catch (e) {
          if (!isCancelled) {
            setErrorMsg("Failed to get user location. Showing data without distance.")
          }
        }

        await loadLocationData(
          (data) => { 
            if (isCancelled) { return; }
            if (!userCoords)
            { 
              setLocations(data);
              return;
            }

            const dataWithDistance = data.map((loc) => ({
              ...loc,
              distance: haversineDistance(
                userCoords.latitude,
                userCoords.longitude,
                loc.latitude,
                loc.longitude,
              ),
            }))
            setLocations(dataWithDistance) 
          },
          isFavourite,
        );
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchData();

    return () => { isCancelled = true; };
  }, [isFavourite])

  useEffect(() => {
    if (haveUserCoords)
    {
      const distances = locations
        .map((item) => item.distance)
        .filter((d) => typeof d === "number" && !Number.isNaN(d))

      if (distances.length > 0) {
        const newMax = Math.max(...distances);
        setMaxDist(newMax);
        setDistRange(([min]) => [min, newMax]);
      }
    }
  }, [locations])

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

async function loadLocationData(setLocations, isFavourite) {
  /* Fake data */
  const locationData = [
    {
      id: "22512700",
      name: "Hong Kong Heritage Museum (Thematic Galleries 1 & 2)",
      district: "Sha Tin",
      num_events: 3,
      latitude: 22.31368,
      longitude: 114.18556,
      isFavourite: true,
    },
    {
      id: "3110267",
      name: "North District Town Hall (Function Room (2))",
      district: "Sha Tin",
      num_events: 3,
      latitude: 22.2818,
      longitude: 114.222501,
      isFavourite: true,
    },
    {
      id: "35510044",
      name: "Tai Po Civic Centre (Black Box Theatre)",
      district: "Sha Tin",
      num_events: 3,
      latitude: 22.32427,
      longitude: 114.21494,
      isFavourite: false,
    },
    {
      id: "35517396",
      name: "Tai Po Civic Centre (Function Room (2))",
      district: "Sha Tin",
      num_events: 3,
      latitude: 22.356656,
      longitude: 114.12623,
      isFavourite: false,
    },
    {
      id: "826817417",
      name: "East Kowloon Cultural Centre (The Hall)",
      district: "Sha Tin",
      num_events: 3,
      latitude: 22.31368,
      longitude: 114.18556,
      isFavourite: false,
    },
    {
      id: "87110023",
      name: "Kwai Tsing Theatre (Auditorium)",
      district: "Sha Tin",
      num_events: 3,
      latitude: 22.334583,
      longitude: 114.208766,
      isFavourite: false,
    },
    {
      id: "87310051",
      name: "Yuen Long Theatre (Auditorium)",
      district: "Sha Tin",
      num_events: 3,
      latitude: 22.282279,
      longitude: 114.161545,
      isFavourite: false,
    },
    {
      id: "87410030",
      name: "Ngau Chi Wan Civic Centre (Theatre)",
      district: "Sha Tin",
      num_events: 7,
      latitude: 22.44152,
      longitude: 114.02289,
      isFavourite: false,
    },
    {
      id: "87510494",
      name: "Hong Kong City Hall (Exhibition Gallery)",
      district: "Sha Tin",
      num_events: 8,
      latitude: 22.501639,
      longitude: 114.128911,
      isFavourite: false,
    },
    {
      id: "87616551",
      name: "Ko Shan Theatre (New Wing Auditorium)",
      district: "Wan Chai",
      num_events: 4,
      latitude: 22.28602,
      longitude: 114.14967,
      isFavourite: false,
    },
  ]

  setLocations(isFavourite ? locationData.filter(location => location.isFavourite) : locationData);
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
