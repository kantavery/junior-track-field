"use client";

/**
 * 東京都中学女子100m 記録ダッシュボード v2
 * 配置: app/records/page.tsx
 * v2: 共通ナビ / 大会別タブ / 学校別タブ を追加
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";

const C = {
  bg: "#EDEFF2", ink: "#171A20", sub: "#5C636E",
  tartan: "#E04E1C", tartanDeep: "#B23A12", lane: "#FFFFFF",
  board: "#14161B", led: "#FFC233", ledDim: "#7A6021", grid: "#D8DBE0",
};
const fontDisplay = "'Bebas Neue', 'Noto Sans JP', sans-serif";
const fontMono = "'IBM Plex Mono', monospace";
const fontBody = "'Noto Sans JP', sans-serif";
type Any = any;

/* ---------- 共通ナビ ---------- */
const SiteNav = ({ active }: Any) => (
  <nav style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
    {[["/", "SCHEDULE", "大会日程"], ["/records", "RECORDS", "記録データベース"]].map(([href, en, ja]) => {
      const on = active === en;
      return (
        <a key={en} href={href} style={{
          textDecoration: "none", display: "inline-flex", alignItems: "baseline", gap: 8,
          padding: "9px 20px", borderRadius: 12,
          background: on ? C.ink : "#fff", color: on ? "#fff" : C.sub,
          boxShadow: on ? "0 6px 16px rgba(23,26,32,.22)" : "0 1px 3px rgba(23,26,32,.08)",
          transition: "all .25s cubic-bezier(.4,0,.2,1)",
        }}>
          <span style={{ fontFamily: fontDisplay, fontSize: 19, letterSpacing: ".05em" }}>{en}</span>
          <span style={{ fontFamily: fontBody, fontSize: 11, fontWeight: 600 }}>{ja}</span>
        </a>
      );
    })}
  </nav>
);

/* ---------- hooks ---------- */
function useStopwatch(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setVal(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}
function useJson(path: string, enabled = true) {
  const [data, setData] = useState<Any>(null);
  useEffect(() => {
    if (!enabled || data) return;
    fetch(path).then((r) => r.json()).then(setData).catch(() => setData(undefined));
  }, [path, enabled, data]);
  return data;
}

/* ---------- 小物 ---------- */
const windStr = (w: Any) =>
  w === null || w === undefined ? "風不明" : `${w > 0 ? "+" : ""}${Number(w).toFixed(1)}`;

const Chip = ({ on, children, onClick }: Any) => (
  <button onClick={onClick} style={{
    padding: "7px 16px", borderRadius: 999, cursor: "pointer",
    fontFamily: fontBody, fontSize: 12.5, fontWeight: 600,
    border: `1.5px solid ${on ? C.ink : C.grid}`,
    background: on ? C.ink : "#fff", color: on ? "#fff" : C.sub,
    transition: "all .25s cubic-bezier(.4,0,.2,1)",
  }}>{children}</button>
);

const ChartTooltip = ({ active, payload, label, unit = "秒" }: Any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.board, color: "#fff", padding: "8px 12px", borderRadius: 8, fontFamily: fontBody, fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,.25)" }}>
      <div style={{ color: "#9AA1AC", marginBottom: 2 }}>{label}</div>
      {payload.map((p: Any, i: number) => (
        <div key={i} style={{ fontFamily: fontMono, fontSize: 14, color: i === 0 ? C.led : "#cfd4dc" }}>
          {p.name}: {Number(p.value).toFixed(2)}<span style={{ fontSize: 10, marginLeft: 2 }}>{unit}</span>
        </div>
      ))}
    </div>
  );
};

