import { PageShell } from "@/components/page-shell"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import locationsData from "/data/venues_cleaned.json";

export function Map() {
  const locations = locationsData.venues.venue;
  const center = [locations[0].latitude, locations[0].longitude];
  return (
    <PageShell title="Map">
      <div className="flex items-center gap-x-2">
        <MapContainer
          center={center}
          zoom={11}
          style={{ height: "700px", width: "80%"}}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© OpenStreetMap contributors'
          />
          {locations.map((loc) => (
            <Marker key={loc._id} position={[loc.latitude, loc.longitude]}>
              <Popup>{loc.venuee}</Popup>
            </Marker>
          ))}
        </MapContainer>
        
      </div>
      
      
    </PageShell>
  )
}