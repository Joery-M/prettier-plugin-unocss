import { readFile } from 'fs/promises';
import { join, relative, sep } from 'path';
import { format } from 'prettier';
import { glob } from 'tinyglobby';
import { describe, expect, test } from 'vitest';
import '..'; // required for vitest
import { getSnapshotPath } from './utils';

describe('formatting', async () => {
    const files = await glob('files/**/*', { cwd: import.meta.dirname });

    test.each(files)('Format %s', async (path) => {
        const filepath = join(import.meta.dirname, path);
        const source = await readFile(filepath, {
            encoding: 'utf-8',
        });

        let parser = relative(
            join(import.meta.dirname, './files/'),
            filepath,
        ).split(sep)[0];
        const formatted = await format(source, {
            plugins: [join(import.meta.dirname, '../dist/index.cjs')],
            parser,
            filepath,
            semi: true,
            tabWidth: 2,
            singleQuote: true,
            endOfLine: 'auto',
        });

        await expect(formatted).toMatchFileSnapshot(getSnapshotPath(path));
    });
});
