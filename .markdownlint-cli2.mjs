import markdownlintConfig from '@inclusive-design/markdownlint-config';

export default {
	config: Object.assign(markdownlintConfig.config, {}),
	ignores: ['node_modules', 'src/**', 'CHANGELOG.md'],
};
