import { type AnyNode, type Root } from 'postcss';
import type { AstPath, Doc, ParserOptions } from 'prettier';
import { type UnoGenerator } from 'unocss';
import { sortRules } from './sort';

// Currently there's no way of getting the list of
// directives, so this has to be hardcoded
const applyVariableDirectives = ['--at-apply', '--uno-apply', '--uno'];

export const FormattedNodesMap = new WeakMap<AnyNode, Doc>();

export async function transformCSS(
    ast: Root,
    generator: UnoGenerator,
    prettier: ParserOptions,
) {
    const promises: Promise<void>[] = [];

    ast.walk((node) => {
        if (node.type === ('css-atrule' as 'atrule') && node.name === 'apply') {
            promises.push(
                sortRules(node.params, generator).then((newParams) => {
                    FormattedNodesMap.set(node, newParams);
                }),
            );
        } else if (
            node.type === ('css-decl' as 'decl') &&
            node.variable &&
            applyVariableDirectives.includes(node.prop)
        ) {
            // @ts-expect-error type is not correct
            const params = node.value.text;
            promises.push(
                sortRules(params, generator).then((newParams) => {
                    FormattedNodesMap.set(node, newParams);
                }),
            );
        }
    });

    await Promise.all(promises);
}

export function printRules(path: AstPath<AnyNode>): Doc | undefined {
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
