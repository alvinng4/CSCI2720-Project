import { PageShell } from "@/components/page-shell"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import locationsData from "/data/venues_cleaned.json";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FieldGroup, Field } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Map() {
  const locations = locationsData.venues.venue;
  const center = [locations[0].latitude, locations[0].longitude];
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [comment, setComment] = useState("");
  return (
    <PageShell title="Map">
      <div className="flex items-center justify-center gap-x-2">
        <Sheet open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
          <SheetContent side="left" className="w-200">
            <SheetHeader>
              <SheetTitle>
                {selectedLocation?.venuee}
              </SheetTitle>
            </SheetHeader>
            <div className="justify-items-center gap-x-2">
              <p>Comments</p>
              <br></br>
              <div>
                <div className=" overflow-auto rounded-2xl border p-2 shadow-sm w-80 break-words whitespace-normal">
                  Comment 1
                </div>
                <div className=" overflow-hidden rounded-2xl border p-2 shadow-sm w-80 break-words whitespace-normal">
                  Comment 2
                </div>
              </div>
              <br></br>
              <form className="w-80">
                <FieldGroup>
                  <Field>
                    <Input
                      id="comment"
                      type="text"
                      value={comment}
                      placeholder="What is your comment?"
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <Button>Add Comment</Button>
                  </Field>
                </FieldGroup>
              </form>
            </div>
            
            
          </SheetContent>
        </Sheet>
        {selectedLocation && (
          <div
            className="fixed inset-0 bg-black/10 z-40"
            onClick={() => setSelectedLocation(null)}
          />
        )}
        <MapContainer
          center={center}
          zoom={11}
          style={{ height: "700px", width: "80%" ,zIndex:"1"}}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© OpenStreetMap contributors'
          />
          {locations.map((loc) => (
            <Marker 
              key={loc._id} 
              position={[loc.latitude, loc.longitude]}
              eventHandlers={{ 
                click: () => setSelectedLocation(loc),
                mouseover: (e) => e.target.openPopup(),
                mouseout: (e) => e.target.closePopup()
               }}
            >
              <Popup>{loc.venuee}</Popup>
            </Marker>
          ))}
        </MapContainer>
        
      </div>
      
      
    </PageShell>
  )
}