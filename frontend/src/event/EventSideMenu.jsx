import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { Input } from "@/components/ui/input";

export default function EventSideMenu({ table, refresh }) {
  return (
    <Card className="bg-transparent shadow-none gap-2 min-w-80">
      <CardHeader>
        <CardTitle>
          <span>Options</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Input
          placeholder="Search by title"
          value={table.getColumn("titleE")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("titleE")?.setFilterValue(event.target.value)
          }
        />
        <Input
          placeholder="Search by description"
          value={table.getColumn("descE")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("descE")?.setFilterValue(event.target.value)
          }
        />
        <Input
          placeholder="Search by location"
          value={table.getColumn("location")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("location")?.setFilterValue(event.target.value)
          }
        />
        <Input
          placeholder="Search by date"
          value={table.getColumn("preDateE")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("preDateE")?.setFilterValue(event.target.value)
          }
        />
        <Input
          placeholder="Search by duration"
          value={table.getColumn("progTimeE")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("progTimeE")?.setFilterValue(event.target.value)
          }
        />
        <Input
          placeholder="Search by price"
          value={table.getColumn("priceE")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("priceE")?.setFilterValue(event.target.value)
          }
        />
        <Input
          placeholder="Search by presenters"
          value={table.getColumn("presenterOrgE")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("presenterOrgE")?.setFilterValue(event.target.value)
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
