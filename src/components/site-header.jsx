'use client'
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { primaryNavItems, secondaryNavItems } from "@/config/navigation"

export function SiteHeader() {
  const pathname = usePathname();
  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  function formatFromPath(path) {
    if (!path || path === "/") return "Home";
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 0) return "Home";
    const last = segments[segments.length - 1];
    return last
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const matchedNav =
    allNavItems.find((item) => item.url === pathname) ||
    allNavItems.find(
      (item) => item.url !== "/" && pathname.startsWith(`${item.url}/`)
    );

  const TitleIcon = matchedNav?.icon;
  const title = matchedNav?.title || formatFromPath(pathname);

  return (
    <header
      className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <div className="flex items-center gap-2">
          {TitleIcon && <TitleIcon className="size-4 text-muted-foreground" />}
          <h1 className="text-base font-medium sm:text-lg">{title}</h1>
        </div>
        <div className="ml-auto flex items-center gap-2" />
      </div>
    </header>
  );
}
