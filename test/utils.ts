import { join, relative } from 'path';

export function getSnapshotPath(path: string) {
    return join(
        import.meta.dirname,
        './__snapshots__/',
        relative('files/', path) + '.snap',
    );
}
