import { X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { PageShell } from "@/components/page-shell"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { Input } from "@/components/ui/input"

/* Fake data */
const locationData = [
  {
    id: "22512700",
    name: "Hong Kong Heritage Museum (Thematic Galleries 1 & 2)",
  },
  {
    id: "3110267",
    name: "North District Town Hall (Function Room (2))",
  },
];

export function FavouriteList() {
  return (
    <PageShell title="Favourite List">
      <div className="container mx-auto">
        <DataTable columns={columns} data={locationData} renderToolbar={toolBar} />
      </div>
    </PageShell>
  )
}

const columns = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    sortingFn: (rowA, rowB, columnId) => {
      const stringA = rowA.getValue(columnId)
      const stringB = rowB.getValue(columnId)
      const a = Number(stringA)
      const b = Number(stringB)
      if (Number.isNaN(a) || Number.isNaN(b)) {
        return stringA.localeCompare(stringB)
      }
      return a - b
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    id: "actions",
    cell: () => {
      return (
        <div className="flex justify-end">
          <Button
            align="end"
            variant="destructive"
            size="sm"
          >
            <X />
          </Button>
        </div>
      )
    },
  },
]

function toolBar({ table }) {
  return (
    <div className="flex items-center">
      <Input
        placeholder="Search by name"
        value={(table.getColumn("name")?.getFilterValue()) ?? ""}
        onChange={(event) =>
          table.getColumn("name")?.setFilterValue(event.target.value)
        }
        className="max-w-xs"
      />
    </div>
  )
}