import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export function MapComponent({ locations, onClick }) {
    if (!locations.length) {
        return <div>No locations to display</div>;
    }

    const center = [locations[0].latitude, locations[0].longitude];
    return (
        <MapContainer
          center={center}
          zoom={11}
          style={{ height: "700px", width: "80%", zIndex: "1"}}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© OpenStreetMap contributors'
          />
          {locations.map((loc) => (
            <Marker 
              key={loc.id} 
              position={[loc.latitude, loc.longitude]}
              eventHandlers={{ 
                click: (loc) => onClick(loc),
                mouseover: (e) => e.target.openPopup(),
                mouseout: (e) => e.target.closePopup(),
               }}
            >
              <Popup>{loc.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
    );
}