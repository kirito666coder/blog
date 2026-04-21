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
];
