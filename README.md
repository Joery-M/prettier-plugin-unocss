<h1 align="center">joery-prettier-plugin-unocss</h1>

Format and sort UnoCSS at-directives and rules.

## Features

- Spacing and sorting: [See here](#spacing-and-sorting)
- Variant group merging: [See here](#variant-group-merging)
- Sorts HTML classes: [See here](#html-class-sorting)
- Line wrapping: [See here](#line-wrapping)
- Sorts `--at-apply`, `--uno-apply`, `--uno`, and `@apply`
- Works on `css`, `scss` and `less`

## Spacing and sorting

```css
body {
    @apply p-1        gap-1 mx-2;
}
```

```css
body {
    @apply mx-2 gap-1 p-1;
}
```

## Variant group merging

```css
body > #app {
    @apply hover:(font-medium bg-gray-400) hover:font-light;
}
```

```css
body > #app {
    @apply hover:(bg-gray-400 font-light font-medium);
}
```

## Line wrapping

```css
div {
    > div {
        > div {
            @apply align-middle
            font-extralight
            opacity-0
            invisible
            text-sm
            italic
            transition-all
            cursor-pointer;
        }
    }
}
```

```css
div {
    > div {
        > div {
            @apply invisible cursor-pointer align-middle text-sm font-extralight
                italic opacity-0 transition-all;
        }
    }
}
```

Also works with variant groups

```css
body > #app {
    @apply align-middle font-extralight opacity-0 invisible text-sm italic transition-all cursor-pointer hover:(align-middle font-extralight opacity-0 invisible text-sm italic transition-all cursor-pointer) align-middle font-extralight opacity-0 invisible text-sm italic transition-all cursor-pointer;
}
```

```css
body > #app {
    @apply invisible invisible cursor-pointer cursor-pointer align-middle
        align-middle text-sm text-sm font-extralight font-extralight italic
        italic opacity-0 opacity-0 transition-all transition-all
        hover:(
            invisible cursor-pointer align-middle text-sm font-extralight italic
            opacity-0 transition-all
        );
}
```

## HTML class sorting

```html
<div
    class="align-middle font-extralight opacity-0 invisible text-sm italic transition-all cursor-pointer hover:(align-middle font-extralight opacity-0 invisible text-sm italic transition-all cursor-pointer) align-middle font-extralight opacity-0 invisible text-sm italic transition-all cursor-pointer"
></div>
```

```html
<div
    class="
            invisible invisible cursor-pointer cursor-pointer align-middle
            align-middle text-sm text-sm font-extralight font-extralight italic
            italic opacity-0 opacity-0 transition-all transition-all
            hover:(
                invisible cursor-pointer align-middle text-sm font-extralight
                italic opacity-0 transition-all
            )
        "
></div>
```

> [!important]
> Sorting attributes is currently not supported
