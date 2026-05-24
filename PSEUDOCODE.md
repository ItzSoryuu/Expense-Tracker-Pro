# Pseudocode: Expense Tracker Pro

## 1. Global & Data Storage
STORAGE: File 'transactions.json' (Array of Objects)
THEME_STORAGE: File 'theme.json' dan 'localStorage'

## 2. Server-Side Logic (Backend)

### ALGORITMA: Validasi Transaksi
INPUT: payload (name, category, amount, description, date)
1. JIKA field wajib (name, category, amount) kosong atau tidak ada: KEMBALIKAN Error 400
2. JIKA amount BUKAN integer ATAU amount <= 0: KEMBALIKAN Error 400
3. JIKA description kosong ATAU tidak ada: SET description = "-"
4. JIKA date kosong: SET date = hari_ini (DD-MM-YYYY)
5. JIKA date TIDAK valid formatnya: KEMBALIKAN Error 400
6. KEMBALIKAN objek Transaksi yang sudah divalidasi

### ALGORITMA: Kalkulasi Statistik
INPUT: period ('weekly', 'monthly', 'all')
1. LOAD semua transaksi dari JSON
2. TENTUKAN rentang tanggal (start_date, end_date):
   - JIKA 'weekly': 7 hari terakhir (today - 6 hari) s/d hari ini
   - JIKA 'monthly': tanggal 1 bulan ini s/d hari terakhir bulan ini
   - JIKA 'all': tanggal minimum s/d hari ini
3. FILTER transaksi:
   - LOOP setiap transaksi:
     - JIKA (start_date <= transaksi.date <= end_date): MASUKKAN ke list_filtered
4. HITUNG Total: total = SUM(transaksi.amount) di list_filtered
5. AGREGASI Kategori:
   - LOOP setiap transaksi di list_filtered:
     - TAMBAHKAN amount ke kelompok kategori yang sesuai (category_totals)
6. KEMBALIKAN (total, list_filtered, category_totals)

---

## 3. Client-Side Logic (Frontend)

### ALGORITMA: Inisialisasi Aplikasi (init)
1. LOAD tema dari API/localStorage dan TERAPKAN ke CSS
2. SET View default ke 'dashboard'
3. SET Filter periode dashboard ke 'weekly'
4. JALANKAN refreshDashboard()

### ALGORITMA: Refresh Dashboard
1. PANGGIL API GET /transactions
2. RENDERING Tabel Transaksi:
   - LOOP transaksi: BUAT baris tabel (Nama, Kategori, Tanggal, Amount)
   - HITUNG total saldo global
3. PANGGIL API GET /statistics (periode aktif)
4. UPDATE ringkasan total di UI

### ALGORITMA: Tambah Transaksi Baru
1. AMBIL data dari Form UI
2. FORMAT tanggal ke 'DD-MM-YYYY'
3. PANGGIL API POST /transactions (body data)
4. JIKA sukses:
   - Tampilkan Toast sukses
   - Reset Form
   - Ganti View ke 'dashboard'
   - Jalankan refreshDashboard()
5. JIKA gagal: Tampilkan pesan error

### ALGORITMA: Ubah Transaksi (Update via Inline Edit)
1. AMBIL index transaksi yang dipilih
2. MENGUBAH baris tabel (tr) pada index tersebut menjadi mode edit (Inline Edit)
   - Tampilkan input fields di tiap kolom (Nama, Kategori, Tanggal, Jumlah, Deskripsi) terisi dengan data yang ada
   - Sediakan tombol 'Simpan' dan 'Batal' di kolom perintah
3. JIKA pengguna menekan tombol 'Batal' atau tombol 'Escape':
   - Batalkan edit dan kembalikan rendering baris tabel ke kondisi normal
4. JIKA pengguna menekan tombol 'Simpan' atau tombol 'Enter' pada salah satu input:
   - Ambil data dari semua input field di baris tersebut
   - VALIDASI input di frontend (nama, kategori, jumlah)
   - PANGGIL API PUT /transactions/{index} (body data baru, description opsional default ke "-")
   - JIKA sukses: REFRESH Dashboard dan tutup mode edit

### ALGORITMA: Hapus Transaksi (Delete)
1. TAMPILKAN konfirmasi hapus
2. JIKA dikonfirmasi:
   - PANGGIL API DELETE /transactions/{index}
   - JIKA sukses: REFRESH Dashboard

---

## 4. Keamanan & Validasi Data
- Sanitasi: Semua output teks menggunakan `escapeText` (textContent) untuk mencegah XSS.
- Integritas: Data disimpan dalam format JSON terindentasi untuk memudahkan pembacaan manual (human-readable).
- Fallback: Jika file JSON rusak atau kosong, sistem mengembalikan list kosong (array `[]`), bukan error pecah.

## 5. Konsep Identitas Data
Saat ini, identitas unik transaksi menggunakan **Array Index**.
PROSES:
1. Frontend mengirim index (0, 1, 2...)
2. Backend mencari elemen ke-index pada list
3. Operasi dilakukan (Update/Delete)
4. List disimpan kembali ke file
*Catatan: Metode ini efisien untuk skala kecil, namun berisiko jika ada operasi konkuren.*
