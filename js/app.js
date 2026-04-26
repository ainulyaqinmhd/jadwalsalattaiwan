/**
 * app.js
 * Logika utama aplikasi Jadwal Salat PCINU Taiwan.
 * Depends on: locations.js (must be loaded first)
 */

let todayTimingsData = null;

// Removed old manual arrays, they are now dynamically fetched from arrays in translations.js

const prayerIcons = {
    Imsak: `<svg class="prayer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
    Fajr: `<svg class="prayer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 18a5 5 0 0 0-10 0"></path><line x1="12" y1="2" x2="12" y2="9"></line><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line><line x1="1" y1="18" x2="3" y2="18"></line><line x1="21" y1="18" x2="23" y2="18"></line><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line><line x1="23" y1="22" x2="1" y2="22"></line><polyline points="8 6 12 2 16 6"></polyline></svg>`,
    Sunrise: `<svg class="prayer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
    Dhuhr: `<svg class="prayer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
    Asr: `<svg class="prayer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    Maghrib: `<svg class="prayer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 18a5 5 0 0 0-10 0"></path><line x1="12" y1="9" x2="12" y2="2"></line><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line><line x1="1" y1="18" x2="3" y2="18"></line><line x1="21" y1="18" x2="23" y2="18"></line><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line><line x1="23" y1="22" x2="1" y2="22"></line><polyline points="16 5 12 9 8 5"></polyline></svg>`,
    Isha: `<svg class="prayer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
};

const METHOD = 20;
const IHTIYATH = 2;
const TUNE = `${IHTIYATH},${IHTIYATH},0,${IHTIYATH},${IHTIYATH},${IHTIYATH},0,${IHTIYATH},0`;
const ADJUSTMENT = 1;
const HIJRI_ADJUSTMENT = -2; // Koreksi tanggal Hijriyah: -2, -1, 0, +1, +2

let customLat = null;
let customLng = null;

// --- Inisialisasi Dropdown Kota ---
const citySelect = document.getElementById("citySelect");
for (const city in locations) {
    let option = document.createElement("option");
    option.value = city;
    option.text = city;
    if (city === "Taipei") option.selected = true;
    citySelect.appendChild(option);
}

// --- Inisialisasi Bulan/Tahun ---
const nowSetup = new Date();
document.getElementById("monthSelect").value = `${nowSetup.getFullYear()}-${String(nowSetup.getMonth() + 1).padStart(2, '0')}`;

// --- Jam Langsung (Live Clock) ---
function updateLiveClock() {
    const now = new Date();
    document.getElementById('liveClock').innerText = now.toLocaleTimeString('id-ID', { hour12: false });
    document.getElementById('todayDate').innerText = `${arrays.namaHari[currentLang][now.getDay()]}, ${now.getDate()} ${arrays.namaBulan[currentLang][now.getMonth()]} ${now.getFullYear()}`;
    calculateCountdownAndHighlight(now);
}
setInterval(updateLiveClock, 1000);

// --- Hitung Mundur & Highlight Kartu Aktif ---
function calculateCountdownAndHighlight(now) {
    if (!todayTimingsData) return;
    const prayers = [
        { id: 'Imsak', name: translations.prayer_imsak[currentLang], time: todayTimingsData.Imsak },
        { id: 'Fajr', name: translations.prayer_fajr[currentLang], time: todayTimingsData.Fajr },
        { id: 'Sunrise', name: translations.prayer_sunrise[currentLang], time: todayTimingsData.Sunrise },
        { id: 'Dhuhr', name: translations.prayer_dhuhr[currentLang], time: todayTimingsData.Dhuhr },
        { id: 'Asr', name: translations.prayer_asr[currentLang], time: todayTimingsData.Asr },
        { id: 'Maghrib', name: translations.prayer_maghrib[currentLang], time: todayTimingsData.Maghrib },
        { id: 'Isha', name: translations.prayer_isha[currentLang], time: todayTimingsData.Isha }
    ];
    let currentPrayer = null;
    let nextPrayer = null;
    let nextPrayerDate = null;
    for (let p of prayers) {
        let [h, m] = p.time.split(':');
        let pDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
        if (now >= pDate) { currentPrayer = p; }
        else if (!nextPrayer) { nextPrayer = p; nextPrayerDate = pDate; }
    }
    if (!currentPrayer) { currentPrayer = prayers[6]; }
    if (!nextPrayer) {
        nextPrayer = prayers[0];
        let [h, m] = nextPrayer.time.split(':');
        nextPrayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, h, m, 0);
    }
    let diff = nextPrayerDate - now;
    let h = String(Math.floor((diff % (86400000)) / 3600000)).padStart(2, '0');
    let m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    let s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');

    document.getElementById('countdownBox').innerHTML = `<span class="badge-current">${translations.countdown_current[currentLang]} ${currentPrayer.name}</span><span class="countdown-info"> <strong>${h}:${m}:${s}</strong> <span class="countdown-target">${translations.countdown_until[currentLang]} ${nextPrayer.name}</span></span>`;
    const allCards = document.querySelectorAll('.prayer-card');
    allCards.forEach(card => card.classList.remove('active'));
    const activeCard = document.getElementById(`card-${currentPrayer.id}`);
    if (activeCard) activeCard.classList.add('active');
}

// --- Lokasi GPS ---
function useCurrentLocation() {
    if (navigator.geolocation) {
        document.getElementById("loadingMessage").style.display = "flex";
        navigator.geolocation.getCurrentPosition((position) => {
            customLat = position.coords.latitude;
            customLng = position.coords.longitude;
            let autoOpt = document.getElementById("autoOption") || document.createElement("option");
            autoOpt.id = "autoOption";
            autoOpt.value = "auto";
            autoOpt.text = translations.gps_option[currentLang];
            if (!document.getElementById("autoOption")) citySelect.insertBefore(autoOpt, citySelect.firstChild);
            citySelect.value = "auto";
            loadData();
        }, () => {
            alert(translations.alert_gps[currentLang]);
            document.getElementById("loadingMessage").style.display = "none";
        });
    }
}

// --- Muat Jadwal Salat Hari Ini ---
async function loadTodayPrayers(lat, lng) {
    const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${METHOD}&tune=${TUNE}&adjustment=${ADJUSTMENT}&hijriDateAdjustment=${HIJRI_ADJUSTMENT}&calendarMethod=MATHEMATICAL`;
    const res = await fetch(url);
    const result = await res.json();
    
    todayTimingsData = result.data.timings;
    const t = todayTimingsData;

    // Simpan info Hijriyah untuk kalender
    const hijri = result.data.date.hijri;
    if (hijri) {
        currentHijriMonth = hijri.month;
        currentHijriYear = hijri.year;
        
        // Inisialisasi picker hijriah pertama kali
        if (!isHijriPickerInitialized) {
            document.getElementById('hijriMonthSelect').value = hijri.month.number;
            document.getElementById('hijriYearSelect').value = hijri.year;
            isHijriPickerInitialized = true;
        }

        const hijriEl = document.getElementById('hijriDate');
        if (hijriEl) {
            const adjustedDay = parseInt(hijri.day) + HIJRI_ADJUSTMENT;
            const targetMonthIndo = arrays.namaBulanHijri[currentLang][hijri.month.number - 1];
            hijriEl.innerText = `${adjustedDay} ${targetMonthIndo} ${hijri.year} H`;
        }
    }

    document.getElementById("todayPrayers").innerHTML = `
        <div class="prayer-card" id="card-Imsak">${prayerIcons.Imsak}<div class="prayer-name">${translations.prayer_imsak[currentLang]}</div><div class="prayer-time">${t.Imsak.substring(0,5)}</div></div>
        <div class="prayer-card" id="card-Fajr">${prayerIcons.Fajr}<div class="prayer-name">${translations.prayer_fajr[currentLang]}</div><div class="prayer-time">${t.Fajr.substring(0,5)}</div></div>
        <div class="prayer-card" id="card-Sunrise">${prayerIcons.Sunrise}<div class="prayer-name">${translations.prayer_sunrise[currentLang]}</div><div class="prayer-time">${t.Sunrise.substring(0,5)}</div></div>
        <div class="prayer-card" id="card-Dhuhr">${prayerIcons.Dhuhr}<div class="prayer-name">${translations.prayer_dhuhr[currentLang]}</div><div class="prayer-time">${t.Dhuhr.substring(0,5)}</div></div>
        <div class="prayer-card" id="card-Asr">${prayerIcons.Asr}<div class="prayer-name">${translations.prayer_asr[currentLang]}</div><div class="prayer-time">${t.Asr.substring(0,5)}</div></div>
        <div class="prayer-card" id="card-Maghrib">${prayerIcons.Maghrib}<div class="prayer-name">${translations.prayer_maghrib[currentLang]}</div><div class="prayer-time">${t.Maghrib.substring(0,5)}</div></div>
        <div class="prayer-card" id="card-Isha">${prayerIcons.Isha}<div class="prayer-name">${translations.prayer_isha[currentLang]}</div><div class="prayer-time">${t.Isha.substring(0,5)}</div></div>
    `;
    updateLiveClock();
}

