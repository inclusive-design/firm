import { defineConfig } from '@sugarcube-sh/cli';

export default defineConfig({
	resolver: 'src/design-tokens/tokens.resolver.json',
	components: 'src/assets/styles/components/ui',
	cube: 'src/assets/styles',
	variables: {
		path: 'dist/tokens.css',
		prefix: 'firm',
		permutations: [
			{ input: { theme: 'light' }, selector: ':root' },
			{ input: { theme: 'dark' }, selector: '.fl-theme-dark' },
			{ input: { theme: 'uio' }, selector: '[class^="fl-theme-"]:not(.fl-theme-prefsEditor-default):not(.fl-theme-dark)' },
			{ input: { theme: 'bw' }, selector: '.fl-theme-bw' },
			{ input: { theme: 'wb' }, selector: '.fl-theme-wb' },
			{ input: { theme: 'by' }, selector: '.fl-theme-by' },
			{ input: { theme: 'yb' }, selector: '.fl-theme-yb' },
			{ input: { theme: 'gd' }, selector: '.fl-theme-gd' },
			{ input: { theme: 'gw' }, selector: '.fl-theme-gw' },
			{ input: { theme: 'lgdg' }, selector: '.fl-theme-lgdg' },
			{ input: { theme: 'bbr' }, selector: '.fl-theme-bbr' },
		],
		transforms: {
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
