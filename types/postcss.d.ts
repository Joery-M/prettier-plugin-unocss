import type { Printer } from 'prettier';

declare module 'prettier/parser-postcss' {
    export declare const printers: {
        postcss: Printer;
    };
}
