# Liturgy texts

Bundled JSON served to the app (and optionally refreshed from GitHub/jsDelivr on first open).

## Source of truth

[GOARCH Chapel Texts](https://www.goarch.org/chapel/texts) — Hieratikon skeleton PDFs via `dcs.goarch.org`.

| Text | English | Greek | Russian |
|------|---------|-------|---------|
| St John Chrysostom | `scripts/liturgy-sources/chrysostom-en-goarch.txt` | `chrysostom-gr-en-goarch.txt` | `chrysostom-ru.txt` |
| St Basil the Great | `scripts/liturgy-sources/basil-en-goarch.txt` | English spine + Chrysostom reuse, `basil-gr-en-goarch.txt` pairs, `basil-el-overrides.json` | Chrysostom RU (parallel parts; hand Basil anaphora TBD) |
| Great Vespers | `data/liturgy/vespers-liturgy.json` | bundled | bundled |

Rebuild after editing sources:

```bash
npm run export:liturgy
```

## Typikon (Services page)

- **St John Chrysostom** — most days; vesperal on Annunciation; Christmas/Theophany eve when those feasts fall Sunday or Monday.
- **St Basil** — five Lent Sundays (not Palm Sunday), Holy Thursday, Holy Saturday, January 1, Nativity/Theophany eves (unless eve is Sun/Mon, then Basil on the feast day).
