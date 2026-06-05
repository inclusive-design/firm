export default {
	extends: '@inclusive-design/stylelint-config',
	ignoreFiles: ['_site/**'],
	rules: {
		'custom-property-pattern': undefined,
		'declaration-empty-line-before': undefined,
		'no-descending-specificity': undefined,
		'order/properties-alphabetical-order': undefined,
		'property-no-deprecated': [
			true,
			{ ignoreProperties: ['clip'] },
		],
		'property-no-vendor-prefix': [
			true,
			{
				ignoreProperties: [
					'-moz-text-size-adjust',
					'-webkit-box-decoration-break',
					'-webkit-text-decoration',
					'-webkit-text-size-adjust',
					'-webkit-user-select',
				],
			},
		],
		'value-keyword-case': [
			'lower',
			{ ignoreKeywords: ['currentColor'] },
		],
	},
};
