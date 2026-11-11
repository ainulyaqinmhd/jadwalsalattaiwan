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

// Metode, ihtiyath & akses API waktu sholat: lihat js/prayer-api.js
// Tanggal Hijriah dihitung dengan kriteria IRNU di js/hijri.js.
// Koreksi manual: lihat HIJRI_CONFIG (globalOffset / overrides) di js/hijri.js.

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
    const clockEl = document.getElementById('liveClock');
    const pad = (n) => String(n).padStart(2, '0');
    clockEl.innerHTML = `${pad(now.getHours())}:${pad(now.getMinutes())}<span class="clock-sec">${pad(now.getSeconds())}</span>`;
    document.getElementById('todayDate').innerText = `${arrays.namaHari[currentLang][now.getDay()]}, ${now.getDate()} ${arrays.namaBulan[currentLang][now.getMonth()]} ${now.getFullYear()}`;

    // Ganti hari (lewat tengah malam): muat ulang jadwal agar layar yang terus menyala tetap benar
    const key = dayKey(now);
    if (loadedDayKey && key !== loadedDayKey) {
        const monthInput = document.getElementById("monthSelect");
        if (monthInput.value === loadedDayKey.slice(0, 7)) monthInput.value = key.slice(0, 7);
        loadData();
    }

    renderHeroHijri(now);
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

    document.getElementById('countdownBox').innerHTML = `<span class="badge-current">${translations.countdown_current[currentLang]} ${currentPrayer.name}</span><span class="countdown-info"><span class="countdown-target">${nextPrayer.name} ${translations.countdown_until[currentLang]}</span> <strong>${h}:${m}:${s}</strong></span>`;
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

// --- Helper umum ---
const pad2 = (n) => String(n).padStart(2, '0');
const dayKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const apiParams = PrayerApi.params;
const fetchApi = PrayerApi.fetchApi;

// "HH:MM" pada tanggal `now`
function timeOnDay(now, hhmm) {
    const [h, m] = hhmm.substring(0, 5).split(':').map(Number);
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
}

function hijriEventName(month, day) {
    const ev = Hijri.specialDay(month, day);
    return ev ? translations[ev.key][currentLang] : '';
}

// --- Tanggal Hijriah di header (berganti saat Maghrib) ---
let lastHeroHijriText = null;
let heroHijriErrorLogged = false;
function renderHeroHijri(now) {
    const el = document.getElementById('hijriDate');
    if (!el) return;
    let text = '';
    try {
        let n = Hijri.dayNumFromDate(now);
        let isEve = false;
        if (todayTimingsData && now >= timeOnDay(now, todayTimingsData.Maghrib)) {
            n += 1; // hari Hijriah baru dimulai saat Maghrib
            isEve = true;
        }
        const h = Hijri.fromDayNum(n);
        const ev = hijriEventName(h.month, h.day);
        const prefix = isEve ? `${translations.hijri_eve[currentLang]} ` : '';
        text = `${prefix}${h.day} ${arrays.namaBulanHijri[currentLang][h.month - 1]} ${h.year} H`;
        if (ev) text += `<span class="hero-hijri-event">${ev}</span>`;
    } catch (err) {
        if (!heroHijriErrorLogged) console.error('Gagal menghitung tanggal Hijriah:', err);
        heroHijriErrorLogged = true;
    }
    if (text !== lastHeroHijriText) {
        el.innerHTML = text;
        lastHeroHijriText = text;
    }
}

