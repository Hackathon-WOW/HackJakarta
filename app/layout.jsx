import { Poppins } from "next/font/google";
import "./globals.css";

const Poppin = Poppins({ subsets: ["latin"], weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] });

export const metadata = {
  title: "NextApp",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={Poppin.className}>
        {children}
      </body>
    </html>
  );
}
