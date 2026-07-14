"use client";

/**
 * 大会タイムテーブル  — 動的ルート
 * 配置: app/timetables/[id]/page.tsx
 * スケジュールページの各カードの「タイムテーブル」ボタンから開く。
 *
 * データ方針: 要項PDFの日程表で確認できた大会のみ日割りを掲載。
 * 未確認の大会は「発表され次第掲載」と案内し、要項PDFへ誘導する。
 * 中学女子種目を太字＋オレンジで強調。
 */

import React from "react";
import { useParams } from "next/navigation";

const C = {
  bg: "#EDEFF2", ink: "#171A20", sub: "#5C636E",
  tartan: "#E04E1C", tartanDeep: "#B23A12", lane: "#FFFFFF",
  board: "#14161B", led: "#FFC233", ledDim: "#7A6021", grid: "#D8DBE0",
  shigaku: "#1E7A5E", branch: "#3A5BA0",
};
const fontDisplay = "'Bebas Neue', 'Noto Sans JP', sans-serif";
const fontMono = "'IBM Plex Mono', monospace";
const fontBody = "'Noto Sans JP', sans-serif";
type Any = any;

/* ---------- タイムテーブルのデータ ---------- */
/* days[].events は種目名。w=中学女子の注目種目, note=補足 */
const TT: Record<string, Any> = {
  "shigaku": {
    title: "第69回 東京私立中学高等学校陸上競技選手権大会",
    cat: "私学", color: C.shigaku,
    youkou: "https://www.sgk-tandf.tokyo/2026/sgk26yoko.pdf",
    caption: "中学女子の種目の日割り（要項案ver1.0の日程表より）。時刻は当日のスタートリスト・タイムテーブルで確認してください。",
    days: [
      { label: "1日目", date: "8/17(月)", venue: "大井ふ頭中央海浜公園", events: [
        { name: "中学女子 種目なし（この日は主に高校種目）", w: false, note: true },
      ]},
      { label: "2日目", date: "8/18(火)", venue: "駒沢", events: [
        { name: "1年 100m（予選・決勝）", w: true },
        { name: "走高跳", w: false },
      ]},
      { label: "3日目", date: "8/19(水)", venue: "駒沢", events: [
        { name: "2年 100m（予選・決勝）", w: true },
        { name: "3年 100m（予選・決勝）", w: true },
        { name: "4×100mR", w: false },
      ]},
      { label: "4日目", date: "8/20(木)", venue: "駒沢", events: [
        { name: "1500m", w: false },
        { name: "100mH", w: false },
        { name: "砲丸投", w: false },
      ]},
    ],
  },
  "branch-natsu": {
    title: "第2・3支部 夏季競技会",
    cat: "第2・3支部", color: C.branch,
    youkou: "http://www.tokyokotairenrikujo.jp/branch23/2026/26_%E5%A4%8F%E5%AD%A32%E6%94%AF%E9%83%A8%E8%A6%81%E9%A0%85.pdf",
    caption: "競技日程（案）より。正式なタイムテーブルは大会HPで確認してください。女子100mは2日目(8/12)です。",
    days: [
      { label: "1日目", date: "8/10(月) 17:00〜", venue: "スピアーズえどりくフィールド", events: [
        { name: "女子 300mH / 男子 300mH", w: false },
        { name: "女子 300m / 男子 300m", w: false },
        { name: "女子 3000m / 男子 3000m・5000m", w: false },
      ]},
      { label: "2日目", date: "8/12(水) 9:15〜", venue: "スピアーズえどりくフィールド", events: [
        { name: "女子 1500m / 男子 1500m", w: false },
        { name: "女子 100mYH / 女子 100mH", w: false },
        { name: "男子 110mJH / 110mH", w: false },
        { name: "女子 400m / 男子 400m", w: false },
        { name: "女子 100m", w: true },
        { name: "男子 100m", w: false },
        { name: "女子 4×100mR / 男子 4×100mR", w: false },
        { name: "[フィールド] 三段跳・円盤投・走高跳・砲丸投 ほか", w: false },
      ]},
      { label: "3日目", date: "8/13(木) 9:15〜", venue: "スピアーズえどりくフィールド", events: [
        { name: "男子 3000mSC", w: false },
        { name: "女子 400mH / 男子 400mH", w: false },
        { name: "女子 800m / 男子 800m", w: false },
        { name: "女子 200m / 男子 200m", w: false },
        { name: "女子 4×400mR / 男子 4×400mR", w: false },
        { name: "[フィールド] 走幅跳・やり投・棒高跳・砲丸投 ほか", w: false },
      ]},
    ],
  },
};

