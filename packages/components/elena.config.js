
/**
 * @type {import("@elenajs/bundler").ElenaConfig}
 */
export default {
	input: 'src',
	output: {
		dir: 'dist',
		format: 'esm',
		sourcemap: true,
		filename: 'bundle.js',
	},
	bundle: 'src/index.js',
};
