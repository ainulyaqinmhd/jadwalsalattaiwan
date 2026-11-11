/**
 * hisab-viz.js
 * Gambar (SVG) untuk setiap langkah di hisab.html, dari angka yang sama dengan kalkulator:
 *   v1 orbit   — Matahari, Bumi, Bulan dilihat dari atas (ijtimak → ghurub)
 *   v2 linimasa — ijtimak, ghurub, Bulan terbenam; umur & lama hilal
 *   v3 langit  — ufuk barat saat ghurub: tinggi, batas 3°, paralaks; penggeser waktu
 *   v4 elongasi — jarak sudut Bulan–Matahari dan lingkaran batas elongasi
 *   v5 kriteria — tinggi vs elongasi, zona IRNU, bulan ini dibanding tabel 1440–1500 H
 *
 * Depends on: astronomy-engine (global `Astronomy`), translations.js (currentLang, arrays),
 *             hilal-de440.js (HILAL_TABLE, opsional)
 */
const HisabViz = (() => {
    const rad = Math.PI / 180;
    const pad2 = (n) => String(n).padStart(2, '0');
    const norm180 = (x) => { const y = ((x % 360) + 360) % 360; return y > 180 ? y - 360 : y; };
    const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
    const f1 = (x) => {
        const s = (Math.round(x * 10) / 10).toString();
        return currentLang === 'en' ? s : s.replace('.', ',');
    };

    const T = {
        id: {
            sun: 'Matahari', moon: 'Bulan', earth: 'Bumi', far: 'Matahari (sangat jauh)',
            at_conj: 'saat ijtimak', at_sunset: 'saat ghurub', per_day: '≈ 12° per hari',
            lit_note: 'Separuh Bulan yang menghadap Matahari selalu terang. Saat ijtimak, sisi terang membelakangi Bumi, jadi Bulan tak terlihat.',
            orbit_cap: 'Dilihat dari atas kutub utara (tidak berskala, sudut diperbesar {x}×). Bulan bergerak berlawanan arah jarum jam menjauhi arah Matahari.',
            conj: 'Ijtimak', sunset: 'Ghurub', moonset: 'Bulan terbenam',
            age: 'umur hilal', lag: 'lama hilal', before: 'sebelumnya', after: 'kemudian',
            no_moonset: 'Bulan terbenam sebelum Matahari',
            tl_cap: 'Waktu lokal. Bagian gelap = setelah Matahari terbenam.',
            south: 'Selatan', north: 'Utara', west: 'B',
            limit_alt: 'batas tinggi', limit_elong: 'batas elongasi', geo: 'dari pusat Bumi', parallax: 'paralaks',
            after_sunset: 'setelah ghurub', minutes: 'menit',
            sky_cap: 'Menghadap ke barat saat Matahari terbenam. Titik-titik = lintasan Matahari dan Bulan sesudahnya. Ukuran piringan dan tebal sabit diperbesar agar terlihat.',
            slider: 'Geser waktu', moon_set: 'Bulan sudah terbenam',
            elong_cap: 'Garis = jarak tampak Bulan–Matahari di langit. Elongasi haqiqi diukur dari pusat Bumi, jadi nilainya sedikit berbeda dari jarak tampak ({topo}).',
            crit_x: 'Elongasi haqiqi', crit_y: "Tinggi mar'i", zone: 'Zona IRNU',
            this_month: 'Bulan ini', hist_ok: 'memenuhi', hist_no: 'belum memenuhi',
            hist_note: 'Titik kecil: {n} bulan {from}–{to} H di markaz Taipei, {k} di antaranya memenuhi.',
            crit_cap: 'Hilal memenuhi kriteria bila titiknya berada di zona hijau: di atas garis tinggi dan di kanan garis elongasi.',
            horizon: 'ufuk'
        },
        en: {
            sun: 'Sun', moon: 'Moon', earth: 'Earth', far: 'Sun (very far away)',
            at_conj: 'at conjunction', at_sunset: 'at sunset', per_day: '≈ 12° per day',
            lit_note: 'The half of the Moon facing the Sun is always lit. At conjunction the lit side faces away from Earth, so the Moon cannot be seen.',
            orbit_cap: 'Seen from above the north pole (not to scale, angle exaggerated {x}×). The Moon moves counter-clockwise, away from the Sun\'s direction.',
            conj: 'Conjunction', sunset: 'Sunset', moonset: 'Moonset',
            age: 'crescent age', lag: 'lag time', before: 'earlier', after: 'later',
            no_moonset: 'Moon sets before the Sun',
            tl_cap: 'Local time. Dark part = after sunset.',
            south: 'South', north: 'North', west: 'W',
            limit_alt: 'altitude limit', limit_elong: 'elongation limit', geo: 'from Earth\'s center', parallax: 'parallax',
            after_sunset: 'after sunset', minutes: 'min',
            sky_cap: 'Facing west at sunset. Dots = the paths of the Sun and Moon afterwards. Disc sizes and crescent thickness are enlarged so they are visible.',
            slider: 'Move time', moon_set: 'The Moon has set',
            elong_cap: 'Line = the apparent Moon–Sun distance on the sky. True elongation is measured from Earth\'s center, so it differs slightly from the apparent distance ({topo}).',
            crit_x: 'True elongation', crit_y: "Mar'i altitude", zone: 'IRNU zone',
            this_month: 'This month', hist_ok: 'met', hist_no: 'not met',
            hist_note: 'Small dots: {n} months {from}–{to} AH at the Taipei markaz, {k} of them met the criterion.',
            crit_cap: 'The crescent meets the criterion when its point is inside the green zone: above the altitude line and right of the elongation line.',
            horizon: 'horizon'
        }
    };
    const V = (key) => (T[currentLang] || T.id)[key];

    let last = null;      // { r, fmt } untuk gambar ulang saat ukuran berubah
    let skyMinutes = 0;   // posisi penggeser langit

    const $ = (id) => document.getElementById(id);
    const widthOf = (el) => clamp(Math.round(el.clientWidth || 600), 280, 820);
    const svgOpen = (w, h, label) =>
        `<svg class="viz-svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}">`;
    const txt = (x, y, s, cls = '', anchor = 'start') =>
        `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="${cls}" text-anchor="${anchor}">${s}</text>`;

    function hhmm(date, tz) {
        const d = new Date(date.getTime() + tz * 3600000);
        return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
    }

    function topo(body, date, observer) {
        const eq = Astronomy.Equator(body, date, observer, true, true);
        const h = Astronomy.Horizon(date, observer, eq.ra, eq.dec);
        return { alt: h.altitude, az: h.azimuth };
    }

    // Sabit: sisi terang menghadap +x, lalu diputar ke arah Matahari. k = fraksi terang (0…1)
    function crescent(x, y, R, k, angleDeg) {
        const rx = Math.abs(1 - 2 * k) * R;
        const sweep = k < 0.5 ? 0 : 1;
        return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angleDeg.toFixed(1)})">
            <circle r="${R.toFixed(1)}" class="viz-moon-dark"/>
            <path d="M0 ${-R} A${R} ${R} 0 0 1 0 ${R} A${rx.toFixed(2)} ${R} 0 0 ${sweep} 0 ${-R}Z" class="viz-moon-lit"/>
        </g>`;
    }

    // ---------- v1: orbit dari atas ----------
    function orbit(r, fmt) {
        const box = $('v1');
        const W = widthOf(box), H = clamp(Math.round(W * 0.42), 220, 300);
        const ex = Math.abs(r.lamDiff) <= 30 ? 3 : 1;
        const narrow = W < 520;
        const cx = W * (narrow ? 0.64 : 0.6), cy = H * 0.5, Ro = Math.min(H * 0.36, W * 0.3);
        const pos = (deg, rr = Ro) => {
            const th = (180 + deg) * rad;
            return [cx + rr * Math.cos(th), cy - rr * Math.sin(th)];
        };
        const [mx, my] = pos(r.lamDiff * ex);
        const [gx, gy] = pos(0);
        const a0 = pos(0, Ro * 0.42), a1 = pos(r.lamDiff * ex, Ro * 0.42);
        const large = Math.abs(r.lamDiff * ex) > 180 ? 1 : 0;
        const arcSweep = r.lamDiff >= 0 ? 0 : 1;
        const sgn = r.lamDiff >= 0 ? 1 : -1;   // + = di bawah garis Matahari pada gambar
        const ahead = pos(r.lamDiff * ex + 34);

        let s = svgOpen(W, H, V('orbit_cap'));
        s += `<defs><radialGradient id="v1sun" cx="1" cy="0.5" r="1">
                <stop offset="0" stop-color="#FFE7A3"/><stop offset="1" stop-color="#C9982E"/></radialGradient>
              <marker id="v1arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0L10 5L0 10z" class="viz-arrowhead"/></marker></defs>`;
        s += `<rect width="${W}" height="${H}" class="viz-space"/>`;
        // Cahaya Matahari (sejajar)
        for (let i = 1; i <= 5; i++) {
            const y = H * i / 6;
            s += `<line x1="70" y1="${y}" x2="${W - 12}" y2="${y}" class="viz-ray"/>`;
        }
        s += `<circle cx="-30" cy="${cy}" r="${narrow ? W * 0.13 : H * 0.36}" fill="url(#v1sun)"/>`;
        s += txt(12, H - 12, V('far'), 'viz-label viz-label--light');
        // Orbit
        s += `<circle cx="${cx}" cy="${cy}" r="${Ro}" class="viz-orbit"/>`;
        // Arah gerak
        const [ax0, ay0] = pos(r.lamDiff * ex + 12), [ax1, ay1] = ahead;
        s += `<path d="M${ax0.toFixed(1)} ${ay0.toFixed(1)} A${Ro} ${Ro} 0 0 0 ${ax1.toFixed(1)} ${ay1.toFixed(1)}" class="viz-motion" marker-end="url(#v1arr)"/>`;
        s += txt(ax1 + 8, ay1 + 14, V('per_day'), 'viz-label viz-label--light');
        // Garis pandang
        s += `<line x1="${cx}" y1="${cy}" x2="${gx}" y2="${gy}" class="viz-sight viz-sight--ghost"/>`;
        s += `<line x1="${cx}" y1="${cy}" x2="${mx.toFixed(1)}" y2="${my.toFixed(1)}" class="viz-sight"/>`;
        // Busur sudut
        if (Math.abs(r.lamDiff) > 0.05) {
            s += `<path d="M${a0[0].toFixed(1)} ${a0[1].toFixed(1)} A${Ro * 0.42} ${Ro * 0.42} 0 ${large} ${arcSweep} ${a1[0].toFixed(1)} ${a1[1].toFixed(1)}" class="viz-angle"/>`;
        }
        s += txt(cx + 18, cy + sgn * 22 + 4, `λ☾ − λ☉ = ${fmt.dms(r.lamDiff, false)}`, 'viz-label viz-label--gold');
        // Bumi: separuh kiri terang
        s += `<circle cx="${cx}" cy="${cy}" r="13" class="viz-earth-dark"/>
              <path d="M${cx} ${cy - 13} A13 13 0 0 0 ${cx} ${cy + 13}Z" class="viz-earth-lit"/>`;
        s += txt(cx + 18, cy + 4, V('earth'), 'viz-label viz-label--light');
        // Bulan saat ijtimak (bayangan) dan saat ghurub
        const half = (x, y, cls) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" class="viz-moon-dark ${cls}"/>
              <path d="M${x.toFixed(1)} ${(y - 9).toFixed(1)} A9 9 0 0 0 ${x.toFixed(1)} ${(y + 9).toFixed(1)}Z" class="viz-moon-lit ${cls}"/>`;
        s += half(gx, gy, 'is-ghost');
        s += half(mx, my, '');
        // Label di kiri; bila kedua Bulan berdekatan, label ghurub digeser menjauh
        if (narrow) {
            // Sempit: label di atas/bawah Bulan agar tidak tertutup Matahari
            s += txt(gx, gy - sgn * 16 + (sgn > 0 ? 0 : 8), V('at_conj'), 'viz-label viz-label--muted-light', 'middle');
            s += txt(mx, my + sgn * 24 + (sgn > 0 ? 0 : 8), `${V('moon')} ${V('at_sunset')}`, 'viz-label viz-label--light', 'middle');
        } else {
            const close = Math.abs(my - gy) < 18;
            s += txt(gx - 16, gy + 4 - (close ? sgn * 6 : 0), V('at_conj'), 'viz-label viz-label--muted-light', 'end');
            s += txt(Math.min(mx, gx) - 16, close ? gy + 4 + sgn * 14 : my + 4, `${V('moon')} ${V('at_sunset')}`, 'viz-label viz-label--light', 'end');
        }
        s += '</svg>';
        box.innerHTML = s + `<figcaption>${V('orbit_cap').replace('{x}', ex)} ${V('lit_note')}</figcaption>`;
    }

    // ---------- v2: linimasa ----------
    function timeline(r, fmt) {
        const box = $('v2');
        const W = widthOf(box), H = 128, tz = r.inp.tz;
        const H_MS = 3600000;
        const sunset = r.sunset.getTime(), conj = r.conj.getTime();
        const moonset = r.moonset ? r.moonset.getTime() : null;
        let t0 = sunset - 3 * H_MS, t1 = Math.max(sunset, moonset && moonset > sunset ? moonset : sunset) + 1.2 * H_MS;
        const conjIn = conj >= t0 - 2 * H_MS && conj <= t1 + 3 * H_MS;
        if (conjIn) { t0 = Math.min(t0, conj - 0.5 * H_MS); t1 = Math.max(t1, conj + 0.6 * H_MS); }
        const L0 = 16, L1 = W - 16, yA = 72;
        const X = (t) => L0 + (t - t0) / (t1 - t0) * (L1 - L0);

        let s = svgOpen(W, H, V('tl_cap'));
        s += `<rect x="${L0}" y="${yA - 26}" width="${X(sunset) - L0}" height="26" class="viz-day"/>`;
        s += `<rect x="${X(sunset)}" y="${yA - 26}" width="${L1 - X(sunset)}" height="26" class="viz-night"/>`;
        // Rentang umur & lama hilal
        const ageFrom = Math.max(conj, t0);
        if (conj < sunset) {
            s += `<rect x="${X(ageFrom)}" y="${yA - 22}" width="${X(sunset) - X(ageFrom)}" height="8" rx="4" class="viz-span-age"/>`;
            const h = (sunset - conj) / H_MS;
            const hU = currentLang === 'en' ? 'h' : 'j';
            s += txt(Math.max(L0 + 60, (X(ageFrom) + X(sunset)) / 2), yA - 32,
                `${V('age')} ${Math.floor(h)}${hU} ${pad2(Math.floor((h % 1) * 60))}m`, 'viz-label', 'middle');
        }
        if (moonset && moonset > sunset) {
            s += `<rect x="${X(sunset)}" y="${yA - 12}" width="${X(moonset) - X(sunset)}" height="8" rx="4" class="viz-span-lag"/>`;
        }
        s += `<line x1="${L0}" y1="${yA}" x2="${L1}" y2="${yA}" class="viz-axis"/>`;
        // Jam
        const firstHour = Math.ceil((t0 + tz * H_MS) / H_MS) * H_MS - tz * H_MS;
        const every = (t1 - t0) / H_MS > 10 ? 2 : 1;
        for (let t = firstHour; t <= t1; t += H_MS) {
            const hr = new Date(t + tz * H_MS).getUTCHours();
            if (hr % every) continue;
            s += `<line x1="${X(t)}" y1="${yA}" x2="${X(t)}" y2="${yA + 5}" class="viz-axis"/>`;
            s += txt(X(t), yA + 18, `${pad2(hr)}:00`, 'viz-tick', 'middle');
        }
        // Penanda
        const markAt = (t, cls, label, row) => {
            const x = X(t);
            const anchor = x < L0 + 60 ? 'start' : x > L1 - 60 ? 'end' : 'middle';
            return `<line x1="${x}" y1="${yA - 30}" x2="${x}" y2="${yA + 26}" class="viz-mark ${cls}"/>
                <circle cx="${x}" cy="${yA}" r="5" class="viz-dot ${cls}"/>` +
                txt(x, yA + 38 + row * 15, label, `viz-label ${cls}`, anchor);
        };
        s += markAt(sunset, 'is-sun', `${V('sunset')} ${hhmm(r.sunset, tz)}`, 0);
        if (moonset && moonset > sunset) {
            const lag = Math.round((moonset - sunset) / 60000);
            s += markAt(moonset, 'is-moon', `${V('moonset')} ${hhmm(r.moonset, tz)}`, X(moonset) - X(sunset) < 150 ? 1 : 0);
            s += txt((X(sunset) + X(moonset)) / 2, yA - 32, `${V('lag')} ${lag} ${V('minutes')}`, 'viz-label viz-label--gold', 'middle');
        }
        if (conjIn) {
            s += markAt(conj, 'is-conj', `${V('conj')} ${hhmm(r.conj, tz)}`, Math.abs(X(conj) - X(sunset)) < 150 ? 1 : 0);
        } else {
            const h = Math.round(Math.abs(sunset - conj) / H_MS);
            const left = conj < t0;
            s += txt(left ? L0 : L1, 16, `${left ? '← ' : ''}${V('conj')} ${h} ${currentLang === 'en' ? 'h' : 'jam'} ${left ? V('before') : V('after')}${left ? '' : ' →'}`,
                'viz-label is-conj', left ? 'start' : 'end');
        }
        if (!moonset || moonset <= sunset) {
            const right = conjIn || conj < t0;   // sisi yang tidak dipakai label ijtimak
            s += txt(right ? L1 : L0, 16, V('no_moonset'), 'viz-label viz-label--muted', right ? 'end' : 'start');
        }
        s += '</svg>';
        box.innerHTML = s + `<figcaption>${V('tl_cap')}</figcaption>`;
    }

    // ---------- v3 & v4: langit barat ----------
    function skyData(r) {
        if (r._sky) return r._sky;
        const obs = new Astronomy.Observer(r.inp.lat, r.inp.lng, r.inp.elev);
        const maxMin = clamp(Math.ceil(((r.lagMin && r.lagMin > 0) ? r.lagMin : 0) + 15), 40, 180);
        const track = [];
        for (let m = 0; m <= maxMin; m += 3) {
            const d = new Date(r.sunset.getTime() + m * 60000);
            track.push({ m, sun: topo(Astronomy.Body.Sun, d, obs), moon: topo(Astronomy.Body.Moon, d, obs) });
        }
        r._sky = { obs, maxMin, track };
        return r._sky;
    }

    function sky(r, fmt, mode) {
        const box = $(mode === 'alt' ? 'v3' : 'v4');
        const holder = mode === 'alt' ? box.querySelector('.viz-plot') : box;
        const W = widthOf(box), H = clamp(Math.round(W * 0.5), 230, 360);
        const { obs, track } = skyData(r);
        const minutes = mode === 'alt' ? Math.min(skyMinutes, skyData(r).maxMin) : 0;
        const now = new Date(r.sunset.getTime() + minutes * 60000);
        const sun = topo(Astronomy.Body.Sun, now, obs);
        const moon = topo(Astronomy.Body.Moon, now, obs);
        const sunAz0 = r.sunAz;
        const dx = (az) => norm180(az - sunAz0);
        const geoAlt = moon.alt + r.hp * Math.cos(moon.alt * rad);

        // Jendela (derajat), tetap selama penggeser bergerak
        const xs = [0, dx(r.moonAz)], ys = [-0.83, r.alt, r.alt + r.hp, r.inp.minAlt];
        if (mode === 'elong') { xs.push(-r.inp.minElong, r.inp.minElong); ys.push(r.inp.minElong - 0.83); }
        let x0 = Math.min(...xs) - 3, x1 = Math.max(...xs) + 3;
        let y0 = Math.min(-3, Math.min(...ys) - 1.5), y1 = Math.max(...ys) + 2;
        const TOP = 36;   // ruang untuk label waktu di atas
        const ppd = Math.min(W / (x1 - x0), (H - TOP) / (y1 - y0));
        const cxd = (x0 + x1) / 2, cyd = (y0 + y1) / 2;
        x0 = cxd - W / 2 / ppd; x1 = cxd + W / 2 / ppd;
        y0 = cyd - (H - TOP) / 2 / ppd; y1 = y0 + H / ppd;
        const X = (d) => (d - x0) * ppd, Y = (a) => (y1 - a) * ppd;
        const id = mode === 'alt' ? 'v3' : 'v4';

        let s = svgOpen(W, H, V(mode === 'alt' ? 'sky_cap' : 'elong_cap'));
        s += `<defs>
            <linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#132C42"/><stop offset="0.55" stop-color="#3D6680"/>
              <stop offset="0.9" stop-color="#D9A86A"/><stop offset="1" stop-color="#F0C98A"/></linearGradient>
            <radialGradient id="${id}glow"><stop offset="0" stop-color="#FFE7A3" stop-opacity="0.9"/>
              <stop offset="1" stop-color="#FFE7A3" stop-opacity="0"/></radialGradient>
            <clipPath id="${id}clip"><rect width="${W}" height="${H}" rx="12"/></clipPath></defs>
            <g clip-path="url(#${id}clip)">`;
        s += `<rect width="${W}" height="${Y(0)}" fill="url(#${id}sky)"/>`;

        // Garis tinggi
        const step = [0.5, 1, 2, 5, 10].find(v => v * ppd >= 30) || 10;
        for (let a = Math.ceil(y0 / step) * step; a <= y1; a += step) {
            if (a <= 0) continue;
            s += `<line x1="0" y1="${Y(a)}" x2="${W}" y2="${Y(a)}" class="viz-grid"/>`;
            if (Y(a) > (mode === 'alt' ? 44 : 16)) s += txt(6, Y(a) - 4, `${f1(a)}°`, 'viz-tick viz-tick--light');
        }
        // Batas tinggi
        if (mode === 'alt') {
            s += `<line x1="0" y1="${Y(r.inp.minAlt)}" x2="${W}" y2="${Y(r.inp.minAlt)}" class="viz-limit"/>`;
            const limRight = X(dx(r.moonAz)) < W * 0.55;   // label batas di sisi yang jauh dari Bulan
            s += txt(limRight ? W - 8 : 34, Y(r.inp.minAlt) + (limRight ? -6 : 16), `${V('limit_alt')} ${f1(r.inp.minAlt)}°`, 'viz-label viz-label--gold', limRight ? 'end' : 'start');
        }

        // Lintasan
        const path = (key) => track.map((p, i) => `${i ? 'L' : 'M'}${X(dx(p[key].az)).toFixed(1)} ${Y(p[key].alt).toFixed(1)}`).join('');
        s += `<path d="${path('sun')}" class="viz-track viz-track--sun"/>`;
        s += `<path d="${path('moon')}" class="viz-track viz-track--moon"/>`;

        const sx = X(dx(sun.az)), sy = Y(sun.alt);
        const mx = X(dx(moon.az)), my = Y(moon.alt);
        const Rm = clamp(0.26 * ppd * 2.2, 7, 17), Rs = clamp(0.27 * ppd * 2.2, 7, 17);
        const moonSet = moon.alt < -0.3;

        if (mode === 'elong') {
            s += `<circle cx="${X(0)}" cy="${Y(-0.83)}" r="${r.inp.minElong * ppd}" class="viz-limit viz-limit--circle"/>`;
            s += `<line x1="${sx}" y1="${sy}" x2="${mx}" y2="${my}" class="viz-elong"/>`;
        }

        // Benda langit digambar sebelum tanah: bagian di bawah ufuk tampak redup
        s += `<circle cx="${sx}" cy="${sy}" r="${Rs * 2.6}" fill="url(#${id}glow)"/>
              <circle cx="${sx}" cy="${sy}" r="${Rs}" class="viz-sun"/>`;
        const geoY = Y(geoAlt);
        if (mode === 'alt' && !moonSet) s += `<circle cx="${mx}" cy="${geoY}" r="${Rm}" class="viz-moon-ghost"/>`;
        const ang = Math.atan2(sy - my, sx - mx) / rad;
        const k = clamp(r.illum / 100 * 3, 0.07, 0.5);
        s += crescent(mx, my, Rm, k, ang);

        // Tanah
        s += `<rect x="0" y="${Y(0)}" width="${W}" height="${H - Y(0)}" class="viz-ground"/>`;
        s += `<line x1="0" y1="${Y(0)}" x2="${W}" y2="${Y(0)}" class="viz-horizon"/>`;
        // Azimut (bilangan bulat, jarak label ≥ 64 px)
        const azStep = [0.5, 1, 2, 5, 10, 20].find(v => v * ppd >= 64) || 20;
        for (let az = Math.ceil((sunAz0 + x0) / azStep) * azStep; az <= sunAz0 + x1; az += azStep) {
            const a = ((az % 360) + 360) % 360, x = X(az - sunAz0);
            const label = Math.abs(a - 270) < 1e-6 ? `${V('west')} 270°` : `${f1(a)}°`;
            s += `<line x1="${x}" y1="${Y(0)}" x2="${x}" y2="${Y(0) + 5}" class="viz-horizon"/>`;
            const sunLabelY = clamp(Math.max(Y(sun.alt) + 16, Y(0) + 38), 0, H - 26);
            if (Math.abs(x - X(dx(sun.az))) > 70 || sunLabelY - (Y(0) + 18) > 16) s += txt(x, Y(0) + 18, label, 'viz-tick viz-tick--light', 'middle');
        }
        s += txt(8, H - 8, `← ${V('south')}`, 'viz-tick viz-tick--light');
        s += txt(W - 8, H - 8, `${V('north')} →`, 'viz-tick viz-tick--light', 'end');

        // Label
        s += txt(sx, clamp(Math.max(sy + Rs + 16, Y(0) + 38), 0, H - 26), `${V('sun')} ${fmt.dms(sun.alt, false)}`, 'viz-label viz-label--light', 'middle');
        if (mode === 'elong') {
            const leftSide = mx > X(0);   // label batas di sisi lingkaran yang jauh dari Bulan
            const la = (leftSide ? -130 : -50) * rad;
            const lx = X(0) + r.inp.minElong * ppd * Math.cos(la), ly = Y(-0.83) + r.inp.minElong * ppd * Math.sin(la);
            s += txt(lx + (leftSide ? -6 : 6), ly, `${W < 520 ? '' : V('limit_elong') + ' '}${f1(r.inp.minElong)}°`,
                'viz-label viz-label--gold', leftSide ? 'end' : 'start');
            s += txt(sx + (mx - sx) * 0.6 + 12, sy + (my - sy) * 0.6 + 4, `E = ${fmt.dms(r.elong, false)}`, 'viz-label viz-label--strong');
        }
        const flip = mx > W * 0.55;   // Bulan di kanan: label di kiri, garis tinggi di kanan
        const side = flip ? -1 : 1, lab = flip ? 'end' : 'start';
        if (mode === 'alt' && !moonSet) {
            s += txt(mx + side * (Rm + 6), geoY + 4, W < 520 ? V('geo') : `${V('geo')} (${V('parallax')} ${fmt.dms(geoAlt - moon.alt, false)})`, 'viz-label viz-label--muted-light', lab);
            if (my - geoY > Rm * 2) {
                s += `<line x1="${mx}" y1="${geoY + Rm + 2}" x2="${mx}" y2="${my - Rm - 2}" class="viz-parallax"/>`;
            }
            const hx = mx - side * (Rm + 10);
            s += `<line x1="${hx}" y1="${Y(0)}" x2="${hx}" y2="${my}" class="viz-measure"/>
                  <line x1="${hx - 4}" y1="${my}" x2="${hx + 4}" y2="${my}" class="viz-measure"/>`;
            s += txt(hx - side * 6, (Y(0) + my) / 2 + 4, `h = ${fmt.dms(moon.alt, false)}`, 'viz-label viz-label--strong', flip ? 'start' : 'end');
        }
        if (mode === 'alt' && !moonSet) s += txt(mx + side * (Rm + 6), my + 5, W < 520 ? V('moon') : `${V('moon')} (${currentLang === 'en' ? 'topocentric' : 'toposentrik'})`, 'viz-label viz-label--light', lab);
        else if (mode === 'elong') s += txt(mx, my - Rm - 8, V('moon'), 'viz-label viz-label--light', 'middle');

        if (mode === 'alt') {
            s += `<rect x="8" y="8" width="${Math.min(250, W - 16)}" height="24" rx="12" class="viz-badge"/>`;
            s += txt(20, 25, `${hhmm(now, r.inp.tz)} · +${minutes} ${V('minutes')} ${V('after_sunset')}`, 'viz-label viz-label--light');
            if (moonSet) s += txt(W - 10, 25, V('moon_set'), 'viz-label viz-label--gold', 'end');
        }
        s += '</g></svg>';

        if (mode === 'alt') holder.innerHTML = s;
        else box.innerHTML = s + `<figcaption>${V('elong_cap').replace('{topo}', fmt.dms(r.elongTopo, false))}</figcaption>`;
    }

    function skyFigure(r, fmt) {
        const box = $('v3');
        const max = skyData(r).maxMin;
        skyMinutes = Math.min(skyMinutes, max);
        box.innerHTML = `<div class="viz-plot"></div>
            <div class="viz-ctrl">
                <label for="v3Range">${V('slider')}</label>
                <input type="range" id="v3Range" min="0" max="${max}" step="1" value="${skyMinutes}">
                <output id="v3Out">+${skyMinutes} ${V('minutes')}</output>
            </div>
            <figcaption>${V('sky_cap')}</figcaption>`;
        sky(r, fmt, 'alt');
        $('v3Range').addEventListener('input', (e) => {
            skyMinutes = Number(e.target.value);
            $('v3Out').textContent = `+${skyMinutes} ${V('minutes')}`;
            sky(r, fmt, 'alt');
        });
    }

    // ---------- v5: diagram kriteria ----------
    function criteria(r, fmt) {
        const box = $('v5');
        const W = widthOf(box), H = clamp(Math.round(W * 0.56), 260, 400);
        const ml = 44, mr = 14, mt = 14, mb = 40;
        const pts = [];
        const meta = typeof HILAL_TABLE !== 'undefined' ? HILAL_TABLE.meta : null;
        if (meta) {
            for (const [key, v] of Object.entries(HILAL_TABLE.months)) {
                if (v.a === null || v.e === null) continue;
                const [y, m] = key.split('-').map(Number);
                pts.push({ y, m, a: v.a, e: v.e, ok: v.a >= r.inp.minAlt && v.e >= r.inp.minElong });
            }
        }
        const allE = pts.map(p => p.e).concat([r.elong, r.inp.minElong + 2]);
        const allA = pts.map(p => p.a).concat([r.alt, r.inp.minAlt + 2, -2]);
        const ex0 = 0, ex1 = Math.ceil(Math.max(...allE) + 0.5);
        const ay0 = Math.floor(Math.min(...allA) - 0.5), ay1 = Math.ceil(Math.max(...allA) + 0.5);
        const X = (e) => ml + (clamp(e, ex0, ex1) - ex0) / (ex1 - ex0) * (W - ml - mr);
        const Y = (a) => mt + (ay1 - clamp(a, ay0, ay1)) / (ay1 - ay0) * (H - mt - mb);

        let s = svgOpen(W, H, V('crit_cap'));
        s += `<rect x="${ml}" y="${mt}" width="${W - ml - mr}" height="${H - mt - mb}" class="viz-plotbg"/>`;
        // Zona IRNU
        s += `<rect x="${X(r.inp.minElong)}" y="${Y(ay1)}" width="${X(ex1) - X(r.inp.minElong)}" height="${Y(r.inp.minAlt) - Y(ay1)}" class="viz-zone"/>`;
        s += txt(X(ex1) - 8, Y(ay1) + 18, V('zone'), 'viz-label viz-label--green', 'end');
        // Kisi
        const stepX = (ex1 - ex0) > 12 ? 2 : 1, stepY = (ay1 - ay0) > 14 ? 2 : 1;
        for (let e = ex0; e <= ex1; e += stepX) {
            s += `<line x1="${X(e)}" y1="${mt}" x2="${X(e)}" y2="${H - mb}" class="viz-grid viz-grid--dark"/>`;
            s += txt(X(e), H - mb + 16, `${e}°`, 'viz-tick', 'middle');
        }
        for (let a = Math.ceil(ay0 / stepY) * stepY; a <= ay1; a += stepY) {
            s += `<line x1="${ml}" y1="${Y(a)}" x2="${W - mr}" y2="${Y(a)}" class="viz-grid viz-grid--dark"/>`;
            s += txt(ml - 6, Y(a) + 4, `${a}°`, 'viz-tick', 'end');
        }
        s += `<line x1="${ml}" y1="${Y(0)}" x2="${W - mr}" y2="${Y(0)}" class="viz-zero"/>`;
        s += txt(ml + 6, Y(0) - 5, V('horizon'), 'viz-tick');
        // Batas
        s += `<line x1="${X(r.inp.minElong)}" y1="${mt}" x2="${X(r.inp.minElong)}" y2="${H - mb}" class="viz-limit viz-limit--dark"/>`;
        s += `<line x1="${ml}" y1="${Y(r.inp.minAlt)}" x2="${W - mr}" y2="${Y(r.inp.minAlt)}" class="viz-limit viz-limit--dark"/>`;
        s += txt(X(r.inp.minElong) + 5, H - mb - 6, `${f1(r.inp.minElong)}°`, 'viz-label viz-label--gold');
        s += txt(ml + 6, Y(r.inp.minAlt) - 5, `${f1(r.inp.minAlt)}°`, 'viz-label viz-label--gold');
        // Titik sejarah
        const names = arrays.namaBulanHijri[currentLang];
        s += pts.map(p => `<circle cx="${X(p.e).toFixed(1)}" cy="${Y(p.a).toFixed(1)}" r="2.6" class="viz-pt ${p.ok ? 'is-ok' : 'is-no'}">` +
            `<title>${names[p.m - 1]} ${p.y}: ${fmt.dms(p.a, false)} / ${fmt.dms(p.e, false)}</title></circle>`).join('');
        // Bulan ini
        const px = X(r.elong), py = Y(r.alt);
        s += `<circle cx="${px}" cy="${py}" r="11" class="viz-pt-ring"/><circle cx="${px}" cy="${py}" r="5.5" class="viz-pt-now ${r.met ? 'is-ok' : 'is-no'}"/>`;
        const right = px < W - 170;
        s += txt(px + (right ? 16 : -16), py - 8, `${V('this_month')}`, 'viz-label viz-label--now', right ? 'start' : 'end');
        s += txt(px + (right ? 16 : -16), py + 8, `${fmt.dms(r.alt, false)} / ${fmt.dms(r.elong, false)}`, 'viz-label viz-label--halo', right ? 'start' : 'end');
        // Sumbu
        s += txt((ml + W - mr) / 2, H - 6, `${V('crit_x')} →`, 'viz-axis-title', 'middle');
        s += `<text transform="translate(12 ${(mt + H - mb) / 2}) rotate(-90)" class="viz-axis-title" text-anchor="middle">${V('crit_y')} →</text>`;
        s += '</svg>';

        let cap = V('crit_cap');
        if (meta && pts.length) {
            cap += ' ' + V('hist_note').replace('{n}', pts.length).replace('{from}', meta.range[0]).replace('{to}', meta.range[1])
                .replace('{k}', pts.filter(p => p.ok).length);
        }
        const legend = `<div class="viz-legend">
            <span><i class="viz-key viz-key--now"></i>${V('this_month')}</span>
            ${pts.length ? `<span><i class="viz-key viz-key--ok"></i>${V('hist_ok')}</span>
            <span><i class="viz-key viz-key--no"></i>${V('hist_no')}</span>` : ''}</div>`;
        box.innerHTML = s + legend + `<figcaption>${cap}</figcaption>`;
    }

    /** Gambar semua langkah. fmt = { dms } dari hisab-page.js */
    function render(r, fmt) {
        const ids = ['v1', 'v2', 'v3', 'v4', 'v5'];
        if (typeof Astronomy === 'undefined') return;
        if (!last || last.r.inp.year !== r.inp.year || last.r.inp.month !== r.inp.month ||
            last.r.inp.lat !== r.inp.lat || last.r.inp.lng !== r.inp.lng || last.r.obsDay !== r.obsDay) skyMinutes = 0;
        last = { r, fmt };
        if (r.noSunset) { ids.forEach(id => { $(id).innerHTML = ''; }); return; }
        orbit(r, fmt);
        timeline(r, fmt);
        skyFigure(r, fmt);
        sky(r, fmt, 'elong');
        criteria(r, fmt);
    }

    let resizeTimer = null, lastWidth = 0;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const el = $('v1') || $('vPos');
            const w = el ? el.clientWidth : 0;
            if (!w || Math.abs(w - lastWidth) <= 8) return;
            lastWidth = w;
            if (last && $('v1')) render(last.r, last.fmt);
            if (lastPos) positions(lastPos.r, lastPos.fmt);
        }, 150);
    });

    // =====================================================================
    // Posisi hilal beberapa titik (kalkulator.html), gaya gambar LF PBNU:
    // langit senja, sumbu tinggi, garis batas IRNU putus-putus, titik per lokasi.
    // Warna ditulis langsung (bukan kelas CSS) agar ikut saat diunduh sebagai PNG.
    // =====================================================================
    // Semua titik yang bisa dipilih, dikelompokkan
    const POINTS = (() => {
        const m = HIJRI_CONFIG.markaz[0];
        const tw = [{ id: 'tw-markaz', name: 'Taipei (markaz)', lat: m.lat, lng: m.lng, tz: HIJRI_CONFIG.utcOffset, group: 'taiwan' },
            ...Object.entries(locations).filter(([n]) => n !== 'Taipei')
                .map(([n, c]) => ({ id: `tw-${n}`, name: n, lat: c.lat, lng: c.lng, tz: 8, group: 'taiwan' }))];
        const id = [
            { id: 'id-lhoknga', name: 'Lhoknga', lat: 5.4677, lng: 95.2420, tz: 7 },
            { id: 'id-sabang', name: 'Sabang', lat: 5.8926, lng: 95.3238, tz: 7 },
            { id: 'id-pelratu', name: 'Pel. Ratu', lat: -7.0000, lng: 106.5330, tz: 7 },
            { id: 'id-jakarta', name: 'Jakarta', lat: -6.2088, lng: 106.8456, tz: 7 },
            { id: 'id-surabaya', name: 'Surabaya', lat: -7.2575, lng: 112.7521, tz: 7 },
            { id: 'id-makassar', name: 'Makassar', lat: -5.1477, lng: 119.4327, tz: 8 },
            { id: 'id-jayapura', name: 'Jayapura', lat: -2.5337, lng: 140.7181, tz: 9 },
            { id: 'id-merauke', name: 'Merauke', lat: -8.4932, lng: 140.4018, tz: 9 }
        ].map(p => ({ ...p, group: 'indonesia' }));
        const other = [
            { id: 'ot-makkah', name: 'Makkah', lat: 21.4225, lng: 39.8262, tz: 3, elev: 277 },
            { id: 'ot-kualalumpur', name: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869, tz: 8 },
            { id: 'ot-hongkong', name: 'Hong Kong', lat: 22.3193, lng: 114.1694, tz: 8 },
            { id: 'ot-tokyo', name: 'Tokyo', lat: 35.6762, lng: 139.6503, tz: 9 }
        ].map(p => ({ ...p, group: 'other' }));
        return [...tw, ...id, ...other];
    })();
    const twByLng = POINTS.filter(p => p.group === 'taiwan' && p.id !== 'tw-markaz').sort((a, b) => a.lng - b.lng);
    const PRESETS = {
        tw_edge: ['tw-markaz', ...twByLng.slice(0, 2).map(p => p.id), ...twByLng.slice(-2).map(p => p.id)],
        tw_all: POINTS.filter(p => p.group === 'taiwan').map(p => p.id),
        id_pbnu: ['id-lhoknga', 'id-pelratu', 'id-jayapura', 'id-merauke'],
        none: []
    };
    const STORE_KEY = 'hilalPoints';
    let posSelected = (() => {
        try {
            const saved = JSON.parse(localStorage.getItem(STORE_KEY));
            if (Array.isArray(saved)) return new Set(saved.filter(id => POINTS.some(p => p.id === id)));
        } catch (err) { /* abaikan */ }
        return new Set(PRESETS.tw_edge);
    })();
    const saveSelection = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify([...posSelected])); } catch (err) { /* abaikan */ } };

    const PT = {
        id: {
            org: 'LFNU TAIWAN · PCINU TAIWAN', title: 'POSISI HILAL PENENTUAN 1 {month} {year} H',
            sub: 'Saat Matahari terbenam, {date} · kriteria IRNU', alt: 'tinggi', daz: 'selisih azimut Bulan − Matahari',
            boundary: 'batas IRNU', place: 'Lokasi', sunset: 'Ghurub', altv: "Tinggi mar'i", elong: 'Elongasi',
            status: 'Status', met: 'memenuhi', not_met: 'belum', no_sunset: 'tidak terbenam', before_conj: 'sebelum ijtimak',
            sun: 'Matahari', pick: 'Pilih titik', quick: 'Cepat:', tw_edge: 'Taiwan barat & timur', tw_all: 'Taiwan semua',
            id_pbnu: 'Indonesia (LF PBNU)', none: 'Kosongkan', g_taiwan: 'Taiwan', g_indonesia: 'Indonesia', g_other: 'Lainnya',
            chosen_note: 'Lokasi kalkulator selalu ditampilkan (cincin emas).', n_sel: '{n} titik dipilih',
            cap: 'Garis putus-putus = batas kriteria IRNU di langit: di atasnya tinggi ≥ {alt}° dan elongasi ≥ {el}°. ' +
                'Garis dihitung dari rata-rata paralaks, jadi titik yang sangat dekat garis bisa berbeda sedikit; status di tabel dihitung tepat. ' +
                'Semua titik diamati pada tanggal yang sama. Sumbu datar: Bulan di kanan Matahari = lebih ke utara.'
        },
        en: {
            org: 'LFNU TAIWAN · PCINU TAIWAN', title: 'CRESCENT POSITION FOR 1 {month} {year} AH',
            sub: 'At sunset, {date} · IRNU criterion', alt: 'altitude', daz: 'azimuth difference Moon − Sun',
            boundary: 'IRNU limit', place: 'Location', sunset: 'Sunset', altv: "Mar'i altitude", elong: 'Elongation',
            status: 'Status', met: 'met', not_met: 'not met', no_sunset: 'no sunset', before_conj: 'before conjunction',
            sun: 'Sun', pick: 'Choose points', quick: 'Quick:', tw_edge: 'Taiwan west & east', tw_all: 'All Taiwan',
            id_pbnu: 'Indonesia (LF PBNU)', none: 'Clear', g_taiwan: 'Taiwan', g_indonesia: 'Indonesia', g_other: 'Other',
            chosen_note: 'The calculator location is always shown (gold ring).', n_sel: '{n} points selected',
            cap: 'Dashed line = the IRNU limit on the sky: above it the altitude is ≥ {alt}° and the elongation ≥ {el}°. ' +
                'The line uses an average parallax, so points very close to it may differ slightly; the table status is exact. ' +
                'All points are observed on the same date. Horizontal axis: Moon right of the Sun = further north.'
        }
    };
    const P = (key) => (PT[currentLang] || PT.id)[key];
    const posCache = new Map();

    function positionsData(r, fmt) {
        const chosen = { name: fmt.place, lat: r.inp.lat, lng: r.inp.lng, tz: r.inp.tz, elev: r.inp.elev, chosen: true };
        const picked = POINTS.filter(p => posSelected.has(p.id));
        const list = [chosen, ...picked.filter(p =>
            Math.abs(p.lat - chosen.lat) > 1e-3 || Math.abs(p.lng - chosen.lng) > 1e-3)];
        const key = `${picked.map(p => p.id).join(',')}|${r.inp.year}-${r.inp.month}|${r.obsDay}|${chosen.lat}|${chosen.lng}|${r.inp.minAlt}|${r.inp.minElong}`;
        if (posCache.has(key)) return posCache.get(key);
        const out = list.map(p => {
            const obs = new Astronomy.Observer(p.lat, p.lng, p.elev || 0);
            const ss = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, -1, new Date(r.obsDay * 86400000 - p.tz * 3600000), 1);
            if (!ss) return { ...p, noSunset: true };
            const sun = topo(Astronomy.Body.Sun, ss, obs), moon = topo(Astronomy.Body.Moon, ss, obs);
            const elong = Astronomy.AngleFromSun(Astronomy.Body.Moon, ss);
            const conjBefore = r.conj < ss.date;
            return {
                ...p, sunset: ss.date, alt: moon.alt, daz: norm180(moon.az - sun.az), elong, conjBefore,
                met: conjBefore && moon.alt >= r.inp.minAlt && elong >= r.inp.minElong
            };
        });
        posCache.set(key, out);
        return out;
    }

    // Tinggi toposentrik terendah agar elongasi geosentrik = minElong, pada selisih azimut x
    function boundaryAlt(x, minAlt, minElong, hp) {
        const hs = -0.8333 * rad;
        const el = (h) => {
            const hm = (h + hp * Math.cos(h * rad)) * rad;
            return Math.acos(clamp(Math.sin(hs) * Math.sin(hm) + Math.cos(hs) * Math.cos(hm) * Math.cos(x * rad), -1, 1)) / rad;
        };
        if (el(minAlt) >= minElong) return minAlt;
        let lo = minAlt, hi = 40;
        for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (el(mid) >= minElong) hi = mid; else lo = mid; }
        return hi;
    }

    function positionsSvg(r, fmt, pts, W, pad = 0) {
        const font = "'Plus Jakarta Sans', Arial, sans-serif";
        const monthName = arrays.namaBulanHijri[currentLang][r.inp.month - 1].toUpperCase();
        const title = P('title').replace('{month}', monthName).replace('{year}', r.inp.year);
        const sub = P('sub').replace('{date}', fmt.dayLabel(r.obsDay));
        const fT = clamp((W - 2 * pad) / (title.length * 0.62), 12, 28);
        const fS = clamp(Math.min(fT * 0.72, (W - 2 * pad) / (sub.length * 0.56)), 9, 19), fO = clamp(fT * 0.55, 9, 14);
        const fL = clamp(W / 60, 11, 18);   // label titik
        const hh = Math.round(pad + fO + fT + fS + 34);

        const ok = pts.filter(p => !p.noSunset);
        const alts = ok.map(p => p.alt), dazs = ok.map(p => Math.abs(p.daz));
        const yMin = Math.min(-1, Math.floor(Math.min(...alts, 0)) - 1);
        const yMax = Math.max(9, Math.ceil(Math.max(...alts, r.inp.minAlt)) + 1);
        const xr = Math.max(r.inp.minElong + 3, Math.ceil(Math.max(...dazs, 0)) + 2);
        const ml = 44 + pad, mr = 14 + pad, mb = 46 + pad;
        const plotH = clamp(Math.round(W * 0.5), 240, 560);
        const top = hh, H = top + plotH + mb, x0 = ml, x1 = W - mr, yb = top + plotH;
        const X = (d) => x0 + (d + xr) / (2 * xr) * (x1 - x0);
        const Y = (a) => top + (yMax - a) / (yMax - yMin) * plotH;

        let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="${font}" role="img" aria-label="${title}">`;
        s += `<defs><linearGradient id="psky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#0B1626"/><stop offset="0.45" stop-color="#1B2F48"/>
            <stop offset="0.75" stop-color="#4A5568"/><stop offset="0.92" stop-color="#B9805A"/><stop offset="1" stop-color="#E3A56B"/></linearGradient>
            <radialGradient id="psun"><stop offset="0" stop-color="#FFD9A0" stop-opacity="0.9"/><stop offset="1" stop-color="#FFD9A0" stop-opacity="0"/></radialGradient>
            <clipPath id="pclip"><rect x="${x0}" y="${top}" width="${x1 - x0}" height="${plotH}"/></clipPath></defs>`;
        s += `<rect width="${W}" height="${H}" fill="#FFFFFF"/>`;
        // Judul
        s += `<text x="${pad}" y="${pad + fO + 2}" font-size="${fO}" fill="#5C6B62" letter-spacing="0.5">${P('org')}</text>`;
        s += `<text x="${pad}" y="${pad + fO + fT + 10}" font-size="${fT}" font-weight="800" fill="#1A6B3C">${title}</text>`;
        s += `<text x="${pad}" y="${pad + fO + fT + fS + 18}" font-size="${fS}" font-weight="600" fill="#1F3A7A">${sub}</text>`;

        // Langit + tanah
        s += `<g clip-path="url(#pclip)">`;
        s += `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${Y(0) - top}" fill="url(#psky)"/>`;
        s += `<circle cx="${X(0)}" cy="${Y(-0.83)}" r="${(x1 - x0) * 0.08}" fill="url(#psun)"/>`;
        // Garis batas IRNU
        const hp = r.hp || 0.95;
        const pts2 = [];
        for (let i = 0; i <= 160; i++) { const d = -xr + 2 * xr * i / 160; pts2.push(`${X(d).toFixed(1)},${Y(boundaryAlt(d, r.inp.minAlt, r.inp.minElong, hp)).toFixed(1)}`); }
        s += `<polyline points="${pts2.join(' ')}" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-dasharray="9 7" opacity="0.9"/>`;
        // Siluet tanah
        let ground = `M${x0} ${Y(0)}`;
        for (let i = 0; i <= 48; i++) {
            const gx = x0 + (x1 - x0) * i / 48;
            const bump = (Math.sin(i * 1.7) + Math.sin(i * 0.63 + 1) * 0.8) * plotH * 0.006;
            ground += ` L${gx.toFixed(1)} ${(Y(0) - Math.abs(bump)).toFixed(1)}`;
        }
        ground += ` L${x1} ${yb} L${x0} ${yb}Z`;
        s += `<path d="${ground}" fill="#0E1712"/>`;
        s += `<text x="${X(0)}" y="${Math.min(Y(0) + 18, yb - 6)}" font-size="${fL * 0.8}" fill="#E3A56B" text-anchor="middle">☉ ${P('sun')}</text>`;
        s += `</g>`;
        s += `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${plotH}" fill="none" stroke="#1E2A22" stroke-width="1"/>`;

        // Sumbu tinggi
        const stepY = (yMax - yMin) > 14 ? 2 : 1;
        for (let a = Math.ceil(yMin / stepY) * stepY; a <= yMax; a += stepY) {
            s += `<line x1="${x0 - 5}" y1="${Y(a)}" x2="${x0}" y2="${Y(a)}" stroke="#1E2A22"/>`;
            s += `<text x="${x0 - 9}" y="${Y(a) + 5}" font-size="${clamp(fL, 11, 16)}" fill="#1E2A22" text-anchor="end">${a}</text>`;
        }
        s += `<text transform="translate(${12 + pad} ${(top + yb) / 2}) rotate(-90)" font-size="${clamp(fL * 0.9, 11, 15)}" font-weight="700" fill="#1E2A22" text-anchor="middle">${P('alt')} (°)</text>`;
        // Sumbu datar
        const stepX = xr > 12 ? 4 : 2;
        for (let d = -Math.floor(xr / stepX) * stepX; d <= xr; d += stepX) {
            s += `<line x1="${X(d)}" y1="${yb}" x2="${X(d)}" y2="${yb + 5}" stroke="#1E2A22"/>`;
            s += `<text x="${X(d)}" y="${yb + 19}" font-size="${clamp(fL * 0.8, 10, 14)}" fill="#5C6B62" text-anchor="middle">${d > 0 ? '+' : ''}${d}°</text>`;
        }
        s += `<text x="${(x0 + x1) / 2}" y="${H - 6 - pad}" font-size="${clamp(fL * 0.85, 11, 15)}" fill="#5C6B62" text-anchor="middle">${P('daz')} →</text>`;

        // Titik + label (penempatan sederhana agar label tidak bertumpuk)
        const boxes = [];
        const hit = (b) => boxes.some(o => b.x < o.x + o.w && b.x + b.w > o.x && b.y < o.y + o.h && b.y + b.h > o.y) ||
            b.x < x0 || b.x + b.w > x1 || b.y < top || b.y + b.h > yb;
        const sorted = [...ok].sort((a, b) => (b.chosen ? 1 : 0) - (a.chosen ? 1 : 0));
        sorted.forEach(p => {
            const px = X(clamp(p.daz, -xr, xr)), py = Y(clamp(p.alt, yMin, yMax));
            boxes.push({ x: px - 9, y: py - 9, w: 18, h: 18 });
        });
        let marks = '', labels = '';
        const HALO = 'paint-order="stroke" stroke="#0B1626" stroke-opacity="0.75" stroke-width="4" stroke-linejoin="round"';
        const posOf = (p) => [X(clamp(p.daz, -xr, xr)), Y(clamp(p.alt, yMin, yMax))];
        // Titik yang punya tetangga sangat dekat: labelnya disusun dalam kolom dengan garis penunjuk
        const crowdedSet = new Set(sorted.filter((p, i) => sorted.some((q, j) => {
            if (j === i) return false;
            const [ax, ay] = posOf(p), [bx, by] = posOf(q);
            return Math.hypot(ax - bx, ay - by) < fL * 2.2;
        })));
        // Kandidat posisi label di sekitar titik (kanan, kiri, atas, bawah, serong)
        const candsFor = (p, w, h) => {
            const [px, py] = posOf(p), R = p.chosen ? 10 : 8;
            return [
                { x: px + R + 8, y: py - h / 2, a: 'start' }, { x: px - R - 8 - w, y: py - h / 2, a: 'end' },
                { x: px - w / 2, y: py - R - 8 - h, a: 'middle' }, { x: px - w / 2, y: py + R + 6, a: 'middle' },
                { x: px + R + 8, y: py - h - 4, a: 'start' }, { x: px + R + 8, y: py + 4, a: 'start' },
                { x: px - R - 8 - w, y: py - h - 4, a: 'end' }, { x: px - R - 8 - w, y: py + 4, a: 'end' }
            ];
        };
        // Titik di sekitar kelompok berdempet ikut masuk kolom (labelnya pasti bertabrakan dengan kolom)
        for (let changed = crowdedSet.size > 0; changed;) {
            changed = false;
            sorted.forEach(p => {
                if (crowdedSet.has(p)) return;
                const [ax, ay] = posOf(p);
                if ([...crowdedSet].some(q => { const [bx, by] = posOf(q); return Math.hypot(ax - bx, ay - by) < fL * 4; })) {
                    crowdedSet.add(p); changed = true;
                }
            });
        }
        // Uji coba: titik yang labelnya tidak muat di mana pun ikut masuk kolom
        {
            const saved = boxes.length;
            sorted.forEach(p => {
                if (crowdedSet.has(p)) return;
                const w = p.name.length * fL * 0.62, h = fL + 2;
                const c = candsFor(p, w, h).find(b => !hit({ x: b.x, y: b.y, w, h }));
                if (c) boxes.push({ x: c.x, y: c.y, w, h }); else crowdedSet.add(p);
            });
            boxes.length = saved;
        }
        // Tata letak kolom; titik lain yang jatuh di area kolom ikut dimasukkan, lalu dihitung ulang
        const layoutColumn = () => {
            const byY = [...crowdedSet].sort((a, b) => posOf(a)[1] - posOf(b)[1]);
            const lh = Math.min(fL + 6, (plotH - 16) / byY.length);
            const fC = clamp(lh - 4, 8, fL);
            const xs = byY.map(p => posOf(p)[0]), ys = byY.map(p => posOf(p)[1]);
            const withVal = W >= 520;
            const maxW = Math.max(...byY.map(p => (p.name.length + (withVal ? 7 : 0)) * fC * 0.62));
            const roomR = x1 - 8 - Math.max(...xs), roomL = Math.min(...xs) - x0 - 8;
            const right = roomR - 30 >= maxW || roomR >= roomL;
            const gap = clamp((right ? roomR : roomL) - maxW, 16, 60);
            const colX = right ? Math.max(...xs) + gap : Math.min(...xs) - gap;
            const midY = (Math.min(...ys) + Math.max(...ys)) / 2;
            const y0 = clamp(midY - (byY.length - 1) * lh / 2, top + lh, yb - byY.length * lh);
            const area = {
                x: right ? Math.max(...xs) : colX - maxW - 4, w: gap + maxW + 4,
                y: Math.min(y0 - fC, ...ys) - 6, h: Math.max(y0 + (byY.length - 1) * lh, ...ys) - Math.min(y0 - fC, ...ys) + 12
            };
            return { byY, lh, fC, withVal, maxW, right, colX, y0, area };
        };
        let col = crowdedSet.size ? layoutColumn() : null;
        for (let i = 0; col && i < 6; i++) {
            const inside = sorted.filter(p => !crowdedSet.has(p) && (([px, py]) =>
                px > col.area.x - 10 && px < col.area.x + col.area.w + 10 && py > col.area.y - 10 && py < col.area.y + col.area.h + 10)(posOf(p)));
            if (!inside.length) break;
            inside.forEach(p => crowdedSet.add(p));
            col = layoutColumn();
        }
        if (col) {
            const { byY, lh, fC, withVal, maxW, right, colX } = col;
            let y = col.y0;
            byY.forEach(p => {
                const [px, py] = posOf(p);
                const color = p.met ? '#FFFFFF' : '#F0A93B';
                labels += `<polyline points="${px},${py} ${colX + (right ? -10 : 10)},${y - fC * 0.35} ${colX + (right ? -4 : 4)},${y - fC * 0.35}" fill="none" stroke="${color}" stroke-opacity="0.55" stroke-width="1"/>`;
                boxes.push({ x: right ? colX : colX - maxW, y: y - fC, w: maxW, h: fC + 2 });
                labels += `<text x="${colX}" y="${y}" font-size="${fC}" font-weight="${p.chosen ? 800 : 600}" fill="${color}" text-anchor="${right ? 'start' : 'end'}" ${HALO}>${p.name}${withVal ? ` <tspan font-weight="500">${fmt.dms(p.alt, false)}</tspan>` : ''}</text>`;
                y += lh;
            });
        }
        sorted.forEach(p => {
            const px = X(clamp(p.daz, -xr, xr)), py = Y(clamp(p.alt, yMin, yMax));
            const color = p.met ? '#FFFFFF' : '#F0A93B';
            const R = p.chosen ? 10 : 8;
            marks += p.chosen ? `<circle cx="${px}" cy="${py}" r="${R + 5}" fill="none" stroke="#C9982E" stroke-width="2.5"/>` : '';
            marks += `<circle cx="${px}" cy="${py}" r="${R}" fill="${color}" stroke="#FFFFFF" stroke-opacity="0.6" stroke-width="1.5">` +
                `<title>${p.name}: ${fmt.dms(p.alt, false)} / ${fmt.dms(p.elong, false)}</title></circle>`;
            if (crowdedSet.has(p)) return;
            const text = p.name;
            const w = text.length * fL * 0.62, h = fL + 2;
            const cands = candsFor(p, w, h);
            const c = cands.find(b => !hit({ x: b.x, y: b.y, w, h })) || cands[0];
            boxes.push({ x: c.x, y: c.y, w, h });
            const tx = c.a === 'start' ? c.x : c.a === 'end' ? c.x + w : c.x + w / 2;
            labels += `<text x="${tx.toFixed(1)}" y="${(c.y + h - 3).toFixed(1)}" font-size="${fL}" font-weight="${p.chosen ? 800 : 600}" fill="${color}" text-anchor="${c.a}" ${HALO}>${text}</text>`;
        });
        s += `<g clip-path="url(#pclip)">${marks}${labels}</g>`;
        // Label garis batas
        s += `<text x="${x1 - 8}" y="${Y(r.inp.minAlt) - 8}" font-size="${clamp(fL * 0.8, 10, 14)}" fill="#FFFFFF" opacity="0.85" text-anchor="end">${P('boundary')}</text>`;
        s += '</svg>';
        return s;
    }

    function positions(r, fmt) {
        const box = $('vPos');
        if (!box) return;
        if (r.noSunset) { box.innerHTML = ''; return; }
        const pts = positionsData(r, fmt);
        const W = widthOf(box);
        const rows = pts.map(p => p.noSunset
            ? `<tr><td>${p.name}</td><td colspan="4">${P('no_sunset')}</td></tr>`
            : `<tr class="${p.chosen ? 'is-chosen' : ''}"><td>${p.name}</td><td>${hhmm(p.sunset, p.tz)}</td>
                <td>${fmt.dms(p.alt, false)}</td><td>${fmt.dms(p.elong, false)}</td>
                <td><span class="hilal-check ${p.met ? 'ok' : 'no'}">${p.met ? '✓' : '✗'}</span> ${p.met ? P('met') : p.conjBefore ? P('not_met') : P('before_conj')}</td></tr>`).join('');
        box.innerHTML = `<div class="pos-chart">${positionsSvg(r, fmt, pts, W)}</div>
            <figcaption>${P('cap').replace('{alt}', f1(r.inp.minAlt)).replace('{el}', f1(r.inp.minElong))}</figcaption>
            <div class="table-container"><table class="crit-table pos-table">
                <thead><tr><th>${P('place')}</th><th>${P('sunset')}</th><th>${P('altv')}</th><th>${P('elong')}</th><th>${P('status')}</th></tr></thead>
                <tbody>${rows}</tbody></table></div>`;
        lastPos = { r, fmt };
        renderPicker();
    }

    let lastPos = null;

    // Pemilih titik (tombol cepat + chip per kelompok)
    function renderPicker() {
        const box = $('vPosPicker');
        if (!box) return;
        const chip = (p) => `<button type="button" class="pt-chip" aria-pressed="${posSelected.has(p.id)}"
            onclick="HisabViz.togglePoint('${p.id}')">${p.name}</button>`;
        const group = (g) => `<div class="pt-group"><span class="pt-group-name">${P('g_' + g)}</span>
            <div class="pt-chips">${POINTS.filter(p => p.group === g).map(chip).join('')}</div></div>`;
        box.innerHTML = `<div class="pt-head"><strong>${P('pick')}</strong>
                <span class="pt-count">${P('n_sel').replace('{n}', posSelected.size)}</span></div>
            <div class="pt-presets"><span>${P('quick')}</span>
                ${Object.keys(PRESETS).map(k => `<button type="button" class="pt-preset" onclick="HisabViz.applyPreset('${k}')">${P(k)}</button>`).join('')}
            </div>
            ${['taiwan', 'indonesia', 'other'].map(group).join('')}
            <p class="pt-note">${P('chosen_note')}</p>`;
    }

    function selectionChanged() {
        saveSelection();
        renderPicker();
        if (lastPos) positions(lastPos.r, lastPos.fmt);
    }

    function togglePoint(id) {
        if (posSelected.has(id)) posSelected.delete(id); else posSelected.add(id);
        selectionChanged();
    }

    function applyPreset(name) {
        if (!PRESETS[name]) return;
        posSelected = new Set(PRESETS[name]);
        selectionChanged();
    }

    // Unduh gambar PNG (lebar 1200 px)
    function downloadPositions() {
        if (!lastPos) return;
        const { r, fmt } = lastPos;
        const svg = positionsSvg(r, fmt, positionsData(r, fmt), 1200, 32);
        const img = new Image();
        const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
        img.onload = () => {
            const scale = 2;
            const canvas = document.createElement('canvas');
            canvas.width = img.width * scale; canvas.height = img.height * scale;
            const ctx2 = canvas.getContext('2d');
            ctx2.scale(scale, scale);
            ctx2.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            const a = document.createElement('a');
            a.download = `posisi-hilal-${r.inp.year}-${pad2(r.inp.month)}.png`;
            a.href = canvas.toDataURL('image/png');
            a.click();
        };
        img.src = url;
    }

    return { render, positions, togglePoint, applyPreset, downloadPositions };
})();
