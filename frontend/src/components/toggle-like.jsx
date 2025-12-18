// Group 33:
// Chan Darren Jun Rong (1155256148)
// Li Clement (1155214128)
// Ng Ching Yin (1155175606)
// Zhao Yiming (1155211152)

import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { getUser } from "@/lib/AuthHelpers";
import { requestToBackend } from "@/lib/utils";

export default function ToggleLike({ event, onUpdate, className }) {
  const filledIconClassName = "fill-red-500 stroke-red-500";
  const unfilledIconClassName = "fill-none stroke-gray-400";
  const filledTextClassName = "fill-red-500";
  const unfilledTextClassName = "text-gray-400";

  const isLike = event?.isLike ?? false;
  const numLikes = event?.numLikes ?? 0;

  const toggleLike = async (e) => {
    e.stopPropagation();
    const user = getUser();

    const result = await requestToBackend("POST", "likes/toggle", {
      user: user?.id,
      event: event?._id,
      isLike: isLike,
    });
    if (
      !result?.ok ||
      result?.data?.isLike === null ||
      result?.data?.numLikes === null
    ) {
      return;
    }
    onUpdate(event?.id, result.data.isLike, result.data.numLikes);
  };

  return (
    <div className="flex items-center gap-1">
      <Heart
        onClick={(e) => toggleLike(e)}
        className={cn(
          className,
          "cursor-pointer transition-colors",
          isLike ? filledIconClassName : unfilledIconClassName
        )}
      />
      <span
        className={cn(
          className,
          "transition-colors",
          isLike ? filledTextClassName : unfilledTextClassName
        )}
      >
        {numLikes}
      </span>
    </div>
  );
}
