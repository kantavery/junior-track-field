import eventsData from '../data/events.json';

type EventItem = {
  id: string;
  category: '第2支部' | '東京都中体連';
  season: string;
  name: string;
  shortName: string;
  startDate: string;
  endDate: string;
  dateLabel: string;
  venue: string;
  summary: string;
  officialUrl: string;
  guidelineUrl: string;
  timetablePageUrl: string | null;
  timetableUrl: string;
  resultUrl: string;
  eventsPageUrl: string;
  mapUrl: string;
};

const events = eventsData as EventItem[];

function startOfTokyoToday() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
  return new Date(`${formatter.format(now)}T00:00:00+09:00`);
}

function daysUntil(dateText: string) {
  const today = startOfTokyoToday();
  const target = new Date(`${dateText}T00:00:00+09:00`);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getNextEvent() {
  const tomorrow = new Date(startOfTokyoToday());
  tomorrow.setDate(tomorrow.getDate() + 1);
  return [...events]
    .filter((e) => new Date(`${e.startDate}T00:00:00+09:00`) >= tomorrow)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
}

// Googleカレンダー用URL生成
function googleCalUrl(event: EventItem) {
  const fmt = (d: string) => d.replace(/-/g, '');
  const end = new Date(event.endDate);
  end.setDate(end.getDate() + 1);
  const endStr = end.toISOString().slice(0, 10).replace(/-/g, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.name,
    dates: `${fmt(event.startDate)}/${endStr}`,
    location: event.venue,
    details: `第2支部・東京都中体連 陸上競技大会\n${event.guidelineUrl}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// iCal(.ics)用データURL生成
function icsContent(event: EventItem) {
  const fmt = (d: string) => d.replace(/-/g, '');
  const end = new Date(event.endDate);
  end.setDate(end.getDate() + 1);
  const endStr = end.toISOString().slice(0, 10).replace(/-/g, '');
  const now = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//junior-track-field//JA',
    'BEGIN:VEVENT',
    `UID:${event.id}@junior-track-field`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${fmt(event.startDate)}`,
    `DTEND;VALUE=DATE:${endStr}`,
    `SUMMARY:${event.name}`,
    `LOCATION:${event.venue}`,
    `DESCRIPTION:${event.guidelineUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function VenueIcon({ className }: { className?: string }) {
  return (
    <svg className={`venueIcon ${className ?? ''}`} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function ExternalLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className={`actionButton ${className ?? ''}`}>
      {children} <span aria-hidden="true">↗</span>
    </a>
  );
}

function InternalLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className={`actionButton ${className ?? ''}`}>
      {children} <span aria-hidden="true">→</span>
    </a>
  );
}

function CategoryBadge({ category }: { category: EventItem['category'] }) {
  return <span className={`badge ${category === '第2支部' ? 'branch' : 'tokyo'}`}>{category}</span>;
}

function CalendarButtons({ event }: { event: EventItem }) {
  const ics = typeof window !== 'undefined'
    ? `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent(event))}`
    : '#';
  return (
    <div className="calButtons">
      <a href={googleCalUrl(event)} target="_blank" rel="noreferrer noopener" className="calBtn calBtn-google">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
          <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"/>
        </svg>
        Googleカレンダー
      </a>
      <a href={ics} download={`${event.id}.ics`} className="calBtn calBtn-apple">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
        Appleカレンダー
      </a>
    </div>
  );
}

function EventCard({ event }: { event: EventItem }) {
  const categoryClass = event.category === '第2支部' ? 'branchCard' : 'tokyoCard';
  const colorClass = event.category === '第2支部' ? 'branch' : 'tokyo';
  return (
    <article className={`eventCard ${categoryClass}`}>
      <div className="eventCardTop">
        <CategoryBadge category={event.category} />
        <span className="seasonTag">{event.season}</span>
      </div>
      <p className="dateLabel">{event.dateLabel}</p>
      <h3>{event.name}</h3>
      <p className="venue"><VenueIcon /> {event.venue}</p>
      <p className="summary">{event.summary}</p>
      <div className="buttonGrid">
        <InternalLink href={event.eventsPageUrl} className={`highlight ${colorClass}`}>競技種目</InternalLink>
        {event.timetablePageUrl
          ? <InternalLink href={event.timetablePageUrl} className={`highlight ${colorClass}`}>タイムテーブル</InternalLink>
          : <ExternalLink href={event.timetableUrl}>タイムテーブル</ExternalLink>}
        <ExternalLink href={event.guidelineUrl}>要項</ExternalLink>
        <ExternalLink href={event.resultUrl}>結果</ExternalLink>
        <ExternalLink href={event.mapUrl}>マップ</ExternalLink>
      </div>
      <CalendarButtons event={event} />
    </article>
  );
}

function FlowRail({ title, category, items }: { title: string; category: EventItem['category']; items: string[] }) {
  return (
    <section className={`flowRail ${category === '第2支部' ? 'branchFlow' : 'tokyoFlow'}`}>
      <div className="flowHeader">
        <CategoryBadge category={category} />
        <h3>{title}</h3>
      </div>
      <div className="flowItems">
        {items.map((item, index) => (
          <div className="flowItem" key={item}>
            <span>{item}</span>
            {index < items.length - 1 && <b aria-hidden="true">→</b>}
          </div>
        ))}
      </div>
    </section>
  );
}

// 第2支部・東京都中体連用のSVGアイコン（faviconなし）
function TrackSVG({ color }: { color: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <ellipse cx="16" cy="16" rx="13" ry="9" stroke={color} strokeWidth="2.5" fill="none"/>
      <ellipse cx="16" cy="16" rx="8" ry="4.5" stroke={color} strokeWidth="1.5" fill="none" strokeDasharray="3 2"/>
      <circle cx="21" cy="11" r="2" fill={color}/>
      <path d="M19 13.5c1-1.5 3-1 3.5.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M20.5 14c.5 1.5-.5 3-2 3" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function LinkBanners() {
  const links = [
    {
      href: 'https://www.tokyoctr.com/youkou.htm',
      label: '東京都中体連',
      sub: '陸上競技専門部',
      color: '#2563eb',
      faviconDomain: null, // faviconなし → SVG
    },
    {
      href: 'http://www.tokyokotairenrikujo.jp/branch23/branch2.html',
      label: '第2支部',
      sub: '東京校体連 陸上',
      color: '#16a34a',
      faviconDomain: null, // faviconなし → SVG
    },
    {
      href: 'https://toriku.or.jp/competition/',
      label: '東京陸協',
      sub: '公認競技会情報',
      color: '#0369a1',
      faviconDomain: 'toriku.or.jp',
    },
    {
      href: 'https://www.jaaf.or.jp/',
      label: '日本陸連 JAAF',
      sub: '日本陸上競技連盟',
      color: '#dc2626',
      faviconDomain: 'jaaf.or.jp',
    },
    {
      href: 'https://worldathletics.org/',
      label: 'World Athletics',
      sub: '世界陸連',
      color: '#7c3aed',
      faviconDomain: 'worldathletics.org',
    },
  ];

  return (
    <section className="bannerSection">
      <div className="sectionTitle">
        <p className="eyebrow dark">Links</p>
        <h2>関連サイト</h2>
      </div>
      <div className="bannerGrid">
        {links.map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noreferrer noopener"
            className="bannerCard" style={{ '--accent': l.color } as React.CSSProperties}>
            <span className="bannerIconWrap">
              {l.faviconDomain ? (
                <img
                  src={`https://www.google.com/s2/favicons?domain=${l.faviconDomain}&sz=64`}
                  alt={l.label}
                  width="32"
                  height="32"
                  className="bannerFavicon"
                />
              ) : (
                <TrackSVG color={l.color} />
              )}
            </span>
            <span className="bannerLabel">{l.label}</span>
            <span className="bannerSub">{l.sub}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const nextEvent = getNextEvent();
  const sortedEvents = [...events].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const remainingDays = nextEvent ? daysUntil(nextEvent.startDate) : null;
  const nextColorClass = nextEvent?.category === '第2支部' ? 'branch' : 'tokyo';

  return (
    <main>
      <header className="hero">
        <div className="heroInner">
          <p className="eyebrow">2026 Season</p>
          <h1>中学陸上競技部</h1>
          <p className="lead">次の大会・要項・タイムテーブル・結果・会場を確認するためのページです。</p>
          <div className="heroPills" aria-label="サイト機能">
            <span>大会日程</span>
            <span>競技種目</span>
            <span>タイムテーブル</span>
            <span>要項</span>
            <span>結果</span>
            <span>マップ</span>
            <span>カレンダー登録</span>
          </div>
        </div>
      </header>

      <section className="nextEvent" aria-labelledby="next-event-title">
        <div className="nextLabel">NEXT EVENT</div>
        {nextEvent ? (
          <div className={`nextCard ${nextEvent.category === '第2支部' ? 'branchNext' : 'tokyoNext'}`}>
            <div>
              <CategoryBadge category={nextEvent.category} />
              <h2 id="next-event-title">{nextEvent.name}</h2>
              <p className="nextDate">{nextEvent.dateLabel}</p>
              <p className="venue big"><VenueIcon /> {nextEvent.venue}</p>
            </div>
            <div className="countdown">
              <span>あと</span>
              <strong>{remainingDays}</strong>
              <span>日</span>
            </div>
            <div className="buttonGrid nextButtons">
              <InternalLink href={nextEvent.eventsPageUrl} className={`highlight ${nextColorClass}`}>競技種目</InternalLink>
              {nextEvent.timetablePageUrl
                ? <InternalLink href={nextEvent.timetablePageUrl} className={`highlight ${nextColorClass}`}>タイムテーブル</InternalLink>
                : <ExternalLink href={nextEvent.timetableUrl}>タイムテーブル</ExternalLink>}
              <ExternalLink href={nextEvent.guidelineUrl}>要項</ExternalLink>
              <ExternalLink href={nextEvent.resultUrl}>結果</ExternalLink>
              <ExternalLink href={nextEvent.mapUrl}>マップ</ExternalLink>
            </div>
            <CalendarButtons event={nextEvent} />
          </div>
        ) : (
          <div className="nextCard"><h2 id="next-event-title">次の大会は未登録です</h2></div>
        )}
      </section>

      <section className="section" aria-labelledby="flow-title">
        <div className="sectionTitle">
          <p className="eyebrow dark">Season Flow</p>
          <h2 id="flow-title">年間の流れ</h2>
          <p>流れはカテゴリ別に整理し、大会カードは下に日程順で並べています。</p>
        </div>
        <div className="flowGrid">
          <FlowRail title="第2支部大会" category="第2支部" items={['春季', '支部予選', '夏季', '支部新人', '秋季', '新春駅伝']} />
          <FlowRail title="東京都中体連大会" category="東京都中体連" items={['地域別', '通信', '都総体', '支部対抗']} />
        </div>
      </section>

      <section className="section" id="schedule" aria-labelledby="schedule-title">
        <div className="sectionTitle">
          <p className="eyebrow dark">Schedule</p>
          <h2 id="schedule-title">大会一覧</h2>
          <p>すべて日程順に表示しています。緑は第2支部、青は東京都中体連です。</p>
        </div>
        <div className="eventList">
          {sortedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <div className="bannerSection section">
        <LinkBanners />
      </div>

      <section className="comingSoon">
        <p className="eyebrow dark">Coming Soon</p>
        <h2>記録データ化に向けて</h2>
        <p>将来的に、結果PDFをデータ化して、選手名・学校名・種目・記録で検索できるサイトへ拡張できます。</p>
      </section>
    </main>
  );
}
