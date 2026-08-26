import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slider,
  Tooltip,
  Typography,
} from "@mui/material";

import { RotateLeft, RotateRight, RestartAlt } from "@mui/icons-material";

import { useCallback, useEffect, useState } from "react";

import Cropper, { Area } from "react-easy-crop";

import { getCroppedImage } from "../../../utils/cropImage";

import { colors } from "../../../styles/colors";
import {
  outlinedButtonStyle,
  primaryButtonStyle,
} from "../../../styles/buttonStyles";

type ProductPhotoEditorProps = {
  open: boolean;
  imageUrl: string | null;
  fileName?: string;
  onClose: () => void;
  onSave: (file: File) => Promise<void>;
};

export default function ProductPhotoEditor({
  open,
  imageUrl,
  fileName,
  onClose,
  onSave,
}: ProductPhotoEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      handleReset();
    }
  }, [open, imageUrl]);

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
  };

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleRotateLeft = () => {
    setRotation((prev) => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation((prev) => prev + 90);
  };

  const handleSave = async () => {
    if (!imageUrl || !croppedAreaPixels) {
      return;
    }
    try {
      setSaving(true);

      const blob = await getCroppedImage(imageUrl, croppedAreaPixels, rotation);

      const baseName = fileName?.replace(/\.[^/.]+$/, "") || "product-photo";

      const file = new File([blob], `${baseName}.jpg`, {
        type: "image/jpeg",
      });
      await onSave(file);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>Foto bearbeiten</DialogTitle>

      <DialogContent>
        {imageUrl && (
          <>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: 470,
                backgroundColor: "#111",
                overflow: "hidden",
                borderRadius: 1,
              }}
            >
              <Cropper
                image={imageUrl}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape="rect"
                showGrid
                objectFit="contain"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
              />
            </Box>

            <Box
              sx={{
                mt: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                flexWrap: { xs: "wrap", md: "nowrap" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flex: 1,
                  minWidth: 250,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: "nowrap",
                    fontWeight: 600,
                    color: colors.accentBlue,
                  }}
                >
                  Zoom
                </Typography>

                <Slider
                  value={zoom}
                  min={1}
                  max={5}
                  step={0.01}
                  onChange={(_, value) => setZoom(value as number)}
                />
              </Box>

              {/* Tools */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Tooltip title="Nach links drehen" arrow>
                  <IconButton
                    onClick={handleRotateLeft}
                    sx={{
                      ...outlinedButtonStyle,
                      width: 42,
                      height: 42,
                      border: `1px solid ${colors.accentBlue}`,
                      color: colors.accentBlue,
                      borderRadius: 2,
                    }}
                  >
                    <RotateLeft />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Nach rechts drehen" arrow>
                  <IconButton
                    onClick={handleRotateRight}
                    sx={{
                      ...outlinedButtonStyle,
                      width: 42,
                      height: 42,
                      border: `1px solid ${colors.accentBlue}`,
                      color: colors.accentBlue,
                      borderRadius: 2,
                    }}
                  >
                    <RotateRight />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Zurücksetzen" arrow>
                  <IconButton
                    onClick={handleReset}
                    sx={{
                      ...outlinedButtonStyle,
                      width: 42,
                      height: 42,
                      border: `1px solid ${colors.accentBlue}`,
                      color: colors.accentBlue,
                      borderRadius: 2,
                    }}
                  >
                    <RestartAlt />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Typography
              variant="caption"
              sx={{ display: "block", mt: 2, color: colors.grey }}
            >
              Bild verschieben und mit dem Mausrad oder dem Zoom-Regler
              vergrößern. Gespeichert wird der Bereich innerhalb des Quadrats.
            </Typography>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="outlined"
          sx={outlinedButtonStyle}
          disabled={saving}
          onClick={onClose}
        >
          Abbrechen
        </Button>

        <Button
          variant="contained"
          sx={primaryButtonStyle}
          disabled={saving || !croppedAreaPixels}
          onClick={handleSave}
        >
          {saving ? "Wird gespeichert..." : "Änderungen speichern"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
