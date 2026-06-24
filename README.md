# FIRM Design System

## Exporting from Figma

We use the [Tokens Brücke](https://github.com/tokens-bruecke/figma-plugin) plugin
to export variables from Figma.

We use the following advanced settings:

- [ ] Split collections into separate files
- [ ] Split modes into separate files
- [ ] Omit collection names
- [ ] Include variable scopes
- [ ] Use percentage for opacity
- [x] USe DTCG keys format
- [ ] Include `.value` string for aliases
- [ ] Include Figma metadata

To obtain the Design Token JSON files from Tokens Brücke, open the plugin, confirm
that the settings are configured correctly, and then click **Download JSON** to
download the token file. With a GitHub token, it can also be synced directly to
the repo: [src/design-tokens/synced/design.tokens.json](src/design-tokens/synced/design.tokens.json)

Some adjustments need to be made to the downloaded file, as follows:

1. Colors need to be converted from hex strings to OKLCH.
2. A generic UIO theme needs to be created which maps UIO primitves to different
   color tokens.
3. Dark mode and contrast themes need to be extracted into their own token files.
4. Unnecessary group prefixes need to be removed from variable names.
5. Font weight, leading and dimension values need to be properly formatted to
   match the DTCG spec.
6. Extraneous properties need to be removed.
7. The `$type` values need to be standardized to match the DTCG spec.
8. The updated tokens need to be written to their own files in the repo.

These steps are all handled in an [`eleventy.before` hook](https://github.com/inclusive-design/firm/blob/c2c8d77c11814ad18d8d19845a9904657bfe5e06/eleventy.config.js#L36).
