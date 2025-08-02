"use client";

import React, { useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  CssBaseline,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import MenuIcon from "@mui/icons-material/Menu";
import DrawerComponent from "./Drawer";

function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [openDrawer, setOpenDrawer] = useState(false);

  const handleDrawerToggle = () => {
    setOpenDrawer(!openDrawer);
  };

  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: theme.palette.background.paper }}
    >
      <CssBaseline />
      <Toolbar>
        {/* Logo/App Title */}
        <Link href="/" passHref style={{ textDecoration: "none", flexGrow: 1 }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: "var(--font-inter), sans-serif",
              color: theme.palette.text.primary,
              "&:hover": {
                color: theme.palette.primary.light,
              },
            }}
          >
            The Services
          </Typography>
        </Link>

        {/* Conditional rendering based on screen size */}
        {isMobile ? (
          <>
            {/* Hamburger Icon for Mobile */}
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
            {/* Drawer Component rendered on mobile */}
            <DrawerComponent open={openDrawer} onClose={handleDrawerToggle} />
          </>
        ) : (
          // Desktop Navigation Links
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Link href="/" passHref>
              <Typography
                component="span"
                sx={{
                  fontFamily: "var(--font-inter), sans-serif",
                  textDecoration: "none",
                  color: theme.palette.text.primary,
                  fontSize: "16px",
                  marginLeft: theme.spacing(6),
                  paddingBottom: theme.spacing(0.5),
                  borderBottom: "1px solid transparent",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    color: theme.palette.primary.main,
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                Inventory
              </Typography>
            </Link>
            <Link href="/create-item" passHref>
              <Typography
                component="span"
                sx={{
                  fontFamily: "var(--font-inter), sans-serif",
                  textDecoration: "none",
                  color: theme.palette.text.primary,
                  fontSize: "16px",
                  marginLeft: theme.spacing(6),
                  paddingBottom: theme.spacing(0.5),
                  borderBottom: "1px solid transparent",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    color: theme.palette.primary.main,
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                Create Item
              </Typography>
            </Link>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
