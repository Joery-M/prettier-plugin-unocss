import type { Root } from 'postcss';
import { type UnoGenerator } from 'unocss';
import { sortRules } from './sort';

export async function transformCSS(ast: Root, generator: UnoGenerator) {
    const promises: Promise<void>[] = [];

    ast.walk((node) => {
        if (node.type === ('css-atrule' as 'atrule') && node.name === 'apply') {
            promises.push(
                sortRules(node.params, generator).then((newParams) => {
                    node.params = newParams;
                }),
            );
        }
    });

    await Promise.all(promises);
}
