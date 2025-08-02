import { Outfit } from "next/font/google";
import "./globals.css";
import MuiThemeProviderClient from "../utils/clientLayout";

const inter = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "Tindahan Tally",
  description:
    "Keeping tally of all the items, their descriptions, and their prices on the store.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable}`}>
        <MuiThemeProviderClient>{children}</MuiThemeProviderClient>
      </body>
    </html>
  );
}
