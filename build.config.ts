import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
    externals: [/^@?unocss(\/.)?/, 'prettier', 'postcss'],
    rollup: {
        dts: {
            respectExternal: true,
        },
    },
    replace: {
        __TEST__: 'false',
    },
});
