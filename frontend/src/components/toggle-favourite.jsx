import { cn } from "@/lib/utils";
import { getToken, getUser } from "@/lib/AuthHelpers";
import { Star } from "lucide-react";
import { useState } from "react";

const API_BASE =
  (import.meta?.env?.VITE_API_BASE ?? "http://localhost:4000") + "/api";

export function ToggleFavourite({ location, onUpdate, className }) {
  const filledClassName = "fill-yellow-400 stroke-yellow-400"
  const unfilledClassName = "fill-none stroke-gray-400"
  const [isFavourite, setIsFavourite] = useState(location.isFavourite);
  const [justClicked, setJustClicked] = useState(false);

  const toggleFavourite = async (event) => {
    event.stopPropagation();
    let res = null;
    const user = getUser();
    try {
      res = await fetch(`${API_BASE}/favourites/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          user: user.id,
          location: location.id,
          isFavourite,
        }),
      });
    } catch (err) {
      console.log(err);
      return;
    }

    if (!res.ok) {
      return;
    }

    const data = await res.json();
    setIsFavourite(data.isFavourite);
    onUpdate(location?.id, data.isFavourite);
    setJustClicked(true);
  };

  const handleMouseOut = () => {
    setJustClicked(false);
  };

  return (
    <Star
      onClick={(event) => toggleFavourite(event)}
      onMouseOut={handleMouseOut}
      className={cn(
        className,
        "cursor-pointer transition-colors",
        isFavourite ? filledClassName : unfilledClassName
      )}
    />
  );
}
