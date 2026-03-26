import fs from 'node:fs';
import path from 'node:path';
import TurndownService from 'turndown';

const USER_ID = 17658;
const SITE = 'pt.stackoverflow';
const BASE_URL = 'https://api.stackexchange.com/2.3';
const OUTPUT_PATH = path.resolve('data/stackoverflow.md');

const turndown = new TurndownService({
  codeBlockStyle: 'fenced',
  headingStyle: 'atx',
});

// --- API helpers ---

async function fetchAPI(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('site', SITE);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function fetchAllPages(endpoint, params = {}) {
  const allItems = [];
  let page = 1;

  while (true) {
    const data = await fetchAPI(endpoint, { ...params, page });
    allItems.push(...(data.items || []));

    if (data.backoff) {
      console.log(`  Backoff: waiting ${data.backoff}s...`);
      await delay(data.backoff * 1000);
    }

    if (!data.has_more) break;
    page++;
    await delay(500);
  }

  return allItems;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Data fetchers ---

async function fetchProfile() {
  console.log('Fetching profile...');
  const data = await fetchAPI(`/users/${USER_ID}`);
  return data.items[0];
}

async function fetchTopAnswerTags() {
  console.log('Fetching top answer tags...');
  return fetchAllPages(`/users/${USER_ID}/top-answer-tags`, { pagesize: 30 });
}

async function fetchTopQuestionTags() {
  console.log('Fetching top question tags...');
  return fetchAllPages(`/users/${USER_ID}/top-question-tags`, { pagesize: 30 });
}

async function fetchAnswers() {
  console.log('Fetching answers...');
  const answers = await fetchAllPages(`/users/${USER_ID}/answers`, {
    order: 'desc',
    sort: 'votes',
    pagesize: 100,
    filter: '!nNPvSNdWme',
  });
  console.log(`  Found ${answers.length} answers`);
  return answers;
}

async function fetchQuestions() {
  console.log('Fetching questions...');
  const questions = await fetchAllPages(`/users/${USER_ID}/questions`, {
    order: 'desc',
    sort: 'votes',
    pagesize: 100,
    filter: '!9_bDDxJY5',
  });
  console.log(`  Found ${questions.length} questions`);
  return questions;
}

async function fetchQuestionTitles(questionIds) {
  console.log(`Fetching titles for ${questionIds.length} questions...`);
  const titles = {};
  const chunks = [];

  for (let i = 0; i < questionIds.length; i += 100) {
    chunks.push(questionIds.slice(i, i + 100));
  }

  for (const chunk of chunks) {
    const ids = chunk.join(';');
    const data = await fetchAPI(`/questions/${ids}`);
    for (const q of data.items || []) {
      titles[q.question_id] = { title: q.title, link: q.link, tags: q.tags || [] };
    }
    if (chunks.length > 1) await delay(500);
  }

  return titles;
}

// --- Markdown generation ---

function formatDate(epoch) {
  return new Date(epoch * 1000).toISOString().split('T')[0];
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

function htmlToMarkdown(html) {
  if (!html) return '_No body available_';
  return turndown.turndown(html);
}

function generateMarkdown(profile, answerTags, questionTags, answers, questions, questionTitles) {
  const lines = [];
  const today = new Date().toISOString().split('T')[0];

  // Header
  lines.push(`# Stack Overflow Portuguese — Gabriel Rodrigues`);
  lines.push('');
  lines.push(`> Data fetched on ${today} from [pt.stackoverflow.com](https://pt.stackoverflow.com/users/${USER_ID})`);
  lines.push('');

  // Profile stats
  lines.push('## Profile Stats');
  lines.push('');
  lines.push(`- **Reputation**: ${profile.reputation?.toLocaleString('en-US') ?? 'N/A'}`);
  lines.push(`- **Member since**: ${formatDate(profile.creation_date)}`);
  lines.push(`- **Answers**: ${answers.length} | **Questions**: ${questions.length}`);
  const badges = profile.badge_counts || {};
  lines.push(`- **Badges**: ${badges.gold ?? 0} gold · ${badges.silver ?? 0} silver · ${badges.bronze ?? 0} bronze`);
  lines.push('');

  // Top tags (merge answer and question tags)
  const tagMap = {};
  for (const t of answerTags) {
    tagMap[t.tag_name] = tagMap[t.tag_name] || { answers: 0, answerScore: 0, questions: 0, questionScore: 0 };
    tagMap[t.tag_name].answers = t.answer_count;
    tagMap[t.tag_name].answerScore = t.answer_score;
  }
  for (const t of questionTags) {
    tagMap[t.tag_name] = tagMap[t.tag_name] || { answers: 0, answerScore: 0, questions: 0, questionScore: 0 };
    tagMap[t.tag_name].questions = t.question_count;
    tagMap[t.tag_name].questionScore = t.question_score;
  }

  const sortedTags = Object.entries(tagMap)
    .sort((a, b) => (b[1].answerScore + b[1].questionScore) - (a[1].answerScore + a[1].questionScore));

  lines.push('## Top Tags');
  lines.push('');
  lines.push('| Tag | Answers | Answer Score | Questions | Question Score |');
  lines.push('|-----|---------|-------------|-----------|----------------|');
  for (const [name, data] of sortedTags) {
    lines.push(`| ${name} | ${data.answers} | ${data.answerScore} | ${data.questions} | ${data.questionScore} |`);
  }
  lines.push('');

  // Answers
  lines.push(`## Answers (${answers.length} total, sorted by votes)`);
  lines.push('');

  for (const answer of answers) {
    const qInfo = questionTitles[answer.question_id] || {};
    const title = decodeHtmlEntities(qInfo.title || `Question #${answer.question_id}`);
    const link = qInfo.link || `https://pt.stackoverflow.com/questions/${answer.question_id}`;
    const accepted = answer.is_accepted ? ' ✓' : '';
    const tags = (qInfo.tags || []).map(decodeHtmlEntities).join(', ');

    lines.push(`### [${title}](${link}) — Score: ${answer.score}${accepted}`);
    lines.push(`**Tags:** ${tags || 'N/A'} | **Date:** ${formatDate(answer.creation_date)}`);
    lines.push('');
    lines.push(htmlToMarkdown(answer.body));
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Questions
  lines.push(`## Questions (${questions.length} total, sorted by votes)`);
  lines.push('');

  for (const question of questions) {
    const title = decodeHtmlEntities(question.title || 'Untitled');
    const link = question.link || `https://pt.stackoverflow.com/questions/${question.question_id}`;
    const tags = (question.tags || []).map(decodeHtmlEntities).join(', ');

    lines.push(`### [${title}](${link}) — Score: ${question.score} | Answers: ${question.answer_count}`);
    lines.push(`**Tags:** ${tags || 'N/A'} | **Date:** ${formatDate(question.creation_date)}`);
    lines.push('');
    lines.push(htmlToMarkdown(question.body));
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

// --- Main ---

async function main() {
  console.log('=== Fetching Stack Overflow data ===\n');

  // Parallel fetch of independent data
  const [profile, answerTags, questionTags, answers, questions] = await Promise.all([
    fetchProfile(),
    fetchTopAnswerTags(),
    fetchTopQuestionTags(),
    fetchAnswers(),
    fetchQuestions(),
  ]);

  // Sequential: need answer question_ids to fetch titles
  const questionIds = [...new Set(answers.map((a) => a.question_id))];
  const questionTitles = await fetchQuestionTitles(questionIds);

  // Generate and write markdown
  const markdown = generateMarkdown(profile, answerTags, questionTags, answers, questions, questionTitles);

  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_PATH, markdown, 'utf-8');

  console.log(`\n=== Done! ===`);
  console.log(`Output: ${OUTPUT_PATH}`);
  console.log(`Profile: ${profile.display_name} — ${profile.reputation?.toLocaleString()} rep`);
  console.log(`Answers: ${answers.length} | Questions: ${questions.length} | Tags: ${Object.keys(questionTitles).length}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
