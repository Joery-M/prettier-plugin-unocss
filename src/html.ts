import type { AstPath, Doc, ParserOptions } from 'prettier';
import { getGenerator } from './config';
import { sortRules } from './utils/sort';

const FormattedNodesMap = new WeakMap<any, Doc>();

export async function transformHTML(ast: any, options: ParserOptions<any>) {
    const generator = await getGenerator(options.filepath);
    const promises: Promise<void>[] = [];

    ast.walk((node: any) => {
        if (node.type === 'attribute' && node.name === 'class') {
            promises.push(
                sortRules(node.value, generator).then((newValue) => {
                    FormattedNodesMap.set(node, newValue);
                }),
            );
        }
    });

    await Promise.all(promises);
}

export function printHTMLRules(path: AstPath<any>): Doc | undefined {
    const doc = FormattedNodesMap.get(path.node);
    if (doc) {
        return ['class', '=', '"', doc, '"'];
    }
}

export const visitorKeys = {
    'front-matter': [],
    root: ['children'],
    element: ['children'],
    ieConditionalComment: ['children'],
    ieConditionalStartComment: [],
    ieConditionalEndComment: [],
    interpolation: ['children'],
    text: ['children'],
    docType: [],
    comment: [],
    attribute: [],
    cdata: [],
    angularControlFlowBlock: ['children', 'parameters'],
    angularControlFlowBlockParameters: ['children'],
    angularControlFlowBlockParameter: [],
    angularLetDeclaration: ['init'],
    angularLetDeclarationInitializer: [],
    angularIcuExpression: ['cases'],
    angularIcuCase: ['expression'],
};
