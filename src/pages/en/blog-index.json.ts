import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog', ({ data }) => data.lang === 'en');
  const sorted = posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  const index = sorted.map((p) => ({
    slug: p.id.replace('en/', '').replace('.md', ''),
    title: p.data.title,
    description: p.data.description,
    tags: p.data.tags,
  }));
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  });
};
