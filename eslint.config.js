import { defineConfig } from 'eslint/config';
import eslintConfigInclusiveDesign from '@inclusive-design/eslint-config';

export default defineConfig([
	{
		extends: [eslintConfigInclusiveDesign],
		rules: {
			'new-cap': ['error', { capIsNewExceptions: ['Elena'] }],
		},
	},
	{
		ignores: ['_site/**', 'README.md', '**/package-lock.json'],
	},
]);
