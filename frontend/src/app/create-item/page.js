"use client";
import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/navigation";
import { z } from "zod";

// Zod validation
const itemSchema = z.object({
  name: z
    .string()
    .min(1, "Item name is required")
    .max(60, "Item name must be 60 characters or less"),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .optional(),
  price: z.coerce
    .number({ invalid_type_error: "Price must be a number" })
    .positive("Price must be a positive number")
    .max(100000, "Price cannot exceed 100,000"),
});

function CreateItemPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [errors, setErrors] = useState({});

  const router = useRouter();

  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [alertDialogMessage, setAlertDialogMessage] = useState("");
  const [alertDialogTitle, setAlertDialogTitle] = useState("");
  const [isSuccessAlert, setIsSuccessAlert] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null,
      }));
    }
  };

  // Update handleSubmit with Zod validation
  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});

    const validationResult = itemSchema.safeParse(formData);

    if (!validationResult.success) {
      // If validation fails, format and set errors
      const formattedErrors = {};
      validationResult.error.errors.forEach((err) => {
        formattedErrors[err.path[0]] = err.message;
      });
      setErrors(formattedErrors);
      return;
    }

    // If validation succeeds, proceed with the API call
    try {
      const response = await fetch("http://localhost:5000/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validationResult.data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create item");
      }

      const result = await response.json();
      console.log("Item created successfully:", result);
      // Reset form on success
      setFormData({ name: "", description: "", price: "" });
      setAlertDialogTitle("Success!");
      setAlertDialogMessage("Item created successfully!");
      setIsSuccessAlert(true);
      setOpenAlertDialog(true);
    } catch (error) {
      console.error("Error creating item:", error);
      setAlertDialogTitle("Error!");
      setAlertDialogMessage(`Error creating item: ${error.message}`);
      setIsSuccessAlert(false);
      setOpenAlertDialog(true);
    }
  };

  const handleAlertDialogClose = () => {
    setOpenAlertDialog(false);
    if (isSuccessAlert) {
      router.push("/");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Navbar />
      <Container
        maxWidth="sm"
        sx={{
          mt: 4,
          mb: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexGrow: 1,
        }}
      >
        <Typography
          fontWeight="bold"
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
        >
          Create Item
        </Typography>
        <Box
          component="form"
          sx={{
            "& .MuiTextField-root": { m: 1, width: "100%" },
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <TextField
              required
              id="name"
              name="name"
              label="Item Name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name || ""}
              sx={{
                "& .MuiInputLabel-root": { color: "text.secondary" },
                "& .MuiInputBase-input": { color: "text.primary" },
              }}
            />
            <TextField
              id="description"
              name="description"
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description || ""}
              sx={{
                "& .MuiInputLabel-root": { color: "text.secondary" },
                "& .MuiInputBase-input": { color: "text.primary" },
              }}
            />
            <TextField
              required
              id="price"
              name="price"
              label="Price (in USD):"
              type="number"
              value={formData.price || ""}
              onChange={handleChange}
              error={!!errors.price}
              helperText={errors.price || ""}
              sx={{
                "& .MuiInputLabel-root": { color: "text.secondary" },
                "& .MuiInputBase-input": { color: "text.primary" },
              }}
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            sx={{ mt: 2, width: "100%" }}
          >
            Create Item
          </Button>
        </Box>
      </Container>

      {/* Custom Alert Dialog */}
      <Dialog
        open={openAlertDialog}
        onClose={handleAlertDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ color: "text.primary" }}>
          {alertDialogTitle}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            sx={{ color: "text.secondary" }}
          >
            {alertDialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAlertDialogClose} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CreateItemPage;
