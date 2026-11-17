import { Fragment, useMemo, useState, type ReactNode } from 'react';
import { parseInline, parseMarkdown, type Block, type Inline, type ListNode } from '../lib/markdown';
import { highlightLine } from '../lib/highlight';

function renderInline(nodes: Inline[]): ReactNode {
  return nodes.map((n, i) => {
    switch (n.t) {
      case 'text': return <Fragment key={i}>{n.v}</Fragment>;
      case 'code': return <code key={i}>{n.v}</code>;
      case 'strong': return <strong key={i}>{renderInline(n.c)}</strong>;
      case 'em': return <em key={i}>{renderInline(n.c)}</em>;
      case 'link': return <a key={i} href={n.href} target="_blank" rel="noopener noreferrer">{renderInline(n.c)}</a>;
    }
  });
}

const inline = (s: string) => renderInline(parseInline(s));

/** Satu baris kode berwarna. Baris kosong diisi spasi supaya tingginya tetap. */
function CodeLine({ line, lang }: { line: string; lang: string }) {
  if (!line) return <> </>;
  return <>{highlightLine(line, lang).map((t, i) => (t.k === 'x' ? <Fragment key={i}>{t.v}</Fragment> : <span key={i} className={`tk-${t.k}`}>{t.v}</span>))}</>;
}

function CodeBlock({ lang, code, numbered = false, active }: { lang: string; code: string; numbered?: boolean; active?: number }) {
  const lines = code.split('\n');
  return (
    <div className={`code${lang ? ' has-lang' : ''}${numbered ? ' numbered' : ''}`}>
      {lang && <span className="code-lang" aria-hidden="true">{lang}</span>}
      {/* tabIndex: blok kode yang bisa digulir harus bisa dijangkau keyboard */}
      <pre tabIndex={0}><code>
        {lines.map((ln, i) => (
          <span key={i} className={`ln${active === i + 1 ? ' on' : ''}`} data-n={i + 1}><CodeLine line={ln} lang={lang} /></span>
        ))}
      </code></pre>
    </div>
  );
}

function List({ list }: { list: ListNode }) {
  const Tag = list.ordered ? 'ol' : 'ul';
  return (
    <Tag start={list.ordered ? list.start : undefined}>
      {list.items.map((it, i) => (
        <li key={i}>
          {inline(it.text)}
          {it.sub && <List list={it.sub} />}
        </li>
      ))}
    </Tag>
  );
}

/** Penelusuran kode: satu langkah eksekusi per ketukan, baris yang sedang jalan disorot. */
function Trace({ b }: { b: Extract<Block, { t: 'telusuri' }> }) {
  const [i, setI] = useState(0);
  const cur = b.steps[i];
  return (
    <div className="trace">
      <p className="block-label">Telusuri kodenya</p>
      <CodeBlock lang={b.lang} code={b.code} numbered active={cur?.line} />
      <p className="trace-text" aria-live="polite">{cur && <><span className="trace-at">Baris {cur.line}.</span> {inline(cur.text)}</>}</p>
      {b.steps.length > 0 && <div className="trace-nav">
        <button type="button" className="r-btn" disabled={i === 0} onClick={() => setI(i - 1)}>Sebelumnya</button>
        <span className="trace-count">Langkah {i + 1} dari {b.steps.length}</span>
        <button type="button" className="r-btn primary" disabled={i >= b.steps.length - 1} onClick={() => setI(i + 1)}>Berikutnya</button>
      </div>}
    </div>
  );
}

/** Soal tebak dulu: pilih jawaban, lalu jawaban benar dan penjelasannya muncul. */
function Quiz({ b }: { b: Extract<Block, { t: 'tebak' }> }) {
  const [pick, setPick] = useState<number | null>(null);
  const right = pick !== null && b.options[pick]?.right;
  return (
    <div className="quiz">
      <p className="block-label">Tebak dulu</p>
      {b.code && <CodeBlock lang={b.code.lang} code={b.code.code} numbered />}
      <p className="quiz-q">{inline(b.question)}</p>
      <div className="quiz-opts" role="group" aria-label={b.question}>
        {b.options.map((o, i) => (
          <button key={i} type="button" aria-pressed={pick === i}
            className={`r-btn quiz-opt${pick === null ? '' : o.right ? ' right' : i === pick ? ' wrong' : ''}`}
            onClick={() => setPick(i)}>
            {inline(o.text)}
          </button>
        ))}
      </div>
      {pick !== null && <p className="quiz-fb" role="status"><strong>{right ? 'Benar.' : 'Belum tepat.'}</strong> {inline(b.explain)}</p>}
    </div>
  );
}

function BlockView({ b }: { b: Block }) {
  switch (b.t) {
    case 'h': return b.level === 2 ? <h3>{inline(b.text)}</h3> : <h4>{inline(b.text)}</h4>;
    case 'p': return <p>{inline(b.text)}</p>;
    case 'hr': return <hr />;
    case 'quote': return <blockquote>{inline(b.text)}</blockquote>;
    case 'list': return <List list={b.list} />;
    case 'code': return <CodeBlock lang={b.lang} code={b.code} />;
    case 'telusuri': return <Trace b={b} />;
    case 'tebak': return <Quiz b={b} />;
    case 'table':
      return (
        <div className="table-wrap" tabIndex={0}>
          <table>
            <thead><tr>{b.head.map((h, i) => <th key={i} style={{ textAlign: b.align[i] }}>{inline(h)}</th>)}</tr></thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i}>{b.head.map((_, j) => <td key={j} style={{ textAlign: b.align[j] }}>{inline(r[j] ?? '')}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export function Markdown({ source }: { source: string }) {
  const blocks = useMemo(() => parseMarkdown(source), [source]);
  return <div className="md">{blocks.map((b, i) => <BlockView key={i} b={b} />)}</div>;
}
