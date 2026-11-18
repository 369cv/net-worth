import './globals.css';
export const metadata = { title: 'Net Worth', description: 'Own your net worth.', icons: { icon: '/brand/app-icon.svg' } };
export default function Root({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&family=JetBrains+Mono&display=swap" rel="stylesheet" />
  </head><body>{children}</body></html>);
}
