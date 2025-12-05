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
  const handleAddComment = (e) => {
    e.preventDefault();
    if(comment==="") return;
    setCommentsData((prev) => [
      ...prev,
      {
        _id: crypto.randomUUID(),
        content: comment,
        locID: selectedLocation._id
      }
    ]);
    setComment("");
  };
const locations = locationsData;
const center = [locations[0].latitude, locations[0].longitude];
const [selectedLocation, setSelectedLocation] = useState(null);
const [comment, setComment] = useState("");
const [commentsData, setCommentsData] = useState([
{
      "_id": "1",
      "content": "cool",
      "locID": "22512700" 
    },
    {
      "_id": "2",
      "content": "I like this",
      "locID": "3110267" 
    },
    {
      "_id": "3",
      "content": "good",
      "locID": "35510044" 
    },{
      "_id": "4",
      "content": "too far",
      "locID": "35517396" 
    },{
      "_id": "5",
      "content": "boring",
      "locID": "87110023" 
    },{
      "_id": "6",
      "content": "great",
      "locID": "87310051" 
    },
    {
      "_id": "7",
      "content": "haha",
      "locID": "22512700" 
    },
]);
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
                {commentsData.filter((com) => com.locID === selectedLocation?._id)
                .map((com) => (
                  <div key={com.id} className=" overflow-auto rounded-2xl border p-2 shadow-sm w-80 break-words whitespace-normal">
                    {com.content}
                  </div>
                ))}
              </div>
              <br></br>
              <form className="w-80" onSubmit={handleAddComment}>
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
                    <Button type="submit">Add Comment</Button>
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