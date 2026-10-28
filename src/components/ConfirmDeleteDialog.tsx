import type { ReactNode } from "react";
import { useState } from "react";

import { Box, Button, Typography } from "@mui/material";

import DraggableDialog from "./DraggableDialog";

import { cancelButtonStyle, deleteButtonStyle } from "../styles/buttonStyles";

interface ConfirmDeleteDialogProps {
  children: ReactNode;
  onConfirm: () => Promise<void>;
  trigger?: ReactNode;
  title?: string;
  loadingText?: string;
  disabled?: boolean;
  buttonMinWidth?: number;
}

export default function ConfirmDeleteDialog({
  children,
  onConfirm,
  trigger,
  title = "⚠️ Warnung",
  loadingText = "Löschen...",
  disabled = false,
  buttonMinWidth,
}: ConfirmDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    if (!loading && !disabled) {
      setOpen(true);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
    }
  };

  const handleConfirm = async () => {
    if (loading || disabled) return;

    setLoading(true);

    try {
      await onConfirm();
      setOpen(false);
    } catch {
      // Ошибка обрабатывается вызывающим компонентом.
      // Диалог остаётся открытым.
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* TRIGGER */}

      {trigger ? (
        <Box
          component="span"
          onClick={(event) => {
            event.stopPropagation();
            handleOpen();
          }}
          onDoubleClick={(event) => {
            event.stopPropagation();
          }}
          sx={{
            display: "inline-flex",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {trigger}
        </Box>
      ) : (
        <Button
          variant="outlined"
          color="error"
          size="small"
          disabled={disabled || loading}
          onClick={(event) => {
            event.stopPropagation();
            handleOpen();
          }}
          onDoubleClick={(event) => {
            event.stopPropagation();
          }}
          sx={{
            ...deleteButtonStyle,
            ...(buttonMinWidth !== undefined && {
              minWidth: buttonMinWidth,
            }),
          }}
        >
          Löschen
        </Button>
      )}

      {/* CONFIRMATION DIALOG */}

      <DraggableDialog
        open={open}
        onClose={handleClose}
        title={
          <Typography variant="h6" fontWeight={600} color="error.main">
            {title}
          </Typography>
        }
        dialogWidth={480}
        actions={
          <>
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={loading}
              sx={cancelButtonStyle}
            >
              Abbrechen
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={handleConfirm}
              disabled={loading || disabled}
              sx={deleteButtonStyle}
            >
              {loading ? loadingText : "Löschen"}
            </Button>
          </>
        }
      >
        <Box sx={{ mt: 2, mb: 2 }}>{children}</Box>
      </DraggableDialog>
    </>
  );
}
