import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { Input } from "@/components/ui/input";

export default function UserManagerSideMenu({ table, refresh }) {
  return (
    <Card className="bg-transparent shadow-none gap-2 w-75">
      <CardHeader>
        <CardTitle>
          <span>Options</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Input
          placeholder="Search by name"
          value={table.getColumn("name")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
        />
        <Input
          placeholder="Search by email"
          value={table.getColumn("email")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
        />
        <div className="flex gap-2 justify-end">
          <Button size="sm" className="h-8" onClick={refresh}>
            Refresh
          </Button>
          <DataTableViewOptions table={table} className="!ml-0" />
        </div>
      </CardContent>
    </Card>
  );
}
