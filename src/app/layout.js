
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: "Career Campus Expo 2026 | UIN Jakarta",
  description:
    "Career Campus Expo 2026, 18–19 November 2026 di UIN Syarif Hidayatullah Jakarta.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${montserrat.variable} ${poppins.variable}`}>
        {children}
      </body>
    </html>
  );
}
