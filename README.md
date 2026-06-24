# FIRM Design System

## Exporting from Figma

We use the [Tokens Brücke](https://github.com/tokens-bruecke/figma-plugin) plugin
to export variables from Figma.

We use the following advanced settings:

- [x] Split collections into separate files
- [x] Split modes into separate files
- [x] Omit collection names
- [ ] Include variable scopes
- [ ] Use percentage for opacity
- [x] USe DTCG keys format
- [ ] Include `.value` string for aliases
- [ ] Include Figma metadata

To obtain the Design Token JSON files from Tokens Brücke, open the plugin, confirm
that the settings are configured correctly, and then click **Download JSON** to
download a zip file containing the tokens.

Some adjustments need to be made to the downloaded files, as follows:

1.

2. Border widths need to be converted to the appropriate format:

```diff
        "$type": "dimension",
-       "$value": "1px",
+       "$value": {
+         "value": 1,
+         "unit": "px"
+       }
```
