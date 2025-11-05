"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, User, LogOut, ShoppingCart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90 shadow-sm" suppressHydrationWarning>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8" suppressHydrationWarning>
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-3 font-bold text-xl group">
          <Image
            src="/Logo_Soraroid.png"
            alt="Soraroid Logo"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
          <span className="bg-gradient-to-r from-[#48CAE4] to-[#00B4D8] bg-clip-text text-transparent font-bold">
            Soraroid
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            href="/shop" 
            className="text-sm font-medium text-slate-700 hover:text-[#48CAE4] transition-colors relative group"
          >
            Get Your Photo
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#48CAE4] group-hover:w-full transition-all duration-300" />
          </Link>
          <Link 
            href="/gallery" 
            className="text-sm font-medium text-slate-700 hover:text-[#48CAE4] transition-colors relative group"
          >
            Gallery
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#48CAE4] group-hover:w-full transition-all duration-300" />
          </Link>
          <Link 
            href="/cart" 
            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-[#48CAE4] transition-colors relative group"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Cart</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#48CAE4] group-hover:w-full transition-all duration-300" />
          </Link>
        </nav>

        {/* Auth Buttons / User Profile - Desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            className="border-[#48CAE4] text-[#048abf] hover:bg-[#48CAE4]/10 flex items-center gap-2"
          >
            <a
              href="https://wa.me/6285287229898"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </Button>
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 text-slate-700 hover:text-[#48CAE4] hover:bg-[#48CAE4]/10"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#48CAE4] to-[#00B4D8] flex items-center justify-center text-white font-semibold text-sm">
                    {user.fullName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{user.fullName || user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/user/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button 
                variant="ghost" 
                asChild
                className="text-slate-700 hover:text-[#48CAE4] hover:bg-[#48CAE4]/10"
              >
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button 
                asChild
                className="bg-gradient-to-r from-[#48CAE4] to-[#00B4D8] hover:from-[#3AAFCE] hover:to-[#0096C7] text-white shadow-md hover:shadow-lg transition-all"
              >
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        {isMounted && (
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            suppressHydrationWarning
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-slate-700" />
            ) : (
              <Menu className="w-6 h-6 text-slate-700" />
            )}
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {isMounted && isMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <Link 
              href="/shop" 
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-[#48CAE4] hover:bg-[#48CAE4]/10 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Get Your Photo
            </Link>
            <Link 
              href="/gallery" 
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-[#48CAE4] hover:bg-[#48CAE4]/10 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Gallery
            </Link>
            <Link 
              href="/cart" 
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-[#48CAE4] hover:bg-[#48CAE4]/10 rounded-lg transition-colors flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingCart className="w-4 h-4" />
              Cart
            </Link>
            <Button
              asChild
              variant="outline"
              className="flex items-center gap-2 justify-center text-[#048abf] border-[#48CAE4]"
            >
              <a
                href="https://wa.me/6285287229898"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Admin
              </a>
            </Button>
            
            <div className="pt-3 border-t flex flex-col gap-2">
              {isAuthenticated && user ? (
                <>
                  {/* User Info */}
                  <div className="px-4 py-2 bg-[#48CAE4]/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#48CAE4] to-[#00B4D8] flex items-center justify-center text-white font-semibold">
                        {user.fullName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{user.fullName || 'User'}</p>
                        <p className="text-xs text-slate-600 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* User Menu Items */}
                  <Link 
                    href="/user/profile"
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-[#48CAE4] hover:bg-[#48CAE4]/10 rounded-lg transition-colors flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    asChild
                    className="w-full"
                  >
                    <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                  </Button>
                  <Button 
                    asChild
                    className="w-full bg-gradient-to-r from-[#48CAE4] to-[#00B4D8] hover:from-[#3AAFCE] hover:to-[#0096C7]"
                  >
                    <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

