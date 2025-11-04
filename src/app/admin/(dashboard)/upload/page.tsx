"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload as UploadIcon,
  Image as ImageIcon,
  X,
  Settings,
  Save,
  FolderOpen,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { getEventsAction, createPhotoAction } from "@/actions";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Type untuk event
interface EventOption {
  id: string;
  name: string;
}

// Type untuk foto yang di-upload
interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
  name: string;
  price: number;
  size: string;
  uploading?: boolean;
  uploaded?: boolean;
  error?: string;
}

export default function UploadPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [editingPhoto, setEditingPhoto] = useState<UploadedPhoto | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempPrice, setTempPrice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [bulkPrice, setBulkPrice] = useState("");
  
  // Dialog states
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper functions for dialogs
  const showAlert = (title: string, description: string, variant: "default" | "destructive" = "default") => {
    setAlertDialog({ open: true, title, description, variant });
  };

  const showConfirm = (title: string, description: string, onConfirm: () => void) => {
    setConfirmDialog({ open: true, title, description, onConfirm });
  };

  // Load events on mount
  useEffect(() => {
    async function loadEvents() {
      try {
        setLoadingEvents(true);
        const eventsData = await getEventsAction();
        setEvents(
          (eventsData || []).map((evt: any) => ({
            id: evt.id,
            name: evt.name,
          }))
        );
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setLoadingEvents(false);
      }
    }

    loadEvents();
  }, []);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: UploadedPhoto[] = [];

    Array.from(files).forEach((file) => {
      // Validasi tipe file
      if (!file.type.startsWith("image/")) {
        showAlert("File Tidak Valid", `File ${file.name} bukan gambar!`, "destructive");
        return;
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);

      const photo: UploadedPhoto = {
        id: `${Date.now()}-${Math.random()}`,
        file: file,
        preview: preview,
        name: file.name,
        price: 0,
        size: formatFileSize(file.size),
      };

      newPhotos.push(photo);
    });

    setPhotos([...photos, ...newPhotos]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle drag & drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files) return;

    // Simulate file input change
    const input = fileInputRef.current;
    if (input) {
      const dataTransfer = new DataTransfer();
      Array.from(files).forEach((file) => dataTransfer.items.add(file));
      input.files = dataTransfer.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Open manage photo dialog
  const handleManagePhoto = (photo: UploadedPhoto) => {
    setEditingPhoto(photo);
    setTempPrice(photo.price > 0 ? photo.price.toString() : "");
    setIsDialogOpen(true);
  };

  // Save photo price
  const handleSavePrice = () => {
    if (!editingPhoto) return;

    const price = parseFloat(tempPrice) || 0;

    setPhotos(
      photos.map((p) =>
        p.id === editingPhoto.id ? { ...p, price: price } : p
      )
    );

    setIsDialogOpen(false);
    setEditingPhoto(null);
    setTempPrice("");
  };

  // Apply bulk price to all photos
  const handleApplyBulkPrice = () => {
    const price = parseFloat(bulkPrice);
    
    if (isNaN(price) || price < 0) {
      showAlert("Input Tidak Valid", "Harap masukkan harga yang valid!", "destructive");
      return;
    }

    showConfirm(
      "Konfirmasi Pengaturan Harga",
      `Atur harga semua foto (${photos.length} foto) menjadi Rp ${price.toLocaleString("id-ID")}?`,
      () => {
        setPhotos(
          photos.map((p) => ({ ...p, price: price }))
        );

        showAlert("Berhasil", `Berhasil mengatur harga untuk ${photos.length} foto!`);
        setBulkPrice("");
      }
    );
  };

  // Apply bulk price to photos without price
  const handleApplyBulkPriceToUnpriced = () => {
    const price = parseFloat(bulkPrice);
    
    if (isNaN(price) || price < 0) {
      showAlert("Input Tidak Valid", "Harap masukkan harga yang valid!", "destructive");
      return;
    }

    const unpricedPhotos = photos.filter((p) => p.price === 0);
    
    if (unpricedPhotos.length === 0) {
      showAlert("Info", "Semua foto sudah memiliki harga!");
      return;
    }

    showConfirm(
      "Konfirmasi Pengaturan Harga",
      `Atur harga untuk ${unpricedPhotos.length} foto yang belum memiliki harga menjadi Rp ${price.toLocaleString("id-ID")}?`,
      () => {
        setPhotos(
          photos.map((p) => (p.price === 0 ? { ...p, price: price } : p))
        );

        showAlert("Berhasil", `Berhasil mengatur harga untuk ${unpricedPhotos.length} foto!`);
        setBulkPrice("");
      }
    );
  };

  // Remove photo from list
  const handleRemovePhoto = (photoId: string) => {
    const photo = photos.find((p) => p.id === photoId);
    if (photo) {
      URL.revokeObjectURL(photo.preview);
    }
    setPhotos(photos.filter((p) => p.id !== photoId));
  };

  // Save all photos
  const handleSaveAll = async () => {
    // Validasi
    if (!selectedEvent) {
      showAlert("Event Belum Dipilih", "Silakan pilih folder event terlebih dahulu!", "destructive");
      return;
    }

    if (photos.length === 0) {
      showAlert("Tidak Ada Foto", "Tidak ada foto yang akan disimpan!", "destructive");
      return;
    }

    if (!user?.id) {
      showAlert("User Tidak Ditemukan", "User tidak ditemukan. Silakan login kembali.", "destructive");
      return;
    }

    // Check if all photos have price
    const photosWithoutPrice = photos.filter((p: UploadedPhoto) => p.price === 0);
    if (photosWithoutPrice.length > 0) {
      showConfirm(
        "Konfirmasi Upload",
        `Ada ${photosWithoutPrice.length} foto yang belum diatur harganya. Lanjutkan?`,
        () => performUpload()
      );
      return;
    }

    performUpload();
  };

  // Perform the actual upload
  const performUpload = async () => {
    if (!user?.id || !selectedEvent) return;

    setIsSaving(true);
    const supabase = createClient();
    let successCount = 0;
    let failCount = 0;

    // Get admin watermark URL
    let watermarkUrl: string | null = null;
    try {
      const watermarkResponse = await fetch('/api/admin/watermark');
      if (watermarkResponse.ok) {
        const data = await watermarkResponse.json();
        watermarkUrl = data.watermarkUrl;
        console.log('💧 Watermark URL:', watermarkUrl || 'No watermark set');
      }
    } catch (error) {
      console.warn('Failed to get watermark:', error);
      // Continue without watermark
    }

    // Upload photos one by one
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      
      // Update status: uploading
      setPhotos((prev: UploadedPhoto[]) =>
        prev.map((p: UploadedPhoto) =>
          p.id === photo.id ? { ...p, uploading: true, error: undefined } : p
        )
      );

      try {
        // 1. Upload ORIGINAL file to Supabase Storage (full resolution)
        const fileExt = photo.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const originalPath = `originals/${selectedEvent}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(originalPath, photo.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        console.log(`✅ Original uploaded to: ${originalPath}`);

        // 2. Create PREVIEW version (25% resolution) using resize API
        console.log(`🔄 Creating preview version (25%) for: ${photo.name}`);
        
        const formData = new FormData();
        formData.append('file', photo.file);
        formData.append('quality', '25'); // 25% of original resolution
        
        // Add watermark URL if available
        if (watermarkUrl) {
          formData.append('watermarkUrl', watermarkUrl);
          console.log('💧 Using watermark:', watermarkUrl);
        }

        const resizeResponse = await fetch('/api/photos/resize', {
          method: 'POST',
          body: formData,
        });

        if (!resizeResponse.ok) {
          const errorText = await resizeResponse.text();
          console.error('Resize API error:', errorText);
          throw new Error('Failed to create preview version');
        }

        const resizedBlob = await resizeResponse.blob();
        console.log(`📦 Original size: ${(photo.file.size / 1024).toFixed(2)} KB`);
        console.log(`📦 Preview size: ${(resizedBlob.size / 1024).toFixed(2)} KB`);
        console.log(`📊 Compression ratio: ${((resizedBlob.size / photo.file.size) * 100).toFixed(1)}%`);
        
        const resizedFile = new File([resizedBlob], `preview_${fileName}`, {
          type: 'image/jpeg',
        });

        // 3. Upload PREVIEW file to Supabase Storage (low resolution)
        const previewPath = `previews/${selectedEvent}/${fileName}`;
        
        const { error: previewUploadError } = await supabase.storage
          .from('photos')
          .upload(previewPath, resizedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (previewUploadError) throw previewUploadError;

        console.log(`✅ Preview uploaded to: ${previewPath}`);

        // 4. Get public URLs for both versions
        const { data: { publicUrl: originalUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(originalPath);

        const { data: { publicUrl: previewUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(previewPath);

        console.log(`🔗 Original URL: ${originalUrl}`);
        console.log(`🔗 Preview URL: ${previewUrl}`);

        // 5. Create photo record in database
        await createPhotoAction({
          name: photo.name,
          price: photo.price,
          eventId: selectedEvent,
          photographerId: user.id,
          previewUrl: previewUrl, // Low-res version for browsing
          fullUrl: originalUrl, // Full-res version for purchased downloads
          watermarkUrl: previewUrl, // Using preview as watermark for now
        });

        // Update status: uploaded
        setPhotos((prev: UploadedPhoto[]) =>
          prev.map((p: UploadedPhoto) =>
            p.id === photo.id 
              ? { ...p, uploading: false, uploaded: true } 
              : p
          )
        );

        successCount++;
      } catch (error) {
        console.error(`Failed to upload photo ${photo.name}:`, error);
        
        // Update status: error
        setPhotos((prev: UploadedPhoto[]) =>
          prev.map((p: UploadedPhoto) =>
            p.id === photo.id 
              ? { ...p, uploading: false, error: 'Upload gagal' } 
              : p
          )
        );

        failCount++;
      }
    }

    setIsSaving(false);

    // Show result
    if (failCount === 0) {
      showAlert("Upload Berhasil", `Berhasil menyimpan semua ${successCount} foto!`);
      
      // Reset
      photos.forEach((p: UploadedPhoto) => URL.revokeObjectURL(p.preview));
      setPhotos([]);
      setSelectedEvent("");
    } else {
      showAlert(
        "Upload Selesai",
        `Berhasil: ${successCount}\nGagal: ${failCount}\n\nFoto yang gagal masih ada di list, silakan coba lagi.`,
        "destructive"
      );
      
      // Remove uploaded photos only
      const failedPhotos = photos.filter((p: UploadedPhoto) => !p.uploaded);
      photos
        .filter((p: UploadedPhoto) => p.uploaded)
        .forEach((p: UploadedPhoto) => URL.revokeObjectURL(p.preview));
      setPhotos(failedPhotos);
    }
  };

  // Calculate total
  const totalPhotos = photos.length;
  const totalWithPrice = photos.filter((p: UploadedPhoto) => p.price > 0).length;
  const totalRevenue = photos.reduce((sum: number, p: UploadedPhoto) => sum + p.price, 0);
  const uploadingCount = photos.filter((p: UploadedPhoto) => p.uploading).length;
  const uploadedCount = photos.filter((p: UploadedPhoto) => p.uploaded).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Unggah Foto</h1>
        <p className="text-slate-500 mt-2">
          Upload foto ke event dan kelola harga untuk setiap foto
        </p>
      </div>

      {/* Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Select Event */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Pilih Folder Event
            </CardTitle>
            <CardDescription>
              Pilih event untuk upload foto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih event..." />
              </SelectTrigger>
              <SelectContent>
                {events.map((evt: EventOption) => (
                  <SelectItem key={evt.id} value={evt.id}>
                    {evt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Upload Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Statistik Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Total Foto:</span>
              <span className="font-semibold text-slate-900">
                {totalPhotos}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Dengan Harga:</span>
              <span className="font-semibold text-slate-900">
                {totalWithPrice}
              </span>
            </div>
            {isSaving && uploadingCount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Progress:</span>
                <span className="font-semibold text-blue-600">
                  {uploadedCount}/{totalPhotos}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Total Revenue:</span>
              <span className="font-semibold text-green-600">
                Rp {totalRevenue.toLocaleString("id-ID")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Save className="w-4 h-4" />
              Simpan Foto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSaveAll}
              disabled={isSaving || photos.length === 0 || !selectedEvent}
              className="w-full gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading {uploadedCount}/{totalPhotos}...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan Semua Foto
                </>
              )}
            </Button>
            {photos.length === 0 && (
              <p className="text-xs text-slate-500 mt-2">
                Upload foto terlebih dahulu
              </p>
            )}
            {!selectedEvent && photos.length > 0 && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Pilih event terlebih dahulu
              </p>
            )}
            {isSaving && (
              <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Sedang mengupload foto...
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upload Area */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Foto</CardTitle>
          <CardDescription>
            Drag & drop foto atau klik untuk memilih (dapat memilih lebih dari satu)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-slate-400 transition-colors cursor-pointer bg-slate-50 hover:bg-slate-100"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-700 font-medium mb-2">
              Klik untuk upload atau drag & drop
            </p>
            <p className="text-sm text-slate-500">
              PNG, JPG, JPEG, GIF hingga 10MB per file
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Photo List */}
      {photos.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Daftar Foto ({photos.length})</CardTitle>
                <CardDescription>
                  Kelola harga untuk setiap foto sebelum menyimpan
                </CardDescription>
              </div>
              
              {/* Bulk Price Setting */}
              <div className="flex items-end gap-2 min-w-[400px]">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="bulkPrice" className="text-xs text-slate-600">
                    Atur Harga Keseluruhan
                  </Label>
                  <Input
                    id="bulkPrice"
                    type="number"
                    placeholder="Contoh: 50000"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value)}
                    min="0"
                    step="1000"
                    className="h-9"
                    disabled={isSaving}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApplyBulkPriceToUnpriced}
                    disabled={!bulkPrice || isSaving}
                    className="whitespace-nowrap h-9"
                    title="Atur harga untuk foto yang belum memiliki harga"
                  >
                    <Settings className="w-3.5 h-3.5 mr-1.5" />
                    Tanpa Harga
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleApplyBulkPrice}
                    disabled={!bulkPrice || isSaving}
                    className="whitespace-nowrap h-9"
                    title="Atur harga untuk semua foto"
                  >
                    <Settings className="w-3.5 h-3.5 mr-1.5" />
                    Semua Foto
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  {/* Preview */}
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                    <img
                      src={photo.preview}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {photo.name}
                    </p>
                    <p className="text-sm text-slate-500">{photo.size}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {photo.uploading ? (
                        <span className="text-sm text-blue-600 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Uploading...
                        </span>
                      ) : photo.uploaded ? (
                        <span className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Uploaded
                        </span>
                      ) : photo.error ? (
                        <span className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {photo.error}
                        </span>
                      ) : photo.price > 0 ? (
                        <span className="text-sm font-semibold text-green-600">
                          Rp {photo.price.toLocaleString("id-ID")}
                        </span>
                      ) : (
                        <span className="text-sm text-amber-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Belum diatur harga
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManagePhoto(photo)}
                      className="gap-2"
                      disabled={photo.uploading || photo.uploaded || isSaving}
                    >
                      <Settings className="w-4 h-4" />
                      Kelola
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={photo.uploading || photo.uploaded || isSaving}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manage Photo Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kelola Foto</DialogTitle>
            <DialogDescription>
              Atur harga untuk foto ini
            </DialogDescription>
          </DialogHeader>

          {editingPhoto && (
            <div className="space-y-4">
              {/* Preview */}
              <div className="w-full h-48 rounded-lg overflow-hidden bg-slate-100">
                <img
                  src={editingPhoto.preview}
                  alt={editingPhoto.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* File Info */}
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-slate-500">Nama File</Label>
                  <p className="text-sm font-medium text-slate-900">
                    {editingPhoto.name}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Ukuran</Label>
                  <p className="text-sm font-medium text-slate-900">
                    {editingPhoto.size}
                  </p>
                </div>
              </div>

              {/* Price Input */}
              <div className="space-y-2">
                <Label htmlFor="price">
                  Harga Foto (Rp) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Contoh: 50000"
                  value={tempPrice}
                  onChange={(e) => setTempPrice(e.target.value)}
                  min="0"
                  step="1000"
                />
                <p className="text-xs text-slate-500">
                  Tentukan harga jual untuk foto ini
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Batal
            </Button>
            <Button onClick={handleSavePrice}>Simpan Harga</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
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
              Batal
            </Button>
            <Button
              onClick={() => {
                confirmDialog.onConfirm();
                setConfirmDialog({ ...confirmDialog, open: false });
              }}
            >
              Konfirmasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