const Td = ({ children, mono, dim, bold }: Any) => (
  <td style={{ padding: "8px 12px", whiteSpace: "nowrap", fontFamily: mono ? fontMono : fontBody, color: dim ? C.sub : C.ink, fontWeight: bold ? 600 : 400 }}>{children}</td>
);
const ResultTable = ({ rows, showYear }: Any) => (
  <div style={{ maxHeight: 460, overflowY: "auto", border: `1px solid ${C.grid}`, borderRadius: 12 }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: fontBody, fontSize: 13 }}>
      <thead>
        <tr style={{ position: "sticky", top: 0, background: "#fff", boxShadow: `0 1px 0 ${C.grid}`, zIndex: 1 }}>
          {["順位", "記録", "風", "氏名", "学年", "学校", "支部", showYear ? "年度" : "", showYear ? "大会" : ""].filter(Boolean).map((h) => (
            <th key={h as string} style={{ textAlign: "left", padding: "10px 12px", color: C.sub, fontWeight: 600, fontSize: 11.5, whiteSpace: "nowrap" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r: Any, i: number) => (
          <tr key={i} style={{ borderTop: `1px solid ${C.grid}` }}>
            <Td mono>{r.rank ?? i + 1}</Td>
            <Td mono bold>{r.time.toFixed(2)}{r.legal === 0 && <span style={{ color: C.tartan, fontSize: 10, marginLeft: 3 }}>追参</span>}</Td>
            <Td mono dim>{windStr(r.wind)}</Td>
            <Td>{r.name}</Td>
            <Td dim>{r.grade ? `中${r.grade}` : "–"}</Td>
            <Td>{r.school}</Td>
            <Td dim>{r.shibu}</Td>
            {showYear && <Td mono>{r.year}</Td>}
            {showYear && <Td dim>{r.meet_kind}</Td>}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ---------- 電光掲示板 ---------- */
const ScoreBoard = ({ summary }: Any) => {
  const best = summary.best_legal;
  const t = useStopwatch(best.time);
  return (
    <div style={{ background: C.board, borderRadius: 20, padding: "26px 28px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 28, boxShadow: "0 18px 40px rgba(20,22,27,.28)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.07, pointerEvents: "none", background: `repeating-linear-gradient(105deg, transparent 0 90px, ${C.lane} 90px 92px)` }} />
      <div>
        <div style={{ fontFamily: fontBody, fontSize: 11, letterSpacing: "0.22em", color: "#8A92A0", marginBottom: 6 }}>歴代最高記録（公認・電動計時）</div>
        <div style={{ fontFamily: fontMono, fontSize: "clamp(48px,9vw,84px)", fontWeight: 600, color: C.led, lineHeight: 1, textShadow: `0 0 24px ${C.led}55`, fontVariantNumeric: "tabular-nums" }}>
          {t.toFixed(2)}<span style={{ fontSize: "0.32em", color: C.ledDim, marginLeft: 6 }}>SEC</span>
        </div>
        <div style={{ fontFamily: fontBody, fontSize: 13, color: "#B7BDC8", marginTop: 8 }}>
          {best.name}（{best.shibu}・{best.school}・{best.year}）
          <span style={{ color: "#717A88", marginLeft: 8, fontSize: 12 }}>{windStr(best.wind)} m/s</span>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
        {[["収録走数", summary.total_results.toLocaleString()], ["収録選手", `${summary.total_athletes.toLocaleString()} 名`], ["収録年度", `${summary.years[0]}–${summary.years[summary.years.length - 1]}`]].map(([k, v]) => (
          <div key={k as string}>
            <div style={{ fontFamily: fontBody, fontSize: 11, color: "#717A88", letterSpacing: ".12em" }}>{k}</div>
            <div style={{ fontFamily: fontBody, fontSize: 16, fontWeight: 700, color: "#EDEFF2", marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------- 記録の推移 ---------- */
const TrendChart = ({ trends }: Any) => (
  <div>
    <p style={{ fontFamily: fontBody, fontSize: 13, color: C.sub, margin: "0 0 14px" }}>
      年度別の最高記録・上位8人平均・中央値（公認・各選手のシーズンベース）。上にいくほど速い。
    </p>
    <ResponsiveContainer width="100%" height={340}>
      <LineChart data={trends} margin={{ top: 8, right: 18, left: -8, bottom: 0 }}>
        <CartesianGrid stroke={C.grid} strokeDasharray="3 6" vertical={false} />
        <XAxis dataKey="year" tick={{ fontFamily: fontMono, fontSize: 11, fill: C.sub }} tickLine={false} axisLine={{ stroke: C.grid }} />
        <YAxis reversed domain={["dataMin - 0.1", "dataMax + 0.1"]} tick={{ fontFamily: fontMono, fontSize: 11, fill: C.sub }} tickFormatter={(v: number) => v.toFixed(1)} tickLine={false} axisLine={false} width={48} />
        <Tooltip content={<ChartTooltip />} />
        <Line name="最高" type="monotone" dataKey="best" stroke={C.tartan} strokeWidth={3} dot={{ r: 3, fill: C.tartan, strokeWidth: 0 }} animationDuration={1100} />
        <Line name="上位8平均" type="monotone" dataKey="top8_avg" stroke={C.ink} strokeWidth={2.5} dot={{ r: 3, fill: C.ink, strokeWidth: 0 }} animationDuration={1100} />
        <Line name="中央値" type="monotone" dataKey="median" stroke="#9AA1AC" strokeWidth={2} strokeDasharray="5 4" dot={false} animationDuration={1100} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

/* ---------- 歴代ランキング ---------- */
const Rankings = ({ rankings }: Any) => {
  const [mode, setMode] = useState<"legal" | "any">("legal");
  const [scope, setScope] = useState<string>("all");
  const years = useMemo(() => Object.keys(rankings.by_year || {}).sort((a, b) => +b - +a), [rankings]);
  const list = scope === "all"
    ? (mode === "legal" ? rankings.all_time_legal : rankings.all_time_any)
    : (rankings.by_year[scope] || []);
  const top8 = list.slice(0, 8);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState<Any>({});
  const timeouts = useRef<Any[]>([]);
  const replay = useCallback(() => {
    timeouts.current.forEach(clearTimeout); timeouts.current = [];
    setRunning(false); setFinished({});
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setRunning(true);
      top8.forEach((r: Any) => {
        timeouts.current.push(setTimeout(() => setFinished((f: Any) => ({ ...f, [r.rank]: true })), (r.time / 3) * 1000));
      });
    }));
  }, [top8]);
  useEffect(() => { replay(); return () => timeouts.current.forEach(clearTimeout); }, [mode, scope]); // eslint-disable-line
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <Chip on={scope === "all"} onClick={() => setScope("all")}>歴代</Chip>
        {years.map((y: Any) => <Chip key={y} on={scope === y} onClick={() => setScope(y)}>{y}</Chip>)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        {scope === "all" ? (
          <>
            <Chip on={mode === "legal"} onClick={() => setMode("legal")}>公認のみ</Chip>
            <Chip on={mode === "any"} onClick={() => setMode("any")}>追風参考含む</Chip>
          </>
        ) : (
          <span style={{ fontFamily: fontBody, fontSize: 12.5, color: C.sub }}>{scope}年度・公認・各選手のシーズンベスト</span>
        )}
        <div style={{ flex: 1 }} />
        <button onClick={replay} style={{ background: C.ink, color: "#fff", border: "none", borderRadius: 999, padding: "8px 18px", fontFamily: fontBody, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>↻ リプレイ</button>
      </div>
      <div style={{ background: `linear-gradient(180deg, ${C.tartan}, ${C.tartanDeep})`, borderRadius: 16, padding: "14px 0", overflow: "hidden", boxShadow: "inset 0 2px 12px rgba(0,0,0,.25)", marginBottom: 16 }}>
        {top8.map((r: Any, i: number) => {
          const done = finished[r.rank];
          return (
            <div key={`${mode}-${scope}-${r.rank}`} style={{ display: "grid", gridTemplateColumns: "40px 1fr 170px", alignItems: "center", gap: 8, padding: "0 16px", borderTop: i === 0 ? "none" : `2px solid ${C.lane}cc`, height: 52 }}>
              <div style={{ fontFamily: fontDisplay, fontSize: 24, color: "#fff", opacity: 0.85, textAlign: "center" }}>{r.rank}</div>
              <div style={{ position: "relative", height: "100%" }}>
                <div style={{ position: "absolute", left: 0, top: "50%", height: 3, borderRadius: 2, background: "rgba(255,255,255,.85)", width: running ? "100%" : "0%", maxWidth: "calc(100% - 14px)", transform: "translateY(-50%)", transition: running ? `width ${r.time / 3}s linear` : "none" }} />
                <div style={{ position: "absolute", top: "50%", left: running ? "calc(100% - 14px)" : 0, transform: "translate(-50%,-50%)", width: 14, height: 14, borderRadius: "50%", background: "#fff", boxShadow: done ? `0 0 0 5px ${C.led}66` : "0 1px 4px rgba(0,0,0,.4)", transition: running ? `left ${r.time / 3}s linear, box-shadow .3s ease` : "none" }} />
              </div>
              <div style={{ textAlign: "right", opacity: done ? 1 : 0, transform: done ? "none" : "translateX(8px)", transition: "opacity .35s ease, transform .35s ease" }}>
                <div style={{ fontFamily: fontMono, fontSize: 17, fontWeight: 600, color: "#fff", lineHeight: 1.1 }}>
                  {r.time.toFixed(2)}<span style={{ fontSize: 10, marginLeft: 4, color: "#FFD9C7" }}>{windStr(r.wind)}</span>
                </div>
                <div style={{ fontFamily: fontBody, fontSize: 11, color: "#FFD9C7" }}>{r.name}・{r.school} {r.year}</div>
              </div>
            </div>
          );
        })}
      </div>
      <ResultTable rows={list.slice(8)} showYear />
    </div>
  );
};

/* ---------- 大会別 ---------- */
const Meets = ({ meets }: Any) => {
  const years = useMemo(() => Array.from(new Set(meets.map((m: Any) => m.year))).sort((a: Any, b: Any) => b - a), [meets]);
  const [year, setYear] = useState<Any>(years[0]);
  const list = useMemo(() => meets.filter((m: Any) => m.year === year).sort((a: Any, b: Any) => a.month - b.month), [meets, year]);
  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [year]);
  const sel = list[idx];
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {years.map((y: Any) => <Chip key={y} on={y === year} onClick={() => setYear(y)}>{y}</Chip>)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        {list.map((m: Any, i: number) => (
          <button key={i} onClick={() => setIdx(i)} style={{
            textAlign: "left", padding: "10px 16px", borderRadius: 10, cursor: "pointer",
            border: `1.5px solid ${i === idx ? C.ink : C.grid}`,
            background: i === idx ? C.ink : "#fff", color: i === idx ? "#fff" : C.ink,
            fontFamily: fontBody, fontSize: 13, transition: "all .2s",
          }}>
            <span style={{ fontFamily: fontMono, fontSize: 11, color: i === idx ? C.led : C.tartan, marginRight: 10 }}>{m.kind}</span>
            {m.meet}
            <span style={{ float: "right", fontSize: 11, color: i === idx ? "#B7BDC8" : C.sub }}>{m.athletes}名出場</span>
          </button>
        ))}
      </div>
      {sel && (
        <>
          <p style={{ fontFamily: fontBody, fontSize: 13, color: C.sub, margin: "0 0 10px" }}>
            {sel.meet} 女子100m 上位{sel.top.length}（選手ごとの大会内ベスト）
          </p>
          <ResultTable rows={sel.top} />
        </>
      )}
    </div>
  );
};

/* ---------- 学校別 ---------- */
const Schools = ({ schools }: Any) => {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Any>(null);
  const list = useMemo(() => {
    const k = q.replace(/\s+/g, "");
    const base = k ? schools.filter((s: Any) => (s.school + s.shibu).includes(k)) : schools;
    return base.slice(0, 60);
  }, [q, schools]);
  if (sel) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <h3 style={{ fontFamily: fontBody, fontSize: 18, fontWeight: 800, margin: 0 }}>{sel.school}</h3>
          <span style={{ fontFamily: fontBody, fontSize: 13, color: C.sub }}>{sel.shibu}支部・収録選手 {sel.n_athletes} 名</span>
          <span style={{ fontFamily: fontMono, fontSize: 14, color: C.tartan, fontWeight: 700 }}>校内最高 {sel.best.time.toFixed(2)}</span>
          <button onClick={() => setSel(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: C.sub, cursor: "pointer", fontFamily: fontBody, fontSize: 12.5, textDecoration: "underline" }}>← 学校一覧に戻る</button>
        </div>
        <ResultTable rows={sel.top} showYear />
        <p style={{ fontFamily: fontBody, fontSize: 11.5, color: C.sub, marginTop: 10 }}>各選手の自己ベスト順（公認優先）。</p>
      </div>
    );
  }
  return (
    <div>
      <p style={{ fontFamily: fontBody, fontSize: 13, color: C.sub, margin: "0 0 12px" }}>
        校内最高記録順の学校ランキング。学校名で絞り込みできます。クリックで各校の選手一覧へ。
      </p>
      <input value={q} onChange={(e: Any) => setQ(e.target.value)} placeholder="学校名・支部で検索"
        style={{ width: "100%", maxWidth: 380, padding: "11px 16px", borderRadius: 12, border: `1.5px solid ${C.grid}`, fontFamily: fontBody, fontSize: 14, outline: "none", background: "#fff", marginBottom: 14 }} />
      <div style={{ maxHeight: 480, overflowY: "auto", border: `1px solid ${C.grid}`, borderRadius: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: fontBody, fontSize: 13 }}>
          <thead>
            <tr style={{ position: "sticky", top: 0, background: "#fff", boxShadow: `0 1px 0 ${C.grid}`, zIndex: 1 }}>
              {["順位", "学校", "支部", "校内最高", "記録保持者", "収録選手"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: C.sub, fontWeight: 600, fontSize: 11.5, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((s: Any) => (
              <tr key={s.school} onClick={() => setSel(s)} style={{ borderTop: `1px solid ${C.grid}`, cursor: "pointer" }}>
                <Td mono>{s.rank}</Td>
                <Td bold>{s.school}</Td>
                <Td dim>{s.shibu}</Td>
                <Td mono bold>{s.best.time.toFixed(2)}{s.best.legal === 0 && <span style={{ color: C.tartan, fontSize: 10, marginLeft: 3 }}>追参</span>}</Td>
                <Td dim>{s.best.name}（{s.best.year}）</Td>
                <Td mono dim>{s.n_athletes}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ---------- 記録の分布 ---------- */
const Distribution = ({ distribution, years }: Any) => {
  const [year, setYear] = useState<string>(String(years[years.length - 1]));
  const data = useMemo(() => Object.entries(distribution[year] || {}).map(([bin, count]) => ({ bin, count })), [distribution, year]);
  const max = Math.max(1, ...data.map((d: Any) => d.count));
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {years.map((y: number) => <Chip key={y} on={String(y) === year} onClick={() => setYear(String(y))}>{y}</Chip>)}
      </div>
      <p style={{ fontFamily: fontBody, fontSize: 13, color: C.sub, margin: "0 0 14px" }}>{year}年度・各選手のシーズンベスト分布（公認・0.2秒刻み）。</p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 8, right: 18, left: -8, bottom: 0 }}>
          <CartesianGrid stroke={C.grid} strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey="bin" tick={{ fontFamily: fontMono, fontSize: 11, fill: C.sub }} tickLine={false} axisLine={{ stroke: C.grid }} />
          <YAxis tick={{ fontFamily: fontMono, fontSize: 11, fill: C.sub }} tickLine={false} axisLine={false} width={40} />
          <Tooltip content={<ChartTooltip unit="名" />} cursor={{ fill: "#171A2010" }} />
          <Bar dataKey="count" name="人数" radius={[6, 6, 0, 0]} animationDuration={800}>
            {data.map((d: Any, i: number) => <Cell key={i} fill={d.count === max ? C.tartan : C.ink} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ---------- 選手検索 ---------- */
const Athletes = ({ athletes }: Any) => {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Any>(null);
  const hits = useMemo(() => {
    const k = q.replace(/\s+/g, "");
    if (k.length < 2) return [];
    return athletes.filter((a: Any) => (a.n + a.s).replace(/\s+/g, "").includes(k)).slice(0, 20);
  }, [q, athletes]);
  const points = useMemo(() => {
    if (!sel) return [];
    return sel.pts.map((p: Any, i: number) => ({
      i, label: `${String(p.y).slice(2)}'${p.mo || "?"}月`, time: p.t,
      legal: p.l, wind: p.w, kind: p.k, grade: p.g,
    }));
  }, [sel]);
  return (
    <div>
      <p style={{ fontFamily: fontBody, fontSize: 13, color: C.sub, margin: "0 0 12px" }}>
        選手名（または学校名）で検索。収録大会すべての記録を時系列で表示します（対象 {athletes.length.toLocaleString()} 名）。
      </p>
      <input value={q} onChange={(e: Any) => { setQ(e.target.value); setSel(null); }} placeholder="例: 山田 / 板橋三"
        style={{ width: "100%", maxWidth: 380, padding: "11px 16px", borderRadius: 12, border: `1.5px solid ${C.grid}`, fontFamily: fontBody, fontSize: 14, outline: "none", background: "#fff" }} />
      {!sel && hits.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6, maxWidth: 380 }}>
          {hits.map((a: Any, i: number) => (
            <button key={i} onClick={() => setSel(a)} style={{ textAlign: "left", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.grid}`, background: "#fff", cursor: "pointer", fontFamily: fontBody, fontSize: 13 }}>
              <strong>{a.n}</strong><span style={{ color: C.sub, marginLeft: 8 }}>{a.b}・{a.s}</span>
              <span style={{ float: "right", fontFamily: fontMono, color: C.tartan, fontWeight: 600 }}>{a.pb.toFixed(2)}</span>
            </button>
          ))}
        </div>
      )}
      {!sel && q.replace(/\s+/g, "").length >= 2 && hits.length === 0 && (
        <p style={{ fontFamily: fontBody, fontSize: 13, color: C.sub, marginTop: 10 }}>該当する選手が見つかりません。</p>
      )}
      {sel && (
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
            <h3 style={{ fontFamily: fontBody, fontSize: 18, fontWeight: 800, margin: 0 }}>{sel.n}</h3>
            <span style={{ fontFamily: fontBody, fontSize: 13, color: C.sub }}>{sel.b}・{sel.s}</span>
            <span style={{ fontFamily: fontMono, fontSize: 14, color: C.tartan, fontWeight: 700 }}>PB {sel.pb.toFixed(2)}</span>
            <button onClick={() => setSel(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: C.sub, cursor: "pointer", fontFamily: fontBody, fontSize: 12.5, textDecoration: "underline" }}>← 検索に戻る</button>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={points} margin={{ top: 8, right: 18, left: -8, bottom: 0 }}>
              <CartesianGrid stroke={C.grid} strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="label" tick={{ fontFamily: fontMono, fontSize: 11, fill: C.sub }} tickLine={false} axisLine={{ stroke: C.grid }} />
              <YAxis reversed domain={["dataMin - 0.15", "dataMax + 0.15"]} tick={{ fontFamily: fontMono, fontSize: 11, fill: C.sub }} tickFormatter={(v: number) => Number(v).toFixed(1)} tickLine={false} axisLine={false} width={48} />
              <Tooltip content={({ active, payload }: Any) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload;
                return (
                  <div style={{ background: C.board, color: "#fff", padding: "8px 12px", borderRadius: 8, fontFamily: fontBody, fontSize: 12 }}>
                    <div style={{ color: "#9AA1AC" }}>{p.label}・{p.kind}{p.grade ? `・中${p.grade}` : ""}</div>
                    <div style={{ fontFamily: fontMono, fontSize: 16, color: C.led }}>
                      {p.time.toFixed(2)}<span style={{ fontSize: 10, marginLeft: 4 }}>{windStr(p.wind)}{p.legal ? "" : "（追参）"}</span>
                    </div>
                  </div>
                );
              }} />
              <Line type="monotone" dataKey="time" stroke={C.tartan} strokeWidth={3} animationDuration={800}
                dot={(props: Any) => {
                  const { cx, cy, payload, index } = props;
                  return <circle key={`d${index}`} cx={cx} cy={cy} r={4.5} fill={payload.legal ? C.tartan : "#fff"} stroke={C.tartan} strokeWidth={2} />;
                }}
                activeDot={{ r: 7, fill: C.ink, stroke: "#fff", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
          <p style={{ fontFamily: fontBody, fontSize: 11.5, color: C.sub }}>○ 白抜きの点は追い風参考（+2.0m/s超）。</p>
        </div>
      )}
    </div>
  );
};

/* ---------- 順位チェック ---------- */
const TimeCheck = ({ season }: Any) => {
  const years = useMemo(() => Object.keys(season).sort((a, b) => +b - +a), [season]);
  const [year, setYear] = useState(years[0]);
  const [input, setInput] = useState("");
  const t = parseFloat(input);
  const valid = !isNaN(t) && t >= 10 && t <= 25;
  const calc = (times: number[]) => {
    let lo = 0;
    while (lo < times.length && times[lo] < t) lo++;
    return { rank: lo + 1, n: times.length, pct: times.length ? ((lo + 1) / times.length) * 100 : 0 };
  };
  const cur = valid && season[year] ? calc(season[year]) : null;
  return (
    <div>
      <p style={{ fontFamily: fontBody, fontSize: 13, color: C.sub, margin: "0 0 14px" }}>
        100mのタイムを入力すると、東京都の中学女子の中でだいたい何位くらいかがわかります
        （各年度・公認シーズンベストとの比較）。
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <input value={input} onChange={(e: Any) => setInput(e.target.value)} placeholder="例: 13.45" inputMode="decimal"
          style={{ width: 160, padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${C.grid}`, fontFamily: fontMono, fontSize: 18, outline: "none", background: "#fff", fontWeight: 600 }} />
        <span style={{ fontFamily: fontBody, fontSize: 13, color: C.sub }}>秒</span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {years.map((y: Any) => <Chip key={y} on={y === year} onClick={() => setYear(y)}>{y}</Chip>)}
        </div>
      </div>
      {input && !valid && (
        <p style={{ fontFamily: fontBody, fontSize: 13, color: C.tartan }}>10.00〜25.00の範囲で入力してください（例: 13.45）。</p>
      )}
      {cur && (
        <>
          <div style={{ background: C.board, borderRadius: 16, padding: "22px 26px", display: "flex", flexWrap: "wrap", gap: 26, alignItems: "baseline", boxShadow: "0 14px 32px rgba(20,22,27,.25)", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: fontBody, fontSize: 11, letterSpacing: ".18em", color: "#8A92A0", marginBottom: 4 }}>{year}年度なら</div>
              <div style={{ fontFamily: fontMono, fontSize: "clamp(36px,6vw,56px)", fontWeight: 600, color: C.led, lineHeight: 1, textShadow: `0 0 20px ${C.led}55` }}>
                約 {cur.rank.toLocaleString()} 位
              </div>
            </div>
            <div style={{ fontFamily: fontBody, fontSize: 14, color: "#B7BDC8" }}>
              {cur.n.toLocaleString()} 名中・上位 <strong style={{ color: "#EDEFF2" }}>{cur.pct < 1 ? cur.pct.toFixed(1) : Math.round(cur.pct)}%</strong>
            </div>
          </div>
          <div style={{ border: `1px solid ${C.grid}`, borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: fontBody, fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#fff" }}>
                  {["年度", "推定順位", "収録選手", "上位%"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: C.sub, fontWeight: 600, fontSize: 11.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {years.map((y: Any) => {
                  const r = calc(season[y]);
                  return (
                    <tr key={y} style={{ borderTop: `1px solid ${C.grid}`, background: y === year ? "#FBF1EC" : "transparent" }}>
                      <Td mono bold>{y}</Td>
                      <Td mono>約 {r.rank.toLocaleString()} 位</Td>
                      <Td mono dim>{r.n.toLocaleString()} 名</Td>
                      <Td mono dim>{r.pct < 1 ? r.pct.toFixed(1) : Math.round(r.pct)}%</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontFamily: fontBody, fontSize: 11.5, color: C.sub, marginTop: 10 }}>
            ※ 収録大会（地域別・総体・通信・支部対抗）出場者の公認シーズンベストとの比較による推定です。
          </p>
        </>
      )}
    </div>
  );
};

/* ---------- メイン ---------- */
const TABS = [
  { id: "trend", label: "記録の推移" },
  { id: "rank", label: "ランキング" },
  { id: "chk", label: "順位チェック" },
  { id: "meet", label: "大会別" },
  { id: "sch", label: "学校別" },
  { id: "dist", label: "記録の分布" },
  { id: "ath", label: "選手検索" },
];

export default function RecordsPage() {
  const [tab, setTab] = useState("trend");
  const summary = useJson("/data/summary.json");
  const trends = useJson("/data/trends.json");
  const rankings = useJson("/data/rankings.json");
  const distribution = useJson("/data/distribution.json");
  const meets = useJson("/data/meets.json", tab === "meet");
  const schools = useJson("/data/schools.json", tab === "sch");
  const season = useJson("/data/season_times.json", tab === "chk");
  const athletes = useJson("/data/athletes.json", tab === "ath");
  const loading = !summary || !trends || !rankings || !distribution;
  const Spinner = <div style={{ fontFamily: fontMono, color: C.sub, padding: "60px 0", textAlign: "center", animation: "pulse 1.2s infinite" }}>LOADING…</div>;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: fontBody, color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@500;600&family=Noto+Sans+JP:wght@400;500;700;900&display=swap');
        @keyframes rise { from { opacity:0; transform:translateY(14px);} to { opacity:1; transform:none;} }
        .rise { animation: rise .55s cubic-bezier(.22,1,.36,1) both; }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        @media (prefers-reduced-motion: reduce) { *,*::before,*::after { animation-duration:.01ms!important; transition-duration:.01ms!important; } }
        button:focus-visible, input:focus-visible, a:focus-visible { outline: 3px solid ${C.tartan}; outline-offset: 2px; }
        tr:hover td { background: #F6F7F9; }
      `}</style>

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "28px 20px 60px" }}>
        <SiteNav active="RECORDS" />
        <header className="rise" style={{ marginBottom: 26 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
            <h1 style={{ fontFamily: fontDisplay, fontSize: "clamp(40px,6vw,60px)", margin: 0, letterSpacing: ".02em", lineHeight: 1 }}>
              TOKYO JHS <span style={{ color: C.tartan }}>W100M</span> ARCHIVE
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: C.sub, fontWeight: 500 }}>東京都中学女子100m 記録データベース</p>
          </div>
        </header>

        {loading ? Spinner : (
          <>
            <div className="rise" style={{ animationDelay: ".08s", marginBottom: 26 }}>
              <ScoreBoard summary={summary} />
            </div>
            <nav className="rise" style={{ animationDelay: ".16s", display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
              {TABS.map(({ id, label }) => (
                <button key={id} onClick={() => setTab(id)} style={{
                  padding: "9px 18px", borderRadius: 12, cursor: "pointer",
                  fontFamily: fontBody, fontSize: 13.5, fontWeight: 600, border: "none",
                  background: tab === id ? C.ink : "#fff", color: tab === id ? "#fff" : C.sub,
                  boxShadow: tab === id ? "0 6px 16px rgba(23,26,32,.22)" : "0 1px 3px rgba(23,26,32,.08)",
                  transform: tab === id ? "translateY(-1px)" : "none",
                  transition: "all .25s cubic-bezier(.4,0,.2,1)",
                }}>{label}</button>
              ))}
            </nav>
            <main key={tab} className="rise" style={{ background: "#fff", borderRadius: 20, padding: "24px 26px 18px", boxShadow: "0 2px 6px rgba(23,26,32,.06), 0 16px 40px rgba(23,26,32,.07)" }}>
              {tab === "trend" && <TrendChart trends={trends} />}
              {tab === "rank" && <Rankings rankings={rankings} />}
              {tab === "chk" && (season ? <TimeCheck season={season} /> : Spinner)}
              {tab === "meet" && (meets ? <Meets meets={meets} /> : Spinner)}
              {tab === "sch" && (schools ? <Schools schools={schools} /> : Spinner)}
              {tab === "dist" && <Distribution distribution={distribution} years={summary.years} />}
              {tab === "ath" && (athletes ? <Athletes athletes={athletes} /> : Spinner)}
            </main>
            <footer style={{ marginTop: 22, fontSize: 11.5, color: C.sub, lineHeight: 1.9 }}>
              出典: 東京都中学校体育連盟 陸上競技部 記録ページ（gold.jaic.org/tokyo/cyuugaku）。
              本サイトは公表された競技記録を集計・可視化したものです。
              記録の誤りの指摘や掲載の削除をご希望の方は、お問い合わせよりご連絡ください。
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
