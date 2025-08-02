"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Button,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import Navbar from "../../../components/Navbar";
import { UpdateItemModal, DeleteItemModal } from "../../../components/modals";

export default function ItemDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [alertDialogMessage, setAlertDialogMessage] = useState("");
  const [alertDialogTitle, setAlertDialogTitle] = useState("");
  const [isSuccessAlert, setIsSuccessAlert] = useState(false);

  const handleOpenAlertDialog = (title, message, isSuccess) => {
    setAlertDialogTitle(title);
    setAlertDialogMessage(message);
    setIsSuccessAlert(isSuccess);
    setOpenAlertDialog(true);
  };

  const handleAlertDialogClose = () => {
    setOpenAlertDialog(false);
    if (isSuccessAlert) {
      router.push("/");
    }
  };
  // Fetch Item Data
  useEffect(() => {
    if (!id) return;

    const fetchItem = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`http://localhost:5000/api/items/${id}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }
        const data = await response.json();
        setItem(data);
      } catch (err) {
        setError(err);
        console.error("Error fetching item:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  // Update Success
  const handleUpdateSuccess = (updatedItem) => {
    setItem(updatedItem);
    handleOpenAlertDialog("Success!", "Item updated successfully!", true);
  };

  // Deletion Success
  const handleDeleteSuccess = () => {
    handleOpenAlertDialog("Success!", "Item deleted successfully!", true);
  };

  // Render Loading, Error, or Content
  if (isLoading) {
    return (
      <>
        <Navbar />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
            gap: 2,
          }}
        >
          <CircularProgress size={60} sx={{ color: "white" }} />
          <Typography variant="h6" color="text.secondary">
            Loading item details...
          </Typography>
        </Box>
      </>
    );
  }

  // If the item fails to load
  if (error) {
    return (
      <>
        <Navbar />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
            color: "error.main",
            textAlign: "center",
            p: 3,
          }}
        >
          <Typography variant="h6" color="error">
            Failed to load item.
          </Typography>
          <Typography variant="body2" color="error">
            Error details: {error.message}
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => router.push("/")}
          >
            Back to Home
          </Button>
        </Box>
      </>
    );
  }

  // If the item is not found
  if (!item) {
    return (
      <>
        <Navbar />
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Item not found.
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => router.push("/")}
          >
            Back to Home
          </Button>
        </Box>
      </>
    );
  }

  // Render Item Details
  return (
    <div>
      <Navbar />
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper
          sx={{
            p: 4,
            borderRadius: "10px",
            backgroundColor: "background.paper",
            position: "relative",
          }}
        >
          <IconButton
            aria-label="back"
            onClick={() => router.push("/")}
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              color: "text.secondary",
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>

          <Typography
            component="h6"
            gutterBottom
            align="center"
            color="text.primary"
            fontWeight="bold"
          >
            Item Details
          </Typography>
          <Divider sx={{ mb: 3, borderColor: "divider" }} />
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            color="text.primary"
            fontWeight="bold"
          >
            {item.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" component="p">
            {item.description}
          </Typography>
          <Typography variant="h6" color="text.primary" sx={{ mt: 2, mb: 3 }}>
            Price: ${item.price ? item.price.toFixed(2) : "N/A"}
          </Typography>

          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowUpdateModal(true)}
              sx={{ flexGrow: 1 }}
            >
              Edit Item
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => setShowDeleteModal(true)}
              sx={{ flexGrow: 1 }}
            >
              Delete Item
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Update Item Modal */}
      <UpdateItemModal
        open={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        item={item}
        onUpdateSuccess={handleUpdateSuccess}
      />

      {/* Delete Item Modal */}
      <DeleteItemModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        item={item}
        onDeleteSuccess={handleDeleteSuccess}
      />

      {/* Custom Alert Dialog */}
      <Dialog
        open={openAlertDialog}
        onClose={handleAlertDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        role="dialog"
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
    </div>
  );
}
