import { UserIcon, LogOutIcon } from 'lucide-react'
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ModeToggle } from "@/components/mode-toggle"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

export function TopNav() {
  const location = useLocation()

  const navigationItems = [
    { to: "/", label: "Home" },
    { to: "/locationList", label: "Location List" },
    { to: "/eventList", label: "Event List" },
    { to: "/map", label: "Map" },
    { to: "/favouriteList", label: "Favourite List" },
    { to: "/suggestions", label: "No idea?" },
  ]

  function NavigationItem(props) {
    const isActive = location.pathname === props.to

    return (
      <NavigationMenuItem>
        <NavigationMenuLink
          asChild
          className={
            navigationMenuTriggerStyle() +
            " hover:text-primary active:text-primary" +
            (isActive
              ? " text-primary"
              : "")
          }
        >
          <Link to={props.to}>{props.label}</Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
    )
  }

  return (
    <nav className="w-full">
      <div className="flex items-center w-full px-6 py-3">
        {/* Logo */}
        <Link 
          to="/"
          className="mr-6 text-primary hover:text-primary/90 transition-colors cursor-pointer"
        >
          <span className="hidden font-bold text-xl sm:inline-block">Project</span>
        </Link>

        {/* nav items */}
        <NavigationMenu>
          <NavigationMenuList>
            {navigationItems.map((link) => (
              <NavigationItem key={link.to} to={link.to} label={link.label}/>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        
        <div className="ml-auto flex items-center gap-3">
            {/* dark mode button */}
            <ModeToggle />

            {/* User Menu */}
            <DropdownMenuUserMenu username="csci2720" email="csci2720@gmail.com" role="Admin" />
        </div>
      </div>

      {/* bottom separator */}
      <div className="h-px w-full bg-border" />
    </nav>
  )
}

const listItems = [
  {
    icon: UserIcon,
    property: 'Profile'
  },
  {
    icon: LogOutIcon,
    property: 'Sign Out'
  }
]

function DropdownMenuUserMenu(props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size='icon' className='overflow-hidden rounded-full'>
          { props.username.charAt(0).toUpperCase() }
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' alignOffset={-15}>
        <DropdownMenuItem className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
            {props.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">
              {props.username}
            </span>
            <span className="text-xs text-muted-foreground leading-tight">
              {props.email}
            </span>
            {props.role && (
              <span className="text-xs uppercase text-muted-foreground leading-tight">
                {props.role}
              </span>
            )}
          </div>
        </DropdownMenuItem>
        <DropdownMenuGroup>
          {listItems.map((item, index) => (
            <DropdownMenuItem key={index}>
              <item.icon />
              <span>{item.property}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}