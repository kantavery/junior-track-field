"use client";

/**
 * 大会日程（SCHEDULE）ページ
 * 配置: app/page.tsx ※既存の中身をすべてこのファイルで置き換え
 * レコードページとデザイン統一。NEXT EVENTを電光掲示板スタイルで表示。
 */

import React, { useMemo, useEffect, useState } from "react";

const C = {
  bg: "#EDEFF2", ink: "#171A20", sub: "#5C636E",
  tartan: "#E04E1C", tartanDeep: "#B23A12", lane: "#FFFFFF",
  board: "#14161B", led: "#FFC233", ledDim: "#7A6021", grid: "#D8DBE0",
  branch: "#1E7A5E", // 第2支部
};
const fontDisplay = "'Bebas Neue', 'Noto Sans JP', sans-serif";
const fontMono = "'IBM Plex Mono', monospace";
const fontBody = "'Noto Sans JP', sans-serif";
type Any = any;

/* ---------- 大会データ（2026年度） ---------- */
const MEETS = [
  {
    id: "branch2-spring", cat: "第2支部", season: "春",
    title: "第2支部春季陸上競技会",
    dates: "4/3(金)・4/4(土)", start: "20260403", end: "20260405",
    venue: "スピアーズえどりくフィールド（江戸川区陸上競技場）",
    desc: "第2支部の春シーズン最初の競技会。年度初めの記録確認に使いやすい大会です。",
    youkou: "http://www.tokyokotairenrikujo.jp/branch23/branch2.html",
    results: "http://www.tokyokotairenrikujo.jp/branch23/2026/SL/01_syunki/kyougi.html",
  },
  {
    id: "branch2-qualifier", cat: "第2支部", season: "春",
    title: "第2支部支部予選会",
    dates: "4/18(土)・4/19(日)", start: "20260418", end: "20260420",
    venue: "スピアーズえどりくフィールド（江戸川区陸上競技場）",
    desc: "第2支部の予選大会。春から初夏の東京都大会につながる重要な大会です。",
    youkou: "http://www.tokyokotairenrikujo.jp/branch23/branch2.html",
    results: "http://www.tokyokotairenrikujo.jp/branch23/2026/SL/02_sotai/kyougi.html",
  },
  {
    id: "tokyo-regional", cat: "東京都中体連", season: "春",
    title: "地域別陸上競技大会",
    dates: "5/16(土)・5/17(日)・6/6(土)・6/7(日)", start: "20260516", end: "20260608",
    venue: "夢の島競技場",
    desc: "東京都中体連の地域別大会。文京区は区部西部に含まれます。",
    youkou: "https://www.tokyoctr.com/youkou/chiiki2.pdf",
    results: "https://gold.jaic.org/tokyo/cyuugaku/index.htm",
  },
  {
    id: "tokyo-tsushin", cat: "東京都中体連", season: "夏",
    title: "第72回 全日本中学校通信陸上競技東京都大会",
    dates: "6/27(土)・6/28(日)", start: "20260627", end: "20260629",
    venue: "上柚木公園陸上競技場",
    desc: "全国通信陸上につながる東京都大会。ランキング確認にも使われる大会です。",
    youkou: "https://www.tokyoctr.com/youkou/tuushin.pdf",
    results: "https://gold.jaic.org/tokyo/cyuugaku/index.htm",
  },
  {
    id: "tokyo-sotai", cat: "東京都中体連", season: "夏",
    title: "第65回 東京都中学校総合体育大会 陸上競技大会 兼 第79回 東京都中学校陸上競技選手権大会",
    dates: "7/24(金)・7/25(土)・7/26(日)", start: "20260724", end: "20260727",
    venue: "上柚木公園陸上競技場",
    desc: "東京都中学校総合体育大会と東京都中学校陸上競技選手権大会を兼ねる主要大会です。",
    youkou: "https://www.tokyoctr.com/youkou/sou.pdf",
    results: "https://gold.jaic.org/tokyo/cyuugaku/index.htm",
  },
  {
    id: "branch2-summer", cat: "第2支部", season: "夏",
    title: "第2支部夏季競技会",
    dates: "8/10(月)・8/12(水)・8/13(木)", start: "20260810", end: "20260814",
    venue: "スピアーズえどりくフィールド（江戸川区陸上競技場）",
    desc: "夏休み期間の第2支部競技会。秋の大会に向けた記録確認にも使いやすい大会です。",
    youkou: "http://www.tokyokotairenrikujo.jp/branch23/branch2.html",
    results: "http://www.tokyokotairenrikujo.jp/branch23/2026/SL/04_kaki/kyougi.html",
  },
  {
    id: "branch2-rookie", cat: "第2支部", season: "夏",
    title: "第2支部新人陸上競技会",
    dates: "8/26(水)・8/29(土)・8/30(日)", start: "20260826", end: "20260831",
    venue: "スピアーズえどりくフィールド（江戸川区陸上競技場）",
    desc: "第2支部の新人大会。秋の新人戦シーズンにつながる大会です。",
    youkou: "http://www.tokyokotairenrikujo.jp/branch23/branch2.html",
    results: "http://www.tokyokotairenrikujo.jp/branch23/2026/SL/05_shinjin/kyougi.html",
  },
  {
    id: "tokyo-shibu-taiko", cat: "東京都中体連", season: "秋",
    title: "第79回 東京都中学校支部対抗陸上競技選手権大会",
    dates: "10/3(土)・10/4(日)", start: "20261003", end: "20261005",
    venue: "駒沢オリンピック公園総合運動場陸上競技場",
    desc: "東京陸協の2026年度公認競技会日程に掲載されている支部対抗大会です。",
    youkou: "https://www.tokyoctr.com/youkou/shibu.pdf",
    results: "https://gold.jaic.org/tokyo/cyuugaku/index.htm",
  },
  {
    id: "branch2-autumn", cat: "第2支部", season: "秋",
    title: "第2支部秋季競技会",
    dates: "11/14(土)・11/15(日)", start: "20261114", end: "20261116",
    venue: "夢の島競技場",
    desc: "第2支部の秋季競技会。第2支部サイトでは11/14・11/15、会場は夢の島とされています。",
    youkou: "http://www.tokyokotairenrikujo.jp/branch23/branch2.html",
    results: "http://www.tokyokotairenrikujo.jp/branch23/2026/SL/06_syuki/kyougi.html",
  },
  {
    id: "branch2-ekiden", cat: "第2支部", season: "冬",
    title: "第2支部新春駅伝大会",
    dates: "2027/1/16(金) ※要項で最終確認", start: "20270116", end: "20270117",
    venue: "会場未確定",
    desc: "第2支部の冬季駅伝大会。詳細は支部サイトの要項で確認してください。",
    youkou: "http://www.tokyokotairenrikujo.jp/branch23/branch2.html",
    results: "http://www.tokyokotairenrikujo.jp/branch23/2026/SL/07_ekiden/kyougi.html",
  },
];

