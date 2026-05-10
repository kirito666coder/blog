export const dummyBlogs = [
  {
    title: 'Scaling Next.js Applications with App Router Architecture',
    slug: 'scaling-nextjs-app-router-architecture',
    category: 'Architecture',
    excerpt:
      'Learn how to structure large-scale Next.js applications using the App Router, layouts, and modular architecture patterns.',
    status: 'published',
    content: `
# Scaling Next.js Applications

As your application grows, structuring your project correctly becomes critical.

## Folder Structure Strategy

Organize by feature instead of type:

\`\`\`bash
/app
  /dashboard
    /components
    /hooks
    /services
\`\`\`

This improves scalability and maintainability.

## Layouts for Reusability

Use nested layouts to avoid repetition:

\`\`\`tsx
export default function DashboardLayout({ children }) {
  return <div className="dashboard">{children}</div>;
}
\`\`\`

## Server vs Client Components

- Use Server Components for data fetching
- Use Client Components only when needed

## Data Fetching Strategy

\`\`\`ts
async function getData() {
  const res = await fetch('/api/data', { cache: 'no-store' });
  return res.json();
}
\`\`\`

## Conclusion

A well-structured App Router setup ensures long-term scalability.
  `,

    tags: ['nextjs', 'architecture', 'scalable'],
    seo: {
      metaTitle: 'Scaling Next.js Apps with App Router',
      metaDescription:
        'Learn scalable architecture patterns in Next.js App Router.',
      keywords: ['nextjs architecture', 'app router', 'scalable nextjs'],
    },
  },
  {
    title: 'Optimizing React Performance in Large Applications',
    slug: 'react-performance-optimization-guide',
    category: 'Performance',
    excerpt:
      'Deep dive into techniques like memoization, code splitting, and virtualization to boost React performance.',
    status: 'published',
    content: `
# React Performance Optimization

Performance becomes critical in large applications.

## Memoization

Prevent unnecessary re-renders:

\`\`\`tsx
const MemoComponent = React.memo(({ value }) => {
  return <div>{value}</div>;
});
\`\`\`

## useMemo & useCallback

\`\`\`tsx
const memoValue = useMemo(() => compute(value), [value]);
\`\`\`

## Code Splitting

\`\`\`tsx
const LazyComponent = React.lazy(() => import('./HeavyComponent'));
\`\`\`

## Virtualization

Use libraries like react-window:

\`\`\`tsx
<List height={400} itemCount={1000} itemSize={35}>
  {Row}
</List>
\`\`\`

## Conclusion

Combining these techniques significantly improves performance.
  `,

    tags: ['react', 'performance', 'optimization'],
    seo: {
      metaTitle: 'React Performance Optimization Guide',
      metaDescription:
        'Improve React app performance with advanced techniques.',
      keywords: ['react performance', 'memoization', 'optimization'],
    },
  },
  {
    title: 'Building Reusable UI Systems with Design Patterns in React',
    slug: 'react-reusable-ui-design-patterns',
    category: 'Frontend',
    excerpt:
      'Learn how to build scalable and reusable UI systems using compound components, slots, and composition.',
    status: 'published',
    content: `
# Reusable UI Systems in React

Reusable UI is key to scalable frontend architecture.

## Compound Components

\`\`\`tsx
<Tabs>
  <Tabs.List />
  <Tabs.Panel />
</Tabs>
\`\`\`

## Slot Pattern

\`\`\`tsx
<Card header={<Header />} footer={<Footer />} />
\`\`\`

## Composition Over Props

\`\`\`tsx
<Button>
  <Icon />
  Click Me
</Button>
\`\`\`

## Benefits

- Cleaner APIs
- Flexible UI
- Easier maintenance

## Conclusion

Design patterns help build scalable UI systems.
  `,

    tags: ['react', 'ui', 'patterns'],
    seo: {
      metaTitle: 'Reusable UI Patterns in React',
      metaDescription: 'Build scalable UI systems using React patterns.',
      keywords: ['react ui patterns', 'compound components', 'design system'],
    },
  },
  {
    title: 'Mastering Data Fetching in Next.js 14',
    slug: 'nextjs-data-fetching-mastery',
    category: 'Backend',
    excerpt:
      'Understand caching, revalidation, and server-side data fetching strategies in modern Next.js.',
    status: 'published',
    content: `
# Data Fetching in Next.js 14

Next.js introduces powerful data fetching mechanisms.

## Static vs Dynamic

\`\`\`ts
fetch('/api/data', { cache: 'force-cache' });
\`\`\`

## Revalidation

\`\`\`ts
fetch('/api/data', { next: { revalidate: 60 } });
\`\`\`

## Server Actions

\`\`\`ts
'use server';

export async function createPost() {}
\`\`\`

## Streaming

React Server Components allow streaming UI.

## Conclusion

Choosing the right fetching strategy improves performance.
  `,

    tags: ['nextjs', 'data-fetching', 'backend'],
    seo: {
      metaTitle: 'Next.js Data Fetching Guide',
      metaDescription:
        'Master data fetching in Next.js with caching and revalidation.',
      keywords: ['nextjs data fetching', 'server actions', 'nextjs caching'],
    },
  },
  {
    title: 'State Management at Scale in React Applications',
    slug: 'react-state-management-at-scale',
    category: 'Frontend',
    excerpt:
      'Explore different state management strategies and when to use Context, Zustand, or Redux.',
    status: 'published',

    content: `
# State Management at Scale

Managing state becomes complex as apps grow.

## Local State

\`\`\`tsx
const [count, setCount] = useState(0);
\`\`\`

## Context API

\`\`\`tsx
const ThemeContext = createContext();
\`\`\`

## Zustand

\`\`\`ts
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}));
\`\`\`

## Redux Toolkit

Best for very large apps.

## Choosing the Right Tool

- Small → useState
- Medium → Context/Zustand
- Large → Redux

## Conclusion

Pick the right tool based on complexity.
  `,

    tags: ['react', 'state-management', 'scalable'],
    seo: {
      metaTitle: 'React State Management Guide',
      metaDescription: 'Learn scalable state management strategies in React.',
      keywords: ['react state management', 'zustand', 'redux'],
    },
  },
  {
    title: 'Building Scalable API Layers with Next.js Route Handlers',
    slug: 'nextjs-route-handlers-scalable-api',
    category: 'Backend',
    excerpt:
      'Learn how to design scalable and maintainable API layers using Next.js Route Handlers and modular service patterns.',
    status: 'published',

    content: `
# Scalable APIs with Next.js Route Handlers

As applications grow, APIs must be structured cleanly.

## Route Handler Basics

\`\`\`ts
export async function GET() {
  return Response.json({ message: 'Hello' });
}
\`\`\`

## Service Layer Pattern

\`\`\`ts
// services/user.service.ts
export async function getUsers() {
  return db.users.findMany();
}
\`\`\`

## Keep Logic Out of Routes

\`\`\`ts
export async function GET() {
  const users = await getUsers();
  return Response.json(users);
}
\`\`\`

## Validation with Zod

\`\`\`ts
const schema = z.object({
  name: z.string()
});
\`\`\`

## Conclusion

Separate layers make APIs scalable and testable.
  `,

    tags: ['nextjs', 'api', 'backend'],
    seo: {
      metaTitle: 'Next.js Route Handlers Guide',
      metaDescription: 'Build scalable APIs with Next.js route handlers.',
      keywords: ['nextjs api', 'route handlers', 'backend architecture'],
    },
  },
  {
    title: 'Advanced Caching Strategies in Next.js Applications',
    slug: 'nextjs-advanced-caching-strategies',
    category: 'Performance',
    excerpt:
      'Explore caching layers like static generation, ISR, and edge caching for maximum performance.',
    status: 'published',

    content: `
# Advanced Caching in Next.js

Caching is key for performance.

## Static Rendering

\`\`\`ts
fetch('/api/data', { cache: 'force-cache' });
\`\`\`

## ISR

\`\`\`ts
fetch('/api/data', { next: { revalidate: 60 } });
\`\`\`

## Dynamic Rendering

\`\`\`ts
fetch('/api/data', { cache: 'no-store' });
\`\`\`

## Edge Caching

Deploy on edge networks for speed.

## Conclusion

Use the right caching strategy based on data freshness.
  `,

    tags: ['nextjs', 'performance', 'caching'],
    seo: {
      metaTitle: 'Next.js Caching Strategies',
      metaDescription: 'Learn caching strategies for scalable Next.js apps.',
      keywords: ['nextjs caching', 'ISR', 'performance'],
    },
  },
  {
    title: 'Designing Scalable Component Libraries in React',
    slug: 'react-component-library-design',
    category: 'Frontend',
    excerpt:
      'Learn how to build reusable and scalable component libraries using modern React patterns.',
    status: 'published',

    content: `
# Scalable Component Libraries

Design systems improve consistency.

## Folder Structure

\`\`\`bash
/components
  /Button
  /Card
\`\`\`

## Reusable Components

\`\`\`tsx
export function Button({ children }) {
  return <button>{children}</button>;
}
\`\`\`

## Variant Pattern

\`\`\`tsx
<Button variant="primary" />
\`\`\`

## Theming

Use context or CSS variables.

## Conclusion

A solid component library speeds up development.
  `,

    tags: ['react', 'ui', 'design-system'],
    seo: {
      metaTitle: 'React Component Library Guide',
      metaDescription: 'Build scalable UI libraries in React.',
      keywords: ['react components', 'design system'],
    },
  },
  {
    title: 'Authentication Patterns in Next.js Applications',
    slug: 'nextjs-authentication-patterns',
    category: 'Backend',
    excerpt:
      'Explore secure authentication strategies using JWT, sessions, and modern auth providers.',
    status: 'published',

    content: `
# Authentication in Next.js

Security is critical.

## JWT Authentication

\`\`\`ts
const token = jwt.sign({ id: user.id }, SECRET);
\`\`\`

## Session-Based Auth

Store session securely in cookies.

## Middleware Protection

\`\`\`ts
export function middleware(req) {
  // check auth
}
\`\`\`

## OAuth Providers

Use Google, GitHub login.

## Conclusion

Choose authentication based on your app needs.
  `,

    tags: ['nextjs', 'auth', 'security'],
    seo: {
      metaTitle: 'Next.js Authentication Guide',
      metaDescription: 'Secure your app with modern auth strategies.',
      keywords: ['nextjs auth', 'jwt', 'oauth'],
    },
  },
  {
    title: 'Handling Forms and Validation in React at Scale',
    slug: 'react-forms-validation-scale',
    category: 'Frontend',
    excerpt:
      'Learn scalable form handling using React Hook Form and Zod validation.',
    status: 'published',

    content: `
# Forms at Scale

Managing forms can get complex.

## React Hook Form

\`\`\`tsx
const { register } = useForm();
\`\`\`

## Zod Validation

\`\`\`ts
const schema = z.object({
  email: z.string().email()
});
\`\`\`

## Error Handling

Display validation errors clearly.

## Conclusion

Use proper tools to simplify forms.
  `,

    tags: ['react', 'forms', 'validation'],
    seo: {
      metaTitle: 'React Forms Guide',
      metaDescription: 'Handle forms efficiently in React apps.',
      keywords: ['react forms', 'zod', 'react hook form'],
    },
  },
  {
    title: 'Code Splitting and Lazy Loading in React Applications',
    slug: 'react-code-splitting-lazy-loading',
    category: 'Performance',
    excerpt:
      'Improve performance using code splitting and lazy loading techniques.',
    status: 'published',

    content: `
# Code Splitting in React

Reduce bundle size.

## Lazy Loading

\`\`\`tsx
const Page = React.lazy(() => import('./Page'));
\`\`\`

## Suspense

\`\`\`tsx
<Suspense fallback="Loading...">
  <Page />
</Suspense>
\`\`\`

## Dynamic Imports

Load components on demand.

## Conclusion

Split code to improve load time.
  `,

    tags: ['react', 'performance', 'lazy-loading'],
    seo: {
      metaTitle: 'React Code Splitting Guide',
      metaDescription: 'Optimize React apps with lazy loading.',
      keywords: ['code splitting', 'react lazy'],
    },
  },
  {
    title: 'Error Handling Strategies in Next.js Applications',
    slug: 'nextjs-error-handling-strategies',
    category: 'Backend',
    excerpt:
      'Implement robust error handling using boundaries and API strategies.',
    status: 'published',

    content: `
# Error Handling in Next.js

Handle errors gracefully.

## Error Boundaries

\`\`\`tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
\`\`\`

## API Error Handling

\`\`\`ts
try {
  // logic
} catch (e) {
  return Response.json({ error: 'Error' });
}
\`\`\`

## Logging

Use tools like Sentry.

## Conclusion

Proper error handling improves reliability.
  `,

    tags: ['nextjs', 'errors', 'backend'],
    seo: {
      metaTitle: 'Next.js Error Handling',
      metaDescription: 'Handle errors effectively in Next.js.',
      keywords: ['error handling', 'nextjs'],
    },
  },
  {
    title: 'Database Design for Scalable Web Applications',
    slug: 'scalable-database-design-web',
    category: 'Backend',
    excerpt: 'Learn how to design scalable database schemas and relationships.',
    status: 'published',

    content: `
# Database Design

A strong schema is essential.

## Normalization

Avoid redundant data.

## Indexing

\`\`\`ts
db.collection.createIndex({ email: 1 });
\`\`\`

## Relationships

Use references wisely.

## Conclusion

Good database design ensures scalability.
  `,

    tags: ['database', 'backend', 'scalable'],
    seo: {
      metaTitle: 'Database Design Guide',
      metaDescription: 'Design scalable databases.',
      keywords: ['database design', 'scaling'],
    },
  },
  {
    title: 'Optimizing Images and Assets in Next.js',
    slug: 'nextjs-image-optimization',
    category: 'Performance',
    excerpt: 'Learn how to optimize images and assets using Next.js features.',
    status: 'published',

    content: `
# Image Optimization

Images affect performance.

## Next Image Component

\`\`\`tsx
<Image src="/img.png" width={500} height={300} />
\`\`\`

## Lazy Loading

Load images only when needed.

## Compression

Use optimized formats.

## Conclusion

Optimized assets improve UX.
  `,

    tags: ['nextjs', 'images', 'performance'],
    seo: {
      metaTitle: 'Next.js Image Optimization',
      metaDescription: 'Optimize images in Next.js apps.',
      keywords: ['nextjs images', 'optimization'],
    },
  },
  {
    title: 'Testing Strategies for React and Next.js Applications',
    slug: 'testing-react-nextjs-apps',
    category: 'Frontend',
    excerpt:
      'Implement testing strategies using Jest and React Testing Library.',
    status: 'published',

    content: `
# Testing React Apps

Testing ensures reliability.

## Unit Testing

\`\`\`ts
test('renders', () => {
  expect(true).toBe(true);
});
\`\`\`

## Component Testing

Use React Testing Library.

## Integration Testing

Test complete flows.

## Conclusion

Testing improves confidence in code.
  `,

    tags: ['testing', 'react', 'nextjs'],
    seo: {
      metaTitle: 'Testing React Apps',
      metaDescription: 'Learn testing strategies.',
      keywords: ['jest', 'testing'],
    },
  },
  {
    title: 'The Day Git Saved My 2 Hours of Work',
    slug: 'git-stash-saved-my-work-after-husky-failed',
    category: 'Git',
    excerpt:
      'A failed Husky pre-commit hook made me think I lost 18 files and 2 hours of work — until I discovered how Git stash saved everything.',
    status: 'published',

    content: `

# The Day Git Saved My 2 Hours of Work

A few days ago, I had one of the scariest moments in my development journey.

I was working on a project where I had configured Husky with lint-staged to automatically run ESLint before every commit. Everything looked perfect — better code quality, automatic checks, cleaner commits.

Or at least that’s what I thought.

## The Situation

I spent almost 2 hours building a feature.

- Created around 18 new files
- Wrote all the logic
- Styled components
- Refactored some code

After finishing everything, I ran:

\`\`\`bash
git commit -m "add new feature"
\`\`\`

Suddenly…

An error appeared.

At first, I thought it was just a normal lint issue. But then I checked Git status and almost had a heart attack.

Only these files were showing:

\`\`\`bash
pnpm-lock.yaml
global.css
\`\`\`

All my other files were gone.

Not hidden.

Not unstaged.

Gone.

## Panic Mode Activated

For a moment, I genuinely believed I had lost 2 hours of work.

I started checking:

- VS Code history
- Local file search
- Recently deleted files
- Git status again and again

Nothing.

I was completely confused.

## Finding the Real Problem

After carefully reading the error logs, I finally noticed the actual issue:

\`\`\`bash
eslint-plugin-react-hooks is missing
\`\`\`

Because Husky was running lint-staged during commit, the lint process failed.

And when lint-staged fails, it can temporarily move your staged changes into Git stash to protect your working state.

At that moment, I didn’t know this behavior existed.

## The Discovery That Saved Me

First, I installed the missing package:

\`\`\`bash
pnpm add -D eslint-plugin-react-hooks
\`\`\`

Then I started researching what happens when lint-staged fails.

That’s when I discovered this command:

\`\`\`bash
git stash list
\`\`\`

And there it was.

My changes.

My 18 files.

My 2 hours of work.

Safe inside a stash created automatically by lint-staged.

## Recovering Everything

I restored the files using:

\`\`\`bash
git stash apply
\`\`\`

And instantly, all my files came back.

That feeling was unbelievable.

## What I Learned

That day taught me several important lessons:

### 1. Git Is More Powerful Than I Thought

Before this incident, I only used basic Git commands.

Now I understand how useful stash really is.

### 2. Always Read Error Messages Carefully

The real issue was just one missing package:

\`\`\`bash
eslint-plugin-react-hooks
\`\`\`

But panic made me ignore the actual error.

### 3. Husky + lint-staged Is Great — But Know How It Works

Automation is powerful, but you should understand what happens behind the scenes.

Especially when tools modify staged files automatically.

## Useful Commands

### Check existing stashes

\`\`\`bash
git stash list
\`\`\`

### Restore latest stash

\`\`\`bash
git stash apply
\`\`\`

### Restore and remove stash

\`\`\`bash
git stash pop
\`\`\`

## Conclusion

That day I went from:

“I lost everything.”

to

“I love Git.”

And honestly, after understanding stash properly, I trust Git much more now.

Sometimes the best Git lessons come from panic moments.

  `,

    tags: ['git', 'husky', 'lint-staged', 'nextjs', 'developer-story'],

    seo: {
      metaTitle: 'How Git Stash Saved My Lost Files After Husky Failed',
      metaDescription:
        'A real developer story about Husky, lint-staged failure, missing ESLint packages, and how Git stash recovered 18 lost files.',
      keywords: [
        'git stash',
        'husky pre commit',
        'lint staged failed',
        'eslint plugin react hooks',
        'git lost files',
        'git stash recovery',
        'developer story',
      ],
    },
  },
];
