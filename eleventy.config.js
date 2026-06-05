import { RenderPlugin } from '@11ty/eleventy';
import EleventyVitePlugin from '@11ty/eleventy-plugin-vite';
import { VentoPlugin } from 'eleventy-plugin-vento';
import sugarcube from '@sugarcube-sh/vite';

/**
 * @param {import("@11ty/eleventy").UserConfig} eleventyConfig An instance of Eleventy's UserConfig class.
 * @returns {object} The configuration object.
 */
export default function eleventy(eleventyConfig) {
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

	eleventyConfig.addPassthroughCopy('docs/assets');

	return {
		dir: {
			input: 'docs',
		},
		templateFormats: ['vto', 'md'],
		htmlTemplateEngine: 'vto',
		markdownTemplateEngine: 'vto',
	};
}
