"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, Filter, FolderOpen, MoreVertical, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getEventsAction,
  createEventAction,
  updateEventAction,
  deleteEventAction,
} from "@/actions/photo.actions";
import { useAuth } from "@/hooks/useAuth";
import type { Event as EventType } from "@/db/schema";

interface EventWithPhotos extends EventType {
  photoCount?: number;
}

export default function EventPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  
  // Edit state
  const [editingEvent, setEditingEvent] = useState<EventWithPhotos | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventWithPhotos | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    eventDate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Client-side mounting flag to prevent hydration issues
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

  // Load events
  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const eventsData = await getEventsAction();
        setEvents(eventsData);
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  // Filter events berdasarkan tanggal
  const filteredEvents = events.filter((evt) => {
    if (!filterStartDate && !filterEndDate) return true;
    
    const eventDate = new Date(evt.eventDate);
    const startDate = filterStartDate ? new Date(filterStartDate) : null;
    const endDate = filterEndDate ? new Date(filterEndDate) : null;

    if (startDate && endDate) {
      return eventDate >= startDate && eventDate <= endDate;
    } else if (startDate) {
      return eventDate >= startDate;
    } else if (endDate) {
      return eventDate <= endDate;
    }
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi
    if (!formData.name || !formData.eventDate || !user?.id) {
      showAlert("Validasi Gagal", "Nama event dan tanggal harus diisi!", "destructive");
      return;
    }

    try {
      setSubmitting(true);

      if (isEditMode && editingEvent) {
        // Update existing event
        await updateEventAction(editingEvent.id, {
          name: formData.name,
          description: formData.description,
          eventDate: formData.eventDate,
        });
        
        // Reload events
        const eventsData = await getEventsAction();
        setEvents(eventsData);
      } else {
        // Buat event baru
        await createEventAction({
          name: formData.name,
          description: formData.description,
          eventDate: formData.eventDate,
          photographerId: user.id,
        });

        // Reload events
        const eventsData = await getEventsAction();
        setEvents(eventsData);
      }
      
      // Reset form dan tutup dialog
      setFormData({ name: "", description: "", eventDate: "" });
      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditingEvent(null);
      
      showAlert("Berhasil", isEditMode ? "Event berhasil diupdate!" : "Event berhasil dibuat!");
    } catch (error) {
      console.error("Failed to save event:", error);
      showAlert("Error", "Gagal menyimpan event. Silakan coba lagi.", "destructive");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const clearFilter = () => {
    setFilterStartDate("");
    setFilterEndDate("");
  };

  const handleEdit = (evt: EventWithPhotos) => {
    setEditingEvent(evt);
    setIsEditMode(true);
    setFormData({
      name: evt.name,
      description: evt.description || "",
      eventDate: evt.eventDate,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (evt: EventWithPhotos) => {
    setEventToDelete(evt);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    try {
      await deleteEventAction(eventToDelete.id);
      
      // Reload events
      const eventsData = await getEventsAction();
      setEvents(eventsData);
      
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      
      showAlert("Berhasil", "Event berhasil dihapus!");
    } catch (error) {
      console.error("Failed to delete event:", error);
      showAlert("Error", "Gagal menghapus event. Silakan coba lagi.", "destructive");
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Reset when closing
      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditingEvent(null);
      setFormData({ name: "", description: "", eventDate: "" });
    } else {
      setIsDialogOpen(true);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Event Management</h1>
        <p className="text-slate-500 mt-2">
          Kelola folder event untuk mengorganisir foto-foto
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Button Tambah Event */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Tambah Folder Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? "Edit Event" : "Buat Event Baru"}
                </DialogTitle>
                <DialogDescription>
                  {isEditMode
                    ? "Update informasi event yang sudah ada"
                    : "Buat folder event baru untuk mengorganisir foto-foto"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nama Event <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Contoh: Wedding John & Jane"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Deskripsi singkat tentang event"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventDate">
                    Tanggal Event <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="eventDate"
                    name="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogClose(false)}
                  disabled={submitting}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isEditMode ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    isEditMode ? "Update Event" : "Simpan Event"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Filter Tanggal */}
        <div className="flex flex-1 gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex-1 min-w-[150px]">
            <Input
              type="date"
              placeholder="Dari tanggal"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <Input
              type="date"
              placeholder="Sampai tanggal"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
            />
          </div>
          {(filterStartDate || filterEndDate) && (
            <Button variant="outline" onClick={clearFilter}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Event List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Tidak ada event ditemukan
            </h3>
            <p className="text-slate-500 mb-4">
              {filterStartDate || filterEndDate
                ? "Coba ubah filter tanggal atau buat event baru"
                : "Mulai dengan membuat folder event pertama Anda"}
            </p>
            {!filterStartDate && !filterEndDate && (
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Tambah Event
              </Button>
            )}
          </div>
        ) : (
          isMounted && filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <FolderOpen className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{event.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {event.description || "Tidak ada deskripsi"}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" suppressHydrationWarning>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(event.eventDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-slate-500">
                      {event.photoCount || 0} foto
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => handleEdit(event)}
                        title="Edit event"
                        suppressHydrationWarning
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-600 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteClick(event)}
                        title="Hapus event"
                        suppressHydrationWarning
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredEvents.length > 0 && (
        <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600">
            Menampilkan <span className="font-bold">{filteredEvents.length}</span> dari{" "}
            <span className="font-bold">{events.length}</span> total event
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Event?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus event{" "}
              <span className="font-semibold text-slate-900">
                &quot;{eventToDelete?.name}&quot;
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Hapus Event
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
