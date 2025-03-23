import unoPlugin from '..';
import { format } from 'prettier';
import { describe, expect, test } from 'vitest';
import { glob } from 'tinyglobby';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';
import { getSnapshotPath } from './utils';

describe('formatting', async () => {
    const files = await glob('files/**/*', { cwd: import.meta.dirname });

    test.each(files)('Format %s', async (path) => {
        const filepath = join(import.meta.dirname, path);
        const source = await readFile(filepath, {
            encoding: 'utf-8',
        });

        const formatted = await format(source, {
            plugins: [join(import.meta.dirname, '../dist/index.cjs')],
            parser: extname(path).slice(1),
            filepath,
            semi: true,
            tabWidth: 2,
            singleQuote: true,
            endOfLine: 'auto',
        });

        await expect(formatted).toMatchFileSnapshot(getSnapshotPath(path));
    });
});
