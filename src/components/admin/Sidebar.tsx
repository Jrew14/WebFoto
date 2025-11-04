"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  Images,
  User,
  LogOut,
  FolderOpen,
  Camera,
  ChevronUp,
  CreditCard,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Event",
    href: "/admin/event",
    icon: FolderOpen,
  },
  {
    title: "Unggah Foto",
    href: "/admin/upload",
    icon: Upload,
  },
  {
    title: "Gallery Foto",
    href: "/admin/gallery",
    icon: Images,
  },
  {
    title: "Payment Methods",
    href: "/admin/payment-methods",
    icon: CreditCard,
  },
  {
    title: "Profile Admin",
    href: "/admin/profile",
    icon: User,
  },
];

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AppSidebarProps {
  user: SupabaseUser;
  profile: Profile;
}

export function AppSidebar({ user, profile }: AppSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        // Redirect ke admin login setelah logout berhasil
        window.location.href = "/admin/login";
      } else {
        console.error("Logout failed");
        alert("Gagal logout, silakan coba lagi");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Terjadi kesalahan saat logout");
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Camera className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Soraroid</span>
                  <span className="truncate text-xs">Dashboard Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const disabled = (item as any).disabled;
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild={!disabled}
                      isActive={isActive}
                      tooltip={item.title}
                      disabled={disabled}
                    >
                      {disabled ? (
                        <div className="flex items-center gap-2">
                          <Icon />
                          <span>{item.title}</span>
                          <span className="ml-auto text-xs bg-sidebar-accent text-sidebar-accent-foreground px-2 py-0.5 rounded">
                            Soon
                          </span>
                        </div>
                      ) : (
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  {profile.avatar_url ? (
                    <Avatar className="size-8 rounded-lg">
                      <AvatarImage src={profile.avatar_url} alt={profile.full_name || "Admin"} />
                      <AvatarFallback className="rounded-lg">
                        {(profile.full_name || "Admin").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <User className="size-4" />
                    </div>
                  )}
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {profile.full_name || "Admin"}
                    </span>
                    <span className="truncate text-xs">{profile.email}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
