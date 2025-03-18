export const metadata = {
  title: "Otakumori",
  description: "The Way I See It, Our Fates Appear To Be Intertwined.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
