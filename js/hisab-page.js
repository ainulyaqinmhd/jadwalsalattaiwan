/**
 * hisab-page.js
 * Dipakai dua halaman:
 *   hisab.html      — Belajar hisab: contoh perhitungan langkah demi langkah + gambar
 *   kalkulator.html — Kalkulator: semua masukan, ringkasan hasil, pencari gerhana
 * Bagian yang tidak ada di halaman (mis. #s1, #cResults, #eResults) dilewati.
 * Semua angka dihitung langsung dengan Astronomy Engine; nilai "dari rumus" dihitung manual
 * dengan rumus yang ditampilkan agar bisa dibandingkan dengan hasil tepatnya.
 *
 * Depends on: translations.js, locations.js, hilal-de440.js, hijri.js, eclipse.js, astronomy-engine
 */
const HisabPage = (() => {
    const DAY_MS = 86400000;
    const AU_KM = 149597870.7;
    const R_EARTH_KM = 6378.137;
    const R_MOON_KM = 1737.4;
    const SYNODIC_MONTH = 29.530588853;
    const ANCHOR_IDX = 1447 * 12;                      // 1 Muharram 1447 H
    const ANCHOR_CONJ_MS = Date.UTC(2025, 5, 25, 10, 31);
    const rad = Math.PI / 180;

    // ---------- Teks (ID/EN) ----------
    const T = {
        id: {
            conj_utc: 'Ijtimak (UTC)', conj_local: 'Ijtimak (waktu lokal)',
            lam_sun: 'Bujur ekliptika Matahari λ☉', lam_moon: 'Bujur ekliptika Bulan λ☾',
            obs_date: 'Tanggal pengamatan', sunset: 'Matahari terbenam', sun_az: 'Azimut Matahari',
            conj_after: 'Ijtimak terjadi setelah Matahari terbenam, jadi hilal belum ada pada sore ini.',
            no_sunset: 'Matahari tidak terbenam pada tanggal ini di lokasi ini.',
            moon_ra: 'Asensio rekta Bulan α☾ (geosentrik)', moon_dec: 'Deklinasi Bulan δ☾ (geosentrik)',
            lst: 'Waktu sideris lokal (LST)', ha: 'Sudut jam H = LST − α', lat: 'Lintang tempat φ',
            h_geo: 'Tinggi geosentrik h (dari rumus)', hp: 'Paralaks horizontal HP',
            h_topo_approx: 'h − HP · cos h (pendekatan)', h_marie: "Tinggi mar'i (toposentrik, tanpa refraksi)",
            h_refr: 'Dengan refraksi (pembanding)', h_upper: 'Piringan atas + refraksi (pembanding)', moon_az: 'Azimut Bulan',
            sun_ra: 'Asensio rekta Matahari α☉', sun_dec: 'Deklinasi Matahari δ☉',
            elong_manual: 'Elongasi dari rumus', elong_api: 'Elongasi haqiqi (hasil tepat)',
            elong_topo: 'Elongasi toposentrik (pembanding)',
            crit: 'Syarat', value: 'Nilai', need: 'Batas', ok: 'Hasil',
            crit_conj: 'Ijtimak sebelum ghurub', crit_alt: "Tinggi mar'i", crit_elong: 'Elongasi haqiqi',
            yes: 'Ya', no: 'Tidak',
            met: 'Hilal memenuhi kriteria IRNU', not_met: 'Hilal belum memenuhi kriteria IRNU',
            start_is: '1 {month} {year} H jatuh pada', istikmal: 'istikmal, bulan sebelumnya 30 hari',
            obs_other: 'Tanggal pengamatan bukan hari ijtimak, jadi hasil ini hanya untuk sore tersebut.',
            age: 'Umur hilal saat ghurub', moonset: 'Bulan terbenam', lag: 'Lama hilal di atas ufuk',
            illum: 'Iluminasi Bulan', daz: 'Selisih azimut Bulan − Matahari', dist: 'Jarak Bulan (toposentrik)',
            sd: 'Semidiameter Bulan', wh: 'Wujudul hilal (Muhammadiyah)',
            de_cmp: 'Tabel JPL DE440s (markaz PCINU Taiwan)', de_diff: 'selisih',
            custom: 'Lokasi lain (isi sendiri)', markaz: 'PCINU Taiwan (Taipei), markaz',
            minutes: 'menit', hours: 'jam',
            invalid: 'Periksa isian: tahun 1300–1600 H, lintang −90…90, bujur −180…180, zona waktu −12…14.',
            no_lib: 'Pustaka astronomi gagal dimuat. Periksa koneksi internet lalu muat ulang halaman.',
            ecl_from_none: 'Tidak ada gerhana ditemukan.'
        },
        en: {
            conj_utc: 'Conjunction (UTC)', conj_local: 'Conjunction (local time)',
            lam_sun: 'Sun ecliptic longitude λ☉', lam_moon: 'Moon ecliptic longitude λ☾',
            obs_date: 'Observation date', sunset: 'Sunset', sun_az: 'Sun azimuth',
            conj_after: 'The conjunction happens after sunset, so there is no crescent this evening.',
            no_sunset: 'The Sun does not set on this date at this location.',
            moon_ra: 'Moon right ascension α☾ (geocentric)', moon_dec: 'Moon declination δ☾ (geocentric)',
            lst: 'Local sidereal time (LST)', ha: 'Hour angle H = LST − α', lat: 'Latitude φ',
            h_geo: 'Geocentric altitude h (by formula)', hp: 'Horizontal parallax HP',
            h_topo_approx: 'h − HP · cos h (approximation)', h_marie: "Mar'i altitude (topocentric, no refraction)",
            h_refr: 'With refraction (comparison)', h_upper: 'Upper limb + refraction (comparison)', moon_az: 'Moon azimuth',
            sun_ra: 'Sun right ascension α☉', sun_dec: 'Sun declination δ☉',
            elong_manual: 'Elongation by formula', elong_api: 'True elongation (exact)',
            elong_topo: 'Topocentric elongation (comparison)',
            crit: 'Condition', value: 'Value', need: 'Limit', ok: 'Result',
            crit_conj: 'Conjunction before sunset', crit_alt: "Mar'i altitude", crit_elong: 'True elongation',
            yes: 'Yes', no: 'No',
            met: 'The crescent meets the IRNU criterion', not_met: 'The crescent does not meet the IRNU criterion',
            start_is: '1 {month} {year} AH falls on', istikmal: 'istikmal, previous month has 30 days',
            obs_other: 'The observation date is not the conjunction day, so this result is only for that evening.',
            age: 'Crescent age at sunset', moonset: 'Moonset', lag: 'Lag time (Moon above horizon)',
            illum: 'Moon illumination', daz: 'Azimuth difference Moon − Sun', dist: 'Moon distance (topocentric)',
            sd: 'Moon semidiameter', wh: 'Wujudul hilal (Muhammadiyah)',
            de_cmp: 'JPL DE440s table (PCINU Taiwan location)', de_diff: 'difference',
            custom: 'Other location (enter manually)', markaz: 'PCINU Taiwan (Taipei), markaz',
            minutes: 'min', hours: 'h',
            invalid: 'Check the inputs: year 1300–1600 AH, latitude −90…90, longitude −180…180, time zone −12…14.',
            no_lib: 'The astronomy library failed to load. Check your internet connection and reload the page.',
            ecl_from_none: 'No eclipses found.'
        }
    };
    const L = (key) => (T[currentLang] || T.id)[key];
    const tr = (key) => translations[key][currentLang];

    // ---------- Lokasi ----------
    const markaz = HIJRI_CONFIG.markaz && HIJRI_CONFIG.markaz[0];
    const PLACES = [
        { key: 'markaz', lat: markaz.lat, lng: markaz.lng, elev: 0, tz: HIJRI_CONFIG.utcOffset },
        ...Object.entries(locations).filter(([n]) => n !== 'Taipei')
            .map(([n, c]) => ({ key: n, name: n, lat: c.lat, lng: c.lng, elev: 0, tz: 8 })),
        { key: 'Sabang', name: 'Sabang (Aceh)', lat: 5.8926, lng: 95.3238, elev: 0, tz: 7 },
        { key: 'Jakarta', name: 'Jakarta', lat: -6.2088, lng: 106.8456, elev: 0, tz: 7 },
        { key: 'Makkah', name: 'Makkah', lat: 21.4225, lng: 39.8262, elev: 277, tz: 3 },
        { key: 'custom' }
    ];
    const shortPlaceName = (inp) => {
        const key = $('hPlace').value;
        if (key === 'markaz') return 'Taipei (markaz)';
        if (key === 'custom') return `${inp.lat}°, ${inp.lng}°`;
        return PLACES.find(p => p.key === key).name;
    };
    const placeName = (p) => p.key === 'markaz' ? L('markaz') : p.key === 'custom' ? L('custom') : p.name;

    const $ = (id) => document.getElementById(id);
    let obsAuto = true;   // tanggal pengamatan mengikuti hari ijtimak

    // ---------- Format ----------
    const pad2 = (n) => String(n).padStart(2, '0');
    const norm360 = (x) => ((x % 360) + 360) % 360;
    const norm180 = (x) => { const y = norm360(x); return y > 180 ? y - 360 : y; };

    function dms(x, withSec = true) {
        const sign = x < 0 ? '−' : '';
        const total = Math.round(Math.abs(x) * (withSec ? 3600 : 60));
        if (!withSec) return `${sign}${Math.floor(total / 60)}° ${pad2(total % 60)}′`;
        return `${sign}${Math.floor(total / 3600)}° ${pad2(Math.floor(total / 60) % 60)}′ ${pad2(total % 60)}″`;
    }

    function hms(hours) {
        const total = Math.round(norm360(hours * 15) / 15 * 3600);
        return `${Math.floor(total / 3600) % 24}h ${pad2(Math.floor(total / 60) % 60)}m ${pad2(total % 60)}s`;
    }

    const tzLabel = (tz) => `UTC${tz >= 0 ? '+' : '−'}${Math.abs(tz)}`;

    function dateTime(date, tz, withSec = true) {
        const d = new Date(date.getTime() + tz * 3600000);
        const time = `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}${withSec ? `:${pad2(d.getUTCSeconds())}` : ''}`;
        return `${arrays.namaHari[currentLang][d.getUTCDay()]}, ${d.getUTCDate()} ${arrays.namaBulan[currentLang][d.getUTCMonth()]} ${d.getUTCFullYear()}, ${time}`;
    }

    function dayLabel(n) {
        const g = Hijri.dayNumToDate(n);
        return `${arrays.namaHari[currentLang][g.getDay()]} ${Hijri.pasaran(n)}, ${g.getDate()} ${arrays.namaBulan[currentLang][g.getMonth()]} ${g.getFullYear()}`;
    }

    const isoOfDay = (n) => { const g = Hijri.dayNumToDate(n); return `${g.getFullYear()}-${pad2(g.getMonth() + 1)}-${pad2(g.getDate())}`; };
    const dayOfIso = (s) => { const [y, m, d] = s.split('-').map(Number); return Hijri.dayNum(y, m, d); };

    const row = (label, value, cls = '') => `<div class="${cls}"><dt>${label}</dt><dd>${value}</dd></div>`;
    const mark = (ok) => `<span class="hilal-check ${ok ? 'ok' : 'no'}">${ok ? '✓' : '✗'}</span>`;

    // ---------- Masukan ----------
    function fillSelects() {
        const monthSel = $('hMonth');
        const m = monthSel.value;
        monthSel.innerHTML = arrays.namaBulanHijri[currentLang].map((n, i) => `<option value="${i + 1}">${n}</option>`).join('');
        if (m) monthSel.value = m;

        const placeSel = $('hPlace');
        const p = placeSel.value;
        placeSel.innerHTML = PLACES.map(pl => `<option value="${pl.key}">${placeName(pl)}</option>`).join('');
        if (p) placeSel.value = p;
    }

    function applyPlace(key) {
        const p = PLACES.find(pl => pl.key === key);
        if (!p || p.key === 'custom') return;
        $('hLat').value = p.lat;
        $('hLng').value = p.lng;
        $('hElev').value = p.elev;
        $('hTz').value = p.tz;
    }

    function readInputs() {
        const v = (id) => Number($(id).value);
        const inp = {
            year: Math.round(v('hYear')), month: v('hMonth'),
            lat: v('hLat'), lng: v('hLng'), elev: v('hElev') || 0, tz: v('hTz'),
            minAlt: v('hMinAlt'), minElong: v('hMinElong')
        };
        const ok = inp.year >= 1300 && inp.year <= 1600 && Math.abs(inp.lat) <= 90 && Math.abs(inp.lng) <= 180 &&
            inp.tz >= -12 && inp.tz <= 14 && $('hLat').value !== '' && $('hLng').value !== '';
        return ok ? inp : null;
    }

    // ---------- Perhitungan ----------
    function geoEquatorOfDate(body, t) {
        const rot = Astronomy.Rotation_EQJ_EQD(t);
        return Astronomy.EquatorFromVector(Astronomy.RotateVector(rot, Astronomy.GeoVector(body, t, true)));
    }

    function calculate(inp) {
        // 1) Ijtimak
        const idx = inp.year * 12 + inp.month - 1;
        const approx = ANCHOR_CONJ_MS + (idx - ANCHOR_IDX) * SYNODIC_MONTH * DAY_MS;
        const conj = Astronomy.SearchMoonPhase(0, new Date(approx - 3 * DAY_MS), 6);
        const conjDay = Math.floor((conj.date.getTime() + inp.tz * 3600000) / DAY_MS);
        if (obsAuto || !$('hDate').value) $('hDate').value = isoOfDay(conjDay);
        const obsDay = dayOfIso($('hDate').value);

        const r = {
            inp, conj: conj.date, conjDay, obsDay,
            lamSun: Astronomy.SunPosition(conj).elon,
            lamMoon: Astronomy.EclipticGeoMoon(conj).lon
        };

        // 2) Ghurub
        const observer = new Astronomy.Observer(inp.lat, inp.lng, inp.elev);
        const sunset = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1,
            new Date(obsDay * DAY_MS - inp.tz * 3600000), 1);
        if (!sunset) return { ...r, noSunset: true };
        const t = sunset;
        r.sunset = t.date;
        r.conjBefore = conj.date < t.date;
        r.lamDiff = norm180(Astronomy.EclipticGeoMoon(t).lon - Astronomy.SunPosition(t).elon);

        const sT = Astronomy.Equator(Astronomy.Body.Sun, t, observer, true, true);
        r.sunAz = Astronomy.Horizon(t, observer, sT.ra, sT.dec).azimuth;

        // 3) Posisi Bulan
        const mG = geoEquatorOfDate(Astronomy.Body.Moon, t);
        const sG = geoEquatorOfDate(Astronomy.Body.Sun, t);
        r.moonRa = mG.ra; r.moonDec = mG.dec; r.sunRa = sG.ra; r.sunDec = sG.dec;
        r.lst = norm360(Astronomy.SiderealTime(t) * 15 + inp.lng);
        r.ha = norm180(r.lst - mG.ra * 15);
        const phi = inp.lat * rad, dec = mG.dec * rad;
        r.hGeo = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(r.ha * rad)) / rad;
        r.hp = Math.asin(R_EARTH_KM / (mG.dist * AU_KM)) / rad;
        r.hTopoApprox = r.hGeo - r.hp * Math.cos(r.hGeo * rad);

        const mT = Astronomy.Equator(Astronomy.Body.Moon, t, observer, true, true);
        const hor = Astronomy.Horizon(t, observer, mT.ra, mT.dec);
        r.alt = hor.altitude;
        r.moonAz = hor.azimuth;
        r.distKm = mT.dist * AU_KM;
        r.sd = Math.asin(R_MOON_KM / r.distKm) / rad;
        r.altRefr = Astronomy.Horizon(t, observer, mT.ra, mT.dec, 'normal').altitude;
        r.altUpper = r.altRefr + r.sd;

        // 4) Elongasi
        const ds = sG.dec * rad, dm = mG.dec * rad, dra = (sG.ra - mG.ra) * 15 * rad;
        r.elongManual = Math.acos(Math.sin(ds) * Math.sin(dm) + Math.cos(ds) * Math.cos(dm) * Math.cos(dra)) / rad;
        r.elong = Astronomy.AngleFromSun(Astronomy.Body.Moon, t);
        r.elongTopo = Astronomy.AngleBetween(mT.vec, sT.vec);

        // 5) Kriteria
        r.altOk = r.alt >= inp.minAlt;
        r.elongOk = r.elong >= inp.minElong;
        r.met = r.conjBefore && r.altOk && r.elongOk;

        // 6) Tambahan
        const moonset = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, -1, t, 1);
        r.moonset = moonset ? moonset.date : null;
        r.lagMin = moonset ? (moonset.date - t.date) / 60000 : null;
        r.illum = Astronomy.Illumination(Astronomy.Body.Moon, t).phase_fraction * 100;
        r.ageH = (t.date - conj.date) / 3600000;
        r.daz = norm180(r.moonAz - r.sunAz);
        r.wujud = r.conjBefore && r.moonset !== null && r.lagMin > 0;

        // Pembanding tabel JPL bila lokasi = markaz & sore hari ijtimak
        const tb = typeof HILAL_TABLE !== 'undefined' && HILAL_TABLE.months[`${inp.year}-${inp.month}`];
        const atMarkaz = Math.abs(inp.lat - markaz.lat) < 1e-4 && Math.abs(inp.lng - markaz.lng) < 1e-4 &&
            inp.elev === 0 && inp.tz === HIJRI_CONFIG.utcOffset;
        if (tb && atMarkaz && obsDay === conjDay && tb.a !== null) r.de = tb;
        return r;
    }

    // ---------- Tampilan ----------
    function renderSteps(r) {
        const tz = r.inp.tz;
        $('s1').innerHTML =
            row(L('conj_utc'), dateTime(r.conj, 0)) +
            row(`${L('conj_local')} (${tzLabel(tz)})`, dateTime(r.conj, tz)) +
            row(L('lam_sun'), dms(norm360(r.lamSun))) +
            row(L('lam_moon'), dms(norm360(r.lamMoon)));

        if (r.noSunset) {
            $('s2').innerHTML = row(L('obs_date'), dayLabel(r.obsDay)) + `<p class="step-warn">${L('no_sunset')}</p>`;
            ['s3', 's4', 's6'].forEach(id => { $(id).innerHTML = ''; });
            $('s5').innerHTML = '';
            return;
        }

        $('s2').innerHTML =
            row(L('obs_date'), dayLabel(r.obsDay)) +
            row(`${L('sunset')} (${tzLabel(tz)})`, dateTime(r.sunset, tz)) +
            row(L('sun_az'), dms(r.sunAz, false)) +
            (r.conjBefore ? '' : `<p class="step-warn">${L('conj_after')}</p>`);

        $('s3').innerHTML =
            row(L('moon_ra'), hms(r.moonRa)) +
            row(L('moon_dec'), dms(r.moonDec)) +
            row(L('lat'), dms(r.inp.lat)) +
            row(L('lst'), `${dms(r.lst)} = ${hms(r.lst / 15)}`) +
            row(L('ha'), dms(r.ha)) +
            row(L('h_geo'), dms(r.hGeo)) +
            row(L('hp'), dms(r.hp)) +
            row(L('h_topo_approx'), dms(r.hTopoApprox)) +
            row(L('h_marie'), `<strong>${dms(r.alt)}</strong>`, 'is-key') +
            row(L('h_refr'), dms(r.altRefr)) +
            row(L('h_upper'), dms(r.altUpper)) +
            row(L('moon_az'), dms(r.moonAz, false));

        $('s4').innerHTML =
            row(L('sun_ra'), hms(r.sunRa)) +
            row(L('sun_dec'), dms(r.sunDec)) +
            row(L('elong_manual'), dms(r.elongManual)) +
            row(L('elong_api'), `<strong>${dms(r.elong)}</strong>`, 'is-key') +
            row(L('elong_topo'), dms(r.elongTopo));

        const critRow = (label, value, need, ok) =>
            `<tr><td>${label}</td><td>${value}</td><td>${need}</td><td>${mark(ok)}</td></tr>`;
        $('s5').innerHTML = `<div class="table-container"><table class="crit-table">
            <thead><tr><th>${L('crit')}</th><th>${L('value')}</th><th>${L('need')}</th><th>${L('ok')}</th></tr></thead>
            <tbody>
                ${critRow(L('crit_conj'), r.conjBefore ? L('yes') : L('no'), L('yes'), r.conjBefore)}
                ${critRow(L('crit_alt'), dms(r.alt, false), `≥ ${r.inp.minAlt}°`, r.altOk)}
                ${critRow(L('crit_elong'), dms(r.elong, false), `≥ ${r.inp.minElong}°`, r.elongOk)}
            </tbody></table></div>`;

        let extra =
            row(L('age'), r.ageH >= 0
                ? `${Math.floor(r.ageH)} ${L('hours')} ${pad2(Math.floor((r.ageH % 1) * 60))} ${L('minutes')}` : '-') +
            row(`${L('moonset')} (${tzLabel(tz)})`, r.moonset ? dateTime(r.moonset, tz) : '-') +
            row(L('lag'), r.lagMin !== null ? `${Math.round(r.lagMin)} ${L('minutes')}` : '-') +
            row(L('illum'), `${r.illum.toFixed(2)}%`) +
            row(L('daz'), dms(r.daz, false)) +
            row(L('dist'), `${Math.round(r.distKm).toLocaleString(currentLang === 'en' ? 'en-US' : 'id-ID')} km`) +
            row(L('sd'), dms(r.sd)) +
            row(L('wh'), `${r.wujud ? L('yes') : L('no')} ${mark(r.wujud)}`);
        if (r.de) {
            const da = (r.alt - r.de.a) * 60, de = (r.elong - r.de.e) * 60;
            extra += row(L('de_cmp'),
                `${dms(r.de.a)} / ${dms(r.de.e)} <small>(${L('de_diff')} ${da.toFixed(2)}′ / ${de.toFixed(2)}′)</small>`, 'is-key');
        }
        $('s6').innerHTML = extra;
    }

    function renderVerdict(r) {
        const box = $('hVerdict');
        if (r.noSunset) { box.className = 'verdict'; box.innerHTML = `<p>${L('no_sunset')}</p>`; return; }
        const monthName = arrays.namaBulanHijri[currentLang][r.inp.month - 1];
        let html = `<strong class="verdict-title">${r.met ? L('met') : L('not_met')}</strong>`;
        if (r.obsDay === r.conjDay) {
            const start = r.met ? r.obsDay + 1 : r.obsDay + 2;
            html += `<p>${L('start_is').replace('{month}', monthName).replace('{year}', r.inp.year)}
                <b>${dayLabel(start)}</b>${r.met ? '' : ` <small>(${L('istikmal')})</small>`}</p>`;
        } else {
            html += `<p>${L('obs_other')}</p>`;
        }
        if (!r.conjBefore) html += `<p>${L('conj_after')}</p>`;
        html += `<p class="verdict-nums">${L('crit_alt')} ${dms(r.alt, false)} ${mark(r.altOk)} · ${L('crit_elong')} ${dms(r.elong, false)} ${mark(r.elongOk)}</p>`;
        box.className = `verdict ${r.met ? 'is-met' : 'is-not-met'}`;
        box.innerHTML = html;
    }

    function compute() {
        if (typeof Astronomy === 'undefined') { $('hVerdict').innerHTML = `<p>${L('no_lib')}</p>`; return; }
        const inp = readInputs();
        if (!inp) { $('hVerdict').className = 'verdict'; $('hVerdict').innerHTML = `<p>${L('invalid')}</p>`; return; }
        const r = calculate(inp);
        renderVerdict(r);
        if ($('s1')) renderSteps(r);
        if ($('cResults')) renderResults(r);
        try { if ($('v1') && typeof HisabViz !== 'undefined') HisabViz.render(r, { dms }); } catch (err) { console.error('Gambar gagal:', err); }
        try {
            if ($('vPos') && typeof HisabViz !== 'undefined') HisabViz.positions(r, { dms, dayLabel, place: shortPlaceName(inp) });
        } catch (err) { console.error('Gambar posisi gagal:', err); }
        updateUrl(inp);
        if ($('eResults')) renderEclipses();
    }

    // Ringkasan hasil (kalkulator.html)
    function renderResults(r) {
        const box = $('cResults');
        if (r.noSunset) { box.innerHTML = ''; return; }
        const tz = r.inp.tz;
        const time = (d) => d ? dateTime(d, tz).split(', ').pop() : '-';
        box.innerHTML =
            row(`${L('conj_local')} (${tzLabel(tz)})`, dateTime(r.conj, tz)) +
            row(L('obs_date'), dayLabel(r.obsDay)) +
            row(`${L('sunset')} (${tzLabel(tz)})`, time(r.sunset)) +
            row(`${L('moonset')} (${tzLabel(tz)})`, time(r.moonset)) +
            row(L('h_marie'), `<strong>${dms(r.alt)}</strong> ${mark(r.altOk)}`, 'is-key') +
            row(L('elong_api'), `<strong>${dms(r.elong)}</strong> ${mark(r.elongOk)}`, 'is-key') +
            row(L('age'), r.ageH >= 0
                ? `${Math.floor(r.ageH)} ${L('hours')} ${pad2(Math.floor((r.ageH % 1) * 60))} ${L('minutes')}` : '-') +
            row(L('lag'), r.lagMin !== null && r.lagMin > 0 ? `${Math.round(r.lagMin)} ${L('minutes')}` : '-') +
            row(L('illum'), `${r.illum.toFixed(2)}%`) +
            row(L('moon_az'), dms(r.moonAz, false)) +
            row(L('daz'), dms(r.daz, false)) +
            row(L('wh'), `${r.wujud ? L('yes') : L('no')} ${mark(r.wujud)}`) +
            (r.de ? row(L('de_cmp'), `${dms(r.de.a)} / ${dms(r.de.e)}`) : '');
    }

    // ---------- Gerhana ----------
    function renderEclipses() {
        const inp = readInputs();
        const box = $('eResults');
        if (!inp || typeof Astronomy === 'undefined' || !$('eFrom').value) { box.innerHTML = ''; return; }
        const from = new Date(dayOfIso($('eFrom').value) * DAY_MS - inp.tz * 3600000);
        const placeKey = $('hPlace').value;
        const place = placeKey === 'custom' ? `${inp.lat}°, ${inp.lng}°` : placeName(PLACES.find(p => p.key === placeKey));
        const list = Eclipses.next(from, { lat: inp.lat, lng: inp.lng }, 4);
        if (!list.length) { box.innerHTML = `<p>${L('ecl_from_none')}</p>`; return; }

        box.innerHTML = list.map(e => {
            let vis = tr(e.visible ? 'ecl_visible' : 'ecl_not_visible').replace('{place}', place);
            if (e.type === 'solar' && e.visible && e.local && e.local.kind !== e.kind) {
                vis += `, ${tr('ecl_seen_as').replace('{kind}', tr(`ecl_solar_${e.local.kind}`).toLowerCase())}`;
            }
            const contacts = e.type === 'lunar' ? e.contacts : (e.local ? e.local.contacts : []);
            const rows = contacts.map(c => `<li class="${c.altitude > 0 ? '' : 'is-below'}${c.key === 'peak' ? ' is-peak' : ''}">
                <span>${tr(`ecl_${c.key}`)}</span><strong>${dateTime(c.date, inp.tz, false).split(', ').pop()}</strong>
                <small>${c.altitude > 0 ? `${Math.round(c.altitude)}°` : tr('ecl_below')}</small></li>`).join('');
            let note = '';
            if (e.type === 'solar' && e.visible && e.local) note += `<p>${tr('ecl_obscured').replace('{p}', Math.round(e.local.obscuration * 100))}</p>`;
            if (e.prayer) note += `<p class="ecl-prayer">${tr(e.type === 'lunar' ? 'ecl_prayer_lunar' : 'ecl_prayer_solar')}</p>`;
            else if (e.kind === 'penumbral') note += `<p>${tr('ecl_penumbral_note')}</p>`;
            return `<div class="ecl-card${e.visible ? ' is-visible' : ''}">
                <div class="ecl-head"><strong>${tr(Eclipses.kindKey(e))}</strong>
                    <span>${dateTime(e.peak, inp.tz, false)} (${tzLabel(inp.tz)})</span></div>
                <div class="ecl-vis">${vis}</div>
                ${rows ? `<ul class="ecl-contacts">${rows}</ul>` : ''}
                ${note}
            </div>`;
        }).join('');
    }

    // ---------- URL (bisa dibagikan) ----------
    function updateUrl(inp) {
        try {
            const q = new URLSearchParams({ y: inp.year, m: inp.month, p: $('hPlace').value });
            if ($('hPlace').value === 'custom') { q.set('lat', inp.lat); q.set('lng', inp.lng); q.set('tz', inp.tz); }
            history.replaceState(null, '', `?${q}`);
            // Tautan silang antara kalkulator dan halaman belajar membawa pilihan yang sama
            document.querySelectorAll('[data-hisab-link]').forEach(a => { a.href = `${a.dataset.hisabLink}?${q}`; });
        } catch (err) { /* abaikan */ }
    }

    // ---------- Mulai ----------
    function init() {
        fillSelects();
        const q = new URLSearchParams(location.search);
        let year, month;
        try {
            const today = Hijri.fromDate(new Date());
            year = today.month === 12 ? today.year + 1 : today.year;
            month = today.month === 12 ? 1 : today.month + 1;
        } catch (err) { year = 1448; month = 9; }
        $('hYear').value = Number(q.get('y')) || year;
        $('hMonth').value = Number(q.get('m')) || month;

        const placeKey = PLACES.some(p => p.key === q.get('p')) ? q.get('p') : 'markaz';
        $('hPlace').value = placeKey;
        applyPlace(placeKey === 'custom' ? 'markaz' : placeKey);
        if (placeKey === 'custom') {
            if (q.get('lat')) $('hLat').value = q.get('lat');
            if (q.get('lng')) $('hLng').value = q.get('lng');
            if (q.get('tz')) $('hTz').value = q.get('tz');
        }
        $('hMinAlt').value = HIJRI_CONFIG.minAltitude;
        $('hMinElong').value = HIJRI_CONFIG.minElongation;
        const now = new Date();
        if ($('eFrom')) $('eFrom').value = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;

        // Peristiwa
        ['hMonth', 'hYear'].forEach(id => $(id).addEventListener('change', () => { obsAuto = true; compute(); }));
        $('hPlace').addEventListener('change', (e) => { applyPlace(e.target.value); obsAuto = true; compute(); });
        ['hLat', 'hLng', 'hElev', 'hTz'].forEach(id => $(id).addEventListener('change', () => {
            $('hPlace').value = 'custom'; obsAuto = true; compute();
        }));
        ['hMinAlt', 'hMinElong'].forEach(id => $(id).addEventListener('change', compute));
        $('hDate').addEventListener('change', () => { obsAuto = false; compute(); });
        $('hDateReset').addEventListener('click', () => { obsAuto = true; compute(); });
        if ($('eFrom')) $('eFrom').addEventListener('change', renderEclipses);
    }

    init();
    return { compute, refreshLabels: fillSelects };
})();

// Dipanggil translations.js saat bahasa berganti (dan saat halaman siap)
function onLangChange() {
    HisabPage.refreshLabels();
    HisabPage.compute();
}

// --- Mode Offline (Service Worker) ---
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(err => console.warn('Service worker gagal didaftarkan:', err));
    });
}
