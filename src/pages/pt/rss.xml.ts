import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => data.lang === 'pt');
  const sorted = posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'Gabriel Rodrigues — Blog',
    description:
      'Engenheiro Frontend Senior escrevendo sobre Vue, Angular, TypeScript e arquitetura web.',
    site: context.site!,
    items: sorted.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/pt/blog/${post.id.replace('pt/', '')}/`,
      categories: post.data.tags,
    })),
    customData: '<language>pt-BR</language>',
  });
}
