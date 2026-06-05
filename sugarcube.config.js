import { defineConfig } from '@sugarcube-sh/cli';

export default defineConfig({
	resolver: 'docs/design-tokens/tokens.resolver.json',
	components: 'docs/assets/styles/components/ui',
	cube: 'docs/assets/styles',
	variables: {
		path: 'dist/tokens.css',
		prefix: 'fi',
		permutations: [
			{ input: { theme: 'light' }, selector: ':root' },
			{ input: { theme: 'dark' }, selector: '.fl-theme-dark' },
		],
		transforms: {
			colorFallbackStrategy: 'polyfill',
			fluid: {
				min: 320,
				max: 1440,
			},
		},
	},
	utilities: {
		classes: {
			'font-size': {
				source: 'size.*',
				prefix: 'step',
			},
		},
	},
});
