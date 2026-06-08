import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '大会情報｜中学陸上競技部',
  description: '次の大会・要項・タイムテーブル・結果・会場を確認するためのページです。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
