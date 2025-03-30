export function createGetVisitorKeys(
    visitorKeys: Record<string, string[]>,
    typeProperty = 'type',
): (node: any) => string[] {
    function getVisitorKeys(node: any) {
        const type = node[typeProperty];

        if (process.env.NODE_ENV !== 'production' && type === undefined) {
            throw new Error(
                `Can't get node type, you must pass the wrong typeProperty '${typeProperty}'`,
            );
        }

        const keys = visitorKeys[type];
        if (!Array.isArray(keys)) {
            throw Object.assign(
                new Error(`Missing visitor keys for '${type}'.`),
                {
                    node,
                },
            );
        }

        return keys;
    }

    return getVisitorKeys;
}
