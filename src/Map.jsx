import { PageShell } from "@/components/page-shell"
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FieldGroup, Field } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapComponent } from "@/components/map-component";

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

  const locations = locationData;
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
                {commentsData.filter((com) => com.locID === selectedLocation?.id)
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
        <MapComponent
          locations={locations}
          onClick={(loc) => setSelectedLocation(loc)}
        />
      </div>
    </PageShell>
  )
}