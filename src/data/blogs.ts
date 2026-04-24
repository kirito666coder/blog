export const dummyBlogs = [
  {
    title: 'Advanced React Patterns for Scalable Applications',
    slug: 'advanced-react-patterns',
    category: 'Frontend',
    excerpt:
      'Explore advanced React patterns like compound components, render props, and custom hooks used in large-scale applications.',

    content: `
# Advanced React Patterns

In modern React development, simple component structures are often not enough for scalable applications.

## 1. Compound Components

This pattern allows components to share implicit state.

\`\`\`tsx
function Tabs({ children }) {
  const [active, setActive] = useState(0);
  return children({ active, setActive });
}
\`\`\`

## 2. Render Props

A technique for sharing logic using a function as a child.

\`\`\`tsx
<FetchData render={(data) => <UI data={data} />} />
\`\`\`

## 3. Custom Hooks

Encapsulate reusable logic.

\`\`\`ts
function useAuth() {
  const [user, setUser] = useState(null);
  return { user };
}
\`\`\`

## Conclusion

These patterns help maintain clean and scalable React architecture.
    `,

    tags: ['react', 'patterns', 'advanced'],
    seo: {
      metaTitle: 'Advanced React Patterns Explained',
      metaDescription:
        'Learn advanced React patterns like compound components, render props, and hooks for scalable apps.',
      keywords: ['react patterns', 'advanced react', 'react architecture'],
    },
  },

  {
    title: 'Understanding Next.js Server Actions Deeply',
    slug: 'nextjs-server-actions-guide',
    category: 'Backend',
    excerpt:
      'A deep dive into Next.js Server Actions, how they work, and when to use them in real-world apps.',

    content: `
# Next.js Server Actions

Server Actions allow you to run server-side code directly from components.

## Example

\`\`\`ts
'use server';

export async function createPost(data) {
  // server logic
}
\`\`\`

## Why Use Server Actions?

- No need for API routes
- Better security
- Direct DB access

## Use Cases

- Form submissions
- Mutations
- Admin dashboards

## Conclusion

Server Actions simplify backend logic in modern React apps.
    `,

    tags: ['nextjs', 'server-actions', 'backend'],
    seo: {
      metaTitle: 'Next.js Server Actions Guide',
      metaDescription:
        'Learn how to use Next.js Server Actions effectively in real-world applications.',
      keywords: ['nextjs server actions', 'nextjs backend', 'react server'],
    },
  },

  {
    title: 'DevOps Basics for Frontend Developers',
    slug: 'devops-for-frontend',
    category: 'DevOps',
    excerpt:
      'Learn essential DevOps concepts every frontend developer should know including CI/CD and deployment.',

    content: `
# DevOps for Frontend Developers

DevOps is not just for backend engineers.

## CI/CD Pipeline

Continuous Integration and Deployment automate your workflow.

## Example Flow

1. Push code to GitHub
2. Run tests
3. Deploy automatically

## Tools

- GitHub Actions
- Docker
- Vercel

## Conclusion

Understanding DevOps improves deployment and reliability.
    `,

    tags: ['devops', 'ci-cd', 'deployment'],
    seo: {
      metaTitle: 'DevOps Basics for Frontend Developers',
      metaDescription:
        'Understand CI/CD, deployment, and DevOps essentials for frontend developers.',
      keywords: ['devops frontend', 'ci cd basics', 'deployment guide'],
    },
  },
  {
    title: 'React Server Components Explained',
    slug: 'react-server-components',
    category: 'Frontend',
    excerpt: 'Understand how React Server Components work and why they improve performance.',
    content: `
# React Server Components

React Server Components allow rendering components on the server.

## Benefits
- Reduced bundle size
- Faster load times

## Example
\`\`\`tsx
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
\`\`\`

## Conclusion
They are a game changer for performance.
    `,
    tags: ['react', 'rsc'],
    seo: {
      metaTitle: 'React Server Components Guide',
      metaDescription: 'Deep dive into React Server Components.',
      keywords: ['react server components'],
    },
  },

  {
    title: 'System Design: URL Shortener',
    slug: 'system-design-url-shortener',
    category: 'Backend',
    excerpt: 'Design a scalable URL shortener like Bitly.',
    content: `
# URL Shortener System Design

## Requirements
- Generate short links
- Redirect fast

## Architecture
- Hashing
- Database indexing

## Example
\`\`\`ts
const short = hash(url);
\`\`\`

## Conclusion
Focus on scalability and caching.
    `,
    tags: ['system-design', 'backend'],
    seo: {
      metaTitle: 'URL Shortener System Design',
      metaDescription: 'Learn how to design scalable URL shorteners.',
      keywords: ['system design'],
    },
  },

  {
    title: 'Understanding Event Loop in JavaScript',
    slug: 'event-loop-js',
    category: 'Frontend',
    excerpt: 'Deep dive into how JavaScript handles async operations.',
    content: `
# Event Loop

JavaScript is single-threaded but asynchronous.

## Phases
- Call Stack
- Callback Queue

## Example
\`\`\`js
setTimeout(() => console.log("hi"), 0);
\`\`\`

## Conclusion
Understanding this prevents bugs.
    `,
    tags: ['javascript'],
    seo: {
      metaTitle: 'JS Event Loop Explained',
      metaDescription: 'Learn how event loop works.',
      keywords: ['event loop'],
    },
  },

  {
    title: 'Docker for Developers',
    slug: 'docker-basics',
    category: 'DevOps',
    excerpt: 'Learn containerization with Docker.',
    content: `
# Docker Basics

## Why Docker?
Consistency across environments.

## Example
\`\`\`bash
docker build -t app .
\`\`\`

## Conclusion
Docker simplifies deployment.
    `,
    tags: ['docker'],
    seo: {
      metaTitle: 'Docker Guide',
      metaDescription: 'Learn Docker basics.',
      keywords: ['docker'],
    },
  },

  {
    title: 'GraphQL vs REST',
    slug: 'graphql-vs-rest',
    category: 'Backend',
    excerpt: 'Compare GraphQL and REST APIs.',
    content: `
# GraphQL vs REST

## GraphQL
Flexible queries

## REST
Simple structure

## Conclusion
Choose based on use case.
    `,
    tags: ['graphql', 'rest'],
    seo: {
      metaTitle: 'GraphQL vs REST',
      metaDescription: 'Comparison guide.',
      keywords: ['graphql'],
    },
  },

  {
    title: 'Advanced TypeScript Patterns',
    slug: 'advanced-typescript',
    category: 'Frontend',
    excerpt: 'Explore generics, utility types, and advanced patterns.',
    content: `
# Advanced TypeScript

## Generics
\`\`\`ts
function identity<T>(arg: T): T {
  return arg;
}
\`\`\`

## Utility Types
- Partial
- Pick

## Conclusion
TypeScript improves maintainability.
    `,
    tags: ['typescript'],
    seo: {
      metaTitle: 'Advanced TypeScript',
      metaDescription: 'Learn advanced TS.',
      keywords: ['typescript'],
    },
  },

  {
    title: 'Caching Strategies in Web Apps',
    slug: 'caching-strategies',
    category: 'Backend',
    excerpt: 'Learn different caching mechanisms.',
    content: `
# Caching Strategies

## Types
- Memory cache
- CDN

## Example
\`\`\`ts
cache.set(key, value);
\`\`\`

## Conclusion
Caching boosts performance.
    `,
    tags: ['cache'],
    seo: {
      metaTitle: 'Caching Strategies',
      metaDescription: 'Improve performance with caching.',
      keywords: ['caching'],
    },
  },

  {
    title: 'Authentication with JWT',
    slug: 'jwt-authentication',
    category: 'Backend',
    excerpt: 'Implement authentication using JWT.',
    content: `
# JWT Auth

## Flow
1. Login
2. Token issued

## Example
\`\`\`ts
jwt.sign({ userId }, secret);
\`\`\`

## Conclusion
JWT is stateless and scalable.
    `,
    tags: ['auth'],
    seo: {
      metaTitle: 'JWT Auth Guide',
      metaDescription: 'Learn JWT authentication.',
      keywords: ['jwt'],
    },
  },

  {
    title: 'Web Performance Optimization',
    slug: 'web-performance',
    category: 'Frontend',
    excerpt: 'Improve loading speed and performance.',
    content: `
# Performance

## Techniques
- Lazy loading
- Code splitting

## Conclusion
Performance impacts UX.
    `,
    tags: ['performance'],
    seo: {
      metaTitle: 'Web Performance',
      metaDescription: 'Optimize web apps.',
      keywords: ['performance'],
    },
  },

  {
    title: 'Microservices Architecture',
    slug: 'microservices',
    category: 'Backend',
    excerpt: 'Understand microservices vs monolith.',
    content: `
# Microservices

## Benefits
- Scalability
- Independent deployment

## Conclusion
Use for large systems.
    `,
    tags: ['microservices'],
    seo: {
      metaTitle: 'Microservices Guide',
      metaDescription: 'Learn microservices.',
      keywords: ['microservices'],
    },
  },

  // 10 MORE (shortened but still useful)

  {
    title: 'Redis Deep Dive',
    slug: 'redis-deep-dive',
    category: 'Backend',
    excerpt: 'In-memory data store explained.',
    content: `# Redis\nFast key-value store.`,
    tags: ['redis'],
    seo: { metaTitle: 'Redis', metaDescription: 'Redis guide', keywords: ['redis'] },
  },

  {
    title: 'WebSockets vs HTTP',
    slug: 'websockets-vs-http',
    category: 'Backend',
    excerpt: 'Real-time vs request-response.',
    content: `# WebSockets\nReal-time communication.`,
    tags: ['websockets'],
    seo: { metaTitle: 'WebSockets', metaDescription: 'Guide', keywords: ['ws'] },
  },

  {
    title: 'AI in Web Development',
    slug: 'ai-web-dev',
    category: 'AI',
    excerpt: 'How AI is changing development.',
    content: `# AI\nUsed for automation.`,
    tags: ['ai'],
    seo: { metaTitle: 'AI Dev', metaDescription: 'AI guide', keywords: ['ai'] },
  },

  {
    title: 'Scaling Databases',
    slug: 'scaling-databases',
    category: 'Backend',
    excerpt: 'Vertical vs horizontal scaling.',
    content: `# Scaling\nImportant for growth.`,
    tags: ['db'],
    seo: { metaTitle: 'Scaling DB', metaDescription: 'Scaling guide', keywords: ['db'] },
  },

  {
    title: 'Edge Computing Explained',
    slug: 'edge-computing',
    category: 'DevOps',
    excerpt: 'Compute closer to users.',
    content: `# Edge\nLow latency.`,
    tags: ['edge'],
    seo: { metaTitle: 'Edge', metaDescription: 'Edge guide', keywords: ['edge'] },
  },

  {
    title: 'Security Best Practices',
    slug: 'web-security',
    category: 'Security',
    excerpt: 'Protect your apps.',
    content: `# Security\nAlways sanitize input.`,
    tags: ['security'],
    seo: { metaTitle: 'Security', metaDescription: 'Security tips', keywords: ['security'] },
  },

  {
    title: 'State Management Comparison',
    slug: 'state-management',
    category: 'Frontend',
    excerpt: 'Redux vs Zustand vs Context.',
    content: `# State\nChoose wisely.`,
    tags: ['state'],
    seo: { metaTitle: 'State', metaDescription: 'State guide', keywords: ['state'] },
  },

  {
    title: 'CI/CD Advanced Pipelines',
    slug: 'advanced-ci-cd',
    category: 'DevOps',
    excerpt: 'Automate deployments at scale.',
    content: `# CI/CD\nAutomation is key.`,
    tags: ['ci-cd'],
    seo: { metaTitle: 'CI/CD', metaDescription: 'CI/CD guide', keywords: ['ci'] },
  },

  {
    title: 'Kubernetes Basics',
    slug: 'kubernetes',
    category: 'DevOps',
    excerpt: 'Container orchestration.',
    content: `# Kubernetes\nManage containers.`,
    tags: ['k8s'],
    seo: { metaTitle: 'K8s', metaDescription: 'K8s guide', keywords: ['k8s'] },
  },

  {
    title: 'Monorepo Architecture',
    slug: 'monorepo',
    category: 'Architecture',
    excerpt: 'Managing multiple apps in one repo.',
    content: `# Monorepo\nCentralized codebase.`,
    tags: ['monorepo'],
    seo: { metaTitle: 'Monorepo', metaDescription: 'Monorepo guide', keywords: ['repo'] },
  },
];
