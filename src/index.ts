import type { Root, Heading } from "mdast";
import { visit, CONTINUE } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import GithubSlugger from "github-slugger";
import { Plugin } from "unified";

export type HeadingParent =
  | "root"
  | "blockquote"
  | "footnoteDefinition"
  | "listItem"
  | "container"
  | "mdxJsxFlowElement";

export type TocEntry = {
  depth: number;
  value: string;
  href: string;
  attributes: { [key: string]: string };
  children: TocEntry[];
};

export type HeadingDepth = 1 | 2 | 3 | 4 | 5 | 6;

export interface RemarkTocOptions {
  maxDepth: HeadingDepth;
  skipLevels: HeadingDepth[];
  skipParents?: Exclude<HeadingParent, "root">[];
}

export const remarkToc: Plugin<[RemarkTocOptions?], Root> = (
  options = {
    maxDepth: 4,
    skipLevels: [1],
    skipParents: [],
  },
) => {
  return (tree, file) => {
    // structured toc
    const toc: TocEntry[] = [];
    // flat toc (share objects in toc, only for iterating)
    const flatToc: TocEntry[] = [];
    const slugger = new GithubSlugger();

    const createEntry = (node: Heading, depth: number): TocEntry => {
      const attributes = (node.data || {}) as TocEntry["attributes"];
      const value = toString(node, { includeImageAlt: false });
      return {
        depth,
        value,
        href: `#${slugger.slug(value)}`,
        attributes,
        children: [],
      };
    };

    visit(tree, "heading", (node: Heading, _index, parent) => {
      const depth = node.depth;

      if (!parent || typeof _index === "undefined") return;
      if (depth > options.maxDepth) return CONTINUE;
      if (options.skipLevels.includes(depth)) return CONTINUE;
      if (
        parent.type !== "root" &&
        options.skipParents &&
        options.skipParents.includes(parent.type)
      )
        return CONTINUE;

      const entry = createEntry(node, depth);
      flatToc.push(entry);

      // Find the last node that is less deep (parent)
      // Fall back to root
      let parentNode: TocEntry[] = toc;
      for (let i = flatToc.length - 1; i >= 0; --i) {
        const current = flatToc[i];
        if (current.depth < entry.depth) {
          parentNode = current.children;
          break;
        }
      }
      parentNode.push(entry);
      return CONTINUE;
    });
    // Expose TOC data via vfile.data
    file.data.toc = toc;
  };
};
