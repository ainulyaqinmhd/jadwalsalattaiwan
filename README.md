# 🌙 Jadwal Waktu Salat PCINU Taiwan

Aplikasi jadwal waktu salat otomatis yang disupervisi oleh **Lembaga Falakiyah NU (LFNU) Taiwan** untuk umat Muslim Indonesia dan seluruh Muslim di Taiwan.

## ✨ Fitur Utama

- **Jam Digital Real-Time**: Tampilan jam langsung yang diperbarui setiap detik dalam format 24 jam
- **Hitung Mundur Salat Berikutnya**: Menampilkan sisa waktu menuju salat berikutnya secara otomatis
- **Kartu Waktu Harian**: Menampilkan jadwal 7 waktu salat (Imsak, Subuh, Terbit, Dhuhur, Ashar, Maghrib, Isya) hari ini dengan tampilan kartu yang elegan
- **Tabel Jadwal Bulanan**: Tabel lengkap seluruh jadwal salat dalam sebulan yang dipilih
- **Pendeteksian Lokasi Otomatis**: Fitur GPS untuk mendeteksi lokasi pengguna secara real-time
- **Pemilihan Wilayah**: Dropdown untuk memilih dari 21 wilayah di Taiwan
- **Pemilihan Bulan & Tahun**: Kontrol untuk menampilkan jadwal salat pada bulan tertentu
- **Tampilan Responsif**: Desain yang sempurna di perangkat desktop, tablet, dan mobile

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

## 🔧 Teknologi

- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **API**: Aladhan API v1 (data astronomi)
- **Kalkulasi Astronomi**: Berbasis pada perhitungan Higonometri dan data satelit
- **Real-time Update**: JavaScript interval untuk jam dan hitung mundur
- **Responsif Design**: CSS Media Queries untuk mobile-first approach

## 📄 Struktur Kode

```html
- Hero Header: Banner judul dengan jam digital dan hitung mundur
- Kartu Jadwal Harian: 7 kartu waktu salat dengan highlight dinamis
- Kontrol: Tombol GPS, dropdown wilayah, pemilih bulan
- Tabel Jadwal: Tabel interaktif dengan baris hari ini disorot
- Footer: Informasi teknis falakiyah dan catatan penting
- Script: Logika JavaScript untuk kalkulasi waktu dan API calls
```

## 🌐 Sumber Data

Data jadwal salat diperoleh dari **Aladhan REST API** yang menggunakan:
- Koordinat geografis (latitude & longitude) setiap wilayah
- Algoritma perhitungan astronomi terpercaya
- Penyesuaian lokal (tune) sesuai kriteria LFNU

## 📱 Pengalaman Pengguna

**Interface yang User-Friendly**:
- Tema warna NU (hijau zamrud + emas)
- Animasi smooth untuk transisi dan highlight
- Shadow & border yang elegan untuk depth
- Typography yang nyaman dibaca dengan font Inter & Segoe UI

**Indikator Visual**:
- Salat aktif ditampilkan dengan latar hijau dan border emas
- Hari ini dalam tabel disorot dengan background transparan hijau
- Loading state untuk menunjukkan proses sinkronisasi data

## 💡 Catatan Penting

Jadwal salat ini disusun dengan teliti untuk:
- ✅ Menemani ibadah para Nahdliyin
- ✅ Mempermudah salat bagi Muslim Indonesia yang merantau di Taiwan
- ✅ Menjaga standardisasi waktu sesuai ketentuan NU

## 📅 Versi & Copyright

© 2026 **PCINU Taiwan** - _Dilindungi doa dan niat baik._