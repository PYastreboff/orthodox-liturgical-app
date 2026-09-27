# Liturgy texts

Bundled JSON served to the app (the Divine Liturgy files can also be refreshed from GitHub/jsDelivr on first open).

## Source of truth

The JSON files in this folder are the source of truth and are **maintained by hand**:

| File | Service |
|------|---------|
| `chrysostom-liturgy.json` | Divine Liturgy of St John Chrysostom |
| `basil-liturgy.json` | Divine Liturgy of St Basil the Great |
| `vespers-liturgy.json` | Great Vespers (fixed parts) |

- Greek follows the Ieratikon and Horologion; Church Slavonic (in civil script) follows the Sluzhebnik and Chasoslov.
- The English is an original translation made from the Greek for this app. Do not paste in published English translations (for example GOARCH), which are under copyright.
- Every unit has `en`, `ru` and `el`, and the three must match line for line: same role, same direction note, same placeholders.
- Sections use `units` only (no `paragraphs`).

### Line conventions

- Role labels: `PRIEST` / `DEACON` / `CHOIR` / `PEOPLE` / `READER`; `Священник` / `Диакон` / `Хор` / `Народ` / `Чтец`; `ΙΕΡΕΥΣ` / `ΔΙΑΚΟΝΟΣ` / `ΧΟΡΟΣ` / `ΛΑΟΣ` / `ΑΝΑΓΝΩΣΤΗΣ`.
- Direction notes go in parentheses before the colon: `(aloud)` / `(возглас)` / `(ἐκφώνως)`; `(in a low voice)` / `(тайно)`, or `(тихо)` for the deacon / `(χαμηλοφώνως)`; `(after each petition)` / `(на каждое прошение)` / `(εἰς ἕκαστον αἴτημα)`.
- Repeats: `(three times)` / `(трижды)` / `(ἐκ τρίτου)`. Name placeholders: `(name)` / `(имя)` / `(δεῖνος)`.
- Rubrics are whole lines in parentheses in all three languages. One litany petition per unit.
- `__CREED_TITLE__` and `__LORDS_PRAYER_TITLE__` units are replaced by localized headings in the app.

When you change a file, bump its top-level `version` and `updated`, then run:

```bash
npm run verify:content
```

> **Warning:** do not run `npm run export:liturgy`. It regenerates `chrysostom-liturgy.json` and `basil-liturgy.json` from the old GOARCH-based sources in `scripts/liturgy-sources/` and would overwrite the hand-maintained text.

Installed apps pick up the `main` copy only when it validates and its `version`
(content revision) is at least the bundled one. For incompatible shape changes,
bump a top-level `"schemaVersion"` (missing means `1`) alongside the app code that
reads it — older builds then keep their bundled text.

## Typikon (Services page)

- **St John Chrysostom** — most days; vesperal on Annunciation; Christmas/Theophany eve when those feasts fall Sunday or Monday.
- **St Basil** — five Lent Sundays (not Palm Sunday), Holy Thursday, Holy Saturday, January 1, Nativity/Theophany eves (unless eve is Sun/Mon, then Basil on the feast day).
