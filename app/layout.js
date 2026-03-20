export const metadata = {
  title: "DXR Guideline Matcher",
  description: "Match DXR issues to SAP Fiori Design Guidelines",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#F7F8FA", fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#1D2D3E", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