const LINKS = [
  { name: "東京都中体連 陸上競技専門部", url: "https://www.tokyoctr.com/youkou.htm" },
  { name: "第2支部 東京校体連 陸上", url: "http://www.tokyokotairenrikujo.jp/branch23/branch2.html" },
  { name: "東京陸協 公認競技会情報", url: "https://toriku.or.jp/competition/" },
  { name: "日本陸連 JAAF", url: "https://www.jaaf.or.jp/" },
  { name: "World Athletics", url: "https://worldathletics.org/" },
];

/* ---------- helpers ---------- */
const eventsUrl = (m: Any) => `/events/${m.id}.html`;
const timetableUrl = (m: Any) => `/timetables/${m.id}.html`;
const mapUrl = (m: Any) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.venue)}`;
const gcalUrl = (m: Any) =>
  `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(m.title)}&dates=${m.start}/${m.end}&location=${encodeURIComponent(m.venue)}&details=${encodeURIComponent(m.youkou)}`;
const icsUrl = (m: Any) =>
  "data:text/calendar;charset=utf-8," + encodeURIComponent(
    `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//junior-track-field//JA\nBEGIN:VEVENT\nUID:${m.id}@junior-track-field\nDTSTART;VALUE=DATE:${m.start}\nDTEND;VALUE=DATE:${m.end}\nSUMMARY:${m.title}\nLOCATION:${m.venue}\nDESCRIPTION:${m.youkou}\nEND:VEVENT\nEND:VCALENDAR`);
