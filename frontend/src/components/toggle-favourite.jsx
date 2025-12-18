// Group 33:
// Chan Darren Jun Rong (1155256148)
// Li Clement (1155214128)
// Ng Ching Yin (1155175606)
// Zhao Yiming (1155211152)

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

import { getUser } from "@/lib/AuthHelpers";
import { requestToBackend } from "@/lib/utils";

export default function ToggleFavourite({ location, onUpdate, className }) {
  const filledClassName = "fill-yellow-400 stroke-yellow-400";
  const unfilledClassName = "fill-none stroke-gray-400";

  const isFavourite = location?.isFavourite ?? false;

  const toggleFavourite = async (e) => {
    e.stopPropagation();
    const user = getUser();

    const result = await requestToBackend("POST", "favourites/toggle", {
      user: user?.id,
      location: location?.id,
      isFavourite,
    });
    if (!result?.ok || result?.data?.isFavourite === null) {
      return;
    }

    onUpdate(location?.id, result.data.isFavourite);
  };

  return (
    <Star
      onClick={(e) => toggleFavourite(e)}
      className={cn(
        className,
        "cursor-pointer transition-colors",
        isFavourite ? filledClassName : unfilledClassName
      )}
    />
  );
}
