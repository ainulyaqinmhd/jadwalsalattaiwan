const translations = {
    // --- Meta & Header ---
    "page_title": { id: "Jadwal Sholat Otomatis - PCINU Taiwan", en: "Automatic Prayer Schedule - PCINU Taiwan" },
    "page_desc": { 
        id: "Jadwal & waktu sholat untuk umat Muslim Indonesia di Taiwan, disupervisi oleh Lembaga Falakiyah NU (LFNU) Taiwan.", 
        en: "Prayer schedule & timings for Indonesian Muslims in Taiwan, supervised by the Nahdlatul Ulama Falakiyah Institution (LFNU) Taiwan." 
    },
    "hero_badge": { id: "Jadwal & waktu sholat", en: "Prayer schedule & timings" },
    "hero_supervised": { id: "Disupervisi oleh Lembaga Falakiyah NU (LFNU) Taiwan", en: "Supervised by the Nahdlatul Ulama Falakiyah Institution (LFNU) Taiwan" },
    "hero_loading": { id: "Memuat tanggal...", en: "Loading date..." },
    "hero_calc": { id: "Mengkalkulasi waktu astronomi...", en: "Calculating astronomical time..." },
    
    // --- Controls ---
    "btn_gps": { id: "Gunakan GPS", en: "Use GPS" },
    "label_city": { id: "Wilayah", en: "Region" },
    "label_masehi": { id: "Bulan & Tahun Masehi", en: "Gregorian Month & Year" },
    "label_hijri": { id: "Bulan Hijriah", en: "Hijri Month" },
    "msg_sync": { id: "Menyelaraskan data...", en: "Synchronizing data..." },
    
    // --- Table Actions ---
    "section_table": { id: "Jadwal Bulanan", en: "Monthly Schedule" },
    "btn_masehi": { id: "Masehi", en: "Gregorian" },
    "btn_hijriah": { id: "Hijriah", en: "Hijri" },
    "btn_excel": { id: "Excel", en: "Excel" },
    "btn_poster": { id: "Poster", en: "Poster" },
    
    // --- Table Headers ---
    "th_date_m": { id: "Tgl", en: "Date" },
    "th_date_h": { id: "Hijri", en: "Hijri" },
    "th_day": { id: "Hari", en: "Day" },
    "th_imsak": { id: "Imsak", en: "Imsak" },
    "th_fajr": { id: "Subuh", en: "Fajr" },
    "th_sunrise": { id: "Terbit", en: "Sunrise" },
    "th_dhuhr": { id: "Dhuhur", en: "Dhuhr" },
    "th_asr": { id: "Ashar", en: "Asr" },
    "th_maghrib": { id: "Maghrib", en: "Maghrib" },
    "th_isha": { id: "Isya", en: "Isha" },
    
    // --- Prayers (for cards and countdown) ---
    "prayer_imsak": { id: "Imsak", en: "Imsak" },
    "prayer_fajr": { id: "Subuh", en: "Fajr" },
    "prayer_sunrise": { id: "Terbit", en: "Sunrise" },
    "prayer_dhuhr": { id: "Dhuhur", en: "Dhuhr" },
    "prayer_asr": { id: "Ashar", en: "Asr" },
    "prayer_maghrib": { id: "Maghrib", en: "Maghrib" },
    "prayer_isha": { id: "Isya", en: "Isha" },

    // --- Footer ---
    "footer_greeting_title": { id: "Semoga Membawa Keberkahan", en: "May it Bring Blessings" },
    "footer_greeting_desc": { 
        id: "Jadwal sholat ini disusun dengan teliti untuk menemani dan mempermudah ibadah para Nahdliyin serta seluruh umat Muslim Indonesia yang sedang merantau di penjuru Formosa.", 
        en: "This prayer schedule has been meticulously compiled to accompany and facilitate the worship of Nahdliyin and all Indonesian Muslims residing across Formosa." 
    },
    "footer_note_title": { id: "Catatan Falakiyah & Panduan Jadwal", en: "Astronomical Notes & Schedule Guide" },
    "note_1_title": { id: "Kriteria LF-PBNU", en: "LF-PBNU Criteria" },
    "note_1_desc": { id: "Perhitungan merujuk pada standar otentik Lembaga Falakiyah PBNU.", en: "Calculations refer to the authentic standards of the PBNU Falakiyah Institution." },
    "note_2_title": { id: "Sudut Matahari", en: "Solar Angle" },
    "note_2_desc": { id: "Subuh: <strong>-20°</strong> · Isya: <strong>-18°</strong> di bawah ufuk.", en: "Fajr: <strong>-20°</strong> · Isha: <strong>-18°</strong> below the horizon." },
    "note_3_title": { id: "Ikhtiyat", en: "Ikhtiyat (Precaution)" },
    "note_3_desc": { id: "Penambahan <strong>2 menit</strong> pada Subuh, Dhuhur, Asar, Maghrib, dan Isya'.", en: "An addition of <strong>2 minutes</strong> to Fajr, Dhuhr, Asr, Maghrib, and Isha'." },
    "note_4_title": { id: "Waktu Imsak", en: "Imsak Time" },
    "note_4_desc": { id: "<strong>10 menit sebelum Subuh</strong> sebagai rambu persiapan puasa.", en: "<strong>10 minutes before Fajr</strong> as a preparation marker for fasting." },
    "note_5_title": { id: "Metode Ashar", en: "Asr Method" },
    "note_5_desc": { id: "Kriteria Jumhur Ulama (Madzhab Hambali, Maliki, dan Syafi'i).", en: "Criteria of the Majority of Scholars (Hambali, Maliki, and Shafi'i schools)." },
    "copyright_protected": { id: "Dilindungi doa dan niat baik.", en: "Protected by prayers and good intentions." },

    // --- Dynamic Strings (Used in JS) ---
    "countdown_current": { id: "Saat ini:", en: "Current:" },
    "countdown_until": { id: "menuju", en: "until" },
    "gps_option": { id: "📍 Koordinat GPS Anda", en: "📍 Your GPS Coordinates" },
    "alert_gps": { id: "Gagal mendeteksi lokasi.", en: "Failed to detect location." },
    "schedule_title": { id: "Jadwal", en: "Schedule for" },
    "alert_excel": { id: "Library Excel sedang dimuat. Mohon tunggu sebentar lalu coba lagi.", en: "Excel library is loading. Please wait a moment and try again." },
    "alert_poster_load": { id: "Library sedang dimuat. Mohon tunggu sebentar lalu coba lagi.", en: "Library is loading. Please wait a moment and try again." },
    "alert_poster_fail": { id: "Gagal membuat poster. Silakan coba lagi.", en: "Failed to create poster. Please try again." },
    "btn_processing": { id: "Memproses...", en: "Processing..." },
    
    // --- Poster specific ---
    "poster_supervised": { id: "Disupervisi oleh Lembaga Falakiyah NU (LFNU) Taiwan", en: "Supervised by NU Falakiyah Institution (LFNU) Taiwan" },
    "poster_note_title_1": { id: "Catatan Falakiyah", en: "Astronomical Notes" },
    "poster_note_desc_1": { id: "Metode LF-PBNU · Subuh -20° · Isya -18° · Ikhtiyat +2 menit", en: "LF-PBNU Method · Fajr -20° · Isha -18° · Ikhtiyat +2 min" },
    "poster_note_title_2": { id: "Madzhab Ashar", en: "Asr Method" },
    "poster_note_desc_2": { id: "Jumhur Ulama (Hambali, Maliki, Syafi'i)", en: "Majority Scholars (Hambali, Maliki, Shafi'i)" },
    "poster_footer": { id: "© 2026 LFNU Taiwan · @ainulyaqinmhd — Dilindungi doa dan niat baik.", en: "© 2026 LFNU Taiwan · @ainulyaqinmhd — Protected by prayers and good intentions." }
};

const arrays = {
    namaHari: {
        id: ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
        en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    },
    namaBulan: {
        id: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
        en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    },
    namaBulanHijri: {
        id: ["Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir", "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban", "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah"],
        en: ["Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"]
    }
};

let currentLang = localStorage.getItem('appLang') || 'id';

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('appLang', lang);
    
    // Update HTML attribute
    document.documentElement.lang = lang;
    
    // Update data-i18n tags
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key] && translations[key][lang]) {
            // Check if element contains HTML tags that should be preserved.
            // Right now, only notes use HTML, so innerHTML is safe for all if they don't have events.
            el.innerHTML = translations[key][lang];
        }
    });

    // Update specific toggles UI
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update hijriMonthSelect options
    const hijriSelect = document.getElementById('hijriMonthSelect');
    if (hijriSelect) {
        Array.from(hijriSelect.options).forEach((opt, idx) => {
            opt.text = arrays.namaBulanHijri[lang][idx];
        });
    }

    // Re-render JS dynamic parts
    if (typeof updateLiveClock === 'function') updateLiveClock();
    if (typeof loadData === 'function') loadData(); // Reload table and specific texts
}

// Initialized on load
document.addEventListener("DOMContentLoaded", () => {
    setLang(currentLang);
});
