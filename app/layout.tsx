import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';
import Header from './Header';

export const metadata: Metadata = {
  title: 'WheelX Demo',
  description: 'Some WheelX online Demo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
