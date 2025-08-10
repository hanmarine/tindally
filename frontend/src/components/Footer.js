import { Box, Typography, useTheme } from "@mui/material";

export default function Footer() {
  const getYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    return year;
  };
  return (
    <Box
      sx={{
        textAlign: "center",
        p: "10px",
      }}
    >
      <Typography>
        © {getYear()} Tindally by
        <a
          href="https://github.com/hanmarine"
          alt="github link"
          id="github-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          hanmarine
        </a>
        under
        <a
          href="https://opensource.org/license/mit"
          alt="mit link"
          id="copy-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          MIT License
        </a>
        . All rights reserved.
      </Typography>
    </Box>
  );
}