const toDate = (s: string) => new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8));
const catColor = (cat: string) => (cat === "第2支部" ? C.branch : C.tartan);

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

/* ---------- リンクボタン ---------- */
const LinkBtn = ({ href, children, external, accent }: Any) => (
  <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}
    style={{
      textDecoration: "none", display: "inline-block",
      padding: "7px 14px", borderRadius: 999,
      fontFamily: fontBody, fontSize: 12, fontWeight: 600,
      border: `1.5px solid ${accent ? C.ink : C.grid}`,
      background: accent ? C.ink : "#fff", color: accent ? "#fff" : C.ink,
      transition: "all .2s",
    }}>
    {children}{external ? " ↗" : " →"}
  </a>
);

/* ---------- NEXT EVENT 電光掲示板 ---------- */
const NextEventBoard = ({ meet, days }: Any) => (
  <div style={{ background: C.board, borderRadius: 20, padding: "26px 28px", boxShadow: "0 18px 40px rgba(20,22,27,.28)", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, opacity: 0.07, pointerEvents: "none", background: `repeating-linear-gradient(105deg, transparent 0 90px, ${C.lane} 90px 92px)` }} />
    <div style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "center" }}>
      <div style={{ flex: "1 1 380px", minWidth: 0 }}>
        <div style={{ fontFamily: fontBody, fontSize: 11, letterSpacing: "0.22em", color: "#8A92A0", marginBottom: 8 }}>
          NEXT EVENT — {meet.cat}
        </div>
        <h2 style={{ fontFamily: fontBody, fontSize: "clamp(17px,2.6vw,23px)", fontWeight: 800, color: "#EDEFF2", margin: 0, lineHeight: 1.45 }}>
          {meet.title}
        </h2>
        <div style={{ fontFamily: fontBody, fontSize: 13, color: "#B7BDC8", marginTop: 10 }}>
          {meet.dates}　{meet.venue}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
          {[
            ["競技種目", eventsUrl(meet), false],
            ["タイムテーブル", timetableUrl(meet), false],
            ["要項", meet.youkou, true],
            ["結果", meet.results, true],
            ["マップ", mapUrl(meet), true],
          ].map(([label, href, ext]: Any) => (
            <a key={label} href={href} target={ext ? "_blank" : undefined} rel={ext ? "noopener noreferrer" : undefined}
              style={{ textDecoration: "none", padding: "7px 14px", borderRadius: 999, fontFamily: fontBody, fontSize: 12, fontWeight: 600, border: "1.5px solid #3A3F49", color: "#EDEFF2", transition: "all .2s" }}>
              {label}{ext ? " ↗" : " →"}
            </a>
          ))}
        </div>
      </div>
      <div style={{ textAlign: "center", paddingRight: 6 }}>
        <div style={{ fontFamily: fontBody, fontSize: 11, letterSpacing: ".22em", color: "#717A88" }}>COUNTDOWN</div>
        <div style={{ fontFamily: fontMono, fontSize: "clamp(46px,8vw,76px)", fontWeight: 600, color: C.led, lineHeight: 1.05, textShadow: `0 0 24px ${C.led}55`, fontVariantNumeric: "tabular-nums" }}>
          {days >= 0 ? days : 0}
        </div>
        <div style={{ fontFamily: fontBody, fontSize: 12, color: "#B7BDC8" }}>
          {days > 0 ? "DAYS TO GO" : "開催中"}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 12, justifyContent: "center" }}>
          <a href={gcalUrl(meet)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", fontFamily: fontBody, fontSize: 11, color: "#9AA1AC", border: "1px solid #3A3F49", borderRadius: 999, padding: "5px 10px" }}>Gカレンダー</a>
          <a href={icsUrl(meet)} download={`${meet.id}.ics`} style={{ textDecoration: "none", fontFamily: fontBody, fontSize: 11, color: "#9AA1AC", border: "1px solid #3A3F49", borderRadius: 999, padding: "5px 10px" }}>Apple</a>
        </div>
      </div>
    </div>
  </div>
);

