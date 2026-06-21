import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tentrist.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  // Marketing pages
  const marketingPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/features`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Docs pages
  const docsPages = [
    { href: "/docs", priority: 0.8 },
    { href: "/docs/quick-start", priority: 0.8 },
    { href: "/docs/first-job", priority: 0.8 },
    { href: "/docs/node-registration", priority: 0.8 },
    { href: "/docs/gpu-orchestration", priority: 0.7 },
    { href: "/docs/heartbeat", priority: 0.7 },
    { href: "/docs/checkpointing", priority: 0.7 },
    { href: "/docs/sla-enforcement", priority: 0.7 },
    { href: "/docs/authentication", priority: 0.7 },
    { href: "/docs/api-rest", priority: 0.8 },
  ].map(({ href, priority }) => ({
    url: `${BASE_URL}${href}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority,
  }));

  // Explore pages
  const explorePages = [
    { href: "/explore", priority: 0.8 },
    { href: "/explore/stake", priority: 0.8 },
    { href: "/explore/stats", priority: 0.8 },
    { href: "/explore/activity", priority: 0.7 },
    { href: "/explore/reputation", priority: 0.7 },
    { href: "/explore/slashing", priority: 0.7 },
    { href: "/explore/jobs", priority: 0.8 },
    { href: "/explore/nodes", priority: 0.8 },
  ].map(({ href, priority }) => ({
    url: `${BASE_URL}${href}`,
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority,
  }));

  return [...marketingPages, ...docsPages, ...explorePages];
}
