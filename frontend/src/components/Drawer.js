"use client";

import {
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemText,
  Box,
  Typography,
  useTheme,
  ListItemButton,
} from "@mui/material";
import Link from "next/link";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

// Accept 'open' and 'onClose' props from the parent (Navbar)
function DrawerComponent({ open, onClose }) {
  const theme = useTheme();

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 250,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        },
      }}
    >
      {/* Drawer Header with Close Button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: theme.spacing(0, 1),
          minHeight: theme.mixins.toolbar.minHeight,
          justifyContent: "flex-end",
        }}
      >
        <IconButton onClick={onClose} color="inherit">
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: theme.palette.divider }} />

      {/* List of Navigation Links */}
      <List>
        <ListItemButton component={Link} href="/" onClick={onClose}>
          <ListItemText>
            <Typography
              component="span"
              sx={{
                textDecoration: "none",
                color: theme.palette.text.primary,
                fontSize: "18px",
                width: "100%",
                display: "block",
                padding: theme.spacing(1, 0),
                "&:hover": {
                  color: theme.palette.primary.main,
                },
              }}
            >
              Inventory
            </Typography>
          </ListItemText>
        </ListItemButton>
        <Divider sx={{ borderColor: theme.palette.divider }} />
        <ListItemButton component={Link} href="/create-item" onClick={onClose}>
          <ListItemText>
            <Typography
              component="span"
              sx={{
                textDecoration: "none",
                color: theme.palette.text.primary,
                fontSize: "18px",
                width: "100%",
                display: "block",
                padding: theme.spacing(1, 0),
                "&:hover": {
                  color: theme.palette.primary.main,
                },
              }}
            >
              Create Item
            </Typography>
          </ListItemText>
        </ListItemButton>
        <Divider sx={{ borderColor: theme.palette.divider }} />
      </List>
    </Drawer>
  );
}

export default DrawerComponent;
