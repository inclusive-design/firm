import { writeFile } from 'node:fs/promises';
import { RenderPlugin } from '@11ty/eleventy';
import EleventyVitePlugin from '@11ty/eleventy-plugin-vite';
import { VentoPlugin } from 'eleventy-plugin-vento';
import sugarcube from '@sugarcube-sh/vite';
import synced from './src/design-tokens/synced/design.tokens.json' with { type: 'json' };

/**
 * @param {import("@11ty/eleventy").UserConfig} eleventyConfig An instance of Eleventy's UserConfig class.
 * @returns {object} The configuration object.
 */
export default function eleventy(eleventyConfig) {
	eleventyConfig.watchIgnores.add('src/design-tokens/*.json');
	eleventyConfig.watchIgnores.add('src/design-tokens/themes/*.json');

	eleventyConfig.addPlugin(EleventyVitePlugin, {
		viteOptions: {
			plugins: [sugarcube()],
			build: {
				rolldownOptions: {
					output: {
						entryFileNames: 'assets/[name].js',
						chunkFileNames: 'assets/[name].js',
						assetFileNames: 'assets/[name].[ext]',
					},
				},
			},
		},
	});
	eleventyConfig.addPlugin(RenderPlugin);
	eleventyConfig.addPlugin(VentoPlugin);

	eleventyConfig.addPassthroughCopy('src/assets');

	let firstRun = true;

	eleventyConfig.on('eleventy.before', async ({ _directories, _runMode, _outputMode }) => {
		if (firstRun) {
			firstRun = false;

			const { palette, aliases, colors, borders, typography } = synced;

			/**
			 * Recursively replace theme colors with value from Cobalt's legacy mode format.
			 * @see https://cobalt-ui.pages.dev/guides/modes#with-modes
			 * @param {object} colorObject - A DTCG object containing colors with themes in Cobalt's legacy mode format.
			 * @param {string} mode - The mode key whose value should be used.
			 */
			const processThemes = (colorObject, mode) => {
				for (const value of Object.values(colorObject)) {
					if (typeof value === 'object') {
						if (value?.$type === 'color' && typeof value.$value === 'string') {
							value.$value = value.$extensions.mode[mode];
						} else {
							processThemes(value, mode);
						}
					}
				}
			};

			/**
			 * Recursively remove the given prefixes from value aliases.
			 * @param {object} object - A DTCG object containing prefixed value aliases.
			 * @param {Array} prefixes - The prefixes to remove.
			 */
			const removePrefixes = (object, prefixes) => {
				for (const value of Object.values(object)) {
					if (typeof value === 'object') {
						if (Object.hasOwn(value, '$value') && typeof value.$value === 'string') {
							for (const prefix of prefixes) {
								value.$value = value.$value.startsWith(`{${prefix}.`)
									? value.$value.replace(`{${prefix}.`, '{')
									: value.$value;
							}
						} else {
							removePrefixes(value, prefixes);
						}
					}
				}
			};

			/**
			 * Remove extra properties from design tokens.
			 * @param {object} object - A DTCG object containing extraneous properties.
			 * @param {Array} properties - The properties to remove.
			 */
			const removeExtraProperties = (object, properties) => {
				for (const prop in object) {
					if (Object.hasOwn(object, prop)) {
						if (typeof (object[prop]) === 'string' && properties.includes(prop)) {
							delete object[prop];
						}

						if (typeof (object[prop]) === 'object') {
							if (properties.includes(prop)) {
								delete object[prop];
							} else {
								removeExtraProperties(object[prop], properties);
							}
						}
					}
				}
			};

			/**
			 * 1. Create the generic UIO theme which assigns UIO primitives to all the required colors.
			 */
			const themes = { uio: structuredClone(colors) };

			delete themes.uio.color.uio;

			// All the UIO themes assign UIO primitives the same way, so we can select any to remap.
			processThemes(themes.uio, 'bw');

			/**
			 * 2. Create all of the other contrast themes.
			 */
			for (const theme of ['dark', 'bw', 'wb', 'by', 'yb', 'gd', 'gw', 'lgdg', 'bbr']) {
				themes[theme] = structuredClone(colors);
				themes[theme].color.$type = 'color';

				// Remove duplicate properties from UIO theme as they're already assigned in themes.uio (see step 2).
				if (theme !== 'dark') {
					for (const key of Object.keys(themes[theme].color)) {
						if (key !== 'uio') {
							delete themes[theme].color[key];
						}
					}
				}

				processThemes(themes[theme], theme);
			}

			/**
			 * 3. Remove all the unnecessary group prefixes.
			 */
			removePrefixes(aliases, ['palette']);
			removePrefixes(colors, ['palette', 'aliases', 'colors']);
			removePrefixes(themes, ['palette', 'aliases', 'colors']);
			removePrefixes(typography, ['typography', 'responsive']);

			/**
			 * 4. Remove extraneous properties.
			 */
			for (const object of [palette, aliases, colors, borders, typography]) {
				removeExtraProperties(object, ['$extensions', '$description']);
			}

			for (const object of [palette, aliases, colors, borders]) {
				removeExtraProperties(object, ['$type']);
			}

			for (const theme of Object.keys(themes)) {
				removeExtraProperties(themes[theme], ['$extensions', '$description', '$type']);
			}

			/**
			 * 5. Standardize types to match DTCG specification.
			 */
			palette.$type = 'color';
			aliases.$type = 'color';
			colors.$type = 'color';
			borders.border.style.$type = 'strokeStyle';
			borders.border.width.$type = 'dimension';

			for (const key of Object.keys(typography.font)) {
				if (key !== 'weight') {
					typography.font[key].$type = 'fontFamily';
				}
			}

			typography.text.$type = 'dimension';
			typography.heading.$type = 'dimension';
			typography.body.$type = 'dimension';
			typography.diagram.$type = 'dimension';

			/** 6. Write to individual token files. */

			for (const [key, value] of Object.entries({
				palette, aliases, colors, borders, typography,
			})) {
				writeFile(`./src/design-tokens/${key}.json`, JSON.stringify(value, null, 2), 'utf8', (error) => {
					if (error) {
						console.error('Error writing to file', error);
					}
				});
			}

			for (const [key, value] of Object.entries(themes)) {
				writeFile(`./src/design-tokens/themes/${key}.json`, JSON.stringify(value, null, 2), 'utf8', (error) => {
					if (error) {
						console.error('Error writing to file', error);
					}
				});
			}
		}
	});

	return {
		dir: {
			input: 'src',
		},
		templateFormats: ['vto', 'md'],
		htmlTemplateEngine: 'vto',
		markdownTemplateEngine: 'vto',
	};
}
