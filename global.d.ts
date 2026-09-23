declare module "remark-html" {
  const html: any;
  export default html;
}

declare module "unist-util-visit" {
  export function visit(
    tree: any,
    type: string,
    visitor: (node: any) => void
  ): void;
}
