export function Html({ html, className = '' }: { html: string; className?: string }) {
  return <div className={`md prose prose-sm sm:prose-base ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function InlineHtml({ html, className = '' }: { html: string; className?: string }) {
  return <span className={`md-inline ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
