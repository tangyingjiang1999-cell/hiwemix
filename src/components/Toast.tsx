"use client";

import { useEffect, useState, useCallback } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

interface ToastProps {
  message: string;
  onDone: () => void;
  duration?: number;
}

export default function Toast({
  message,
  onDone,
  duration = 2000,
}: ToastProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function handleClose(_: unknown, reason?: string) {
    if (reason === "clickaway") return;
    setOpen(false);
  }

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      autoHideDuration={duration}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      slotProps={{ transition: { onExited: onDone } }}
    >
      <Alert
        severity="success"
        role="status"
        variant="filled"
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          fontSize: "0.8125rem",
          fontWeight: 500,
          borderRadius: 0,
          "& .MuiAlert-icon": { color: "primary.contrastText" },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
  }, []);

  const dismissToast = useCallback(() => {
    setMessage(null);
  }, []);

  const toastElement = message ? (
    <Toast message={message} onDone={dismissToast} />
  ) : null;

  return { showToast, toastElement };
}
