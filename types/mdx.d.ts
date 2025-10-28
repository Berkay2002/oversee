declare module '*.mdx' {
  export const metadata: {
    id: string;
    title: string;
    keywords: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MDXComponent: (props: any) => JSX.Element;
  export default MDXComponent;
}
