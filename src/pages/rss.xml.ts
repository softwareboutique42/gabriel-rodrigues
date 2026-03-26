import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => data.lang === 'en');
  const sorted = posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'Gabriel Rodrigues — Blog',
    description:
      'Senior Frontend Engineer writing about Vue, Angular, TypeScript, and web architecture.',
    site: context.site!,
    items: sorted.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/en/blog/${post.id.replace('en/', '')}/`,
      categories: post.data.tags,
    })),
    customData: '<language>en</language>',
  });
}
