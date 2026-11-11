/**
 * eclipse.js
 * Gerhana Matahari & Bulan dengan Astronomy Engine, beserta keadaan lokal
 * (terlihat atau tidak, waktu kontak, tinggi di atas ufuk) untuk satu lokasi.
 *
 * Diuji terhadap JPL DE440s (Skyfield): 23 gerhana Bulan 2026–2035,
 * jenis sama semua, selisih waktu puncak ≤ 18 detik.
 *
 * Depends on: astronomy-engine (global `Astronomy`), hijri.js (Hijri, HIJRI_CONFIG)
 */
const Eclipses = (() => {
    const DAY_MS = 86400000;
    const cache = new Map();

    function moonAltitude(date, observer) {
        const eq = Astronomy.Equator(Astronomy.Body.Moon, date, observer, true, true);
        return Astronomy.Horizon(date, observer, eq.ra, eq.dec, 'normal').altitude;
    }

    // Kontak gerhana Bulan: penumbra (P1/P4), sebagian (U1/U4), total (U2/U3)
    function lunarContacts(e, observer) {
        const peak = e.peak.date.getTime();
        const at = (minutes, key) => {
            const date = new Date(peak + minutes * 60000);
            return { key, date, altitude: moonAltitude(date, observer) };
        };
        const c = [at(-e.sd_penum, 'P1')];
        if (e.sd_partial > 0) c.push(at(-e.sd_partial, 'U1'));
        if (e.sd_total > 0) c.push(at(-e.sd_total, 'U2'));
        c.push(at(0, 'peak'));
        if (e.sd_total > 0) c.push(at(e.sd_total, 'U3'));
        if (e.sd_partial > 0) c.push(at(e.sd_partial, 'U4'));
        c.push(at(e.sd_penum, 'P4'));
        return c;
    }

    function lunar(e, observer) {
        const contacts = lunarContacts(e, observer);
        // Fase yang tampak: penumbra sulit dilihat; untuk sebagian/total pakai U1–U4
        const visibleSpan = contacts.filter(c => e.kind === 'penumbral' ? true : c.key !== 'P1' && c.key !== 'P4');
        const visible = visibleSpan.some(c => c.altitude > 0);
        return {
            type: 'lunar',
            kind: e.kind,
            peak: e.peak.date,
            obscuration: e.obscuration,
            contacts,
            visible,
            peakAltitude: contacts.find(c => c.key === 'peak').altitude,
            // Sholat khusuf hanya untuk gerhana sebagian/total yang terlihat
            prayer: visible && e.kind !== 'penumbral'
        };
    }

    function solar(g, observer) {
        const info = {
            type: 'solar',
            kind: g.kind,
            peak: g.peak.date,
            centralLat: g.latitude,
            centralLng: g.longitude,
            visible: false,
            prayer: false,
            local: null
        };
        // Keadaan lokal: cari gerhana lokal yang puncaknya dekat puncak global
        const local = Astronomy.SearchLocalSolarEclipse(new Date(g.peak.date.getTime() - 2 * DAY_MS), observer);
        if (Math.abs(local.peak.time.date - g.peak.date) < 1.5 * DAY_MS) {
            const contacts = [
                { key: 'C1', date: local.partial_begin.time.date, altitude: local.partial_begin.altitude },
                local.total_begin && { key: 'C2', date: local.total_begin.time.date, altitude: local.total_begin.altitude },
                { key: 'peak', date: local.peak.time.date, altitude: local.peak.altitude },
                local.total_end && { key: 'C3', date: local.total_end.time.date, altitude: local.total_end.altitude },
                { key: 'C4', date: local.partial_end.time.date, altitude: local.partial_end.altitude }
            ].filter(Boolean);
            const visible = contacts.some(c => c.altitude > 0);
            info.local = { kind: local.kind, obscuration: local.obscuration, contacts };
            info.visible = visible;
            info.prayer = visible;
        }
        return info;
    }

    /** Semua gerhana dengan puncak di antara `from` dan `to` (Date), dilihat dari `loc` {lat, lng} */
    function between(from, to, loc) {
        const key = `${from.getTime()}|${to.getTime()}|${loc.lat}|${loc.lng}`;
        if (cache.has(key)) return cache.get(key);
        const observer = new Astronomy.Observer(loc.lat, loc.lng, 0);
        const list = [];
        for (let e = Astronomy.SearchLunarEclipse(from); e.peak.date < to; e = Astronomy.NextLunarEclipse(e.peak)) {
            list.push(lunar(e, observer));
        }
        for (let g = Astronomy.SearchGlobalSolarEclipse(from); g.peak.date < to; g = Astronomy.NextGlobalSolarEclipse(g.peak)) {
            list.push(solar(g, observer));
        }
        list.sort((a, b) => a.peak - b.peak);
        cache.set(key, list);
        return list;
    }

    /** Gerhana berikutnya (n buah) sejak `from` */
    function next(from, loc, count = 4) {
        const out = [];
        let to = new Date(from.getTime() + 400 * DAY_MS);
        while (out.length < count) {
            out.push(...between(from, to, loc).filter(e => !out.includes(e)));
            from = to;
            to = new Date(to.getTime() + 400 * DAY_MS);
        }
        return out.slice(0, count);
    }

    /** Nomor hari lokal (zona markaz) dari sebuah waktu */
    const localDayNum = (date) => Math.floor((date.getTime() + HIJRI_CONFIG.utcOffset * 3600000) / DAY_MS);

    /** Gerhana pada nomor hari `n` (zona markaz), dilihat dari markaz pertama */
    function onDay(n) {
        if (typeof Astronomy === 'undefined') return [];
        const g = Hijri.dayNumToDate(n);
        const year = g.getFullYear();
        const markaz = (HIJRI_CONFIG.markaz && HIJRI_CONFIG.markaz[0]) || { lat: 25.033, lng: 121.5654 };
        const list = between(new Date(Date.UTC(year, 0, 1) - 2 * DAY_MS), new Date(Date.UTC(year + 1, 0, 1) + 2 * DAY_MS), markaz);
        return list.filter(e => localDayNum(e.peak) === n);
    }

    /** Kunci terjemahan jenis gerhana, mis. 'ecl_lunar_total' */
    const kindKey = (e) => `ecl_${e.type}_${e.kind}`;

    return { between, next, onDay, localDayNum, kindKey };
})();
