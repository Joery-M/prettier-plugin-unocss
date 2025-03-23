import type { AnyNode, Root } from 'postcss';
import { type Parser, type ParserOptions, type Printer } from 'prettier';
import postcss from 'prettier/parser-postcss';
import { getGenerator } from './config';
import { printRules, transformCSS } from './css';

const builtinParsers = postcss.parsers;
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

export const printers: Record<string, Printer<AnyNode>> = {
    postcss: {
        ...postcss.printers.postcss,
        print(path, options, print, args) {
            const res = printRules(path);
            if (res) return res;

            return postcss.printers.postcss.print(path, options, print, args);
        },
    },
};
