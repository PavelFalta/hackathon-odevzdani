"""Map normalized CSV column keys to canonical NormalizedRecord fields."""

from app.datazapad.column_keys import column_key

# Exact keys (after column_key()) -> canonical attribute name.
EXACT_CANONICAL: dict[str, str] = {
    "objectid": "source_object_id",
    "název": "name",
    "nazev": "name",
    "název_spolecnosti": "name",
    "název_obce": "obec_nazev",
    "kód_obce": "obec_kod",
    "kod_obce": "obec_kod",
    "název_okresu": "okres_nazev",
    "kód_okresu": "okres_kod",
    "název_vyššího_územně_samosprávného_celku": "vusc_nazev",
    "kód_vyššího_územně_samosprávného_celku": "vusc_kod",
    "název_vyššího_územně_samosprávného_celku_dle_číselníku_čsú": "vusc_nazev",
    "kód_vyššího_územně_samosprávného_celku_dle_číselníku_čsú": "vusc_kod",
    "název_správního_obvodu_obce_s_rozšířenou_působností": "orp_nazev",
    "kód_správního_obvodu_obce_s_rozšířenou_působností_dle_číselníku": "orp_kod",
    "název_obce_s_rozšířenou_působností": "orp_nazev",
    "kód_obce_s_rozšířenou_působností": "orp_kod",
    "název_ulice": "ulice",
    "číslo_domovní": "cislo_domovni",
    "číslo_orientační": "cislo_orientacni",
    "poštovní_směrovací_číslo": "psc",
    "psc": "psc",
    "identifikační_číslo": "ico",
    "ico": "ico",
    "právní_forma": "pravni_forma",
    "sídlo": "sidlo",
    "kód_adresy": "kod_adresy",
    "id_datové_schránky": "datovka",
    "datovka": "datovka",
    "kontaktní_e_mail": "email",
    "kontaktní_email": "email",
    "mail": "email",
    "telefonní_kontakt": "phone",
    "telefon": "phone",
    "telefonobce": "phone",
    "webová_stránka": "web",
    "wwwstranky": "web",
    "web": "web",
    "url": "web",
    "geometry_wkt": "geometry_wkt",
    "x": "lon",
    "y": "lat",
    "zeměpisná_délka_v_souřadnicovém_systému_wgs84": "lon",
    "zeměpisná_šířka_v_souřadnicovém_systému_wgs84": "lat",
}

# Truncated Excel headers (prefix match).
PREFIX_CANONICAL: tuple[tuple[str, str], ...] = (
    ("název_vyššího_územně_samosprávn", "vusc_nazev"),
    ("kód_vyššího_územně_samosprávn", "vusc_kod"),
    ("název_obce_s_rozšířenou_působno", "orp_nazev"),
    ("kód_obce_s_rozšířenou_působnost", "orp_kod"),
    ("zeměpisná_délka_v_souřadnicovém", "lon"),
    ("zeměpisná_šířka_v_souřadnicovém", "lat"),
)

WEB_CANONICAL_KEYS = frozenset(
    column_key(k) for k in ("webová_stránka", "Webová_stránka", "wwwstranky", "web", "url", "WEB")
)


def canonical_field_for_column(header: str) -> str | None:
    key = column_key(header)
    if key in EXACT_CANONICAL:
        return EXACT_CANONICAL[key]
    for prefix, field in PREFIX_CANONICAL:
        if key.startswith(prefix):
            return field
    if key in WEB_CANONICAL_KEYS:
        return "web"
    return None
