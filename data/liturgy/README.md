# Chrysostom liturgy text

`chrysostom-liturgy.json` is served to the app over the network (like recipes) — **not bundled** into the app binary.

## Sources

| Language | File |
|----------|------|
| English | `scripts/liturgy-sources/chrysostom-en-goarch.txt` (GOARCH Hieratikon skeleton) |
| Russian | `scripts/liturgy-sources/chrysostom-ru.txt` |
| Greek | `scripts/liturgy-sources/chrysostom-gr-en-goarch.txt` (GOARCH gr-en skeleton, Greek extracted) |

Rebuild and commit after editing sources:

```bash
npm run export:liturgy
```

The app fetches from GitHub/jsDelivr on first open of the Liturgy section.
