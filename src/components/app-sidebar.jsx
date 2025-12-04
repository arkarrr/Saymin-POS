"use client"

import * as React from "react"
import {
  IconInnerShadowTop,
} from "@tabler/icons-react"
import Link from "next/link"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  primaryNavItems,
  secondaryNavItems,
} from "@/config/navigation"

const data = {
  user: {
    name: "John Doe",
    email: "john@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
}

export function AppSidebar({
  ...props
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <Link href="/dashboard">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">POS Console</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={primaryNavItems} />
        <NavSecondary items={secondaryNavItems} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
