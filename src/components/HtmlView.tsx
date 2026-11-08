type HtmlViewProps = {
  page: string;
  html: string;
};

export function HtmlView({ page, html }: HtmlViewProps) {
  return <div data-app-page={page} dangerouslySetInnerHTML={{ __html: html }} />;
}
