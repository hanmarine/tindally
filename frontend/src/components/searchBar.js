import React from "react";
import { TextField, InputAdornment, Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export const SearchBar = ({ value, onChange, placeholder = "Search..." }) => (
  <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
    <TextField
      variant="outlined"
      size="small"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        },
      }}
      fullWidth
      sx={{ mb: 2 }}
    />
  </Box>
);
