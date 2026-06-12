"use client";

/**
 * 東京都中学女子100m 記録ダッシュボード
 * 配置: app/records/page.tsx
 * データ: public/data/*.json（make_site_data.py の出力）
 * 依存: recharts（package.json の dependencies に追加してください）
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";

/* ---------------- design tokens ---------------- */
const C = {
  bg: "#EDEFF2", ink: "#171A20", sub: "#5C636E",
  tartan: "#E04E1C", tartanDeep: "#B23A12", lane: "#FFFFFF",
  board: "#14161B", led: "#FFC233", ledDim: "#7A6021", grid: "#D8DBE0",
};
const fontDisplay = "'Bebas Neue', 'Noto Sans JP', sans-serif";
const fontMono = "'IBM Plex Mono', monospace";
const fontBody = "'Noto Sans JP', sans-serif";

/* ---------------- types (ゆるめ) ---------------- */
type Any = any;

/* ---------------- hooks ---------------- */
function useStopwatch(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
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

/* ---------------- 小物 ---------------- */
const windStr = (w: Any) =>
  w === null || w === undefined ? "風不明" : `${w > 0 ? "+" : ""}${Number(w).toFixed(1)}`;

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

const Chip = ({ on, children, onClick }: Any) => (
  <button onClick={onClick} style={{
    padding: "7px 16px", borderRadius: 999, cursor: "pointer",
    fontFamily: fontBody, fontSize: 12.5, fontWeight: 600,
    border: `1.5px solid ${on ? C.ink : C.grid}`,
    background: on ? C.ink : "#fff", color: on ? "#fff" : C.sub,
    transition: "all .25s cubic-bezier(.4,0,.2,1)",
  }}>{children}</button>
);

/* ---------------- 電光掲示板 ---------------- */
const ScoreBoard = ({ summary }: Any) => {
  const best = summary.best_legal;
  const t = useStopwatch(best.time);
  return (
    <div style={{ background: C.board, borderRadius: 20, padding: "26px 28px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 28, boxShadow: "0 18px 40px rgba(20,22,27,.28)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.07, pointerEvents: "none", background: `repeating-linear-gradient(105deg, transparent 0 90px, ${C.lane} 90px 92px)` }} />
      <div>
        <div style={{ fontFamily: fontBody, fontSize: 11, letterSpacing: "0.22em", color: "#8A92A0", marginBottom: 6 }}>
          歴代最高記録（公認・電動計時）
        </div>
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
        {[
          ["収録走数", summary.total_results.toLocaleString()],
          ["収録選手", `${summary.total_athletes.toLocaleString()} 名`],
          ["収録年度", `${summary.years[0]}–${summary.years[summary.years.length - 1]}`],
        ].map(([k, v]) => (
          <div key={k as string}>
            <div style={{ fontFamily: fontBody, fontSize: 11, color: "#717A88", letterSpacing: ".12em" }}>{k}</div>
            <div style={{ fontFamily: fontBody, fontSize: 16, fontWeight: 700, color: "#EDEFF2", marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------------- 記録の推移 ---------------- */
const TrendChart = ({ trends }: Any) => (
  <div>
    <p style={{ fontFamily: fontBody, fontSize: 13, color: C.sub, margin: "0 0 14px" }}>
      年度別の最高記録・上位8人平均・中央値（公認記録のみ・各選手のシーズンベース）。縦軸は反転、上にいくほど速い。
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

/* ---------------- 歴代ランキング（レーン＋テーブル） ---------------- */
const Rankings = ({ rankings }: Any) => {
  const [mode, setMode] = useState<"legal" | "any">("legal");
  const list = mode === "legal" ? rankings.all_time_legal : rankings.all_time_any;
  const top8 = list.slice(0, 8);
  const rest = list.slice(8);

  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState<Any>({});
  const timeouts = useRef<Any[]>([]);
  const replay = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    setRunning(false); setFinished({});
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setRunning(true);
      top8.forEach((r: Any) => {
        timeouts.current.push(setTimeout(() => setFinished((f: Any) => ({ ...f, [r.rank]: true })), (r.time / 3) * 1000));
      });
    }));
  }, [top8]);
  useEffect(() => { replay(); return () => timeouts.current.forEach(clearTimeout); }, [mode]); // eslint-disable-line

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <Chip on={mode === "legal"} onClick={() => setMode("legal")}>公認のみ</Chip>
        <Chip on={mode === "any"} onClick={() => setMode("any")}>追風参考含む</Chip>
        <div style={{ flex: 1 }} />
        <button onClick={replay} style={{ background: C.ink, color: "#fff", border: "none", borderRadius: 999, padding: "8px 18px", fontFamily: fontBody, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          ↻ リプレイ
        </button>
      </div>

      {/* レーンレース */}
      <div style={{ background: `linear-gradient(180deg, ${C.tartan}, ${C.tartanDeep})`, borderRadius: 16, padding: "14px 0", overflow: "hidden", boxShadow: "inset 0 2px 12px rgba(0,0,0,.25)" }}>
        {top8.map((r: Any, i: number) => {
          const done = finished[r.rank];
          return (
            <div key={`${mode}-${r.rank}`} style={{ display: "grid", gridTemplateColumns: "40px 1fr 170px", alignItems: "center", gap: 8, padding: "0 16px", borderTop: i === 0 ? "none" : `2px solid ${C.lane}cc`, height: 52 }}>
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

      {/* 9位以降のテーブル */}
      <div style={{ marginTop: 16, maxHeight: 420, overflowY: "auto", border: `1px solid ${C.grid}`, borderRadius: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: fontBody, fontSize: 13 }}>
          <thead>
            <tr style={{ position: "sticky", top: 0, background: "#fff", boxShadow: `0 1px 0 ${C.grid}` }}>
              {["順位", "記録", "風", "氏名", "学年", "学校", "支部", "年度", "大会"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: C.sub, fontWeight: 600, fontSize: 11.5, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rest.map((r: Any) => (
              <tr key={r.rank} style={{ borderTop: `1px solid ${C.grid}` }}>
                <td style={{ padding: "8px 12px", fontFamily: fontMono }}>{r.rank}</td>
                <td style={{ padding: "8px 12px", fontFamily: fontMono, fontWeight: 600 }}>{r.time.toFixed(2)}</td>
                <td style={{ padding: "8px 12px", fontFamily: fontMono, color: C.sub }}>{windStr(r.wind)}</td>
                <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>{r.name}</td>
                <td style={{ padding: "8px 12px", color: C.sub }}>{r.grade ? `中${r.grade}` : "–"}</td>
                <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>{r.school}</td>
                <td style={{ padding: "8px 12px", color: C.sub }}>{r.shibu}</td>
                <td style={{ padding: "8px 12px", fontFamily: fontMono }}>{r.year}</td>
                <td style={{ padding: "8px 12px", color: C.sub, whiteSpace: "nowrap" }}>{r.meet_kind}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ---------------- 記録の分布 ---------------- */
const Distribution = ({ distribution, years }: Any) => {
  const [year, setYear] = useState<string>(String(years[years.length - 1]));
  const data = useMemo(() => {
    const bins = distribution[year] || {};
    return Object.entries(bins).map(([bin, count]) => ({ bin, count }));
  }, [distribution, year]);
  const max = Math.max(1, ...data.map((d: Any) => d.count));
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {years.map((y: number) => (
          <Chip key={y} on={String(y) === year} onClick={() => setYear(String(y))}>{y}</Chip>
        ))}
      </div>
      <p style={{ fontFamily: fontBody, fontSize: 13, color: C.sub, margin: "0 0 14px" }}>
        {year}年度・各選手のシーズンベスト分布（公認・0.2秒刻み）。
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 8, right: 18, left: -8, bottom: 0 }}>
          <CartesianGrid stroke={C.grid} strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey="bin" tick={{ fontFamily: fontMono, fontSize: 11, fill: C.sub }} tickLine={false} axisLine={{ stroke: C.grid }} />
          <YAxis tick={{ fontFamily: fontMono, fontSize: 11, fill: C.sub }} tickLine={false} axisLine={false} width={40} />
          <Tooltip content={<ChartTooltip unit="名" />} cursor={{ fill: "#171A2010" }} />
          <Bar dataKey="count" name="人数" radius={[6, 6, 0, 0]} animationDuration={800}>
            {data.map((d: Any, i: number) => (
              <Cell key={i} fill={d.count === max ? C.tartan : C.ink} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ---------------- 選手検索・成長曲線 ---------------- */
const Athletes = ({ athletes }: Any) => {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Any>(null);

  const hits = useMemo(() => {
    const k = q.replace(/\s+/g, "");
    if (k.length < 2) return [];
    return athletes
      .filter((a: Any) => (a.n + a.s).replace(/\s+/g, "").includes(k))
      .slice(0, 20);
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
        選手名（または学校名）で検索すると、その選手の全記録の推移を表示します。対象は2記録以上ある {athletes.length.toLocaleString()} 名。
      </p>
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setSel(null); }}
        placeholder="例: 山田 / 板橋三"
        style={{ width: "100%", maxWidth: 380, padding: "11px 16px", borderRadius: 12, border: `1.5px solid ${C.grid}`, fontFamily: fontBody, fontSize: 14, outline: "none", background: "#fff" }}
      />
      {!sel && hits.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6, maxWidth: 380 }}>
          {hits.map((a: Any, i: number) => (
            <button key={i} onClick={() => setSel(a)} style={{ textAlign: "left", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.grid}`, background: "#fff", cursor: "pointer", fontFamily: fontBody, fontSize: 13 }}>
              <strong>{a.n}</strong>
              <span style={{ color: C.sub, marginLeft: 8 }}>{a.b}・{a.s}</span>
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
          <p style={{ fontFamily: fontBody, fontSize: 11.5, color: C.sub }}>
            ○ 白抜きの点は追い風参考（+2.0m/s超）。
          </p>
        </div>
      )}
    </div>
  );
};

/* ---------------- メイン ---------------- */
const TABS = [
  { id: "trend", label: "記録の推移" },
  { id: "rank", label: "歴代ランキング" },
  { id: "dist", label: "記録の分布" },
  { id: "ath", label: "選手検索" },
];

export default function RecordsPage() {
  const [tab, setTab] = useState("trend");
  const summary = useJson("/data/summary.json");
  const trends = useJson("/data/trends.json");
  const rankings = useJson("/data/rankings.json");
  const distribution = useJson("/data/distribution.json");
  const athletes = useJson("/data/athletes.json", tab === "ath"); // 712KBなのでタブを開いた時に読む

  const loading = !summary || !trends || !rankings || !distribution;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: fontBody, color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@500;600&family=Noto+Sans+JP:wght@400;500;700;900&display=swap');
        @keyframes rise { from { opacity:0; transform:translateY(14px);} to { opacity:1; transform:none;} }
        .rise { animation: rise .55s cubic-bezier(.22,1,.36,1) both; }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        @media (prefers-reduced-motion: reduce) { *,*::before,*::after { animation-duration:.01ms!important; transition-duration:.01ms!important; } }
        button:focus-visible, input:focus-visible { outline: 3px solid ${C.tartan}; outline-offset: 2px; }
      `}</style>

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "36px 20px 60px" }}>
        <header className="rise" style={{ marginBottom: 26 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
            <h1 style={{ fontFamily: fontDisplay, fontSize: "clamp(40px,6vw,60px)", margin: 0, letterSpacing: ".02em", lineHeight: 1 }}>
              TOKYO JHS <span style={{ color: C.tartan }}>W100M</span> ARCHIVE
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: C.sub, fontWeight: 500 }}>東京都中学女子100m 記録データベース</p>
          </div>
        </header>

        {loading ? (
          <div style={{ fontFamily: fontMono, color: C.sub, padding: "80px 0", textAlign: "center", animation: "pulse 1.2s infinite" }}>
            LOADING RECORDS…
          </div>
        ) : (
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
              {tab === "dist" && <Distribution distribution={distribution} years={summary.years} />}
              {tab === "ath" && (athletes
                ? <Athletes athletes={athletes} />
                : <div style={{ fontFamily: fontMono, color: C.sub, padding: "60px 0", textAlign: "center", animation: "pulse 1.2s infinite" }}>LOADING ATHLETES…</div>)}
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
