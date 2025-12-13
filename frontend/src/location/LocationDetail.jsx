import { CommentsList } from "@/location/comments-list";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { MapComponent } from "@/location/map-component";
import { PageShell } from "@/components/page-shell";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { ToggleFavourite } from "@/components/toggle-favourite";
import { useLocationWithDistance } from "@/hooks/use-locations-with-distance";
import { useParams } from "react-router-dom";
import { useState } from "react";

export function LocationDetail() {
  const { id } = useParams();
  const [commentLength, setCommentLength] = useState(null);
  const { location, loading, errorMsg } = useLocationWithDistance(id);

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

  return (
    <>
      <PageShell title={location?.name}>
        <div className="text-red-500">{errorMsg}</div>
        {location && (
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
                          <ToggleFavourite location={location} />
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
                  {!!location &&
                    !!location?.latitude &&
                    !!location?.longitude && (
                      <MapComponent
                        locations={[location]}
                        center={[location?.latitude, location?.longitude]}
                        style={{ height: "500px", width: "100%", zIndex: "1" }}
                      />
                    )}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div>
              {/* Comments */}
              <div>
                {makeSubsectionTitle(`Comments (${commentLength})`)}
                <CommentsList
                  className="px-3 py-3 border rounded-md bg-muted/40"
                  location={location}
                  setCommentLength={setCommentLength}
                />
              </div>
            </div>
          </div>
        )}
      </PageShell>
    </>
  );
}

function makeSubsectionTitle(title) {
  return <h3 className="text-md font-semibold mb-2">{title}</h3>;
}
