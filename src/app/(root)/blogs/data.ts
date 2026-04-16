export interface BlogPost {
  id: string;
  title: string;
  category: 'React' | 'Next.js' | 'Express' | 'DevOps';
  excerpt: string;
  content: string;
  code: string;
  language: string;
  date: string;
  author: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'The Memory Gap: memo vs useMemo',
    category: 'React',
    excerpt:
      'Understanding when to prevent re-renders versus when to cache expensive computations.',
    content:
      'In React, performance optimization is often misunderstood. React.memo is a higher-order component that prevents a functional component from re-rendering if its props havent changed. useMemo, on the other hand, is a hook that memoizes the result of a calculation between re-renders.',
    code: `const MyComponent = React.memo(({ data }) => {
  // This component will only re-render if data changes
  return <div>{data.name}</div>;
});

const Parent = () => {
  const [count, setCount] = useState(0);
  const expensiveValue = useMemo(() => {
    return computeExpensiveValue(count);
  }, [count]);

  return <MyComponent data={{ name: 'Fixed' }} />;
};`,
    language: 'javascript',
    date: '2026-04-10',
    author: 'Kirito',
  },
  {
    id: '2',
    title: 'Streaming Architecture in Next.js 15',
    category: 'Next.js',
    excerpt: 'Bypassing the loading spinner with SSR streaming and Suspense.',
    content:
      'Next.js 15 leverages React Suspense to allow streaming parts of your UI from the server to the client. This means users see parts of the page faster without waiting for the entire data set to load.',
    code: `// loading.tsx
export default function Loading() {
  return <Skeleton />;
}

// page.tsx (Server Component)
export default async function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}`,
    language: 'typescript',
    date: '2026-04-12',
    author: 'Kirito',
  },
  {
    id: '3',
    title: 'Resilient Middleware in Express',
    category: 'Express',
    excerpt: 'Handling distributed errors and maintaining system stability.',
    content:
      'In complex Express systems, errors often stem from external services. A robust error-handling middleware is essential for catching these and preventing server crashes.',
    code: `app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    traceId: req.headers['x-trace-id']
  });
});`,
    language: 'javascript',
    date: '2026-04-14',
    author: 'Kirito',
  },
  {
    id: '4',
    title: 'The CI/CD Wall: Why builds are slow',
    category: 'DevOps',
    excerpt: 'Optimizing Docker layers and caching strategies for 10x faster deployments.',
    content:
      'Build times are often ignored until they become a bottleneck. By optimizing Dockerfile layers and leveraging build caches, you can significantly reduce the time from commit to production.',
    code: `# Optimized Dockerfile
FROM node:20-alpine AS base

# Use cache for dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build`,
    language: 'dockerfile',
    date: '2026-04-16',
    author: 'Kirito',
  },
];
