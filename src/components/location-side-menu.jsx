/**
 * Reusable side menu component for filtering location lists
 */

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

import { newTerritoriesDistricts, kowloonDistricts, hkIslandDistricts } from "@/constants/districts"


export function LocationSideMenu({
    getFilterName,
    setFilterName,
    getFilterDistrict,
    setFilterDistrict,
    maxDist,
    getDistRange,
    setDistRange,
    extraComponents,
}) {
  const distRange = getDistRange();
  return (
    <Card className="bg-transparent shadow-none gap-2">
      <CardHeader>
        <CardTitle>
          <span>Options</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Input
          placeholder="Search by name"
          value={getFilterName()}
          onChange={(event) =>
            setFilterName(event.target.value)
          }
        />
        <Select
          value={getFilterDistrict()}
          onValueChange={(value) =>
            setFilterDistrict(value == "all" ? "" : (value || ""))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a district" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All districts</SelectItem>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Hong Kong Island</SelectLabel>
                {hkIslandDistricts.map((district) => (
                  <SelectItem key={district} value={district}>{district}</SelectItem>
                ))}
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Kowloon</SelectLabel>
                {kowloonDistricts.map((district) => (
                  <SelectItem key={district} value={district}>{district}</SelectItem>
                ))}
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>New Territories</SelectLabel>
                {newTerritoriesDistricts.map((district) => (
                  <SelectItem key={district} value={district}>{district}</SelectItem>
                ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex flex-col text-muted-foreground dark:bg-input/30 border-input w-full rounded-md border bg-transparent md:h-14 px-3 py-1 pb-3 gap-y-2 text-base shadow-xs md:text-sm">
          <p>Distance Range ({distRange[0]} km - {distRange[1]} km)</p>
          <Slider
            value={distRange}
            onValueChange={newValue => setDistRange(newValue)}
            max={maxDist}
            step={0.01}
          />
        </div>
        {extraComponents && extraComponents()}
      </CardContent>
    </Card>
  )
}