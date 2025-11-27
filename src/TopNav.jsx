import { Link } from "react-router-dom"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/Button"
import { ModeToggle } from "@/components/mode-toggle"

export function TopNav() {
  const navigationItems = [
    { to: "/", label: "Home" },
    { to: "/locationList", label: "Location List" },
    { to: "/eventList", label: "Event List" },
    { to: "/map", label: "Map" },
    { to: "/favouriteList", label: "Favourite List" },
    { to: "/suggestions", label: "No idea?" },
  ]

  function NavigationItem(props) {
    return (
      <NavigationMenuItem>
        <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
          <Link to={props.to}>{props.label}</Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
    )
  }

  return (
    <nav className="w-full">
      <div className="flex items-center w-full px-6 py-3">
        <Link 
          to="/"
          className="mr-6 text-primary hover:text-primary/90 transition-colors cursor-pointer"
        >
          <span className="hidden font-bold text-xl sm:inline-block">Project</span>
        </Link>

        <NavigationMenu>
          <NavigationMenuList>
            {navigationItems.map((link) => (
              <NavigationItem key={link.to} to={link.to} label={link.label}/>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center gap-3">
            <ModeToggle />

            <Button
              size="sm"
              className="text-sm font-medium px-4 h-9 rounded-md shadow-sm cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                if (onCtaClick) onCtaClick();
              }}
            >
              Sign In
            </Button>
        </div>
      </div>
    </nav>
  )
}