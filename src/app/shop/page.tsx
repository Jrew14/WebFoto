"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ShoppingCart, ImageIcon, Bookmark, Loader2 } from "lucide-react";
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
import { getPhotosAction, searchPhotosAction, getEventsAction, toggleBookmarkAction, getUserBookmarkIdsAction } from "@/actions";
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

export default function ShopPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const defaultPaymentMethod = process.env.NEXT_PUBLIC_TRIPAY_DEFAULT_METHOD ?? "";
  const [photos, setPhotos] = useState<PhotoWithRelations[]>([]);
  const [events, setEvents] = useState<EventWithPhotographer[]>([]);
  const [filterEvent, setFilterEvent] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [displayedPhotos, setDisplayedPhotos] = useState<PhotoWithRelations[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [bookmarkIds, setBookmarkIds] = useState<Set<string>>(new Set());
  
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
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentChannels, setPaymentChannels] = useState<TripayChannel[]>([]);
  const [selectedPaymentChannel, setSelectedPaymentChannel] = useState<string>("");
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [channelError, setChannelError] = useState<string | null>(null);

  // Helper functions for dialogs
  const showAlert = (title: string, description: string) => {
    setAlertDialog({ open: true, title, description });
  };

  const showConfirm = (title: string, description: string, onConfirm: () => void) => {
    setConfirmDialog({ open: true, title, description, onConfirm });
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
    
    // Open buy dialog for authenticated users
    setSelectedPhotoForBuy(photo);
    setBuyDialog(true);
  };

  // Handle proceed to payment
  const handleProceedToPayment = async () => {
    if (!selectedPhotoForBuy) return;

    if (!selectedPaymentChannel) {
      showAlert('Select Payment Method', 'Please choose a payment channel before continuing.');
      return;
    }

    if (channelError) {
      showAlert('Payment Unavailable', channelError);
      return;
    }

    try {
      setProcessingPayment(true);

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
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process payment';
      showAlert('Payment Error', errorMessage);
      setProcessingPayment(false);
    }
  };

  useEffect(() => {
    async function loadChannels() {
      try {
        setLoadingChannels(true);
        setChannelError(null);

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

        if (channels.length) {
          const defaultCode = channels.find((channel) => channel.code === defaultPaymentMethod)?.code
            ?? channels[0].code;

          setSelectedPaymentChannel((current) => current || defaultCode);
        }
      } catch (error) {
        console.error("Failed to load payment channels:", error);
        const message = error instanceof Error ? error.message : "Failed to load payment channels";
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

        setPhotos(photosData);
        setEvents(eventsData);

        // Load bookmark IDs if user is authenticated
        if (isAuthenticated && user) {
          const ids = await getUserBookmarkIdsAction(user.id);
          setBookmarkIds(new Set(ids));
        }
      } catch (error) {
        console.error('Failed to load shop data:', error);
      } finally {
        setInitialLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated, user]);

  // Filter photos based on selected event and search query
  const filteredPhotos = photos.filter((photo) => {
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

  // Load initial photos
  useEffect(() => {
    // Always show all filtered photos
    setDisplayedPhotos(filteredPhotos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEvent, searchQuery, photos]);

  const filterEvents = [
    { id: "all", name: "All Events", count: photos.length },
    ...events.map(event => ({
      id: event.id,
      name: event.name,
      count: photos.filter(p => p.eventId === event.id).length,
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

      {/* Filter Section */}
      <section className="bg-white border-b sticky top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
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
        </div>
      </section>

      {/* Photos Grid Section */}
      <section className="container mx-auto px-4 py-8">
        {/* Results Info */}
        <div className="mb-6">
          <p className="text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredPhotos.length}</span> of{" "}
            <span className="font-semibold text-slate-900">{filteredPhotos.length}</span> photos
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
                {displayedPhotos.map((photo) => (
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
                      <div className="absolute top-3 right-3 z-10">
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
                      
                      {/* Overlay with Photo Info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold">
                              Rp {photo.price.toLocaleString('id-ID')}
                            </p>
                            <Button
                              size="sm"
                              className="bg-[#48CAE4] hover:bg-[#3AAFCE] text-white shadow-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBuyClick(photo);
                              }}
                            >
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              Buy
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Alert Dialog */}
      <Dialog open={alertDialog.open} onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{alertDialog.title}</DialogTitle>
            <DialogDescription className="whitespace-pre-line">
              {alertDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setAlertDialog({ ...alertDialog, open: false })}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
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
              onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                confirmDialog.onConfirm();
                setConfirmDialog({ ...confirmDialog, open: false });
              }}
            >
              Confirm
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
                    Rp {selectedPhotoForBuy.price.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-channel" className="text-sm font-medium text-slate-700">
                  Payment Channel
                </Label>

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
                  <p className="text-sm text-red-500">
                    No payment channels available. Please try again later.
                  </p>
                )}

                {channelError && (
                  <p className="text-sm text-red-500">
                    {channelError}
                  </p>
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
              disabled={processingPayment || loadingChannels || !selectedPaymentChannel || !!channelError}
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
        <DialogContent className="max-w-6xl p-0 bg-transparent border-0">
          {selectedPhoto && (
            <>
              <DialogTitle className="sr-only">
                {selectedPhoto.name}
              </DialogTitle>
              <div className="relative">
                <img
                  src={selectedPhoto.previewUrl}
                  alt={selectedPhoto.name}
                  className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
