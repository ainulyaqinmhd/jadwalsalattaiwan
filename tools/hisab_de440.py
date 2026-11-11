#!/usr/bin/env python3
"""
hisab_de440.py — Tabel awal bulan Hijriah (kriteria IRNU) dengan efemeris JPL DE440s.

Menghasilkan js/hilal-de440.js berisi data hilal setiap bulan Hijriah:
ijtimak, matahari terbenam, tinggi hilal mar'i, elongasi haqiqi, dan tanggal 1.
Situs memakai tabel ini bila markaz & kriteria di js/hijri.js sama dengan di bawah;
di luar rentang tabel, situs menghitung sendiri dengan Astronomy Engine.

Definisi (sama dengan js/hijri.js):
  - Ijtimak        : bujur ekliptika tampak Bulan = Matahari (geosentrik)
  - Ghurub         : piringan atas Matahari di ufuk, tinggi -0°50' (refraksi 34' + jari-jari 16')
  - Tinggi mar'i   : tinggi pusat Bulan, toposentrik, tanpa refraksi, saat ghurub
  - Elongasi haqiqi: jarak sudut pusat Bulan–Matahari, geosentrik, saat ghurub
  - Kriteria IRNU  : tinggi >= 3° dan elongasi >= 6,4° → besok tanggal 1; jika tidak → istikmal

Pemakaian:
  pip install skyfield numpy
  curl -LO https://ssd.jpl.nasa.gov/ftp/eph/planets/bsp/de440s.bsp
  python tools/hisab_de440.py --eph de440s.bsp            # 1440–1500 H
  python tools/hisab_de440.py --eph de440s.bsp --from 1445 --to 1460

DE440s mencakup 1849–2150. DE441 (≈3 GB) bisa dipakai dengan --eph de441_part-2.bsp;
untuk rentang ini hasilnya praktis sama.
"""
import argparse
import datetime as dt
import json
import os
import sys

from skyfield import almanac
from skyfield.api import load, load_file, wgs84

# --- Harus sama dengan HIJRI_CONFIG di js/hijri.js ---
MARKAZ = {"name": "PCINU Taiwan (Taipei)", "lat": 25.0330, "lng": 121.5654, "elevation_m": 0}
UTC_OFFSET_HOURS = 8
MIN_ALTITUDE = 3.0
MIN_ELONGATION = 6.4

# Patokan perkiraan (hanya titik awal pencarian): ijtimak 1 Muharram 1447 H
ANCHOR_IDX = 1447 * 12
ANCHOR_CONJ = dt.datetime(2025, 6, 25, 10, 31, tzinfo=dt.timezone.utc)
SYNODIC_MONTH = 29.530588853


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--eph", required=True, help="berkas efemeris JPL (.bsp), mis. de440s.bsp")
    ap.add_argument("--from", dest="year_from", type=int, default=1440, help="tahun Hijriah awal (default 1440)")
    ap.add_argument("--to", dest="year_to", type=int, default=1500, help="tahun Hijriah akhir (default 1500)")
    ap.add_argument("--out", default=os.path.join(os.path.dirname(__file__), "..", "js", "hilal-de440.js"))
    args = ap.parse_args()

    ts = load.timescale()
    eph = load_file(args.eph)
    base = os.path.splitext(os.path.basename(args.eph))[0]
    eph_name = base[:-1].upper() + "s" if base.endswith("s") else base.upper()  # de440s → DE440s
    sun, moon, earth = eph["sun"], eph["moon"], eph["earth"]
    observer = earth + wgs84.latlon(MARKAZ["lat"], MARKAZ["lng"], elevation_m=MARKAZ["elevation_m"])
    phases = almanac.moon_phases(eph)
    tz = dt.timedelta(hours=UTC_OFFSET_HOURS)

    months = {}
    for idx in range(args.year_from * 12, (args.year_to + 1) * 12):
        year, month = idx // 12, idx % 12 + 1

        # 1) Ijtimak terdekat dengan perkiraan rata-rata
        approx = ANCHOR_CONJ + dt.timedelta(days=(idx - ANCHOR_IDX) * SYNODIC_MONTH)
        t, ph = almanac.find_discrete(ts.from_datetime(approx - dt.timedelta(days=3)),
                                      ts.from_datetime(approx + dt.timedelta(days=3)), phases)
        new_moons = [ti for ti, p in zip(t, ph) if p == 0]
        if len(new_moons) != 1:
            sys.exit(f"{year}-{month}: ijtimak tidak ditemukan unik ({len(new_moons)})")
        conj = new_moons[0]
        conj_utc = conj.utc_datetime()
        local_day = (conj_utc + tz).date()

        # 2) Matahari terbenam pada tanggal lokal hari ijtimak
        midnight_utc = dt.datetime.combine(local_day, dt.time(0), tzinfo=dt.timezone.utc) - tz
        st, actual = almanac.find_settings(observer, sun, ts.from_datetime(midnight_utc),
                                           ts.from_datetime(midnight_utc + dt.timedelta(days=1)))
        sunset = st[0] if len(st) and actual[0] else None

        alt = elong = None
        fulfilled = False
        if sunset is not None and sunset.tt >= conj.tt:
            # 3) Tinggi mar'i: toposentrik, pusat Bulan, tanpa refraksi
            alt = observer.at(sunset).observe(moon).apparent().altaz()[0].degrees
            # 4) Elongasi haqiqi: geosentrik
            g = earth.at(sunset)
            elong = g.observe(moon).apparent().separation_from(g.observe(sun).apparent()).degrees
            fulfilled = alt >= MIN_ALTITUDE and elong >= MIN_ELONGATION

        start = local_day + dt.timedelta(days=1 if fulfilled else 2)
        months[f"{year}-{month}"] = {
            "c": conj_utc.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "s": sunset.utc_datetime().strftime("%Y-%m-%dT%H:%M:%SZ") if sunset is not None else None,
            "a": round(alt, 4) if alt is not None else None,
            "e": round(elong, 4) if elong is not None else None,
            "f": 1 if fulfilled else 0,
            "d": start.isoformat(),
        }

    table = {
        "meta": {
            "ephemeris": f"JPL {eph_name}",
            "generator": "tools/hisab_de440.py (Skyfield)",
            "generated": dt.date.today().isoformat(),
            "markaz": MARKAZ,
            "utcOffset": UTC_OFFSET_HOURS,
            "minAltitude": MIN_ALTITUDE,
            "minElongation": MIN_ELONGATION,
            "range": [args.year_from, args.year_to],
        },
        "months": months,
    }
    header = (
        "/**\n"
        " * hilal-de440.js — DIBUAT OTOMATIS oleh tools/hisab_de440.py. Jangan diubah manual.\n"
        f" * Data hilal (kriteria IRNU) {args.year_from}–{args.year_to} H, efemeris JPL {eph_name},\n"
        f" * markaz {MARKAZ['name']}. Kunci 'TAHUN-BULAN': c=ijtimak (UTC), s=ghurub (UTC),\n"
        " * a=tinggi mar'i (°), e=elongasi haqiqi (°), f=terpenuhi (1/0), d=tanggal 1 (Masehi).\n"
        " */\n"
    )
    with open(args.out, "w", encoding="utf-8") as f:
        f.write(header + "const HILAL_TABLE = " + json.dumps(table, separators=(",", ":")) + ";\n")
    print(f"{len(months)} bulan → {os.path.normpath(args.out)} ({os.path.getsize(args.out) // 1024} KB)")


if __name__ == "__main__":
    main()
