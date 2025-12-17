import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { useState } from "react";

import { getUser } from "@/lib/AuthHelpers";
import { requestToBackend } from "@/lib/utils";

export function ToggleFavourite({ location, onUpdate, className }) {
  const filledClassName = "fill-yellow-400 stroke-yellow-400";
  const unfilledClassName = "fill-none stroke-gray-400";
  const [isFavourite, setIsFavourite] = useState(location.isFavourite);

  const toggleFavourite = async (event) => {
    event.stopPropagation();
    const user = getUser();

    const result = await requestToBackend("POST", "favourites/toggle", {
      user: user.id,
      location: location.id,
      isFavourite,
    });
    if (!result?.ok || result?.data?.isFavourite === null) {
      console.log(result);
      return;
    }

    setIsFavourite(result.data.isFavourite);
    onUpdate(location?.id, result.data.isFavourite);
  };

  return (
    <Star
      onClick={(event) => toggleFavourite(event)}
      className={cn(
        className,
        "cursor-pointer transition-colors",
        isFavourite ? filledClassName : unfilledClassName
      )}
    />
  );
}
