import { type AnyNode, type Root, Declaration } from 'postcss';
import type { AstPath, Doc, ParserOptions } from 'prettier';
import { builders } from 'prettier/doc.js';
import { type UnoGenerator } from 'unocss';
import { sortRules } from './sort';

// Currently there's no way of getting the list of
// directives, so this has to be hardcoded
const applyVariableDirectives = ['--at-apply', '--uno-apply', '--uno'];

export const BREAK_SEPARATOR = '~::BREAK_HERE::~';

export async function transformCSS(
    ast: Root,
    generator: UnoGenerator,
    prettier: ParserOptions,
) {
    const promises: Promise<void>[] = [];

    ast.walk((node) => {
        if (node.type === ('css-atrule' as 'atrule') && node.name === 'apply') {
            promises.push(
                sortRules(node.params, node, generator, prettier).then(
                    (newParams) => {
                        node.params = newParams;
                    },
                ),
            );
        } else if (
            node.type === ('css-decl' as 'decl') &&
            node.variable &&
            applyVariableDirectives.includes(node.prop)
        ) {
            // @ts-expect-error type is not correct
            const params = node.value.text;
            promises.push(
                sortRules(params, node, generator, prettier).then(
                    (newParams) => {
                        node.value = new Declaration({
                            prop: node.prop,
                            value: newParams,
                            important: node.important,
                        }).value;
                    },
                ),
            );
        }
    });

    await Promise.all(promises);
}

export function printRules(path: AstPath<AnyNode>): Doc | undefined {
    if (
        path.node.type === ('css-atrule' as 'atrule') &&
        path.node.name === 'apply'
    ) {
        return [
            '@',
            path.node.name,
            ' ',
            builders.group(
                builders.indent(
                    builders.fill(
                        builders.join(
                            builders.line,
                            path.node.params.split(BREAK_SEPARATOR),
                        ),
                    ),
                ),
            ),
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
            builders.group(
                builders.indent(
                    builders.fill(
                        builders.join(
                            builders.line,
                            path.node.value.split(BREAK_SEPARATOR),
                        ),
                    ),
                ),
            ),
            ';',
        ];
    }
}
