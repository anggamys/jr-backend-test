# Dokumentasi Setup Project NestJS

## 1. Clone Repository dari Git

```bash
# Clone repository menggunakan git
$ git clone https://github.com/anggamys/jr-backend-test.git

# Masuk ke dalam folder project
$ cd jr-backend-test
```

---

## 2. Install Library yang Diperlukan

Pastikan Anda sudah menginstall Node.js dan npm/yarn. Kemudian jalankan perintah berikut untuk menginstall dependency project:

```bash
# Install dependency menggunakan npm
$ npm install

# Atau menggunakan yarn
$ yarn install
```

---

## 3. Konfigurasi Prisma

Prisma digunakan sebagai ORM dalam project ini. Untuk konfigurasi Prisma:

### a. Buat File `.env`
Buat file `.env` di root project, kemudian tambahkan konfigurasi berikut:

```env
DATABASE_URL="postgresql://<USERNAME>:<PASSWORD>@<HOST>:<PORT>/<DATABASE_NAME>"
JWT_SECRET=jr-backend-testing
```

### b. Inisialisasi Prisma
Jika belum ada file Prisma schema, jalankan perintah berikut untuk menginisialisasi Prisma:

```bash
$ npx prisma init
```

---

## 4. Setup Database

### a. Pastikan Database Aktif
Pastikan database Anda aktif dan dapat diakses sesuai konfigurasi `DATABASE_URL` di file `.env`.

### b. Jalankan Migrasi Prisma
Gunakan perintah berikut untuk menjalankan migrasi database:

```bash
$ npx prisma migrate dev --name init
```

Perintah ini akan:
1. Membuat tabel-tabel sesuai schema di database.
2. Menyimpan riwayat migrasi.

---

## 5. Menjalankan Aplikasi

Gunakan perintah berikut untuk menjalankan aplikasi:

```bash
# Menjalankan aplikasi dalam mode development
$ npm run start:dev

# Atau menggunakan yarn
$ yarn start:dev
```

Aplikasi akan berjalan di `http://localhost:<PORT>`. Secara default, port adalah `3000`. Anda dapat mengubahnya di file `.env` dengan menambahkan:

```env
PORT=<PORT_NUMBER>
```

---
Berikut adalah dokumentasi yang telah diperbarui dan dirapikan:

---

## 6. Setup Postman Testing

### a. Import Collection Postman

1. **Download file collection Postman**:
   Unduh file collection Postman dari [tautan ini](https://drive.google.com/drive/folders/1RduJlKe6uf7FfA8pKzLA9OGQsUHj6Qgc?usp=sharing).

2. **Import file collection** ke Postman:
   - Buka Postman.
   - Klik tombol **"Import"**.
   - Pilih file `.json` collection yang telah diunduh.

------

### b. Uji Endpoint

Gunakan collection yang sudah diimpor untuk menguji endpoint di aplikasi Anda.

------
