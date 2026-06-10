export const dummyBlogs = [
  {
    title: 'The Day PostgreSQL Row-Level Security Broke My API',
    slug: 'postgresql-rls-api-failure-pern-stack',
    category: 'PERN',
    excerpt:
      'Adding Row-Level Security to PostgreSQL seemed smart — until every API request started returning empty arrays and users thought their data was deleted.',
    status: 'published',

    content: `

# The Day PostgreSQL Row-Level Security Broke My API

I love PostgreSQL. It's powerful, reliable, and has features that MongoDB users can only dream about.

But one feature almost cost me a client.

**Row-Level Security (RLS).**

## The "Smart" Decision

I was building a multi-tenant SaaS with the PERN stack:

- PostgreSQL (with Prisma ORM)
- Express.js
- React
- Node.js

To keep tenant data separate, I decided to use PostgreSQL RLS instead of filtering in application code.

"More secure," I thought. "The database will handle everything automatically."

I set up RLS like this:

\`\`\`sql
-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for projects
CREATE POLICY tenant_isolation ON projects
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Same for tasks and users...
\`\`\`

And in my Prisma middleware, I set the tenant context:

\`\`\`javascript
prisma.$use(async (params, next) => {
  const tenantId = getCurrentTenantId(); // From JWT
  await prisma.$executeRaw\`SET app.current_tenant_id = \${tenantId}\`;
  return next(params);
});
\`\`\`

Beautiful. Elegant. **Wrong.**

## The Disaster

One morning, users started reporting:

> "My projects are gone!"
> "I had 50 tasks yesterday, now I see nothing!"
> "Did someone delete my account?"

I checked the database directly:

\`\`\`sql
SELECT COUNT(*) FROM projects WHERE tenant_id = 'user-tenant-id';
-- Returns: 47 projects
\`\`\`

Then I checked the API:

\`\`\`bash
curl https://api.myapp.com/projects
# Response: []
\`\`\`

Empty array.

The data was there. The API was working. What happened?

## Debugging the Nightmare

I spent 4 hours checking:

- API routes
- Authentication middleware
- Prisma queries
- Database connections

Nothing.

Finally, I connected directly to PostgreSQL and ran the same query the API was using:

\`\`\`sql
SELECT * FROM projects;
-- Returns: 0 rows
\`\`\`

Wait, what?

I ran it again with a different user:

\`\`\`sql
SET app.current_tenant_id = 'some-tenant-id';
SELECT * FROM projects;
-- Returns: projects from THAT tenant only
\`\`\`

Then it hit me.

**The tenant ID wasn't being set correctly in the API.**

But I had middleware that set it on every request. How could it fail?

## The Real Bug

I found the issue in my authentication flow:

\`\`\`javascript
// My middleware (WRONG)
app.use(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    const decoded = jwt.verify(token, SECRET);
    req.tenantId = decoded.tenantId;
    
    // Set for Prisma
    await prisma.$executeRaw\`SET app.current_tenant_id = \${req.tenantId}\`;
  }
  next();
});
\`\`\`

The problem? **Prisma connection pooling.**

Prisma reuses database connections across multiple requests. When I set \`app.current_tenant_id\` on a connection, it persisted for the NEXT request too — but only if that request reused the same connection.

So:

- Request 1 (Tenant A) → Sets tenant_id = A → Works fine
- Request 2 (Tenant B) → Reuses same connection → tenant_id is STILL A → Sees NO data

Some users saw nothing. Others saw OTHER tenants' data.

**This was a security breach.**

## The Fix

I learned that PostgreSQL session variables are connection-scoped. With connection pooling, you MUST reset them every time.

The correct approach:

\`\`\`javascript
// Use a connection pool that resets state
const resetAndSetTenant = async (tenantId) => {
  // Reset any existing setting
  await prisma.$executeRaw\`RESET app.current_tenant_id\`;
  // Set new value
  await prisma.$executeRaw\`SET app.current_tenant_id = \${tenantId}\`;
};

// Then in middleware
app.use(async (req, res, next) => {
  const tenantId = extractTenantFromToken(req);
  await resetAndSetTenant(tenantId);
  next();
});
\`\`\`

But even better? **Don't use RLS with Prisma's default connection pool.**

I switched to a different pattern:

\`\`\`javascript
// Filter in application code instead
const getProjects = async (tenantId) => {
  return prisma.project.findMany({
    where: { tenantId: tenantId }
  });
};
\`\`\`

It's not as "elegant," but it's predictable. No connection state issues. No cross-tenant data leaks.

## What I Learned

### 1. RLS + Connection Pooling = Danger

PostgreSQL session variables don't automatically reset. If you use RLS, you need connection-level isolation or explicit reset on every request.

### 2. Test with Multiple Concurrent Users

My tests only used one user at a time. The bug only appeared under real load.

### 3. Security Features Can Create Security Holes

RLS is supposed to protect data. Improper implementation can expose it.

## The Audit

After fixing, I ran a security audit:

\`\`\`sql
-- Check if any user accessed wrong tenant data
SELECT 
  p.tenant_id as actual_tenant,
  u.email,
  a.action,
  a.timestamp
FROM audit_log a
JOIN projects p ON a.project_id = p.id
JOIN users u ON a.user_id = u.id
WHERE p.tenant_id != u.tenant_id;
\`\`\`

Thankfully, the bug only lasted 2 hours and only affected "view" operations. No data was modified across tenants.

But I had nightmares for a week.

## Better RLS Pattern (If You Must Use It)

\`\`\`javascript
// Create a dedicated pool for each tenant
const pools = new Map();

const getTenantPool = (tenantId) => {
  if (!pools.has(tenantId)) {
    pools.set(tenantId, new PrismaClient({
      datasources: { db: { url: getConnectionStringWithTenant(tenantId) } }
    }));
  }
  return pools.get(tenantId);
};

// Or use pgBouncer transaction pooling (not session pooling)
\`\`\`

## Commands That Help

### Check current RLS policies

\`\`\`sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies;
\`\`\`

### Temporarily disable RLS (emergency only!)

\`\`\`sql
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
-- Do what you need
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
\`\`\`

### View current session variables

\`\`\`sql
SELECT name, setting FROM pg_settings WHERE category LIKE 'Customized%';
\`\`\`

## Conclusion

PostgreSQL is incredible. RLS is powerful.

But with great power comes great responsibility — and great foot-guns.

Now I have a rule: **Never use session variables with connection pooling unless you fully understand the isolation model.**

And I always test with 10 concurrent users before deploying auth-related features.

That "elegant" RLS solution cost me 8 hours of debugging and one very angry client email.

Worth it? Never again.

  `,

    tags: ['postgresql', 'pern', 'rls', 'security', 'prisma'],

    seo: {
      metaTitle:
        'PostgreSQL Row-Level Security Disaster: How Connection Pooling Broke My PERN API',
      metaDescription:
        "RLS seemed perfect for multi-tenant PERN apps until users saw empty data or other tenants' records. Here's what went wrong and how to fix it.",
      keywords: [
        'postgresql rls',
        'pern stack security',
        'prisma connection pooling',
        'multi-tenant database',
        'rls disaster',
      ],
    },
  },
  {
    title: 'The Day PostgreSQL Row-Level Security Broke My API',
    slug: 'postgresql-rls-api-failure-pern-stack',
    category: 'PERN',
    excerpt:
      'Adding Row-Level Security to PostgreSQL seemed smart — until every API request started returning empty arrays and users thought their data was deleted.',
    status: 'published',

    content: `

# The Day PostgreSQL Row-Level Security Broke My API

I love PostgreSQL. It's powerful, reliable, and has features that MongoDB users can only dream about.

But one feature almost cost me a client.

**Row-Level Security (RLS).**

## The "Smart" Decision

I was building a multi-tenant SaaS with the PERN stack:

- PostgreSQL (with Prisma ORM)
- Express.js
- React
- Node.js

To keep tenant data separate, I decided to use PostgreSQL RLS instead of filtering in application code.

"More secure," I thought. "The database will handle everything automatically."

I set up RLS like this:

\`\`\`sql
-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for projects
CREATE POLICY tenant_isolation ON projects
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Same for tasks and users...
\`\`\`

And in my Prisma middleware, I set the tenant context:

\`\`\`javascript
prisma.$use(async (params, next) => {
  const tenantId = getCurrentTenantId(); // From JWT
  await prisma.$executeRaw\`SET app.current_tenant_id = \${tenantId}\`;
  return next(params);
});
\`\`\`

Beautiful. Elegant. **Wrong.**

## The Disaster

One morning, users started reporting:

> "My projects are gone!"
> "I had 50 tasks yesterday, now I see nothing!"
> "Did someone delete my account?"

I checked the database directly:

\`\`\`sql
SELECT COUNT(*) FROM projects WHERE tenant_id = 'user-tenant-id';
-- Returns: 47 projects
\`\`\`

Then I checked the API:

\`\`\`bash
curl https://api.myapp.com/projects
# Response: []
\`\`\`

Empty array.

The data was there. The API was working. What happened?

## Debugging the Nightmare

I spent 4 hours checking:

- API routes
- Authentication middleware
- Prisma queries
- Database connections

Nothing.

Finally, I connected directly to PostgreSQL and ran the same query the API was using:

\`\`\`sql
SELECT * FROM projects;
-- Returns: 0 rows
\`\`\`

Wait, what?

I ran it again with a different user:

\`\`\`sql
SET app.current_tenant_id = 'some-tenant-id';
SELECT * FROM projects;
-- Returns: projects from THAT tenant only
\`\`\`

Then it hit me.

**The tenant ID wasn't being set correctly in the API.**

But I had middleware that set it on every request. How could it fail?

## The Real Bug

I found the issue in my authentication flow:

\`\`\`javascript
// My middleware (WRONG)
app.use(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    const decoded = jwt.verify(token, SECRET);
    req.tenantId = decoded.tenantId;
    
    // Set for Prisma
    await prisma.$executeRaw\`SET app.current_tenant_id = \${req.tenantId}\`;
  }
  next();
});
\`\`\`

The problem? **Prisma connection pooling.**

Prisma reuses database connections across multiple requests. When I set \`app.current_tenant_id\` on a connection, it persisted for the NEXT request too — but only if that request reused the same connection.

So:

- Request 1 (Tenant A) → Sets tenant_id = A → Works fine
- Request 2 (Tenant B) → Reuses same connection → tenant_id is STILL A → Sees NO data

Some users saw nothing. Others saw OTHER tenants' data.

**This was a security breach.**

## The Fix

I learned that PostgreSQL session variables are connection-scoped. With connection pooling, you MUST reset them every time.

The correct approach:

\`\`\`javascript
// Use a connection pool that resets state
const resetAndSetTenant = async (tenantId) => {
  // Reset any existing setting
  await prisma.$executeRaw\`RESET app.current_tenant_id\`;
  // Set new value
  await prisma.$executeRaw\`SET app.current_tenant_id = \${tenantId}\`;
};

// Then in middleware
app.use(async (req, res, next) => {
  const tenantId = extractTenantFromToken(req);
  await resetAndSetTenant(tenantId);
  next();
});
\`\`\`

But even better? **Don't use RLS with Prisma's default connection pool.**

I switched to a different pattern:

\`\`\`javascript
// Filter in application code instead
const getProjects = async (tenantId) => {
  return prisma.project.findMany({
    where: { tenantId: tenantId }
  });
};
\`\`\`

It's not as "elegant," but it's predictable. No connection state issues. No cross-tenant data leaks.

## What I Learned

### 1. RLS + Connection Pooling = Danger

PostgreSQL session variables don't automatically reset. If you use RLS, you need connection-level isolation or explicit reset on every request.

### 2. Test with Multiple Concurrent Users

My tests only used one user at a time. The bug only appeared under real load.

### 3. Security Features Can Create Security Holes

RLS is supposed to protect data. Improper implementation can expose it.

## The Audit

After fixing, I ran a security audit:

\`\`\`sql
-- Check if any user accessed wrong tenant data
SELECT 
  p.tenant_id as actual_tenant,
  u.email,
  a.action,
  a.timestamp
FROM audit_log a
JOIN projects p ON a.project_id = p.id
JOIN users u ON a.user_id = u.id
WHERE p.tenant_id != u.tenant_id;
\`\`\`

Thankfully, the bug only lasted 2 hours and only affected "view" operations. No data was modified across tenants.

But I had nightmares for a week.

## Better RLS Pattern (If You Must Use It)

\`\`\`javascript
// Create a dedicated pool for each tenant
const pools = new Map();

const getTenantPool = (tenantId) => {
  if (!pools.has(tenantId)) {
    pools.set(tenantId, new PrismaClient({
      datasources: { db: { url: getConnectionStringWithTenant(tenantId) } }
    }));
  }
  return pools.get(tenantId);
};

// Or use pgBouncer transaction pooling (not session pooling)
\`\`\`

## Commands That Help

### Check current RLS policies

\`\`\`sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies;
\`\`\`

### Temporarily disable RLS (emergency only!)

\`\`\`sql
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
-- Do what you need
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
\`\`\`

### View current session variables

\`\`\`sql
SELECT name, setting FROM pg_settings WHERE category LIKE 'Customized%';
\`\`\`

## Conclusion

PostgreSQL is incredible. RLS is powerful.

But with great power comes great responsibility — and great foot-guns.

Now I have a rule: **Never use session variables with connection pooling unless you fully understand the isolation model.**

And I always test with 10 concurrent users before deploying auth-related features.

That "elegant" RLS solution cost me 8 hours of debugging and one very angry client email.

Worth it? Never again.

  `,

    tags: ['postgresql', 'pern', 'rls', 'security', 'prisma'],

    seo: {
      metaTitle:
        'PostgreSQL Row-Level Security Disaster: How Connection Pooling Broke My PERN API',
      metaDescription:
        "RLS seemed perfect for multi-tenant PERN apps until users saw empty data or other tenants' records. Here's what went wrong and how to fix it.",
      keywords: [
        'postgresql rls',
        'pern stack security',
        'prisma connection pooling',
        'multi-tenant database',
        'rls disaster',
      ],
    },
  },
  {
    title: 'The Day Next.js Middleware Destroyed My SEO',
    slug: 'nextjs-middleware-seo-disaster-redirect-loop',
    category: 'Next.js',
    excerpt:
      'A simple middleware to handle authentication created a redirect loop that got 15,000 pages de-indexed from Google in 48 hours.',
    status: 'published',

    content: `

# The Day Next.js Middleware Destroyed My SEO

Two months ago, I was feeling proud of myself.

I had built a beautiful Next.js 14 app with:

- App Router
- Server Components
- Middleware for auth
- Internationalization

Everything was fast. Everything worked.

Then my SEO rankings crashed.

## The Setup

My middleware looked like this:

\`\`\`typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isProtectedPage = !isAuthPage && request.nextUrl.pathname !== '/';

  // Redirect unauthenticated users to login
  if (isProtectedPage && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
\`\`\`

Seems reasonable, right?

## The Silent Killer

What I didn't realize: **Googlebot doesn't send cookies.**

When Googlebot crawled my site:

1. Request to \`/blog/awesome-post\`
2. Middleware sees \`token\` = undefined
3. Redirects to \`/login?from=/blog/awesome-post\`
4. Googlebot follows redirect
5. Login page (which I accidentally set to \`noindex\` for security)

Every. Single. Page.

**Every page redirected to a noindex login page.**

Google's crawler saw:

- 15,000 pages returning 302 redirects
- All redirects leading to a page with \`<meta name="robots" content="noindex">\`

Within 48 hours, Google started de-indexing everything.

## The Realization

I first noticed something was wrong when I searched \`site:mywebsite.com\`:

\`\`\`
No results found for site:mywebsite.com
\`\`\`

I almost had a heart attack.

Checking Google Search Console showed:

- Indexed pages: 3 (only the homepage, somehow)
- Crawl stats: 15,000 pages with "Redirect" status
- Coverage report: "Page with redirect" × 15,000

## The Fix

I learned that Next.js middleware runs on EVERY request — including from bots.

The correct approach: **Don't redirect bots.**

\`\`\`typescript
// FIXED middleware.ts
export function middleware(request: NextRequest) {
  // Detect Googlebot (and other crawlers)
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /bot|crawler|spider|googlebot|bingbot|slurp|duckduckbot/i.test(userAgent);
  
  const token = request.cookies.get('auth-token');
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isProtectedPage = !isAuthPage && request.nextUrl.pathname !== '/';

  // NEVER redirect bots
  if (isBot) {
    return NextResponse.next();
  }

  // Only redirect real users
  if (isProtectedPage && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}
\`\`\`

But wait — there's more.

## The Second Problem

Even after fixing the redirect, my pages weren't being re-indexed.

Google had already marked them as "soft 404" because they kept redirecting.

I had to:

### 1. Request re-crawling

\`\`\`bash
# Using Google Search Console API
curl -X POST "https://indexing.googleapis.com/v3/urlNotifications:publish" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://mywebsite.com/sitemap.xml",
    "type": "URL_UPDATED"
  }'
\`\`\`

### 2. Add proper status codes

\`\`\`typescript
// For bot requests, return 200 always
if (isBot) {
  const response = NextResponse.next();
  response.status = 200;
  return response;
}
\`\`\`

### 3. Implemented proper sitemap

\`\`\`typescript
// app/sitemap.ts
export default async function sitemap() {
  const baseUrl = 'https://mywebsite.com';
  
  // Fetch all public routes
  const posts = await getPublicPosts(); // Only returns non-auth-required posts
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...posts.map(post => ({
      url: \`{baseUrl}/blog/\{post.slug}\`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
  ];
}
\`\`\`

## The Recovery

It took 3 weeks for Google to re-index everything.

Traffic dropped by 85% in the first week.

Revenue? Down 60%.

All because I forgot that bots don't have cookies.

## What I Learned

### 1. Always Test with Bot User Agents

\`\`\`bash
# Simulate Googlebot
curl -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  https://mywebsite.com/blog/post
\`\`\`

### 2. Middleware Should Have Bot Exceptions

Unless you're building a fully private app, bots should see public content.

### 3. Use robots.txt for Auth Routes

\`\`\`text
# public/robots.txt
User-agent: *
Disallow: /login
Disallow: /dashboard
Disallow: /settings
Allow: /
\`\`\`

### 4. Monitor Search Console Daily

I check Google Search Console every morning now. It's the first sign of SEO problems.

## Better Middleware Pattern

Here's my production-ready middleware now:

\`\`\`typescript
import { NextResponse } from 'next/server';
import { isBot, isPublicPath, shouldRedirectToLogin } from './lib/seo';

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const botCheck = isBot(userAgent);
  const pathname = request.nextUrl.pathname;
  
  // Bots: Let them see everything (except explicit 404s)
  if (botCheck) {
    // But don't let them index auth pages
    if (pathname.startsWith('/login') || pathname.startsWith('/dashboard')) {
      const response = NextResponse.next();
      response.headers.set('X-Robots-Tag', 'noindex');
      return response;
    }
    return NextResponse.next();
  }
  
  // Humans: Apply auth logic
  const token = request.cookies.get('auth-token');
  
  if (shouldRedirectToLogin(pathname, !!token)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}
\`\`\`

## Commands to Monitor SEO Health

### Check for unwanted redirects

\`\`\`bash
# Using curl with follow redirects
curl -Ls -o /dev/null -w "%{url_effective}\n" https://mywebsite.com/blog/post
\`\`\`

### Check index status via Google API

\`\`\`bash
curl "https://indexing.googleapis.com/v3/urlNotifications/metadata?url=https://mywebsite.com/blog/post" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
\`\`\`

### Generate a sitemap index

\`\`\`bash
npx next-sitemap --config next-sitemap.config.js
\`\`\`

## Conclusion

Next.js middleware is powerful. But it runs in the edge runtime, on every request, including from bots.

Always ask: "What does Googlebot see?"

If the answer is "a redirect to login," you have a problem.

That mistake cost me 3 weeks of SEO recovery and $15,000 in lost revenue.

Now I have a checklist before deploying any middleware changes.

And I never forget that bots don't log in.

  `,

    tags: ['nextjs', 'seo', 'middleware', 'googlebot', 'redirect-loop'],

    seo: {
      metaTitle:
        'Next.js Middleware Destroyed My SEO: A 15,000 Page De-indexing Disaster',
      metaDescription:
        'How a simple auth middleware caused 15,000 pages to redirect to a noindex login page, killing SEO rankings for 3 weeks.',
      keywords: [
        'nextjs middleware seo',
        'googlebot redirect',
        'nextjs seo disaster',
        'auth middleware bots',
      ],
    },
  },
  {
    title: 'The Kubernetes Rollout That Almost Ruined Black Friday',
    slug: 'kubernetes-rollout-deployment-strategy-failed-black-friday',
    category: 'DevOps',
    excerpt:
      'A simple kubectl rollout restart on Black Friday caused a 47-minute outage and $340,000 in lost sales — all because of a missing readinessProbe.',
    status: 'published',

    content: `

# The Kubernetes Rollout That Almost Ruined Black Friday

Black Friday. 6:00 AM. I was on call.

Our e-commerce platform was doing $120,000 per hour. Everything was smooth.

Then I got a Slack message: "Can you update the coupon code service? New promo starts at 7 AM."

"No problem," I thought. "It's just a restart."

## The Change

The service was a simple Node.js app running on Kubernetes:

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: coupon-service
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 25%
  template:
    spec:
      containers:
      - name: coupon-service
        image: coupon-service:latest
        ports:
        - containerPort: 3000
        # NO readinessProbe
        # NO livenessProbe
\`\`\`

I ran:

\`\`\`bash
kubectl rollout restart deployment/coupon-service
\`\`\`

## The Cascade Failure

Here's what happened next:

**T+0 seconds**: Kubernetes started terminating old pods.

**T+30 seconds**: Old pods terminated. New pods started.

**T+45 seconds**: New pods were running — but not ready.

The Node.js app needed to:
1. Connect to Redis
2. Load coupon data from PostgreSQL
3. Warm up caches

This took 90 seconds total.

But Kubernetes didn't know that.

**T+60 seconds**: Kubernetes marked pods as "Running" (container started = ready).

Traffic started flowing to pods that weren't ready.

**T+75 seconds**: The first request hit an unprepared pod.

The pod crashed.

Kubernetes restarted it.

**T+90 seconds**: Crash loop began.

**T+120 seconds**: All 5 pods were crash-looping.

Zero healthy replicas.

## The Outage

The coupon service was a dependency for:

- Cart calculations
- Checkout flow
- Price displays

When it went down:

\`\`\`
Error: Coupon service unavailable
\`\`\`

Every cart, every checkout, every page trying to display a price.

The entire site degraded.

**47 minutes later**, I figured out what happened and fixed it.

Lost revenue: ~$340,000.

## Why It Happened

I didn't understand Kubernetes readiness probes.

A \`readinessProbe\` tells Kubernetes when a pod is actually ready to receive traffic.

Without it, Kubernetes assumes the pod is ready as soon as the container starts.

\`\`\`yaml
# WHAT I SHOULD HAVE HAD
readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  failureThreshold: 3
  successThreshold: 1
\`\`\`

My app had a \`/health/ready\` endpoint that returned 200 only when:
- Database connected
- Redis connected
- Caches warmed
- All dependencies healthy

But I never configured Kubernetes to use it.

## The Emergency Fix

While the site was down, I had to:

### 1. Stop the crash loop

\`\`\`bash
# Scale to zero
kubectl scale deployment/coupon-service --replicas=0

# Let everything settle
sleep 30

# Scale back up slowly
kubectl scale deployment/coupon-service --replicas=1
\`\`\`

### 2. Wait for manual health check

\`\`\`bash
# Monitor pod logs
kubectl logs -f deployment/coupon-service

# Check if it's actually ready
kubectl exec deployment/coupon-service -- curl localhost:3000/health/ready
\`\`\`

### 3. Add readiness probe without downtime

\`\`\`bash
# Edit deployment
kubectl edit deployment/coupon-service

# Add readinessProbe section
# Save and exit - Kubernetes rolls out new pods with probe
\`\`\`

## The Root Cause Analysis

After the crisis, I investigated why this happened.

**Problem 1**: No readiness probe → Traffic sent to unprepared pods

**Problem 2**: No startup probe → Slow-starting apps crash before ready

**Problem 3**: No podDisruptionBudget → All pods terminated at once

**Problem 4**: No circuit breakers → Downstream services kept trying

## The Correct Configuration

Here's what I implemented afterward:

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: coupon-service
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # Only 1 extra pod at a time
      maxUnavailable: 0  # Never go below desired replicas
  template:
    spec:
      containers:
      - name: coupon-service
        image: coupon-service:latest
        ports:
        - containerPort: 3000
        
        # STARTUP probe for slow-starting apps
        startupProbe:
          httpGet:
            path: /health/startup
            port: 3000
          initialDelaySeconds: 0
          periodSeconds: 5
          failureThreshold: 30  # Allow 150 seconds total
        
        # READINESS probe for traffic routing
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 0  # Startup probe handles initial delay
          periodSeconds: 5
          failureThreshold: 3
          successThreshold: 1
        
        # LIVENESS probe for crash detection
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 60
          periodSeconds: 30
          failureThreshold: 3
        
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: coupon-service-pdb
spec:
  minAvailable: 3
  selector:
    matchLabels:
      app: coupon-service
\`\`\`

## The Application Changes

I also fixed the app to handle signals properly:

\`\`\`javascript
// Graceful shutdown in Node.js
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, starting graceful shutdown');
  
  // Stop accepting new requests
  server.close(() => {
    console.log('HTTP server closed');
  });
  
  // Close database connections
  await db.disconnect();
  await redis.quit();
  
  console.log('Graceful shutdown complete');
  process.exit(0);
});

// Health endpoints
app.get('/health/startup', (req, res) => {
  // Returns 200 as soon as app starts
  res.send('ok');
});

app.get('/health/ready', async (req, res) => {
  const checks = await Promise.all([
    db.ping(),
    redis.ping(),
    cacheWarmed()
  ]);
  
  if (checks.every(c => c === true)) {
    res.send('ready');
  } else {
    res.status(503).send('not ready');
  }
});
\`\`\`

## What I Learned

### 1. Readiness Probes Are Not Optional

Every deployment needs proper probes. Every single one.

### 2. Test Rollouts in Staging With Real Traffic

\`\`\`bash
# Simulate rollout during load test
kubectl rollout restart deployment/coupon-service
# Watch for errors
kubectl get events --watch
\`\`\`

### 3. Use Progressive Rollouts

\`\`\`bash
# Don't restart all at once
kubectl rollout restart deployment/coupon-service \
  --dry-run=client -o yaml | \
  kubectl patch -f - --type='json' -p='[{"op": "replace", "path": "/spec/strategy/rollingUpdate/maxUnavailable", "value": 0}]'
\`\`\`

### 4. Implement PodDisruptionBudget

Always set minimum available replicas during voluntary disruptions.

## Commands for Safe Rollouts

### Check pod readiness

\`\`\`bash
# Wait for rollout to complete
kubectl rollout status deployment/coupon-service --timeout=5m

# Check readiness of each pod
kubectl get pods -l app=coupon-service -o json | \
  jq '.items[].status.conditions[] | select(.type=="Ready") | .status'
\`\`\`

### Simulate a rollout

\`\`\`bash
# Dry run
kubectl rollout restart deployment/coupon-service --dry-run=client

# Watch in real-time
kubectl get pods -l app=coupon-service -w
\`\`\`

### Rollback instantly

\`\`\`bash
# Undo the rollout
kubectl rollout undo deployment/coupon-service

# Check history
kubectl rollout history deployment/coupon-service
\`\`\`

## Conclusion

That Black Friday cost me weeks of sleepless nights.

The company kept me, but I was written up.

Now I have a pre-rollout checklist:

- [ ] Readiness probe configured
- [ ] Liveness probe configured
- [ ] Startup probe configured (for slow apps)
- [ ] PodDisruptionBudget exists
- [ ] RollingUpdate strategy has maxUnavailable=0
- [ ] Graceful shutdown implemented
- [ ] Load tested in staging

Kubernetes gives you powerful tools. But missing one YAML field can cost millions.

Never roll out without probes. Never.

  `,

    tags: ['kubernetes', 'devops', 'black-friday', 'readiness-probe', 'outage'],

    seo: {
      metaTitle:
        'Kubernetes Readiness Probe Failure: How a Simple Restart Cost $340,000 on Black Friday',
      metaDescription:
        "A missing readinessProbe caused a 47-minute outage during Black Friday. Here's what went wrong and how to prevent Kubernetes deployment disasters.",
      keywords: [
        'kubernetes readiness probe',
        'kubectl rollout restart',
        'kubernetes outage',
        'black friday outage',
        'devops disaster',
      ],
    },
  },
  {
    title: 'The Expo OTA Update That Broke Offline Mode for 10,000 Users',
    slug: 'expo-ota-update-broke-offline-mode-asyncstorage',
    category: 'Expo',
    excerpt:
      'An innocent OTA update changed how AsyncStorage worked, causing 10,000 offline users to lose their data and making the app crash on launch.',
    status: 'published',

    content: `

# The Expo OTA Update That Broke Offline Mode for 10,000 Users

I love Expo's Over-the-Air (OTA) updates. No App Store review. Instant fixes. Happy users.

Until the day OTA updates became my nightmare.

## The App

We built a field service app with Expo:

- Technicians working in remote areas (no internet)
- Offline-first with Expo's AsyncStorage
- Sync when connection returns
- 15,000 daily active users

The app worked beautifully offline. Technicians could:
- View assigned jobs
- Log work hours
- Upload photos (stored locally, synced later)

## The "Innocent" Update

I needed to add a new feature: job notes with rich text.

Simple change, right?

I updated the data schema:

\`\`\`javascript
// BEFORE
const job = {
  id: '123',
  title: 'Fix AC',
  status: 'pending'
};

// AFTER
const job = {
  id: '123',
  title: 'Fix AC',
  status: 'pending',
  notes: {
    text: '',
    richText: '',
    attachments: []
  }
};
\`\`\`

I updated the AsyncStorage read/write functions:

\`\`\`javascript
// BEFORE
export const saveJob = async (job) => {
  const jobs = await getJobs();
  const index = jobs.findIndex(j => j.id === job.id);
  if (index >= 0) jobs[index] = job;
  else jobs.push(job);
  await AsyncStorage.setItem('jobs', JSON.stringify(jobs));
};

// AFTER - with migration
export const saveJob = async (job) => {
  const jobs = await getJobs();
  
  // Ensure job has notes field
  if (!job.notes) {
    job.notes = { text: '', richText: '', attachments: [] };
  }
  
  const index = jobs.findIndex(j => j.id === job.id);
  if (index >= 0) jobs[index] = job;
  else jobs.push(job);
  await AsyncStorage.setItem('jobs', JSON.stringify(jobs));
};
\`\`\`

I tested on my device. Worked perfectly.

Published OTA update.

## The Disaster

Two hours later, my phone started blowing up.

Support tickets: "App crashes on open!"

I checked Sentry:

\`\`\`
TypeError: Cannot read property 'text' of undefined
  at JobCard.js:47
  at renderJobNotes
\`\`\`

The crash was happening in the UI:

\`\`\`javascript
// JobCard.js - LINE 47
<Text>{job.notes.text}</Text> // notes is undefined for old jobs!
\`\`\`

**I forgot: OTA updates don't run migrations on existing data.**

Users who opened the app after the update:

1. App loads
2. Reads existing jobs from AsyncStorage (old schema, no \`notes\` field)
3. Tries to render \`job.notes.text\`
4. Crashes

The worst part? Users in offline mode couldn't even reinstall because:
- They were in remote areas with no internet
- The app crashed immediately on launch
- No way to clear storage without reinstalling

**10,000 offline technicians couldn't do their jobs.**

## The Emergency Response

I had to fix this without a native build (App Store review would take days).

### Step 1: Release a crash-fix OTA

\`\`\`javascript
// FIX - Safely access notes
const JobCard = ({ job }) => {
  // Safe navigation
  const notesText = job?.notes?.text || '';
  
  return (
    <View>
      <Text>{notesText}</Text>
    </View>
  );
};
\`\`\`

Published OTA in 5 minutes.

But users who were already crashing couldn't receive the OTA — because the app crashed before checking for updates.

### Step 2: Create a recovery build

I had to release a native update with crash recovery:

\`\`\`javascript
// App.js - Error boundary with cache clearing
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('App crashed:', error);
    
    // Check if it's a data-related crash
    if (error.message.includes('Cannot read property')) {
      // Clear corrupted data
      this.clearAndReload();
    }
  }
  
  clearAndReload = async () => {
    // Clear AsyncStorage
    await AsyncStorage.clear();
    
    // Reset app state
    if (Updates.releaseChannel === 'production') {
      await Updates.reloadAsync();
    }
  };
}
\`\`\`

But native updates take 24-48 hours for App Store review.

### Step 3: Manual recovery instructions

I had to post on our support portal:

> **Emergency Fix for Field Technicians:**
> 1. Go to Settings → Apps → Our App
> 2. Tap "Clear Storage" or "Clear Data"
> 3. Reopen the app
> 4. Wait for OTA update to download (needs internet)

But technicians in remote areas couldn't do this.

## The Aftermath

- 8 hours of downtime for offline users
- 2,300 support tickets
- 47% of field workers couldn't complete their jobs that day
- Lost revenue: ~$80,000 in billable hours
- 3 technicians quit because of the frustration

All because of one missing optional chain operator.

## What I Learned

### 1. OTA Updates Don't Migrate Data

Expo OTA updates replace JavaScript bundles. They don't run database migrations.

Always assume existing data has the old schema.

### 2. Use Optional Chaining Everywhere

\`\`\`javascript
// BAD
job.notes.text

// GOOD
job?.notes?.text ?? ''
\`\`\`

### 3. Version Your AsyncStorage Keys

\`\`\`javascript
const STORAGE_VERSION = 'v2';
const JOBS_KEY = \`jobs_\${STORAGE_VERSION}\`;

// On app start, migrate from old version
const migrateStorage = async () => {
  const oldJobs = await AsyncStorage.getItem('jobs');
  if (oldJobs) {
    const migrated = migrateJobs(JSON.parse(oldJobs));
    await AsyncStorage.setItem(JOBS_KEY, JSON.stringify(migrated));
    await AsyncStorage.removeItem('jobs');
  }
};
\`\`\`

### 4. Implement Schema Validation

\`\`\`javascript
import Joi from 'joi';

const jobSchema = Joi.object({
  id: Joi.string().required(),
  title: Joi.string().required(),
  status: Joi.string().valid('pending', 'completed').required(),
  notes: Joi.object({
    text: Joi.string().allow(''),
    richText: Joi.string().allow(''),
    attachments: Joi.array().items(Joi.string())
  }).default({ text: '', richText: '', attachments: [] })
});

const validateJob = (job) => {
  const { error, value } = jobSchema.validate(job);
  if (error) {
    console.warn('Invalid job data:', error);
    return jobSchema.default(); // Return default
  }
  return value;
};
\`\`\`

## The Production Fix

Here's my production-ready AsyncStorage wrapper now:

\`\`\`javascript
class SecureStorage {
  constructor(version = 1) {
    this.version = version;
    this.prefix = \`app_v\${version}\`;
  }
  
  async getItem(key, defaultValue = null) {
    try {
      const fullKey = \`\${this.prefix}_\${key}\`;
      const value = await AsyncStorage.getItem(fullKey);
      
      if (!value) return defaultValue;
      
      const parsed = JSON.parse(value);
      
      // Validate schema before returning
      return this.validate(key, parsed) ?? defaultValue;
    } catch (error) {
      console.error(\`Storage error for key \${key}:\`, error);
      return defaultValue;
    }
  }
  
  async setItem(key, value) {
    const validated = this.validate(key, value);
    if (!validated) throw new Error(\`Invalid data for key \${key}\`);
    
    const fullKey = \`\${this.prefix}_\${key}\`;
    await AsyncStorage.setItem(fullKey, JSON.stringify(validated));
  }
  
  async migrateFromOldVersion(oldVersion) {
    const oldStorage = new SecureStorage(oldVersion);
    const keys = ['jobs', 'user', 'settings'];
    
    for (const key of keys) {
      const oldData = await oldStorage.getItem(key);
      if (oldData) {
        await this.setItem(key, oldData);
        await oldStorage.clearItem(key);
      }
    }
  }
}
\`\`\`

## Expo OTA Safety Checklist

Before every OTA update:

- [ ] Does it change data structure?
- [ ] Are there fallbacks for missing fields?
- [ ] Does the app crash if data is old?
- [ ] Have I tested with REAL production data?
- [ ] Is there an error boundary to catch crashes?
- [ ] Can users clear storage without internet?

## Commands for Safe OTA Updates

### Test with old data

\`\`\`bash
# Simulate old app version
expo start --clear --no-dev

# Load production data
npx expo export --dump-asset
\`\`\`

### Rollback OTA

\`\`\`bash
# Publish previous version
expo publish --release-channel production --target-version 1.2.5

# Or use EAS Update rollback
eas update:rollback --channel production --version 1.2.6
\`\`\`

### Monitor crashes after OTA

\`\`\`bash
# Check Sentry for new issues
sentry-cli events list --org=myorg --project=myapp --query="is:unresolved"
\`\`\`

## Conclusion

Expo OTA updates are amazing — until they break offline users who can't receive fixes.

Now I have a golden rule: **Never change data structure without migration logic AND backward compatibility.**

And always, ALWAYS use optional chaining.

That day, 10,000 technicians learned to hate my app.

I learned to respect schema versioning.

  `,

    tags: [
      'expo',
      'react-native',
      'ota-updates',
      'asyncstorage',
      'offline-first',
    ],

    seo: {
      metaTitle:
        'Expo OTA Update Disaster: How AsyncStorage Migration Broke Offline Mode for 10,000 Users',
      metaDescription:
        "An OTA update that changed data schema caused crashes for offline Expo users. Here's how to safely migrate AsyncStorage without breaking production.",
      keywords: [
        'expo ota update',
        'asyncstorage migration',
        'react native offline',
        'expo crash recovery',
        'ota update disaster',
      ],
    },
  },
  {
    title: 'The Next.js Server Action That Leaked User Emails to Google',
    slug: 'nextjs-server-action-leaked-user-emails',
    category: 'Next.js',
    excerpt:
      'A Server Action that fetched user profiles returned HTML with email addresses in the response, and Google indexed them all within hours.',
    status: 'published',

    content: `

# The Next.js Server Action That Leaked User Emails

Server Actions in Next.js 14 are magical. Write a function, call it from a form, no API routes needed.

But that magic almost got us sued.

## The Setup

I built a user directory page:

\`\`\`typescript
// app/users/page.tsx
import { getUsers } from './actions';

export default async function UsersPage() {
  const users = await getUsers();
  
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <h3>{user.name}</h3>
          <p>{user.bio}</p>
          {/* Email NOT displayed - private */}
        </div>
      ))}
    </div>
  );
}
\`\`\`

And a Server Action to search users:

\`\`\`typescript
// app/users/actions.ts
'use server';

export async function searchUsers(formData: FormData) {
  const query = formData.get('query');
  
  const users = await db.user.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { email: { contains: query } } // ← PROBLEM
      ]
    },
    select: {
      id: true,
      name: true,
      bio: true,
      email: true  // ← SELECTED, but not displayed
    }
  });
  
  // Return to client - email is included!
  return { users };
}
\`\`\`

## The Leak

Here's what I didn't understand: **Server Actions return data to the client, even if you don't display it.**

The search form:

\`\`\`tsx
// Search component
'use client';

export function SearchBar() {
  const [results, setResults] = useState([]);
  
  async function handleSearch(formData: FormData) {
    const data = await searchUsers(formData);
    setResults(data.users); // users have email property!
  }
  
  return (
    <form action={handleSearch}>
      <input name="query" />
      <button>Search</button>
    </form>
  );
}
\`\`\`

The email field was in the JavaScript bundle. In the network response. In the React component state.

Any user could:

1. Open DevTools
2. Search for a name
3. Inspect the network response
4. See everyone's email addresses

But worse — Googlebot started crawling the search endpoint.

## The Indexing Nightmare

Because the search was a GET request (I used \`method="GET"\`), Googlebot found URLs like:

\`\`\`
/users?query=a
/users?query=b
/users?query=john
\`\`\`

And indexed the responses.

Each response contained:
- User names
- User bios
- **User emails**

Within 24 hours, searching for \`"user@example.com" site:myapp.com\` on Google showed our internal user emails.

## The Discovery

A user emailed me:

> "Why can I see everyone's email address in the network tab when I search?"

My heart stopped.

I checked the network response:

\`\`\`json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@gmail.com",  // EXPOSED
      "bio": "Software engineer"
    }
  ]
}
\`\`\`

## The Fix

### 1. Remove email from Server Action return

\`\`\`typescript
// FIXED - Don't return email
export async function searchUsers(formData: FormData) {
  const users = await db.user.findMany({
    where: { name: { contains: query } },
    select: {
      id: true,
      name: true,
      bio: true
      // email removed from select
    }
  });
  
  return { users };
}
\`\`\`

### 2. Use POST instead of GET for searches

\`\`\`tsx
<form action={handleSearch} method="POST">
  {/* Googlebot won't crawl POST endpoints */}
</form>
\`\`\`

### 3. Add robots.txt to block search endpoints

\`\`\`text
User-agent: *
Disallow: /users?*
Disallow: /api/search*
\`\`\`

### 4. Request Google removal

\`\`\`bash
# Using Google Search Console API
curl -X POST "https://indexing.googleapis.com/v3/urlNotifications:remove" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"url": "https://myapp.com/users?query=*"}'
\`\`\`

## The Deeper Problem

I realized the issue was bigger: **Server Actions return the entire response to the client.**

Even if you don't display sensitive data, it's still in the network payload.

The fix: Create a DTO (Data Transfer Object):

\`\`\`typescript
// Create a public user type
type PublicUser = {
  id: number;
  name: string;
  bio: string;
  // No email
};

export async function searchUsers(formData: FormData): Promise<{ users: PublicUser[] }> {
  const dbUsers = await db.user.findMany({
    where: { name: { contains: query } },
    select: {
      id: true,
      name: true,
      bio: true,
      email: true  // Still needed for internal logic?
    }
  });
  
  // Transform before returning
  return {
    users: dbUsers.map(({ id, name, bio }) => ({
      id, name, bio
    }))
  };
}
\`\`\`

## What I Learned

### 1. Never Trust Client-Side Rendering for Security

Just because you don't display data doesn't mean it's not exposed.

### 2. Server Actions Return Everything

The return value of a Server Action is sent to the client in full.

### 3. Use POST for State-Changing Operations

GET requests are crawled. POST requests are not.

### 4. Implement Data Filtering at the Boundary

Create public DTOs for any data leaving the server.

## Security Checklist for Server Actions

- [ ] Does the action return only necessary fields?
- [ ] Are sensitive fields explicitly excluded?
- [ ] Is the action using POST (not GET)?
- [ ] Are there rate limits on the action?
- [ ] Is the action authenticated/authorized?
- [ ] Have I inspected the network response?

## Commands to Audit Server Actions

### Check for exposed fields

\`\`\`bash
# Grep for 'select' in actions
grep -r "select:" app/**/actions.ts

# Look for returning entire objects
grep -r "return.*user" app/**/actions.ts
\`\`\`

### Test with browser DevTools

\`\`\`javascript
// In browser console
// Intercept Server Action responses
const origFetch = window.fetch;
window.fetch = function(...args) {
  if (args[0].includes('/actions')) {
    console.log('Server Action:', args);
  }
  return origFetch.apply(this, args);
};
\`\`\`

### Monitor Google indexing

\`\`\`bash
# Check if pages are indexed
curl -A "Googlebot" https://myapp.com/users?query=test
\`\`\`

## Conclusion

Next.js Server Actions are convenient. But convenience can hide security risks.

That day taught me: **What happens on the server stays on the server — unless you return it to the client.**

Now every Server Action has a corresponding DTO type that explicitly excludes sensitive fields.

And I never use GET for actions that return user data.

  `,

    tags: ['nextjs', 'server-actions', 'security', 'data-leak', 'google-index'],

    seo: {
      metaTitle:
        'Next.js Server Action Data Leak: How User Emails Got Indexed by Google',
      metaDescription:
        "A Server Action returned email addresses to the client, and Google indexed them all. Here's how to secure your Server Actions.",
      keywords: [
        'nextjs server actions security',
        'server action data leak',
        'nextjs seo disaster',
        'server action best practices',
      ],
    },
  },
  {
    title: 'The 2.3GB Docker Image That Killed Our Deploys',
    slug: 'docker-image-size-node_modules-multistage-build',
    category: 'DevOps',
    excerpt:
      'A Node.js Docker image grew to 2.3GB, causing 25-minute deploys and $500/day in extra costs — until we discovered multi-stage builds.',
    status: 'published',

    content: `

# The 2.3GB Docker Image That Killed Our Deploys

"Deploying..."

That word started giving me anxiety.

Every deploy took 25 minutes. Our CI/CD pipeline was clogged. Developers waited hours for their changes to reach production.

The culprit? A Docker image that weighed **2.3 gigabytes**.

## How We Got Here

Our Dockerfile was "simple":

\`\`\`dockerfile
# THE HORROR DOCKERFILE
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
\`\`\`

Seems fine, right?

Here's what was actually happening:

### Layer 1: Node base image
\`\`\`
node:18-slim: 250MB
\`\`\`

### Layer 2: npm ci
\`\`\`
node_modules: 800MB
\`\`\`

### Layer 3: Copy source code
\`\`\`
Source + build artifacts: 50MB
\`\`\`

### Layer 4: Build output
\`\`\`
.next/ (Next.js build): 200MB
dist/ (TypeScript output): 100MB
\`\`\`

### Total: ~1.4GB

Wait, I said 2.3GB earlier. Where did the extra 900MB come from?

**Cached layers.**

Each time we rebuilt, Docker added new layers instead of replacing them.

After 10 builds: 2.3GB.

## The Impact

### Storage Costs

We were running 20 microservices.

Each service had 5 versions stored in ECR.

\`\`\`
2.3GB × 20 services × 5 versions = 230GB
ECR cost: 230GB × $0.10/GB/month = $23/month
\`\`\`

Not terrible, actually.

### The Real Cost: Time

25 minutes per deploy × 50 deploys/day = 20.8 hours of waiting daily

Developer time cost: 20.8 hours × $100/hour = $2,080/day

**$500,000/year** in wasted productivity.

## The Analysis

I used \`docker history\` to see what was taking space:

\`\`\`bash
docker history myapp:latest

IMAGE          CREATED      SIZE
a1b2c3d4       2 hours ago  523MB   # Build output
e5f6g7h8       2 hours ago  812MB   # npm ci (dev dependencies)
i9j0k1l2       3 hours ago  250MB   # Node base
m3n4o5p6       3 hours ago  0B      # WORKDIR
\`\`\`

The problem: **Development dependencies and build tools in production.**

- \`webpack\`, \`typescript\`, \`@types/*\`: 400MB
- \`eslint\`, \`prettier\`, \`jest\`: 150MB
- Source maps: 200MB
- Duplicate dependencies: 150MB

## The Solution: Multi-Stage Builds

\`\`\`dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies (including dev)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS runner

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.next ./.next  # For Next.js

# Copy necessary configs
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["node", "dist/index.js"]
\`\`\`

## The Results

### New Image Size: 180MB

\`\`\`
From 2.3GB to 180MB = 92% reduction
\`\`\`

### Deploy Time: 25 minutes → 90 seconds

\`\`\`
Pull time: 2.3GB @ 100Mbps = 3 minutes
Pull time: 180MB @ 100Mbps = 14 seconds
\`\`\`

### Storage Cost: $23/month → $1.80/month

## Even Better: Alpine + Distroless

We pushed further:

\`\`\`dockerfile
# Stage 1: Build (using slim instead of alpine for better compatibility)
FROM node:18-slim AS builder

RUN apt-get update && apt-get install -y python3 make g++

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production distroless
FROM gcr.io/distroless/nodejs18-debian11

WORKDIR /app

# Copy production dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

USER nonroot

EXPOSE 3000

CMD ["dist/index.js"]
\`\`\`

**Final size: 95MB**

## Optimization Techniques

### 1. Layer Caching

\`\`\`dockerfile
# Bad: Cache invalidated when ANY file changes
COPY . .
RUN npm ci

# Good: Package.json changes rarely
COPY package*.json ./
RUN npm ci  # Cached unless package.json changes

COPY . .
\`\`\`

### 2. .dockerignore

\`\`\`text
.git
node_modules
npm-debug.log
.env
.DS_Store
coverage
.nyc_output
*.log
\`\`\`

### 3. Combine RUN commands

\`\`\`dockerfile
# Bad: Multiple layers
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get clean

# Good: Single layer
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
\`\`\`

### 4. Use --link for faster builds (BuildKit)

\`\`\`bash
DOCKER_BUILDKIT=1 docker build --link --tag myapp .
\`\`\`

## The Monitoring Setup

We started tracking image sizes:

\`\`\`bash
#!/bin/bash
# measure-image-size.sh

IMAGE_SIZE=$(docker inspect myapp:latest --format='{{.Size}}' | numfmt --to=iec)
echo "Image size: $IMAGE_SIZE"

# Alert if > 500MB
if [ $(docker inspect myapp:latest --format='{{.Size}}') -gt 524288000 ]; then
  echo "WARNING: Image size exceeded 500MB"
  # Send to Slack
  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"🚨 Docker image size is {IMAGE_SIZE}\"}" \
    $SLACK_WEBHOOK
fi
\`\`\`

## The Ultimate Dockerfile Template

Here's what we use for all Node.js services now:

\`\`\`dockerfile
# syntax=docker/dockerfile:1.4
FROM node:18-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /build

# Install dependencies
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --cache=/root/.npm

# Build
COPY . .
RUN npm run build
RUN npm prune --production

# Production
FROM node:18-alpine

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

COPY --from=builder --chown=nodejs:nodejs /build/package.json ./
COPY --from=builder --chown=nodejs:nodejs /build/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /build/dist ./dist

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/index.js"]
\`\`\`

## Commands for Docker Image Optimization

### Analyze image size

\`\`\`bash
# See layer sizes
docker history myapp:latest

# Detailed analysis with dive
dive myapp:latest

# Export and analyze
docker save myapp:latest | tar tvz | sort -k3 -n
\`\`\`

### Clean up unused images

\`\`\`bash
# Remove dangling images
docker image prune

# Remove all unused images
docker image prune -a

# Show space usage
docker system df
\`\`\`

### Build with optimizations

\`\`\`bash
# Enable BuildKit
export DOCKER_BUILDKIT=1

# Build with compression
docker build --compress --tag myapp .

# Squash layers (experimental)
docker build --squash --tag myapp .
\`\`\`

## What I Learned

### 1. Base Images Matter

- \`node:18\`: 1.1GB
- \`node:18-slim\`: 250MB
- \`node:18-alpine\`: 170MB
- \`distroless/nodejs\`: 80MB

### 2. Multi-Stage Builds Are Non-Negotiable

Always separate build environment from runtime.

### 3. Production Doesn't Need Dev Tools

\`npm ci --only=production\` is your friend.

### 4. Monitor Image Growth

Set alerts when images exceed thresholds.

## The Happy Ending

After implementing multi-stage builds across all services:

- Average image size: 2.1GB → 120MB (94% reduction)
- Average deploy time: 25 min → 2 min
- CI/CD pipeline: From 3 hours to 15 minutes
- Developer satisfaction: "Deploys don't make me want to quit anymore"

That 2.3GB Docker image cost us 6 months of developer productivity.

Now we have a "No image over 500MB" rule enforced in CI.

And I finally sleep through deployments.

  `,

    tags: ['docker', 'devops', 'image-size', 'multistage-build', 'performance'],

    seo: {
      metaTitle:
        'From 2.3GB to 95MB: How Multi-Stage Docker Builds Saved Our Deploys',
      metaDescription:
        "A 2.3GB Docker image caused 25-minute deploys and $500k/year in wasted time. Here's how multi-stage builds and distroless images fixed everything.",
      keywords: [
        'docker image size',
        'multistage build',
        'docker optimize',
        'node docker best practices',
        'docker distroless',
      ],
    },
  },
  {
    title: 'The Push Notification That Woke Up 50,000 Users at 3 AM',
    slug: 'expo-push-notification-production-disaster',
    category: 'Expo',
    excerpt:
      'A misconfigured cron job sent "Good morning!" notifications at 3 AM to 50,000 users. The uninstall rate went up 800% in 24 hours.',
    status: 'published',

    content: `

# The Push Notification That Woke Up 50,000 Users at 3 AM

3:00 AM. My phone buzzes.

Then again.

Then again.

Then 50,000 times.

I had just deployed a "good morning" notification feature to our Expo app.

The only problem? My cron job was set to UTC, not local time.

## The Feature

We built a wellness app with daily reminders:

- Morning motivation quotes
- Water drinking reminders
- Step goal achievements

The code was simple:

\`\`\`javascript
// Notification service
const sendMorningNotification = async () => {
  const users = await getUserTimezones();
  
  for (const user of users) {
    const localHour = getLocalHour(user.timezone);
    
    // Send at 8 AM local time
    if (localHour === 8) {
      await sendPushNotification(user.expoPushToken, {
        title: "Good morning! 🌅",
        body: "Ready to make today great?",
        data: { screen: "Dashboard" },
        sound: "default"
      });
    }
  }
};
\`\`\`

And the cron job:

\`\`\`bash
# WRONG - Runs at 8 AM UTC (3 AM EST)
0 8 * * * node send-morning-notifications.js
\`\`\`

## The Disaster

At 8:00 UTC (3:00 AM EST for New York users):

\`\`\`
[BATCH 1] Sending to 12,347 users in EST
[BATCH 2] Sending to 8,234 users in CST  
[BATCH 3] Sending to 9,876 users in MST
[BATCH 4] Sending to 7,654 users in PST
\`\`\`

50,000 users total.

Every single one got a "Good morning!" notification at 3 AM.

I realized the mistake when my own phone buzzed.

3:00 AM. Dark room. "Good morning! 🌅"

I sat up in bed, heart pounding.

## The Fallout

### Immediate Impact (3:00 AM - 8:00 AM)

Support tickets: 2,847 in 2 hours

App Store reviews:

> ⭐ "Woke up my baby. Uninstalled."
> ⭐ "Great app but 3 AM notifications? No."
> ⭐⭐ "Who does this? Bye."

### The Metrics

- **Uninstall rate:** 2% → 18% (900% increase)
- **App rating:** 4.8 → 3.2 (dropped in 12 hours)
- **Push opt-out rate:** 5% → 47%
- **Active users (next day):** -32%

## The Emergency Response

### 1. Stop the Cron Job

\`\`\`bash
# Immediately
crontab -e
# Comment out the line
# 0 8 * * * node send-morning-notifications.js

# Kill any running processes
pkill -f send-morning-notifications
\`\`\`

### 2. Send Apology Notifications

\`\`\`javascript
// Apology notification
const sendApology = async (users) => {
  // Only to users who received 3AM notification
  const affectedUsers = await getNotificationRecipients({
    from: '2024-01-15 08:00:00',
    to: '2024-01-15 08:05:00',
    title: 'Good morning!'
  });
  
  for (const user of affectedUsers) {
    await sendPushNotification(user.token, {
      title: "Our sincere apologies 🙏",
      body: "That 3AM notification was a bug. We're sorry! Here's a free week: GOODMORNING",
      data: { screen: "RedeemCode", code: "GOODMORNING" },
      sound: null // SILENT
    });
  }
};
\`\`\`

### 3. Post on Social Media

> We messed up. A notification intended for 8 AM went out at 3 AM due to a timezone bug. We're deeply sorry. Here's what happened and how we're fixing it. [Link to incident report]

## The Long-Term Fix

### 1. Timezone-Aware Scheduling

\`\`\`javascript
// Use a proper job queue with timezone support
import bull from 'bull';

const morningQueue = new bull('morning-notifications', {
  redis: { host: 'localhost', port: 6379 }
});

// Schedule per timezone
const scheduleForTimezone = async (timezone, hour = 8) => {
  const now = new Date();
  const targetTime = getTargetTimeInUTC(timezone, hour);
  
  if (targetTime > now) {
    await morningQueue.add(
      { timezone, hour },
      { 
        delay: targetTime.getTime() - now.getTime(),
        jobId: \`morning_\${timezone}\`
      }
    );
  }
};

const getTargetTimeInUTC = (timezone, hour) => {
  // Convert 8 AM in timezone to UTC
  const localTime = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false
  });
  
  // Complex logic to calculate UTC time
  // Using libraries like 'moment-timezone' is better
  return moment.tz(timezone).set({ hour, minute: 0, second: 0 }).toDate();
};
\`\`\`

### 2. Rate Limiting Notifications

\`\`\`javascript
// Don't send more than X notifications per hour
import rateLimit from 'express-rate-limit';

const notificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1, // 1 notification per user per hour
  keyGenerator: (req) => req.body.userId,
  handler: (req, res) => {
    console.log(\`Rate limit hit for user \${req.body.userId}\`);
    res.status(429).json({ error: 'Too many notifications' });
  }
});
\`\`\`

### 3. Quiet Hours Respect

\`\`\`javascript
const shouldSendNotification = (user, now) => {
  const userHour = getLocalHour(user.timezone, now);
  
  // Don't send between 10 PM and 7 AM
  if (userHour >= 22 || userHour < 7) {
    console.log(\`Quiet hours: \${userHour}:00, skipping\`);
    return false;
  }
  
  // Respect user's notification preferences
  if (user.notificationSettings.morning !== true) {
    return false;
  }
  
  return true;
};
\`\`\`

### 4. Canary Releases for Notifications

\`\`\`javascript
// Send to 1% of users first
const canarySend = async (notification, percentage = 1) => {
  const users = await getTargetUsers();
  const canaryUsers = users.slice(0, Math.floor(users.length * (percentage / 100)));
  
  const results = await sendBatch(canaryUsers, notification);
  
  // Monitor for complaints
  const complaintRate = await getComplaintRate(results);
  
  if (complaintRate < 0.01) { // Less than 1% complaints
    // Send to everyone else
    const remainingUsers = users.slice(canaryUsers.length);
    await sendBatch(remainingUsers, notification);
  } else {
    console.error(\`High complaint rate: \${complaintRate}%, aborting\`);
    await sendApology(canaryUsers);
  }
};
\`\`\`

## The Recovery

### Day 1: Chaos

- Uninstall rate peaked at 18%
- App store rating dropped to 3.2
- Social media angry

### Day 2: Apology sent

- Uninstall rate dropped to 8%
- Rating started recovering (3.5)
- Some users accepted apology

### Week 1: Feature improvements

- Added quiet hours setting
- User can choose preferred notification time
- "Test notification" button for users

### Month 1: Full recovery

- Uninstall rate back to 2.5%
- Rating recovered to 4.6
- Lost users: ~15,000 (never returned)

## The Lessons

### 1. Timezone Math Is Hard

Always use libraries like \`moment-timezone\` or \`date-fns-tz\`. Never roll your own.

### 2. Test at All Hours

\`\`\`javascript
// Test with different system times
const testTimes = [3, 8, 14, 22]; // 3 AM, 8 AM, 2 PM, 10 PM

for (const hour of testTimes) {
  // Mock system time
  jest.setSystemTime(new Date(2024, 0, 1, hour, 0, 0));
  await sendMorningNotification();
  // Verify behavior
}
\`\`\`

### 3. Rate Limit Everything

Even "good" notifications can be bad at the wrong time.

### 4. Always Have a Kill Switch

\`\`\`javascript
// Feature flag
const morningNotificationsEnabled = await redis.get('feature:morning-notifications');

if (morningNotificationsEnabled !== 'false') {
  await sendMorningNotification();
}
\`\`\`

## Expo Push Notification Best Practices

\`\`\`javascript
// Complete notification service
class NotificationService {
  constructor() {
    this.channels = {
      morning: {
        id: 'morning',
        name: 'Morning reminders',
        importance: 'high',
        sound: 'morning.caf'
      },
      quiet: {
        id: 'quiet',
        name: 'Quiet notifications',
        importance: 'low',
        sound: null
      }
    };
  }
  
  async sendMorningNotification(user) {
    // Check if user exists
    if (!user.expoPushToken) return;
    
    // Check quiet hours
    if (this.isQuietHour(user.timezone)) {
      // Queue for next morning
      await this.queueMorningNotification(user);
      return;
    }
    
    // Check user preferences
    if (!user.settings.morningNotifications) return;
    
    // Rate limit check
    const lastSent = await redis.get(\`last_morning:\${user.id}\`);
    if (lastSent && Date.now() - lastSent < 24 * 60 * 60 * 1000) {
      return; // Already sent today
    }
    
    // Send with priority
    const message = {
      to: user.expoPushToken,
      sound: user.settings.soundEnabled ? 'default' : null,
      title: this.getMorningMessage(user),
      body: this.getMorningBody(user),
      data: { type: 'morning', timestamp: Date.now() },
      priority: 'normal', // Not 'high' to avoid disturbing sleep
      channelId: 'morning'
    };
    
    const result = await Notifications.sendPushNotificationAsync(message);
    
    if (result.status === 'ok') {
      await redis.set(\`last_morning:\${user.id}\`, Date.now(), 'EX', 86400);
    }
    
    return result;
  }
  
  isQuietHour(timezone) {
    const hour = this.getLocalHour(timezone);
    return hour >= 22 || hour < 8; // 10 PM to 8 AM
  }
}
\`\`\`

## Commands for Testing Notifications

### Simulate different timezones

\`\`\`bash
# Run with different TZ
TZ=America/New_York node send-notifications.js
TZ=Europe/London node send-notifications.js
TZ=Asia/Tokyo node send-notifications.js
\`\`\`

### Monitor notification complaints

\`\`\`sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as complaints,
  COUNT(DISTINCT user_id) as unique_users
FROM notification_feedback
WHERE type = 'complaint'
GROUP BY DATE(created_at);
\`\`\`

### Test push delivery

\`\`\`bash
# Expo push tool
expo push:send --tokens tokens.json --message "Test message" --data '{"test":true}'
\`\`\`

## Conclusion

That 3 AM notification cost us:

- 15,000 lost users
- 2 weeks of reputation damage
- 1 very sleep-deprived engineering team

Now every notification goes through:

1. Timezone validation
2. Quiet hours check
3. Rate limiting
4. Canary release (for large batches)
5. User preference check

And most importantly: **Never deploy notification systems without testing at all hours.**

My phone is now on Do Not Disturb from 10 PM to 8 AM.

And I check cron schedules twice before deploying.

  `,

    tags: [
      'expo',
      'push-notifications',
      'cron-jobs',
      'timezone',
      'user-experience',
    ],

    seo: {
      metaTitle:
        'Expo Push Notification Disaster: How a Cron Job Woke Up 50,000 Users at 3 AM',
      metaDescription:
        'A timezone bug in our cron job sent "Good morning" notifications at 3 AM to 50,000 users. The uninstall rate increased 900%. Here\'s what we learned.',
      keywords: [
        'expo push notifications',
        'push notification disaster',
        'cron job timezone',
        'notification best practices',
      ],
    },
  },
  {
    title: 'The Unhandled Promise Rejection That Killed Our Node.js Server',
    slug: 'unhandled-promise-rejection-nodejs-crash',
    category: 'MERN',
    excerpt:
      'One missing .catch() caused our Node.js server to crash 47 times in one night. Each crash took 30 seconds to recover — 23 minutes of downtime total.',
    status: 'published',

    content: `

# The Unhandled Promise Rejection That Killed Our Node.js Server

3:00 AM. PagerDuty wakes me up.

"API is down."

I check the logs. Nothing unusual. Restart the server. Works fine.

10 minutes later: PagerDuty again.

This happened 47 times in one night.

## The Symptoms

The server wasn't crashing with an error. It was just… stopping.

\`\`\`
[nodemon] app crashed - waiting for file changes before starting...
\`\`\`

No stack trace. No error message. Just silent death.

We were using PM2 in production:

\`\`\`bash
pm2 start app.js --name my-api --max-memory-restart 1G
\`\`\`

PM2 would restart the server automatically. But each restart took 30 seconds.

47 restarts × 30 seconds = 23.5 minutes of downtime per night.

## The Investigation

After the third night, I was desperate.

I added logging everywhere:

\`\`\`javascript
// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  // DON'T exit, just log
});
\`\`\`

The next crash, I finally saw it:

\`\`\`
Unhandled Rejection: TypeError: Cannot read property 'id' of undefined
    at /app/src/controllers/orderController.js:47:32
    at processTicksAndRejections (internal/process/task_queues.js:95:5)
\`\`\`

**An unhandled promise rejection was crashing Node.js.**

But wait — Node.js doesn't crash on unhandled rejections anymore (since v15). Right?

## The Real Problem

We were running Node.js 14 (deprecated but "stable").

In Node.js 14, unhandled promise rejections would:

1. Log a warning
2. **Crash the process** (if no handler)

But our global handler should have caught it.

Why didn't it?

## The Code

Here was the offending code:

\`\`\`javascript
// orderController.js - LINE 47
const processOrder = async (req, res) => {
  const { orderId } = req.params;
  
  // Get order and user in parallel
  const [order, user] = await Promise.all([
    Order.findById(orderId),
    User.findById(req.user.id)
  ]);
  
  // LINE 47 - CRASH HERE
  const customerName = user.profile.name; // user is undefined!
  
  // ... rest of logic
};
\`\`\`

When \`User.findById\` returned \`null\` (user deleted but token still valid), the \`user\` variable was \`undefined\`.

Then \`user.profile.name\` threw an error inside an async function.

The error propagated to the caller, which had no \`.catch()\`:

\`\`\`javascript
// route.js
app.post('/api/orders/:orderId/process', processOrder); // NO CATCH
\`\`\`

In Express, unhandled rejections in route handlers:

- Node.js 14: Crash the process
- Node.js 15+: Log warning but keep running

## The Fixes

### 1. Wrap All Route Handlers

\`\`\`javascript
// Async wrapper to catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Use it
app.post('/api/orders/:orderId/process', 
  asyncHandler(processOrder)
);
\`\`\`

### 2. Express Error Handling Middleware

\`\`\`javascript
// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't expose internal errors
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
\`\`\`

### 3. Fix the Null Check

\`\`\`javascript
const processOrder = async (req, res) => {
  const { orderId } = req.params;
  
  const [order, user] = await Promise.all([
    Order.findById(orderId),
    User.findById(req.user.id)
  ]);
  
  // Check for null/undefined
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Now safe
  const customerName = user.profile.name;
  
  // ... rest
};
\`\`\`

### 4. Upgrade Node.js

\`\`\`bash
# From 14 to 18
nvm install 18
nvm use 18

# Update dependencies
npm update

# Test
npm test
\`\`\`

## The Prevention

### Global Unhandled Rejection Handler (with monitoring)

\`\`\`javascript
// Complete rejection handling
const unhandledRejections = new Map();

process.on('unhandledRejection', (reason, promise) => {
  const error = {
    message: reason.message || String(reason),
    stack: reason.stack,
    timestamp: new Date().toISOString(),
    promise: String(promise)
  };
  
  // Store for debugging
  unhandledRejections.set(Date.now(), error);
  
  // Send to Sentry
  Sentry.captureException(reason, {
    tags: { type: 'unhandledRejection' },
    extra: { promise }
  });
  
  // Alert if too many
  if (unhandledRejections.size > 10) {
    sendAlert({
      level: 'critical',
      message: 'Too many unhandled rejections',
      count: unhandledRejections.size
    });
  }
  
  // In development, log loudly
  if (process.env.NODE_ENV === 'development') {
    console.error('💥 UNHANDLED REJECTION 💥');
    console.error(reason);
  }
});

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [timestamp] of unhandledRejections) {
    if (now - timestamp > 24 * 60 * 60 * 1000) {
      unhandledRejections.delete(timestamp);
    }
  }
}, 60 * 60 * 1000);
\`\`\`

### ESLint Rule to Catch Missing Error Handling

\`\`\`json
// .eslintrc.json
{
  "rules": {
    "no-floating-promises": "error",
    "require-await": "error"
  },
  "parserOptions": {
    "project": "./tsconfig.json"
  }
}
\`\`\`

### Automatic Testing for Null/Undefined

\`\`\`javascript
// Test that catches missing null checks
describe('Order Controller', () => {
  it('should handle missing user gracefully', async () => {
    // Mock User.findById to return null
    User.findById.mockResolvedValue(null);
    
    const req = { 
      params: { orderId: '123' },
      user: { id: 'deleted-user' }
    };
    const res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };
    
    await processOrder(req, res);
    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'User not found' 
    });
  });
});
\`\`\`

## The Monitoring Stack

After the incident, we set up:

### 1. PM2 Monitoring

\`\`\`bash
# Watch for restarts
pm2 monitor
pm2 logs --lines 100

# Alert on restart
pm2 set pm2-auto-pull:alert-webhook https://hooks.slack.com/...
\`\`\`

### 2. Health Checks

\`\`\`javascript
// Every 30 seconds
setInterval(async () => {
  try {
    await fetch('http://localhost:3000/health');
  } catch (error) {
    // No response - server is down
    sendAlert('Server not responding');
  }
}, 30000);
\`\`\`

### 3. Memory Leak Detection

\`\`\`javascript
// Monitor memory usage
setInterval(() => {
  const used = process.memoryUsage();
  
  const heapUsedMB = used.heapUsed / 1024 / 1024;
  const heapTotalMB = used.heapTotal / 1024 / 1024;
  
  if (heapUsedMB > 512) {
    console.warn(\`High memory usage: \${heapUsedMB}MB\`);
    
    if (heapUsedMB > 1024) {
      sendAlert({
        level: 'warning',
        message: 'Memory leak detected',
        heapUsed: heapUsedMB
      });
    }
  }
}, 60000);
\`\`\`

## The Root Cause Analysis

Why did this happen in the first place?

1. **No TypeScript** → Could have caught \`user.profile\` being accessed on possibly-null value
2. **No async handler wrapper** → Express doesn't catch promise rejections by default
3. **Old Node.js version** → v14 crashes on unhandled rejections
4. **Insufficient testing** → No tests for "user not found" scenario

## The Results After Fixes

- **Crash frequency:** 47/night → 0
- **Error response time:** Crash + 30s restart → 2ms (returns 404)
- **Sentry errors:** 200/day → 5/day (mostly handled)
- **Developer confidence:** "I hate this server" → "It's stable now"

## Commands for Debugging

### Find unhandled rejections in code

\`\`\`bash
# Grep for Promise chains without catch
grep -r "\.then(" --include="*.js" | grep -v "\.catch"

# Find async functions without try/catch
grep -r "async (" --include="*.js" -A 10 | grep -v "try"
\`\`\`

### Test Node.js version behavior

\`\`\`bash
# Test unhandled rejection behavior
node -e "Promise.reject('test')"
# Node 14: crashes
# Node 16+: logs warning

# Run with flags
node --unhandled-rejections=throw app.js  # Crash
node --unhandled-rejections=strict app.js # Log and exit
node --unhandled-rejections=none app.js   # Ignore (dangerous)
\`\`\`

### Monitor process uptime

\`\`\`bash
# Check last restart time
pm2 list
pm2 describe my-api

# Check systemd restart count
systemctl status my-api | grep "started"
\`\`\`

## What I Learned

### 1. Always Wrap Async Express Handlers

\`\`\`javascript
// Don't do this
app.get('/route', async (req, res) => { ... })

// Do this
app.get('/route', asyncHandler(async (req, res) => { ... }))
\`\`\`

### 2. Upgrade Node.js Regularly

LTS releases have critical behavior changes.

### 3. Test Error Scenarios

Every "findById" can return null. Test it.

### 4. Monitor Restarts

If your server is restarting frequently, something is wrong.

## The Happy Ending

That weekend of 47 crashes taught our team:

- Never trust async functions to handle their own errors
- Use TypeScript or JSDoc with strict null checks
- Test the unhappy path
- Keep Node.js updated

Now our server has been running for 127 days without a crash.

And I finally disabled PagerDuty's 3 AM alerts for "API is down."

  `,

    tags: ['nodejs', 'mern', 'promises', 'error-handling', 'crash'],

    seo: {
      metaTitle:
        'Unhandled Promise Rejection: How Node.js Crashed 47 Times in One Night',
      metaDescription:
        "One missing .catch() caused 47 server crashes in a single night. Here's why Node.js 14 crashes on unhandled rejections and how to fix it permanently.",
      keywords: [
        'unhandled promise rejection',
        'nodejs crash',
        'express async handler',
        'nodejs error handling',
      ],
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
  {
    title: 'The MongoDB Aggregation Pipeline That Killed Our CPU for 3 Hours',
    slug: 'mongodb-aggregation-pipeline-cpu-100-percent',
    category: 'MERN',
    excerpt:
      'A single aggregation pipeline with $lookup and $unwind brought our MongoDB CPU to 100% for 3 hours — all because of missing indexes and bad pipeline ordering.',
    status: 'published',
    content: `

# The MongoDB Aggregation Pipeline That Killed Our CPU for 3 Hours

It was 2 PM on a Wednesday. Our MongoDB Atlas cluster was humming along at 20% CPU.

Then, within 60 seconds, it shot to 100% and stayed there.

No deploys. No traffic spikes. Just… death.

## The Setup

We had an e-commerce MERN stack:

- MongoDB Atlas M40 cluster (4 vCPUs, 16GB RAM)
- Mongoose ODM
- Product catalog with 500k products
- Order history with 2M orders

A new feature required a dashboard showing "top products by revenue per category."

I wrote an aggregation pipeline:

\`\`\`javascript
// THE DANGEROUS PIPELINE
const topProductsByCategory = await Order.aggregate([
  // Stage 1: Unwind order items
  { $unwind: '$items' },
  
  // Stage 2: Lookup product details
  { 
    $lookup: {
      from: 'products',
      localField: 'items.productId',
      foreignField: '_id',
      as: 'product'
    }
  },
  
  // Stage 3: Unwind product (always one)
  { $unwind: '$product' },
  
  // Stage 4: Group by category and product
  {
    $group: {
      _id: {
        category: '$product.category',
        productId: '$product._id',
        productName: '$product.name'
      },
      totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
    }
  },
  
  // Stage 5: Sort within each category
  { $sort: { '_id.category': 1, totalRevenue: -1 } },
  
  // Stage 6: Group to get top 5 per category
  {
    $group: {
      _id: '$_id.category',
      topProducts: { $push: '$$ROOT' },
    }
  },
  
  // Stage 7: Slice to top 5
  {
    $project: {
      topProducts: { $slice: ['$topProducts', 5] }
    }
  }
]);
\`\`\`

## The Disaster

This pipeline ran **once per hour** as a scheduled job.

But it had a hidden bug: **no indexes on \`items.productId\`**.

Here's what actually happened when the pipeline executed:

1. **$unwind on orders** → Created a document per order item. 2M orders × average 3 items = **6M documents**.
2. **$lookup with no index** → For each of 6M documents, MongoDB scanned the entire products collection (500k documents) to find matching product.
3. That's 6M × 500k = **3 trillion document scans**.
4. CPU maxed out. Memory exhausted. Disk I/O through the roof.

After 3 hours, MongoDB killed the operation.

But the damage was done: the cache was destroyed, and it took another 2 hours for performance to recover.

## The Investigation

I connected to Atlas and ran \`db.currentOp()\`:

\`\`\`javascript
db.currentOp({
  "secs_running": { "$gt": 60 },
  "op": "command"
})

// Result:
{
  "opid": 123456789,
  "command": {
    "aggregate": "orders",
    "pipeline": [...] // our pipeline
  },
  "planSummary": "COLLSCAN",  // ← NO INDEX!
  "numYields": 0,
  "locks": { "Global": "w" }
}
\`\`\`

**COLLSCAN** on a 500k product collection. Repeated 6M times.

## The Fixes

### 1. Add Index on Foreign Key

\`\`\`javascript
// Create index on productId inside order items
db.orders.createIndex({ "items.productId": 1 })

// Also on products _id (already exists)
\`\`\`

### 2. Restructure Pipeline Order

\`\`\`javascript
// OPTIMIZED PIPELINE
const topProductsOptimized = await Order.aggregate([
  // Stage 1: Match only recent orders (if possible)
  { $match: { createdAt: { $gte: startOfMonth } } },
  
  // Stage 2: Unwind items (still needed)
  { $unwind: '$items' },
  
  // Stage 3: Group FIRST to reduce documents before $lookup
  {
    $group: {
      _id: '$items.productId',
      totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
    }
  },
  
  // Now only 500k docs (unique products) instead of 6M
  // Stage 4: Lookup product details
  {
    $lookup: {
      from: 'products',
      localField: '_id',
      foreignField: '_id',
      as: 'product'
    }
  },
  
  { $unwind: '$product' },
  
  // Stage 5: Group by category
  {
    $group: {
      _id: '$product.category',
      products: {
        $push: {
          productId: '$_id',
          name: '$product.name',
          revenue: '$totalRevenue'
        }
      }
    }
  },
  
  // Stage 6: Sort and slice per category
  {
    $project: {
      topProducts: {
        $slice: [
          { $sortArray: { input: '$products', sortBy: { revenue: -1 } } },
          5
        ]
      }
    }
  }
]);
\`\`\`

### 3. Use $merge for Materialized Views

Instead of running the heavy aggregation every hour, we stored results:

\`\`\`javascript
// Pipeline with $merge to cache results
const pipeline = [
  // ... aggregation stages ...
  {
    $merge: {
      into: "category_top_products",
      whenMatched: "replace",
      whenNotMatched: "insert"
    }
  }
];

// Then query the pre-aggregated collection
const topProducts = await db.collection('category_top_products').find().toArray();
\`\`\`

## The Prevention

### 1. Use explain() to Detect COLLSCAN

\`\`\`javascript
const explainResult = await Order.aggregate([...]).explain();
if (explainResult.stages.some(s => s.stage === 'COLLSCAN')) {
  console.error('WARNING: COLLSCAN detected in aggregation');
  // Send alert
}
\`\`\`

### 2. Set up Atlas Performance Advisor

Atlas automatically suggests indexes for slow queries.

### 3. Kill Slow Operations Automatically

\`\`\`javascript
// Set maxTimeMS on aggregations
await Order.aggregate([...], { maxTimeMS: 60000 }); // 60 seconds
// MongoDB will kill the operation if it exceeds time
\`\`\`

### 4. Enable Profiling

\`\`\`javascript
// Log all slow queries (>100ms)
db.setProfilingLevel(1, { slowms: 100 })

// Check slow logs
db.system.profile.find({ op: "command", "command.aggregate": "orders" }).sort({ ts: -1 }).limit(10)
\`\`\`

## Commands to Debug Aggregations

### Check running aggregations

\`\`\`javascript
db.currentOp({
  "command.aggregate": { $exists: true },
  "secs_running": { $gt: 10 }
})
\`\`\`

### Kill a stuck aggregation

\`\`\`javascript
db.killOp(opid)
\`\`\`

### Analyze pipeline performance

\`\`\`javascript
// Use $planCacheStats
db.orders.aggregate([ { $planCacheStats: {} } ])
\`\`\`

## What I Learned

- **Aggregation pipelines need indexes on every join field**.
- **Reduce document count BEFORE $lookup** – group early.
- **Never run heavy aggregations on primary** – use a secondary read preference or Atlas read-only instance.
- **Materialized views are your friend** – pre-aggregate once, query many times.

That 3-hour CPU spike taught me to treat aggregations like production code – test, explain, index, and always set timeouts.

  `,
    tags: [
      'mongodb',
      'aggregation-pipeline',
      'performance',
      'cpu-spike',
      'indexing',
    ],
    seo: {
      metaTitle:
        'MongoDB Aggregation Pipeline CPU Disaster: How a $lookup Without Index Killed Our Cluster',
      metaDescription:
        'A 3-hour CPU spike caused by an aggregation pipeline with 3 trillion document scans. Learn how to optimize $lookup, use $merge, and prevent COLLSCAN.',
      keywords: [
        'mongodb aggregation performance',
        'lookup without index',
        'mongodb cpu 100%',
        'aggregation pipeline optimization',
      ],
    },
  },
  {
    title: 'The Prisma findUnique That Returned null (But the Data Existed)',
    slug: 'prisma-findunique-returned-null-data-exists',
    category: 'PERN',
    excerpt:
      'A Prisma query kept returning null for records that definitely existed. The culprit? A case-sensitive UUID comparison between PostgreSQL and Node.js.',
    status: 'published',
    content: `

# The Prisma findUnique That Returned null (But the Data Existed)

"Your API is returning 404 for user profiles."

I checked the database. The user existed.

I checked the API endpoint with the same ID. 404.

I ran the query manually in psql. It worked.

This made zero sense.

## The Setup

We had a PERN stack with:

- PostgreSQL 14
- Prisma 4.8 (ORM)
- Express.js
- UUID primary keys

A simple user lookup:

\`\`\`typescript
// Route handler
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  
  const user = await prisma.user.findUnique({
    where: { id: id }
  });
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});
\`\`\`

It worked for 99% of users. But for about 1%, it returned 404 even though the user existed.

## The Investigation

I added logging:

\`\`\`typescript
console.log('Looking for user with ID:', id);
const user = await prisma.user.findUnique({ where: { id } });
console.log('Found user:', user);
\`\`\`

The logs showed:

\`\`\`
Looking for user with ID: 123e4567-e89b-12d3-a456-426614174000
Found user: null
\`\`\`

But in the database:

\`\`\`sql
SELECT * FROM users WHERE id = '123e4567-e89b-12d3-a456-426614174000';
-- Returns the user!
\`\`\`

How can Prisma return null when the exact same query works in psql?

## The Root Cause

UUIDs in PostgreSQL are stored as 128-bit integers. But when you query with a string, PostgreSQL automatically casts:

\`\`\`sql
-- This works
SELECT * FROM users WHERE id = '123e4567-e89b-12d3-a456-426614174000';
\`\`\`

However, Prisma was generating a parameterized query:

\`\`\`sql
-- Prisma generated
SELECT * FROM users WHERE id = $1
-- $1 = '123e4567-e89b-12d3-a456-426614174000'
\`\`\`

Still works, right? **Not if the case of the letters is different.**

PostgreSQL UUIDs are **case-insensitive** when stored, but **case-sensitive** when comparing strings.

The problem: Our frontend was lowercasing the UUID before sending it to the API.

But the database had mixed-case UUIDs (some uppercase letters).

When we queried with lowercase:

\`\`\`sql
-- Database has '123E4567-E89B-12D3-A456-426614174000'
-- Query with '123e4567-e89b-12d3-a456-426614174000'
-- In a string comparison, these are NOT equal
\`\`\`

But why did psql return the row? Because psql's implicit casting treated the string as a UUID, not a string:

\`\`\`sql
-- psql casts to UUID, which ignores case
SELECT * FROM users WHERE id = '123e4567...'::uuid;  -- works
\`\`\`

Prisma was sending the value as a **text parameter**, not a UUID parameter.

## The Fix

### 1. Ensure UUIDs are consistently formatted

\`\`\`typescript
// Normalize UUID to lowercase before storing
const normalizedUuid = uuid.v4().toLowerCase();

// Always query with lowercase
const user = await prisma.user.findUnique({
  where: { id: id.toLowerCase() }
});
\`\`\`

### 2. Use Prisma's native UUID type

\`\`\`prisma
// schema.prisma
model User {
  id   String @id @default(uuid()) @db.Uuid
  name String
}
\`\`\`

This ensures Prisma treats the field as UUID in queries.

### 3. Add a raw SQL fallback

\`\`\`typescript
// If findUnique fails, try raw query with UUID cast
if (!user) {
  const rawUser = await prisma.$queryRaw\`
    SELECT * FROM users WHERE id = \${id}::uuid
  \`;
  user = rawUser[0];
}
\`\`\`

### 4. Migrate existing mixed-case UUIDs

\`\`\`sql
-- Normalize all UUIDs to lowercase
UPDATE users SET id = LOWER(id);
-- Update foreign keys too
UPDATE orders SET user_id = LOWER(user_id);
\`\`\`

## The Prevention

### Validate UUID format on input

\`\`\`typescript
import { validate, version } from 'uuid';

const isValidUUID = (id: string) => {
  return validate(id) && version(id) === 4;
};

// In route
if (!isValidUUID(id)) {
  return res.status(400).json({ error: 'Invalid UUID format' });
}
\`\`\`

### Use Prisma's $queryRaw with type hints

\`\`\`typescript
// Force UUID type in raw query
const users = await prisma.$queryRaw<Array<User>>\`
  SELECT * FROM users 
  WHERE id = \${id}::uuid
\`;
\`\`\`

### Add a database trigger to enforce case

\`\`\`sql
CREATE OR REPLACE FUNCTION normalize_uuid()
RETURNS TRIGGER AS $$
BEGIN
  NEW.id = LOWER(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_lowercase_uuid
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION normalize_uuid();
\`\`\`

## Commands to Debug UUID Issues

### Check UUID case sensitivity

\`\`\`sql
-- These return different results depending on casting
SELECT '123E4567-E89B-12D3-A456-426614174000' = '123e4567-e89b-12d3-a456-426614174000'; -- false
SELECT '123E4567-E89B-12D3-A456-426614174000'::uuid = '123e4567-e89b-12d3-a456-426614174000'::uuid; -- true
\`\`\`

### Find mixed-case UUIDs

\`\`\`sql
SELECT id FROM users WHERE id != LOWER(id);
\`\`\`

### See Prisma's actual query

\`\`\`typescript
// Enable query logging
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });
\`\`\`

## What I Learned

- UUIDs in PostgreSQL are integers, not strings.
- Prisma sends them as parameters with type "text" unless you use "@db.Uuid".
- Always normalize UUIDs to a consistent case (lowercase) at the application boundary.
- Raw SQL with "::uuid" cast can save you in emergencies.

That 404 bug wasted 6 hours of debugging. Now we have a linter rule that forces "toLowerCase()" on all UUID parameters.

  `,
    tags: ['prisma', 'postgresql', 'uuid', 'case-sensitivity', 'bug-story'],
    seo: {
      metaTitle:
        'Prisma findUnique Returns null for Existing UUID – Case Sensitivity Nightmare',
      metaDescription:
        'A Prisma query returned null for existing records because of PostgreSQL UUID case sensitivity. Here’s how to fix mixed-case UUID issues.',
      keywords: [
        'prisma findunique null',
        'postgresql uuid case',
        'prisma uuid bug',
        'uuid lowercase normalization',
      ],
    },
  },
  {
    title: 'The Next.js Static Export That Generated 50,000 404 Pages',
    slug: 'nextjs-static-export-404-pages-trailing-slash',
    category: 'Next.js',
    excerpt:
      'Setting output: "export" in Next.js seemed simple until Google indexed 50,000 404 pages because of a trailing slash mismatch.',
    status: 'published',
    content: `

# The Next.js Static Export That Generated 50,000 404 Pages

I love Next.js static exports. No servers. No cold starts. Just HTML files on S3.

But one configuration option turned 50,000 valid pages into 404 errors.

## The Setup

We had a marketing site with 50,000 blog posts (static content).

Next.js 14 with App Router.

\`\`\`javascript
// next.config.js
module.exports = {
  output: 'export',  // Static export
  trailingSlash: false,  // Our setting
  images: { unoptimized: true }
};
\`\`\`

Our links looked like:

\`\`\`jsx
<Link href="/blog/post-123">Read post</Link>
// Renders <a href="/blog/post-123">
\`\`\`

During build, Next.js generated:

\`\`\`
out/
  blog/
    post-123.html
    post-124.html
    ...
\`\`\`

We uploaded to S3 and configured CloudFront.

## The Problem

After launch, Google Search Console showed:

\`\`\`
Indexed pages: 50,000
404 pages: 50,000
\`\`\`

Every single blog post was marked as a 404.

I visited a post: \`https://mysite.com/blog/post-123\`

It worked in the browser.

Why was Google seeing 404?

## The Investigation

I fetched the page with \`curl\`:

\`\`\`bash
curl -I https://mysite.com/blog/post-123
HTTP/2 200 OK  # Works

curl -I https://mysite.com/blog/post-123/
HTTP/2 404 Not Found  # FAILS
\`\`\`

**The trailing slash was the culprit.**

Googlebot was crawling both versions:
- Without trailing slash → 200 (S3 serves post-123.html)
- With trailing slash → 404 (S3 looks for folder post-123/index.html)

Our S3 bucket was configured to handle \`index.html\` for folders, but not to remove trailing slashes.

Google was indexing the trailing-slash URLs because they appeared in our sitemap:

\`\`\`xml
<url>
  <loc>https://mysite.com/blog/post-123/</loc>  <!-- Trailing slash! -->
</url>
\`\`\`

Our sitemap generator added trailing slashes automatically.

## The Fixes

### 1. Remove trailing slashes from sitemap

\`\`\`typescript
// app/sitemap.ts
export default function sitemap() {
  const posts = getAllPosts();
  return posts.map(post => ({
    url: \`https://mysite.com/blog/\${post.slug}\`,  // NO trailing slash
    lastModified: post.date
  }));
}
\`\`\`

### 2. Configure S3 to remove trailing slashes

Using CloudFront Functions:

\`\`\`javascript
// CloudFront viewer request function
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  
  // Remove trailing slash
  if (uri.endsWith('/') && uri !== '/') {
    uri = uri.slice(0, -1);
    request.uri = uri;
  }
  
  // Add .html for extensionless paths
  if (!uri.includes('.') && !uri.endsWith('/')) {
    request.uri = uri + '.html';
  }
  
  return request;
}
\`\`\`

### 3. Use redirect rules in S3

\`\`\`xml
<RoutingRules>
  <RoutingRule>
    <Condition>
      <KeyPrefixEquals>blog/</KeyPrefixEquals>
      <SuffixEquals>/</SuffixEquals>
    </Condition>
    <Redirect>
      <ReplaceKeyPrefixWith>blog/</ReplaceKeyPrefixWith>
      <RemoveSuffix>/</RemoveSuffix>
    </Redirect>
  </RoutingRule>
</RoutingRules>
\`\`\`

### 4. Configure Next.js to generate both versions

\`\`\`javascript
// next.config.js with custom export
module.exports = {
  output: 'export',
  trailingSlash: true,  // Change to true
  // Then generate both .html and /index.html
};
\`\`\`

But this doubles the build time and storage.

## The Prevention

### Canonical URLs without trailing slashes

\`\`\`jsx
// Add canonical tag to every page
<Head>
  <link rel="canonical" href={\`https://mysite.com/blog/\${post.slug}\`} />
</Head>
\`\`\`

### Redirect trailing slashes in middleware

\`\`\`typescript
// middleware.ts (works with static export using edge config)
import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  if (url.pathname.endsWith('/') && url.pathname !== '/') {
    url.pathname = url.pathname.slice(0, -1);
    return NextResponse.redirect(url, 301);
  }
}
\`\`\`

### Test with bot user-agent

\`\`\`bash
# Simulate Googlebot
curl -A "Googlebot" -I https://mysite.com/blog/post-123/
# Should return 301 or 200, never 404
\`\`\`

## Commands to Audit

### Find all trailing slash URLs in sitemap

\`\`\`bash
grep -o '<loc>[^<]*/' sitemap.xml | wc -l
\`\`\`

### Check S3 behavior

\`\`\`bash
aws s3 ls s3://my-bucket/blog/ --recursive | grep '\.html$'
\`\`\`

### Bulk test redirects

\`\`\`bash
# Using httpie
cat urls.txt | xargs -I {} http -h {} | grep -E "HTTP|Location"
\`\`\`

## What I Learned

- Static exports are unforgiving about trailing slashes.
- Sitemaps must match the actual URL structure.
- CloudFront Functions can fix S3 limitations.
- Always test both slash variants before launch.

That mistake cost us 2 weeks of SEO recovery. Now we have a CI check that ensures all generated URLs are consistent and no trailing slash variants return 404.

  `,
    tags: ['nextjs', 'static-export', 'trailing-slash', 'seo', 's3'],
    seo: {
      metaTitle:
        'Next.js Static Export Generated 50,000 404 Pages – Trailing Slash Disaster',
      metaDescription:
        'A trailing slash mismatch between sitemap and S3 caused Google to index 50,000 404 pages. How to fix static export routing.',
      keywords: [
        'nextjs static export 404',
        'trailing slash nextjs',
        's3 static hosting seo',
        'nextjs export trailing slash',
      ],
    },
  },
  {
    title:
      'The GitHub Actions Secret That Printed to Logs (And We Rotated All API Keys)',
    slug: 'github-actions-secret-printed-to-logs-exposed',
    category: 'DevOps',
    excerpt:
      'A debug echo command printed our AWS secret key to GitHub Actions logs. Within 3 minutes, someone tried to launch 50 EC2 instances on our account.',
    status: 'published',
    content: `

# The GitHub Actions Secret That Printed to Logs (And We Rotated All API Keys)

"Secrets are safe in GitHub Actions. They're masked automatically."

That's what I believed.

Until one innocent \`echo\` command printed our production AWS secret key in plain text for the world to see.

## The Setup

We used GitHub Actions for CI/CD:

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy to AWS
on: push
env:
  AWS_ACCESS_KEY_ID: $ {{ secrets.AWS_ACCESS_KEY_ID }}
  AWS_SECRET_ACCESS_KEY: $ {{ secrets.AWS_SECRET_ACCESS_KEY }}
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to S3
        run: |
          aws s3 sync ./build s3://my-bucket
\`\`\`

We added a debug step to troubleshoot a failure:

\`\`\`yaml
- name: Debug environment
  run: |
    echo "AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID"
    echo "AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY"
\`\`\`

## The Leak

The run completed. The logs showed:

\`\`\`
AWS_ACCESS_KEY_ID: AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
\`\`\`

Wait — GitHub Actions is supposed to mask secrets automatically.

Why wasn't it masked?

Because **GitHub only masks secrets that match the exact value in the secret store**.

Our secret value was \`wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\` (with a slash).

When \`echo\` printed it, the slash wasn't part of the masking pattern? Actually, GitHub masks based on the exact secret value. It should have worked.

The real issue: Our secret contained special characters, and GitHub's masking is **case-sensitive and exact-match only**.

But the bigger problem: **Anyone with read access to the repo could see the logs**.

And our repo was public.

## The Aftermath

Within 3 minutes of the workflow run:

CloudTrail showed:

\`\`\`
RunInstances - us-east-1 - 50 instances
RunInstances - eu-west-1 - 50 instances
RunInstances - ap-southeast-1 - 50 instances
\`\`\`

Someone had scraped the log, found the key, and started mining cryptocurrency.

AWS alerted us via Security Hub.

By the time we revoked the key, they had launched 347 EC2 instances across 8 regions.

Estimated cost for 1 hour: $4,700.

## The Emergency Response

### 1. Revoke the exposed key immediately

\`\`\`bash
aws iam delete-access-key --access-key-id AKIAIOSFODNN7EXAMPLE
\`\`\`

### 2. Terminate unauthorized instances

\`\`\`bash
# List all instances launched after the leak
aws ec2 describe-instances --query "Reservations[].Instances[?LaunchTime>='2024-01-15T10:00:00'].[InstanceId]" --output text | xargs aws ec2 terminate-instances --instance-ids
\`\`\`

### 3. Rotate ALL secrets (not just the exposed one)

\`\`\`bash
# Generate new keys
aws iam create-access-key --user-name deploy-user

# Update GitHub secret
gh secret set AWS_SECRET_ACCESS_KEY --body "$NEW_SECRET"
\`\`\`

### 4. Audit for other leaks

\`\`\`bash
# Search all workflow run logs for patterns
gh run list --limit 100 --json databaseId | jq '.[].databaseId' | xargs -I{} gh run view {} --log | grep -i "secret\|key\|token"
\`\`\`

## The Prevention

### 1. Never echo secrets, even for debugging

\`\`\`yaml
# Instead of echo, use ::add-mask:: to manually mask
- name: Debug secret (safe)
  run: |
    echo "::add-mask::$AWS_SECRET_ACCESS_KEY"
    echo "Secret length: $ {#AWS_SECRET_ACCESS_KEY}"
\`\`\`

### 2. Use environment protection rules

\`\`\`yaml
# Require approval for production
environment: 
  name: production
  url: https://myapp.com
  required_reviewers:
    - my-username
\`\`\`

### 3. Enable secret scanning in GitHub

GitHub Advanced Security can detect accidentally committed secrets.

### 4. Use OIDC instead of long-lived keys

\`\`\`yaml
# Configure AWS OIDC
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v2
  with:
    role-to-assume: arn:aws:iam::123456789:role/github-actions-role
    aws-region: us-east-1
# No long-lived secrets needed!
\`\`\`

### 5. Set up a canary token

\`\`\`bash
# Deploy a fake AWS key that triggers an alert if used
# Using Canarytokens.org
\`\`\`

## The Cleanup Script

After the incident, we automated key rotation:

\`\`\`bash
#!/bin/bash
# rotate-aws-keys.sh

USER_NAME="github-actions-user"

# Create new key
NEW_KEY=$(aws iam create-access-key --user-name $USER_NAME)

NEW_ID=$(echo $NEW_KEY | jq -r '.AccessKey.AccessKeyId')
NEW_SECRET=$(echo $NEW_KEY | jq -r '.AccessKey.SecretAccessKey')

# Update GitHub secret
echo $NEW_SECRET | gh secret set AWS_SECRET_ACCESS_KEY --repo myorg/myrepo

# Wait for propagation
sleep 60

# Delete old key (find the one not used recently)
OLD_KEY_ID=$(aws iam list-access-keys --user-name $USER_NAME | jq -r '.AccessKeyMetadata[] | select(.Status=="Active") | .AccessKeyId' | head -1)

aws iam delete-access-key --user-name $USER_NAME --access-key-id $OLD_KEY_ID

echo "Rotated key $OLD_KEY_ID -> $NEW_ID"
\`\`\`

## What I Learned

- **Never echo secrets** – not even for debugging.
- **Use OIDC** – no secrets to leak.
- **Rotate keys regularly** – even if not exposed.
- **Monitor CloudTrail aggressively** – we caught it early.
- **Public repos need extra care** – assume hostile readers.

That leaked key cost us $4,700 and a weekend of rotating every single credential in our infrastructure.

Now we have a "no echo of any variable named *KEY* or *SECRET*" rule enforced by pre-commit hooks.

  `,
    tags: ['github-actions', 'secrets', 'aws', 'security', 'ci-cd'],
    seo: {
      metaTitle:
        'GitHub Actions Secret Leak: How echo Printed Our AWS Key and Led to 347 EC2 Instances',
      metaDescription:
        'A debug echo in GitHub Actions exposed our AWS secret key. Within 3 minutes, attackers launched 347 EC2 instances. Here’s how to prevent secret leaks.',
      keywords: [
        'github actions secret leak',
        'aws key exposed',
        'github actions security',
        'oidc github actions',
      ],
    },
  },
  {
    title: 'The Expo Build That Failed Because of Metro’s Symlink Resolution',
    slug: 'expo-metro-symlink-build-fail-yarn-workspaces',
    category: 'Expo',
    excerpt:
      'Using Yarn workspaces with Expo caused Metro to fail with "Unable to resolve module" – but only on CI, never locally. It took 2 days to find the symlink issue.',
    status: 'published',
    content: `

# The Expo Build That Failed Because of Metro’s Symlink Resolution

"Build failed: Unable to resolve module 'shared-ui'."

The error made no sense. It worked on my machine. It worked on my teammate's machine.

But on our CI server (GitHub Actions), it failed every single time.

## The Setup

We had a monorepo with Yarn workspaces:

\`\`\`
packages/
  mobile/         (Expo app)
  shared-ui/      (React Native components)
  shared-utils/   (utility functions)
\`\`\`

\`\`\`json
// package.json (root)
{
  "workspaces": ["packages/*"],
  "private": true
}
\`\`\`

The Expo app imported from the shared workspace:

\`\`\`javascript
// packages/mobile/app/index.js
import { Button } from 'shared-ui/components/Button';
\`\`\`

\`shared-ui\` was symlinked by Yarn into \`node_modules\`.

Locally, everything worked. Metro (Expo's bundler) followed the symlinks.

## The Failure

On CI, the build failed with:

\`\`\`
Error: Unable to resolve module 'shared-ui/components/Button' from 'packages/mobile/app/index.js': 
shared-ui could not be found within the project or in these directories:
  node_modules
\`\`\`

But \`ls node_modules\` showed the symlink existed.

Why couldn't Metro find it?

## The Root Cause

Metro by default **does not follow symlinks** outside of the project root.

In CI, the checkout path was different (e.g., \`/home/runner/work/myapp/myapp\` vs local \`/Users/me/projects/myapp\`).

Metro's symlink resolution is **path-dependent**. It only follows symlinks that point to directories within the same parent.

Our symlink pointed to \`../../packages/shared-ui\`. Metro saw the \`..\` and refused to follow it because it left the project root.

Locally, the relative path resolved to a directory still under the project root (due to different folder structure). On CI, it didn't.

## The Investigation

I enabled Metro's verbose logging:

\`\`\`bash
expo start --verbose 2>&1 | grep -i "symlink"
\`\`\`

The logs showed:

\`\`\`
[metro] Ignoring symlink ../../packages/shared-ui because it points outside root
\`\`\`

That was the smoking gun.

## The Fixes

### 1. Configure Metro to follow symlinks

\`\`\`javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow symlinks
config.resolver.disableHierarchicalLookup = false;
config.watchFolders = [
  ...(config.watchFolders || []),
  // Add the workspace root
  "${__dirname}/../.."
];

// Tell Metro to treat shared packages as source
config.resolver.nodeModulesPaths = [
  '${__dirname}/node_modules',
  '${__dirname}/../../node_modules'
];

module.exports = config;
\`\`\`

### 2. Use Yarn's nohoist (not recommended, but works)

\`\`\`json
// package.json
{
  "workspaces": {
    "packages": ["packages/*"],
    "nohoist": ["**/shared-ui", "**/shared-utils"]
  }
}
\`\`\`

This forces Yarn to install copies instead of symlinks.

### 3. Use a monorepo tool that handles Metro

We switched to **Turborepo** + **expo-yarn-workspaces** package:

\`\`\`bash
yarn add -D expo-yarn-workspaces
\`\`\`

\`\`\`json
// package.json
{
  "expo": {
    "packages": ["packages/mobile"]
  }
}
\`\`\`

### 4. Workaround: Copy packages instead of symlinking in CI

\`\`\`yaml
# .github/workflows/build.yml
- name: Copy workspace packages (CI workaround)
  run: |
    # Remove symlink
    rm -rf node_modules/shared-ui
    # Copy actual code
    cp -r packages/shared-ui node_modules/shared-ui
\`\`\`

## The Permanent Fix

We wrote a custom Metro configuration that works with any monorepo:

\`\`\`javascript
// metro.config.js
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro resolve modules from the workspace root's node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Ensure symlinks are followed
config.resolver.disableHierarchicalLookup = true;

// 4. Ignore the infinite loop of node_modules
config.resolver.blacklistRE = /.*\/node_modules\/.*\/node_modules\/.*/;

module.exports = config;
\`\`\`

## The Prevention

### Test Metro resolution on CI

\`\`\`bash
# Add a script to verify resolution
npm run expo export -- --dump-asset
\`\`\`

### Use absolute imports within monorepo

\`\`\`json
// jsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "shared-ui/*": ["packages/shared-ui/src/*"],
      "shared-utils/*": ["packages/shared-utils/src/*"]
    }
  }
}
\`\`\`

### Add a pre-flight check

\`\`\`javascript
// scripts/check-metro-resolution.js
const fs = require('fs');
const path = require('path');

const symlinkTarget = fs.readlinkSync('node_modules/shared-ui');
const absoluteTarget = path.resolve('node_modules/shared-ui', symlinkTarget);

if (!absoluteTarget.startsWith(process.cwd())) {
  console.error('Symlink points outside project root. Metro will fail.');
  process.exit(1);
}
\`\`\`

## Commands to Debug Metro Symlinks

### Check symlink targets

\`\`\`bash
ls -la node_modules | grep ^l
readlink node_modules/shared-ui
\`\`\`

### Run Metro with debug

\`\`\`bash
export METRO_DEBUG=true
expo start --no-dev
\`\`\`

### Find all resolved paths

\`\`\`bash
npx metro-resolver --platform=ios --entry=index.js
\`\`\`

## What I Learned

- Metro's symlink behavior is fragile in monorepos.
- CI environments have different path structures than local machines.
- Always test builds on CI before merging.
- The "expo-yarn-workspaces" package exists exactly for this problem.

That 2-day debugging marathon taught me to never assume "works on my machine" means "works anywhere". Now we run all builds in a Docker container that matches CI exactly.

  `,
    tags: ['expo', 'metro', 'symlink', 'monorepo', 'yarn-workspaces'],
    seo: {
      metaTitle:
        'Expo Metro Symlink Resolution Failure in CI – Monorepo Build Fix',
      metaDescription:
        'Metro couldn’t resolve modules from Yarn workspaces symlinks on CI. Here’s how to configure Metro for monorepos with Expo.',
      keywords: [
        'expo metro symlink',
        'yarn workspaces expo',
        'metro unable to resolve module',
        'expo monorepo build',
      ],
    },
  },
  {
    title: 'The PostgreSQL Check Constraint That Silently Corrupted User Data',
    slug: 'postgresql-check-constraint-corrupted-data',
    category: 'PERN',
    excerpt:
      'A poorly written CHECK constraint accepted invalid data but rejected valid updates, corrupting 10,000 user records without any error message.',
    status: 'published',
    content: `

# The PostgreSQL Check Constraint That Silently Corrupted User Data

"We need to ensure users can only have certain status values."

So I added a CHECK constraint.

What I didn't expect: The constraint would happily accept bad data on INSERT, then block all future UPDATES – corrupting thousands of records.

## The Setup

User table with a status column:

\`\`\`sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'active'
);

-- Add constraint to limit status values
ALTER TABLE users 
ADD CONSTRAINT valid_status 
CHECK (status IN ('active', 'inactive', 'banned'));
\`\`\`

Simple enough.

## The Problem

Months later, we introduced a new status: 'pending_verification'.

We updated the application code to use it, but forgot to update the CHECK constraint.

When the app tried to insert a user with status 'pending_verification':

\`\`\`sql
INSERT INTO users (email, status) VALUES ('new@example.com', 'pending_verification');
-- ERROR: check constraint "valid_status" violated
\`\`\`

The app caught this error and retried with a fallback status.

But here's where it gets bad: The fallback logic had a bug. Instead of retrying, it set status to NULL.

\`\`\`javascript
// Buggy fallback
try {
  await db.query('INSERT INTO users...', ['new@example.com', 'pending_verification']);
} catch (err) {
  // Fallback to NULL (BAD!)
  await db.query('INSERT INTO users...', ['new@example.com', null]);
}
\`\`\`

The CHECK constraint allowed NULL (because NULL is not 'active','inactive','banned'? Actually NULL passes the IN check? No – NULL IN (...) returns NULL, which CHECK treats as true. So NULL was allowed.)

**Result**: 10,000 users with status = NULL were inserted over 3 months.

## The Real Disaster

When we finally added 'pending_verification' to the CHECK constraint:

\`\`\`sql
ALTER TABLE users DROP CONSTRAINT valid_status;
ALTER TABLE users ADD CONSTRAINT valid_status 
CHECK (status IN ('active', 'inactive', 'banned', 'pending_verification'));
\`\`\`

Everything seemed fine.

But then attempts to UPDATE existing NULL status users to 'active' started failing:

\`\`\`sql
UPDATE users SET status = 'active' WHERE status IS NULL;
-- ERROR: check constraint "valid_status" violated
\`\`\`

Why? Because the new constraint didn't allow NULL. But the table already had NULL values.

PostgreSQL doesn't validate existing rows when you add a constraint unless you use "NOT VALID". We didn't.

So the constraint was enforced for new writes but ignored existing invalid rows. This created a split-brain state:

- Old NULL rows could never be updated to any valid status (because the UPDATE would check the constraint and fail, since NULL is not allowed)
- New rows could only be inserted with allowed values

We had 10,000 rows stuck with NULL forever – unless we dropped the constraint, fixed them, and re-added it.

## The Fix

### 1. Find all rows violating the new constraint

\`\`\`sql
SELECT COUNT(*) FROM users WHERE status NOT IN ('active', 'inactive', 'banned', 'pending_verification') AND status IS NOT NULL;
-- Also handle NULL separately
SELECT COUNT(*) FROM users WHERE status IS NULL;
\`\`\`

### 2. Fix the rows

\`\`\`sql
-- Update NULL rows to a default
UPDATE users SET status = 'pending_verification' WHERE status IS NULL;
-- Now constraint will pass
\`\`\`

### 3. Re-add constraint with validation

\`\`\`sql
-- Add but don't validate existing rows yet
ALTER TABLE users ADD CONSTRAINT valid_status 
CHECK (status IN ('active', 'inactive', 'banned', 'pending_verification'))
NOT VALID;

-- Validate in a separate transaction (can take a while)
ALTER TABLE users VALIDATE CONSTRAINT valid_status;
\`\`\`

### 4. Add default and NOT NULL

\`\`\`sql
ALTER TABLE users ALTER COLUMN status SET NOT NULL;
ALTER TABLE users ALTER COLUMN status SET DEFAULT 'pending_verification';
\`\`\`

## The Prevention

### Always use NOT VALID + VALIDATE for large tables

\`\`\`sql
-- Don't do this on large tables (takes exclusive lock)
ALTER TABLE users ADD CONSTRAINT ... CHECK (...);

-- Do this instead
ALTER TABLE users ADD CONSTRAINT ... CHECK (...) NOT VALID;
-- No lock, then later:
ALTER TABLE users VALIDATE CONSTRAINT ...; -- Share lock only
\`\`\`

### Test NULL behavior

\`\`\`sql
-- Check how NULL behaves with your constraint
SELECT NULL IN ('active', 'inactive');  -- Returns NULL, not false
-- In CHECK, NULL is treated as TRUE (row passes)
\`\`\`

### Use NOT NULL with CHECK

\`\`\`sql
-- Better pattern
status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'banned'))
\`\`\`

### Add constraints in transactions with validation scripts

\`\`\`sql
BEGIN;
-- First, ensure all data complies
UPDATE users SET status = 'active' WHERE status IS NULL;
-- Then add constraint
ALTER TABLE users ADD CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'banned', 'pending_verification'));
COMMIT;
\`\`\`

## Commands to Audit Constraints

### List all constraints with NOT VALID

\`\`\`sql
SELECT conname, conrelid::regclass, convalidated
FROM pg_constraint
WHERE convalidated = false;
\`\`\`

### Check which rows violate a constraint

\`\`\`sql
-- For CHECK constraint named 'valid_status' on 'users'
SELECT * FROM users WHERE NOT (status IN ('active', 'inactive', 'banned', 'pending_verification'));
\`\`\`

### Force validation with error reporting

\`\`\`sql
-- Will fail and show violating rows
ALTER TABLE users VALIDATE CONSTRAINT valid_status;
-- If fails, query pg_constraint for details
\`\`\`

## What I Learned

- CHECK constraints with NULLs are tricky – NULL passes any CHECK unless you explicitly forbid NULL.
- Adding a constraint to a large table without "NOT VALID" locks the table and can cause downtime.
- Application fallbacks that insert NULL are dangerous.
- Always test constraints with edge values (NULL, empty string, whitespace).

That silent corruption went undetected for 3 months. Now we have automated tests that verify constraints reject invalid data and allow valid updates.

  `,
    tags: [
      'postgresql',
      'check-constraint',
      'data-corruption',
      'null-handling',
      'database-schema',
    ],
    seo: {
      metaTitle:
        'PostgreSQL CHECK Constraint Allowed NULL and Corrupted 10,000 Records',
      metaDescription:
        'A CHECK constraint with NULL handling bug caused 10,000 users to have NULL status, then blocked updates. How to safely add constraints.',
      keywords: [
        'postgresql check constraint null',
        'constraint corruption',
        'add constraint not valid',
        'postgresql data integrity',
      ],
    },
  },
  {
    title:
      'The Next.js Image Optimization That Brought Down Our Vercel Deployment',
    slug: 'nextjs-image-optimization-vercel-deploy-failed',
    category: 'Next.js',
    excerpt:
      'Adding next/image to 500 product images seemed fine until Vercel started timing out during build – because each image triggered a remote fetch.',
    status: 'published',
    content: `

# The Next.js Image Optimization That Brought Down Our Vercel Deployment

"Deployment failed after 45 minutes: Timeout."

Every. Single. Build.

Vercel's build logs showed it hanging at the same step: \`Generating optimized images\`.

## The Setup

We migrated an e-commerce site to Next.js 14 with 500 product pages, each with 3 images.

We used \`next/image\` for automatic optimization:

\`\`\`jsx
import Image from 'next/image';

export default function ProductPage({ product }) {
  return (
    <Image
      src={product.imageUrl}  // External URL (S3)
      width={800}
      height={600}
      alt={product.name}
    />
  );
}
\`\`\`

## The Problem

Next.js optimizes images **at build time** by default for static generation.

Our product pages were static (exported at build time).

For each image, Next.js would:

1. Download the image from the external URL (S3)
2. Optimize it (resize, compress, convert to WebP)
3. Save it to \`.next/static/media\`
4. Generate a \`srcset\` for responsive sizes

With 500 products × 3 images = 1,500 images.

Each image download took ~200ms (S3 latency). That's 300 seconds just in download time.

Plus optimization CPU time.

Total build time: **45+ minutes** → Vercel timeout (45 min limit).

## The Investigation

Vercel logs showed:

\`\`\`
[===] Optimizing images...
  /products/shirt-1/hero.jpg (1/1500) - 200ms
  /products/shirt-1/thumbnail.jpg (2/1500) - 180ms
  ... (45 minutes later)
Error: Build exceeded maximum time limit of 45 minutes.
\`\`\`

I checked \`next.config.js\`:

\`\`\`javascript
module.exports = {
  images: {
    domains: ['my-s3-bucket.s3.amazonaws.com'],
    // No custom loader, no optimization limits
  }
};
\`\`\`

The issue: Next.js was re-optimizing images on every build, even though the source images never changed.

## The Fixes

### 1. Use a custom loader to serve already-optimized images

\`\`\`javascript
// next.config.js
module.exports = {
  images: {
    loader: 'custom',
    loaderFile: './lib/imageLoader.js',
  },
};
\`\`\`

\`\`\`javascript
// lib/imageLoader.js
export default function myImageLoader({ src, width, quality }) {
  // Use a CDN that already has optimized versions
  return "https://cdn.myapp.com/$ {src}?w=$ {width}&q=$ {quality || 75}";
}
\`\`\`

### 2. Pre-optimize images during build with a script

\`\`\`javascript
// scripts/optimize-images.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const images = getAllProductImages();

for (const image of images) {
  const sizes = [640, 750, 828, 1080, 1200, 1920, 2048];
  for (const size of sizes) {
    await sharp(image.original)
      .resize(size)
      .webp({ quality: 80 })
      .toFile('public/optimized/$ {image.id}-$ {size}.webp');
  }
}
\`\`\`

### 3. Use 'unoptimized' for external images (if acceptable)

\`\`\`jsx
<Image
  src={product.imageUrl}
  unoptimized  // Skip Next.js optimization
  width={800}
  height={600}
  alt={product.name}
/>
\`\`\`

### 4. Switch to 'next/legacy/image' (not recommended)

\`\`\`jsx
import Image from 'next/legacy/image';
// This doesn't optimize at build time
\`\`\`

## The Permanent Solution

We moved to **on-demand image optimization** using Vercel's built-in image optimization (which only runs at request time, not build time):

\`\`\`javascript
// next.config.js
module.exports = {
  images: {
    domains: ['my-s3-bucket.s3.amazonaws.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // No build-time optimization for external images
  },
};
\`\`\`

But this still optimizes on first request. To avoid cold starts, we added a warm-up script:

\`\`\`javascript
// scripts/warmup-images.js
const allProductImages = getProductImages();

for (const img of allProductImages) {
  // Request optimized versions to cache them
  await fetch('/_next/image?url=$ {encodeURIComponent(img.url)}&w=800&q=75');
}
\`\`\`

## The Configuration That Finally Worked

\`\`\`javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.myapp.com',
        port: '',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/webp'],
  },
  // Only static export if necessary, otherwise use ISR
  output: 'standalone', // Not 'export'
};
\`\`\`

And we switched to **Incremental Static Regeneration (ISR)** instead of full static export:

\`\`\`jsx
export async function getStaticProps() {
  return {
    props: { product },
    revalidate: 3600, // Revalidate every hour
  };
}
\`\`\`

Now images are optimized on-demand and cached forever.

## The Prevention

### Monitor image optimization build time

\`\`\`bash
# Add timing logs
NEXT_IMAGE_OPTIMIZATION_LOGGING=true next build
\`\`\`

### Use a custom image CDN

We moved to **Imgix** which handles optimization at the edge:

\`\`\`javascript
// lib/imageLoader.js
export default function imgixLoader({ src, width, quality }) {
  const url = new URL('https://myapp.imgix.net/$ {src}');
  url.searchParams.set('w', width);
  url.searchParams.set('q', quality || 75);
  url.searchParams.set('auto', 'format');
  return url.toString();
}
\`\`\`

### Set up build caching

\`\`\`yaml
# vercel.json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "functions": {
    "pages/**/*.png": {
      "maxDuration": 10
    }
  },
  "images": {
    "sizes": [640, 828, 1200]
  }
}
\`\`\`

## What I Learned

- 'next/image' with external URLs downloads and optimizes at build time for static exports.
- For 100+ images, this kills build performance.
- Use 'loader="custom"' or 'unoptimized' for external images.
- Consider on-demand optimization (Vercel or CDN) instead of build-time.
- ISR is better than full static export for image-heavy sites.

That 45-minute build timeout cost us half a day of debugging. Now we never build-optimize more than 50 images. Everything else goes through a CDN.

  `,
    tags: [
      'nextjs',
      'image-optimization',
      'vercel',
      'build-timeout',
      'performance',
    ],
    seo: {
      metaTitle:
        'Next.js Image Optimization Caused Vercel Build Timeout – How to Fix',
      metaDescription:
        '1,500 images optimized at build time caused 45-minute Vercel builds. Learn how to use custom loaders and on-demand optimization.',
      keywords: [
        'nextjs image optimization build',
        'vercel build timeout',
        'next/image external urls',
        'nextjs image loader',
      ],
    },
  },
  {
    title:
      'The Docker Volume That Accumulated 200GB of Logs (And Killed the Server)',
    slug: 'docker-volume-logs-filled-disk-crash',
    category: 'DevOps',
    excerpt:
      'A Docker container wrote logs to an anonymous volume. 6 months later, that volume had 200GB of log files and brought the entire server down.',
    status: 'published',
    content: `

# The Docker Volume That Accumulated 200GB of Logs (And Killed the Server)

"No disk space left."

I SSH'd into our production server. \`df -h\` showed 0% available.

The server had been running for 6 months without issues. What changed?

Nothing. That was the problem.

## The Setup

We ran a Node.js app inside a Docker container:

\`\`\`dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm ci
CMD ["node", "app.js"]
\`\`\`

The app wrote logs to \`/app/logs/app.log\`.

We started the container with:

\`\`\`bash
docker run -d --name myapp myapp:latest
\`\`\`

No volume mount. No log rotation. No size limits.

## The Hidden Accumulation

Docker creates **anonymous volumes** for any directory that writes data inside the container, unless you explicitly mount something there.

\`/app/logs\` became an anonymous volume.

Every day, the app wrote ~1GB of logs.

After 6 months: ~180GB.

But Docker doesn't clean up anonymous volumes automatically. They persist even after the container stops.

Our server had a 250GB disk. The logs took 180GB. The rest was the OS, Docker images, and other containers.

When the disk filled up:

- The app couldn't write logs (but kept retrying, consuming CPU)
- The database container couldn't write WAL files
- SSH became sluggish
- The entire server became unusable

## The Investigation

\`\`\`bash
# Check disk usage
df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/xvda1      250G  250G   0G  100% /

# Find large files
du -sh /var/lib/docker/volumes/* | sort -h
180G    /var/lib/docker/volumes/3f8a9b2c.../_data

# Look inside
sudo ls -la /var/lib/docker/volumes/3f8a9b2c.../_data
-rw-r--r-- 1 root root 180G app.log
\`\`\`

That anonymous volume had 180GB of logs.

## The Emergency Fix

### 1. Stop the container

\`\`\`bash
docker stop myapp
\`\`\`

### 2. Remove the anonymous volume (DANGER: data loss)

\`\`\`bash
# List volumes
docker volume ls

# Remove the specific volume
docker volume rm 3f8a9b2c...
\`\`\`

### 3. Free up space

\`\`\`bash
# Prune everything
docker system prune -a --volumes
\`\`\`

### 4. Restart with proper logging

\`\`\`bash
docker run -d \
  --name myapp \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  --mount type=bind,source=/var/log/myapp,target=/app/logs \
  myapp:latest
\`\`\`

## The Proper Fix

### 1. Use Docker logging driver with limits

\`\`\`bash
# daemon.json (global)
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3",
    "compress": "true"
  }
}
\`\`\`

### 2. Never write logs to a file inside container – write to stdout

\`\`\`javascript
// app.js - use console.log instead of file transport
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.json()
    })
  ]
});
\`\`\`

Then Docker captures stdout and applies log rotation.

### 3. Use a dedicated log volume with rotation

\`\`\`bash
# Create a volume with log rotation using a sidecar container
docker run -d \
  --name log-rotator \
  -v myapp-logs:/logs \
  docker.io/ubuntu:latest \
  sh -c "while true; do logrotate /etc/logrotate.conf; sleep 3600; done"
\`\`\`

### 4. Set up log shipping to external system

\`\`\`bash
# Use fluentd or vector to ship logs to S3/ELK
docker run -d \
  --log-driver=fluentd \
  --log-opt fluentd-address=localhost:24224 \
  myapp:latest
\`\`\`

## The Monitoring

We added disk usage alerts:

\`\`\`bash
#!/bin/bash
# check-disk.sh
USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $USAGE -gt 85 ]; then
  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"Disk usage at $ {USAGE}% on $(hostname)\"}" \
    $SLACK_WEBHOOK
fi
\`\`\`

## The Prevention Checklist

- [ ] Containers write logs to stdout, not files.
- [ ] Docker daemon has log rotation configured.
- [ ] Anonymous volumes are avoided (always name volumes).
- [ ] Disk usage monitoring is in place.
- [ ] 'docker system prune' runs weekly in cron.

## Commands to Audit Volumes

### List all volumes with size

\`\`\`bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  alpine/du:latest /var/lib/docker/volumes
\`\`\`

### Find unused volumes

\`\`\`bash
docker volume ls -qf dangling=true
\`\`\`

### Inspect volume contents

\`\`\`bash
docker run --rm -v my_volume:/data alpine ls -la /data
\`\`\`

## What I Learned

- Anonymous volumes are persistent and grow forever.
- Docker's default logging has no limits unless configured.
- Writing logs to files inside containers is an anti-pattern.
- 'docker system prune -a --volumes' is your friend in emergencies.

That 200GB of logs cost us 2 hours of downtime and a very angry customer. Now every container writes to stdout and we ship logs to Datadog. Disk alerts saved us twice since then.

  `,
    tags: ['docker', 'logs', 'disk-space', 'volume-management', 'devops'],
    seo: {
      metaTitle:
        'Docker Anonymous Volume Filled Disk with 200GB of Logs – Server Crash',
      metaDescription:
        'A Docker container writing logs to an anonymous volume accumulated 200GB over 6 months and crashed the server. How to configure log rotation and avoid anonymous volumes.',
      keywords: [
        'docker log rotation',
        'anonymous volume disk full',
        'docker logs stdout',
        'docker volume prune',
      ],
    },
  },
  {
    title: 'The React Native FlatList That Re-rendered 1,000 Times Per Second',
    slug: 'react-native-flatlist-infinite-render-performance',
    category: 'Expo',
    excerpt:
      'A FlatList with 2,000 items started re-rendering every frame, dropping to 5 FPS. The cause: an inline arrow function passed to renderItem.',
    status: 'published',
    content: `

# The React Native FlatList That Re-rendered 1,000 Times Per Second

"Our app is so slow. Scrolling is janky."

Users were complaining about the product list screen. 2,000 items. Scrolling like a slideshow.

I opened the performance monitor: 5 FPS. CPU at 100%.

## The Setup

A simple product list using Expo + React Native:

\`\`\`jsx
function ProductList({ products }) {
  const [selectedId, setSelectedId] = useState(null);
  
  const renderProduct = (item) => {
    return (
      <ProductCard
        product={item}
        isSelected={item.id === selectedId}
        onPress={() => setSelectedId(item.id)}
      />
    );
  };
  
  return (
    <FlatList
      data={products}
      renderItem={({ item }) => renderProduct(item)}  // ← PROBLEM
      keyExtractor={(item) => item.id}
    />
  );
}
\`\`\`

Looked innocent.

## The Problem

Every time the user scrolled, the FlatList would re-render visible items.

But worse: every state change (like selecting a product) caused **all 2,000 items to re-render**, even the off-screen ones.

Why?

**Inline arrow functions in \`renderItem\` create a new function on every render.**

React Native's FlatList uses \`React.memo\` by default for its items. But when \`renderItem\` is a new function, the memo comparison fails. Every item re-renders.

With 2,000 items, each re-render triggered:

- 2,000 function calls
- 2,000 component instances re-evaluating
- JavaScript thread blocked for 200ms+
- UI drops frames

## The Investigation

I added logs:

\`\`\`jsx
const renderProduct = useCallback((item) => {
  console.log('Rendering product', item.id);
  return <ProductCard ... />;
}, [selectedId]); // Dependency on selectedId

// Still not enough because renderItem is recreated
\`\`\`

The log showed 2,000 "Rendering product" lines on every tap.

## The Fixes

### 1. Extract renderItem outside component

\`\`\`jsx
// Outside component (stable reference)
const renderProduct = ({ item, selectedId, onSelect }) => (
  <ProductCard
    product={item}
    isSelected={item.id === selectedId}
    onPress={() => onSelect(item.id)}
  />
);

function ProductList({ products }) {
  const [selectedId, setSelectedId] = useState(null);
  
  // Use useCallback to memoize the renderItem function
  const renderItem = useCallback(
    ({ item }) => renderProduct({ item, selectedId, onSelect: setSelectedId }),
    [selectedId]
  );
  
  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={useCallback(item => item.id, [])}
    />
  );
}
\`\`\`

### 2. Use 'getItemLayout' for fixed height items

\`\`\`jsx
<FlatList
  getItemLayout={(data, index) => ({
    length: 120,  // Item height
    offset: 120 * index,
    index,
  })}
  // Prevents measurement of off-screen items
/>
\`\`\`

### 3. Implement 'removeClippedSubviews'

\`\`\`jsx
<FlatList
  removeClippedSubviews={true}  // Detach off-screen views
  windowSize={5}  // Only render 5 screens worth of items
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
/>
\`\`\`

### 4. Use 'React.memo' on ProductCard

\`\`\`jsx
const ProductCard = React.memo(({ product, isSelected, onPress }) => {
  // Component logic
}, (prev, next) => {
  // Custom comparison
  return prev.product.id === next.product.id &&
         prev.isSelected === next.isSelected;
});
\`\`\`

## The Ultimate Solution

We refactored to use **FlashList** from Shopify (much more performant):

\`\`\`bash
expo install @shopify/flash-list
\`\`\`

\`\`\`jsx
import { FlashList } from '@shopify/flash-list';

function ProductList({ products }) {
  const [selectedId, setSelectedId] = useState(null);
  
  const renderItem = useCallback(({ item }) => {
    return (
      <ProductCard
        product={item}
        isSelected={item.id === selectedId}
        onPress={() => setSelectedId(item.id)}
      />
    );
  }, [selectedId]);
  
  return (
    <FlashList
      data={products}
      renderItem={renderItem}
      estimatedItemSize={120}
      keyExtractor={item => item.id}
    />
  );
}
\`\`\`

FlashList rendered at 60 FPS even with 10,000 items.

## The Performance Metrics

Before:

- FPS: 5-10
- JS thread: 200ms per interaction
- Memory: 350MB
- Time to render initial list: 3.2s

After:

- FPS: 60
- JS thread: 16ms per interaction
- Memory: 120MB
- Time to render initial list: 0.4s

## Commands to Debug FlatList Performance

### Enable performance monitor

\`\`\`javascript
// In development
import PerfMonitor from 'react-native-performance-monitor';
PerfMonitor.start();
\`\`\`

### Profile with Flipper

\`\`\`bash
# Install Flipper
# Then run your app with:
npx react-native run-ios --configuration Release
\`\`\`

### Log render counts

\`\`\`jsx
const ProductCard = React.memo((props) => {
  const renderCount = useRef(0);
  renderCount.current++;
  console.log('ProductCard render count:', renderCount.current);
  return (...);
});
\`\`\`

## What I Learned

- Never define 'renderItem' inline (always 'useCallback').
- FlatList re-renders all items when parent state changes unless memoized properly.
- 'getItemLayout' is essential for performance with many items.
- FlashList is superior for large lists – switch early.

That 5 FPS disaster taught our team to profile every list that could have more than 100 items. Now we have a rule: "Use FlashList for anything >50 items."

  `,
    tags: ['react-native', 'flatlist', 'performance', 'flashlist', 'expo'],
    seo: {
      metaTitle:
        'React Native FlatList Re-rendering 1,000 Times – Performance Fix',
      metaDescription:
        'An inline renderItem function caused 2,000 items to re-render on every state change. How to optimize FlatList with useCallback, getItemLayout, and FlashList.',
      keywords: [
        'react native flatlist performance',
        'flatlist re-rendering',
        'flashlist vs flatlist',
        'react native scrolling lag',
      ],
    },
  },
  {
    title:
      'The PERN Stack Authentication That Accepted Any Password (For 3 Days)',
    slug: 'pern-bcrypt-compare-always-returns-true-bug',
    category: 'PERN',
    excerpt:
      'A typo in bcrypt.compare made it return true for any password. 1,200 user accounts were accessed without authorization before we caught it.',
    status: 'published',
    content: `

# The PERN Stack Authentication That Accepted Any Password (For 3 Days)

"Someone logged into my account from another country."

Support tickets started pouring in. Users reported unauthorized access, changed passwords, and mysterious orders.

I checked the logs: logins from IPs all over the world, all succeeding.

Our authentication was completely broken.

## The Setup

PERN stack with bcrypt for password hashing:

\`\`\`javascript
// authController.js
const bcrypt = require('bcrypt');

const login = async (req, res) => {
  const { email, password } = req.body;
  
  const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  if (user.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // THE BUG
  const isValid = bcrypt.compare(password, user.rows[0].password_hash);
  
  if (isValid) {
    // Generate JWT
    const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};
\`\`\`

## The Bug

Look closely at this line:

\`\`\`javascript
const isValid = bcrypt.compare(password, user.rows[0].password_hash);
\`\`\`

**bcrypt.compare is asynchronous.** It returns a Promise, not a boolean.

But I forgot the \`await\`.

So \`isValid\` became a Promise object. In JavaScript, \`if (isValid)\` is truthy (any object is truthy).

Therefore, **every login attempt succeeded**, regardless of password.

## The Aftermath

For 3 days, attackers had been brute-forcing email addresses and gaining access with any password.

We found:

- 1,247 accounts accessed without authorization
- 89 fraudulent orders placed
- 24 accounts had their email changed (lockout)
- 3 accounts had payment methods added

The first unauthorized login was 2 hours after deployment.

## The Emergency Response

### 1. Immediate fix

\`\`\`javascript
// Add await
const isValid = await bcrypt.compare(password, user.rows[0].password_hash);
\`\`\`

### 2. Force logout all users

\`\`\`sql
-- Invalidate all sessions
UPDATE users SET jwt_version = jwt_version + 1;
-- Or delete all refresh tokens
DELETE FROM refresh_tokens;
\`\`\`

### 3. Require password reset

\`\`\`sql
UPDATE users SET password_reset_required = true;
\`\`\`

### 4. Audit all account activity

\`\`\`sql
SELECT * FROM audit_log 
WHERE action IN ('login', 'order_created', 'payment_method_added')
  AND created_at > '2024-01-15 10:00:00'
ORDER BY created_at;
\`\`\`

### 5. Notify affected users

We sent emails to every user who logged in during that window, explaining the breach and forcing password reset.

## The Prevention

### 1. Use TypeScript

\`\`\`typescript
// TypeScript would have caught this
const isValid: boolean = bcrypt.compare(password, hash);
// Error: Type 'Promise<boolean>' is not assignable to type 'boolean'
\`\`\`

### 2. ESLint rule: no-misused-promises

\`\`\`json
{
  "rules": {
    "@typescript-eslint/no-misused-promises": "error"
  }
}
\`\`\`

### 3. Wrap bcrypt in a utility with proper error handling

\`\`\`javascript
// utils/password.js
const comparePassword = async (plain, hash) => {
  if (!plain || !hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch (error) {
    console.error('bcrypt compare error:', error);
    return false;
  }
};
\`\`\`

### 4. Add integration test for auth

\`\`\`javascript
describe('Login', () => {
  it('should reject wrong password', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'test@example.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });
  
  it('should reject invalid password format', async () => {
    // This would have caught the Promise bug because the test would fail
  });
});
\`\`\`

### 5. Add logging for auth failures (and successes to detect anomalies)

\`\`\`javascript
if (!isValid) {
  logger.warn(\`Failed login attempt for $ {email} from $ {req.ip}\`);
}
// Also log successes for audit
logger.info(\`Successful login for $ {email} from $ {req.ip}\`);
\`\`\`

## The Lessons

### Async/await discipline: never forget await on async functions.

### Use tools (TypeScript, ESLint) that catch these mistakes.

### Test authentication edge cases – including wrong passwords.

### Monitor for unusual login patterns (same user from multiple IPs).

## Commands to Audit After Similar Bug

### Find all async calls without await

\`\`\`bash
# Grep for bcrypt.compare without await
grep -r "bcrypt\.compare" --include="*.js" | grep -v "await"
\`\`\`

### Check login logs for anomalies

\`\`\`bash
# Show IPs with many successful logins to different users
grep "Successful login" auth.log | awk '{print $NF}' | sort | uniq -c | sort -rn | head -10
\`\`\`

## What I Learned

That missing 'await' cost us:

- 3 days of security breach
- 1,200 compromised accounts
- Legal liability (we had to report to GDPR authorities)
- $15,000 in fraudulent orders (we reimbursed)
- 2 engineers working 48 hours straight on incident response

Now we have a pre-commit hook that warns on any 'bcrypt.compare' without 'await'. And we use TypeScript everywhere.

Authentication is not the place for shortcuts.

  `,
    tags: [
      'pern',
      'bcrypt',
      'authentication',
      'async-await',
      'security-breach',
    ],
    seo: {
      metaTitle:
        'PERN Stack Auth Bug: bcrypt.compare Without Await Accepted Any Password',
      metaDescription:
        'Missing await on bcrypt.compare caused every password to be accepted for 3 days. 1,200 accounts compromised. How to prevent async auth bugs.',
      keywords: [
        'bcrypt compare await',
        'authentication bypass',
        'pern stack security',
        'async await bug',
      ],
    },
  },
  {
    title: 'The MongoDB Shard Key That Made 99% of Queries Scan Every Shard',
    slug: 'mongodb-shard-key-bad-choice-performance',
    category: 'MERN',
    excerpt:
      'Choosing the wrong shard key turned our 10-shard cluster into a broadcast storm – every query hit all shards, and response times went from 50ms to 5 seconds.',
    status: 'published',
    content: `

# The MongoDB Shard Key That Made 99% of Queries Scan Every Shard

We had outgrown a single MongoDB replica set. 5TB of order data. 2 billion documents. Reads were getting slower every week.

The solution: sharding. But one bad decision on the shard key nearly destroyed our performance.

## The Setup

MongoDB Atlas cluster with 10 shards. The collection: \`orders\` (2B docs).

I chose \`order_date\` as the shard key – seemed natural. Most queries filter by date range.

\`\`\`javascript
sh.shardCollection("ecommerce.orders", { "order_date": 1 })
\`\`\`

## The Disaster

Within hours after sharding, every query became painfully slow.

\`\`\`javascript
// Our most common query – get a user's recent orders
db.orders.find({ user_id: "12345", order_date: { $gte: ISODate("2024-01-01") } })
// Took 5.2 seconds instead of 50ms
\`\`\`

Why? Because \`user_id\` was **not** part of the shard key.

MongoDB had no idea which shard contained that user's orders. So it **broadcast the query to all 10 shards**, waited for all of them to respond, then merged results.

99% of our production queries were scatter‑gather.

## The Root Cause

A good shard key must have **high cardinality** (many unique values) and **good write distribution**. \`order_date\` had decent cardinality (one per day) but writes were evenly distributed.

The problem: our read pattern was mostly by \`user_id\`, not by date.

We had optimized for writes, not reads.

## The Fix

We chose a **compound shard key**: \`{ user_id: "hashed", order_date: 1 }\`

\`\`\`javascript
// New shard key (requires new collection – can't change shard key online)
sh.shardCollection("ecommerce.orders_new", { "user_id": "hashed", "order_date": 1 })
\`\`\`

Now queries with \`user_id\` are targeted to a single shard. Queries with only date still scatter, but those are rare.

## The Migration

We had to migrate 2B documents to a new collection – online, with no downtime.

\`\`\`javascript
// Use $merge to move data incrementally
db.orders.aggregate([
  { $match: { order_date: { $lt: cutoff } } },
  { $merge: { into: "orders_new", on: "_id", whenMatched: "replace" } }
])
\`\`\`

We ran this in batches over a weekend.

## What I Learned

- **Shard key is forever** – choose carefully.
- **Query pattern > write pattern** – optimize for your most frequent reads.
- **Hashed shard keys** give even distribution for high‑cardinality fields.
- **Compound shard keys** can target common query patterns.

Now we use a shard key analysis script before any sharding:

\`\`\`javascript
// Analyze query distribution
db.system.profile.find({ "command.find": "orders" }).forEach(log => {
  console.log(log.command.filter);
})
\`\`\`

That scatter‑gather disaster cost us 2 days of debugging and one sleepless weekend. Now every new collection gets a shard key designed for our read patterns first.
  `,
    tags: ['mongodb', 'sharding', 'performance', 'shard-key', 'atlas'],
    seo: {
      metaTitle:
        'MongoDB Shard Key Disaster: Why Choosing order_date Made Queries Scan All 10 Shards',
      metaDescription:
        'A bad shard key turned our 10‑shard cluster into a broadcast storm. How to choose a compound or hashed shard key for real query patterns.',
      keywords: [
        'mongodb shard key',
        'scatter gather query',
        'compound shard key',
        'hashed shard key',
        'mongodb sharding performance',
      ],
    },
  },
  {
    title:
      'The Prisma Migration That Dropped a Production Column (No Way to Recover)',
    slug: 'prisma-migration-dropped-column-production',
    category: 'PERN',
    excerpt:
      'A Prisma migration that looked safe – renaming a column – turned into a silent data loss because we forgot to add a @map attribute. 50,000 rows lost their values.',
    status: 'published',
    content: `

# The Prisma Migration That Dropped a Production Column (No Way to Recover)

"Where did the user's phone number go?"

We had a simple schema change: rename \`phone\` to \`phone_number\`.

I changed the Prisma schema, ran \`prisma migrate dev\`, and pushed to production.

But the column wasn't renamed – it was **dropped**. And all 50,000 phone numbers were gone.

## The Setup

Original schema:

\`\`\`prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  phone String  // ← this column
}
\`\`\`

I changed it to:

\`\`\`prisma
model User {
  id           Int    @id @default(autoincrement())
  email        String @unique
  phone_number String  // ← renamed
}
\`\`\`

## The Migration

\`\`\`bash
npx prisma migrate dev --name rename_phone_column
\`\`\`

Prisma generated this SQL:

\`\`\`sql
-- Prisma generated (WRONG!)
ALTER TABLE "User" DROP COLUMN "phone";
ALTER TABLE "User" ADD COLUMN "phone_number" TEXT;
\`\`\`

Instead of \`RENAME COLUMN\`, Prisma dropped and recreated the column. **All data in \`phone\` was lost.**

Why? Because Prisma doesn't know you want to rename. It sees a removed field and a new field – and assumes you want to drop+add.

## The Fix (Prevention)

You must use \`@map\` to tell Prisma the underlying database column name:

\`\`\`prisma
model User {
  id           Int    @id @default(autoincrement())
  email        String @unique
  phone_number String @map("phone")  // ← maps to existing column name
}
\`\`\`

Then the migration becomes a no‑op (column already exists).

After deploying, you can later remove the \`@map\` in a second migration.

## The Recovery

We had to restore from a backup taken 6 hours before.

\`\`\`bash
# Restore from AWS RDS snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier mydb-restored \
  --db-snapshot-identifier mydb-snapshot
\`\`\`

Then manually export the \`phone\` column and join back. Lost 4 hours of new orders.

## What I Learned

- **Prisma doesn't auto‑detect renames** – you must use \`@map\`.
- **Always check the generated SQL** before applying to production.
- **Use \`prisma migrate diff\`** to see what will happen.
- **Never trust a migration without a backup**.

Now our CI runs \`prisma migrate diff\` and fails if it sees \`DROP COLUMN\` on non‑nullable fields.

  `,
    tags: ['prisma', 'migration', 'data-loss', 'postgresql', '@map'],
    seo: {
      metaTitle:
        'Prisma Migration Dropped Column Instead of Renaming – 50,000 Rows Lost',
      metaDescription:
        "Prisma's migrate dev generated DROP+ADD instead of RENAME COLUMN. How to use @map to safely rename fields without data loss.",
      keywords: [
        'prisma rename column',
        'prisma migration data loss',
        '@map attribute',
        'prisma migrate diff',
      ],
    },
  },
  {
    title:
      'The Next.js Parallel Route That Caused an Infinite Loop (And Killed the Server)',
    slug: 'nextjs-parallel-route-infinite-loop',
    category: 'Next.js',
    excerpt:
      'Parallel routes in Next.js 14 seemed perfect for a dashboard layout – until a missing default.js file created an infinite rendering loop that maxed out CPU.',
    status: 'published',
    content: `

# The Next.js Parallel Route That Caused an Infinite Loop (And Killed the Server)

"CPU is at 100% and won't come down."

I had just deployed a new dashboard with parallel routes – one slot for the main content, one for a notifications panel.

Within minutes, the server was unresponsive.

## The Setup

App Router with parallel slots:

\`\`\`
app/
  dashboard/
    @main/
      page.js
    @notifications/
      page.js
    layout.js
\`\`\`

\`\`\`jsx
// app/dashboard/layout.js
export default function DashboardLayout({ main, notifications }) {
  return (
    <div>
      <aside>{notifications}</aside>
      <main>{main}</main>
    </div>
  );
}
\`\`\`

No \`default.js\` files. I thought they were optional.

## The Infinite Loop

When a user navigated from \`/dashboard\` to \`/dashboard/settings\`, Next.js tried to render the slots.

But because there was no \`default.js\` for the \`@notifications\` slot when a route didn't explicitly define it, Next.js kept re‑trying to match the route – causing an infinite loop.

The server's event loop got stuck. CPU spiked to 100%. Requests timed out after 60 seconds.

## The Fix

Add \`default.js\` to each parallel slot folder:

\`\`\`jsx
// app/dashboard/@notifications/default.js
export default function Default() {
  return null; // or a fallback UI
}
\`\`\`

And for \`@main/default.js\` as well.

Now Next.js knows what to render when the active route doesn't match the slot.

## What I Learned

- **Parallel routes always need \`default.js\`** for every slot, even if just returning \`null\`.
- **Test navigation to sub‑routes** – the bug only appeared on second‑level pages.
- **Use \`loading.js\`** to prevent unexpected behavior during transitions.

That infinite loop took down our dashboard for 30 minutes. Now every parallel slot has a \`default.js\` in our starter template.

  `,
    tags: [
      'nextjs',
      'parallel-routes',
      'infinite-loop',
      'app-router',
      'default.js',
    ],
    seo: {
      metaTitle:
        'Next.js Parallel Route Missing default.js Caused Infinite Loop – Server Crash',
      metaDescription:
        'Parallel slots without default.js can cause infinite rendering loops. How to fix and prevent Next.js 14 parallel route issues.',
      keywords: [
        'nextjs parallel routes',
        'default.js missing',
        'infinite loop nextjs',
        'app router slots',
      ],
    },
  },
  {
    title:
      'The Docker Network That Leaked Host Ports (And Exposed Redis to the Internet)',
    slug: 'docker-network-host-mode-port-leak',
    category: 'DevOps',
    excerpt:
      "Using 'network_mode: host' on a Redis container seemed convenient – until we realized it exposed Redis directly to the public internet without authentication.",
    status: 'published',
    content: `

# The Docker Network That Leaked Host Ports (And Exposed Redis to the Internet)

"Your Redis instance is public and has no password."

That was a message from our security team at 2 AM. Someone had scanned our IP and found an open Redis port – 6379 – accessible from anywhere.

## The Setup

We ran Redis in a Docker container for caching. For performance reasons, we used host networking:

\`\`\`yaml
# docker-compose.yml
services:
  redis:
    image: redis:7
    network_mode: host
    # No port mapping because host mode bypasses Docker's network
\`\`\`

## The Problem

\`network_mode: host\` makes the container use the host's network stack directly. The Redis port (6379) binds to all interfaces (0.0.0.0) by default.

With host networking, there is **no Docker firewall** protecting the port. It's as if Redis is installed directly on the host.

Our cloud firewall (AWS Security Group) was configured to allow port 6379 only from our VPC – but we had accidentally left a rule open to 0.0.0.0/0 during testing.

Result: Redis was publicly accessible. No password. Anyone could flushall, read cache data (including session tokens), and potentially execute Lua scripts.

## The Fix

1. **Remove host network mode** – use bridge network with port mapping.
2. **Add a Redis password** (even if network is internal).
3. **Bind Redis to localhost only** (if using host mode, set 'bind 127.0.0.1').

New config:

\`\`\`yaml
services:
  redis:
    image: redis:7
    command: redis-server --requirepass $ {REDIS_PASSWORD} --bind 0.0.0.0
    ports:
      - "127.0.0.1:6379:6379"  # bind only to localhost
    networks:
      - internal
\`\`\`

## What I Learned

- **Host networking bypasses all Docker security isolation** – only use if absolutely necessary.
- **Never run Redis without a password** in any environment.
- **Port binding to 127.0.0.1** prevents external access even if firewall rules slip.
- **Regular security scans** (e.g., 'nmap -p 6379 your-ip') would have caught this.

That exposed Redis taught us to treat every container as potentially public. Now we have a default 'redis.conf' with 'requirepass' and 'bind 127.0.0.1'.

  `,
    tags: ['docker', 'redis', 'network-mode-host', 'security', 'port-exposure'],
    seo: {
      metaTitle:
        'Docker Host Network Mode Exposed Redis to the Internet – No Password',
      metaDescription:
        "Using network_mode: host bypassed Docker's firewall, exposing Redis publicly. How to secure Redis with passwords and port binding.",
      keywords: [
        'docker host network mode',
        'redis exposed',
        'redis no password',
        'docker network security',
      ],
    },
  },
  {
    title:
      'The Expo Splash Screen That Never Hid (And Users Thought the App Was Frozen)',
    slug: 'expo-splash-screen-never-hid',
    category: 'Expo',
    excerpt:
      "A misconfigured splash screen stayed visible forever on Android because we forgot to call 'SplashScreen.hideAsync()' after an async operation that threw an error.",
    status: 'published',
    content: `

# The Expo Splash Screen That Never Hid (And Users Thought the App Was Frozen)

"Our app loads forever on Android. The splash screen just stays there."

25% of our Android users saw an infinite splash screen. They thought the app was frozen and uninstalled.

## The Setup

Expo’s splash screen with a custom loading flow:

\`\`\`javascript
// App.js
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await loadFonts();
        await loadUserData();
        // ... other async setup
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) return null;
  return <RootNavigator />;
}
\`\`\`

## The Bug

One of the async setup functions – 'loadUserData()' – would sometimes throw an error when the device had no network (e.g., timeout).

The error was caught and logged, but 'setAppIsReady(true)' was still called in the 'finally' block.

However, 'SplashScreen.hideAsync()' is **not** guaranteed to work if called immediately after an error that might have left the native splash controller in an inconsistent state.

On Android specifically, if you call 'hideAsync()' while another native operation is pending, the call silently fails – and the splash screen remains visible forever.

## The Fix

\`\`\`javascript
// Proper error handling
async function prepare() {
  try {
    await loadFonts();
    await loadUserData();
    setAppIsReady(true);
  } catch (e) {
    console.error('Setup failed:', e);
    // Show an error screen instead of frozen splash
    setError(e);
    setAppIsReady(true); // still hide splash
  }
}

// In the hide effect, add a delay and retry
useEffect(() => {
  if (appIsReady) {
    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        // Retry after 500ms
        setTimeout(() => SplashScreen.hideAsync(), 500);
      }
    };
    hideSplash();
  }
}, [appIsReady]);
\`\`\`

Even better: Use 'expo-splash-screen's 'autoHide' option and only prevent when necessary:

\`\`\`javascript
// app.json
{
  "expo": {
    "splash": {
      "autoHide": false
    }
  }
}
// then manually hide only after all critical loads
\`\`\`

## What I Learned

- **Always handle errors in splash screen setup** – an unhandled rejection can prevent hide.
- **Hide splash screen in a 'finally' block, but add a safety timeout.**
- **Test on low‑end Android devices** – they are more prone to native race conditions.
- **Add a timeout** – if splash isn't hidden after 10 seconds, force hide.

That infinite splash screen cost us 2,000 uninstalls. Now we have a forced timeout and retry logic.

  `,
    tags: [
      'expo',
      'splash-screen',
      'android',
      'async-error',
      'user-experience',
    ],
    seo: {
      metaTitle:
        'Expo Splash Screen Never Hid on Android – Users Thought App Was Frozen',
      metaDescription:
        'An error during async setup prevented SplashScreen.hideAsync() from working. How to fix with error handling and retry logic.',
      keywords: [
        'expo splash screen stuck',
        'hideAsync not working',
        'expo android splash',
        'splash screen timeout',
      ],
    },
  },
  {
    title:
      'The Prisma Raw Query That Leaked an Entire Table (Because of Template Literals)',
    slug: 'prisma-raw-query-sql-injection-leak',
    category: 'PERN',
    excerpt:
      "Using JavaScript template literals in Prisma's $queryRaw exposed us to SQL injection. A malicious user dumped our entire user table – 500k emails.",
    status: 'published',
    content: `

# The Prisma Raw Query That Leaked an Entire Table (Because of Template Literals)

"Someone is downloading our entire user list."

Our analytics showed a spike in API calls, and then an export of the 'users' table appeared on a public pastebin.

How? A search endpoint with a raw SQL query that was vulnerable to SQL injection.

## The Setup

We had a search feature that allowed filtering by product name. The user input was passed directly into a Prisma raw query:

\`\`\`javascript
// BAD – vulnerable to SQL injection
const searchProducts = async (searchTerm) => {
  return await prisma.$queryRaw\`
    SELECT * FROM products 
    WHERE name ILIKE '%\${searchTerm}%'
  \`;
};
\`\`\`

## The Attack

A malicious user entered this search term:

\`\`\`
' OR 1=1; SELECT email, password_hash FROM users; --
\`\`\`

The executed SQL became:

\`\`\`sql
SELECT * FROM products 
WHERE name ILIKE '%' OR 1=1; SELECT email, password_hash FROM users; --%'
\`\`\`

This returned all products (because 'OR 1=1') and then executed a second query that dumped the entire 'users' table.

Prisma executed both queries because '$queryRaw' can run multiple statements separated by semicolons.

## The Fix

**Never use template literals for variable interpolation in raw queries.** Use parameterized placeholders:

\`\`\`javascript
// SAFE – using Prisma.sql template tag with parameters
const searchProducts = async (searchTerm) => {
  return await prisma.$queryRaw\`
    SELECT * FROM products 
    WHERE name ILIKE ${`%$ {searchTerm}%`}
  \`;
};
\`\`\`

Prisma automatically escapes and parameterizes '$ {...}' inside '$queryRaw' when you use the 'Prisma.sql' tag (or just the template literal with '$queryRaw' – actually '$queryRaw' does parameterize if you pass values as separate arguments). The correct way:

\`\`\`javascript
// Also safe: use $queryRaw with array of values
return await prisma.$queryRaw(
  'SELECT * FROM products WHERE name ILIKE $1',
  '%$ {searchTerm}%'
);
\`\`\`

But the easiest: **Avoid raw queries whenever possible.** Use Prisma's type‑safe query builder:

\`\`\`javascript
const searchProducts = async (searchTerm) => {
  return await prisma.product.findMany({
    where: {
      name: { contains: searchTerm, mode: 'insensitive' }
    }
  });
};
\`\`\`

## The Aftermath

We had to:
- Rotate all user passwords.
- Notify 500k users of the breach.
- Report to data protection authorities.
- Hire an external security firm for an audit.

Total cost: ~$50,000 and 2 months of bad press.

## What I Learned

- **Prisma raw queries are dangerous** – prefer Prisma's query builder.
- **If you must use raw SQL, always use parameterized placeholders.**
- **Never concatenate user input into SQL strings** – no exceptions.
- **Use a linter (eslint-plugin-security) to detect string concatenation in SQL.**

That SQL injection taught our team that ORMs don't automatically protect you – raw queries bypass all safeguards.

  `,
    tags: ['prisma', 'sql-injection', 'security', 'raw-query', 'data-breach'],
    seo: {
      metaTitle: 'Prisma Raw Query SQL Injection Leaked 500k User Emails',
      metaDescription:
        'Using template literals in $queryRaw exposed us to SQL injection. How to safely use parameterized queries and avoid raw SQL.',
      keywords: [
        'prisma sql injection',
        'raw query vulnerability',
        '$queryRaw security',
        'parameterized queries prisma',
      ],
    },
  },
];