// --- Muat Jadwal Salat Hari Ini ---
let todayRequestId = 0;
let todayRetryTimer = null;
async function loadTodayPrayers(lat, lng) {
    clearTimeout(todayRetryTimer);
    const requestId = ++todayRequestId;
    const now = new Date();
    const dateStr = `${pad2(now.getDate())}-${pad2(now.getMonth() + 1)}-${now.getFullYear()}`;

    let data;
    try {
        data = await fetchApi(`https://api.aladhan.com/v1/timings/${dateStr}?${apiParams(lat, lng)}`);
    } catch (err) {
        if (requestId !== todayRequestId) return;
        console.error('Gagal memuat jadwal hari ini:', err);
        todayTimingsData = null;
        document.getElementById('countdownBox').innerHTML =
            `<span class="countdown-error">${translations.error_load[currentLang]}</span>`;
        renderHeroHijri(new Date());
        // Coba lagi otomatis (penting untuk layar masjid / mode layar penuh)
        todayRetryTimer = setTimeout(() => loadTodayPrayers(lat, lng), 60000);
        return;
    }
    if (requestId !== todayRequestId) return;

    todayTimingsData = data.timings;
    const t = todayTimingsData;

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
let currentHijriMonth = null; // nomor bulan 1–12
let currentHijriYear = null;
let isHijriPickerInitialized = false;
let lastLat = null;
let lastLng = null;
let currentTableRequestId = 0;
let loadedDayKey = null; // tanggal saat data terakhir dimuat (untuk ganti hari otomatis)

const HIJRI_YEAR_MIN = 1400;
const HIJRI_YEAR_MAX = 1500;

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

// --- Bulan Hijriah berjalan & picker ---
function updateHijriState() {
    try {
        const h = Hijri.fromDate(new Date());
        const monthSel = document.getElementById('hijriMonthSelect');
        const yearInput = document.getElementById('hijriYearSelect');
        // Picker ikut pindah jika sebelumnya menunjuk bulan berjalan
        const followsCurrent = !isHijriPickerInitialized ||
            (parseInt(monthSel.value) === currentHijriMonth && parseInt(yearInput.value) === currentHijriYear);
        currentHijriMonth = h.month;
        currentHijriYear = h.year;
        if (followsCurrent) {
            monthSel.value = h.month;
            yearInput.value = h.year;
        }
        isHijriPickerInitialized = true;
    } catch (err) {
        console.error('Gagal menghitung bulan Hijriah:', err);
    }
}

// --- Muat Data Utama ---
function loadData() {
    const city = citySelect.value;
    let lat, lng;
    if (city === "auto") { lat = customLat; lng = customLng; }
    else { lat = locations[city].lat; lng = locations[city].lng; }
    if (lat == null || lng == null) return;
    lastLat = lat;
    lastLng = lng;
    loadedDayKey = dayKey(new Date());
    updateHijriState();
    renderHilalCard();
    try { renderCalendar(); } catch (err) { console.error('Gagal menampilkan kalender:', err); }
    loadTodayPrayers(lat, lng);
    loadTable(lat, lng);
}

// --- Muat Tabel sesuai Mode ---
async function loadTable(lat, lng) {
    const tableHead = document.getElementById("tableHead");
    const tableBody = document.getElementById("tableBody");
    const statusEl = document.getElementById("hijriStatus");
    tableBody.innerHTML = "";
    statusEl.textContent = "";
    statusEl.className = "hijri-status";
    document.getElementById("loadingMessage").style.display = "flex";

    const requestId = ++currentTableRequestId;
    const nowForTable = new Date();
    const todayGregorian = `${pad2(nowForTable.getDate())}-${pad2(nowForTable.getMonth() + 1)}-${nowForTable.getFullYear()}`;

    const fetchMonth = (y, m) => fetchApi(`https://api.aladhan.com/v1/calendar?${apiParams(lat, lng)}&month=${m}&year=${y}`);
    // "DD-MM-YYYY" → nomor hari
    const rowDayNum = (day) => {
        const [d, m, y] = day.date.gregorian.date.split("-").map(Number);
        return Hijri.dayNum(y, m, d);
    };

    try {
        let data;
        let hMonth = null, hYear = null, hijriStart = null;
        if (calendarMode === 'hijriah') {
            const monthSel = document.getElementById("hijriMonthSelect");
            const yearInput = document.getElementById("hijriYearSelect");
            hMonth = parseInt(monthSel.value);
            hYear = parseInt(yearInput.value);
            if (!Number.isInteger(hYear)) hYear = currentHijriYear || HIJRI_YEAR_MIN;
            hYear = Math.min(HIJRI_YEAR_MAX, Math.max(HIJRI_YEAR_MIN, hYear));
            yearInput.value = hYear;

            const monthName = monthSel.options[hMonth - 1].text;
            document.getElementById("sectionTitleText").innerText = `${translations.schedule_title[currentLang]} ${monthName} ${hYear} H`;

            // Rentang bulan Hijriah (IRNU) → ambil bulan Masehi yang tercakup, lalu saring
            const range = Hijri.monthRange(hYear, hMonth);
            hijriStart = range.start;
            statusEl.textContent = translations[range.fixed ? 'hijri_status_fixed' : 'hijri_status_hisab'][currentLang];
            statusEl.classList.toggle('fixed', range.fixed);

            const first = Hijri.dayNumToDate(range.start);
            const last = Hijri.dayNumToDate(range.end - 1);
            const months = [[first.getFullYear(), first.getMonth() + 1]];
            if (last.getMonth() !== first.getMonth() || last.getFullYear() !== first.getFullYear()) {
                months.push([last.getFullYear(), last.getMonth() + 1]);
            }
            const results = await Promise.all(months.map(([y, m]) => fetchMonth(y, m)));
            data = results.flat().filter(day => {
                const n = rowDayNum(day);
                return n >= range.start && n < range.end;
            });
        } else {
            const [y, m] = document.getElementById("monthSelect").value.split("-");
            const monthIdx = parseInt(m) - 1;
            document.getElementById("sectionTitleText").innerText = `${translations.schedule_title[currentLang]} ${arrays.namaBulan[currentLang][monthIdx]} ${y}`;
            data = await fetchMonth(y, m);
        }

        if (requestId !== currentTableRequestId) return;

        // Render header
        const th = (key) => `<th data-i18n="${key}">${translations[key][currentLang]}</th>`;
        const timeHeaders = ['th_imsak', 'th_fajr', 'th_sunrise', 'th_dhuhr', 'th_asr', 'th_maghrib', 'th_isha'].map(th).join('');
        tableHead.innerHTML = calendarMode === 'hijriah'
            ? `<tr>${th('th_date_h')}${th('btn_masehi')}${th('th_day')}${timeHeaders}</tr>`
            : `<tr>${th('th_date_m')}${th('th_date_h')}${th('th_day')}${timeHeaders}</tr>`;

        // Render baris
        let rowsHtml = "";
        data.forEach((day, i) => {
            const n = rowDayNum(day);
            const gregorian = Hijri.dayNumToDate(n);
            const isToday = (day.date.gregorian.date === todayGregorian);

            let h = null;
            if (calendarMode === 'hijriah') {
                h = { year: hYear, month: hMonth, day: n - hijriStart + 1 };
            } else {
                try { h = Hijri.fromDayNum(n); } catch (err) { h = null; }
            }

            const ev = h ? Hijri.specialDay(h.month, h.day) : null;
            const classes = [];
            if (isToday) classes.push('current-day-row');
            if (ev) classes.push(ev.kind === 'fasting' ? 'row-fasting' : 'row-event');
            if (ev && ev.kind === 'holiday') classes.push('row-holiday');
            const rowClass = classes.length ? ` class="${classes.join(' ')}"` : '';
            const evLabel = ev ? ` <span class="hijri-event">${translations[ev.key][currentLang]}</span>` : '';
            const dayName = `<td><strong>${arrays.namaHari[currentLang][gregorian.getDay()]}</strong></td>`;

            let dateCol;
            if (calendarMode === 'hijriah') {
                dateCol = `<td><strong>${h.day}</strong>${evLabel}</td>
                           <td>${gregorian.getDate()}/${gregorian.getMonth() + 1}</td>
                           ${dayName}`;
            } else {
                // Nama bulan Hijriah hanya di baris pertama dan saat tanggal 1
                const monthLabel = h && (i === 0 || h.day === 1)
                    ? ` <span class="hijri-month-label">${arrays.namaBulanHijri[currentLang][h.month - 1]}</span>` : '';
                const hijriCell = h ? `<td><strong>${h.day}</strong>${monthLabel}${evLabel}</td>` : `<td>-</td>`;
                dateCol = `<td><strong>${gregorian.getDate()}</strong></td>
                           ${hijriCell}
                           ${dayName}`;
            }

            rowsHtml += `<tr${rowClass}>
                ${dateCol}
                <td>${day.timings.Imsak.substring(0,5)}</td>
                <td>${day.timings.Fajr.substring(0,5)}</td>
                <td>${day.timings.Sunrise.substring(0,5)}</td>
                <td>${day.timings.Dhuhr.substring(0,5)}</td>
                <td>${day.timings.Asr.substring(0,5)}</td>
                <td>${day.timings.Maghrib.substring(0,5)}</td>
                <td>${day.timings.Isha.substring(0,5)}</td>
            </tr>`;
        });

        tableBody.innerHTML = rowsHtml;
    } catch (err) {
        if (requestId !== currentTableRequestId) return;
        console.error('Gagal memuat tabel jadwal:', err);
        const msgKey = err.name === 'HijriError' ? 'error_hijri' : 'error_load';
        tableBody.innerHTML = `<tr><td colspan="10" class="table-error">
            ${translations[msgKey][currentLang]}
            <button class="btn-retry" onclick="loadData()">${translations.btn_retry[currentLang]}</button>
        </td></tr>`;
    } finally {
        if (requestId === currentTableRequestId) {
            document.getElementById("loadingMessage").style.display = "none";
        }
    }
}

// --- Kartu Data Hilal (awal bulan Hijriah berikutnya) ---
function formatDeg(x) {
    const totalMin = Math.round(Math.abs(x) * 60);
    return `${x < 0 ? '−' : ''}${Math.floor(totalMin / 60)}° ${pad2(totalMin % 60)}′`;
}

// Tanggal & jam di zona waktu markaz (HIJRI_CONFIG.utcOffset)
function formatMarkazTime(date) {
    const d = new Date(date.getTime() + HIJRI_CONFIG.utcOffset * 3600000);
    return {
        date: `${d.getUTCDate()} ${arrays.namaBulan[currentLang][d.getUTCMonth()]} ${d.getUTCFullYear()}`,
        time: `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`
    };
}

function renderHilalCard() {
    const section = document.getElementById('hilalSection');
    if (!section) return;
    try {
        const today = Hijri.fromDate(new Date());
        const year = today.month === 12 ? today.year + 1 : today.year;
        const month = today.month === 12 ? 1 : today.month + 1;
        const monthName = arrays.namaBulanHijri[currentLang][month - 1];
        const ev = Hijri.evaluate(year, month);
        const range = Hijri.monthRange(year, month);
        const tr = (key) => translations[key][currentLang];
        const tz = `UTC+${HIJRI_CONFIG.utcOffset}`;
        const check = (ok) => `<span class="hilal-check ${ok ? 'ok' : 'no'}">${ok ? '✓' : '✗'}</span>`;

        document.getElementById('hilalTitle').innerText = `${tr('hilal_title')} ${monthName} ${year} H`;

        const status = document.getElementById('hilalStatus');
        status.textContent = tr(range.fixed ? 'hijri_status_fixed' : 'hijri_status_hisab');
        status.className = `hijri-status${range.fixed ? ' fixed' : ''}`;

        const conj = formatMarkazTime(ev.conjunction);
        const items = [[tr('hilal_conj'), `${conj.date}, ${conj.time} <small>${tz}</small>`]];
        if (ev.hilal) {
            items.push(
                [tr('hilal_markaz'), ev.hilal.name],
                [tr('hilal_sunset'), `${formatMarkazTime(ev.hilal.sunset).time} <small>${tz}</small>`],
                [tr('hilal_alt'), `${formatDeg(ev.hilal.altitude)} ${check(ev.hilal.altitude >= HIJRI_CONFIG.minAltitude)}`],
                [tr('hilal_elong'), `${formatDeg(ev.hilal.elongation)} ${check(ev.hilal.elongation >= HIJRI_CONFIG.minElongation)}`]
            );
        }
        const verdict = !ev.hilal ? tr('hilal_after_sunset') : (ev.fulfilled ? tr('hilal_met') : tr('hilal_not_met'));
        items.push([tr('hilal_verdict'), verdict]);

        document.getElementById('hilalGrid').innerHTML = items.map(([k, v]) =>
            `<div class="hilal-item"><span class="hilal-label">${k}</span><span class="hilal-value">${v}</span></div>`
        ).join('');

        const start = Hijri.dayNumToDate(range.start);
        document.getElementById('hilalResult').innerHTML =
            `1 ${monthName} ${year} H: <strong>${arrays.namaHari[currentLang][start.getDay()]}, ${start.getDate()} ${arrays.namaBulan[currentLang][start.getMonth()]} ${start.getFullYear()}</strong>`;
        document.getElementById('hilalNote').innerHTML = `${tr('hilal_note')} ${tr('calpage_source')}: ${ev.source}.
            <a class="cal-more" href="hisab.html?y=${year}&m=${month}&p=markaz">${tr('hisab_steps_link')}</a>`;
        section.hidden = false;
    } catch (err) {
        console.error('Gagal menghitung data hilal:', err);
        section.hidden = true;
    }
}

// --- Kalender ringkas (rincian lengkap di kalender.html) ---
let calYear = null;
let calMonth = null;     // 0–11

function calendarToday() {
    const now = new Date();
    calYear = now.getFullYear();
    calMonth = now.getMonth();
    renderCalendar();
}

function shiftCalendar(delta) {
    const d = new Date(calYear, calMonth + delta, 1);
    calYear = d.getFullYear();
    calMonth = d.getMonth();
    renderCalendar();
}

const calendarPageUrl = (n) => `kalender.html?d=${CalendarView.toIso(n)}`;

function renderCalendar() {
    const grid = document.getElementById('calGrid');
    if (!grid) return;
    if (calYear === null) {
        const now = new Date();
        calYear = now.getFullYear();
        calMonth = now.getMonth();
    }
    const tr = CalendarView.tr;
    document.getElementById('calPrev').setAttribute('aria-label', tr('cal_prev'));
    document.getElementById('calNext').setAttribute('aria-label', tr('cal_next'));

    // Setiap tanggal adalah tautan ke halaman kalender lengkap
    const { html, meta } = CalendarView.gridHtml(calYear, calMonth, { href: calendarPageUrl });
    grid.innerHTML = html;

    document.getElementById('calMonth').innerText = meta.title;
    document.getElementById('calHijriRange').innerText = meta.rangeText;
    const statusEl = document.getElementById('calStatus');
    statusEl.textContent = meta.hasHijri ? tr(meta.fixed ? 'hijri_status_fixed' : 'hijri_status_hisab') : '';
    statusEl.className = `hijri-status${meta.fixed ? ' fixed' : ''}`;

    // Baris bawah: hari ini (jika di bulan ini) + tautan ke kalender lengkap
    const detail = document.getElementById('calDetail');
    const todayN = CalendarView.todayNum();
    let info = '';
    if (todayN >= meta.first && todayN <= meta.last) {
        const i = CalendarView.dayInfo(todayN);
        info = `<strong>${CalendarView.gregorianLabel(todayN)}</strong>` +
            (i.h ? `<span class="cal-detail-hijri">${CalendarView.hijriLabel(i.h)}${i.fixed ? '' : ` <small>(${tr('cal_provisional')})</small>`}</span>` : '') +
            (i.ev ? `<span class="cal-detail-ev ev-${i.ev.kind}">${tr(i.ev.key)}</span>` : '');
    }
    const target = todayN >= meta.first && todayN <= meta.last ? todayN : meta.first;
    detail.innerHTML = info + `<a class="cal-more" href="${calendarPageUrl(target)}">${tr('cal_open_full')}</a>`;
    detail.hidden = false;
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
    const headers = [...table.querySelectorAll("thead th")].map(th => th.innerText);
    const rows = [...table.querySelectorAll("tbody tr")].map(tr => ({
        cells: [...tr.querySelectorAll("td")].map(td => {
            const strong = td.querySelector("strong");
            const sub = [...td.querySelectorAll(".hijri-month-label, .hijri-event")].map(e => e.innerText).join(", ");
            return { main: strong ? strong.innerText : td.innerText.trim(), sub };
        }),
        isToday: tr.classList.contains("current-day-row"),
        isEvent: tr.classList.contains("row-event"),
        isHoliday: tr.classList.contains("row-holiday"),
        isFasting: tr.classList.contains("row-fasting")
    }));

    // Palet (sama dengan css/style.css)
    const C = {
        pine: '#0F3B24', green: '#1A6B3C', leaf: '#E4EFE6', gold: '#C9982E', goldInk: '#8A6516',
        goldWash: '#FBF5E6', goldWashStrong: '#F5E8C8', ink: '#15241B', ink2: '#4D5E53', ink3: '#6F7F74',
        line: 'rgba(21,36,27,0.10)'
    };
    const rowH = Math.min(44, Math.floor(1120 / (rows.length + 1)));

    // Buat elemen poster (A4, 1080 × 1527)
    const poster = document.createElement("div");
    poster.id = "posterCanvas";
    poster.style.cssText = `
        position: fixed; left: -9999px; top: 0;
        width: 1080px; height: 1527px;
        font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
        background: #FFFFFF; color: ${C.ink};
        display: flex; flex-direction: column; box-sizing: border-box;
    `;

    const cellHtml = (c, ci, r) => {
        const isDate = ci === 0;
        const subColor = r.isFasting ? C.green : (r.isEvent ? C.goldInk : C.ink3);
        return `<td style="
                height: ${rowH}px; padding: 0 8px; text-align: center; vertical-align: middle;
                border-bottom: 1px solid ${C.line};
                font-size: 15px; font-weight: ${isDate || r.isToday ? 700 : 500};
                color: ${r.isToday ? C.pine : C.ink};
                ${isDate ? `border-left: 4px solid ${r.isToday ? C.green : (r.isEvent ? C.gold : 'transparent')};` : ''}
            ">${c.main}${c.sub ? `<div style="font-size: 10px; font-weight: 700; line-height: 1.1; color: ${subColor};">${c.sub}</div>` : ''}</td>`;
    };

    poster.innerHTML = `
        <div style="flex: 0 0 14px; background: ${C.green};"></div>
        <div style="flex: 0 0 4px; background: ${C.gold};"></div>

        <!-- Kepala poster -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 32px; padding: 40px 56px 26px;">
            <div>
                <div style="font-family: 'Reem Kufi', sans-serif; font-size: 22px; font-weight: 600; color: ${C.green};">PCINU Taiwan</div>
                <div style="font-family: 'Reem Kufi', sans-serif; font-size: 46px; font-weight: 600; line-height: 1.15; color: ${C.pine}; margin-top: 2px;">${title}</div>
                <div style="font-size: 15px; color: ${C.ink2}; margin-top: 8px;">${translations.poster_supervised[currentLang]}</div>
            </div>
            <div style="text-align: right; flex-shrink: 0;">
                <div style="font-size: 14px; color: ${C.ink3};">${translations.label_city[currentLang]}</div>
                <div style="font-size: 26px; font-weight: 700; color: ${C.green};">${city}</div>
            </div>
        </div>

        <!-- Tabel -->
        <div style="flex: 1 1 auto; padding: 0 56px;">
            <!-- tabular-nums dari style.css dimatikan: html2canvas menggambar angka proporsional sehingga jadi renggang -->
            <table style="width: 100%; border-collapse: separate; border-spacing: 0; font-variant-numeric: normal;
                border: 1px solid ${C.line}; border-radius: 14px; overflow: hidden;">
                <thead>
                    <tr>${headers.map(h => `<th style="
                        height: ${rowH + 4}px; padding: 0 8px; background: ${C.leaf}; color: ${C.green};
                        font-size: 14px; font-weight: 700; text-align: center;
                        border-bottom: 1px solid ${C.line};">${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${rows.map(r => `<tr style="background: ${r.isToday ? C.leaf : (r.isHoliday ? C.goldWashStrong : (r.isEvent ? C.goldWash : '#FFFFFF'))};">
                        ${r.cells.map((c, ci) => cellHtml(c, ci, r)).join('')}
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>

        <!-- Catatan -->
        <div style="display: flex; gap: 40px; margin: 24px 56px 0; padding-top: 18px; border-top: 1px solid rgba(21,36,27,0.18); font-size: 13px; color: ${C.ink2};">
            <div style="flex: 1;">
                <div style="font-weight: 700; color: ${C.ink}; margin-bottom: 2px;">${translations.poster_note_title_1[currentLang]}</div>
                <div>${translations.poster_note_desc_1[currentLang]}</div>
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 700; color: ${C.ink}; margin-bottom: 2px;">${translations.poster_note_title_2[currentLang]}</div>
                <div>${translations.poster_note_desc_2[currentLang]}</div>
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 700; color: ${C.ink}; margin-bottom: 2px;">${translations.note_6_title[currentLang]}</div>
                <div>${translations.note_6_desc[currentLang]}</div>
            </div>
        </div>

        <div style="padding: 18px 56px 30px; font-size: 12px; color: ${C.ink3};">
            ${translations.poster_footer[currentLang]}
        </div>
    `;

    document.body.appendChild(poster);

    try {
        const canvas = await html2canvas(poster, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#FFFFFF',
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

// --- Screensaver & Wake Lock ---
let wakeLock = null;

async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
        } catch (err) {
            console.error(`Wake Lock error: ${err.name}, ${err.message}`);
        }
    }
}

function releaseWakeLock() {
    if (wakeLock !== null) {
        wakeLock.release()
            .then(() => { wakeLock = null; })
            .catch(err => console.error(err));
    }
}

function toggleScreensaver() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.warn(`Error attempting to enable fullscreen: ${err.message}`);
        });
        document.body.classList.add('screensaver-active');
        requestWakeLock();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        document.body.classList.remove('screensaver-active');
        releaseWakeLock();
    }
}

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        document.body.classList.remove('screensaver-active');
        releaseWakeLock();
    }
});

// Re-acquire wake lock if tab becomes visible again while in screensaver
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && document.body.classList.contains('screensaver-active')) {
        requestWakeLock();
    }
});

// --- Mode Offline (Service Worker) ---
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(err => console.warn('Service worker gagal didaftarkan:', err));
    });
}
