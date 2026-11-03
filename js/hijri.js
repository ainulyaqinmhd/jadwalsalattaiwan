/**
 * hijri.js
 * Kalender Hijriah berbasis kriteria Imkanur Rukyah Nahdlatul Ulama (IRNU):
 *   - tinggi hilal mar'i  >= 3°   (toposentrik, pusat bulan, tanpa refraksi)
 *   - elongasi haqiqi     >= 6.4° (geosentrik, pusat bulan–pusat matahari)
 * dihitung saat matahari terbenam pada hari terjadinya ijtimak (konjungsi).
 * Jika terpenuhi di salah satu markaz → besoknya tanggal 1.
 * Jika tidak → istikmal (bulan berjalan digenapkan 30 hari).
 *
 * Depends on: astronomy-engine (global `Astronomy`), locations.js
 */

// ============================================================
// PENGATURAN — ubah di sini untuk koreksi manual
// ============================================================
const HIJRI_CONFIG = {
    minAltitude: 3,       // derajat, tinggi hilal mar'i minimal
    minElongation: 6.4,   // derajat, elongasi haqiqi minimal

    // Markaz perhitungan. null = semua kota di locations.js (wilayatul hukmi Taiwan).
    // Contoh markaz tunggal: [{ lat: 25.0330, lng: 121.5654 }]
    markaz: null,
    utcOffset: 8,         // zona waktu markaz (jam), Taiwan = UTC+8

    // Geser SEMUA tanggal Hijriah sekian hari (+1 / -1 / ...). Biasanya biarkan 0.
    globalOffset: 0,

    // Koreksi per bulan: tetapkan tanggal Masehi untuk tanggal 1 bulan Hijriah tertentu,
    // misalnya setelah ikhbar PBNU / hasil rukyatul hilal.
    // Format kunci: 'TAHUN-BULAN' (bulan 1–12), nilai: 'YYYY-MM-DD'.
    // Koreksi ini mengabaikan globalOffset.
    overrides: {
        // '1447-10': '2026-03-21', // contoh: 1 Syawal 1447 H = 21 Maret 2026
    }
};
// ============================================================

