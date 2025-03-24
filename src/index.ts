import type { AnyNode, Root } from 'postcss';
import { type Parser, type ParserOptions, type Printer } from 'prettier';
import html from 'prettier/parser-html';
import postcss from 'prettier/parser-postcss';
import { printCSSRules, transformCSS } from './css';
import {
    visitorKeys as htmlVisitorKeys,
    printHTMLRules,
    transformHTML,
} from './html';
import { createGetVisitorKeys } from './utils/createGetVisitorKeys';

function setupParser(
    parser: Parser,
    fn: (ast: any, options: ParserOptions) => Promise<void> | void,
) {
    return {
        ...parser,
        async parse(text: string, options: ParserOptions<AnyNode>) {
            const parsed: Root = parser.parse(text, options);
            await fn(parsed, options);
            return parsed;
        },
    };
}

export const parsers: Record<string, Parser<AnyNode>> = {
    css: setupParser(postcss.parsers.css, transformCSS),
    scss: setupParser(postcss.parsers.scss, transformCSS),
    less: setupParser(postcss.parsers.less, transformCSS),

    html: setupParser(html.parsers.html, transformHTML),
    vue: setupParser(html.parsers.vue, transformHTML),
    lwc: setupParser(html.parsers.lwc, transformHTML),
};

export const printers: Record<string, Printer> = {
    postcss: {
        ...postcss.printers.postcss,
        print(path, options, print, args) {
            const res = printCSSRules(path);
            if (res) return res;

            return postcss.printers.postcss.print(path, options, print, args);
        },
    },
    html: {
        ...html.printers.html,
        getVisitorKeys: createGetVisitorKeys(htmlVisitorKeys),
        print(path, options, print, args) {
            const res = printHTMLRules(path);
            if (res) return res;

            return html.printers.html.print(path, options, print, args);
        },
    },
    vue: {
        ...html.printers.html,
        getVisitorKeys: createGetVisitorKeys(htmlVisitorKeys),
        print(path, options, print, args) {
            const res = printHTMLRules(path);
            if (res) return res;

            return html.printers.html.print(path, options, print, args);
        },
    },
};
