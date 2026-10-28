import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import type { DialogProps } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useRef,
} from "react";

import { colors } from "../styles/colors";

type Position = {
  x: number;
  y: number;
};

type DragStart = {
  pointerX: number;
  pointerY: number;
  startX: number;
  startY: number;
};

type DraggableDialogProps = Omit<DialogProps, "title"> & {
  title: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  dialogWidth?: number;
};

export default function DraggableDialog({
  title,
  children,
  actions,
  dialogWidth,
  open,
  onClose,
  ...dialogProps
}: DraggableDialogProps) {
  const paperRef = useRef<HTMLDivElement | null>(null);

  const positionRef = useRef<Position>({
    x: 0,
    y: 0,
  });

  const dragStartRef = useRef<DragStart | null>(null);

  const resetPosition = () => {
    positionRef.current = {
      x: 0,
      y: 0,
    };

    dragStartRef.current = null;

    if (paperRef.current) {
      paperRef.current.style.transform = "translate(0px, 0px)";
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement;

    if (
      target.closest(
        "button, input, textarea, select, [role='button'], [role='combobox'], .MuiInputBase-root",
      )
    ) {
      return;
    }

    event.stopPropagation();

    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      startX: positionRef.current.x,
      startY: positionRef.current.y,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragStart = dragStartRef.current;
    const paper = paperRef.current;

    if (!dragStart || !paper) {
      return;
    }

    const nextX = dragStart.startX + event.clientX - dragStart.pointerX;
    const nextY = dragStart.startY + event.clientY - dragStart.pointerY;

    const rect = paper.getBoundingClientRect();

    const visiblePart = 80;

    const minX = positionRef.current.x - rect.right + visiblePart;
    const maxX = positionRef.current.x + window.innerWidth - rect.left - visiblePart;

    const minY = positionRef.current.y - rect.bottom + visiblePart;
    const maxY = positionRef.current.y + window.innerHeight - rect.top - visiblePart;

    const x = Math.min(Math.max(nextX, minX), maxX);
    const y = Math.min(Math.max(nextY, minY), maxY);

    positionRef.current = { x, y };

    paper.style.transform = `translate(${x}px, ${y}px)`;
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragStartRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleClose: DialogProps["onClose"] = (event, reason) => {
    resetPosition();
    onClose?.(event, reason);
  };

  const handleCloseButton = (event: React.MouseEvent<HTMLButtonElement>) => {
    resetPosition();
    onClose?.(event, "escapeKeyDown");
  };

  return (
    <Dialog
      {...dialogProps}
      open={open}
      onClose={handleClose}
      onClick={(event) => {
    event.stopPropagation();
  }}
      slotProps={{
        paper: {
          ref: paperRef,
          sx: {
            borderRadius: "16px",
            overflow: "hidden",
            backgroundColor: colors.white,
            boxShadow: "0 18px 45px rgba(0, 0, 0, 0.20)",

            ...(dialogWidth && {
              width: dialogWidth,
              maxWidth: "calc(100% - 32px)",
            }),
          },
        },
      }}
    >
      <DialogTitle
        component="div"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        sx={{
          cursor: "move",
          userSelect: "none",
          touchAction: "none",

          px: 3,
          pt: 2.5,
          pb: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {title}

          <IconButton
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
            onClick={handleCloseButton}
            size="small"
            disabled={!onClose}
            aria-label="Dialog schließen"
            sx={{
              width: 32,
              height: 32,
              ml: 2,
              color: colors.iconGrey,

              transition:
                "color 0.2s ease-in-out, background-color 0.2s ease-in-out",

              "&:hover": {
                color: colors.grey,
                transform: "scale(1.1)",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          px: 3,
          pt: 2,
          pb: 1.5,
        }}
      >
        {children}
      </DialogContent>

      {actions && (
        <DialogActions
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          sx={{
            px: 3,
            pt: 1,
            pb: 2.5,
            gap: 1,

            cursor: "move",
            userSelect: "none",
            touchAction: "none",
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}
