# Dokumentasi Setup Project NestJS

## 1. Clone Repository dari Git

Untuk memulai, clone repository ke dalam folder lokal Anda menggunakan Git:

```bash
# Clone repository menggunakan git
$ git clone https://github.com/anggamys/jr-backend-test.git

# Masuk ke dalam folder project
$ cd jr-backend-test
```

---

## 2. Install Library yang Diperlukan

Pastikan Anda sudah menginstall **Node.js** dan **npm** atau **yarn**. Kemudian jalankan perintah berikut untuk menginstall dependencies project:

```bash
# Install dependency menggunakan npm
$ npm install

# Atau menggunakan yarn
$ yarn install
```

---

## 3. Konfigurasi Prisma

Prisma digunakan sebagai ORM untuk interaksi dengan database. Berikut adalah langkah-langkah konfigurasi Prisma:

### a. Membuat File `.env`

Buat file `.env` di root project, kemudian tambahkan konfigurasi berikut:

```env
DATABASE_URL="postgresql://<USERNAME>:<PASSWORD>@<HOST>:<PORT>/<DATABASE_NAME>"
JWT_SECRET=jr-backend-testing
```

Sesuaikan `<USERNAME>`, `<PASSWORD>`, `<HOST>`, `<PORT>`, dan `<DATABASE_NAME>` sesuai dengan informasi koneksi database Anda.

### b. Inisialisasi Prisma

Jika Anda belum memiliki file schema Prisma, jalankan perintah berikut untuk menginisialisasi Prisma:

```bash
$ npx prisma init
```

Perintah ini akan membuat file `prisma/schema.prisma` dan file konfigurasi Prisma lainnya.

---

## 4. Setup Database

### a. Pastikan Database Aktif

Pastikan database Anda sudah aktif dan dapat diakses sesuai dengan konfigurasi `DATABASE_URL` di file `.env`.

### b. Jalankan Migrasi Prisma

Untuk menjalankan migrasi dan mempersiapkan database, gunakan perintah berikut:

```bash
$ npx prisma migrate dev --name init
```

Perintah ini akan:
1. Membuat tabel-tabel sesuai dengan schema Prisma di database.
2. Menyimpan riwayat migrasi di folder `prisma/migrations`.

---

## 5. Menjalankan Aplikasi

Setelah semua konfigurasi selesai, jalankan aplikasi dengan perintah berikut:

```bash
# Menjalankan aplikasi dalam mode development
$ npm run start:dev

# Atau menggunakan yarn
$ yarn start:dev
```

Aplikasi akan berjalan di `http://localhost:<PORT>`. Secara default, port yang digunakan adalah `3000`. Anda dapat mengubahnya dengan menambahkan konfigurasi berikut di file `.env`:

```env
PORT=<PORT_NUMBER>
```

---

## 6. Setup Postman Testing

### a. Import Collection Postman

1. **Download file collection Postman**:  
   Unduh file collection Postman dari [tautan ini](https://drive.google.com/drive/folders/1D0GZihf8TuQS3PW8cd5RZ5pRs_EQuW8X?usp=sharing).

2. **Import file collection ke Postman**:
   - Buka aplikasi **Postman**.
   - Klik tombol **"Import"**.
   - Pilih file `.json` collection yang telah diunduh dan klik **Open**.

### b. Uji Endpoint

Setelah mengimpor collection, Anda dapat menggunakan Postman untuk menguji berbagai endpoint yang tersedia dalam aplikasi. Pastikan aplikasi Anda berjalan di port yang sesuai dengan yang terkonfigurasi di file `.env`.

---

Dengan mengikuti langkah-langkah di atas, Anda seharusnya dapat dengan mudah men-setup dan menjalankan aplikasi ini. Jika ada masalah, pastikan untuk memeriksa kembali konfigurasi di file `.env` dan pastikan database Anda sudah aktif.
