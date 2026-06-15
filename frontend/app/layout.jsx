import { Fraunces, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "react-hot-toast";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "Grow — Connecting MSMEs with Investors",
  description:
    "A platform that helps Indonesian MSMEs build credible, investor-ready financial reports & documents, and helps investors discover the most promising businesses.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Toaster
          position="top-right"
          gutter={10}
          toastOptions={{
            style: {
              background: "#15241C",
              color: "#F6F1E7",
              border: "1px solid #2B3D33",
              borderRadius: "14px",
              fontSize: "14px",
              fontWeight: 500,
            },
            success: { iconTheme: { primary: "#4AB262", secondary: "#15241C" } },
            error: { iconTheme: { primary: "#EE9412", secondary: "#15241C" } },
          }}
        />
      </body>
    </html>
  );
}
