import './globals.css';

export const metadata = {
  title: 'HYDRO-FLOW // Smart Water Level & Pump SCADA Dashboard',
  description: 'Smart Water Level & Pump SCADA Dashboard with ESP32 & Firebase',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-slate-100 font-sans antialiased min-h-screen flex flex-col mesh-ambient grid-lines selection:bg-primary/30">
        {children}
      </body>
    </html>
  );
}
