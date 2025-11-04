# **Product Requirements Document (PRD) Canvas: Piksel Jual**

**Visi Produk:** Menjadi platform marketplace yang paling sederhana bagi fotografer untuk menjual foto secara langsung kepada subjeknya dengan model pengalihan hak cipta penuh.

### **1\. Masalah yang Diselesaikan (Problem)**

* **Untuk Penjual (Fotografer):**  
  * Tidak ada platform khusus yang mudah untuk menjual hasil foto event langsung ke ratusan subjek yang berbeda.  
  * Proses transaksi (mengirim pratinjau, menagih pembayaran, mengirim file asli) secara manual sangat memakan waktu dan tidak efisien.  
* **Untuk Pembeli (Subjek Foto):**  
  * Sulit untuk menemukan dan mendapatkan file foto diri berkualitas tinggi dari seorang fotografer setelah sebuah event selesai.  
  * Tidak ada cara yang terpusat dan terpercaya untuk membeli foto tersebut.

### **2\. Target Pengguna (User Personas)**

* **Penjual (Prioritas Utama):**  
  * **Siapa:** Fotografer event, fotografer freelance, penghobi fotografi yang meliput acara (wisuda, konser, lomba lari, seminar).  
  * **Kebutuhan:** Platform yang cepat, proses unggah massal yang mudah, kontrol 100% atas harga, dan proses pembayaran yang otomatis.  
* **Pembeli:**  
  * **Siapa:** Peserta event, wisudawan, atlet, pengunjung konser, atau siapa saja yang menjadi subjek foto. Umumnya bukan seorang profesional di bidang kreatif.  
  * **Kebutuhan:** Cara yang mudah untuk menemukan foto dirinya, pratinjau yang jelas (meski berkualitas rendah), proses pembelian yang aman dan sederhana.

### **3\. Alur Pengguna Utama (User Journey)**

1. **Alur Penjual:**  
   * Daftar/Login \-\> Buat Profil/Akun \-\> Unggah Foto \-\> Set Harga per Foto \-\> Promosikan Nama Akun di Event \-\> Terima Notifikasi Penjualan \-\> Terima Pembayaran.  
2. **Alur Pembeli:**  
   * Kunjungi Website \-\> **Cari Nama Akun Penjual** \-\> Lihat Galeri Pratinjau (resolusi rendah \+ watermark) \-\> Pilih Foto \-\> Tambah ke Keranjang \-\> Checkout & Bayar \-\> Akses "Galeri Saya" \-\> **Unduh Foto Kualitas Asli (tanpa watermark)**.

### **4\. Fitur Utama (Key Features)**

| Kategori | Fitur | Deskripsi Singkat |
| :---- | :---- | :---- |
| **Platform Inti** | Registrasi & Login | Sistem akun terpisah untuk Penjual dan Pembeli. |
|  | Pencarian | **Pencarian berdasarkan nama akun Penjual** sebagai metode utama. |
| **Fitur Penjual** | Unggah Foto | Sistem unggah tunggal atau massal dengan kolom untuk judul, deskripsi, dan **harga yang ditentukan bebas oleh penjual**. |
|  | Pemrosesan Otomatis | Saat diunggah, sistem otomatis membuat versi pratinjau (resolusi rendah \+ watermark nama penjual). File asli disimpan terpisah. |
|  | Dashboard Penjual | Halaman untuk mengelola foto yang diunggah, melihat riwayat penjualan, dan melacak pendapatan. |
| **Fitur Pembeli** | Galeri & Pratinjau | Menampilkan foto dengan kualitas rendah dan watermark untuk proteksi. |
|  | Keranjang Belanja | Sistem untuk menampung beberapa foto dari satu atau lebih penjual sebelum melakukan pembayaran. |
|  | Pembayaran | Integrasi dengan Payment Gateway (e.g., Midtrans, Xendit) untuk memproses transaksi. |
|  | Galeri Pembelian | Halaman pribadi berisi semua foto yang telah dibeli, dalam kualitas asli dan tanpa watermark, dengan tombol unduh. |
| **Keamanan** | Pengiriman File Aman | Tombol unduh akan menghasilkan **URL aman berbatas waktu (Signed URL)** untuk mencegah penyebaran link file asli. |

### **5\. Asumsi & Risiko Kritis**

* **Asumsi Utama:**  
  1. Penjual sepenuhnya sadar dan setuju dengan model **"Jual Putus" (pengalihan hak cipta penuh)**.  
  2. Penjual akan aktif mempromosikan nama akun mereka di lapangan, sehingga pembeli tahu apa yang harus dicari.  
  3. Akan selalu ada pembeli yang bersedia membayar, terlepas dari variasi kualitas foto yang ada di platform.  
* **Risiko:**  
  1. **Risiko Hukum:** Potensi sengketa di masa depan karena penjual merasa tidak memahami bahwa mereka telah menyerahkan seluruh hak cipta atas karya mereka.  
  2. **Risiko Pasar ("Race to the Bottom"):** Tanpa standar kualitas, penjual amatir dapat menetapkan harga sangat rendah, menghancurkan nilai pasar, dan membuat fotografer profesional enggan bergabung.  
  3. **Risiko Ketergantungan:** Pertumbuhan platform sangat bergantung pada usaha promosi dari masing-masing penjual, bukan dari efek jaringan platform itu sendiri.

### **6\. Model Monetisasi**

* **Biaya Transaksi (Komisi):** Platform akan mengambil potongan (misalnya, 10-20%) dari total nilai setiap transaksi penjualan yang berhasil. Biaya ini transparan dan ditampilkan kepada penjual.

### **7\. Metrik Kesuksesan (Success Metrics)**

* Jumlah Penjual Aktif (yang mengunggah foto dalam 30 hari terakhir).  
* Jumlah Pembeli yang Melakukan Transaksi.  
* Total Nilai Transaksi (Gross Merchandise Volume \- GMV) per bulan.  
* Jumlah Foto yang Berhasil Terjual.