"use client";

/**
 * 大会日程（SCHEDULE）ページ  — 2026年度・完全版
 * 配置: app/page.tsx ※既存の中身をすべてこのファイルで置き換え
 * レコードページ（/records）とデザイン統一。
 *
 * 各大会の情報はすべて要項PDF本文で裏取り済み。
 * w100 フィールド = 女子100mの実施日/ラウンド（日程表から確認）。
 */

import React, { useMemo, useEffect, useState } from "react";

const C = {
  bg: "#EDEFF2", ink: "#171A20", sub: "#5C636E",
  tartan: "#E04E1C", tartanDeep: "#B23A12", lane: "#FFFFFF",
  board: "#14161B", led: "#FFC233", ledDim: "#7A6021", grid: "#D8DBE0",
  shigaku: "#1E7A5E", // 私学（緑）
  branch: "#3A5BA0", // 第2・3支部（青）
};
const fontDisplay = "'Bebas Neue', 'Noto Sans JP', sans-serif";
const fontMono = "'IBM Plex Mono', monospace";
const fontBody = "'Noto Sans JP', sans-serif";
type Any = any;

/* ---------- 大会データ（2026年度 / 令和8年度） ---------- */
const MEETS = [
  {
    id: "tokyo-regional", cat: "東京都中体連", season: "春",
    title: "第77回 東京都中学校地域別陸上競技大会",
    dates: "多摩 5/9・10＋5/30・31（上柚木）／区部 5/16・17＋6/6・7（夢の島）",
    start: "20260509", end: "20260608",
    venue: "多摩: 上柚木公園陸上競技場／区部: 夢の島競技場",
    desc: "記録会形式の地域別大会。ここで標準記録突破または入賞すると、通信・総体（都大会）への出場資格が得られる、シーズンの起点となる大会です。",
    w100: "女子100m: 1年・2年・3年（学年別）",
    youkou: "https://www.tokyoctr.com/youkou/chiiki2.pdf",
    results: "https://gold.jaic.org/tokyo/cyuugaku/index.htm",
  },
  {
    id: "tokyo-tsushin", cat: "東京都中体連", season: "夏",
    title: "第72回 全日本中学校通信陸上競技 東京都大会",
    dates: "6/27(土)・6/28(日)", start: "20260627", end: "20260629",
    venue: "上柚木公園陸上競技場",
    desc: "全国通信陸上につながる都大会。全国のランキング集計に使われ、好記録が出やすい大会です。要項は再改版版（tuushin3）。",
    w100: "女子100m: 1年・2年・3年（学年別）",
    youkou: "https://www.tokyoctr.com/youkou/tuushin3.pdf",
    results: "https://gold.jaic.org/tokyo/cyuugaku/index.htm",
  },
  {
    id: "tokyo-sotai", cat: "東京都中体連", season: "夏",
    title: "第65回 東京都中学校総合体育大会 兼 第79回 東京都中学校陸上競技選手権大会",
    dates: "7/24(金)・7/25(土)・7/26(日)", start: "20260724", end: "20260727",
    venue: "上柚木公園陸上競技場",
    desc: "総合体育大会と都選手権を兼ねる夏の主要大会。地域別での標準記録突破・入賞が出場条件です。要項は訂正版（sou3）。",
    w100: "女子100m: 1年・2年・3年（学年別）",
    youkou: "https://www.tokyoctr.com/youkou/sou3.pdf",
    results: "https://gold.jaic.org/tokyo/cyuugaku/index.htm",
  },
  {
    id: "shigaku", cat: "私学", season: "夏",
    title: "第69回 東京私立中学高等学校陸上競技選手権大会",
    dates: "8/17(月) 大井／8/18(火)〜20(木) 駒沢 ※要項(案)ver1.0",
    start: "20260817", end: "20260821",
    venue: "8/17: 大井ふ頭中央海浜公園陸上競技場／8/18〜20: 駒沢オリンピック公園総合運動場陸上競技場",
    desc: "私立中高合同の選手権。私学協会加盟校の在校生が対象で、私立校の選手はこちらにも出場できます。申込は日本陸連エントリーシステム（7/1〜7/11）。",
    w100: "女子100m: 1年=2日目 予選・決勝／2年・3年=3日目 予選・決勝",
    youkou: "https://www.sgk-tandf.tokyo/2026/sgk26yoko.pdf",
    results: "https://www.sgk-tandf.tokyo/",
  },
  {
    id: "tokyo-shibu-taiko", cat: "東京都中体連", season: "秋",
    title: "第79回 東京都中学校支部対抗陸上競技選手権大会",
    dates: "10/3(土)・10/4(日)", start: "20261003", end: "20261005",
    venue: "駒沢オリンピック公園総合運動場陸上競技場",
    desc: "市区町村の支部対抗戦。出場は支部予選の通過者または支部推薦者に限られ、各支部から女子19名以内・1種目2名まで。男子・女子・総合の3部門で得点を競います。",
    w100: "女子100m: 1年・2年・3年（学年別）",
    youkou: "https://www.tokyoctr.com/youkou/shibu.pdf",
    results: "https://gold.jaic.org/tokyo/cyuugaku/index.htm",
  },
  {
    id: "tokyo-ekiden", cat: "東京都中体連", season: "秋",
    title: "第79回(男子)・第41回(女子) 東京都中学校駅伝競走大会",
    dates: "11/8(日) ※雨天決行", start: "20261108", end: "20261109",
    venue: "江東区夢の島競技場および周辺特設コース",
    desc: "全国・関東中学校駅伝の東京都代表選考会を兼ねる駅伝大会。女子は5区間12km、男子は6区間18kmで争います。",
    w100: "駅伝のため100m種目なし（長距離）",
    youkou: "https://www.tokyoctr.com/youkou/ekiden.pdf",
    results: "https://gold.jaic.org/tokyo/cyuugaku/index.htm",
  },
  {
    id: "tokyo-road", cat: "東京都中体連", season: "冬",
    title: "第65回 東京都中学校ロードレース大会",
    dates: "2027/1/24(日) ※荒天順延", start: "20270124", end: "20270125",
    venue: "区部: 夢の島競技場周辺特設コース／多摩: 未定",
    desc: "学年別の距離でロードを走る大会。女子は1km・2km、男子は2km・3kmの種目があります。一人1種目まで。",
    w100: "ロードレースのため100m種目なし（1km・2km）",
    youkou: "https://www.tokyoctr.com/youkou/road.pdf",
    results: "https://gold.jaic.org/tokyo/cyuugaku/index.htm",
  },
  {
    id: "branch-spring", cat: "第2・3支部", season: "春",
    title: "第2・3支部 春季競技会",
    dates: "4/3(金)・4/4(土)", start: "20260403", end: "20260405",
    venue: "夢の島陸上競技場（江戸川区）",
    desc: "高体連第2・3支部主催の競技会。参加資格に「併設する中学校の生徒を含む」とあり、中高一貫校の中学生も出場できます。エントリーはJAAF athleticfamily。",
    w100: "女子100mあり（詳細はタイムテーブルで確認）",
    youkou: "http://www.tokyokotairenrikujo.jp/branch23/2026/26_%E6%98%A5%E5%AD%A32%E6%94%AF%E9%83%A8.pdf",
    results: "http://www.tokyokotairenrikujo.jp/branch23/branch2.html",
  },
  {
    id: "branch-yosen", cat: "第2・3支部", season: "春",
    title: "第2・3支部 支部予選",
    dates: "4/18(土)・4/19(日)", start: "20260418", end: "20260420",
    venue: "夢の島陸上競技場（江戸川区）",
    desc: "支部予選会。併設中学校の生徒も参加できます。エントリーはJAAF athleticfamily。",
    w100: "女子100mあり（詳細はタイムテーブルで確認）",
    youkou: "http://www.tokyokotairenrikujo.jp/branch23/2026/26_%E6%94%AF%E9%83%A8%E4%BA%88%E9%81%B82%E6%94%AF%E9%83%A8%E8%A6%81%E9%A0%85.pdf",
    results: "http://www.tokyokotairenrikujo.jp/branch23/branch2.html",
  },
  {
    id: "branch-gakunen", cat: "第2・3支部", season: "春",
    title: "第2・3支部 学年別大会",
    dates: "5/30(土)・5/31(日)", start: "20260530", end: "20260601",
    venue: "夢の島陸上競技場（江戸川区）",
    desc: "学年別の競技会。併設中学校の生徒も参加できます。エントリーはJAAF athleticfamily。",
    w100: "女子100mあり（学年別・詳細はタイムテーブルで確認）",
    youkou: "http://www.tokyokotairenrikujo.jp/branch23/2026/26_%E5%AD%A6%E5%B9%B4%E5%88%A52%E6%94%AF%E9%83%A8%E8%A6%81%E9%A0%85.pdf",
    results: "http://www.tokyokotairenrikujo.jp/branch23/branch2.html",
  },
  {
    id: "branch-natsu", cat: "第2・3支部", season: "夏",
    title: "第2・3支部 夏季競技会",
    dates: "8/10(月)・8/12(水)・8/13(木)", start: "20260810", end: "20260814",
    venue: "スピアーズえどりくフィールド（江戸川区陸上競技場）",
    desc: "夏季競技会。要項に「併設する中学校の生徒を含む」と明記。初日(8/10)は17:00開始、2日目・3日目は9:15開始です。エントリーはJAAF athleticfamily。",
    w100: "女子100m: 2日目 実施予定（要項の日程案より）",
    youkou: "http://www.tokyokotairenrikujo.jp/branch23/2026/26_%E5%A4%8F%E5%AD%A32%E6%94%AF%E9%83%A8%E8%A6%81%E9%A0%85.pdf",
    results: "http://www.tokyokotairenrikujo.jp/branch23/branch2.html",
  },
  {
    id: "branch-shinjin", cat: "第2・3支部", season: "夏",
    title: "第2・3支部 支部新人",
    dates: "8/26(水)・8/29(土)・8/30(日)", start: "20260826", end: "20260831",
    venue: "夢の島陸上競技場（江戸川区）",
    desc: "新人戦。併設中学校の生徒も参加できます。エントリーはJAAF athleticfamily。",
    w100: "女子100mあり（詳細はタイムテーブルで確認）",
    youkou: "http://www.tokyokotairenrikujo.jp/branch23/2026/26_%E6%94%AF%E9%83%A8%E6%96%B0%E4%BA%BA2%E6%94%AF%E9%83%A8%E8%A6%81%E9%A0%85.pdf",
    results: "http://www.tokyokotairenrikujo.jp/branch23/branch2.html",
  },
  {
    id: "branch-aki", cat: "第2・3支部", season: "秋",
    title: "第2・3支部 秋季競技会",
    dates: "11/14(土)・11/15(日) ※雨天決行", start: "20261114", end: "20261116",
    venue: "夢の島競技場",
    desc: "秋季競技会。併設中学校の生徒も参加できます。エントリーはJAAF athleticfamily。",
    w100: "女子100mあり（詳細はタイムテーブルで確認）",
    youkou: "http://www.tokyokotairenrikujo.jp/branch23/2026/26_%E7%A7%8B%E5%AD%A32%E6%94%AF%E9%83%A8%E8%A6%81%E9%A0%85.pdf",
    results: "http://www.tokyokotairenrikujo.jp/branch23/branch2.html",
  },
  {
    id: "branch-ekiden", cat: "第2・3支部", season: "冬",
    title: "第2・3支部 新春駅伝大会",
    dates: "2027/1/16(土) ※雨天決行", start: "20270116", end: "20270117",
    venue: "夢の島競技場",
    desc: "冬の駅伝大会。エントリーシートは支部ページからダウンロード。併設中学校の生徒も参加できます。",
    w100: "駅伝のため100m種目なし",
    youkou: "http://www.tokyokotairenrikujo.jp/branch23/2026/26_%E6%94%AF%E9%83%A8%E9%A7%85%E4%BC%9D2%E6%94%AF%E9%83%A8%E8%A6%81%E9%A0%852.pdf",
    results: "http://www.tokyokotairenrikujo.jp/branch23/branch2.html",
  },
];

