import { cn } from "@/lib/utils"
import { Heart } from "lucide-react"

export function ToggleFavourite({ isFavourite, setIsFavourite, className }) {
  return (
    <Heart
      onClick={setIsFavourite?.(!isFavourite)}
      className={
        cn(
          className, 
          `cursor-pointer transition-colors ${
            isFavourite
              ? "fill-red-500 stroke-red-500 hover:fill-none hover:stroke-red-500"
              : "fill-none stroke-gray-400 hover:stroke-red-500"
          }`
        )
      }
    />
  );
}