// src/TopNav.jsx
import { UserIcon, LogOutIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useAuth, isAdmin } from "@/lib/AuthContext";

export function TopNav() {
  const location = useLocation();
  const { user, logout } = useAuth();

  // base links
  const navigationItems = [
    { to: "/", label: "Home" },
    { to: "/locationList", label: "Location List" },
    { to: "/eventList", label: "Event List" },
    { to: "/map", label: "Map" },
    { to: "/favouriteList", label: "Favourite List" },
    { to: "/suggestions", label: "No idea?" },
  ];

  // admin-only link(s)
  if (isAdmin(user)) {
    navigationItems.push({ to: "/users", label: "Users" });
  }

  function NavigationItem({ to, label }) {
    const active = location.pathname === to;
    return (
      <NavigationMenuItem>
        <NavigationMenuLink
          asChild
          className={
            navigationMenuTriggerStyle() +
            " hover:text-primary active:text-primary" +
            (active ? " text-primary" : "")
          }
        >
          <Link to={to}>{label}</Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
    );
  }

  const username = user?.name ?? "guest";
  const email = user?.email ?? "";
  const roleLabel = user?.role ? user.role.toUpperCase() : "";

  return (
    <nav className="w-full">
      <div className="flex items-center w-full px-6 py-3">
        {/* Logo */}
        <Link
          to="/"
          className="mr-6 text-primary hover:text-primary/90 transition-colors cursor-pointer"
        >
          <span className="hidden font-bold text-xl sm:inline-block">Cultural HK</span>
        </Link>

        {/* nav items */}
        <NavigationMenu>
          <NavigationMenuList>
            {navigationItems.map((link) => (
              <NavigationItem key={link.to} {...link} />
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center gap-3">
          {/* dark mode */}
          <ModeToggle />

          {/* user menu */}
          <DropdownMenuUserMenu
            username={username}
            email={email}
            role={roleLabel}
            onSignOut={logout}
          />
        </div>
      </div>

      {/* bottom separator */}
      <div className="h-px w-full bg-border" />
    </nav>
  );
}

const listItems = [
  { icon: UserIcon, label: "Profile", key: "profile" },
  { icon: LogOutIcon, label: "Sign Out", key: "signout" },
];

function DropdownMenuUserMenu({ username, email, role, onSignOut }) {
  const initial = (username?.[0] ?? "?").toUpperCase();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" className="overflow-hidden rounded-full">
          {initial}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" alignOffset={-15}>
        <DropdownMenuItem className="flex items-center gap-3" disabled>
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
            {initial}
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">{username}</span>
            {email ? (
              <span className="text-xs text-muted-foreground leading-tight">
                {email}
              </span>
            ) : null}
            {role ? (
              <span className="text-xs uppercase text-muted-foreground leading-tight">
                {role}
              </span>
            ) : null}
          </div>
        </DropdownMenuItem>

        <DropdownMenuGroup>
          {listItems.map((item) =>
            item.key === "signout" ? (
              <DropdownMenuItem key={item.key} onClick={onSignOut}>
                <item.icon />
                <span>{item.label}</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem key={item.key}>
                <item.icon />
                <span>{item.label}</span>
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
