import { Button } from "@/components/ui/button"
import { CommentsList } from "@/components/comments-list";
import { MapComponent } from "@/components/map-component";
import { 
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { ToggleFavourite } from "@/components/toggle-favourite"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import { useAuth } from "./lib/AuthContext";
//import { timeStamp } from "console";


/* Fake comments 
let comments = [
  {
    '_id': 1,
    'user': { 'username': "testabc" },
    'content': 'Cool!',
    'timestamp': new Date(),
  },
  {
    '_id': 2,
    'user': { 'username': "testxxxxxxxxxxxxxxxxxxxxxxxxxx" },
    'content': 'I like this.',
    'timestamp': new Date(),
  },
  {
    '_id': 3,
    'user': { 'username': "testabc" },
    'content': 'Test\nmulti-line\nTest.',
    'timestamp': new Date(),
  },
]*/



export function LocationSheet({ location, setSelectedLocation }) {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const{user} = useAuth();
  const token = localStorage.getItem('authToken');
  useEffect(() => {
    if (!location) return;

    fetch(`http://localhost:4000/api/locations/${location.id}/comments`,
      {
        method: "GET",
        headers: { 
          "authorization": `Bearer ${token}`
        }
      }
      )
      .then(res => res.json())
      .then(data => {
        const mappedData = data.map((com)=>({
          id: com._id,
          user: {username: com.userId.username},
          content: com.text,
          timestamps: com.createdAt,
        }));
        console.log(mappedData)
        setComments(mappedData)
        console.log(comments)
        console.log("Updated comments state:", mappedData); 
      })
      .catch((err) => {
        setComments([])
        console.log(err)
      })
  }, [location]);
  
  if (!location) return null;

  

  const info = [
    { label: "District", value: location.district },
    { label: "Distance", value: location.distance != null ? `${location.distance} km` : "N/A" },
    { label: "# Events", value: location.num_events },
  ];


  
  async function handleAddComment(userInput){
    console.log(userInput);
    console.log(location.id);
    console.log(user.id);
    console.log(token)
    if (!token) {
      alert("Please log in to leave a comment.");
      return;
    }


    const newComment = {
      user: { username: user.username },
      content: userInput,
      timestamps: new Date().toISOString(),
    };
    setComments((prevComments) => [newComment, ...prevComments]);

    const res = await fetch(`http://localhost:4000/api/locations/${location.id}/comments`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "authorization": `Bearer ${token}`
      },
      
      body: JSON.stringify({
        userId: user.id,
        locationId: location.id,
        text: userInput,
      }),

    })
    const data = await res.text();
    console.log("RESULT:", data);
    
    if (!res.ok) {
      alert(data);
      return
    }
    
  }


  return (
    <Sheet
      open={!!location}
      onOpenChange={(open) => {
        if (!open) { setSelectedLocation(null); }
      }}
    >
      <SheetContent side="left" className="w-200 flex flex-col">
        <SheetHeader className="px-4">
          <SheetTitle>
            {location?.name}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          
          {/* Information */}
          <div>
            {makeSubsectionTitle('Information')}
            <div className="border rounded-md">
              <Table>
                <TableBody>
                  {info.map((item) => (
                    <TableRow key={item.label}>
                      <TableCell className="font-medium w-40">{item.label}</TableCell>
                      <TableCell>{item.value}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className="font-medium w-40">Favourite</TableCell>
                    <TableCell>
                      <ToggleFavourite
                        isFavourite={location.isFavourite}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Map */}
          <div>
            {makeSubsectionTitle('Map')}
            <div className="px-3 py-3 border rounded-md bg-muted/40">
              <MapComponent
                locations={[location]}
                center={[location?.latitude, location?.longitude]}
                style={{ height: "200px", width: "100%", zIndex: "1"}}
              />
            </div>
          </div>
          
          {/* Comments */}
          <div>
            {makeSubsectionTitle(`Comments (${comments.length})`)}
            <CommentsList
              comments={comments}
              className="px-3 py-3 border rounded-md bg-muted/40"
              location={location}
              onSubmit={handleAddComment}
            />
          </div>
        </div>
        <SheetFooter>
          <Button onClick={() => navigate(`/location/${location.id}`)}>See details</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function makeSubsectionTitle(title) {
  return (
    <h3 className="text-md font-semibold mb-2">{title}</h3>
  );
}

