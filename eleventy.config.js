import { writeFile } from 'node:fs/promises';
import { RenderPlugin } from '@11ty/eleventy';
import EleventyVitePlugin from '@11ty/eleventy-plugin-vite';
import { VentoPlugin } from 'eleventy-plugin-vento';
import sugarcube from '@sugarcube-sh/vite';
import { hexToOklch } from 'hex-to-oklch';
import synced from './src/design-tokens/synced/design.tokens.json' with { type: 'json' };

/**
 * @param {import("@11ty/eleventy").UserConfig} eleventyConfig An instance of Eleventy's UserConfig class.
 * @returns {object} The configuration object.
 */
export default function eleventy(eleventyConfig) {
	eleventyConfig.ignores.add('src/design-tokens/*.json');
	eleventyConfig.ignores.add('src/design-tokens/themes/*.json');

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

	eleventyConfig.on('eleventy.before', async ({ _directories, _runMode, _outputMode }) => {
		const { palette, aliases, colors, borders, typography } = synced;

		/**
		 * Recursively convert HEX colors to DTCG-compliant OKLCH colors in synced design tokens.
		 * @param {object} object - The synced design tokens object.
		 */
		const processColors = (object) => {
			for (const value of Object.values(object)) {
				if (typeof value === 'object') {
					if (value?.$type === 'color' && typeof value.$value === 'string') {
						if (value.$value.charAt(0) === '#') {
							const hex = value.$value;
							const oklch = hexToOklch(hex);
							delete value.$type;
							value.$value = {
								colorSpace: 'oklch',
								components: [
									Number.parseFloat(Number.parseFloat(oklch.l, 10).toFixed(4), 10),
									Number.parseFloat(Number.parseFloat(oklch.c, 10).toFixed(4), 10),
									Number.parseFloat(Number.parseFloat(oklch.h, 10).toFixed(4), 10),
								],
								alpha:
									oklch.a
										? Number.parseFloat(Number.parseFloat(oklch.a, 10).toFixed(2), 10)
										: 1,
								hex,
							};
						}
					} else {
						processColors(value);
					}
				}
			}
		};

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
		 * Remove prefixes from value aliases.
		 * @param {object} object - The synced design tokens object.
		 * @param {string} prefix - The prefix to remove.
		 */
		const removePrefixes = (object, prefix) => {
			for (const value of Object.values(object)) {
				if (typeof value === 'object') {
					if (Object.hasOwn(value, '$value') && typeof value.$value === 'string' && value.$value.startsWith(`{${prefix}.`)) {
						value.$value = value.$value.replace(`{${prefix}.`, '{');
					} else {
						removePrefixes(value, prefix);
					}
				}
			}
		};

		const processWeights = (weights) => {
			for (const weight of Object.keys(weights)) {
				if (weight !== '$type') {
					weights[weight].$value = Number.parseInt(weights[weight].$value, 10);
				}
			}
		};

		const processLeadings = (leadings) => {
			for (const leading of Object.keys(leadings)) {
				if (typeof leadings[leading].$value === 'string') {
					leadings[leading].$value = Number.parseFloat(leadings[leading].$value.replace('px', ''));
				}
			}
		};

		const processBorders = (bordersObject) => {
			for (const border of Object.keys(bordersObject)) {
				if (typeof bordersObject[border].$value === 'string') {
					bordersObject[border].$value = { value: Number.parseInt(bordersObject[border].$value.replace('px', ''), 10), unit: 'px' };
				}
			}
		};

		/**
		 * Remove extra properties from synced design tokens.
		 * @param {object} object The object from where you want to remove the keys
		 * @param {string} key The property name to remove.
		 */
		const removeExtraProperties = (object, key) => {
			for (const prop in object) {
				if (Object.hasOwn(object, prop)) {
					if (typeof (object[prop]) === 'string' && key === prop) {
						delete object[prop];
					}

					if (typeof (object[prop]) === 'object') {
						if (key === prop) {
							delete object[prop];
						} else {
							removeExtraProperties(object[prop], key);
						}
					}
				}
			}
		};

		processColors(palette);

		const themes = { uio: structuredClone(colors) };

		delete themes.uio.color.uio;

		processThemes(themes.uio, 'bw');

		for (const theme of ['dark', 'bw', 'wb', 'by', 'yb', 'gd', 'gw', 'lgdg', 'bbr']) {
			themes[theme] = structuredClone(colors);
			themes[theme].color.$type = 'color';

			if (theme !== 'dark') {
				for (const key of Object.keys(themes[theme].color)) {
					if (key !== 'uio') {
						delete themes[theme].color[key];
					}
				}
			}

			console.log(themes[theme].color);

			processThemes(themes[theme], theme);
		}

		removePrefixes(aliases, 'palette');
		removePrefixes(colors, 'palette');
		removePrefixes(colors, 'aliases');
		removePrefixes(colors, 'colors');
		removePrefixes(themes, 'palette');
		removePrefixes(themes, 'aliases');
		removePrefixes(themes, 'colors');
		removePrefixes(typography, 'typography');
		removePrefixes(typography, 'responsive');

		processWeights(typography.font.weight);

		processLeadings(typography.leading);

		processBorders(borders.border.width);

		for (const object of [palette, aliases, colors, borders, typography]) {
			removeExtraProperties(object, '$extensions');
			removeExtraProperties(object, '$description');
			removeExtraProperties(object, '$type');
		}

		for (const theme of Object.keys(themes)) {
			removeExtraProperties(themes[theme], '$extensions');
			removeExtraProperties(themes[theme], '$description');
			removeExtraProperties(themes[theme], '$type');
		}

		/**
		 * 3. Standardize types to match DTCG specification.
		 */
		palette.$type = 'color';
		aliases.$type = 'color';
		colors.$type = 'color';
		borders.border.width.$type = 'dimension';
		typography.font.$type = 'fontFamily';
		typography.font.weight.$type = 'fontWeight';
		typography.text.$type = 'dimension';
		typography.heading.$type = 'dimension';
		typography.body.$type = 'dimension';
		typography.diagram.$type = 'dimension';
		typography.leading.$type = 'number';

		/** 4. Write to typography.json and palette.json. */

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
