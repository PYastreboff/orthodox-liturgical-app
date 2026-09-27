/**
 * Remote JSON (recipes, liturgy texts, livestreams) is served from the repo's `main`
 * branch, so every push reaches every installed app. A payload whose shape changes
 * incompatibly must bump its top-level `schemaVersion`; binaries built before that
 * change see a higher number than they support and keep their bundled copy.
 *
 * `version` in the liturgy files is a content revision, not a schema version.
 */
export function isSupportedSchema(data: unknown, supported: number): boolean {
  if (typeof data !== 'object' || data === null) return false;
  const schemaVersion = (data as { schemaVersion?: unknown }).schemaVersion ?? 1;
  return typeof schemaVersion === 'number' && schemaVersion <= supported;
}
