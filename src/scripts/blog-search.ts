type PostEntry = { slug: string; title: string; description: string; tags: string[] };

export function setupBlogSearch(indexUrl: string) {
  const input = document.getElementById('blog-search') as HTMLInputElement | null;
  if (!input) return;

  const controller = new AbortController();
  const { signal } = controller;

  document.addEventListener('astro:before-swap', () => controller.abort(), { once: true });

  let index: PostEntry[] = [];

  fetch(indexUrl)
    .then((r) => r.json())
    .then((data: PostEntry[]) => {
      index = data;
    })
    .catch(() => {});

  input.addEventListener(
    'input',
    () => {
      const q = input.value.trim().toLowerCase();
      const wrappers = document.querySelectorAll<HTMLElement>('[data-post]');
      const empty = document.getElementById('search-empty');
      let visible = 0;

      wrappers.forEach((el) => {
        const slug = el.dataset.slug ?? '';
        const entry = index.find((p) => p.slug === slug);
        const matches =
          !q ||
          entry?.title.toLowerCase().includes(q) ||
          entry?.description.toLowerCase().includes(q) ||
          entry?.tags.some((t) => t.toLowerCase().includes(q));

        el.hidden = !matches;
        if (matches) visible++;
      });

      if (empty) empty.classList.toggle('hidden', visible > 0 || !q);
    },
    { signal },
  );
}
