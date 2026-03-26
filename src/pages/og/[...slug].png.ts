import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const fontPath = path.resolve(
  'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff',
);
let fontData: ArrayBuffer;
try {
  fontData = fs.readFileSync(fontPath).buffer as ArrayBuffer;
} catch {
  // Fallback: fetch from Google Fonts at build time
  const res = await fetch(
    'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap',
  );
  const css = await res.text();
  const urlMatch = css.match(/src: url\(([^)]+)\)/);
  if (urlMatch) {
    const fontRes = await fetch(urlMatch[1]);
    fontData = await fontRes.arrayBuffer();
  } else {
    // Ultimate fallback: use a system-safe buffer
    fontData = new ArrayBuffer(0);
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const enPosts = await getCollection('blog', ({ id }) => id.startsWith('en/'));
  const ptPosts = await getCollection('blog', ({ id }) => id.startsWith('pt/'));
  const posts = [...enPosts, ...ptPosts];
  return posts.map((post) => {
    const [lang, ...rest] = post.id.split('/');
    const slug = rest.join('/');
    return {
      params: { slug: `${lang}/blog/${slug}` },
      props: { title: post.data.title, tags: post.data.tags, lang },
    };
  });
};

export const GET: APIRoute = async ({ props }) => {
  const { title, tags, lang } = props as { title: string; tags: string[]; lang: string };

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          backgroundColor: '#0e0e0e',
          fontFamily: 'JetBrains Mono',
        },
        children: [
          // Top: GR_ branding
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              },
              children: [
                {
                  type: 'span',
                  props: {
                    style: {
                      fontSize: '24px',
                      color: '#8eff71',
                      letterSpacing: '2px',
                    },
                    children: 'GR_',
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: {
                      fontSize: '16px',
                      color: '#666',
                      letterSpacing: '1px',
                    },
                    children: 'gabriel-rodrigues.com',
                  },
                },
              ],
            },
          },
          // Middle: Title
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              },
              children: [
                {
                  type: 'h1',
                  props: {
                    style: {
                      fontSize: title.length > 60 ? '36px' : '48px',
                      color: '#f0f0f0',
                      lineHeight: 1.2,
                      letterSpacing: '-1px',
                      margin: 0,
                    },
                    children: title,
                  },
                },
                // Tags
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap',
                    },
                    children: tags.slice(0, 4).map((tag: string) => ({
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '14px',
                          color: '#00e5ff',
                          backgroundColor: 'rgba(0, 229, 255, 0.1)',
                          padding: '4px 12px',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                        },
                        children: tag,
                      },
                    })),
                  },
                },
              ],
            },
          },
          // Bottom: Author
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid rgba(142, 255, 113, 0.15)',
                paddingTop: '20px',
              },
              children: [
                {
                  type: 'span',
                  props: {
                    style: { fontSize: '18px', color: '#ccc' },
                    children: 'Gabriel Rodrigues',
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: {
                      fontSize: '14px',
                      color: '#666',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                    },
                    children:
                      lang === 'pt' ? 'Engenheiro Frontend Senior' : 'Senior Frontend Engineer',
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'JetBrains Mono',
          data: fontData,
          weight: 400,
          style: 'normal',
        },
      ],
    },
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
