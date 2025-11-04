"use client";

import { useState, useRef, useEffect } from "react";
import { User, Camera, Upload, Image as ImageIcon, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { getProfileAction, updateProfileAction } from "@/actions";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const { user } = useAuth();
  
  // Form states
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminDescription, setAdminDescription] = useState("");
  
  // Profile photo
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  
  // Watermark
  const [watermark, setWatermark] = useState<string | null>(null);
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog state
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

  // Load profile data
  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const profile = await getProfileAction(user.id);
        
        if (profile) {
          setAdminName(profile.fullName || "");
          setAdminEmail(profile.email || "");
          setAdminPhone(profile.phone || "");
          
          if (profile.avatarUrl) {
            setProfilePhoto(profile.avatarUrl);
          }
          
          if (profile.watermarkUrl) {
            setWatermark(profile.watermarkUrl);
          }
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        showAlert("Error", "Gagal memuat data profil", "destructive");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  // Handle profile photo upload
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showAlert("File Tidak Valid", "File harus berupa gambar!", "destructive");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showAlert("File Terlalu Besar", "Ukuran file maksimal 5MB!", "destructive");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhoto(reader.result as string);
      setProfilePhotoFile(file);
    };
    reader.readAsDataURL(file);
  };

  // Handle watermark upload
  const handleWatermarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (only PNG)
    if (file.type !== "image/png") {
      showAlert("File Tidak Valid", "Watermark harus berupa file PNG!", "destructive");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showAlert("File Terlalu Besar", "Ukuran watermark maksimal 2MB!", "destructive");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setWatermark(reader.result as string);
      setWatermarkFile(file);
    };
    reader.readAsDataURL(file);
  };

  // Remove profile photo
  const handleRemoveProfilePhoto = () => {
    setProfilePhoto(null);
    setProfilePhotoFile(null);
    if (profileInputRef.current) {
      profileInputRef.current.value = "";
    }
  };

  // Remove watermark
  const handleRemoveWatermark = () => {
    setWatermark(null);
    setWatermarkFile(null);
    if (watermarkInputRef.current) {
      watermarkInputRef.current.value = "";
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!user?.id) {
      showAlert("Error", "User tidak ditemukan. Silakan login kembali.", "destructive");
      return;
    }

    // Validation
    if (!adminName.trim()) {
      showAlert("Validasi Gagal", "Nama admin harus diisi!", "destructive");
      return;
    }

    if (!adminEmail.trim()) {
      showAlert("Validasi Gagal", "Email admin harus diisi!", "destructive");
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();
      let avatarUrl = profilePhoto;
      let watermarkUrl = watermark;

      // Upload profile photo if changed
      if (profilePhotoFile) {
        const fileExt = profilePhotoFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, profilePhotoFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error('Avatar upload error:', uploadError);
          throw new Error('Gagal mengupload foto profil');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      // Upload watermark if changed
      if (watermarkFile) {
        const fileExt = watermarkFile.name.split('.').pop();
        const fileName = `${user.id}-watermark-${Date.now()}.${fileExt}`;
        const filePath = `watermarks/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, watermarkFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error('Watermark upload error:', uploadError);
          throw new Error('Gagal mengupload watermark');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(filePath);

        watermarkUrl = publicUrl;
      }

      // Update profile in database
      await updateProfileAction(user.id, {
        fullName: adminName,
        phone: adminPhone || undefined,
        avatarUrl: avatarUrl || undefined,
        watermarkUrl: watermarkUrl || undefined,
      });

      showAlert("Berhasil", "Profil berhasil disimpan!");
      
      // Clear file state
      setProfilePhotoFile(null);
      setWatermarkFile(null);
      
    } catch (error: any) {
      console.error('Save profile error:', error);
      showAlert(
        "Gagal Menyimpan", 
        error.message || "Terjadi kesalahan saat menyimpan profil",
        "destructive"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Profile Admin</h1>
        <p className="text-slate-500 mt-2">
          Kelola informasi profil dan pengaturan admin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
              <CardDescription>
                Data pribadi dan kontak admin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminName">
                  Nama Admin <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="adminName"
                  placeholder="Masukkan nama lengkap"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail">
                  Email Admin <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="admin@example.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  disabled
                />
                <p className="text-xs text-slate-500">
                  Email tidak dapat diubah
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPhone">Nomor Telepon</Label>
                <Input
                  id="adminPhone"
                  type="tel"
                  placeholder="08123456789"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-slate-500">
                  Nomor telepon untuk dihubungi
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminDescription">Deskripsi Admin</Label>
                <Textarea
                  id="adminDescription"
                  placeholder="Ceritakan tentang diri Anda dan pengalaman fotografi..."
                  value={adminDescription}
                  onChange={(e) => setAdminDescription(e.target.value)}
                  rows={5}
                  disabled={isLoading}
                />
                <p className="text-xs text-slate-500">
                  Deskripsi akan ditampilkan pada halaman publik (Coming soon)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Watermark Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Pengaturan Watermark
              </CardTitle>
              <CardDescription>
                Upload watermark PNG untuk ditambahkan pada foto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Watermark Upload Area */}
                <div
                  className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors cursor-pointer bg-slate-50 hover:bg-slate-100"
                  onClick={() => watermarkInputRef.current?.click()}
                >
                  {watermark ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img
                          src={watermark}
                          alt="Watermark preview"
                          className="max-h-40 mx-auto"
                          style={{
                            imageRendering: "crisp-edges",
                            backgroundColor: "#f1f5f9",
                          }}
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveWatermark();
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {watermarkFile?.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Klik untuk mengganti watermark
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-700 font-medium mb-2">
                        Klik untuk upload watermark
                      </p>
                      <p className="text-sm text-slate-500">
                        PNG dengan background transparan (max 2MB)
                      </p>
                    </>
                  )}
                  <input
                    ref={watermarkInputRef}
                    type="file"
                    accept="image/png"
                    onChange={handleWatermarkChange}
                    className="hidden"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    💡 Tips Watermark:
                  </h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Gunakan file PNG dengan background transparan</li>
                    <li>• Ukuran ideal: 500x200px untuk hasil terbaik</li>
                    <li>• Watermark akan ditambahkan otomatis saat upload foto</li>
                    <li>• Posisi watermark bisa diatur per foto</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reset
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>

        {/* Right Column - Profile Photo */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Foto Profil</CardTitle>
              <CardDescription>
                Upload foto profil admin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Profile Photo Preview */}
                <div className="flex justify-center">
                  <div className="relative">
                    {profilePhoto ? (
                      <div className="relative">
                        <img
                          src={profilePhoto}
                          alt="Profile"
                          className="w-40 h-40 rounded-full object-cover border-4 border-slate-200"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                          onClick={handleRemoveProfilePhoto}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-40 h-40 rounded-full bg-slate-100 flex items-center justify-center border-4 border-slate-200">
                        <User className="w-16 h-16 text-slate-400" />
                      </div>
                    )}
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full"
                      onClick={() => profileInputRef.current?.click()}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  className="hidden"
                />

                <Separator />

                {/* Upload Info */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-700">
                    Panduan Upload:
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1">
                    <li>• Format: JPG, PNG, atau GIF</li>
                    <li>• Ukuran maksimal: 5MB</li>
                    <li>• Resolusi ideal: 400x400px</li>
                    <li>• Foto akan dipotong menjadi lingkaran</li>
                  </ul>
                </div>

                {profilePhotoFile && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-green-800 font-medium">
                      ✓ File: {profilePhotoFile.name}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      {(profilePhotoFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informasi Akun</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-slate-500">Role</Label>
                <p className="text-sm font-semibold text-slate-900">Administrator</p>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-slate-500">Status</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <p className="text-sm font-semibold text-slate-900">Active</p>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-slate-500">Terdaftar Sejak</Label>
                <p className="text-sm font-semibold text-slate-900">
                  10 Januari 2025
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
    </div>
  );
}