// --- State Tabel ---
let calendarMode = 'masehi'; // 'masehi' atau 'hijriah'
let currentHijriMonth = null; // { number, en, ar }
let currentHijriYear = null;
let isHijriPickerInitialized = false;
let lastLat = null;
let lastLng = null;
let currentTableRequestId = 0;

// --- Switch Masehi/Hijriah ---
function switchCalendarMode(mode) {
    calendarMode = mode;
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    const isMasehi = mode === 'masehi';
    const masehiPicker = document.getElementById('masehiMonthPicker');
    if (masehiPicker) masehiPicker.style.display = isMasehi ? 'flex' : 'none';
    
    const hijriPicker = document.getElementById('hijriMonthPicker');
    if (hijriPicker) hijriPicker.style.display = isMasehi ? 'none' : 'flex';
    // Fetch data baru sesuai mode
    if (lastLat && lastLng) {
        loadTable(lastLat, lastLng);
    }
}

// --- Muat Data Utama ---
function loadData() {
    const city = citySelect.value;
    let lat, lng;
    if (city === "auto") { lat = customLat; lng = customLng; }
    else { lat = locations[city].lat; lng = locations[city].lng; }
    lastLat = lat;
    lastLng = lng;
    loadTodayPrayers(lat, lng);
    loadTable(lat, lng);
}

