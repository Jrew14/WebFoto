"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, ShoppingCart, ImageIcon, Bookmark, Loader2, ClipboardList, CreditCard, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getPhotosAction, searchPhotosAction, getEventsAction } from "@/actions/photo.actions";
import { toggleBookmarkAction, getUserBookmarkIdsAction, getUserOwnedPhotoIdsAction } from "@/actions/user.actions";
import { useAuth } from "@/hooks/useAuth";
import type { Photo as PhotoType } from "@/db/schema";

interface PhotoWithRelations {
  id: string;
  name: string;
  price: number;
  eventId: string;
  photographerId: string;
  previewUrl: string;
  fullUrl: string;
  watermarkUrl: string | null;
  sold: boolean;
  createdAt: Date;
  updatedAt: Date;
  event: {
    id: string;
    name: string;
    eventDate: string;
  } | null;
  photographer: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

interface EventWithPhotographer {
  id: string;
  name: string;
  description: string | null;
  eventDate: string;
  photographerId: string;
  createdAt: Date;
  updatedAt: Date;
  photographer: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface TripayChannel {
  code: string;
  name: string;
  type: string;
  group?: string;
}

const formatIndonesianDate = (value?: string | Date | null) => {
  if (!value) {
    return null;
  }

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatCurrency = (value: number) => {
  return `Rp ${value.toLocaleString("id-ID")}`;
};

export default function ShopPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const defaultPaymentMethod = process.env.NEXT_PUBLIC_TRIPAY_DEFAULT_METHOD ?? "";
  const [photos, setPhotos] = useState<PhotoWithRelations[]>([]);
  const [events, setEvents] = useState<EventWithPhotographer[]>([]);
  const [filterEvent, setFilterEvent] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [bookmarkIds, setBookmarkIds] = useState<Set<string>>(new Set());
  const [ownedPhotoIds, setOwnedPhotoIds] = useState<Set<string>>(new Set());
  const [addingToCartIds, setAddingToCartIds] = useState<Set<string>>(() => new Set());
  
  // Photo detail modal state
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithRelations | null>(null);
  const [photoDetailOpen, setPhotoDetailOpen] = useState(false);
  
  // Dialog states
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
  }>({
    open: false,
    title: "",
    description: "",
  });
  
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const [buyDialog, setBuyDialog] = useState(false);
  const [selectedPhotoForBuy, setSelectedPhotoForBuy] = useState<PhotoWithRelations | null>(null);
  const [paymentTypeDialog, setPaymentTypeDialog] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<"manual" | "automatic" | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentChannels, setPaymentChannels] = useState<TripayChannel[]>([]);
  const [selectedPaymentChannel, setSelectedPaymentChannel] = useState<string>("");
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [channelError, setChannelError] = useState<string | null>(null);
  const [channelWarning, setChannelWarning] = useState<string | null>(null);

  // Helper functions for dialogs
  const showAlert = (title: string, description: string) => {
    setAlertDialog({ open: true, title, description });
  };

  const showConfirm = (title: string, description: string, onConfirm: () => void) => {
    setConfirmDialog({ open: true, title, description, onConfirm });
  };

  const updateOwnedPhotoIds = (ids: string[]) => {
    setOwnedPhotoIds((previous) => {
      const next = new Set(ids);
      if (previous.size === next.size) {
        let identical = true;
        next.forEach((id) => {
          if (!previous.has(id)) {
            identical = false;
          }
        });
        if (identical) {
          return previous;
        }
      }
      return next;
    });
  };

  const addOwnedPhotoId = (photoId: string) => {
    setOwnedPhotoIds((previous) => {
      if (previous.has(photoId)) {
        return previous;
      }
      const next = new Set(previous);
      next.add(photoId);
      return next;
    });
  };

  const removeOwnedPhotoId = (photoId: string) => {
    setOwnedPhotoIds((previous) => {
      if (!previous.has(photoId)) {
        return previous;
      }
      const next = new Set(previous);
      next.delete(photoId);
      return next;
    });
  };

  const setCartLoading = (photoId: string, isLoading: boolean) => {
    setAddingToCartIds((previous) => {
      const next = new Set(previous);
      if (isLoading) {
        next.add(photoId);
      } else {
        next.delete(photoId);
      }
      return next;
    });
  };

  // Open photo detail modal
  const handlePhotoClick = (photo: PhotoWithRelations) => {
    setSelectedPhoto(photo);
    setPhotoDetailOpen(true);
  };

