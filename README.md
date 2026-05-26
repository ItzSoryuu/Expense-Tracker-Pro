# Expense Tracker Pro

Aplikasi pelacak pengeluaran (Expense Tracker) offline sederhana namun canggih, dibangun menggunakan kombinasi modern backend Flask dan frontend HTML/CSS/JS vanilla (Single Page Application). Data disimpan dengan aman secara lokal dalam format file JSON, memudahkan portabilitas tanpa perlu setup database yang rumit.

---

## Fitur Utama

- **Penyimpanan Lokal (Offline-first)**: Menggunakan file database berbasis JSON (`backend/database/`).
- **Kelola Transaksi Lengkap (CRUD)**:
  - Tambah transaksi baru dengan nama, kategori, jumlah, deskripsi, dan tanggal.
  - Edit transaksi secara langsung di baris tabel (Inline Edit).
  - Hapus transaksi dengan konfirmasi.
- **Visualisasi & Statistik**:
  - Filter rentang waktu yang dinamis (Mingguan, Bulanan, & Semua).
  - Perhitungan total pengeluaran otomatis secara real-time.
- **Desain Responsif & Tema**:
  - Dukungan penuh untuk Mode Terang (Light Mode) dan Mode Gelap (Dark Mode).
  - Sinkronisasi tema otomatis dengan backend dan browser local storage.
- **Otomatisasi Browser**: Aplikasi akan secara otomatis membuka browser Anda saat server Flask dijalankan.

---

## Struktur Folder Proyek

```text
Expense-Tracker-Pro/
│
├── run.py                     # Entry point utama untuk menjalankan server & browser
├── PSEUDOCODE.md              # Algoritma dan logika dasar sistem
├── README.md                  # Dokumentasi proyek (file ini)
│
├── backend/                   # Folder Logika Backend (Python & Flask)
│   ├── app.py                 # Inisialisasi aplikasi Flask dan routing statis
│   ├── database/              # Penyimpanan data lokal
│   │   ├── transactions.json  # Data transaksi tersimpan (JSON)
│   │   ├── theme.json         # Konfigurasi preferensi tema pengguna
│   │   └── transactions_store.py # Helper CRUD dan manajemen file JSON
│   └── routes/                # Blueprint/Endpoints API
│       ├── health.py          # API status server
│       ├── statistics.py      # API kalkulasi statistik & agregasi
│       ├── theme.py           # API get/post tema
│       └── transactions.py    # API CRUD transaksi
│
└── frontend/                  # Folder Tampilan Frontend (HTML, CSS, JS)
    ├── index.html             # Struktur halaman web (SPA)
    ├── css/
    │   └── style.css          # Desain antarmuka & skema warna (Light/Dark)
    └── js/
        └── app.js             # Logika interaksi UI, fetch API, & manipulasi DOM
```

---

## Panduan Memulai

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi di komputer lokal Anda:

### Persyaratan Sistem

- **Python** (versi 3.8 atau yang lebih baru)
- Peramban web (**Google Chrome, Firefox, Edge, atau Safari**)

### Langkah-Langkah Instalasi

1. **Unduh atau Kloning Proyek**
   Masuk ke direktori utama proyek:

   ```bash
   cd Expense-Tracker-Pro
   ```

2. **Instalasi Dependensi**
   Aplikasi ini hanya membutuhkan Flask sebagai pustaka eksternal. Instal menggunakan `pip`:

   ```bash
   pip install Flask
   ```

3. **Jalankan Aplikasi**
   Jalankan file entry point `run.py`:

   ```bash
   python run.py
   ```

4. **Akses Aplikasi**
   Setelah dijalankan, peramban web Anda akan terbuka secara otomatis mengarah ke alamat:
   [http://127.0.0.1:5000/](http://127.0.0.1:5000/)

---

## Dokumentasi API Endpoints

Semua endpoint API memiliki basis URL: `http://127.0.0.1:5000/api`

### 1. Status Server (Health Check)

- **Endpoint**: `GET /api/health`
- **Deskripsi**: Memeriksa apakah backend berjalan dengan normal.

### 2. Pengaturan Tema (Theme)

- **Mendapatkan Tema Aktif**: `GET /api/theme`
- **Mengubah Tema**: `POST /api/theme`
  - **Payload (JSON)**:
    ```json
    { "theme": "dark" }
    ```
    _(Gunakan `"normal"` untuk Light Mode atau `"dark"` untuk Dark Mode)_

### 3. Manajemen Transaksi (Transactions)

- **Dapatkan Semua Transaksi**: `GET /api/transactions`
- **Tambah Transaksi Baru**: `POST /api/transactions`
  - **Payload (JSON)**:
    ```json
    {
      "name": "Membeli Kopi",
      "category": "Makanan",
      "amount": 25000,
      "description": "Kopi susu gula aren di kafe",
      "date": "26-05-2026"
    }
    ```
- **Perbarui Transaksi (Berdasarkan Index)**: `PUT /api/transactions/<index>`
  - **Payload (JSON)**: Menggunakan struktur data yang sama dengan POST.
- **Hapus Transaksi (Berdasarkan Index)**: `DELETE /api/transactions/<index>`

### 4. Analitik & Statistik (Statistics)

- **Endpoint**: `GET /api/statistics?period=weekly|monthly|all`
- **Deskripsi**: Mendapatkan ringkasan total pengeluaran dan akumulasi per kategori berdasarkan periode waktu.

---

## Catatan Teknis & Aturan Validasi

- **Format Tanggal**: Tanggal transaksi harus menggunakan format `DD-MM-YYYY`. Jika dikosongkan saat input melalui form, sistem otomatis mengisi dengan tanggal hari ini.
- **Validasi Input**:
  - Jumlah (`amount`) harus berupa angka bulat (integer) yang lebih besar dari `0`.
  - Nama (`name`) dan Kategori (`category`) wajib diisi.
  - Jika Deskripsi (`description`) dikosongkan, sistem akan mengisinya secara otomatis dengan tanda hubung `"-"`.
- **Penanganan Error**: Jika berkas data database (`transactions.json`) hilang atau mengalami kerusakan format, sistem akan secara otomatis memulihkannya dengan mengembalikan array kosong `[]` tanpa menghentikan aplikasi.

---

## Lisensi

Proyek ini bersifat open-source dan bebas digunakan untuk tujuan pembelajaran, modifikasi, maupun proyek pribadi Anda.
