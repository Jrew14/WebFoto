"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  ShieldCheck,
  User,
  Phone,
  Mail,
  KeyRound,
} from "lucide-react";

interface ProfileResponse {
  success: boolean;
  profile: {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
  };
}

export default function UserProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, refreshUser } = useAuth();

  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated]);

  const loadProfile = async () => {
    try {
      setProfileLoading(true);
      setErrorMessage(null);

      const response = await fetch("/api/user/profile", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data: ProfileResponse = await response.json();
      setFullName(data.profile.fullName ?? "");
      setEmail(data.profile.email ?? "");
      setPhone(data.profile.phone ?? "");
    } catch (error) {
      console.error("[Profile Page] failed to load profile:", error);
      setErrorMessage("Tidak dapat memuat profil. Coba muat ulang halaman.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal memperbarui profil");
      }

      setInfoMessage("Profil berhasil diperbarui.");
      refreshUser();
    } catch (error) {
      console.error("[Profile Page] update error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal memperbarui profil."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage("Password baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi password tidak cocok.");
      return;
    }

    try {
      setSavingPassword(true);
      const response = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal memperbarui password.");
      }

      setInfoMessage("Password berhasil diperbarui.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("[Profile Page] password update error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal memperbarui password."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#48CAE4]" />
      </div>
    );
  }

  const joinedAtText = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 p-4 md:p-10">
      <div className="max-w-6xl mx-auto space-y-7">
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
          <CardHeader className="pb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-[#48CAE4]/20 text-[#48CAE4] flex items-center justify-center text-2xl font-semibold">
                  {fullName ? fullName.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-7 h-7 text-[#48CAE4]" />
                    Profil Pengguna
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600 mt-1">
                    Perbarui data personal, nomor WhatsApp, dan keamanan akun Anda.
                  </CardDescription>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 rounded-xl px-6 py-4 border border-slate-100">
                <div>
                  <p className="text-slate-500">Status</p>
                  <p className="font-semibold text-emerald-600 flex items-center gap-2">
                    <span className="block h-2 w-2 rounded-full bg-emerald-500" />
                    Aktif
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Bergabung Sejak</p>
                  <p className="font-semibold text-slate-800">
                    {joinedAtText ?? "-"}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {infoMessage && (
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-700">
            <AlertDescription>{infoMessage}</AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 shadow-md border border-slate-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-[#48CAE4]" />
                Informasi Akun
              </CardTitle>
              <CardDescription>
                Perbarui nama lengkap dan nomor WhatsApp yang digunakan untuk notifikasi pembayaran.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-5 md:grid-cols-2"
                onSubmit={handleProfileSave}
              >
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Nama lengkap"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Email</Label>
                  <Input
                    value={email}
                    disabled
                    className="bg-slate-100 text-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor WhatsApp</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Contoh: +62 812-3456-7890"
                  />
                  <p className="text-xs text-slate-500">
                    Nomor ini akan menerima invoice dan status pesanan.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Ringkasan Akun</Label>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#48CAE4]" />
                      <span>{email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Phone className="w-4 h-4 text-[#48CAE4]" />
                      <span>{phone || "Belum diisi"}</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <Button
                    type="submit"
                    className="bg-[#48CAE4] hover:bg-[#3AAFCE]"
                    disabled={savingProfile}
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-md border border-slate-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-slate-900">
                Informasi Akun
              </CardTitle>
              <CardDescription>
                Detail singkat profil kamu untuk referensi cepat.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
              <div>
                <p className="text-slate-500">Nama Lengkap</p>
                <p className="font-semibold text-slate-900 mt-1">{fullName}</p>
              </div>
              <div>
                <p className="text-slate-500">Email</p>
                <p className="font-semibold text-slate-900 mt-1">{email}</p>
              </div>
              <div>
                <p className="text-slate-500">Nomor WhatsApp</p>
                <p className="font-semibold text-slate-900 mt-1">
                  {phone || "Belum diisi"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md border border-slate-100">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#48CAE4]" />
              Keamanan Akun
            </CardTitle>
            <CardDescription>
              Perbarui password secara berkala untuk menjaga keamanan akun.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-5 md:grid-cols-2" onSubmit={handlePasswordUpdate}>
              <div className="space-y-2">
                <Label htmlFor="new-password">Password Baru</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Ulangi password baru"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button
                  type="submit"
                  variant="outline"
                  disabled={savingPassword}
                >
                  {savingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memperbarui...
                    </>
                  ) : (
                    "Perbarui Password"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
