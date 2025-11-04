"use client";

import { useState, useEffect } from "react";
import { Bookmark, ShoppingBag, ImageIcon, Filter, Download, Loader2, Eye, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { getUserPurchasesAction, getUserBookmarksAction, getUserBookmarkIdsAction, toggleBookmarkAction } from "@/actions";
import { useRouter } from "next/navigation";
import type { PurchaseWithDetails } from "@/services/purchase.service";
import type { BookmarkWithDetails } from "@/services/bookmark.service";

export default function GalleryPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [purchasedPhotos, setPurchasedPhotos] = useState<PurchaseWithDetails[]>([]);
  const [bookmarkedPhotos, setBookmarkedPhotos] = useState<BookmarkWithDetails[]>([]);
  const [filterType, setFilterType] = useState<"all" | "purchased" | "bookmarked">("all");
  const [loading, setLoading] = useState(true);
  const [bookmarkIds, setBookmarkIds] = useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = useState(false);
  
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

  // Helper function for alert dialog
  const showAlert = (title: string, description: string) => {
    setAlertDialog({ open: true, title, description });
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [authLoading, isAuthenticated, router]);

  // Load data
  useEffect(() => {
    async function loadGalleryData() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const purchases = await getUserPurchasesAction(user.id);
        setPurchasedPhotos(purchases || []);

        const bookmarks = await getUserBookmarksAction(user.id);
        setBookmarkedPhotos(bookmarks || []);

        const bookmarkSet = new Set(
          (bookmarks || []).map((b: BookmarkWithDetails) => b.photoId)
        );
        setBookmarkIds(bookmarkSet);
      } catch (error) {
        console.error("Failed to load gallery data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated && user) {
      loadGalleryData();
    }
  }, [user, isAuthenticated]);

  type CombinedPhoto = {
    id: string;
    photoId: string;
    photo: PurchaseWithDetails['photo'] | BookmarkWithDetails['photo'];
    event: PurchaseWithDetails['event'] | BookmarkWithDetails['event'];
    isPurchased: boolean;
    isBookmarked: boolean;
    purchaseDate?: Date;
    bookmarkDate?: Date;
  };

  const allPhotos: CombinedPhoto[] = [
    ...purchasedPhotos.map((purchase) => ({
      id: purchase.id,
      photoId: purchase.photoId,
      photo: purchase.photo,
      event: purchase.event,
      isPurchased: true,
      isBookmarked: bookmarkIds.has(purchase.photoId),
      purchaseDate: purchase.purchasedAt,
    })),
    ...bookmarkedPhotos
      .filter((bookmark) => 
        !purchasedPhotos.some((p) => p.photoId === bookmark.photoId)
      )
      .map((bookmark) => ({
        id: bookmark.id,
        photoId: bookmark.photoId,
        photo: bookmark.photo,
        event: bookmark.event,
        isPurchased: false,
        isBookmarked: true,
        bookmarkDate: bookmark.createdAt,
      })),
  ];

  const filteredPhotos =
    filterType === "purchased"
      ? allPhotos.filter((p) => p.isPurchased)
      : filterType === "bookmarked"
      ? allPhotos.filter((p) => p.isBookmarked)
      : allPhotos;

  const purchasedCount = purchasedPhotos.length;
  const bookmarkedCount = bookmarkedPhotos.length;

  const handleToggleBookmark = async (photoId: string) => {
    if (!user?.id) return;

    try {
      console.log('[Gallery] Toggling bookmark for photo:', photoId);
      console.log('[Gallery] Current user:', user.id);
      
      const isCurrentlyBookmarked = bookmarkIds.has(photoId);
      const newBookmarkIds = new Set(bookmarkIds);

      if (isCurrentlyBookmarked) {
        newBookmarkIds.delete(photoId);
      } else {
        newBookmarkIds.add(photoId);
      }
      setBookmarkIds(newBookmarkIds);

      const result = await toggleBookmarkAction(user.id, photoId);
      console.log('[Gallery] Bookmark toggle result:', result);

      const bookmarks = await getUserBookmarksAction(user.id);
      setBookmarkedPhotos(bookmarks || []);
      const bookmarkSet = new Set((bookmarks || []).map((b: BookmarkWithDetails) => b.photoId));
      setBookmarkIds(bookmarkSet);
      
    } catch (error: any) {
      console.error('[Gallery] Failed to toggle bookmark:', error);
      console.error('[Gallery] Error details:', {
        message: error.message,
        stack: error.stack,
      });
      
      // Revert to server state
      const bookmarks = await getUserBookmarksAction(user.id);
      const bookmarkSet = new Set((bookmarks || []).map((b: BookmarkWithDetails) => b.photoId));
      setBookmarkIds(bookmarkSet);
      
      // Show error to user
      showAlert(
        'Bookmark Failed',
        `Failed to update bookmark: ${error.message || 'Unknown error'}\n\nPlease try again.`
      );
    }
  };

  const handleDownload = async (photoId: string, photoName: string) => {
    try {
      const response = await fetch(`/api/photos/download?photoId=${photoId}`);
      
      if (!response.ok) {
        throw new Error("Failed to download photo");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = photoName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      showAlert(
        'Download Failed',
        'Failed to download photo. Please try again.'
      );
    }
  };

  const [selectedPhoto, setSelectedPhoto] = useState<CombinedPhoto | null>(null);
  const [photoViewOpen, setPhotoViewOpen] = useState(false);

  const handleViewPhoto = (photo: CombinedPhoto) => {
    setSelectedPhoto(photo);
    setPhotoViewOpen(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#48CAE4] animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your gallery...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#48CAE4]/10 via-white to-[#00B4D8]/10">
        <div className="absolute inset-0 bg-grid-slate-100 -z-10" />
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4">
              My Photo
              <span className="block text-[#48CAE4] mt-1">Gallery</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600">
              Your purchased photos and bookmarked favorites
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white border-b sticky top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <Filter className="w-5 h-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Filter:</span>
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
                className={`whitespace-nowrap transition-all ${
                  filterType === "all"
                    ? "bg-[#48CAE4] hover:bg-[#3AAFCE] text-white shadow-md"
                    : "bg-white hover:bg-[#48CAE4]/10 text-slate-700 border-slate-300"
                }`}
              >
                All Photos
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/20">
                  {allPhotos.length}
                </span>
              </Button>
              <Button
                variant={filterType === "purchased" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("purchased")}
                className={`whitespace-nowrap transition-all ${
                  filterType === "purchased"
                    ? "bg-[#48CAE4] hover:bg-[#3AAFCE] text-white shadow-md"
                    : "bg-white hover:bg-[#48CAE4]/10 text-slate-700 border-slate-300"
                }`}
              >
                <ShoppingBag className="w-4 h-4 mr-1" />
                Purchased
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/20">
                  {purchasedCount}
                </span>
              </Button>
              <Button
                variant={filterType === "bookmarked" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("bookmarked")}
                className={`whitespace-nowrap transition-all ${
                  filterType === "bookmarked"
                    ? "bg-[#48CAE4] hover:bg-[#3AAFCE] text-white shadow-md"
                    : "bg-white hover:bg-[#48CAE4]/10 text-slate-700 border-slate-300"
                }`}
              >
                <Bookmark className="w-4 h-4 mr-1" />
                Bookmarked
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/20">
                  {bookmarkedCount}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredPhotos.length}</span> photos
          </p>
        </div>

        {isMounted && (
          <>
            {filteredPhotos.length === 0 ? (
              <div className="text-center py-20">
                <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No photos found</h3>
                <p className="text-slate-500 mb-6">
                  {filterType === "purchased"
                    ? "You haven't purchased any photos yet"
                    : filterType === "bookmarked"
                    ? "You haven't bookmarked any photos yet"
                    : "Your gallery is empty"}
                </p>
                <Button
                  asChild
                  className="bg-[#48CAE4] hover:bg-[#3AAFCE]"
                >
                  <a href="/shop">Browse Photos</a>
                </Button>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                {filteredPhotos.map((item) => {
                  const photo = item.photo;
                  if (!photo) return null;

                  return (
                    <div 
                      key={item.id} 
                      className="break-inside-avoid mb-4 group cursor-pointer"
                    >
                      <div 
                      className="relative overflow-hidden rounded-lg bg-slate-100 shadow-md hover:shadow-xl transition-all duration-300"
                      onClick={() => item.isPurchased && handleViewPhoto(item)}
                    >
                        <img
                          src={item.isPurchased ? photo.fullUrl : photo.previewUrl}
                          alt={photo.name}
                          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        
                        <div className="absolute top-3 right-3 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleBookmark(item.photoId);
                            }}
                            className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
                              item.isBookmarked
                                ? "bg-[#48CAE4] text-white shadow-lg scale-110"
                                : "bg-white/80 text-slate-600 hover:bg-white hover:scale-110"
                            }`}
                          >
                            <Bookmark 
                              className={`w-5 h-5 ${item.isBookmarked ? "fill-current" : ""}`}
                            />
                          </button>
                        </div>

                        {item.isPurchased && (
                          <div className="absolute top-3 left-3 z-10">
                            <Badge className="bg-green-600 shadow-lg">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Full Quality
                            </Badge>
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <p className="text-sm font-semibold mb-1 truncate">
                              {item.event?.name || 'No Event'}
                            </p>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-lg font-bold">
                                  Rp {photo.price?.toLocaleString('id-ID') || '0'}
                                </p>
                                {item.isPurchased && item.purchaseDate && (
                                  <p className="text-xs text-slate-300 mt-1">
                                    Purchased: {new Date(item.purchaseDate).toLocaleDateString('id-ID')}
                                  </p>
                                )}
                              </div>
                              {item.isPurchased ? (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewPhoto(item);
                                    }}
                                    className="bg-white/90 hover:bg-white text-[#3AAFCE] shadow-lg"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownload(item.photoId, photo.name);
                                    }}
                                    className="bg-[#48CAE4] hover:bg-[#3AAFCE] text-white shadow-lg"
                                  >
                                    <Download className="w-4 h-4 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  asChild
                                  size="sm"
                                  className="bg-[#48CAE4] hover:bg-[#3AAFCE] text-white shadow-lg"
                                >
                                  <a href="/shop">Buy Now</a>
                                </Button>
                              )}
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

      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[#48CAE4]/20 to-[#00B4D8]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-6 h-6 text-[#48CAE4]" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{allPhotos.length}</p>
            <p className="text-sm text-slate-600">Total Photos</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[#48CAE4]/20 to-[#00B4D8]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-6 h-6 text-[#48CAE4]" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{purchasedCount}</p>
            <p className="text-sm text-slate-600">Purchased</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[#48CAE4]/20 to-[#00B4D8]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-6 h-6 text-[#48CAE4]" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{bookmarkedCount}</p>
            <p className="text-sm text-slate-600">Bookmarked</p>
          </div>
        </div>
      </section>

      {/* Photo View Dialog */}
      <Dialog open={photoViewOpen} onOpenChange={setPhotoViewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0">
          <DialogTitle className="sr-only">
            {selectedPhoto?.photo?.name || "Photo Preview"}
          </DialogTitle>
          {selectedPhoto?.photo && (
            <div className="relative">
              <img
                src={selectedPhoto.photo.fullUrl}
                alt={selectedPhoto.photo.name}
                className="w-full h-auto max-h-[85vh] object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-white font-semibold text-lg mb-2">
                  {selectedPhoto.photo.name}
                </h3>
                <Button
                  onClick={() => {
                    if (selectedPhoto.photo) {
                      handleDownload(selectedPhoto.photoId, selectedPhoto.photo.name);
                    }
                  }}
                  className="bg-[#48CAE4] hover:bg-[#3AAFCE] text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Full Quality
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
