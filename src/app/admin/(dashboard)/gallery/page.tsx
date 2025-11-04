"use client";

import { useState, useEffect } from "react";
import {
  Images,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Tag,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { getPhotosAction, getEventsAction, updatePhotoAction, deletePhotoAction } from "@/actions";
import type { PhotoWithDetails } from "@/services/photo.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Type untuk event di filter
interface EventOption {
  id: string;
  name: string;
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<PhotoWithDetails[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "sold" | "unsold">("all");
  const [filterEvent, setFilterEvent] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  
  const [viewingPhoto, setViewingPhoto] = useState<PhotoWithDetails | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const [editingPhoto, setEditingPhoto] = useState<PhotoWithDetails | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempPrice, setTempPrice] = useState("");
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<PhotoWithDetails | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  
  // Alert Dialog state
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant?: "default" | "destructive";
  }>({
    open: false,
    title: "",
    description: "",
    variant: "default",
  });

  // Helper function
  const showAlert = (title: string, description: string, variant: "default" | "destructive" = "default") => {
    setAlertDialog({ open: true, title, description, variant });
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [photosData, eventsData] = await Promise.all([
          getPhotosAction(),
          getEventsAction(),
        ]);

        setPhotos(photosData || []);
        setEvents(
          (eventsData || []).map((evt: any) => ({
            id: evt.id,
            name: evt.name,
          }))
        );
      } catch (error) {
        console.error("Failed to load gallery data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Filter photos
  const filteredPhotos = photos.filter((photo: PhotoWithDetails) => {
    // Search filter
    if (searchQuery && !photo.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filterStatus === "sold" && !photo.sold) return false;
    if (filterStatus === "unsold" && photo.sold) return false;

    // Event filter
    if (filterEvent !== "all" && photo.eventId !== filterEvent) return false;

    // Date filter (createdAt date)
    if (filterDateFrom && photo.createdAt < new Date(filterDateFrom)) return false;
    if (filterDateTo && photo.createdAt > new Date(filterDateTo)) return false;

    return true;
  });

  // Handle view photo
  const handleView = (photo: PhotoWithDetails) => {
    setViewingPhoto(photo);
    setIsViewDialogOpen(true);
  };

  // Handle edit photo
  const handleEdit = (photo: PhotoWithDetails) => {
    setEditingPhoto(photo);
    setTempName(photo.name);
    setTempPrice(photo.price.toString());
    setIsEditDialogOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingPhoto) return;

    const price = parseFloat(tempPrice) || 0;

    try {
      setSubmitting(true);
      
      await updatePhotoAction(editingPhoto.id, {
        name: tempName,
        price: price,
      });

      // Reload photos
      const photosData = await getPhotosAction();
      setPhotos(photosData || []);

      setIsEditDialogOpen(false);
      setEditingPhoto(null);
      showAlert("Berhasil", "Foto berhasil diupdate!");
    } catch (error) {
      console.error("Failed to update photo:", error);
      showAlert("Error", "Gagal mengupdate foto. Silakan coba lagi.", "destructive");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete photo
  const handleDelete = (photo: PhotoWithDetails) => {
    setPhotoToDelete(photo);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!photoToDelete) return;

    try {
      setSubmitting(true);
      
      await deletePhotoAction(photoToDelete.id);

      // Reload photos
      const photosData = await getPhotosAction();
      setPhotos(photosData || []);

      setDeleteDialogOpen(false);
      setPhotoToDelete(null);
      showAlert("Berhasil", "Foto berhasil dihapus!");
    } catch (error) {
      console.error("Failed to delete photo:", error);
      showAlert("Error", "Gagal menghapus foto. Silakan coba lagi.", "destructive");
    } finally {
      setSubmitting(false);
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterStatus("all");
    setFilterEvent("all");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  // Statistics
  const totalPhotos = photos.length;
  const soldPhotos = photos.filter((p) => p.sold).length;
  const unsoldPhotos = photos.filter((p) => !p.sold).length;
  const totalRevenue = photos
    .filter((p: PhotoWithDetails) => p.sold)
    .reduce((sum, p) => sum + p.price, 0);

  // Show loading spinner
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading gallery data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Gallery Foto</h1>
        <p className="text-slate-500 mt-2">
          Kelola semua foto yang telah diunggah
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Foto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Images className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900">
                {totalPhotos}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Foto Terjual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-slate-900">
                {soldPhotos}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Belum Terjual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-amber-600" />
              <span className="text-2xl font-bold text-slate-900">
                {unsoldPhotos}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                Rp {totalRevenue.toLocaleString("id-ID")}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter & Pencarian
          </CardTitle>
          <CardDescription>
            Gunakan filter untuk menemukan foto tertentu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Cari Nama Foto</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="search"
                  placeholder="Cari nama foto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="sold">Terjual</SelectItem>
                  <SelectItem value="unsold">Belum Terjual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Event Filter */}
            <div className="space-y-2">
              <Label htmlFor="event">Event</Label>
              <Select value={filterEvent} onValueChange={setFilterEvent}>
                <SelectTrigger id="event">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Event</SelectItem>
                  {events.map((evt: EventOption) => (
                    <SelectItem key={evt.id} value={evt.id}>
                      {evt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Tanggal Dari</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
              />
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label htmlFor="dateTo">Tanggal Sampai</Label>
              <Input
                id="dateTo"
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="gap-2"
            >
              <XCircle className="w-4 h-4" />
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Photo Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Foto ({filteredPhotos.length})</CardTitle>
          <CardDescription>
            {filteredPhotos.length === 0 ? "Tidak ada foto yang ditemukan" : "Klik pada foto untuk melihat detail"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-12">
              <Images className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium mb-2">
                Tidak ada foto yang ditemukan
              </p>
              <p className="text-sm text-slate-400 mb-4">
                Coba ubah filter atau upload foto baru
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                Reset Filter
              </Button>
            </div>
          ) : (
            isMounted && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredPhotos.map((photo) => (
                  <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Preview Image */}
                    <div className="relative h-48 bg-slate-100">
                      <img
                        src={photo.previewUrl}
                        alt={photo.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        {photo.sold ? (
                          <span className="px-2 py-1 text-xs font-semibold bg-green-500 text-white rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Terjual
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold bg-amber-500 text-white rounded-full flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Tersedia
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Photo Info */}
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-slate-900 truncate mb-1">
                        {photo.name}
                      </h3>
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Tag className="w-3 h-3" />
                          <span className="font-semibold text-green-600">
                            Rp {photo.price.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <FolderOpen className="w-3 h-3" />
                          <span className="truncate">{photo.event?.name || 'No Event'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(photo.createdAt).toLocaleDateString("id-ID")}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(photo)}
                          className="flex-1 gap-1"
                          suppressHydrationWarning
                        >
                          <Eye className="w-3 h-3" />
                          Lihat
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(photo)}
                          className="flex-1 gap-1"
                          suppressHydrationWarning
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(photo)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          suppressHydrationWarning
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* View Photo Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Foto</DialogTitle>
          </DialogHeader>

          {viewingPhoto && (
            <div className="space-y-4">
              {/* Photo Preview */}
              <div className="w-full h-96 rounded-lg overflow-hidden bg-slate-100">
                <img
                  src={viewingPhoto.previewUrl}
                  alt={viewingPhoto.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Photo Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500">Nama File</Label>
                  <p className="font-medium text-slate-900">{viewingPhoto.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Full URL</Label>
                  <p className="font-medium text-slate-900 text-xs truncate">{viewingPhoto.fullUrl}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Harga</Label>
                  <p className="font-semibold text-green-600">
                    Rp {viewingPhoto.price.toLocaleString("id-ID")}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Status</Label>
                  <p className="font-medium">
                    {viewingPhoto.sold ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Terjual
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        Tersedia
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Event</Label>
                  <p className="font-medium text-slate-900">{viewingPhoto.event?.name || 'No Event'}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Tanggal Upload</Label>
                  <p className="font-medium text-slate-900">
                    {new Date(viewingPhoto.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Photo Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Foto</DialogTitle>
            <DialogDescription>
              Ubah informasi foto
            </DialogDescription>
          </DialogHeader>

          {editingPhoto && (
            <div className="space-y-4">
              {/* Preview */}
              <div className="w-full h-48 rounded-lg overflow-hidden bg-slate-100">
                <img
                  src={editingPhoto.previewUrl}
                  alt={editingPhoto.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">
                    Nama Foto <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-name"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Nama foto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-price">
                    Harga (Rp) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={tempPrice}
                    onChange={(e) => setTempPrice(e.target.value)}
                    placeholder="Harga foto"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={handleSaveEdit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Foto?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus foto{" "}
              <span className="font-semibold text-slate-900">
                {photoToDelete?.name}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog for notifications */}
      <Dialog open={alertDialog.open} onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={alertDialog.variant === "destructive" ? "text-red-600" : ""}>
              {alertDialog.title}
            </DialogTitle>
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
