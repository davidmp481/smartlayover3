// app/layout.tsx
export const metadata = {
  title: 'Smart Layover',
  description: 'Find cheaper trips via smart layovers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
