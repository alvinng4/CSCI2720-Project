// Group 33:
// Chan Darren Jun Rong (1155256148)
// Li Clement (1155214128)
// Ng Ching Yin (1155175606)
// Zhao Yiming (1155211152)

import { Button } from "@/components/ui/button";

export default function CommonTableToolbar({
  lastSyncTime,
  admin,
  caption,
  onClick,
}) {
  return (
    <div className="ml-auto flex items-center gap-3">
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        Last Updated on{" "}
        {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : ""}
      </span>
      {admin && (
        <Button size="sm" onClick={onClick} className="ml-auto h-8">
          {caption}
        </Button>
      )}
    </div>
  );
}
