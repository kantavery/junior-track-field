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
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
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
    .filter((event) => new Date(`${event.startDate}T00:00:00+09:00`) >= tomorrow)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
}

// SVGピンアイコン（絵文字不使用）
function VenueIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`venueIcon ${className ?? ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className={`actionButton ${className ?? ''}`}>
      {children} <span aria-hidden="true">↗</span>
    </a>
  );
}

function InternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className={`actionButton ${className ?? ''}`}>
      {children} <span aria-hidden="true">→</span>
    </a>
  );
}

function CategoryBadge({ category }: { category: EventItem['category'] }) {
  return <span className={`badge ${category === '第2支部' ? 'branch' : 'tokyo'}`}>{category}</span>;
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
      <p className="venue">
        <VenueIcon /> {event.venue}
      </p>
      <p className="summary">{event.summary}</p>
      <div className="buttonGrid">
        {/* 競技種目ページ（内部リンク） */}
        <InternalLink href={event.eventsPageUrl} className={`highlight ${colorClass}`}>
          競技種目
        </InternalLink>
        {/* タイムテーブル（内部ページがあれば内部、なければ外部） */}
        {event.timetablePageUrl ? (
          <InternalLink href={event.timetablePageUrl} className={`highlight ${colorClass}`}>
            タイムテーブル
          </InternalLink>
        ) : (
          <ExternalLink href={event.timetableUrl}>タイムテーブル</ExternalLink>
        )}
        <ExternalLink href={event.guidelineUrl}>要項</ExternalLink>
        <ExternalLink href={event.resultUrl}>結果</ExternalLink>
        <ExternalLink href={event.mapUrl}>マップ</ExternalLink>
      </div>
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
              <p className="venue big">
                <VenueIcon /> {nextEvent.venue}
              </p>
            </div>
            <div className="countdown">
              <span>あと</span>
              <strong>{remainingDays}</strong>
              <span>日</span>
            </div>
            <div className="buttonGrid nextButtons">
              <InternalLink href={nextEvent.eventsPageUrl} className={`highlight ${nextColorClass}`}>
                競技種目
              </InternalLink>
              {nextEvent.timetablePageUrl ? (
                <InternalLink href={nextEvent.timetablePageUrl} className={`highlight ${nextColorClass}`}>
                  タイムテーブル
                </InternalLink>
              ) : (
                <ExternalLink href={nextEvent.timetableUrl}>タイムテーブル</ExternalLink>
              )}
              <ExternalLink href={nextEvent.guidelineUrl}>要項</ExternalLink>
              <ExternalLink href={nextEvent.resultUrl}>結果</ExternalLink>
              <ExternalLink href={nextEvent.mapUrl}>マップ</ExternalLink>
            </div>
          </div>
        ) : (
          <div className="nextCard">
            <h2 id="next-event-title">次の大会は未登録です</h2>
          </div>
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

      <section className="comingSoon">
        <p className="eyebrow dark">Coming Soon</p>
        <h2>記録データ化に向けて</h2>
        <p>将来的に、結果PDFをデータ化して、選手名・学校名・種目・記録で検索できるサイトへ拡張できます。</p>
      </section>
    </main>
  );
}
