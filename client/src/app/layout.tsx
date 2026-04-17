import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const PoppinsFont = Poppins({
  subsets: ["latin"],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: "MSME Investment Platform",
  description: "Connect investors with promising MSMEs through AI-powered financial analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${PoppinsFont.className} min-h-screen bg-background`}>
        <AuthProvider>
          {children}
          <Toaster 
            position='top-right' 
            gutter={3}
            toastOptions={{
              success: {
                style: {
                  border: '1px solid #52D689',
                  background: '#C7DDB5',
                },
              },
              error: {
                style: {
                  border: '1px solid #F97072',
                  background: '#FECACA',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
