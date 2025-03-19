import type { AnyNode, Root } from 'postcss';
import { type Parser, type ParserOptions } from 'prettier';
import * as prettierPostcss from 'prettier/parser-postcss';
import { getGenerator } from './config';
import { transformCSS } from './css';

const builtinParsers = prettierPostcss.parsers;
async function cssParse(text: string, options: ParserOptions<AnyNode>) {
    const generator = await getGenerator(options.filepath);
    const parsed: Root = builtinParsers.css.parse(text, options);
    await transformCSS(parsed, generator, options);
    return parsed;
}

export const parsers: Record<string, Parser<AnyNode>> = {
    css: {
        ...builtinParsers.css,
        parse: cssParse,
    },
    scss: {
        ...builtinParsers.scss,
        parse: cssParse,
    },
    less: {
        ...builtinParsers.less,
        parse: cssParse,
    },
};
export const languages = [];
