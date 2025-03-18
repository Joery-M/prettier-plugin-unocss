import type { AnyNode, Root } from 'postcss';
import { type Parser } from 'prettier';
import prettierPostcss from 'prettier/parser-postcss';
import { getGenerator } from './config';
import { transformCSS } from './css';
import { dirname } from 'path';

const builtinParsers = prettierPostcss.parsers;
export const parsers: Record<string, Parser<AnyNode>> = {
    css: {
        ...builtinParsers.css,
        async parse(text, options) {
            const generator = await getGenerator(options.filepath);
            const parsed: Root = builtinParsers.css.parse(text, options);
            await transformCSS(parsed, generator);
            return parsed;
        },
    },
};
