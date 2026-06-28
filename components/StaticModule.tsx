export function StaticModule({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
