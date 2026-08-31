"""
Cruza las 3 fuentes de datos SEO para generar un JSON consolidado
que alimenta la construcción de analisis-seo.html.

Fuentes:
- Ubersuggest (volumen, dificultad SEO, CPC)
- Search Console 16 meses (impresiones, clics, posición histórica)
- Search Console 28 días (impresiones, clics, posición actual)
"""
import csv
import json
import re
from collections import defaultdict
from pathlib import Path

BASE = Path(r"C:/Users/Carlos/Desktop/Chamba/- Proyectos -/Vecindario Beer Garden")
KWR = BASE / "- ARCHIVOS -" / "KWR"

# ── Load Ubersuggest ────────────────────────────────────────────────────────
def load_ubersuggest():
    path = KWR / "ubersuggest_bulk_analysis.csv"
    with open(path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        out = {}
        for r in reader:
            kw = r["Keyword"].strip().lower()
            try:
                vol = int(r["Search Volume"])
                sd = int(r["SEO Difficulty"])
                cpc = float(r["CPC"]) if r["CPC"] else 0
                pd = int(r["Paid Difficulty"]) if r["Paid Difficulty"] else 0
            except (ValueError, KeyError):
                continue
            out[kw] = {"volume": vol, "sd": sd, "cpc": cpc, "pd": pd}
        return out

# ── Load Search Console ────────────────────────────────────────────────────
def load_sc(filename):
    path = KWR / filename
    with open(path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        out = {}
        for r in reader:
            kw = r["Consultas principales"].strip().lower()
            try:
                imp = int(r["Impresiones"])
                clics = int(r["Clics"])
                ctr = float(r["CTR"].rstrip("%")) / 100 if r["CTR"] else 0
                pos = float(r["Posición"])
            except (ValueError, KeyError):
                continue
            out[kw] = {"imp": imp, "clics": clics, "ctr": ctr, "pos": pos}
        return out

# ── Cluster assignment (manual taxonomy) ────────────────────────────────────
def assign_cluster(kw):
    """Asigna cluster de intención de búsqueda."""
    k = kw.lower()
    # Brand
    if any(b in k for b in ["vecindario", "vbg"]):
        return "brand"
    # Beer garden (genérico y Cuernavaca)
    if "beer garden" in k or "beergarden" in k:
        return "beer-garden"
    # Taproom
    if "taproom" in k or "tap room" in k:
        return "taproom"
    # Cerveza artesanal
    if "cerveza artesanal" in k or "cervecer" in k or "cervezas artesanales" in k:
        if "cuernavaca" in k:
            return "cerveza-artesanal-cuernavaca"
        return "cerveza-artesanal"
    # Estilos de cerveza
    if any(s in k for s in ["ipa", "stout", "porter", "pale ale", "lager", "hefeweizen", "saison", "tripel", "dubbel", "quadrupel"]):
        return "estilos-cerveza"
    # Cerveza de barril
    if "cerveza de barril" in k or "barril" in k:
        return "cerveza-barril"
    # Comida específica
    if "hamburguesa" in k:
        return "hamburguesas"
    if "pizza" in k:
        return "pizzas"
    if any(c in k for c in ["alitas", "boneless", "tiras de pollo", "tiras empanizadas"]):
        return "comida-no-manejan"  # descarte
    if any(c in k for c in ["papas", "snack", "botana", "antojito"]):
        return "botanas"
    if "comida" in k:
        return "comida"
    # Pet friendly
    if "pet friendly" in k or "petfriendly" in k or "perro" in k or "mascota" in k:
        return "pet-friendly"
    # Terraza
    if "terraza" in k:
        return "terraza"
    # Música/eventos
    if "musica en vivo" in k or "música en vivo" in k or "en vivo" in k:
        return "musica-vivo"
    if "cata" in k or "maridaje" in k or "degustación" in k or "wine tasting" in k:
        return "cata"
    if "evento" in k or "cumpleaños" in k or "after office" in k or "after work" in k:
        return "eventos"
    # Restaurante/bar genérico con cuernavaca
    if "cuernavaca" in k:
        if "restaurante" in k or "comer" in k or "cenar" in k:
            return "restaurante-cuernavaca"
        return "bar-cuernavaca"
    # Restaurante/bar genérico
    if any(t in k for t in ["restaurante", "bar ", "bares", "bar:", "brewery", "breweries", "brew pub", "cerveceria", "cervezaria"]):
        return "restaurante-bar-generico"
    if any(t in k for t in ["comer", "cenar", "dónde", "donde", "lugar para"]):
        return "intencion-comercial"
    # Cerveza genérica
    if "cervez" in k or "beer" in k or "chela" in k or "brew" in k:
        return "cerveza-generica"
    # Default
    return "otros"

# ── Descartes explícitos ────────────────────────────────────────────────────
DESCARTES = {
    "alitas", "alitas cuernavaca", "boneless", "boneless cuernavaca",
    "alita", "boneles",
}

# Keywords que NO son plato principal (guarnición), marcar pero no priorizar
GUARNICIONES = {"papas a la francesa", "papas", "papas fritas"}

# ── Opportunity score ───────────────────────────────────────────────────────
def opportunity_score(vol, sd, pos_28d, clics_28d, imp_28d, cluster, kw):
    """
    Score 0-100 calculando oportunidad real.
    - Penaliza: volumen 0 sin clics (ruido de SC), descartes explícitos, guarniciones
    - Favorece: volumen alto, baja dificultad, buena posición actual, cluster alineado
    """
    # Descarte duro
    if kw in DESCARTES or cluster == "comida-no-manejan":
        return 0, "descarte"
    if kw in GUARNICIONES:
        return 0, "guarnición-no-plato-principal"

    # Si no hay volumen en Ubersuggest Y no hay clics en 28d, es ruido
    if vol == 0 and clics_28d == 0:
        # Excepción: si hay impresiones recientes relevantes, puede ser long-tail real
        if imp_28d < 3:
            return 0, "ruido-sin-volumen-ni-clics"

    import math
    # Volume score (log scale, max ~25)
    vol_score = min(25, math.log10(vol + 1) * 4) if vol > 0 else 0

    # Difficulty score (inverso, max ~25): SD bajo = mejor
    if sd == 0:
        sd_score = 10  # sin datos, treat as medium
    else:
        sd_score = max(0, 25 - sd * 0.4)

    # Current position score (max ~30): mejor si ya estás encaminado
    if pos_28d is None or pos_28d == 0:
        pos_score = 8  # no tracked pero opportunity existe
    elif pos_28d <= 3:
        pos_score = 30  # ya en top 3, fácil de defender
    elif pos_28d <= 10:
        pos_score = 22  # page 1, fácil subir
    elif pos_28d <= 20:
        pos_score = 12  # page 2, trabajo medio
    elif pos_28d <= 50:
        pos_score = 5   # lejos, mucho trabajo
    else:
        pos_score = 1   # muy lejos

    # CTR opportunity: si hay impresiones pero no clics en pos top 10, hay opportunity de optimización
    ctr_opp = 0
    if imp_28d and imp_28d > 0 and clics_28d == 0 and pos_28d and pos_28d <= 10:
        ctr_opp = 8  # estás visible pero no clickean → title/meta optimization

    # Cluster alignment bonus (max ~10): clusters estratégicos para el negocio
    cluster_bonus = {
        "beer-garden": 10,           # core, defender
        "cerveza-artesanal-cuernavaca": 10,
        "cerveza-artesanal": 8,
        "hamburguesas": 8,           # growth (comida)
        "pizzas": 8,                 # growth (comida)
        "pet-friendly": 7,           # differentiator
        "terraza": 7,                # differentiator
        "taproom": 6,
        "cata": 6,                   # repositioning wine tasting
        "cerveza-barril": 6,
        "brand": 5,                  # ya defiendes
        "musica-vivo": 4,            # agenda honesta
        "estilos-cerveza": 5,
        "restaurante-cuernavaca": 5,
        "bar-cuernavaca": 5,
        "cerveza-generica": 0,       # muy genérico
        "restaurante-bar-generico": 2,
        "intencion-comercial": 3,
        "comida": 4,
        "botanas": 2,
        "eventos": 3,
        "otros": 0,
    }.get(cluster, 0)

    return round(vol_score + sd_score + pos_score + ctr_opp + cluster_bonus, 1), None

# ── Confidence level ───────────────────────────────────────────────────────
def confidence(imp_28d, clics_28d, pos_28d, pos_16m, imp_16m):
    """alta/media/baja según consistencia entre ventanas."""
    if imp_28d is None or imp_28d == 0:
        # no tracked en 28 días
        if imp_16m and imp_16m > 5:
            return ("baja", "Aparece en histórico pero no en últimos 28d — probablemente era tendencia vieja")
        return ("baja", "Sin datos recientes")
    # si hay impresiones recientes, valida la posición
    if clics_28d > 0:
        return ("alta", "Datos recientes con clics — realidad confirmada")
    # impresiones sin clics en 28 días
    if pos_28d and pos_28d <= 5 and imp_28d >= 5:
        # debería tener clics si está en top 5
        return ("media-baja", f"Posición {pos_28d:.1f} pero 0 clics en {imp_28d} imp → revisar title/SERP")
    if imp_28d >= 3:
        return ("media", "Datos recientes pero sin clics — necesita validación")
    return ("baja", "Muy pocas impresiones recientes")

# ── Main cross-reference ───────────────────────────────────────────────────
def main():
    ub = load_ubersuggest()
    sc16 = load_sc("Consultas.csv")
    sc28 = load_sc("Consultas (28 dias).csv")

    # Unión de todas las keywords
    all_kws = set(ub) | set(sc16) | set(sc28)

    rows = []
    for kw in all_kws:
        u = ub.get(kw, {})
        s16 = sc16.get(kw, {})
        s28 = sc28.get(kw, {})

        vol = u.get("volume", 0)
        sd = u.get("sd", 0)
        cpc = u.get("cpc", 0)
        imp16 = s16.get("imp", 0)
        clics16 = s16.get("clics", 0)
        pos16 = s16.get("pos", 0)
        imp28 = s28.get("imp", 0)
        clics28 = s28.get("clics", 0)
        pos28 = s28.get("pos", None)
        if pos28 == 0:
            pos28 = None

        cluster = assign_cluster(kw)
        opp, opp_note = opportunity_score(vol, sd, pos28, clics28, imp28, cluster, kw)
        conf, conf_reason = confidence(imp28, clics28, pos28, pos16, imp16)

        rows.append({
            "kw": kw,
            "cluster": cluster,
            "volume": vol,
            "sd": sd,
            "cpc": cpc,
            "imp16": imp16,
            "clics16": clics16,
            "pos16": pos16,
            "imp28": imp28,
            "clics28": clics28,
            "pos28": pos28,
            "opp": opp,
            "opp_note": opp_note,
            "conf": conf,
            "conf_reason": conf_reason,
        })

    # Sort by opportunity score
    rows.sort(key=lambda r: r["opp"], reverse=True)

    # Totals
    summary = {
        "total_kws_ubersuggest": len(ub),
        "total_kws_sc16": len(sc16),
        "total_kws_sc28": len(sc28),
        "total_kws_unique": len(all_kws),
        "total_imp16": sum(r["imp16"] for r in rows),
        "total_imp28": sum(r["imp28"] for r in rows),
        "total_clics16": sum(r["clics16"] for r in rows),
        "total_clics28": sum(r["clics28"] for r in rows),
        "cluster_counts": dict(defaultdict(int, **{c: sum(1 for r in rows if r["cluster"] == c) for c in set(r["cluster"] for r in rows)})),
    }

    out = {"summary": summary, "rows": rows}
    out_path = BASE / "datos-seo-consolidados.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    # Print quick stats
    print(f"=== CONSOLIDADO SEO ===")
    print(f"Total keywords únicas: {summary['total_kws_unique']}")
    print(f"  Ubersuggest: {summary['total_kws_ubersuggest']}")
    print(f"  Search Console 16m: {summary['total_kws_sc16']}")
    print(f"  Search Console 28d: {summary['total_kws_sc28']}")
    print()
    print(f"Impresiones 16m: {summary['total_imp16']}")
    print(f"Impresiones 28d: {summary['total_imp28']}")
    print(f"Clics 16m: {summary['total_clics16']}")
    print(f"Clics 28d: {summary['total_clics28']}")
    print()
    print("=== TOP 30 OPORTUNIDADES ===")
    for r in rows[:30]:
        conf_marker = {"alta": "🟢", "media": "🟡", "media-baja": "🟠", "baja": "🔴"}.get(r["conf"], "?")
        pos28_str = f"#{r['pos28']:.1f}" if r["pos28"] else "—"
        pos16_str = f"#{r['pos16']:.1f}" if r["pos16"] else "—"
        print(f"  opp={r['opp']:>5} {conf_marker} | vol={r['volume']:>6} sd={r['sd']:>3} | pos 16m={pos16_str:>6} 28d={pos28_str:>6} | {r['cluster']:<28} | {r['kw']}")
    print()
    print("=== CLUSTERS ===")
    for c, n in sorted(summary["cluster_counts"].items(), key=lambda x: -x[1]):
        print(f"  {n:>4} | {c}")
    print()
    print(f"Guardado: {out_path}")

if __name__ == "__main__":
    main()
