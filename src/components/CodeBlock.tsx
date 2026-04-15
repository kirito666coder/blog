import { createHighlighter } from 'shiki';

interface CodeBlockProps {
  code: string;
  language: string;
}

export async function CodeBlock({ code, language }: CodeBlockProps) {
  const highlighter = await createHighlighter({
    themes: ['github-dark', 'github-light'],
    langs: [language],
  });

  const html = highlighter.codeToHtml(code, {
    lang: language,
    theme: 'github-dark',
  });

  return (
    <div className="group relative my-8">
      <div className="text-muted-foreground bg-background/50 border-border/40 absolute top-0 right-0 rounded-bl-lg border-b border-l p-2 text-[10px] font-bold tracking-widest uppercase backdrop-blur-md">
        {language}
      </div>
      <div
        className="border-border/40 premium-shadow overflow-x-auto rounded-2xl border bg-[#0d1117] p-6"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