  // Handle buy button click
  const handleBuyClick = (photo: PhotoWithRelations) => {
    if (!isAuthenticated) {
      // Redirect to signin if not authenticated
      router.push('/auth/signin');
      return;
    }

    if (ownedPhotoIds.has(photo.id)) {
      showConfirm(
        "Foto Sudah Dimiliki",
        "Kamu sudah memiliki foto ini. Buka Log Pembelian untuk mengunduh ulang?",
        () => {
          router.push(`/user/purchases?photoId=${photo.id}`);
        }
      );
      return;
    }
    
    // Open payment type selection dialog
    setSelectedPhotoForBuy(photo);
    setPaymentTypeDialog(true);
  };

  const handleAddToCart = async (photo: PhotoWithRelations, options?: { redirectToCart?: boolean }) => {
    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }

    if (ownedPhotoIds.has(photo.id)) {
      showAlert(
        "Foto Sudah Dimiliki",
        "Foto ini sudah ada di koleksi pembelian kamu. Silakan buka Log Pembelian untuk mengunduh."
      );
      return;
    }

    if (photo.sold) {
      showAlert("Foto Tidak Tersedia", "Foto ini sudah terjual dan tidak dapat dimasukkan ke keranjang.");
      return;
    }

    setCartLoading(photo.id, true);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ photoId: photo.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add to cart");
      }

      if (data.alreadyExists) {
        showAlert("Sudah di Keranjang", "Foto ini sebelumnya sudah ada di keranjang kamu.");
      } else {
        showAlert("Berhasil Ditambahkan", "Foto berhasil ditambahkan ke keranjang.");
      }

      if (options?.redirectToCart) {
        router.push("/cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      const message = error instanceof Error ? error.message : "Failed to add to cart";
      showAlert("Gagal Menambahkan", message);
    } finally {
      setCartLoading(photo.id, false);
    }
  };

  // Handle payment type selection
  const handlePaymentTypeSelection = (type: "manual" | "automatic") => {
    setSelectedPaymentType(type);
    setPaymentTypeDialog(false);
    setBuyDialog(true);
  };

  // Handle proceed to payment
  const handleProceedToPayment = async () => {
    if (!selectedPhotoForBuy) return;

    // Validate automatic payment
    if (selectedPaymentType === "automatic") {
      if (!selectedPaymentChannel) {
        showAlert('Select Payment Method', 'Please choose a payment channel before continuing.');
        return;
      }

      if (channelError) {
        showAlert('Payment Unavailable', channelError);
        return;
      }
    }

    try {
      setProcessingPayment(true);

    if (selectedPaymentType === "manual") {
      addOwnedPhotoId(selectedPhotoForBuy.id);
      router.push(`/payment/manual-instructions?photoId=${selectedPhotoForBuy.id}`);
      return;
    }

      // Automatic payment with Tripay
      const response = await fetch('/api/purchases/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoId: selectedPhotoForBuy.id,
          paymentMethod: selectedPaymentChannel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create purchase');
      }

      if (data?.purchase?.photoId) {
        addOwnedPhotoId(data.purchase.photoId);
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl as string;
        return;
      }

      setProcessingPayment(false);

      if (data.payCode) {
        showAlert(
          'Payment Code Generated',
          `Use the payment code below to complete your payment:\n\n${data.payCode}`
        );
        return;
      }

      showAlert(
        'Payment Created',
        'Your payment request was created but no checkout URL was returned. Please contact support.'
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to process payment";

      setProcessingPayment(false);

      if (errorMessage.toLowerCase().includes('already purchased')) {
        setBuyDialog(false);
        const purchasedPhotoId = selectedPhotoForBuy?.id;
        showConfirm(
          'Foto Sudah Dibeli',
          'Kamu sudah membeli foto ini sebelumnya. Buka Log Pembelian untuk mengunduh ulang?',
          () => {
            const highlight = purchasedPhotoId ? `?photoId=${purchasedPhotoId}` : '';
            router.push(`/user/purchases${highlight}`);
          }
        );
        return;
      }

      console.warn('[Shop] Payment attempt failed:', errorMessage);
      showAlert('Payment Error', errorMessage);
    }
  };

  useEffect(() => {
    async function loadChannels() {
      try {
        setLoadingChannels(true);
        setChannelError(null);
        setChannelWarning(null);

        const response = await fetch("/api/payment/channels");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to load payment channels");
        }

        const channels: TripayChannel[] = Array.isArray(result.channels)
          ? result.channels
          : Array.isArray(result?.data)
            ? result.data
            : [];

        setPaymentChannels(channels);
        setChannelWarning(typeof result?.warning === "string" ? result.warning : null);

        setSelectedPaymentChannel((current) => {
          if (current && channels.some((channel) => channel.code === current)) {
            return current;
          }

          const defaultCode =
            channels.find((channel) => channel.code === defaultPaymentMethod)?.code ??
            channels[0]?.code ??
            "";

          return defaultCode;
        });
      } catch (error) {
        console.error("Failed to load payment channels:", error);
        let message = "Failed to load payment channels";
        
        if (error instanceof Error) {
          if (error.message.includes("credentials not configured")) {
            message = "Payment gateway not configured. Please contact administrator.";
          } else if (error.message.includes("Invalid API Key")) {
            message = "Payment gateway configuration error. Please contact administrator.";
          } else if (error.message.includes("Sandbox API but with Production credential")) {
            message = "Payment gateway mode mismatch. Please contact administrator.";
          } else {
            message = error.message;
          }
        }
        
        setChannelError(message);
      } finally {
        setLoadingChannels(false);
      }
    }

    loadChannels();
  }, [defaultPaymentMethod]);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setInitialLoading(true);
        
        // Load photos and events in parallel
        const [photosData, eventsData] = await Promise.all([
          getPhotosAction({ sold: false }),
          getEventsAction(),
        ]);

        let bookmarkList: string[] = [];
        let ownedIds: string[] = [];

        if (isAuthenticated && user?.id) {
          const [bookmarkIdList, ownedIdResponse] = await Promise.all([
            getUserBookmarkIdsAction(user.id),
            fetch("/api/purchases/user?ownedOnly=1&includePending=0")
              .then((res) => res.json())
              .catch(() => ({ photoIds: [] })),
          ]);

          bookmarkList = Array.isArray(bookmarkIdList) ? bookmarkIdList : [];
          ownedIds = Array.isArray(ownedIdResponse.photoIds)
            ? ownedIdResponse.photoIds
            : [];
        }

        setEvents(eventsData);
        setBookmarkIds(new Set(bookmarkList));
        updateOwnedPhotoIds(ownedIds);
        setPhotos(photosData);
      } catch (error) {
        console.error('Failed to load shop data:', error);
      } finally {
        setInitialLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated, user?.id]);

  const availablePhotos = useMemo(
    () => photos.filter((photo) => !ownedPhotoIds.has(photo.id)),
    [photos, ownedPhotoIds]
  );

  // Filter photos based on selected event and search query
  const filteredPhotos = availablePhotos.filter((photo) => {
    if (filterEvent !== "all" && photo.eventId !== filterEvent) return false;
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      return (
        photo.name.toLowerCase().includes(query) ||
        (photo.event?.name.toLowerCase().includes(query) || false) ||
        (photo.photographer?.fullName.toLowerCase().includes(query) || false)
      );
    }
    return true;
  });

  const filterEvents = [
    { id: "all", name: "All Events", count: availablePhotos.length },
    ...events.map((event) => ({
      id: event.id,
      name: event.name,
      count: availablePhotos.filter((p) => p.eventId === event.id).length,
    })),
  ];

  const handleToggleBookmark = async (photoId: string) => {
    if (!isAuthenticated || !user) {
      // Show confirmation and redirect to login if not authenticated
      showConfirm(
        'Sign In Required',
        'You need to sign in to bookmark photos. Would you like to sign in now?',
        () => {
          router.push(`/auth/signin?redirect=/shop`);
        }
      );
      return;
    }

    try {
      console.log('[Shop] Toggling bookmark for photo:', photoId);
      console.log('[Shop] Current user:', user.id);
      
      // Optimistic update
      const wasBookmarked = bookmarkIds.has(photoId);
      const newBookmarkIds = new Set(bookmarkIds);
      
      if (wasBookmarked) {
        newBookmarkIds.delete(photoId);
      } else {
        newBookmarkIds.add(photoId);
      }
      
      setBookmarkIds(newBookmarkIds);

      // Call service
      const result = await toggleBookmarkAction(user.id, photoId);
      console.log('[Shop] Bookmark toggle result:', result);
      
    } catch (error: any) {
      console.error('[Shop] Failed to toggle bookmark:', error);
      console.error('[Shop] Error details:', {
        message: error.message,
        stack: error.stack,
      });
      
      // Revert on error
      setBookmarkIds(new Set(bookmarkIds));
      
      // Show detailed error message
      const errorMessage = error.message || 'Unknown error';
      showAlert(
        'Bookmark Failed',
        `Failed to update bookmark: ${errorMessage}\n\nPlease try again or contact support if the problem persists.`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#48CAE4]/10 via-white to-[#00B4D8]/10">
        <div className="absolute inset-0 bg-grid-slate-100 -z-10" />
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4">
              Get Your Perfect
              <span className="block text-[#48CAE4] mt-1">Photo Moments</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8">
              Browse and purchase professional event photos
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by photo name, event, or photographer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 pl-12 pr-12 text-base rounded-xl border-2 border-slate-200 focus-visible:border-[#48CAE4]/100 focus-visible:ring-[#48CAE4]/100 shadow-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {channelWarning && (
        <div className="container mx-auto px-4 mt-4">
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <span>{channelWarning}</span>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <section className="bg-white border-b sticky top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Filter by Event:</span>
              {filterEvents.map((event) => (
                <Button
                  key={event.id}
                  variant={filterEvent === event.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterEvent(event.id)}
                  className={`whitespace-nowrap transition-all ${
                    filterEvent === event.id
                      ? "bg-[#48CAE4] hover:bg-[#3AAFCE] text-white shadow-md"
                      : "bg-white hover:bg-[#48CAE4]/10 text-slate-700 border-slate-300"
                  }`}
                >
                  {event.name}
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/20">
                    {event.count}
                  </span>
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 self-start md:self-auto">
              <Button
                asChild
                variant="outline"
                className="border-[#48CAE4] text-[#048abf] hover:bg-[#48CAE4]/10"
              >
                <Link href="/cart">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Keranjang Saya
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-[#48CAE4] text-[#048abf] hover:bg-[#48CAE4]/10"
              >
                <Link href="/user/purchases">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Log Pembelian Saya
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Photos Grid Section */}
      <section className="container mx-auto px-4 py-8">
        {/* Results Info */}
        <div className="mb-6">
          <p className="text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredPhotos.length}</span> of{" "}
            <span className="font-semibold text-slate-900">{availablePhotos.length}</span> photos
            {searchQuery && (
              <span className="ml-2 text-[#48CAE4]">
                for &quot;{searchQuery}&quot;
              </span>
            )}
          </p>
        </div>

        {initialLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="flex space-x-2 justify-center mb-4">
                <div className="w-3 h-3 bg-[#48CAE4] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-[#48CAE4] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-[#48CAE4] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-slate-600">Loading photos...</p>
            </div>
          </div>
        ) : (
          <>
            {filteredPhotos.length === 0 ? (
              <div className="text-center py-20">
                <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No photos found</h3>
                <p className="text-slate-500">
                  {searchQuery 
                    ? "Try adjusting your search or filters" 
                    : "No photos available for this event"}
                </p>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                {filteredPhotos.map((photo) => {
                  const isAddingToCart = addingToCartIds.has(photo.id);
                  const isSold = photo.sold;

                  return (
                    <div 
                      key={photo.id} 
                      className="break-inside-avoid mb-4 group cursor-pointer"
                      onClick={() => handlePhotoClick(photo)}
                    >
                      <div className="relative overflow-hidden rounded-lg bg-slate-100 shadow-md hover:shadow-xl transition-all duration-300">
                        <img
                          src={photo.previewUrl}
                          alt={photo.name}
                          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        
                        {/* Bookmark Button - Top Right */}
                        <div className="absolute top-3 right-3 z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleBookmark(photo.id);
                            }}
                            className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
                              bookmarkIds.has(photo.id)
                                ? "bg-[#48CAE4] text-white shadow-lg scale-110"
                                : "bg-white/80 text-slate-600 hover:bg-white hover:scale-110"
                            }`}
                          >
                            <Bookmark 
                              className={`w-5 h-5 ${bookmarkIds.has(photo.id) ? "fill-current" : ""}`}
                            />
                          </button>
                        </div>

                        {isSold && (
                          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
                            <span className="px-4 py-2 text-sm font-semibold uppercase tracking-wider text-white bg-red-500 rounded-full shadow">
                              Terjual
                            </span>
                          </div>
                        )}
                        
                        {/* Overlay with Photo Info */}
                        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/10 to-black/0 transition-opacity duration-300">
                          <div className="p-4 text-white space-y-3">
                            <div>
                              <p className="text-lg font-semibold drop-shadow-sm">
                                {formatCurrency(photo.price)}
                              </p>
                              {photo.event?.name && (
                                <p className="text-xs text-white/80">
                                  {photo.event.name}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                disabled={isSold || isAddingToCart}
                                className="bg-white/90 text-slate-900 hover:bg-white shadow"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(photo);
                                }}
                              >
                                {isAddingToCart ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Menyimpan...
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Keranjang
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                disabled={isSold}
                                className="bg-[#48CAE4] hover:bg-[#3AAFCE] text-white shadow-lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBuyClick(photo);
                                }}
                              >
                                <CreditCard className="w-4 h-4 mr-1" />
                                Beli Sekarang
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      {/* Alert Dialog */}
      <Dialog
        open={alertDialog.open}
        onOpenChange={(open) =>
          setAlertDialog((prev) => ({
            ...prev,
            open,
          }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{alertDialog.title}</DialogTitle>
            <DialogDescription className="whitespace-pre-line">
              {alertDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() =>
                setAlertDialog((prev) => ({
                  ...prev,
                  open: false,
                }))
              }
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({
            ...prev,
            open,
          }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription className="whitespace-pre-line">
              {confirmDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog((prev) => ({
                  ...prev,
                  open: false,
                }))
              }
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                confirmDialog.onConfirm();
                setConfirmDialog((prev) => ({
                  ...prev,
                  open: false,
                }));
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Type Selection Dialog */}
      <Dialog open={paymentTypeDialog} onOpenChange={setPaymentTypeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Payment Method</DialogTitle>
            <DialogDescription>
              Select how you would like to pay for this photo
            </DialogDescription>
          </DialogHeader>

          {selectedPhotoForBuy && (
            <div className="space-y-4">
              {/* Photo Preview */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                <img
                  src={selectedPhotoForBuy.previewUrl}
                  alt={selectedPhotoForBuy.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Price */}
              <div className="flex justify-between items-center py-3 px-4 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Total Price</span>
                <span className="text-lg font-bold text-[#48CAE4]">
                  {formatCurrency(selectedPhotoForBuy.price)}
                </span>
              </div>

              {/* Payment Type Options */}
              <div className="space-y-3">
                <button
                  onClick={() => handlePaymentTypeSelection("automatic")}
                  className="w-full p-4 border-2 border-slate-200 hover:border-[#48CAE4] rounded-lg transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-[#48CAE4]/10 group-hover:bg-[#48CAE4]/20 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-[#48CAE4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="text-left flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">Automatic Payment</h4>
                      <p className="text-sm text-slate-600">
                        Fast checkout with Tripay - Bank Transfer, E-Wallet, QRIS
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handlePaymentTypeSelection("manual")}
                  className="w-full p-4 border-2 border-slate-200 hover:border-[#48CAE4] rounded-lg transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-[#48CAE4]/10 group-hover:bg-[#48CAE4]/20 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-[#48CAE4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="text-left flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">Manual Transfer</h4>
                      <p className="text-sm text-slate-600">
                        Pay via manual bank transfer with custom instructions
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentTypeDialog(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Buy Dialog */}
      <Dialog open={buyDialog} onOpenChange={setBuyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase Photo</DialogTitle>
            <DialogDescription>
              Complete your purchase to get the full resolution photo
            </DialogDescription>
          </DialogHeader>
          
          {selectedPhotoForBuy && (
            <div className="space-y-4">
              {/* Photo Preview */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                <img
                  src={selectedPhotoForBuy.previewUrl}
                  alt={selectedPhotoForBuy.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Photo Details */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Photo Name</span>
                  <span className="text-sm font-medium">{selectedPhotoForBuy.name}</span>
                </div>
                
                {selectedPhotoForBuy.event && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Event</span>
                    <span className="text-sm font-medium">{selectedPhotoForBuy.event.name}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-base font-semibold text-slate-900">Total Price</span>
                <span className="text-xl font-bold text-[#48CAE4]">
                  {formatCurrency(selectedPhotoForBuy.price)}
                </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-channel" className="text-sm font-medium text-slate-700">
                  Payment Channel
                </Label>

                {selectedPaymentType === "automatic" ? (
                  <>
                    {loadingChannels ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading payment options...
                      </div>
                    ) : paymentChannels.length > 0 ? (
                      <Select
                        value={selectedPaymentChannel}
                        onValueChange={setSelectedPaymentChannel}
                        disabled={processingPayment}
                      >
                        <SelectTrigger id="payment-channel">
                          <SelectValue placeholder="Select a payment channel" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentChannels.map((channel) => (
                            <SelectItem key={channel.code} value={channel.code}>
                              {channel.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="text-sm">
                            <p className="font-medium text-blue-900 mb-1">Automatic Payment Temporarily Unavailable</p>
                            <p className="text-blue-700 mb-2">
                              Our payment gateway is currently being set up. Don't worry, you can still complete your purchase!
                            </p>
                            <p className="text-blue-700">
                              Pilih "Manual Transfer" di bawah untuk melanjutkan pembayaran melalui transfer bank.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {channelError && (
                      <p className="text-sm text-red-500">
                        {channelError}
                      </p>
                    )}

                    {channelWarning && !channelError && (
                      <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{channelWarning}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm">
                        <p className="font-medium text-amber-900 mb-1">Manual Transfer Selected</p>
                        <p className="text-amber-700">
                          You will receive payment instructions after confirming your order. Please complete the transfer within 24 hours.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setBuyDialog(false)}
              disabled={processingPayment}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#48CAE4] hover:bg-[#3AAFCE]"
              onClick={handleProceedToPayment}
              disabled={
                processingPayment || 
                (selectedPaymentType === "automatic" && (loadingChannels || !selectedPaymentChannel || !!channelError))
              }
            >
              {processingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Detail Modal */}
      <Dialog open={photoDetailOpen} onOpenChange={setPhotoDetailOpen}>
        <DialogContent className="max-w-5xl overflow-hidden rounded-3xl border-0 p-0 shadow-2xl">
          {selectedPhoto &&
            (() => {
              const formattedEventDate = formatIndonesianDate(selectedPhoto.event?.eventDate ?? null);
              const previewSource =
                selectedPhoto.watermarkUrl ??
                selectedPhoto.previewUrl ??
                selectedPhoto.fullUrl;

              return (
                <div className="grid grid-cols-1 bg-white lg:grid-cols-[3fr,2fr]">
                  <div className="relative bg-slate-900">
                    <img
                      src={previewSource}
                      alt={selectedPhoto.name}
                      className="h-full w-full object-contain"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  </div>

                  <div className="flex flex-col justify-between gap-6 p-6">
                    <div className="space-y-4">
                      <DialogTitle className="text-2xl font-semibold text-slate-900">
                        {selectedPhoto.name}
                      </DialogTitle>
                      {selectedPhoto.event?.name && (
                        <p className="text-sm text-slate-500">
                          {selectedPhoto.event.name}
                          {formattedEventDate ? ` - ${formattedEventDate}` : ""}
                        </p>
                      )}
                      {selectedPhoto.photographer?.fullName && (
                        <p className="text-sm text-slate-500">
                          Fotografer:{" "}
                          <span className="font-medium text-slate-900">
                            {selectedPhoto.photographer.fullName}
                          </span>
                        </p>
                      )}

                      <div className="rounded-2xl bg-slate-100 p-4">
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <span>Harga Foto</span>
                          <span className="font-semibold text-slate-900">
                            {formatCurrency(selectedPhoto.price)}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                          <span>Status</span>
                          <span
                            className={`font-semibold ${
                              selectedPhoto.sold ? "text-red-500" : "text-emerald-600"
                            }`}
                          >
                            {selectedPhoto.sold ? "Sudah Terjual" : "Tersedia"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          variant="secondary"
                          disabled={
                            selectedPhoto.sold || addingToCartIds.has(selectedPhoto.id)
                          }
                          className="flex-1 bg-slate-900/5 text-slate-900 hover:bg-slate-900/10"
                          onClick={() => handleAddToCart(selectedPhoto)}
                        >
                          {addingToCartIds.has(selectedPhoto.id) ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Menambahkan...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Tambah ke Keranjang
                            </>
                          )}
                        </Button>
                        <Button
                          className="flex-1 bg-[#48CAE4] hover:bg-[#3AAFCE]"
                          disabled={selectedPhoto.sold}
                          onClick={() => {
                            setPhotoDetailOpen(false);
                            handleBuyClick(selectedPhoto);
                          }}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Beli Sekarang
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (previewSource) {
                            window.open(previewSource, "_blank", "noopener,noreferrer");
                          }
                        }}
                      >
                        Lihat Preview Lebih Besar
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}



