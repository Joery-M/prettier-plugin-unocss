import { dirname } from 'path';
import { createGenerator, UnoGenerator } from 'unocss';

const promises = new Map<string, Promise<UnoGenerator<any>> | undefined>();

async function findGenerator(configPath: string) {
    // dynamic import ESM module for CJS build
    const loadConfig = await import('@unocss/config').then(
        ({ loadConfig }) => loadConfig,
    );

    const { config, sources } = await loadConfig(dirname(configPath));
    if (!sources.length)
        throw new Error(
            '[prettier-plugin-unocss] AA No config file found, or create a `uno.config.ts` file in your project root and try again.',
        );
    return createGenerator({
        ...config,
        warn: false,
    });
}

export async function getGenerator(configPath: string) {
    let promise = promises.get(configPath);
    if (!promise) {
        promise = findGenerator(configPath);
        promises.set(configPath, promise);
    }
    return await promise;
}