// --- Muat Tabel sesuai Mode ---
async function loadTable(lat, lng) {
    const tableHead = document.getElementById("tableHead");
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";
    document.getElementById("loadingMessage").style.display = "flex";

    const requestId = ++currentTableRequestId;
    const nowForTable = new Date();
    const todayGregorian = `${String(nowForTable.getDate()).padStart(2, '0')}-${String(nowForTable.getMonth() + 1).padStart(2, '0')}-${nowForTable.getFullYear()}`;

    let url;
    if (calendarMode === 'hijriah') {
        const hMonth = document.getElementById("hijriMonthSelect").value;
        const hYear = document.getElementById("hijriYearSelect").value;
        const monthName = document.getElementById("hijriMonthSelect").options[hMonth - 1].text;
        
        // Ambil data kalender Hijriah
        url = `https://api.aladhan.com/v1/hijriCalendar/${hYear}/${hMonth}?latitude=${lat}&longitude=${lng}&method=${METHOD}&tune=${TUNE}&adjustment=${ADJUSTMENT}&calendarMethod=MATHEMATICAL`;
        // Update judul section
        document.getElementById("sectionTitleText").innerText = `${translations.schedule_title[currentLang]} ${monthName} ${hYear} H`;
    } else {
        // Ambil data kalender Masehi
        const [y, m] = document.getElementById("monthSelect").value.split("-");
        url = `https://api.aladhan.com/v1/calendar?latitude=${lat}&longitude=${lng}&method=${METHOD}&tune=${TUNE}&month=${m}&year=${y}&adjustment=${ADJUSTMENT}&calendarMethod=MATHEMATICAL`;
        // Update judul section
        const monthIdx = parseInt(m) - 1;
        document.getElementById("sectionTitleText").innerText = `${translations.schedule_title[currentLang]} ${arrays.namaBulan[currentLang][monthIdx]} ${y}`;
    }

    const res = await fetch(url);
    const result = await res.json();
    
    if (requestId !== currentTableRequestId) return;
    
    const data = result.data;

    // Render header
    if (calendarMode === 'hijriah') {
        tableHead.innerHTML = `<tr>
            <th data-i18n="th_date_h">${translations.th_date_h[currentLang]}</th>
            <th data-i18n="btn_masehi">${translations.btn_masehi[currentLang]}</th>
            <th data-i18n="th_day">${translations.th_day[currentLang]}</th>
            <th data-i18n="th_imsak">${translations.th_imsak[currentLang]}</th>
            <th data-i18n="th_fajr">${translations.th_fajr[currentLang]}</th>
            <th data-i18n="th_sunrise">${translations.th_sunrise[currentLang]}</th>
            <th data-i18n="th_dhuhr">${translations.th_dhuhr[currentLang]}</th>
            <th data-i18n="th_asr">${translations.th_asr[currentLang]}</th>
            <th data-i18n="th_maghrib">${translations.th_maghrib[currentLang]}</th>
            <th data-i18n="th_isha">${translations.th_isha[currentLang]}</th>
        </tr>`;
    } else {
        tableHead.innerHTML = `<tr>
            <th data-i18n="th_date_m">${translations.th_date_m[currentLang]}</th>
            <th data-i18n="th_day">${translations.th_day[currentLang]}</th>
            <th data-i18n="th_imsak">${translations.th_imsak[currentLang]}</th>
            <th data-i18n="th_fajr">${translations.th_fajr[currentLang]}</th>
            <th data-i18n="th_sunrise">${translations.th_sunrise[currentLang]}</th>
            <th data-i18n="th_dhuhr">${translations.th_dhuhr[currentLang]}</th>
            <th data-i18n="th_asr">${translations.th_asr[currentLang]}</th>
            <th data-i18n="th_maghrib">${translations.th_maghrib[currentLang]}</th>
            <th data-i18n="th_isha">${translations.th_isha[currentLang]}</th>
        </tr>`;
    }

    // Render baris
    let rowsHtml = "";
    data.forEach(day => {
        const gregorian = new Date(day.date.gregorian.date.split("-").reverse().join("-"));
        const isToday = (day.date.gregorian.date === todayGregorian);
        const rowClass = isToday ? ' class="current-day-row"' : '';

        let dateCol;
        if (calendarMode === 'hijriah') {
            const hijriDay = parseInt(day.date.hijri.day); // Tampilkan tgl real sesuai bulan (tanpa offset manual)
            const gregDay = day.date.gregorian.day.replace(/^0+/, '');
            const gregMonth = gregorian.getMonth() + 1;
            dateCol = `<td><strong>${hijriDay}</strong></td>
                       <td>${gregDay}/${gregMonth}</td>
                       <td><strong>${arrays.namaHari[currentLang][gregorian.getDay()]}</strong></td>`;
        } else {
            dateCol = `<td><strong>${day.date.gregorian.day.replace(/^0+/, '')}</strong></td>
                       <td><strong>${arrays.namaHari[currentLang][gregorian.getDay()]}</strong></td>`;
        }

        const row = `<tr${rowClass}>
            ${dateCol}
            <td>${day.timings.Imsak.substring(0,5)}</td>
            <td>${day.timings.Fajr.substring(0,5)}</td>
            <td>${day.timings.Sunrise.substring(0,5)}</td>
            <td>${day.timings.Dhuhr.substring(0,5)}</td>
            <td>${day.timings.Asr.substring(0,5)}</td>
            <td>${day.timings.Maghrib.substring(0,5)}</td>
            <td>${day.timings.Isha.substring(0,5)}</td>
        </tr>`;
        rowsHtml += row;
    });

    tableBody.innerHTML = rowsHtml;
    document.getElementById("loadingMessage").style.display = "none";
}

