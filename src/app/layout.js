import "./globals.css";

export const metadata = {
  title: {
    default: "Chess App",
    template: "%s | Chess App",
  },
  description: "Play local chess or challenge a computer opponent with configurable time controls.",
  applicationName: "Chess App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
