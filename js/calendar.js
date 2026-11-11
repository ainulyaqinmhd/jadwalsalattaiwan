/**
 * calendar.js
 * Tampilan kalender Masehi + Hijriah (IRNU) + pasaran,
 * dipakai bersama oleh index.html (kalender ringkas) dan kalender.html (halaman penuh).
 *
 * Depends on: translations.js (translations, arrays, currentLang), hijri.js (Hijri);
 *             opsional eclipse.js (Eclipses) untuk penanda gerhana
 */
const CalendarView = (() => {
    const pad2 = (n) => String(n).padStart(2, '0');
    const tr = (key) => translations[key][currentLang];
    const hijriMonthName = (m) => arrays.namaBulanHijri[currentLang][m - 1];
    const gregMonthName = (m0) => arrays.namaBulan[currentLang][m0];

    function hijriSafe(n) {
        try { return Hijri.fromDayNum(n); } catch (err) { return null; }
    }

    /** Nomor hari → "YYYY-MM-DD" */
    function toIso(n) {
        const d = Hijri.dayNumToDate(n);
        return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    }

    /** "YYYY-MM-DD" → nomor hari, atau null jika tidak valid */
    function fromIso(s) {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
        if (!m) return null;
        const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
        if (mo < 1 || mo > 12 || d < 1 || d > new Date(y, mo, 0).getDate()) return null;
        return Hijri.dayNum(y, mo, d);
    }

    const todayNum = () => Hijri.dayNumFromDate(new Date());

    /** Semua keterangan satu hari */
    function dayInfo(n) {
        const g = Hijri.dayNumToDate(n);
        const h = hijriSafe(n);
        const ev = h ? Hijri.specialDay(h.month, h.day) : null;
        let eclipses = [];
        if (typeof Eclipses !== 'undefined') {
            try { eclipses = Eclipses.onDay(n); } catch (err) { eclipses = []; }
        }
        return {
            n, g, h, ev, eclipses,
            dow: g.getDay(),
            pasaran: Hijri.pasaran(n),
            fixed: h ? Hijri.isFixed(h.year, h.month) : false
        };
    }

    /** "Selasa Wage, 3 November 2026" */
    function gregorianLabel(n) {
        const i = dayInfo(n);
        return `${arrays.namaHari[currentLang][i.dow]} ${i.pasaran}, ${i.g.getDate()} ${gregMonthName(i.g.getMonth())} ${i.g.getFullYear()}`;
    }

    /** "23 Jumadil Awal 1448 H" */
    const hijriLabel = (h) => `${h.day} ${hijriMonthName(h.month)} ${h.year} H`;

    /** Keterangan satu bulan Masehi: rentang hari & bulan Hijriah yang tercakup */
    function monthMeta(year, month0) {
        const first = Hijri.dayNum(year, month0 + 1, 1);
        const daysInMonth = new Date(year, month0 + 1, 0).getDate();
        const last = first + daysInMonth - 1;
        const hFirst = hijriSafe(first);
        const hLast = hijriSafe(last);
        let rangeText = '';
        let fixed = false;
        if (hFirst && hLast) {
            const sameYear = hFirst.year === hLast.year;
            rangeText = hFirst.month === hLast.month && sameYear
                ? `${hijriMonthName(hFirst.month)} ${hFirst.year} H`
                : `${hijriMonthName(hFirst.month)}${sameYear ? '' : ` ${hFirst.year}`} – ${hijriMonthName(hLast.month)} ${hLast.year} H`;
            fixed = Hijri.isFixed(hFirst.year, hFirst.month) && Hijri.isFixed(hLast.year, hLast.month);
        }
        return {
            first, last, daysInMonth,
            startDow: new Date(year, month0, 1).getDay(),
            title: `${gregMonthName(month0)} ${year}`,
            rangeText,
            hasHijri: !!(hFirst && hLast),
            fixed
        };
    }

    /**
     * HTML kisi bulan.
     * opts.selected  : nomor hari yang disorot (opsional)
     * opts.href(n)   : jika ada, sel menjadi tautan
     * opts.onSelect  : nama fungsi global untuk tombol, mis. 'CalPage.select'
     */
    function gridHtml(year, month0, opts = {}) {
        const meta = monthMeta(year, month0);
        const todayN = todayNum();
        let html = arrays.namaHariPendek[currentLang]
            .map((d, i) => `<div class="cal-dow${i === 0 ? ' is-sun' : ''}${i === 5 ? ' is-fri' : ''}">${d}</div>`)
            .join('');
        for (let i = 0; i < meta.startDow; i++) html += '<div class="cal-blank" aria-hidden="true"></div>';

        for (let d = 1; d <= meta.daysInMonth; d++) {
            const n = meta.first + d - 1;
            const i = dayInfo(n);
            const classes = ['cal-day'];
            if (i.dow === 0) classes.push('is-sun');
            if (i.dow === 5) classes.push('is-fri');
            if (n === todayN) classes.push('is-today');
            if (n === opts.selected) classes.push('is-selected');
            if (i.ev) classes.push(`ev-${i.ev.kind}`);
            if (i.eclipses.length) {
                classes.push('has-eclipse');
                if (i.eclipses.some(e => e.visible)) classes.push('ecl-visible');
            }

            // Label bawah: hari penting, gerhana, atau nama bulan Hijriah pada tanggal 1 / awal bulan Masehi
            const bottom = i.ev ? `<span class="cal-ev">${tr(i.ev.key)}</span>`
                : i.eclipses.length ? `<span class="cal-ecl">${tr(`ecl_short_${i.eclipses[0].type}`)}</span>`
                : (i.h && (i.h.day === 1 || d === 1) ? `<span class="cal-hm">${hijriMonthName(i.h.month)}</span>` : '');
            const label = (gregorianLabel(n) + (i.h ? `, ${hijriLabel(i.h)}` : '') + (i.ev ? `, ${tr(i.ev.key)}` : '') +
                i.eclipses.map(e => `, ${tr(Eclipses.kindKey(e))}`).join(''))
                .replace(/"/g, '&quot;');
            const inner = `
                <span class="cal-top"><span class="cal-g">${d}</span><span class="cal-h">${i.h ? i.h.day : ''}</span></span>
                <span class="cal-p">${i.pasaran}</span>
                ${bottom}`;

            if (opts.href) {
                html += `<a class="${classes.join(' ')}" href="${opts.href(n)}" data-day="${n}" aria-label="${label}"${n === todayN ? ' aria-current="date"' : ''}>${inner}</a>`;
            } else {
                const selected = n === opts.selected;
                html += `<button type="button" class="${classes.join(' ')}" data-day="${n}" onclick="${opts.onSelect}(${n})"
                    aria-label="${label}" aria-pressed="${selected}" tabindex="${selected ? 0 : -1}">${inner}</button>`;
            }
        }
        return { html, meta };
    }

    /** Hari-hari penting dalam rentang nomor hari [from, to]; hari berurutan yang sama digabung (Tasyrik, Ayyamul Bidh) */
    function eventsBetween(from, to) {
        const out = [];
        for (let n = from; n <= to; n++) {
            const i = dayInfo(n);
            if (!i.ev) continue;
            const prev = out[out.length - 1];
            if (prev && prev.key === i.ev.key && prev.to === n - 1) { prev.to = n; continue; }
            out.push({ key: i.ev.key, kind: i.ev.kind, from: n, to: n, h: i.h });
        }
        return out;
    }

    return {
        pad2, tr, hijriSafe, toIso, fromIso, todayNum, dayInfo,
        gregorianLabel, hijriLabel, hijriMonthName, gregMonthName,
        monthMeta, gridHtml, eventsBetween
    };
})();
