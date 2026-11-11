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
    "btn_screensaver": { id: "Layar Penuh", en: "Fullscreen" },

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
    "note_6_title": { id: "Kalender Hijriah", en: "Hijri Calendar" },
    "note_6_desc": { id: "Kriteria IRNU: tinggi hilal mar'i <strong>≥ 3°</strong>, elongasi haqiqi <strong>≥ 6,4°</strong>.", en: "IRNU criterion: apparent crescent altitude <strong>≥ 3°</strong>, true elongation <strong>≥ 6.4°</strong>." },
    "copyright_protected": { id: "Dilindungi doa dan niat baik.", en: "Protected by prayers and good intentions." },

    // --- Dynamic Strings (Used in JS) ---
    "countdown_current": { id: "Waktu", en: "Now:" },
    "countdown_until": { id: "dalam", en: "in" },
    "gps_option": { id: "📍 Koordinat GPS Anda", en: "📍 Your GPS Coordinates" },
    "alert_gps": { id: "Gagal mendeteksi lokasi.", en: "Failed to detect location." },
    "schedule_title": { id: "Jadwal", en: "Schedule for" },
    "alert_excel": { id: "Library Excel sedang dimuat. Mohon tunggu sebentar lalu coba lagi.", en: "Excel library is loading. Please wait a moment and try again." },
    "alert_poster_load": { id: "Library sedang dimuat. Mohon tunggu sebentar lalu coba lagi.", en: "Library is loading. Please wait a moment and try again." },
    "alert_poster_fail": { id: "Gagal membuat poster. Silakan coba lagi.", en: "Failed to create poster. Please try again." },
    "btn_processing": { id: "Memproses...", en: "Processing..." },
    "error_load": { id: "Gagal memuat jadwal. Periksa koneksi internet.", en: "Failed to load the schedule. Check your internet connection." },
    "error_hijri": { id: "Kalender Hijriah tidak dapat dihitung (library astronomi gagal dimuat).", en: "The Hijri calendar could not be calculated (astronomy library failed to load)." },
    "btn_retry": { id: "Coba lagi", en: "Retry" },

    // --- Hijri & Hilal ---
    "hijri_eve": { id: "Malam", en: "Night of" },
    "hijri_status_hisab": { id: "Perkiraan hisab IRNU", en: "Provisional, IRNU calculation" },
    "hijri_status_fixed": { id: "Telah ditetapkan", en: "Confirmed" },
    "hilal_title": { id: "Data Hilal Awal", en: "Crescent Data for" },
    "hilal_conj": { id: "Ijtimak", en: "Conjunction" },
    "hilal_markaz": { id: "Markaz", en: "Location" },
    "hilal_sunset": { id: "Matahari terbenam", en: "Sunset" },
    "hilal_alt": { id: "Tinggi hilal mar'i", en: "Apparent altitude" },
    "hilal_elong": { id: "Elongasi haqiqi", en: "True elongation" },
    "hilal_verdict": { id: "Kriteria IRNU", en: "IRNU criterion" },
    "hilal_met": { id: "Terpenuhi", en: "Fulfilled" },
    "hilal_not_met": { id: "Belum terpenuhi → istikmal", en: "Not fulfilled → month completed to 30 days" },
    "hilal_after_sunset": { id: "Ijtimak setelah matahari terbenam → istikmal", en: "Conjunction after sunset → month completed to 30 days" },
    "hilal_note": { id: "Hasil hisab saat matahari terbenam pada hari ijtimak, di markaz PCINU Taiwan (Taipei). Keputusan akhir mengikuti hasil rukyatul hilal dan ikhbar PCINU Taiwan.", en: "Calculated at sunset on the day of conjunction, at the PCINU Taiwan (Taipei) location. The final decision follows the crescent sighting and PCINU Taiwan's announcement." },

    // --- Kalender ---
    "cal_title": { id: "Kalender", en: "Calendar" },
    "cal_today": { id: "Hari ini", en: "Today" },
    "cal_prev": { id: "Bulan sebelumnya", en: "Previous month" },
    "cal_next": { id: "Bulan berikutnya", en: "Next month" },
    "cal_provisional": { id: "perkiraan", en: "provisional" },
    "cal_open_full": { id: "Buka kalender lengkap", en: "Open full calendar" },

    // --- Halaman kalender ---
    "calpage_doc_title": { id: "Kalender Hijriah & Masehi - PCINU Taiwan", en: "Hijri & Gregorian Calendar - PCINU Taiwan" },
    "calpage_title": { id: "Kalender Hijriah & Masehi", en: "Hijri & Gregorian Calendar" },
    "calpage_desc": { id: "Kriteria IRNU, markaz PCINU Taiwan (Taipei)", en: "IRNU criterion, PCINU Taiwan (Taipei) location" },
    "calpage_back": { id: "Jadwal sholat", en: "Prayer schedule" },
    "calpage_prayer_times": { id: "Waktu sholat", en: "Prayer times" },
    "calpage_events_month": { id: "Hari penting bulan ini", en: "Important days this month" },
    "calpage_no_events": { id: "Tidak ada hari penting di bulan ini.", en: "No important days this month." },
    "calpage_month_starts": { id: "Awal Bulan", en: "Month Starts" },
    "calpage_holidays": { id: "Hari Besar Islam", en: "Islamic Holidays" },
    "calpage_prev_year": { id: "Tahun Hijriah sebelumnya", en: "Previous Hijri year" },
    "calpage_next_year": { id: "Tahun Hijriah berikutnya", en: "Next Hijri year" },
    "calpage_th_month": { id: "Bulan", en: "Month" },
    "calpage_th_first": { id: "Tanggal 1", en: "1st day" },
    "calpage_th_conj": { id: "Ijtimak", en: "Conjunction" },
    "calpage_th_alt": { id: "Tinggi", en: "Altitude" },
    "calpage_th_elong": { id: "Elongasi", en: "Elongation" },
    "calpage_th_status": { id: "Status", en: "Status" },
    "calpage_status_fixed": { id: "Ditetapkan", en: "Confirmed" },
    "calpage_status_hisab": { id: "Hisab", en: "Calculated" },
    "calpage_year_note": { id: "Tinggi & elongasi dihitung saat matahari terbenam pada hari ijtimak di markaz PCINU Taiwan (Taipei). \u2713 memenuhi kriteria IRNU, \u2717 belum memenuhi (istikmal).", en: "Altitude & elongation at sunset on the day of conjunction at the PCINU Taiwan (Taipei) location. \u2713 meets the IRNU criterion, \u2717 does not (month completed to 30 days)." },
    "calpage_eclipses": { id: "Gerhana", en: "Eclipses" },
    "calpage_no_eclipses": { id: "Tidak ada gerhana di tahun ini.", en: "No eclipses this year." },
    "calpage_source": { id: "Sumber data", en: "Data source" },
    "calpage_learn": { id: "Belajar hisab", en: "Learn the calculation" },

    // --- Halaman belajar hisab ---
    "hisab_doc_title": { id: "Belajar Hisab Hilal & Gerhana - PCINU Taiwan", en: "Learn Crescent & Eclipse Calculation - PCINU Taiwan" },
    "hisab_title": { id: "Belajar Hisab", en: "Learn the Calculation" },
    "hisab_desc": { id: "Cara menghitung awal bulan Hijriah, langkah demi langkah dengan gambar", en: "How the start of a Hijri month is calculated, step by step with pictures" },
    "calc_doc_title": { id: "Kalkulator Hilal & Gerhana - PCINU Taiwan", en: "Crescent & Eclipse Calculator - PCINU Taiwan" },
    "calc_title": { id: "Kalkulator Hilal & Gerhana", en: "Crescent & Eclipse Calculator" },
    "calc_desc": { id: "Kriteria IRNU untuk lokasi dan tanggal mana pun", en: "IRNU criterion for any location and date" },
    "nav_label": { id: "Menu utama", en: "Main menu" },
    "nav_schedule": { id: "Jadwal Sholat", en: "Prayer Times" },
    "nav_calendar": { id: "Kalender", en: "Calendar" },
    "nav_calculator": { id: "Kalkulator", en: "Calculator" },
    "nav_learn": { id: "Belajar Hisab", en: "Learn Hisab" },
    "hisab_steps_link": { id: "Lihat langkah perhitungannya", en: "See the calculation steps" },

    // --- Gerhana ---
    "ecl_lunar_penumbral": { id: "Gerhana Bulan Penumbra", en: "Penumbral Lunar Eclipse" },
    "ecl_lunar_partial": { id: "Gerhana Bulan Sebagian", en: "Partial Lunar Eclipse" },
    "ecl_lunar_total": { id: "Gerhana Bulan Total", en: "Total Lunar Eclipse" },
    "ecl_solar_partial": { id: "Gerhana Matahari Sebagian", en: "Partial Solar Eclipse" },
    "ecl_solar_annular": { id: "Gerhana Matahari Cincin", en: "Annular Solar Eclipse" },
    "ecl_solar_total": { id: "Gerhana Matahari Total", en: "Total Solar Eclipse" },
    "ecl_short_lunar": { id: "Gerhana Bulan", en: "Lunar eclipse" },
    "ecl_short_solar": { id: "Gerhana Matahari", en: "Solar eclipse" },
    "ecl_visible": { id: "Terlihat dari {place}", en: "Visible from {place}" },
    "ecl_not_visible": { id: "Tidak terlihat dari {place}", en: "Not visible from {place}" },
    "ecl_seen_as": { id: "terlihat sebagai {kind}", en: "seen as {kind}" },
    "ecl_obscured": { id: "{p}% piringan Matahari tertutup", en: "{p}% of the Sun covered" },
    "ecl_below": { id: "di bawah ufuk", en: "below horizon" },
    "ecl_prayer_lunar": { id: "Disunnahkan sholat khusuf (gerhana Bulan).", en: "Salat al-khusuf (lunar eclipse prayer) is recommended." },
    "ecl_prayer_solar": { id: "Disunnahkan sholat kusuf (gerhana Matahari).", en: "Salat al-kusuf (solar eclipse prayer) is recommended." },
    "ecl_penumbral_note": { id: "Gerhana penumbra hampir tidak tampak, sehingga umumnya tidak disertai sholat gerhana.", en: "A penumbral eclipse is barely noticeable, so it is generally not accompanied by the eclipse prayer." },
    "ecl_P1": { id: "Awal penumbra", en: "Penumbra begins" },
    "ecl_U1": { id: "Awal gerhana sebagian", en: "Partial begins" },
    "ecl_U2": { id: "Awal gerhana total", en: "Totality begins" },
    "ecl_U3": { id: "Akhir gerhana total", en: "Totality ends" },
    "ecl_U4": { id: "Akhir gerhana sebagian", en: "Partial ends" },
    "ecl_P4": { id: "Akhir penumbra", en: "Penumbra ends" },
    "ecl_C1": { id: "Awal gerhana", en: "Eclipse begins" },
    "ecl_C2": { id: "Awal fase total/cincin", en: "Central phase begins" },
    "ecl_C3": { id: "Akhir fase total/cincin", en: "Central phase ends" },
    "ecl_C4": { id: "Akhir gerhana", en: "Eclipse ends" },
    "ecl_peak": { id: "Puncak", en: "Maximum" },

    "rel_today": { id: "Hari ini", en: "Today" },
    "rel_tomorrow": { id: "Besok", en: "Tomorrow" },
    "rel_yesterday": { id: "Kemarin", en: "Yesterday" },
    "rel_in": { id: "{n} hari lagi", en: "In {n} days" },
    "rel_ago": { id: "{n} hari yang lalu", en: "{n} days ago" },

    // --- Hari-hari penting ---
    "ev_new_year": { id: "Tahun Baru Hijriah", en: "Islamic New Year" },
    "ev_tasua": { id: "Tasu'a", en: "Tasu'a" },
    "ev_asyura": { id: "Asyura", en: "Ashura" },
    "ev_maulid": { id: "Maulid Nabi", en: "Mawlid" },
    "ev_isra": { id: "Isra' Mi'raj", en: "Isra' Mi'raj" },
    "ev_nisfu": { id: "Nisfu Sya'ban", en: "Mid-Sha'ban" },
    "ev_ramadan": { id: "Awal Ramadhan", en: "Ramadan begins" },
    "ev_nuzul": { id: "Nuzulul Qur'an", en: "Nuzul al-Qur'an" },
    "ev_fitri": { id: "Idul Fitri", en: "Eid al-Fitr" },
    "ev_tarwiyah": { id: "Tarwiyah", en: "Tarwiyah" },
    "ev_arafah": { id: "Arafah", en: "Day of Arafah" },
    "ev_adha": { id: "Idul Adha", en: "Eid al-Adha" },
    "ev_tasyrik": { id: "Hari Tasyrik", en: "Tashreeq" },
    "ev_bidh": { id: "Ayyamul Bidh", en: "White Days" },

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
    namaHariPendek: {
        id: ["Ahad", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
        en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
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

    // Update data-i18n-title (tooltip)
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (translations[key] && translations[key][lang]) el.title = translations[key][lang];
    });

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
    if (typeof onLangChange === 'function') onLangChange(); // Halaman lain (mis. kalender.html)
}

// Initialized on load
document.addEventListener("DOMContentLoaded", () => {
    setLang(currentLang);
});
