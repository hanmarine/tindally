"use client";
import dynamic from "next/dynamic";

const MuiThemeProvider = dynamic(
  () => import("../components/MuiThemeProvider"),
  { ssr: false }
);

export default function MuiThemeProviderClient({ children }) {
  return <MuiThemeProvider>{children}</MuiThemeProvider>;
}
