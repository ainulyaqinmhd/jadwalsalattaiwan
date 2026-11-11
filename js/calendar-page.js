/**
 * calendar-page.js
 * Logika halaman kalender lengkap (kalender.html).
 * Depends on: translations.js, locations.js, hijri.js, eclipse.js, prayer-api.js, calendar.js
 *
 * Tanggal terpilih ada di URL (?d=YYYY-MM-DD) sehingga bisa dibagikan.
 */
const CalPage = (() => {
    const C = CalendarView;
    const tr = (key) => translations[key][currentLang];
    const CITY_KEY = 'calCity';
    const PRAYERS = [
        ['Imsak', 'prayer_imsak'], ['Fajr', 'prayer_fajr'], ['Sunrise', 'prayer_sunrise'],
        ['Dhuhr', 'prayer_dhuhr'], ['Asr', 'prayer_asr'], ['Maghrib', 'prayer_maghrib'], ['Isha', 'prayer_isha']
    ];

    let selected = null;   // nomor hari terpilih
    let viewYear = null;   // bulan Masehi yang ditampilkan
    let viewMonth = null;  // 0–11
    let hYear = null;      // tahun Hijriah untuk tabel tahunan
    let city = 'Taipei';
    const timesCache = new Map();
    let timesRequestId = 0;

    // ---------- Status ----------
    function init() {
        const fromUrl = C.fromIso(new URLSearchParams(location.search).get('d'));
        selected = fromUrl !== null ? fromUrl : C.todayNum();
        syncViewToSelected(true);

        try {
            const saved = localStorage.getItem(CITY_KEY);
            if (saved && locations[saved]) city = saved;
        } catch (err) { /* penyimpanan tidak tersedia */ }

        const citySel = document.getElementById('cpCity');
        citySel.innerHTML = Object.keys(locations).map(c => `<option value="${c}">${c}</option>`).join('');
        citySel.value = city;

        document.getElementById('cpGrid').addEventListener('keydown', onGridKey);
    }

    function syncViewToSelected(resetYear) {
        const g = Hijri.dayNumToDate(selected);
        viewYear = g.getFullYear();
        viewMonth = g.getMonth();
        if (resetYear) {
            const h = C.hijriSafe(selected);
            hYear = h ? h.year : null;
        }
    }

    function updateUrl() {
        try {
            history.replaceState(null, '', `?d=${C.toIso(selected)}`);
        } catch (err) { /* abaikan */ }
    }

    // ---------- Aksi ----------
    function select(n, focus = true) {
        const prevH = C.hijriSafe(selected);
        selected = n;
        const h = C.hijriSafe(n);
        // Tabel tahunan ikut berpindah bila tahun Hijriah berubah
        syncViewToSelected(!prevH || !h || prevH.year !== h.year);
        updateUrl();
        render();
        if (focus) focusSelected();
    }

    function shiftMonth(delta) {
        const g = Hijri.dayNumToDate(selected);
        const target = new Date(viewYear, viewMonth + delta, 1);
        const daysIn = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
        select(Hijri.dayNum(target.getFullYear(), target.getMonth() + 1, Math.min(g.getDate(), daysIn)), false);
    }

    function today() {
        select(C.todayNum(), false);
    }

    function shiftYear(delta) {
        if (hYear === null) return;
        hYear += delta;
        renderYear();
    }

    /** Dari daftar/tabel: pindah ke tanggal lalu gulir ke kalender */
    function jump(n) {
        select(n, false);
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        document.querySelector('.calpage-layout').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        focusSelected();
    }

    function setCity(name) {
        if (!locations[name]) return;
        city = name;
        try { localStorage.setItem(CITY_KEY, name); } catch (err) { /* abaikan */ }
        renderDay();
        renderYear();
    }

    function focusSelected() {
        const btn = document.querySelector(`#cpGrid .cal-day[data-day="${selected}"]`);
        if (btn) btn.focus({ preventScroll: true });
    }

    // Panah kiri/kanan = hari, atas/bawah = minggu
    function onGridKey(e) {
        const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
        if (!(e.key in moves) || !e.target.classList.contains('cal-day')) return;
        e.preventDefault();
        select(selected + moves[e.key], true);
    }

    // ---------- Format ----------
    const pad2 = C.pad2;

    function formatDeg(x) {
        const totalMin = Math.round(Math.abs(x) * 60);
        return `${x < 0 ? '−' : ''}${Math.floor(totalMin / 60)}° ${pad2(totalMin % 60)}′`;
    }

    // Tanggal & jam di zona waktu markaz
    function markazTime(date) {
        const d = new Date(date.getTime() + HIJRI_CONFIG.utcOffset * 3600000);
        return `${d.getUTCDate()} ${arrays.namaBulan[currentLang][d.getUTCMonth()].slice(0, 3)}, ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
    }

    function shortDate(n) {
        const g = Hijri.dayNumToDate(n);
        return `${arrays.namaHariPendek[currentLang][g.getDay()]} ${Hijri.pasaran(n)}, ${g.getDate()} ${arrays.namaBulan[currentLang][g.getMonth()]} ${g.getFullYear()}`;
    }

    // Versi ringkas untuk tabel: "Sel Wage, 16 Jun 2026"
    function tableDate(n) {
        const g = Hijri.dayNumToDate(n);
        return `${arrays.namaHariPendek[currentLang][g.getDay()]} ${Hijri.pasaran(n)}, ${g.getDate()} ${arrays.namaBulan[currentLang][g.getMonth()].slice(0, 3)} ${g.getFullYear()}`;
    }

    function relativeLabel(n) {
        const diff = n - C.todayNum();
        if (diff === 0) return tr('rel_today');
        if (diff === 1) return tr('rel_tomorrow');
        if (diff === -1) return tr('rel_yesterday');
        return tr(diff > 0 ? 'rel_in' : 'rel_ago').replace('{n}', Math.abs(diff));
    }

    const check = (ok) => `<span class="hilal-check ${ok ? 'ok' : 'no'}">${ok ? '✓' : '✗'}</span>`;

    // "HH:MM" di zona waktu markaz
    function hm(date) {
        const d = new Date(date.getTime() + HIJRI_CONFIG.utcOffset * 3600000);
        return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
    }

    // Gerhana dilihat dari kota terpilih; [] jika pustaka astronomi tidak tersedia
    function eclipsesFor(from, to) {
        try { return Eclipses.between(from, to, locations[city]); } catch (err) { return []; }
    }

    function eclipseDetail(e) {
        let vis = tr(e.visible ? 'ecl_visible' : 'ecl_not_visible').replace('{place}', city);
        if (e.type === 'solar' && e.visible && e.local && e.local.kind !== e.kind) {
            vis += `, ${tr('ecl_seen_as').replace('{kind}', tr(`ecl_solar_${e.local.kind}`).toLowerCase())}`;
        }
        const contacts = e.type === 'lunar' ? e.contacts : (e.local ? e.local.contacts : []);
        const rows = contacts.map(c => `<li class="${c.altitude > 0 ? '' : 'is-below'}${c.key === 'peak' ? ' is-peak' : ''}">
                <span>${tr(`ecl_${c.key}`)}</span><strong>${hm(c.date)}</strong>
                <small>${c.altitude > 0 ? `${Math.round(c.altitude)}°` : tr('ecl_below')}</small></li>`).join('');
        let note = '';
        if (e.type === 'solar' && e.visible && e.local) {
            note += `<p>${tr('ecl_obscured').replace('{p}', Math.round(e.local.obscuration * 100))}</p>`;
        }
        if (e.prayer) note += `<p class="ecl-prayer">${tr(e.type === 'lunar' ? 'ecl_prayer_lunar' : 'ecl_prayer_solar')}</p>`;
        else if (e.kind === 'penumbral') note += `<p>${tr('ecl_penumbral_note')}</p>`;
        return `<div class="ecl-card${e.visible ? ' is-visible' : ''}">
            <div class="ecl-head"><strong>${tr(Eclipses.kindKey(e))}</strong>
                <span>${tr('ecl_peak')} ${hm(e.peak)} (UTC+${HIJRI_CONFIG.utcOffset})</span></div>
            <div class="ecl-vis">${vis}</div>
            ${rows ? `<ul class="ecl-contacts">${rows}</ul>` : ''}
            ${note}
        </div>`;
    }

    // ---------- Tampilan ----------
    function render() {
        if (selected === null) return;
        try {
            renderToday();
            renderMonth();
            renderDay();
            renderMonthEvents();
            renderYear();
        } catch (err) {
            console.error('Gagal menampilkan kalender:', err);
            document.getElementById('cpGrid').innerHTML =
                `<p class="table-error">${tr(err.name === 'HijriError' ? 'error_hijri' : 'error_load')}</p>`;
        }
    }

    function renderToday() {
        const t = C.todayNum();
        const h = C.hijriSafe(t);
        document.getElementById('calpageToday').innerHTML =
            `<span class="hero-date">${C.gregorianLabel(t)}</span>` +
            (h ? `<span class="hero-hijri">${C.hijriLabel(h)}</span>` : '');
    }

    function renderMonth() {
        const { html, meta } = C.gridHtml(viewYear, viewMonth, { selected, onSelect: 'CalPage.select' });
        document.getElementById('cpGrid').innerHTML = html;
        document.getElementById('cpMonthTitle').innerText = meta.title;
        document.getElementById('cpHijriRange').innerText = meta.rangeText;
        const status = document.getElementById('cpMonthStatus');
        status.textContent = meta.hasHijri ? tr(meta.fixed ? 'hijri_status_fixed' : 'hijri_status_hisab') : '';
        status.className = `hijri-status${meta.fixed ? ' fixed' : ''}`;
        document.getElementById('cpPrev').setAttribute('aria-label', tr('cal_prev'));
        document.getElementById('cpNext').setAttribute('aria-label', tr('cal_next'));
    }

    function renderDay() {
        const i = C.dayInfo(selected);
        document.getElementById('dayNum').innerText = i.g.getDate();
        document.getElementById('dayRel').innerText = relativeLabel(selected);
        document.getElementById('dayGreg').innerText = C.gregorianLabel(selected);
        document.getElementById('dayHijri').innerHTML = i.h
            ? `${C.hijriLabel(i.h)}${i.fixed ? '' : ` <small>(${tr('cal_provisional')})</small>`}` : '';
        document.getElementById('dayEv').innerHTML = i.ev
            ? `<span class="cal-detail-ev ev-${i.ev.kind}">${tr(i.ev.key)}</span>` : '';

        // Gerhana pada hari ini, dilihat dari kota terpilih
        const dayStart = new Date(selected * 86400000 - HIJRI_CONFIG.utcOffset * 3600000);
        const ecl = eclipsesFor(new Date(dayStart.getTime() - 86400000), new Date(dayStart.getTime() + 2 * 86400000))
            .filter(e => Eclipses.localDayNum(e.peak) === selected);
        document.getElementById('dayEcl').innerHTML = ecl.map(eclipseDetail).join('');
        renderTimes();
    }

    async function renderTimes() {
        const box = document.getElementById('dayTimes');
        const key = `${city}|${selected}`;
        const draw = (timings) => {
            box.innerHTML = PRAYERS.map(([id, label]) =>
                `<div class="day-time${id === 'Imsak' || id === 'Sunrise' ? ' is-minor' : ''}">
                    <span>${tr(label)}</span><strong>${timings ? timings[id].substring(0, 5) : '--:--'}</strong>
                </div>`).join('');
        };

        if (timesCache.has(key)) { draw(timesCache.get(key)); return; }
        draw(null);
        const requestId = ++timesRequestId;
        try {
            const loc = locations[city];
            const data = await PrayerApi.timings(loc.lat, loc.lng, Hijri.dayNumToDate(selected));
            timesCache.set(key, data.timings);
            if (requestId === timesRequestId) draw(data.timings);
        } catch (err) {
            if (requestId !== timesRequestId) return;
            console.error('Gagal memuat waktu sholat:', err);
            box.innerHTML = `<p class="day-times-error">${tr('error_load')}
                <button class="btn-retry" onclick="CalPage.renderTimes()">${tr('btn_retry')}</button></p>`;
        }
    }

    function eventItem(e, withYear) {
        const gFrom = Hijri.dayNumToDate(e.from);
        const gTo = Hijri.dayNumToDate(e.to);
        const days = e.from === e.to ? `${gFrom.getDate()}` : `${gFrom.getDate()}–${gTo.getDate()}`;
        const mon = arrays.namaBulan[currentLang][gFrom.getMonth()].slice(0, 3);
        const hDays = e.from === e.to ? `${e.h.day}` : `${e.h.day}–${e.h.day + (e.to - e.from)}`;
        const sub = withYear
            ? shortDate(e.from)
            : `${arrays.namaHari[currentLang][gFrom.getDay()]} ${Hijri.pasaran(e.from)}`;
        return `<li>
            <button type="button" class="event-item ev-${e.kind}${selected >= e.from && selected <= e.to ? ' is-selected' : ''}"
                onclick="CalPage.jump(${e.from})">
                <span class="event-date"><strong>${days}</strong><small>${mon}</small></span>
                <span class="event-text">
                    <span class="event-name">${tr(e.key)}</span>
                    <span class="event-sub">${hDays} ${C.hijriMonthName(e.h.month)} ${e.h.year} H · ${sub}</span>
                </span>
            </button>
        </li>`;
    }

    function renderMonthEvents() {
        const meta = C.monthMeta(viewYear, viewMonth);
        const events = C.eventsBetween(meta.first, meta.last);
        document.getElementById('cpEvents').innerHTML = events.length
            ? events.map(e => eventItem(e, false)).join('')
            : `<li class="event-empty">${tr('calpage_no_events')}</li>`;
    }

    function renderYear() {
        const section = document.querySelector('.calpage-year');
        if (hYear === null) { section.hidden = true; return; }
        section.hidden = false;
        document.getElementById('cpYearTitle').innerText = `${hYear} H`;
        document.getElementById('cpStartsTitle').innerText = `${tr('calpage_month_starts')} ${hYear} H`;
        document.getElementById('cpHolidaysTitle').innerText = `${tr('calpage_holidays')} ${hYear} H`;
        document.getElementById('cpPrevYear').setAttribute('aria-label', tr('calpage_prev_year'));
        document.getElementById('cpNextYear').setAttribute('aria-label', tr('calpage_next_year'));

        document.getElementById('cpStartsHead').innerHTML = `<tr>
            <th>${tr('calpage_th_month')}</th><th>${tr('calpage_th_first')}</th><th>${tr('calpage_th_conj')}</th>
            <th>${tr('calpage_th_alt')}</th><th>${tr('calpage_th_elong')}</th><th>${tr('calpage_th_status')}</th></tr>`;

        const selH = C.hijriSafe(selected);
        let rows = '';
        for (let m = 1; m <= 12; m++) {
            const range = Hijri.monthRange(hYear, m);
            let ev = null;
            try { ev = Hijri.evaluate(hYear, m); } catch (err) { ev = null; }
            const hl = ev && ev.hilal;
            const isCurrent = selH && selH.year === hYear && selH.month === m;
            rows += `<tr${isCurrent ? ' class="current-day-row"' : ''}>
                <td><button type="button" class="link-btn" onclick="CalPage.jump(${range.start})">${C.hijriMonthName(m)}</button></td>
                <td>${tableDate(range.start)}</td>
                <td>${ev ? markazTime(ev.conjunction) : '-'}</td>
                <td>${hl ? `${formatDeg(hl.altitude)} ${check(hl.altitude >= HIJRI_CONFIG.minAltitude)}` : '-'}</td>
                <td>${hl ? `${formatDeg(hl.elongation)} ${check(hl.elongation >= HIJRI_CONFIG.minElongation)}` : '-'}</td>
                <td><span class="hijri-status${range.fixed ? ' fixed' : ''}">${tr(range.fixed ? 'calpage_status_fixed' : 'calpage_status_hisab')}</span></td>
            </tr>`;
        }
        document.getElementById('cpStarts').innerHTML = rows;

        const from = Hijri.monthRange(hYear, 1).start;
        const to = Hijri.monthRange(hYear + 1, 1).start - 1;
        const holidays = C.eventsBetween(from, to).filter(e => e.kind !== 'fasting');
        document.getElementById('cpHolidays').innerHTML = holidays.map(e => eventItem(e, true)).join('');

        // Gerhana sepanjang tahun Hijriah ini
        document.getElementById('cpEclTitle').innerText = `${tr('calpage_eclipses')} ${hYear} H`;
        const toDate = (n) => new Date(n * 86400000 - HIJRI_CONFIG.utcOffset * 3600000);
        const eclipses = eclipsesFor(toDate(from), toDate(to + 1));
        document.getElementById('cpEclipses').innerHTML = eclipses.length ? eclipses.map(e => {
            const n = Eclipses.localDayNum(e.peak);
            const g = Hijri.dayNumToDate(n);
            const h = C.hijriSafe(n);
            const vis = tr(e.visible ? 'ecl_visible' : 'ecl_not_visible').replace('{place}', city);
            return `<li>
                <button type="button" class="event-item ecl-item${e.visible ? ' is-visible' : ''}${selected === n ? ' is-selected' : ''}"
                    onclick="CalPage.jump(${n})">
                    <span class="event-date"><strong>${g.getDate()}</strong><small>${arrays.namaBulan[currentLang][g.getMonth()].slice(0, 3)}</small></span>
                    <span class="event-text">
                        <span class="event-name">${tr(Eclipses.kindKey(e))}</span>
                        <span class="event-sub">${h ? `${C.hijriLabel(h)} · ` : ''}${hm(e.peak)} · ${vis}</span>
                    </span>
                </button>
            </li>`;
        }).join('') : `<li class="event-empty">${tr('calpage_no_eclipses')}</li>`;

        // Sumber data awal bulan
        const sources = [...new Set(Array.from({ length: 12 }, (_, k) => {
            try { return Hijri.evaluate(hYear, k + 1).source; } catch (err) { return null; }
        }).filter(Boolean))];
        document.getElementById('cpSource').innerText = sources.length ? `${tr('calpage_source')}: ${sources.join(', ')}` : '';
    }

    init();
    return { select, shiftMonth, today, shiftYear, jump, setCity, render, renderTimes };
})();

// Dipanggil translations.js saat bahasa berganti (dan saat halaman siap)
function onLangChange() {
    CalPage.render();
}

// --- Mode Offline (Service Worker) ---
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(err => console.warn('Service worker gagal didaftarkan:', err));
    });
}