/* ---------- 大会カード ---------- */
const MeetCard = ({ m, isNext }: Any) => (
  <article style={{
    background: "#fff", borderRadius: 18, padding: "20px 24px",
    boxShadow: "0 2px 6px rgba(23,26,32,.06), 0 12px 30px rgba(23,26,32,.06)",
    borderLeft: `5px solid ${catColor(m.cat)}`,
    opacity: 1,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
      <span style={{ fontFamily: fontBody, fontSize: 10.5, fontWeight: 700, letterSpacing: ".08em", color: "#fff", background: catColor(m.cat), borderRadius: 6, padding: "3px 9px" }}>
        {m.cat}・{m.season}
      </span>
      <span style={{ fontFamily: fontMono, fontSize: 13, color: C.ink, fontWeight: 600 }}>{m.dates}</span>
      {isNext && <span style={{ fontFamily: fontBody, fontSize: 10.5, fontWeight: 700, color: C.tartan, border: `1.5px solid ${C.tartan}`, borderRadius: 6, padding: "2px 8px" }}>NEXT</span>}
    </div>
    <h3 style={{ fontFamily: fontBody, fontSize: 16.5, fontWeight: 800, margin: "0 0 4px", lineHeight: 1.5 }}>{m.title}</h3>
    <div style={{ fontFamily: fontBody, fontSize: 12.5, color: C.sub, marginBottom: 8 }}>{m.venue}</div>
    <p style={{ fontFamily: fontBody, fontSize: 12.5, color: C.sub, margin: "0 0 14px", lineHeight: 1.7 }}>{m.desc}</p>
    <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
      <LinkBtn href={eventsUrl(m)} accent>競技種目</LinkBtn>
      <LinkBtn href={timetableUrl(m)}>タイムテーブル</LinkBtn>
      <LinkBtn href={m.youkou} external>要項</LinkBtn>
      <LinkBtn href={m.results} external>結果</LinkBtn>
      <LinkBtn href={mapUrl(m)} external>マップ</LinkBtn>
      <LinkBtn href={gcalUrl(m)} external>Gカレンダー</LinkBtn>
      <a href={icsUrl(m)} download={`${m.id}.ics`} style={{ textDecoration: "none", padding: "7px 14px", borderRadius: 999, fontFamily: fontBody, fontSize: 12, fontWeight: 600, border: `1.5px solid ${C.grid}`, background: "#fff", color: C.ink }}>Appleカレンダー ↓</a>
    </div>
  </article>
);

/* ---------- セクション見出し ---------- */
const SectionTitle = ({ en, ja }: Any) => (
  <div style={{ margin: "44px 0 16px", display: "flex", alignItems: "baseline", gap: 12 }}>
    <h2 style={{ fontFamily: fontDisplay, fontSize: 30, margin: 0, letterSpacing: ".03em", color: C.ink }}>{en}</h2>
    <span style={{ fontFamily: fontBody, fontSize: 13, fontWeight: 600, color: C.sub }}>{ja}</span>
  </div>
);

/* ---------- メイン ---------- */
export default function SchedulePage() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); }, []);

  const next = useMemo(() => {
    if (!now) return null;
    const upcoming = MEETS.filter((m) => toDate(m.end) >= now)
      .sort((a, b) => +toDate(a.start) - +toDate(b.start));
    return upcoming[0] || MEETS[MEETS.length - 1];
  }, [now]);
  const days = useMemo(() => {
    if (!now || !next) return 0;
    return Math.ceil((+toDate(next.start) - +now) / 86400000);
  }, [now, next]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: fontBody, color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@500;600&family=Noto+Sans+JP:wght@400;500;700;900&display=swap');
        @keyframes rise { from { opacity:0; transform:translateY(14px);} to { opacity:1; transform:none;} }
        .rise { animation: rise .55s cubic-bezier(.22,1,.36,1) both; }
        @media (prefers-reduced-motion: reduce) { *,*::before,*::after { animation-duration:.01ms!important; transition-duration:.01ms!important; } }
        a:focus-visible { outline: 3px solid ${C.tartan}; outline-offset: 2px; }
        a:hover { opacity: .92; }
      `}</style>

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "28px 20px 60px" }}>
        <SiteNav active="SCHEDULE" />

        <header className="rise" style={{ marginBottom: 26 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
            <h1 style={{ fontFamily: fontDisplay, fontSize: "clamp(40px,6vw,60px)", margin: 0, letterSpacing: ".02em", lineHeight: 1 }}>
              2026 <span style={{ color: C.tartan }}>SEASON</span> SCHEDULE
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: C.sub, fontWeight: 500 }}>中学陸上競技部 大会日程</p>
          </div>
        </header>

        {next && (
          <div className="rise" style={{ animationDelay: ".08s" }}>
            <NextEventBoard meet={next} days={days} />
          </div>
        )}

        <SectionTitle en="SEASON FLOW" ja="年間の流れ" />
        <div className="rise" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { cat: "第2支部", flow: ["春季", "支部予選", "夏季", "支部新人", "秋季", "新春駅伝"] },
            { cat: "東京都中体連", flow: ["地域別", "通信", "都総体", "支部対抗"] },
          ].map(({ cat, flow }) => (
            <div key={cat} style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", boxShadow: "0 1px 3px rgba(23,26,32,.08)" }}>
              <span style={{ fontFamily: fontBody, fontSize: 11, fontWeight: 700, color: "#fff", background: catColor(cat), borderRadius: 6, padding: "4px 10px", whiteSpace: "nowrap" }}>{cat}</span>
              {flow.map((f, i) => (
                <React.Fragment key={f}>
                  {i > 0 && <span style={{ color: C.grid, fontFamily: fontMono }}>→</span>}
                  <span style={{ fontFamily: fontBody, fontSize: 13, fontWeight: 600 }}>{f}</span>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>

        <SectionTitle en="ALL EVENTS" ja="大会一覧（日程順）" />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {MEETS.map((m, i) => (
            <div key={m.id} className="rise" style={{ animationDelay: `${0.04 * i}s` }}>
              <MeetCard m={m} isNext={next && m.id === next.id} />
            </div>
          ))}
        </div>

        <SectionTitle en="LINKS" ja="関連サイト" />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {LINKS.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
              style={{ textDecoration: "none", background: "#fff", color: C.ink, borderRadius: 12, padding: "12px 18px", fontFamily: fontBody, fontSize: 13, fontWeight: 600, boxShadow: "0 1px 3px rgba(23,26,32,.08)" }}>
              {l.name} ↗
            </a>
          ))}
        </div>

        <footer style={{ marginTop: 44, fontSize: 11.5, color: C.sub, lineHeight: 1.9 }}>
          日程・会場は主催者の発表に基づきます。最新情報は必ず各大会の要項でご確認ください。
        </footer>
      </div>
    </div>
  );
}
