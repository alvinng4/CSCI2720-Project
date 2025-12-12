import { CommentsList } from "@/components/comments-list";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { MapComponent } from "@/components/map-component";
import { PageShell } from "@/components/page-shell";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { ToggleFavourite } from "@/components/toggle-favourite";
import { useLocationWithDistance } from "@/hooks/use-locations-with-distance";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUser } from "@/lib/AuthHelpers";

export function LocationDetail() {
  const { id } = useParams();
  const { location, loading, errorMsg } = useLocationWithDistance(id);
  const [comments, setComments] = useState([]);
  const user = getUser();
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!location) return;

    // fetch(`http://localhost:4000/api/locations/${location.id}/comments`, {
    //   method: "GET",
    //   headers: {
    //     authorization: `Bearer ${token}`,
    //   },
    // })
    //   .then((res) => res.json())
    //   .then((data) => {
    //     const mappedData = data.map((com) => ({
    //       id: com._id,
    //       user: { username: com.userId.username },
    //       content: com.text,
    //       timestamps: com.createdAt,
    //     }));
    //     console.log(mappedData);
    //     setComments(mappedData);
    //     console.log(comments);
    //     console.log("Updated comments state:", mappedData);
    //   })
    //   .catch((err) => {
    //     setComments([]);
    //     console.log(err);
    //   });
  }, [location]);

  if (loading) {
    return <LoadingScreen />;
  }

  const info = [
    { label: "District", value: location?.district },
    { label: "Latitude", value: location?.latitude },
    { label: "Longitude", value: location?.longitude },
    {
      label: "Distance",
      value: location?.distance != null ? `${location?.distance} km` : "N/A",
    },
    { label: "# Events", value: location?.num_events },
  ];

  // async function handleAddComment(userInput) {
  //   console.log(userInput);
  //   console.log(location.id);
  //   console.log(user.id);
  //   console.log(token);
  //   if (!token) {
  //     alert("Please log in to leave a comment.");
  //     return;
  //   }

  //   const newComment = {
  //     user: { username: user.username },
  //     content: userInput,
  //     timestamps: new Date().toISOString(),
  //   };
  //   setComments((prevComments) => [newComment, ...prevComments]);

  //   const res = await fetch(
  //     `http://localhost:4000/api/locations/${location.id}/comments`,
  //     {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         authorization: `Bearer ${token}`,
  //       },

  //       body: JSON.stringify({
  //         userId: user.id,
  //         locationId: location.id,
  //         text: userInput,
  //       }),
  //     }
  //   );
  //   const data = await res.text();
  //   console.log("RESULT:", data);

  //   if (!res.ok) {
  //     alert(data);
  //     return;
  //   }
  // }

  return (
    <>
      <PageShell title={location?.name}>
        <div className="text-red-500">{errorMsg}</div>
        {location &&
        <div className="px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Information */}
            <div>
              {makeSubsectionTitle("Information")}
              <div className="border rounded-md">
                <Table>
                  <TableBody>
                    {info.map((item) => (
                      <TableRow key={item.label}>
                        <TableCell className="font-medium w-40">
                          {item.label}
                        </TableCell>
                        <TableCell>{item.value}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-medium w-40">
                        Favourite
                      </TableCell>
                      <TableCell>
                        <ToggleFavourite isFavourite={location?.isFavourite} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Map */}
            <div>
              {makeSubsectionTitle("Map")}
              <div className="px-3 py-3 border rounded-md bg-muted/40">
                {!!location && !!(location?.latitude) && !!(location?.longitude) &&
                  <MapComponent
                    locations={[location]}
                    center={[location?.latitude, location?.longitude]}
                    style={{ height: "500px", width: "100%", zIndex: "1" }}
                  />
                }
              </div>
            </div>
          </div>

          {/* Right column */}
          <div>
            {/* Comments */}
            <div>
              {/* {makeSubsectionTitle(`Comments (${comments.length})`)} */}
              {/* <CommentsList
                comments={comments}
                className="px-3 py-3 border rounded-md bg-muted/40"
                location={location}
                onSubmit={handleAddComment}
              /> */}
            </div>
          </div>
        </div>
        }
      </PageShell>
    </>
  );
}

function makeSubsectionTitle(title) {
  return <h3 className="text-md font-semibold mb-2">{title}</h3>;
}
