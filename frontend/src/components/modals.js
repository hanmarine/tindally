"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";

import { z } from "zod";

// Zod validation schema
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

// --- Update Item Modal ) ---
export function UpdateItemModal({ open, onClose, item, onUpdateSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [errors, setErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        description: item.description || "",
        price: item.price ? item.price.toString() : "",
      });
      setErrors({});
      setApiError(null);
    }
  }, [item, open]);

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

  const handleUpdate = async (event) => {
    event.preventDefault();
    setErrors({});
    setApiError(null);

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

    try {
      setIsUpdating(true);
      const response = await fetch(
        `http://localhost:5000/api/items/${item.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validationResult.data),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Failed to update item"
        );
      }

      onUpdateSuccess(result);
      onClose();
    } catch (err) {
      console.error("Error updating item:", err);
      setApiError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="update-dialog-title">
      <DialogTitle id="update-dialog-title" sx={{ color: "text.primary" }}>
        Update Item: {item?.name}
      </DialogTitle>
      <Box component="form" onSubmit={handleUpdate} noValidate>
        <DialogContent>
          <TextField
            required
            autoFocus
            margin="normal"
            id="name"
            name="name"
            label="Item Name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            error={!!errors.name}
            helperText={errors.name || ""}
            sx={{
              "& .MuiInputLabel-root": { color: "text.secondary" },
              "& .MuiInputBase-input": { color: "text.primary" },
            }}
          />
          <TextField
            margin="normal"
            id="description"
            name="description"
            label="Description"
            multiline
            rows={4}
            value={formData.description}
            onChange={handleChange}
            fullWidth
            error={!!errors.description}
            helperText={errors.description || ""}
            sx={{
              "& .MuiInputLabel-root": { color: "text.secondary" },
              "& .MuiInputBase-input": { color: "text.primary" },
            }}
          />
          <TextField
            required
            margin="normal"
            id="price"
            name="price"
            label="Price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            fullWidth
            error={!!errors.price}
            helperText={errors.price || ""}
            sx={{
              "& .MuiInputLabel-root": { color: "text.secondary" },
              "& .MuiInputBase-input": { color: "text.primary" },
            }}
          />
          {apiError && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              Error: {apiError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary" disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

// --- Delete Item Modal ---
export function DeleteItemModal({ open, onClose, item, onDeleteSuccess }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);

      const response = await fetch(
        `http://localhost:5000/api/items/${item.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete item");
      }

      onDeleteSuccess();
      onClose();
    } catch (err) {
      console.error("Error deleting item:", err);
      setDeleteError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title" sx={{ color: "text.primary" }}>
        {"Confirm Deletion"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          id="delete-dialog-description"
          sx={{ color: "text.secondary" }}
        >
          Are you sure you want to delete "{item?.name}"? This action cannot be
          undone.
        </DialogContentText>
        {deleteError && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Error: {deleteError}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          onClick={handleDeleteConfirm}
          color="error"
          autoFocus
          disabled={isDeleting}
        >
          {isDeleting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Delete"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
