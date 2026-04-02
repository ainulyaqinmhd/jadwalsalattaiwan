/**
 * app.js
 * Logika utama aplikasi Jadwal Salat PCINU Taiwan.
 * Depends on: locations.js (must be loaded first)
 */

let todayTimingsData = null;

const namaHari = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const namaBulanHijri = ["Muharam", "Safar", "Rabiul Awal", "Rabiul Akhir", "Jumadil Awal", "Jumadil Akhir", "Rajab", "Syakban", "Ramadan", "Syawal", "Zulkaidah", "Zulhijah"];

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
    document.getElementById('todayDate').innerText = `${namaHari[now.getDay()]}, ${now.getDate()} ${namaBulan[now.getMonth()]} ${now.getFullYear()}`;
    calculateCountdownAndHighlight(now);
}
setInterval(updateLiveClock, 1000);

// --- Hitung Mundur & Highlight Kartu Aktif ---
function calculateCountdownAndHighlight(now) {
    if (!todayTimingsData) return;
    const prayers = [
        { id: 'Imsak', name: 'Imsak', time: todayTimingsData.Imsak },
        { id: 'Fajr', name: 'Subuh', time: todayTimingsData.Fajr },
        { id: 'Sunrise', name: 'Terbit', time: todayTimingsData.Sunrise },
        { id: 'Dhuhr', name: 'Dhuhur', time: todayTimingsData.Dhuhr },
        { id: 'Asr', name: 'Ashar', time: todayTimingsData.Asr },
        { id: 'Maghrib', name: 'Maghrib', time: todayTimingsData.Maghrib },
        { id: 'Isha', name: 'Isya', time: todayTimingsData.Isha }
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

    document.getElementById('countdownBox').innerHTML = `<span class="badge-current">Saat ini: ${currentPrayer.name}</span><span> <strong>${h}:${m}:${s}</strong> menuju ${nextPrayer.name}</span>`;
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
            autoOpt.text = "📍 Koordinat GPS Anda";
            if (!document.getElementById("autoOption")) citySelect.insertBefore(autoOpt, citySelect.firstChild);
            citySelect.value = "auto";
            loadData();
        }, () => {
            alert("Gagal mendeteksi lokasi.");
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
            const targetMonthIndo = namaBulanHijri[hijri.month.number - 1];
            hijriEl.innerText = `${adjustedDay} ${targetMonthIndo} ${hijri.year} H`;
        }
    }

    document.getElementById("todayPrayers").innerHTML = `
        <div class="prayer-card" id="card-Imsak"><div class="prayer-name">Imsak</div><div class="prayer-time">${t.Imsak.substring(0,5)}</div></div>
        <div class="prayer-card" id="card-Fajr"><div class="prayer-name">Subuh</div><div class="prayer-time">${t.Fajr.substring(0,5)}</div></div>
        <div class="prayer-card" id="card-Sunrise"><div class="prayer-name">Terbit</div><div class="prayer-time">${t.Sunrise.substring(0,5)}</div></div>
        <div class="prayer-card" id="card-Dhuhr"><div class="prayer-name">Dhuhur</div><div class="prayer-time">${t.Dhuhr.substring(0,5)}</div></div>
        <div class="prayer-card" id="card-Asr"><div class="prayer-name">Ashar</div><div class="prayer-time">${t.Asr.substring(0,5)}</div></div>
        <div class="prayer-card" id="card-Maghrib"><div class="prayer-name">Maghrib</div><div class="prayer-time">${t.Maghrib.substring(0,5)}</div></div>
        <div class="prayer-card" id="card-Isha"><div class="prayer-name">Isya</div><div class="prayer-time">${t.Isha.substring(0,5)}</div></div>
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
        document.getElementById("sectionTitleText").innerText = `Jadwal ${monthName} ${hYear} H`;
    } else {
        // Ambil data kalender Masehi
        const [y, m] = document.getElementById("monthSelect").value.split("-");
        url = `https://api.aladhan.com/v1/calendar?latitude=${lat}&longitude=${lng}&method=${METHOD}&tune=${TUNE}&month=${m}&year=${y}&adjustment=${ADJUSTMENT}&calendarMethod=MATHEMATICAL`;
        // Update judul section
        const monthIdx = parseInt(m) - 1;
        document.getElementById("sectionTitleText").innerText = `Jadwal ${namaBulan[monthIdx]} ${y}`;
    }

    const res = await fetch(url);
    const result = await res.json();
    const data = result.data;

    // Render header
    if (calendarMode === 'hijriah') {
        tableHead.innerHTML = `<tr>
            <th>Hijri</th>
            <th>Masehi</th>
            <th>Hari</th>
            <th>Imsak</th>
            <th>Subuh</th>
            <th>Terbit</th>
            <th>Dhuhur</th>
            <th>Ashar</th>
            <th>Maghrib</th>
            <th>Isya</th>
        </tr>`;
    } else {
        tableHead.innerHTML = `<tr>
            <th>Tgl</th>
            <th>Hari</th>
            <th>Imsak</th>
            <th>Subuh</th>
            <th>Terbit</th>
            <th>Dhuhur</th>
            <th>Ashar</th>
            <th>Maghrib</th>
            <th>Isya</th>
        </tr>`;
    }

    // Render baris
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
                       <td><strong>${namaHari[gregorian.getDay()]}</strong></td>`;
        } else {
            dateCol = `<td><strong>${day.date.gregorian.day.replace(/^0+/, '')}</strong></td>
                       <td><strong>${namaHari[gregorian.getDay()]}</strong></td>`;
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
        tableBody.innerHTML += row;
    });

    document.getElementById("loadingMessage").style.display = "none";
}

// --- Jalankan saat halaman dimuat ---
window.onload = loadData;