/* 大会id → タイトル（未掲載大会の案内用の最小情報） */
const KNOWN: Record<string, { title: string; youkou: string; cat: string }> = {
  "tokyo-regional": { title: "第77回 東京都中学校地域別陸上競技大会", youkou: "https://www.tokyoctr.com/youkou/chiiki2.pdf", cat: "東京都中体連" },
  "tokyo-tsushin": { title: "第72回 全日本中学校通信陸上競技 東京都大会", youkou: "https://www.tokyoctr.com/youkou/tuushin3.pdf", cat: "東京都中体連" },
  "tokyo-sotai": { title: "第65回 東京都中学校総合体育大会", youkou: "https://www.tokyoctr.com/youkou/sou3.pdf", cat: "東京都中体連" },
  "tokyo-shibu-taiko": { title: "第79回 東京都中学校支部対抗陸上競技選手権大会", youkou: "https://www.tokyoctr.com/youkou/shibu.pdf", cat: "東京都中体連" },
  "tokyo-ekiden": { title: "東京都中学校駅伝競走大会", youkou: "https://www.tokyoctr.com/youkou/ekiden.pdf", cat: "東京都中体連" },
  "tokyo-road": { title: "第65回 東京都中学校ロードレース大会", youkou: "https://www.tokyoctr.com/youkou/road.pdf", cat: "東京都中体連" },
  "branch-spring": { title: "第2・3支部 春季競技会", youkou: "http://www.tokyokotairenrikujo.jp/branch23/branch2.html", cat: "第2・3支部" },
  "branch-yosen": { title: "第2・3支部 支部予選", youkou: "http://www.tokyokotairenrikujo.jp/branch23/branch2.html", cat: "第2・3支部" },
  "branch-gakunen": { title: "第2・3支部 学年別大会", youkou: "http://www.tokyokotairenrikujo.jp/branch23/branch2.html", cat: "第2・3支部" },
  "branch-shinjin": { title: "第2・3支部 支部新人", youkou: "http://www.tokyokotairenrikujo.jp/branch23/branch2.html", cat: "第2・3支部" },
  "branch-aki": { title: "第2・3支部 秋季競技会", youkou: "http://www.tokyokotairenrikujo.jp/branch23/branch2.html", cat: "第2・3支部" },
  "branch-ekiden": { title: "第2・3支部 新春駅伝大会", youkou: "http://www.tokyokotairenrikujo.jp/branch23/branch2.html", cat: "第2・3支部" },
};

/* ---------- 共通ナビ ---------- */
const SiteNav = () => (
  <nav style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
    {[["/", "SCHEDULE", "大会日程"], ["/records", "RECORDS", "女子100m記録"]].map(([href, en, ja]) => (
      <a key={en} href={href} style={{
        textDecoration: "none", display: "inline-flex", alignItems: "baseline", gap: 8,
        padding: "9px 20px", borderRadius: 12, background: "#fff", color: C.sub,
        boxShadow: "0 1px 3px rgba(23,26,32,.08)",
      }}>
        <span style={{ fontFamily: fontDisplay, fontSize: 19, letterSpacing: ".05em" }}>{en}</span>
        <span style={{ fontFamily: fontBody, fontSize: 11, fontWeight: 600 }}>{ja}</span>
      </a>
    ))}
  </nav>
);

