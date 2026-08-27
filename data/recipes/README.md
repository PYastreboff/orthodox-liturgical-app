# Remote recipe library

`fasting-recipes.json` is the Lenten recipe database served to the app over the
network from this GitHub path. It is **not** bundled into the mobile/web install.

After editing `scripts/recipe-library/`, regenerate:

```bash
npm run export:recipes
```

Then commit and push `data/recipes/` and `assets/recipes/` to `main` so the
app can load the library and photos.
