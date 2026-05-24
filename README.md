# Expense Tracker Pro

Aplikasi **expense tracker** offline sederhana dengan:
- Backend **Flask** (API JSON)
- Frontend **HTML/CSS/JS** (single-page app)
- Penyimpanan data berbasis file **JSON** di folder `backend/database/`

---

## Struktur Project

- `run.py`
  - Entry point untuk menjalankan server dan membuka browser otomatis.
- `backend/app.py`
  - Membuat & konfigurasi Flask app, menghubungkan blueprint API, serta melayani `frontend/index.html`.
- `backend/routes/`
  - `health.py` : endpoint status server
  - `theme.py` : baca/ubah tema (`normal`/`dark`)
  - `transactions.py` : CRUD transaksi
  - `statistics.py` : ringkasan total & breakdown kategori berdasarkan periode
- `backend/database/`
  - `transactions.json` : data transaksi
  - `theme.json` : preferensi tema
  - `transactions_store.py` : helper load/save, validasi payload, dan operasi CRUD berbasis index
- `frontend/`
  - `index.html` : layout UI + view (dashboard/add/statistics)
  - `css/style.css` : style (light/dark)
  - `js/app.js` : logic frontend, fetch API, render tabel, theme toggle

---

## Cara Menjalankan

1. Pastikan Python terinstall.
2. Masuk ke folder project ini.
3. Instal dependency (jika belum):
   ```bash
   pip install flask
   ```
4. Jalankan:
   ```bash
   python run.py
   ```
5. Buka browser pada:
   - `http://127.0.0.1:5000/`

> Server berjalan di `127.0.0.1` dan data tersimpan di JSON lokal.

---

## API Endpoints

Base URL: `http://127.0.0.1:5000/api`

### Health
- `GET /api/health`

### Theme
- `GET /api/theme`
- `POST /api/theme`
  - Body:
    ```json
    { "theme": "normal" }
    ```
  - atau
    ```json
    { "theme": "dark" }
    ```

### Transactions
- `GET /api/transactions`
- `POST /api/transactions`
  - Body:
    ```json
    {
      "name": "Jajan",
      "category": "Food",
      "amount": 25000,
      "description": "Jajan hari sabtu",
      "date": "18-05-2026"
    }
    ```
- `PUT /api/transactions/<index>`
- `DELETE /api/transactions/<index>`

> Identitas transaksi dipakai sebagai **index** pada array di `transactions.json`.

### Statistics
- `GET /api/statistics?period=weekly|monthly|all`
  - Output contoh:
    ```json
    {
      "period": "weekly",
      "total": 123000,
      "pie": {
        "labels": ["Food", "Transport"],
        "values": [90000, 33000]
      }
    }
    ```

---

## Catatan Implementasi

- Jika `transactions.json` belum ada atau rusak, aplikasi akan mengembalikan list transaksi kosong.
- Validasi transaksi:
  - `amount` harus integer > 0
  - `name` dan `category` wajib diisi (tidak boleh kosong)
  - `description` bersifat opsional (jika kosong, otomatis diisi dengan `"-"`)
  - `date` dipaksa format `DD-MM-YYYY` (di payload ini contoh hanya format tampilan)

- Tema disimpan di `backend/database/theme.json` dan juga disimpan sementara di `localStorage` frontend.

---

## Pengembangan Lanjutan (Opsional)

Potensi perbaikan yang bisa dilakukan:
- Menambahkan chart pie di frontend (endpoint sudah menyediakan data)
- Mengganti identitas transaksi dari index menjadi ID unik (lebih aman saat delete)

---

## Lisensi

Project ini bebas digunakan untuk kebutuhan belajar/proyek kecil.
