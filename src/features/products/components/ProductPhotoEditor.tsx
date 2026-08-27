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

import {
  CropFree,
  CropLandscape,
  CropPortrait,
  CropSquare,
  RestartAlt,
  RotateLeft,
  RotateRight,
} from "@mui/icons-material";

import { useEffect, useRef, useState } from "react";

import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";

import "react-image-crop/dist/ReactCrop.css";

import { colors } from "../../../styles/colors";
import { outlinedButtonStyle, primaryButtonStyle } from "../../../styles/buttonStyles";

type AspectPreset = "free" | "1:1" | "4:5" | "3:4" | "16:9";

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

  const imageRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspectPreset, setAspectPreset] = useState<AspectPreset>("free");
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      handleReset();
    }
  }, [open, imageUrl]);

  const getAspect = (preset: AspectPreset): number | undefined => {
    switch (preset) {
      case "1:1":
        return 1;
      case "4:5":
        return 4 / 5;
      case "3:4":
        return 3 / 4;
      case "16:9":
        return 16 / 9;
      default:
        return undefined;
    }
  };

  const createCenteredCrop = (
    mediaWidth: number,
    mediaHeight: number,
    aspect?: number,
  ) => {
    if (!aspect) {
      return centerCrop(
        {
          unit: "%",
          width: 90,
          height: 90,
        },
        mediaWidth,
        mediaHeight,
      );
    }

    return centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    );
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = event.currentTarget;
    const nextCrop = createCenteredCrop(width, height, getAspect(aspectPreset));
    setCrop(nextCrop);
  };

  const handleAspectChange = (preset: AspectPreset) => {
    setAspectPreset(preset);

    const image = imageRef.current;
    if (!image) {
      return;
    }
    const nextCrop = createCenteredCrop(
      image.width,
      image.height,
      getAspect(preset),
    );

    setCrop(nextCrop);
  };

  const handleRotateLeft = () => {
    setRotation((prev) => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation((prev) => prev + 90);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setAspectPreset("free");
    setCompletedCrop(undefined);

    const image = imageRef.current;

    if (image) {
      setCrop(createCenteredCrop(image.width, image.height));
    } else {
      setCrop(undefined);
    }
  };

  const getCroppedBlob = async (): Promise<Blob> => {
    const image = imageRef.current;

    if (!image || !completedCrop) {
      throw new Error("Kein Bildausschnitt ausgewählt");
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas konnte nicht erstellt werden");
    }

    //Соотношение отображаемого изображения к оригиналу.
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

     // Чтобы поворот корректно работал, сначала создаём отдельный canvas с полностью повернутым изображением.
    const rotationRad = (rotation * Math.PI) / 180;
    const absCos = Math.abs(Math.cos(rotationRad));
    const absSin = Math.abs(Math.sin(rotationRad));
    const sourceWidth = image.naturalWidth;
    const sourceHeight = image.naturalHeight;
    const rotatedWidth = sourceWidth * absCos + sourceHeight * absSin;
    const rotatedHeight = sourceWidth * absSin + sourceHeight * absCos;
    const rotatedCanvas = document.createElement("canvas");

    rotatedCanvas.width = Math.round(rotatedWidth);
    rotatedCanvas.height = Math.round(rotatedHeight);

    const rotatedCtx = rotatedCanvas.getContext("2d");

    if (!rotatedCtx) {
      throw new Error("Canvas konnte nicht erstellt werden");
    }

    rotatedCtx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);

    rotatedCtx.rotate(rotationRad);

    rotatedCtx.scale(zoom, zoom);

    rotatedCtx.drawImage(
      image,
      -sourceWidth / 2,
      -sourceHeight / 2,
      sourceWidth,
      sourceHeight,
    );

     // Crop-Canvas получает только выбранную область.
    canvas.width = Math.max(1, Math.round(cropWidth));
    canvas.height = Math.max(1, Math.round(cropHeight));

     // Центрируем координаты crop относительно повёрнутого canvas. Для 90°/270° размеры меняются, поэтому рассчитываем смещение.
    const displaySourceWidth = image.width;
    const displaySourceHeight = image.height;
    const rotationNormalized = ((rotation % 360) + 360) % 360;
    let sourceCropX = cropX;
    let sourceCropY = cropY;
    let sourceCropWidth = cropWidth;
    let sourceCropHeight = cropHeight;

    if (rotationNormalized === 90 || rotationNormalized === 270) {
      const ratioX = rotatedCanvas.width / displaySourceHeight;

      const ratioY = rotatedCanvas.height / displaySourceWidth;

      sourceCropX = completedCrop.x * ratioX;
      sourceCropY = completedCrop.y * ratioY;
      sourceCropWidth = completedCrop.width * ratioX;
      sourceCropHeight = completedCrop.height * ratioY;
    }

    ctx.drawImage(
      rotatedCanvas,

      sourceCropX,
      sourceCropY,
      sourceCropWidth,
      sourceCropHeight,

      0,
      0,
      canvas.width,
      canvas.height,
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Foto konnte nicht verarbeitet werden"));
            return;
          }
          resolve(blob);
        },

        "image/jpeg",
        0.92,
      );
    });
  };

  const handleSave = async () => {
    if (!imageUrl || !completedCrop) {
      return;
    }

    try {
      setSaving(true);

      const blob = await getCroppedBlob();
      const baseName = fileName?.replace(/\.[^/.]+$/, "") || "product-photo";
      const file = new File([blob], `${baseName}.jpg`, {
        type: "image/jpeg",
      });

      await onSave(file);

      onClose();
    } catch (error) {
      console.error("Foto bearbeiten:", error);
    } finally {
      setSaving(false);
    }
  };

  const presetButtonStyle = (selected: boolean) => ({
    minWidth: 58,
    px: 1.5,
    py: 0.5,
    borderColor: selected ? colors.accentBlue : colors.border,
    color: selected ? colors.accentBlue : colors.grey,
    backgroundColor: selected ? colors.accentLight : colors.white,
    fontWeight: selected ? 700 : 500,
    "&:hover": {
      borderColor: colors.accentBlue,
      backgroundColor: colors.accentLight,
    },
  });

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          color: colors.primaryBlue,
          fontWeight: 600,
          fontSize: 19,
        }}
      >
        Foto bearbeiten
      </DialogTitle>

      <DialogContent>
        {imageUrl && (
          <>
            {/* EDITOR */}

            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: 470,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#080808",
                overflow: "hidden",
                borderRadius: 1,
              }}
            >
              <ReactCrop
                crop={crop}
                onChange={(percentCrop) => {
                  setCrop(percentCrop);
                }}
                onComplete={(pixelCrop) => {
                  setCompletedCrop(pixelCrop);
                }}
                aspect={getAspect(aspectPreset)}
                minWidth={40}
                minHeight={40}
                keepSelection
                ruleOfThirds
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                }}
              >
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt={fileName || "Produktfoto"}
                  crossOrigin="anonymous"
                  onLoad={handleImageLoad}
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    maxHeight: "500px",
                    objectFit: "contain",
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: "transform 0.15s ease",
                  }}
                />
              </ReactCrop>
            </Box>

            {/* ASPECT PRESETS */}

            <Box
              sx={{
                mt: 2,
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Button
                variant="outlined"
                startIcon={<CropFree />}
                onClick={() => handleAspectChange("free")}
                sx={presetButtonStyle(aspectPreset === "free")}
              >
                Frei
              </Button>

              <Button
                variant="outlined"
                startIcon={<CropSquare />}
                onClick={() => handleAspectChange("1:1")}
                sx={presetButtonStyle(aspectPreset === "1:1")}
              >
                1:1
              </Button>

              <Button
                variant="outlined"
                startIcon={<CropPortrait />}
                onClick={() => handleAspectChange("4:5")}
                sx={presetButtonStyle(aspectPreset === "4:5")}
              >
                4:5
              </Button>

              <Button
                variant="outlined"
                startIcon={<CropPortrait />}
                onClick={() => handleAspectChange("3:4")}
                sx={presetButtonStyle(aspectPreset === "3:4")}
              >
                3:4
              </Button>

              <Button
                variant="outlined"
                startIcon={<CropLandscape />}
                onClick={() => handleAspectChange("16:9")}
                sx={presetButtonStyle(aspectPreset === "16:9")}
              >
                16:9
              </Button>
            </Box>

            {/* TOOLBAR */}

            <Box
              sx={{
                mt: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: {
                  xs: "wrap",
                  md: "nowrap",
                },
              }}
            >
              {/* ZOOM */}

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
                    fontWeight: 700,
                    color: colors.accentBlue,
                    whiteSpace: "nowrap",
                  }}
                >
                  Zoom
                </Typography>

                <Slider
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.01}
                  onChange={(_, value) => setZoom(value as number)}
                  sx={{
                    flex: 1,
                    color: colors.accentBlue,
                  }}
                />
              </Box>

              {/* ROTATE LEFT */}

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

              {/* ROTATE RIGHT */}

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

              {/* RESET */}

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
          </>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2.5,
          pt: 1,
          gap: 1,
        }}
      >
        <Button variant="outlined" disabled={saving} onClick={onClose} sx={outlinedButtonStyle}>
          Abbrechen
        </Button>

        <Button
          variant="contained"
          disabled={saving || !completedCrop}
          onClick={handleSave}
          sx={primaryButtonStyle}
        >
          {saving ? "Wird gespeichert..." : "Änderungen speichern"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
