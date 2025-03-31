import { type AnyNode, type Root } from 'postcss';
import type { AstPath, Doc, ParserOptions } from 'prettier';
import { getGenerator } from './config';
import { sortRules } from './utils/sort';

// Currently there's no way of getting the list of
// directives, so this has to be hardcoded
const applyVariableDirectives = ['--at-apply', '--uno-apply', '--uno'];

const FormattedNodesMap = new WeakMap<AnyNode, Doc>();

const QUOTE_RE = /(^\s*'|'\s*$)/g;

export async function transformCSS(
    ast: Root,
    options: ParserOptions<AnyNode>,
): Promise<void> {
    const generator = await getGenerator(options.filepath);
    const promises: Promise<void>[] = [];

    ast.walk((node) => {
        if (node.type === ('css-atrule' as 'atrule') && node.name === 'apply') {
            let params = node.params;
            const hasQuotes = QUOTE_RE.test(params);
            if (hasQuotes) params = params.replace(QUOTE_RE, '');

            promises.push(
                sortRules(params, generator, 'css').then((newParams) => {
                    FormattedNodesMap.set(
                        node,
                        hasQuotes ? ["'", newParams, "'"] : newParams,
                    );
                }),
            );
        } else if (
            node.type === ('css-decl' as 'decl') &&
            node.variable &&
            applyVariableDirectives.includes(node.prop)
        ) {
            // @ts-expect-error type is not correct
            let params = node.value.text;

            const hasQuotes = QUOTE_RE.test(params);
            if (hasQuotes) params = params.replace(QUOTE_RE, '');

            promises.push(
                sortRules(params, generator, 'css').then((newParams) => {
                    FormattedNodesMap.set(
                        node,
                        hasQuotes ? ["'", newParams, "'"] : newParams,
                    );
                }),
            );
        }
    });

    await Promise.all(promises);
}

export function printCSSRules(path: AstPath<AnyNode>): Doc | undefined {
    if (!FormattedNodesMap.has(path.node)) {
        return;
    }

    if (
        path.node.type === ('css-atrule' as 'atrule') &&
        path.node.name === 'apply'
    ) {
        return [
            '@',
            path.node.name,
            ' ',
            FormattedNodesMap.get(path.node)!,
            ';',
        ];
    } else if (
        path.node.type === ('css-decl' as 'decl') &&
        path.node.variable &&
        applyVariableDirectives.includes(path.node.prop)
    ) {
        return [
            path.node.prop,
            ':',
            ' ',
            FormattedNodesMap.get(path.node)!,
            ';',
        ];
    }
}