const Shell = ({ children }: Any) => (
  <div style={{ minHeight: "100vh", background: C.bg, fontFamily: fontBody, color: C.ink }}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@500;600&family=Noto+Sans+JP:wght@400;500;700;900&display=swap');
      @keyframes rise { from { opacity:0; transform:translateY(14px);} to { opacity:1; transform:none;} }
      .rise { animation: rise .55s cubic-bezier(.22,1,.36,1) both; }
      a:hover { opacity: .92; }
    `}</style>
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px 60px" }}>
      <SiteNav />
      {children}
    </div>
  </div>
);

const BackLink = () => (
  <a href="/" style={{ textDecoration: "none", fontFamily: fontBody, fontSize: 13, color: C.sub, fontWeight: 600 }}>← 大会日程にもどる</a>
);

/* ---------- メイン ---------- */
export default function TimetablePage() {
  const params = useParams();
  const id = String(params?.id || "");
  const data = TT[id];
  const known = KNOWN[id];

  // ケース1: タイムテーブル掲載済み
  if (data) {
    return (
      <Shell>
        <div className="rise">
          <BackLink />
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", margin: "14px 0 6px" }}>
            <span style={{ fontFamily: fontBody, fontSize: 10.5, fontWeight: 700, letterSpacing: ".08em", color: "#fff", background: data.color, borderRadius: 6, padding: "3px 9px" }}>{data.cat}</span>
            <h1 style={{ fontFamily: fontBody, fontSize: "clamp(20px,3vw,26px)", fontWeight: 800, margin: 0, lineHeight: 1.4 }}>{data.title}</h1>
          </div>
          <p style={{ fontFamily: fontBody, fontSize: 12.5, color: C.sub, margin: "0 0 20px", lineHeight: 1.7 }}>{data.caption}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {data.days.map((d: Any, i: number) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 6px rgba(23,26,32,.06), 0 12px 30px rgba(23,26,32,.06)" }}>
                <div style={{ background: C.board, padding: "12px 20px", display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: fontDisplay, fontSize: 22, color: C.led, letterSpacing: ".04em" }}>{d.label}</span>
                  <span style={{ fontFamily: fontMono, fontSize: 14, color: "#EDEFF2", fontWeight: 600 }}>{d.date}</span>
                  <span style={{ fontFamily: fontBody, fontSize: 12, color: "#8A92A0" }}>{d.venue}</span>
                </div>
                <div style={{ padding: "6px 0" }}>
                  {d.events.map((e: Any, j: number) => (
                    <div key={j} style={{
                      padding: "10px 20px", borderTop: j === 0 ? "none" : `1px solid ${C.grid}`,
                      display: "flex", alignItems: "center", gap: 10,
                      background: e.w ? "#FBF1EC" : "transparent",
                    }}>
                      {e.w && <span style={{ fontFamily: fontBody, fontSize: 10, fontWeight: 700, color: "#fff", background: C.tartan, borderRadius: 5, padding: "2px 7px", whiteSpace: "nowrap" }}>女子100m</span>}
                      <span style={{ fontFamily: fontBody, fontSize: 13.5, fontWeight: e.w ? 700 : 400, color: e.note ? C.sub : C.ink, fontStyle: e.note ? "italic" : "normal" }}>{e.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href={data.youkou} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", padding: "9px 18px", borderRadius: 999, fontFamily: fontBody, fontSize: 13, fontWeight: 600, background: C.ink, color: "#fff" }}>要項PDF ↗</a>
            <BackLink />
          </div>
          <p style={{ fontFamily: fontBody, fontSize: 11.5, color: C.sub, marginTop: 18, lineHeight: 1.8 }}>
            ※ 競技日程は変更されることがあります。正式なタイムテーブルは各大会のホームページ・当日のプログラムで確認してください。
          </p>
        </div>
      </Shell>
    );
  }

  // ケース2: 大会は存在するがタイムテーブル未掲載
  if (known) {
    return (
      <Shell>
        <div className="rise">
          <BackLink />
          <h1 style={{ fontFamily: fontBody, fontSize: "clamp(20px,3vw,26px)", fontWeight: 800, margin: "14px 0 10px", lineHeight: 1.4 }}>{known.title}</h1>
          <div style={{ background: "#fff", borderRadius: 16, padding: "32px 26px", textAlign: "center", boxShadow: "0 2px 6px rgba(23,26,32,.06), 0 12px 30px rgba(23,26,32,.06)" }}>
            <div style={{ fontFamily: fontDisplay, fontSize: 30, color: C.grid, letterSpacing: ".05em", marginBottom: 8 }}>COMING SOON</div>
            <p style={{ fontFamily: fontBody, fontSize: 14, color: C.sub, margin: "0 0 20px", lineHeight: 1.8 }}>
              この大会のタイムテーブルはまだ公表されていません。<br />
              発表され次第このページに掲載します。現時点では要項をご確認ください。
            </p>
            <a href={known.youkou} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", padding: "10px 22px", borderRadius: 999, fontFamily: fontBody, fontSize: 13, fontWeight: 600, background: C.ink, color: "#fff" }}>要項を見る ↗</a>
          </div>
          <div style={{ marginTop: 20 }}><BackLink /></div>
        </div>
      </Shell>
    );
  }

  // ケース3: 不明なid
  return (
    <Shell>
      <div className="rise">
        <h1 style={{ fontFamily: fontBody, fontSize: 22, fontWeight: 800, margin: "14px 0 10px" }}>ページが見つかりません</h1>
        <p style={{ fontFamily: fontBody, fontSize: 14, color: C.sub, marginBottom: 20 }}>指定された大会のタイムテーブルは存在しません。</p>
        <BackLink />
      </div>
    </Shell>
  );
}
