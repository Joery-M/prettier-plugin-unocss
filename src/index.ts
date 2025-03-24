import type { AnyNode, Root } from 'postcss';
import { type Parser, type ParserOptions, type Printer } from 'prettier';
import postcss from 'prettier/parser-postcss';
import { getGenerator } from './config';
import { printRules, transformCSS } from './css';

function setupParser(parser: Parser) {
    return {
        ...parser,
        async parse(text: string, options: ParserOptions<AnyNode>) {
            const generator = await getGenerator(options.filepath);
            const parsed: Root = parser.parse(text, options);
            await transformCSS(parsed, generator);
            return parsed;
        },
    };
}

export const parsers: Record<string, Parser<AnyNode>> = {
    css: setupParser(postcss.parsers.css),
    scss: setupParser(postcss.parsers.scss),
    less: setupParser(postcss.parsers.less),
};

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
