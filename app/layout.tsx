import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Álbum",
  description: "Álbum interactivo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
