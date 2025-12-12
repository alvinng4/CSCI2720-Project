import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export function MapComponent({ locations, center, onClick, style }) {
  return (
    <MapContainer center={center} zoom={11} style={style}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.latitude, loc.longitude]}
          eventHandlers={{
            click: () => onClick(loc),
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
