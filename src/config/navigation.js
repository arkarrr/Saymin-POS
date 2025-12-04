import {
  IconBuildingStore,
  IconDoorEnter,
  IconHome,
  IconLayoutDashboard,
  IconUsersGroup,
} from "@tabler/icons-react";

export const primaryNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconLayoutDashboard,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: IconUsersGroup,
  },
  {
    title: "Outlets",
    url: "/outlets",
    icon: IconBuildingStore,
  },
];

export const secondaryNavItems = [
  {
    title: "Home",
    url: "/",
    icon: IconHome,
  },
  {
    title: "Login",
    url: "/login",
    icon: IconDoorEnter,
  },
];