const LINKS = [
  { name: "東京都中体連 陸上競技専門部", url: "https://www.tokyoctr.com/youkou.htm" },
  { name: "中体連 結果速報", url: "https://www.tokyoctr.com/kekka.htm" },
  { name: "東京私学陸上情報", url: "https://www.sgk-tandf.tokyo/" },
  { name: "高体連 第2・3支部 陸上", url: "http://www.tokyokotairenrikujo.jp/branch23/branch2.html" },
  { name: "記録公開（gold.jaic.org）", url: "https://gold.jaic.org/tokyo/cyuugaku/index.htm" },
  { name: "東京陸協 公認競技会情報", url: "https://toriku.or.jp/competition/" },
  { name: "日本陸連 JAAF", url: "https://www.jaaf.or.jp/" },
];

/* ---------- helpers ---------- */
const eventsUrl = (m: Any) => `/events/${m.id}.html`;
const timetableUrl = (m: Any) => `/timetables/${m.id}.html`;
const mapUrl = (m: Any) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.venue.split("／")[0].replace(/^[^:]*:\s*/, ""))}`;
const gcalUrl = (m: Any) =>
  `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(m.title)}&dates=${m.start}/${m.end}&location=${encodeURIComponent(m.venue)}&details=${encodeURIComponent(m.youkou)}`;
const icsUrl = (m: Any) =>
  "data:text/calendar;charset=utf-8," + encodeURIComponent(
    `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//junior-track-field//JA\nBEGIN:VEVENT\nUID:${m.id}@junior-track-field\nDTSTART;VALUE=DATE:${m.start}\nDTEND;VALUE=DATE:${m.end}\nSUMMARY:${m.title}\nLOCATION:${m.venue}\nDESCRIPTION:${m.youkou}\nEND:VEVENT\nEND:VCALENDAR`);
