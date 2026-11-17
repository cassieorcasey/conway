// Pewarnaan sintaks kecil per baris untuk blok kode di pembaca. Tanpa dependensi.
// Sengaja sederhana: kata kunci, string, angka, komentar, dan pemanggilan fungsi.

export type TokKind = 'k' | 's' | 'c' | 'n' | 'f' | 'x';
export interface Tok { k: TokKind; v: string }

interface Lang { comment: string | null; kw: Set<string>; ci: boolean; strPrefix: boolean }

const words = (s: string) => s.split(/\s+/).filter(Boolean);

const PY = words(`False None True and as assert async await break class continue def del elif else except finally
  for from global if import in is lambda nonlocal not or pass raise return try while with yield match case`);
const SQL = words(`select from where group by order having join left right inner outer full cross on as and or not in is
  null case when then else end limit offset with over partition distinct insert into values update set delete create
  table view index union all asc desc between like exists primary key references integer int text real date
  drop alter add column default unique foreign check row rows range unbounded preceding following current recursive`);
const SH = words(`if then else elif fi for do done in while until case esac function export return local source sudo`);
const DOCKER = words(`FROM RUN COPY WORKDIR CMD ENTRYPOINT ENV EXPOSE ARG USER ADD LABEL VOLUME HEALTHCHECK AS`);
const JS = words(`const let var function return if else for while import from export default class new await async true false null undefined`);

const defineLang = (comment: string, kw: string[], opts: Partial<Pick<Lang, 'ci' | 'strPrefix'>> = {}): Lang =>
  ({ comment, kw: new Set(kw), ci: false, strPrefix: false, ...opts });

const python = defineLang('#', PY, { strPrefix: true });
const shell = defineLang('#', SH);
const yaml = defineLang('#', words('true false null'));
const js = defineLang('//', JS);

const LANGS: Record<string, Lang> = {
  python, py: python,
  sql: defineLang('--', SQL, { ci: true }),
  bash: shell, sh: shell, shell,
  yaml, yml: yaml,
  dockerfile: defineLang('#', DOCKER),
  js, ts: js,
};
const PLAIN: Lang = { comment: null, kw: new Set(), ci: false, strPrefix: false };

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
const cache = new Map<string, RegExp>();

function regexFor(name: string, lang: Lang) {
  let re = cache.get(name);
  if (re) return re;
  const comment = lang.comment ? `(${esc(lang.comment)}.*$)` : '(?!)';
  const pre = lang.strPrefix ? '(?:[fFrRbBuU]{1,2})?' : '';
  const str = `(${pre}(?:"(?:[^"\\\\]|\\\\.)*"?|'(?:[^'\\\\]|\\\\.)*'?))`;
  const num = '(\\b\\d[\\d_]*(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b)';
  const ident = '([A-Za-z_]\\w*)';
  re = new RegExp(`${comment}|${str}|${num}|${ident}`, 'g');
  cache.set(name, re);
  return re;
}

export function highlightLine(line: string, langName: string): Tok[] {
  const name = (langName || '').toLowerCase();
  const lang = LANGS[name] ?? PLAIN;
  const re = regexFor(name in LANGS ? name : '', lang);
  const out: Tok[] = [];
  const push = (k: TokKind, v: string) => {
    if (!v) return;
    const last = out[out.length - 1];
    if (k === 'x' && last?.k === 'x') last.v += v; else out.push({ k, v });
  };
  let at = 0;
  for (const m of line.matchAll(re)) {
    push('x', line.slice(at, m.index));
    const [whole, c, s, n, id] = m;
    if (c !== undefined) push('c', whole);
    else if (s !== undefined) push('s', whole);
    else if (n !== undefined) push('n', whole);
    else if (id !== undefined) {
      const isKw = lang.kw.has(lang.ci ? id.toLowerCase() : id);
      push(isKw ? 'k' : line[m.index! + id.length] === '(' ? 'f' : 'x', whole);
    }
    at = m.index! + whole.length;
  }
  push('x', line.slice(at));
  return out;
}
