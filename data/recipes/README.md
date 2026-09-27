# Remote recipe library

`fasting-recipes.json` is the Lenten recipe database. A copy is bundled into each
build as the offline fallback; installed apps also fetch it from this GitHub path
on `main` and use it when it is newer (`updated`) and passes validation.

After editing `scripts/recipe-library/`, regenerate and validate:

```bash
npm run export:recipes
npm run verify:content
```

Then commit and push `data/recipes/` and `assets/recipes/` to `main` so the
app can load the library and photos.

## Compatibility

Every push reaches every installed app. If the JSON shape changes in a way older
builds can't read, add/bump a top-level `"schemaVersion"` (missing means `1`)
together with the app code that reads the new shape. Builds that only support a
lower version keep their bundled copy instead of breaking.
