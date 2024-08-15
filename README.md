# remark-better-toc

[![Version](https://img.shields.io/npm/v/remark-better-toc.svg)](https://npmjs.org/package/remark-better-toc)

A remark plugin to generate toc and convert it into MDX export
Copy from [remark-mdx-toc](https://github.com/DCsunset/remark-mdx-toc) and [remark-flexible-toc](https://github.com/ipikuka/remark-flexible-toc)

## Installation

```
pnpm install remark-better-toc
```

Note: This package uses [ESM](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
Use Node 12+ and ESM import syntax to use this package.

## Usage

```js
import { remarkToc } from "remark-better-toc";
import { evaluate, type EvaluateOptions } from "next-mdx-remote-client/rsc";
import { getPostBySomeway } from "@/core/posts";

const source = await getPostBySomeway();
const options: EvaluateOptions<Scope> = {
    mdxOptions: {
      remarkPlugins: [remarkToc],
    },
    vfileDataIntoScope: "toc",
  };
  const { content, scope, error } = await evaluate<Scope>({
    source,
    options,
  });
  console.log(scope.toc)
  // export type TocEntry = {
  //   depth: number;
  //   value: string;
  //   href: string;
  //   attributes: { [key: string]: string };
  //   children: TocEntry[];
  // };
```

Suppose the `example.mdx` has the following content:

```md
# Hello, world {#hello-world}

## Title 1

Content 1

### Subtitle 1

Sub Content 1

<h2 id="title-2">Title 2</h2>

Content 2
```

Then the output of the above code is similar to the following:

```jsx
toc = [{
  "depth": 1,
  "value": "Hello, world",
  "attributes": {
    "id": "hello-world"
  },
  "children": [{
    "depth": 2,
    "value": "Title 1",
    "attributes": {},
    "children": [{
      "depth": 3,
      "value": "Subtitle 1",
      "attributes": {},
      "children": []
    }]
  }, {
    "depth": 2,
    "value": "Title 2",
    "attributes": { "id": "title-2" }
    "children": []
  }]
}];
```

- HTML heading tags (`h1`-`h6`) are supported.
- Custom tags can also be added through options.
- `{#id}` syntax needs [remark-heading-id](https://github.com/imcuttle/remark-heading-id) plugin.

## Options

```ts
export type HeadingParent =
  | "root"
  | "blockquote"
  | "footnoteDefinition"
  | "listItem"
  | "container"
  | "mdxJsxFlowElement";

export type HeadingDepth = 1 | 2 | 3 | 4 | 5 | 6;

export interface RemarkTocOptions {
  maxDepth: HeadingDepth;
  skipLevels: HeadingDepth[];
  skipParents?: Exclude<HeadingParent, "root">[];
}
```

## License

MIT