/**
 * prayer-api.js
 * Pengaturan perhitungan waktu sholat (dipakai index.html & kalender.html)
 * dan akses ke API Aladhan.
 */
const PrayerApi = (() => {
    const METHOD = 20;      // Kemenag RI: Subuh -20°, Isya -18°
    const IHTIYATH = 2;     // menit pengaman untuk Subuh, Dhuhur, Ashar, Maghrib, Isya
    const TUNE = `${IHTIYATH},${IHTIYATH},0,${IHTIYATH},${IHTIYATH},${IHTIYATH},0,${IHTIYATH},0`;
    const ADJUSTMENT = 1;

    const params = (lat, lng) =>
        `latitude=${lat}&longitude=${lng}&method=${METHOD}&tune=${TUNE}&adjustment=${ADJUSTMENT}`;

    async function fetchApi(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.code !== 200 || !json.data) throw new Error(`API: ${json.status || 'respons tidak valid'}`);
        return json.data;
    }

    const pad2 = (n) => String(n).padStart(2, '0');

    return {
        params,
        fetchApi,
        /** Waktu sholat satu hari. `date` adalah objek Date (tanggal lokal). */
        timings: (lat, lng, date) => fetchApi(
            `https://api.aladhan.com/v1/timings/${pad2(date.getDate())}-${pad2(date.getMonth() + 1)}-${date.getFullYear()}?${params(lat, lng)}`
        ),
        /** Waktu sholat satu bulan Masehi (bulan 1–12). */
        calendar: (lat, lng, year, month) => fetchApi(
            `https://api.aladhan.com/v1/calendar?${params(lat, lng)}&month=${month}&year=${year}`
        )
    };
})();
