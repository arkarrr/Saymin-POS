import {
  IconBuildingStore,
  IconDoorEnter,
  IconHome,
  IconLayoutDashboard,
  IconPackage,
  IconPackages,
  IconTrademark,
  IconUsersGroup,
} from "@tabler/icons-react";

export const primaryNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconLayoutDashboard,
  },
  {
    title: "Variants",
    url: "/variants",
    icon: IconPackages,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: IconUsersGroup,
  },
  {
    title: "Products",
    url: "/products",
    icon: IconPackage,
  },
  {
    title: "Brands",
    url: "/brands",
    icon: IconTrademark,
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
