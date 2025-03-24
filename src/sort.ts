import type { Doc } from 'prettier';
import { builders } from 'prettier/doc';
import { notNull, parseVariantGroup, type UnoGenerator } from 'unocss';

/**
 * Copied from https://github.com/unocss/unocss/blob/0c8404c98e7facb922be6505b4a19aa80b49c5dd/virtual-shared/integration/src/sort-rules.ts#L4-L44
 */
export async function sortRules(
    rules: string,
    uno: UnoGenerator,
): Promise<Doc> {
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
                unknown.push(i.trim());
                return undefined;
            }
            const variantRank =
                (token[0][5]?.variantHandlers?.length || 0) * 100_000;
            const order = token[0][0] + variantRank;
            return [order, i] as const;
        }),
    );

    const sorted: string[] = result
        .filter(notNull)
        .sort((a, b) => {
            let result = a[0] - b[0];
            if (result === 0) result = a[1].localeCompare(b[1]);
            return result;
        })
        .map((i) => i[1]);

    const sortedDocs = expandedResult?.prefixes.length
        ? collapseVariantGroup(sorted, expandedResult.prefixes)
        : sorted;

    return builders.group(
        builders.indent(
            builders.fill([
                ...builders.join(builders.line, unknown.filter(Boolean)),
                ...builders.join(builders.line, sortedDocs),
            ]),
        ),
    );
}

// Copied from https://github.com/unocss/unocss/blob/2c24158de0d37c5ba1006c337f61657a6b6e94b7/packages-engine/core/src/utils/variant-group.ts#L105
function collapseVariantGroup(str: string[], prefixes: string[]): Doc[] {
    const collection = new Map<string, string[]>();

    const sortedPrefix = prefixes.sort((a, b) => b.length - a.length);

    return str
        .map((part) => {
            const prefix = sortedPrefix.find((prefix) =>
                part.startsWith(prefix),
            );
            if (!prefix) return part;

            const body = part.slice(prefix.length);
            if (collection.has(prefix)) {
                collection.get(prefix)!.push(body);
                return null;
            } else {
                const items = [body];
                collection.set(prefix, items);
                return {
                    prefix,
                    items,
                };
            }
        })
        .filter(notNull)
        .map((i) => {
            if (typeof i === 'string') return i;
            return builders.group([
                i.prefix,
                '(',
                builders.indent([
                    builders.softline,
                    builders.fill(builders.join(builders.line, i.items)),
                ]),
                builders.softline,
                ')',
            ]);
        });
}
