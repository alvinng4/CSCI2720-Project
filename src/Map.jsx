import { LocationSideMenu } from "@/components/location-side-menu";
import { MapComponent } from "@/components/map-component";
import { PageShell } from "@/components/page-shell"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"

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

export function Map() {
  const [filterName, setFilterName] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [maxDist, setMaxDist] = useState(0);
  const [distRange, setDistRange] = useState([0, 0]);
  const navigate = useNavigate();

  const locations = locationData;

  useEffect(() => {
    if (locations.length > 0) {
      const newMax = Math.max(...locations.map((item) => item.distance));
      setMaxDist(newMax);
      setDistRange(([min]) => [min, newMax]);
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

  return (
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
            center={[locations[0].latitude, locations[0].longitude]}
            onClick={(loc) => navigate(`/location/${loc.id}`)}
            style={{ height: "700px", width: "100%", zIndex: "1"}}
          />
        </div>
      </div>
    </PageShell>
  )
}