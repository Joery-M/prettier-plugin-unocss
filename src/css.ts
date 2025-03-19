import { type Root, Declaration } from 'postcss';
import { type UnoGenerator } from 'unocss';
import { sortRules } from './sort';
import type { ParserOptions } from 'prettier';

// Currently there's no way of getting the list of
// directives, so this has to be hardcoded
const applyVariableDirectives = ['--at-apply', '--uno-apply', '--uno'];

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
