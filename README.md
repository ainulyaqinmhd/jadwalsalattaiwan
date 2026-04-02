# 🌙 Jadwal Waktu Salat PCINU Taiwan

Aplikasi jadwal waktu salat otomatis yang disupervisi oleh **Lembaga Falakiyah NU (LFNU) Taiwan** untuk umat Muslim Indonesia dan seluruh Muslim di Taiwan. Dirancang dengan antarmuka yang elegan, responsif, dan kaya fitur.

## ✨ Fitur Utama

- **Jam Digital Real-Time & Hitung Mundur**: Tampilan jam langsung yang diperbarui setiap detik serta sisa waktu menuju waktu salat berikutnya secara otomatis.
- **Kartu Waktu Harian**: Menampilkan jadwal 7 waktu salat (Imsak, Subuh, Terbit, Dhuhur, Ashar, Maghrib, Isya) hari ini dengan desain kartu interaktif yang menonjolkan waktu salat berikutnya.
- **Kalender Ganda (Masehi & Hijriah)**: Pengguna dapat beralih antara tampilan jadwal bulanan berbasis kalender Masehi maupun kalender Hijriah secara mulus.
- **Navigasi Bulan Hijriah**: Dilengkapi dengan pemilih bulan dan tahun khusus Hijriah menggunakan ejaan resmi Bahasa Indonesia (Muharam, Safar, dll).
- **Pendeteksian Lokasi Otomatis**: Fitur fungsi GPS untuk mendeteksi koordinat perangkat secara real-time.
- **Pemilihan Wilayah Lengkap**: Dropdown untuk memilih dari 21 wilayah/kota di seluruh Taiwan.
- **Koreksi Tanggal Hijriah**: Mendukung penyesuaian kalender Hijriah lokal untuk memastikan keakuratan hari.
- **Tampilan Premium & Responsif**: Mengusung tema khas Nahdlatul Ulama yang minimalis, modern, dengan sentuhan *glassmorphism* dan gradien halus, dioptimalkan sempurna untuk perangkat seluler.

## 📍 Cakupan Wilayah

Aplikasi mencakup 21 wilayah di Taiwan:
- **Utara**: Keelung, Guanyin, Taipei, Taoyuan, Daxi Yilan, Hsinchu, Yilan, Miaoli
- **Tengah**: Taichung, Changhua, Hualien, Nantou, Yunlin
- **Selatan**: Penghu, Chiayi, Tainan, Taitung, Pingtung, Kaohsiung, Tongkang
- **Pulau Khusus**: Kinmen

## ⚙️ Spesifikasi Teknis Falakiyah

Perhitungan jadwal salat merujuk pada standar otentik **Lembaga Falakiyah Pengurus Besar Nahdlatul Ulama**:

| Kriteria | Nilai |
|----------|-------|
| **Metode Kalkulasi** | Method 20 (LF-PBNU) |
| **Sudut Subuh** | -20° di bawah ufuk |
| **Sudut Isya'** | -18° di bawah ufuk |
| **Ikhtiyat (Kehati-hatian)** | 2 menit penambahan waktu |
| **Waktu Imsak** | 10 menit sebelum Subuh |
| **Metode Ashar** | Jumhur Ulama (Hambali, Maliki, Syafi'i) |

## 🔧 Teknologi & Arsitektur

Proyek ini dibangun menggunakan pendekatan arsitektur modular (*Vanilla Stack*):
- **Frontend**: HTML5, CSS3, JavaScript murni.
- **Sistem Modular**: Terbagi dalam `index.html`, `css/style.css`, `js/app.js`, dan `js/locations.js`.
- **API Data**: Menggunakan [Aladhan REST API v1](https://aladhan.com/prayer-api) untuk pengambilan data astronomi real-time, baik endpoint kalender Masehi mapun kalender Hijriah.
- **Desain Modern**: Memanfaatkan variabel CSS (*CSS Custom Properties*), *Flexbox/Grid*, dan *Media Queries* untuk menjamin konsistensi visual di berbagai ukuran layar.

## 📱 Pengalaman Pengguna

**Antarmuka yang Elegan**:
- Tema warna NU (hijau zamrud, putih bersih, dan aksen emas).
- Efek kaca (*glassmorphism*) semi-transparan untuk menonjolkan elemen di atas latar belakang.
- Transisi dan animasi halus untuk interaksi (*hover state*, *active schedule highlight*).

**Indikator Visual**:
- Waktu salat yang sedang/akan tiba disorot dengan warna kontras.
- Integrasi penanda hari ini ("Today") pada tabel bulanan dengan baris berwarna solid, baik pada mode Masehi maupun Hijriah.
- Status pemuatan (*loading indicator*) yang komunikatif setiap penyelarasan API baru.

## 💡 Catatan Penting

Jadwal salat ini disusun secara presisi untuk:
- ✅ Menjadi panduan utama ibadah para Nahdliyin di luar negeri.
- ✅ Mempermudah ibadah para pahlawan devisa, pelajar, dan ekspatriat Muslim di Taiwan.
- ✅ Mempertahankan tradisi standardisasi waktu sesuai kebiasaan ulama Nusantara.

## 📅 Versi & Copyright

© 2026 **PCINU Taiwan** & **[@ainulyaqinmhd](https://github.com/ainulyaqinmhd)** - _Dilindungi doa dan niat baik._