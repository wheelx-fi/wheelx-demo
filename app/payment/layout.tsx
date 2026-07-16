import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WheelX Payment — Making Crypto Payments Easier',
  description:
    'Smart Deposit powered by WheelX Smart Payment Service. Deposit crypto assets across multiple networks including Ethereum with USDT tokens.',
  keywords: [
    'WheelX',
    'Smart Deposit',
    'Crypto Payment',
    'USDT',
    'Ethereum',
    'Deposit',
    'Blockchain',
  ],
  openGraph: {
    title: 'WheelX Payment — Making Crypto Payments Easier',
    description:
      'Smart Deposit powered by WheelX Smart Payment Service. Deposit crypto assets across multiple networks.',
    type: 'website',
  },
};

export default function SDALayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
