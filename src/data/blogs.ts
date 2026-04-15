export type Category = 'Development' | 'Design' | 'AI' | 'Personal';

export interface BlogPost {
  id: string;
  title: string;
  description: string;
  content: string;
  date: string;
  category: Category;
  slug: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
}

export const categories: Category[] = ['Development', 'Design', 'AI', 'Personal'];

export const blogs: BlogPost[] = [
  {
    id: '1',
    title: 'The Future of Web Development',
    description: 'Exploring the impact of AI on the future of web development and how to adapt.',
    date: 'April 15, 2026',
    category: 'Development',
    slug: 'future-of-web-dev',
    content: `
      Web development is changing rapidly. With the rise of AI-driven tools, developers are becoming more productive than ever. 
      However, this also means the bar for entry is rising. You need to understand not just how to code, but how to architect systems.
      
      Here is a simple example of a modern React component using Tailwind CSS:
    `,
    codeSnippet: {
      language: 'tsx',
      code: `
export function Welcome({ name }: { name: string }) {
  return (
    <div className="p-8 border border-white/10 rounded-xl glass">
      <h1 className="text-2xl font-bold">Welcome, {name}!</h1>
      <p className="text-muted-foreground">Modern B&W design system.</p>
    </div>
  );
}
      `.trim(),
    },
  },
  {
    id: '2',
    title: 'Minimalist Design Principles',
    description: 'How to build beautiful, high-performance websites using only black and white.',
    date: 'April 12, 2026',
    category: 'Design',
    slug: 'minimalist-design',
    content: `
      Design doesn't need to be colorful to be impactful. In fact, a black and white palette can often feel more premium and focused.
      The key is to use whitespace effectively and focus on typography.
    `,
  },
  {
    id: '3',
    title: 'Getting Started with Shiki',
    description: 'A guide to implementing beautiful syntax highlighting in your Next.js project.',
    date: 'April 10, 2026',
    category: 'Development',
    slug: 'shiki-highlighting',
    content: `
      Shiki is a powerful syntax highlighter based on TextMate grammars. It provides high-quality highlighting that matches your VS Code theme.
      
      Here is how you initialize Shiki:
    `,
    codeSnippet: {
      language: 'typescript',
      code: `
import { getHighlighter } from 'shiki';

const highlighter = await getHighlighter({
  themes: ['github-dark', 'github-light'],
  langs: ['javascript', 'typescript', 'tsx', 'css', 'html'],
});

const html = highlighter.codeToHtml('const hello = "world";', {
  lang: 'javascript',
  theme: 'github-dark',
});
      `.trim(),
    },
  },
  {
    id: '4',
    title: 'The AI Revolution in 2026',
    description: 'Looking back at the transformative power of AI in the last year.',
    date: 'April 5, 2026',
    category: 'AI',
    slug: 'ai-revolution-2026',
    content: `
      AI has moved from being a tool to a collaborator. We no longer just use AI; we work alongside it.
      This shift has changed the way we think about software engineering and general productivity.
    `,
  },
];