// --- Jalankan saat halaman dimuat ---
window.onload = loadData;

// --- Ekspor ke Excel ---
function exportToExcel() {
    if (typeof XLSX === 'undefined') {
        alert(translations.alert_excel[currentLang]);
        return;
    }
    
    const table = document.getElementById("prayerTable");
    const title = document.getElementById("sectionTitleText").innerText;
    
    // Dapatkan nama kota
    const citySelect = document.getElementById("citySelect");
    const city = citySelect.options[citySelect.selectedIndex].text;
    
    // Convert HTML table ke workbook SheetJS
    const wb = XLSX.utils.table_to_book(table, {sheet: "Jadwal Sholat"});
    
    // Nama file dinamis
    const filename = `${title.replace(/ /g, '_')}_${city.replace(/ /g, '_')}.xlsx`;
    
    // Download file
    XLSX.writeFile(wb, filename);
}

// --- Ekspor ke Poster PNG ---
async function exportToPoster() {
    if (typeof html2canvas === 'undefined') {
        alert(translations.alert_poster_load[currentLang]);
        return;
    }

    const btn = document.querySelector('.btn-poster');
    const origText = btn.innerHTML;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg> ${translations.btn_processing[currentLang]}`;
    btn.disabled = true;

    const title = document.getElementById("sectionTitleText").innerText;
    const cityEl = document.getElementById("citySelect");
    const city = cityEl.options[cityEl.selectedIndex].text;

    // Ambil data dari tabel yang sudah di-render
    const table = document.getElementById("prayerTable");
    const headerRow = table.querySelector("thead tr");
    const bodyRows = table.querySelectorAll("tbody tr");

    // Bangun header kolom
    const headers = [];
    headerRow.querySelectorAll("th").forEach(th => headers.push(th.innerText));

    // Bangun baris data
    const rows = [];
    bodyRows.forEach(tr => {
        const cells = [];
        tr.querySelectorAll("td").forEach(td => cells.push(td.innerText));
        rows.push({ cells, isToday: tr.classList.contains("current-day-row") });
    });

    // Buat elemen poster
    const poster = document.createElement("div");
    poster.id = "posterCanvas";
    poster.style.cssText = `
        position: fixed; left: -9999px; top: 0;
        width: 1080px; height: 1527px; /* A4 Aspect Ratio */
        font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
        background: #FAFAF7;
        color: #1C2B22;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
    `;

    // Hitung tinggi tabel secara dinamis
    const rowHeight = 34;
    const tableContentHeight = (rows.length + 1) * rowHeight + 20;

    poster.innerHTML = `
        <!-- Header Poster -->
        <div style="
            flex: 0 0 auto;
            background: linear-gradient(160deg, #092E1A 0%, #0E4427 35%, #1A6B3C 100%);
            padding: 40px 50px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        ">
            <!-- Dekorasi latar -->
            <div style="
                position: absolute; inset: 0;
                background-image: url('images/kabah_bg.png');
                background-size: cover; background-position: center;
                opacity: 0.15; mix-blend-mode: soft-light;
            "></div>
            <div style="
                position: absolute; inset: 0;
                background: linear-gradient(to bottom, rgba(9,46,26,0.3) 0%, rgba(14,68,39,0.9) 100%);
            "></div>
            
            <!-- Badge -->
            <div style="
                display: inline-flex; align-items: center; gap: 8px;
                background: rgba(201,152,46,0.15); color: #C9982E;
                font-size: 13px; font-weight: 700; text-transform: uppercase;
                letter-spacing: 3px; padding: 8px 24px; border-radius: 50px;
                border: 1px solid rgba(201,152,46,0.25); margin-bottom: 18px;
                position: relative; z-index: 2;
            ">✦ Jadwal & Waktu Sholat</div>
            
            <!-- Judul -->
            <div style="
                font-size: 40px; font-weight: 800; color: white;
                position: relative; z-index: 2; margin-bottom: 6px;
                text-shadow: 0 2px 8px rgba(0,0,0,0.15);
            ">LFNU Taiwan</div>

            <!-- Garis emas -->
            <div style="
                width: 180px; height: 1px; margin: 14px auto;
                background: linear-gradient(90deg, transparent, #C9982E, transparent);
                opacity: 0.6; position: relative; z-index: 2;
            "></div>

            <!-- Supervisi -->
            <div style="
                font-size: 14px; color: rgba(255,255,255,0.7);
                font-style: italic; font-weight: 500;
                position: relative; z-index: 2; margin-bottom: 20px;
            ">${translations.poster_supervised[currentLang]}</div>

            <!-- Judul jadwal -->
            <div style="
                display: inline-block;
                background: rgba(255,255,255,0.15); /* Removed backdrop-filter for html2canvas compatibility */
                padding: 12px 32px; border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.2);
                position: relative; z-index: 2;
            ">
                <div style="font-size: 24px; font-weight: 700; color: white;">${title}</div>
                <div style="font-size: 14px; color: #C9982E; font-weight: 600; margin-top: 6px;">📍 ${city}</div>
            </div>
        </div>

        <!-- Tabel Container -->
        <div style="
            flex: 1 1 auto; padding: 20px 48px;
            display: flex; flex-direction: column; justify-content: center;
        ">
            <table style="
                width: 100%; border-collapse: collapse;
                font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif;
            ">
                <thead style="background: #1A6B3C; color: #FFFFFF;">
                    <tr>
                        ${headers.map(h => `
                            <th style="
                                padding: 10px 8px; font-weight: 700; font-size: 12px;
                                color: #FFFFFF !important; text-transform: uppercase;
                                letter-spacing: 1px; text-align: center;
                            ">${h}</th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map((r, i) => `
                        <tr style="
                            background: ${r.isToday ? '#E8F5EE' : (i % 2 === 0 ? '#FFFFFF' : '#FAFAF7')};
                            ${r.isToday ? 'font-weight: 700;' : ''}
                        ">
                            ${r.cells.map((c, ci) => `
                                <td style="
                                    padding: 5.5px 8px; text-align: center;
                                    border-bottom: 1px solid rgba(26,107,60,0.08);
                                    font-size: 13px;
                                    ${r.isToday ? 'color: #1A6B3C;' : 'color: #1C2B22;'}
                                    ${ci === 0 ? 'font-weight: 700;' : ''}
                                ">${c}</td>
                            `).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Catatan kaki -->
        <div style="
            flex: 0 0 auto;
            padding: 24px 48px 16px; margin: 0 48px;
            border-top: 1px solid rgba(26,107,60,0.15);
            display: flex; justify-content: space-between; align-items: flex-start;
            gap: 24px; font-size: 12px; color: #8A9B90;
        ">
            <div style="flex: 1;">
                <div style="font-weight: 700; color: #5A6B60; margin-bottom: 6px;">${translations.poster_note_title_1[currentLang]}</div>
                <div>${translations.poster_note_desc_1[currentLang]}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 700; color: #5A6B60; margin-bottom: 6px;">${translations.poster_note_title_2[currentLang]}</div>
                <div>${translations.poster_note_desc_2[currentLang]}</div>
            </div>
        </div>

        <!-- Footer -->
        <div style="
            flex: 0 0 auto;
            padding: 16px 48px 32px;
            text-align: center; font-size: 12px; color: #8A9B90;
        ">
            ${translations.poster_footer[currentLang]}
        </div>
    `;

    document.body.appendChild(poster);

    try {
        const canvas = await html2canvas(poster, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#FAFAF7',
            logging: false,
        });

        // Kembali ke keadaan semula
        const link = document.createElement('a');
        link.download = `${title.replace(/ /g, '_')}_${city.replace(/ /g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error('Gagal membuat poster:', err);
        alert(translations.alert_poster_fail[currentLang]);
    } finally {
        document.body.removeChild(poster);
        btn.innerHTML = origText;
        btn.disabled = false;
    }
}
