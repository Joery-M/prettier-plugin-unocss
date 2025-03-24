import type { Printer } from 'prettier';

declare module 'prettier/parser-postcss' {
    export declare const printers: {
        postcss: Printer;
    };
}

declare module 'prettier/parser-html' {
    export declare const printers: {
        html: Printer;
    };
}
