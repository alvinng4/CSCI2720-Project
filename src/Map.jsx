import { 
  getUserLocation,
  haversineDistance
} from "@/lib/utils";
import { LocationSheet } from "@/LocationSheet";
import { LocationSideMenu } from "@/components/location-side-menu";
import { MapComponent } from "@/components/map-component";
import { PageShell } from "@/components/page-shell"
import { 
  useEffect,
  useState 
} from "react"


export function Map() {
  const [haveUserCoords, setHaveUserCoords] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [maxDist, setMaxDist] = useState(0);
  const [distRange, setDistRange] = useState([0, 0]);

  const [filterName, setFilterName] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  
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
        );
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchData();

    return () => { isCancelled = true; };
  }, [])
  
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

  const filteredLocations = locations.filter((loc) => {
    const [minDistVal, maxDistVal] = distRange;

    const matchName = (
      !filterName ||
      loc.name.toLowerCase().includes(filterName.toLowerCase())
    );
    if (!matchName) { return false }

    const matchDistrict = (
      !filterDistrict ||
      loc.district.toLowerCase() === filterDistrict.toLowerCase()
    );
    if (!matchDistrict) { return false }

    const matchDistance = (loc.distance >= minDistVal && loc.distance <= maxDistVal);
    if (!matchDistance) { return false }

    return true;
  });

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <LocationSheet
        location={selectedLocation}
        setSelectedLocation={setSelectedLocation}
      />
      <div className="text-red-500">{errorMsg}</div>
      <PageShell title="Map">
        <div className="flex flex-col gap-4 lg:flex-row justify-center w-full">
          <aside className="min-w-85">
            <LocationSideMenu
              getFilterName={() => filterName}
              setFilterName={setFilterName}
              getFilterDistrict={() => filterDistrict}
              setFilterDistrict={setFilterDistrict}
              maxDist={maxDist}
              getDistRange={() => distRange}
              setDistRange={setDistRange}
            />
          </aside>
          <div className="w-full">
            <MapComponent
              locations={filteredLocations}
              center={[locations[0]?.latitude, locations[0]?.longitude]}
              onClick={(loc) => setSelectedLocation(loc)}
              style={{ height: "700px", width: "100%", zIndex: "1"}}
            />
          </div>
        </div>
      </PageShell>
    </>
  )
}

async function loadLocationData(setLocations) {
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

  setLocations(locationData);
}