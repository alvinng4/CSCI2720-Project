import {
  getUserLocation,
  haversineDistance
} from "@/lib/utils"
import {
  useEffect,
  useState
} from "react"

/* Fake data 
const fakeLocationsData = [
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
*/
const res = await fetch("http://localhost:4000/api/locations/", {
  method: "GET",
})
const data = await res.json();
if (!res.ok) {
  alert(data.error)
}

const fakeLocationsData = data.map(loc=>({
  id: loc._id.toString(),        
  name: loc.nameE || "",           
  district: loc.district || "",    
  num_events: loc.num_events || 0,
  latitude: loc.latitude || 0,  
  longitude: loc.longitude || 0,
  isFavourite: loc.isFavourite || false,
}));

export function useLocationsWithDistance({ isFavouriteOnly = false } = {}) {
  const [haveUserCoords, setHaveUserCoords] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [maxDist, setMaxDist] = useState(0);
  const [distRange, setDistRange] = useState([0, 0]);

  useEffect(() => {
    let isCancelled = false
    async function fetchData() {
      setLoading(true);
      try {
        let userCoords = null;

        try {
          userCoords = await getUserLocation();
          setHaveUserCoords(true);
        } catch {
          if (!isCancelled) {
            setErrorMsg("Failed to get user location. Showing data without distance.")
          }
        }

        await loadLocationsData(
          (data) => {
            if (isCancelled) return;
            const filtered = isFavouriteOnly
              ? data.filter((loc) => loc.isFavourite)
              : data;

            if (!userCoords) {
              setLocations(filtered);
              return;
            }

            const dataWithDistance = filtered.map((loc) => ({
              ...loc,
              distance: haversineDistance(
                userCoords.latitude,
                userCoords.longitude,
                loc.latitude,
                loc.longitude,
              ),
            }));
            setLocations(dataWithDistance);
          },
        );
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { isCancelled = true; };
  }, [isFavouriteOnly]);

  useEffect(() => {
    if (!haveUserCoords) return;
    const distances = locations
      .map((item) => item.distance)
      .filter((d) => typeof d === "number" && !Number.isNaN(d));

    if (distances.length > 0) {
      const newMax = Math.max(...distances);
      setMaxDist(newMax);
      setDistRange(([min]) => [min, newMax]);
    }
  }, [locations, haveUserCoords]);

  return {
    haveUserCoords,
    locations,
    loading,
    errorMsg,
    maxDist,
    distRange,
    setDistRange,
  };
}

export function useLocationWithDistance(id) {
  const [haveUserCoords, setHaveUserCoords] = useState(false);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }
    let isCancelled = false;

    async function fetchData() {
      setLoading(true);
      try {
        let userCoords = null;
        try {
          userCoords = await getUserLocation();
          setHaveUserCoords(true);
        } catch {
          if (!isCancelled) {
            setErrorMsg("Failed to get user location. Showing data without distance.");
          }
        }

        const baseLoc = await loadLocationData(id);

        if (!baseLoc) {
          if (!isCancelled) {
            setLocation(null);
            setErrorMsg("Location not found.");
          }
          return;
        }

        if (!userCoords) {
          return setLocation(baseLoc);
        }

        const locWithDistance = {
          ...baseLoc,
          distance: haversineDistance(
            userCoords.latitude,
            userCoords.longitude,
            baseLoc.latitude,
            baseLoc.longitude,
          ),
        };

        if (!isCancelled) {
          setLocation(locWithDistance);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => { isCancelled = true; };
  }, [id]);

  return { 
    haveUserCoords,
    location,
    loading,
    errorMsg,
  };
}

async function loadLocationsData(setLocations) {
  setLocations(fakeLocationsData);
}

async function loadLocationData(id) {
  return fakeLocationsData.find((item) => item.id === id) || null;
}