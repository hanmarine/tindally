"use client";

import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Link from "next/link";
import { Divider } from "@mui/material";

// Product Card Template
export default function ProductCard({ id, title, description, price }) {
  return (
    <Card
      sx={{
        height: "100%",
        minHeight: 180,
        maxWidth: 300,
        minWidth: 300,
        boxShadow: 3,
        borderRadius: "10px",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 2,
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom fontWeight="bold" variant="h5" component="div">
          {title && title.length > 15 ? `${title.slice(0, 15)}...` : title}
        </Typography>
        <Typography variant="h6" color="text.primary" sx={{ mt: 2 }}>
          ${price}
        </Typography>
        <Divider sx={{ mt: 2, mb: 2, borderColor: "divider" }} />
        <Typography variant="p" color="text.secondary" sx={{ mt: 2 }}>
          {description && description.length > 100
            ? `${description.slice(0, 50)}...`
            : description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" component={Link} href={`/item/${id}`}>
          View Settings
        </Button>
      </CardActions>
    </Card>
  );
}