const Hijri = (() => {
    const DAY_MS = 86400000;
    const SYNODIC_MONTH = 29.530588853;
    // Patokan: 1 Muharram 1447 H, ijtimak 25 Juni 2025 10:31 UTC
    const ANCHOR_IDX = 1447 * 12;
    const ANCHOR_CONJ_MS = Date.UTC(2025, 5, 25, 10, 31);

    const startCache = new Map();
    let overrideMap = null;

    // Hari-hari penting (bulan-tanggal → kunci terjemahan di translations.js)
    const EVENTS = {
        '1-1': 'ev_new_year', '1-9': 'ev_tasua', '1-10': 'ev_asyura',
        '3-12': 'ev_maulid', '7-27': 'ev_isra', '8-15': 'ev_nisfu',
        '9-1': 'ev_ramadan', '9-17': 'ev_nuzul', '10-1': 'ev_fitri',
        '12-8': 'ev_tarwiyah', '12-9': 'ev_arafah', '12-10': 'ev_adha',
        '12-11': 'ev_tasyrik', '12-12': 'ev_tasyrik', '12-13': 'ev_tasyrik'
    };
    const HOLIDAYS = new Set(['ev_fitri', 'ev_adha']);

    function specialDay(month, day) {
        const key = EVENTS[`${month}-${day}`];
        if (key) return { key, kind: HOLIDAYS.has(key) ? 'holiday' : 'event' };
        if (day >= 13 && day <= 15) return { key: 'ev_bidh', kind: 'fasting' };
        return null;
    }

    function requireAstronomy() {
        if (typeof Astronomy === 'undefined') {
            const err = new Error('astronomy-engine belum dimuat');
            err.name = 'HijriError';
            throw err;
        }
    }

    // Nomor hari (hari sejak 1970-01-01) dari tanggal kalender
    const dayNum = (y, m, d) => Date.UTC(y, m - 1, d) / DAY_MS;
    const dayNumFromDate = (date) => dayNum(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const dayNumToDate = (n) => {
        const d = new Date(n * DAY_MS);
        return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    };
    const idxOf = (year, month) => year * 12 + (month - 1);

    function getOverrides() {
        if (overrideMap) return overrideMap;
        overrideMap = new Map();
        for (const [key, value] of Object.entries(HIJRI_CONFIG.overrides || {})) {
            const [hy, hm] = key.split('-').map(Number);
            const [y, m, d] = value.split('-').map(Number);
            if (hy && hm >= 1 && hm <= 12 && y && m && d) {
                overrideMap.set(idxOf(hy, hm), dayNum(y, m, d));
            } else {
                console.warn(`HIJRI_CONFIG.overrides: entri tidak valid "${key}": "${value}"`);
            }
        }
        return overrideMap;
    }

    function getMarkaz() {
        if (HIJRI_CONFIG.markaz && HIJRI_CONFIG.markaz.length) {
            return HIJRI_CONFIG.markaz.map(m => ({ name: m.name || `${m.lat}, ${m.lng}`, ...m }));
        }
        return Object.entries(locations).map(([name, c]) => ({ name, lat: c.lat, lng: c.lng }));
    }

    // Data hilal saat matahari terbenam pada tanggal lokal `localDay` di satu markaz
    function hilalAt(loc, localDay, conjTime) {
        const observer = new Astronomy.Observer(loc.lat, loc.lng, 0);
        const localMidnightUtc = new Date(localDay * DAY_MS - HIJRI_CONFIG.utcOffset * 3600000);
        const sunset = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, localMidnightUtc, 1);
        if (!sunset || sunset.date < conjTime.date) return null; // ijtimak setelah ghurub
        const eq = Astronomy.Equator(Astronomy.Body.Moon, sunset, observer, true, true);
        const altitude = Astronomy.Horizon(sunset, observer, eq.ra, eq.dec).altitude;
        const elongation = Astronomy.AngleFromSun(Astronomy.Body.Moon, sunset);
        return { altitude, elongation, sunset: sunset.date };
    }

    // Detail perhitungan IRNU untuk awal bulan (berguna untuk dicek di console)
    function evaluate(year, month) {
        requireAstronomy();
        const idx = idxOf(year, month);
        const approx = new Date(ANCHOR_CONJ_MS + (idx - ANCHOR_IDX) * SYNODIC_MONTH * DAY_MS);
        const conj = Astronomy.SearchMoonPhase(0, new Date(approx.getTime() - 3 * DAY_MS), 6);
        const conjLocalDay = Math.floor((conj.date.getTime() + HIJRI_CONFIG.utcOffset * 3600000) / DAY_MS);

        let best = null;
        for (const loc of getMarkaz()) {
            const h = hilalAt(loc, conjLocalDay, conj);
            if (h && (!best || h.altitude > best.altitude)) best = { ...h, ...loc };
            if (h && h.altitude >= HIJRI_CONFIG.minAltitude && h.elongation >= HIJRI_CONFIG.minElongation) {
                best = { ...h, ...loc };
                return { conjunction: conj.date, fulfilled: true, hilal: best, startDay: conjLocalDay + 1 };
            }
        }
        return { conjunction: conj.date, fulfilled: false, hilal: best, startDay: conjLocalDay + 2 };
    }

    // Nomor hari Masehi untuk tanggal 1 bulan Hijriah (indeks bulan)
    function monthStartIdx(idx) {
        if (startCache.has(idx)) return startCache.get(idx);
        let start;
        const ov = getOverrides();
        if (ov.has(idx)) {
            start = ov.get(idx);
        } else {
            start = evaluate(Math.floor(idx / 12), (idx % 12) + 1).startDay + (HIJRI_CONFIG.globalOffset || 0);
        }
        startCache.set(idx, start);
        return start;
    }

    function fromDayNum(n) {
        const anchorStart = monthStartIdx(ANCHOR_IDX);
        let idx = ANCHOR_IDX + Math.floor((n - anchorStart) / SYNODIC_MONTH);
        while (monthStartIdx(idx) > n) idx--;
        while (monthStartIdx(idx + 1) <= n) idx++;
        return {
            year: Math.floor(idx / 12),
            month: (idx % 12) + 1,
            day: n - monthStartIdx(idx) + 1
        };
    }

    return {
        dayNum,
        dayNumFromDate,
        dayNumToDate,
        evaluate,
        specialDay,
        /** Pasaran Jawa (Legi, Pahing, Pon, Wage, Kliwon). Patokan: 17 Agustus 1945 = Jumat Legi */
        pasaran: (n) => ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'][(((n - dayNum(1945, 8, 17)) % 5) + 5) % 5],
        /** true jika awal bulan ini ditetapkan manual lewat HIJRI_CONFIG.overrides */
        isFixed: (year, month) => getOverrides().has(idxOf(year, month)),
        /** Tanggal Hijriah dari objek Date (tanggal lokal) */
        fromDate: (date) => fromDayNum(dayNumFromDate(date)),
        fromDayNum,
        /** Rentang bulan Hijriah: { start, end } dalam nomor hari, end eksklusif */
        monthRange: (year, month) => ({
            start: monthStartIdx(idxOf(year, month)),
            end: monthStartIdx(idxOf(year, month) + 1),
            fixed: getOverrides().has(idxOf(year, month))
        })
    };
})();
