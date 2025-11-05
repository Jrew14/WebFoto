"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  Images,
  LogOut,
  Menu,
  Phone,
  ShoppingCart,
  UserCircle,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function UserNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const whatsappLink = "https://wa.me/6285287229898";

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/auth/signin";
  };

  const navItems = [
    {
      name: "Get Your Photo",
      href: "/shop",
      icon: Camera,
      match: (path: string) => path === "/shop" || path.startsWith("/shop/"),
    },
    {
      name: "Gallery",
      href: "/gallery",
      icon: Images,
      match: (path: string) => path === "/gallery" || path.startsWith("/gallery/"),
    },
    {
      name: "Cart",
      href: "/cart",
      icon: ShoppingCart,
      match: (path: string) => path === "/cart" || path.startsWith("/cart/"),
    },
    {
      name: "Profile",
      href: "/user/profile",
      icon: UserCircle,
      match: (path: string) => path.startsWith("/user/profile"),
    },
  ] as const;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/shop" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Soraroid
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = item.match ? item.match(pathname) : pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`transition-colors ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
            <Link href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                className="ml-3 border-[#48CAE4] text-[#048abf] hover:bg-[#48CAE4]/10"
              >
                Hubungi WhatsApp
              </Button>
            </Link>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user.fullName?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user.fullName}
                </span>
              </div>
            )}
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = item.match ? item.match(pathname) : pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                </Link>
              );
            })}
            
            {user && (
              <div className="pt-3 mt-3 border-t">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.fullName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.fullName}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
            <Link
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="block"
            >
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-cyan-200 text-[#048abf]">
                <Phone className="w-5 h-5" />
                <span className="font-medium">Hubungi WhatsApp</span>
              </div>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
