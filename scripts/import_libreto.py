"""Convierte el libreto técnico (.xlsx) en src/data/libreto.json.

Uso:  python3 scripts/import_libreto.py <entrada.xlsx> <salida.json>
Requiere: pip install openpyxl

Columnas esperadas (fila de encabezados con "N.º"):
  N.º | ESCENA / BLOQUE | PIE | VIDEO / SONIDO | LUCES | ESCENARIO / TELÓN | ACTORES / UTILERÍA
"""

import json
import re
import sys

import openpyxl

HEADERS = {
    "N.º": "num",
    "ESCENA / BLOQUE": "block",
    "PIE": "cue",
    "VIDEO / SONIDO": "sound",
    "LUCES": "lights",
    "ESCENARIO / TELÓN": "stage",
    "ACTORES / UTILERÍA": "actors",
}


def clean(value):
    if value is None:
        return ""
    text = re.sub(r"\s+", " ", str(value)).strip()
    return "" if text in ("—", "-", "–") else text


def main(src, dst):
    ws = openpyxl.load_workbook(src, data_only=True).active
    rows = list(ws.iter_rows(values_only=True))

    title = clean(rows[0][0]) if rows else ""
    header_idx = next(i for i, r in enumerate(rows) if clean(r[0]) == "N.º")
    cols = {HEADERS[clean(h)]: i for i, h in enumerate(rows[header_idx]) if clean(h) in HEADERS}

    cues = []
    last_num = 0
    sub = 0
    for r in rows[header_idx + 1 :]:
        get = lambda k: clean(r[cols[k]]) if cols[k] < len(r) else ""
        if not any(get(k) for k in cols if k != "num"):
            continue
        raw_num = r[cols["num"]]
        if isinstance(raw_num, (int, float)):
            last_num, sub = int(raw_num), 0
            label = str(last_num)
        else:
            # Fila sin número (insertada entre dos pies): 67 -> 67b
            sub += 1
            label = f"{last_num}{'bcdefg'[sub - 1]}"
        cues.append(
            {
                "id": len(cues),
                "num": label,
                "block": get("block"),
                "cue": get("cue"),
                "sound": get("sound"),
                "lights": get("lights"),
                "stage": get("stage"),
                "actors": get("actors"),
            }
        )

    with open(dst, "w", encoding="utf-8") as f:
        json.dump({"title": title, "cues": cues}, f, ensure_ascii=False, indent=2)
    print(f"{len(cues)} pies -> {dst}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
