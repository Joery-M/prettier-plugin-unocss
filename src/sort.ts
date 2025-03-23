import type { AnyNode } from 'postcss';
import { type Doc, type ParserOptions } from 'prettier';
import { builders, printer } from 'prettier/doc';
import {
    collapseVariantGroup,
    notNull,
    parseVariantGroup,
    type UnoGenerator,
} from 'unocss';

/**
 * Copied from https://github.com/unocss/unocss/blob/0c8404c98e7facb922be6505b4a19aa80b49c5dd/virtual-shared/integration/src/sort-rules.ts#L4-L44
 */
export async function sortRules(
    rules: string,
    node: AnyNode,
    uno: UnoGenerator,
    prettier: ParserOptions,
) {
    const unknown: string[] = [];

    // enable details for variant handlers
    if (!uno.config.details) uno.config.details = true;

    // const hasAttributify = !!uno.config.presets.find(i => i.name === '@unocss/preset-attributify')
    // const hasVariantGroup = !!uno.config.transformers?.find(i => i.name === '@unocss/transformer-variant-group')

    const expandedResult = parseVariantGroup(rules, uno.config.separators);
    rules = expandedResult.expanded;

    const result = await Promise.all(
        rules.split(/\s+/g).map(async (i) => {
            const token = await uno.parseToken(i);
            if (token == null) {
                unknown.push(i);
                return undefined;
            }
            const variantRank =
                (token[0][5]?.variantHandlers?.length || 0) * 100_000;
            const order = token[0][0] + variantRank;
            return [order, i] as const;
        }),
    );

    let sorted = result
        .filter(notNull)
        .sort((a, b) => {
            let result = a[0] - b[0];
            if (result === 0) result = a[1].localeCompare(b[1]);
            return result;
        })
        .map((i) => i[1])
        .join(' ');

    if (expandedResult?.prefixes.length)
        sorted = collapseVariantGroup(sorted, expandedResult.prefixes);

    const indented = breakLines(unknown, sorted, node, prettier);

    return indented;
}

function breakLines(
    unknown: string[],
    rules: string,
    node: AnyNode,
    prettier: ParserOptions,
) {
    const resultArray = rules.split(/\s+/g);

    let startingColumn = 0;
    if (node.type === ('css-atrule' as 'atrule')) {
        startingColumn = node.positionInside(node.name.length + 1).column;
    } else if (node.type === ('css-decl' as 'decl')) {
        startingColumn = node.positionInside(node.prop.length + 1).column;
    }
    const lines: Doc[][] = [[]];
    // Keeps track of characters in current line
    let charCount = 0;

    for (const result of resultArray) {
        const curLine = lines.at(-1)!;

        // Adds the amount of characters in current line, including spaces (curLine.length)
        // and see if the next added item would go over the print width.
        const needsNewline =
            charCount + result.length + 1 + curLine.length + startingColumn >=
            prettier.printWidth;

        if (needsNewline) {
            lines.push([result]);
            charCount = result.length;
        } else {
            curLine.push(result);
            charCount += result.length;
        }
    }

    const beforeStr = node.toString().slice(0, startingColumn);
    const formatted = lines.map((arr) => {
        return builders.indent([builders.hardline, ]);
    });
    const filled = builders.group([beforeStr, formatted]);
    return printer.printDocToString(filled, prettier).formatted.trim();
}
