/**
 * NOTE: While the DataTable are currently placed in "@/components/ui/data-table",
 * we may copy the code here and add custom components like distance filtering.
 */

import { Check } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { PageShell } from "@/components/page-shell"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"

/* Fake data */
const locationData = [
  {
    id: "22512700",
    name: "Hong Kong Heritage Museum (Thematic Galleries 1 & 2)",
    distance: 10.17,
    isFavourite: true,
  },
  {
    id: "3110267",
    name: "North District Town Hall (Function Room (2))",
    distance: 12.17,
    isFavourite: true,
  },
  {
    id: "35510044",
    name: "Tai Po Civic Centre (Black Box Theatre)",
    distance: 14.17,
    isFavourite: false,
  },
  {
    id: "35517396",
    name: "Tai Po Civic Centre (Function Room (2))",
    distance: 16.17,
    isFavourite: false,
  },
  {
    id: "826817417",
    name: "East Kowloon Cultural Centre (The Hall)",
    distance: 18.17,
    isFavourite: false,
  },
  {
    id: "87110023",
    name: "Kwai Tsing Theatre (Auditorium)",
    distance: 20.17,
    isFavourite: false,
  },
  {
    id: "87310051",
    name: "Yuen Long Theatre (Auditorium)",
    distance: 10.17,
    isFavourite: false,
  },
  {
    id: "87410030",
    name: "Ngau Chi Wan Civic Centre (Theatre)",
    distance: 20.17,
    isFavourite: false,
  },
  {
    id: "87510494",
    name: "Hong Kong City Hall (Exhibition Gallery)",
    distance: 30.17,
    isFavourite: false,
  },
  {
    id: "87616551",
    name: "Ko Shan Theatre (New Wing Auditorium)",
    distance: 40.17,
    isFavourite: false,
  },
];

export function LocationList() {
  return (
    <PageShell title="Location List">
      <div className="container mx-auto">
        <DataTable columns={columns} data={locationData} />
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
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "distance",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Distance (km)" />
    ),
  },
  {
    accessorKey: "isFavourite",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Favourite" />
    ),
    cell: ({ row }) => {
      const isFavourite = row.getValue("isFavourite")
      return (
        <Button
          variant={isFavourite ? "default" : "outline"}
          size="sm"
        >
          <Check />
        </Button>
      )
    },
  },
]

