"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Heart, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CartSheet } from "@/components/public/cart-sheet";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Photo {
  id: string;
  name: string;
  previewUrl: string;
  price: number;
  sold: boolean;
  eventId: string;
  event: {
    name: string;
    eventDate: string;
  };
  photographer: {
    fullName: string;
  };
}

export default function BrowsePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [inCartPhotoIds, setInCartPhotoIds] = useState<Set<string>>(new Set());
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [events, setEvents] = useState<Array<{ id: string; name: string }>>([]);

  // Load photos
  useEffect(() => {
    loadPhotos();
    loadEvents();
    if (isAuthenticated) {
      loadCartInfo();
    }
  }, [isAuthenticated]);

  const loadPhotos = async () => {
    try {
      const response = await fetch("/api/photos");
      if (!response.ok) throw new Error("Failed to load photos");
      
      const data = await response.json();
      setPhotos(data.photos || []);
    } catch (error) {
      console.error("Error loading photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Failed to load events");
      
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  const loadCartInfo = async () => {
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) return;
      
      const cart = await response.json();
      setCartCount(cart.totalItems || 0);
      
      const photoIds = new Set(cart.items.map((item: any) => item.photoId));
      setInCartPhotoIds(photoIds);
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  };

  const addToCart = async (photoId: string) => {
    if (!isAuthenticated) {
      alert("Please sign in to add photos to cart");
      router.push("/auth/signin");
      return;
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to add to cart");
        return;
      }

      // Update cart state
      setCartCount(data.cartCount);
      setInCartPhotoIds(prev => new Set([...prev, photoId]));
      
      alert("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart");
    }
  };

  const buyNow = (photoId: string) => {
    if (!isAuthenticated) {
      alert("Please sign in to purchase photos");
      router.push("/auth/signin");
      return;
    }
    
    router.push(`/shop?photoId=${photoId}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Filter photos
  const filteredPhotos = photos.filter((photo) => {
    const matchesSearch = 
      photo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.photographer.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEvent = 
      selectedEvent === "all" || photo.eventId === selectedEvent;
    
    return matchesSearch && matchesEvent && !photo.sold;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading photos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#48CAE4]/10 via-white to-[#00B4D8]/10">
        <div className="absolute inset-0 bg-grid-slate-100 -z-10" />
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-end mb-4">
              {isAuthenticated && <CartSheet onCheckout={() => router.push("/shop?fromCart=true")} />}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4">
              Browse
              <span className="block text-[#48CAE4] mt-1">Photos</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600">
              Discover and purchase high-quality event photos
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search photos, events, photographers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Photos Grid */}
      <section className="container mx-auto px-4 py-8">
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No photos found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPhotos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-square">
                  <Image
                    src={photo.previewUrl}
                    alt={photo.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-[#48CAE4] text-white">
                      {formatCurrency(photo.price)}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-1 mb-1">
                    {photo.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-1 mb-1">
                    {photo.event.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by {photo.photographer.fullName}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => addToCart(photo.id)}
                    disabled={inCartPhotoIds.has(photo.id)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {inCartPhotoIds.has(photo.id) ? "In Cart" : "Add to Cart"}
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-[#48CAE4] hover:bg-[#00B4D8]"
                    onClick={() => buyNow(photo.id)}
                  >
                    Buy Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