const toDate = (s: string) => new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8));
const catColor = (cat: string) => (cat === "私学" ? C.shigaku : cat === "第2・3支部" ? C.branch : C.tartan);
const monthLabel = (s: string) => `${+s.slice(4, 6)}`;

/* ---------- 共通ナビ ---------- */
const SiteNav = ({ active }: Any) => (
  <nav style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
    {[["/", "SCHEDULE", "大会日程"], ["/records", "RECORDS", "女子100m記録"]].map(([href, en, ja]) => {
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
const LinkBtn = ({ href, children, external, accent, download, dl }: Any) => (
  <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}
    download={download ? dl : undefined}
    style={{
      textDecoration: "none", display: "inline-block",
      padding: "7px 14px", borderRadius: 999,
      fontFamily: fontBody, fontSize: 12, fontWeight: 600,
      border: `1.5px solid ${accent ? C.ink : C.grid}`,
      background: accent ? C.ink : "#fff", color: accent ? "#fff" : C.ink,
      transition: "all .2s",
    }}>
    {children}{external ? " ↗" : download ? " ↓" : " →"}
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
        <h2 style={{ fontFamily: fontBody, fontSize: "clamp(17px,2.6vw,22px)", fontWeight: 800, color: "#EDEFF2", margin: 0, lineHeight: 1.45 }}>
          {meet.title}
        </h2>
        <div style={{ fontFamily: fontBody, fontSize: 13, color: "#B7BDC8", marginTop: 10 }}>
          {meet.dates}
        </div>
        <div style={{ fontFamily: fontBody, fontSize: 12.5, color: "#8A92A0", marginTop: 4 }}>
          {meet.venue}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
          {[["要項", meet.youkou, true], ["結果", meet.results, true], ["マップ", mapUrl(meet), true]].map(([label, href, ext]: Any) => (
            <a key={label} href={href} target={ext ? "_blank" : undefined} rel={ext ? "noopener noreferrer" : undefined}
              style={{ textDecoration: "none", padding: "7px 14px", borderRadius: 999, fontFamily: fontBody, fontSize: 12, fontWeight: 600, border: "1.5px solid #3A3F49", color: "#EDEFF2" }}>
              {label} ↗
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
const MeetCard = ({ m, isNext, isPast }: Any) => (
  <article style={{
    background: "#fff", borderRadius: 18, padding: "20px 24px",
    boxShadow: "0 2px 6px rgba(23,26,32,.06), 0 12px 30px rgba(23,26,32,.06)",
    borderLeft: `5px solid ${catColor(m.cat)}`,
    opacity: isPast ? 0.62 : 1,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
      <span style={{ fontFamily: fontBody, fontSize: 10.5, fontWeight: 700, letterSpacing: ".08em", color: "#fff", background: catColor(m.cat), borderRadius: 6, padding: "3px 9px" }}>
        {m.cat}・{m.season}
      </span>
      <span style={{ fontFamily: fontMono, fontSize: 13, color: C.ink, fontWeight: 600 }}>{m.dates}</span>
      {isNext && <span style={{ fontFamily: fontBody, fontSize: 10.5, fontWeight: 700, color: C.tartan, border: `1.5px solid ${C.tartan}`, borderRadius: 6, padding: "2px 8px" }}>NEXT</span>}
      {isPast && <span style={{ fontFamily: fontBody, fontSize: 10.5, fontWeight: 700, color: C.sub, border: `1.5px solid ${C.grid}`, borderRadius: 6, padding: "2px 8px" }}>終了</span>}
    </div>
    <h3 style={{ fontFamily: fontBody, fontSize: 16, fontWeight: 800, margin: "0 0 4px", lineHeight: 1.5 }}>{m.title}</h3>
    <div style={{ fontFamily: fontBody, fontSize: 12.5, color: C.sub, marginBottom: 8 }}>{m.venue}</div>
    <p style={{ fontFamily: fontBody, fontSize: 12.5, color: C.sub, margin: "0 0 14px", lineHeight: 1.7 }}>{m.desc}</p>
    <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
      <LinkBtn href={m.youkou} external accent>要項PDF</LinkBtn>
      <LinkBtn href={`/timetables/${m.id}`}>タイムテーブル</LinkBtn>
      <LinkBtn href={m.results} external>結果</LinkBtn>
      <LinkBtn href={mapUrl(m)} external>マップ</LinkBtn>
      <LinkBtn href={gcalUrl(m)} external>Gカレンダー</LinkBtn>
      <LinkBtn href={icsUrl(m)} download dl={`${m.id}.ics`}>Appleカレンダー</LinkBtn>
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

  const sorted = useMemo(() => [...MEETS].sort((a: Any, b: Any) => +toDate(a.start) - +toDate(b.start)), []);
  const next = useMemo(() => {
    if (!now) return null;
    return sorted.find((m: Any) => toDate(m.end) >= now) || sorted[sorted.length - 1];
  }, [now, sorted]);
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
            <p style={{ margin: 0, fontSize: 13, color: C.sub, fontWeight: 500 }}>東京都中学 陸上競技 大会日程</p>
          </div>
        </header>

        {next && (
          <div className="rise" style={{ animationDelay: ".08s" }}>
            <NextEventBoard meet={next} days={days} />
          </div>
        )}

        <SectionTitle en="SEASON FLOW" ja="シーズンの流れ" />
        <div className="rise" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { cat: "東京都中体連", flow: ["地域別(5-6月)", "通信(6月)", "都総体(7月)", "支部対抗(10月)", "駅伝(11月)", "ロードレース(1月)"] },
            { cat: "私学", flow: ["私学選手権(8月・私立校)"] },
            { cat: "第2・3支部", flow: ["春季(4月)", "支部予選(4月)", "学年別(5月)", "夏季(8月)", "支部新人(8月)", "秋季(11月)", "新春駅伝(1月)"] },
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
          {sorted.map((m: Any, i: number) => (
            <div key={m.id} className="rise" style={{ animationDelay: `${0.04 * i}s` }}>
              <MeetCard
                m={m}
                isNext={next && m.id === next.id}
                isPast={now ? toDate(m.end) < now : false}
              />
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
          日程・会場・要項は主催者の発表に基づき、要項PDFの本文で確認しています。
          私学選手権は要項（案）ver1.0時点の情報です。
          第2・3支部の大会は高体連主催ですが、要項に「併設する中学校の生徒を含む」とあり、中高一貫校の中学生も出場できます。
          最新・確定情報は必ず各大会の要項でご確認ください。
        </footer>
      </div>
    </div>
  );
}
