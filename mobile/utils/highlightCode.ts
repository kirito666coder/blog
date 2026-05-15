import { createHighlighter } from 'shiki';

let highlighter: any = null;

export async function highlightCode(code: string, lang: string = 'javascript') {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['github-dark'],
      langs: ['javascript', 'typescript', 'bash', 'json', 'tsx', 'jsx'],
    });
  }

  return highlighter.codeToHtml(code, {
    lang,
    theme: 'github-dark',
  });
}
