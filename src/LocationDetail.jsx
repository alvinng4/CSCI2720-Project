import { LoadingScreen } from "@/components/ui/loading-screen"
import { PageShell } from "@/components/page-shell"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";

export function LocationDetail() {
  const { id } = useParams();

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let isCancelled = false

    async function fetchData() {
      await loadLocationData(
        id,
        (data) => { if (!isCancelled) setLocation(data) },
        (value) => { if (!isCancelled) setLoading(value) },
        (msg) => { if (!isCancelled) setErrorMsg(msg) },
      );
    }

    fetchData();

    return () => {
      isCancelled = true;
    }
  }, [])

  if (loading) {
    return <LoadingScreen />
  }
  
  return (
    <>
      <div className="text-red-500">{errorMsg}</div>
      <PageShell title={location?.name}>
        {location?.id}
      </PageShell>
    </>
  );
}

async function loadLocationData(id, setLocation, setLoading, setErrorMsg) {
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

    const location = locationData.find(location => { return location.id === id });
    if (!location) {
        throw new Error("Location not found");
    }
    setLocation(location);
  } catch (err) {
    console.error(err);
    setErrorMsg("Failed to load location.");
  } finally {
    setLoading(false);
  }
}