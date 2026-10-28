import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  getProduct,
  selectProduct,
  selectLoading,
  selectError,
} from "../productsSlice";
import {
  getProductFiles,
  deleteProductFile,
  selectProductFiles,
  uploadProductFile,
  reorderProductFiles,
  replaceProductFile,
} from "../productFilesSlice";
import {
  CircularProgress,
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Modal,
  IconButton,
  Dialog,
  DialogContent,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Pagination,
  Tooltip,
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, Close } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import EditProduct from "./EditProduct";
import DeleteProduct from "./DeleteProduct";
import { showSuccessToast } from "../../../utils/toast";
import { handleApiError } from "../../../utils/errors/handleApiError";
import { selectRoles } from "../../auth/authSlice";
import {
  getProductHistory,
  getProductStock,
  selectLoadingRecords,
  selectSelectedWarehouseStock,
  selectWarehouseRecordPages,
  selectWarehouseRecords,
} from "../../warehouse/warehouseSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  galleryActionsStyle,
  galleryArrowLeftStyle,
  galleryArrowRightStyle,
  imageModalStyle,
  productCardContainerStyle,
  productCardHeaderStyle,
  productCardPaperStyle,
  productCardTabsStyle,
  productDetailLabelStyle,
  productDetailRowStyle,
  productDetailsBoxStyle,
  productDetailValueStyle,
  productGalleryStyle,
  productMainImageBoxStyle,
  thumbnailStyle,
} from "../../../styles/productCardStyles";
import {
  outlinedButtonStyle,
  outlinedDeleteButtonStyle,
  primaryButtonStyle,
} from "../../../styles/buttonStyles";
import {
  cellStyle,
  leftBorderCellStyle,
  StyledTableHead,
  tableRowHoverStyle,
  tableStyle,
} from "../../../styles/tableStyles";
import { colors } from "../../../styles/colors";
import ProductPhotoEditor from "./ProductPhotoEditor";
import { Dimensions, ProductFile } from "../types";
import { formatWeight } from "../../../utils/formatWeigh";
import { formatNumber } from "../../../utils/formatNumber";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export default function ProductCard() {
  const { productId } = useParams<{ productId: string }>();
  const dispatch = useAppDispatch();
  const product = useAppSelector(selectProduct);

  const files = useAppSelector(selectProductFiles);
  const isImageFile = (file: ProductFile): boolean =>
    /\.(jpg|jpeg|png)$/i.test(file.originFileName);
  const photos = files.filter(isImageFile);
  const documents = files.filter((file) => !isImageFile(file));

  const photoInputRef = useRef<HTMLInputElement>(null);

  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const stock = useAppSelector(selectSelectedWarehouseStock);
  const userRole = useAppSelector(selectRoles);
  const isAdmin = userRole === "ADMIN";
  const [tabIndex, setTabIndex] = useState(0);
  const historyRecords = useAppSelector(selectWarehouseRecords);
  const loadingHistory = useAppSelector(selectLoadingRecords);
  const totalPages = useAppSelector(selectWarehouseRecordPages);

  const navigate = useNavigate();

  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [photoEditorOpen, setPhotoEditorOpen] = useState(false);
  const [deletePhotoDialogOpen, setDeletePhotoDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<ProductFile | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<ProductFile | null>(
    null,
  );
  const [documentUploading, setDocumentUploading] = useState(false);
  const [documentDeleting, setDocumentDeleting] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [photoProgress, setPhotoProgress] = useState({
    current: 0,
    total: 0,
  });

  const [documentProgress, setDocumentProgress] = useState({
    current: 0,
    total: 0,
  });

  const [page, setPage] = useState(0);

  const visibleThumbnailCount = 4;
  const visibleFiles = photos.slice(
    thumbnailStartIndex,
    thumbnailStartIndex + visibleThumbnailCount,
  );

  const NO_IMAGE_PATH = "/media/no.jpg"; // Путь к заглушке

  useEffect(() => {
    if (productId) {
      dispatch(getProduct(Number(productId)));
      dispatch(getProductFiles(Number(productId)));
      dispatch(getProductStock(Number(productId)));
    }
  }, [dispatch, productId]);

  useEffect(() => {
    if (tabIndex === 1 && productId) {
      dispatch(
        getProductHistory({
          productId: Number(productId),
          page,
          size: 50,
        }),
      );
    }
  }, [tabIndex, productId, page, dispatch]);

  useEffect(() => {
    setCurrentFileIndex((prev) =>
      Math.max(0, Math.min(prev, photos.length - 1)),
    );

    setThumbnailStartIndex((prev) =>
      Math.max(0, Math.min(prev, photos.length - visibleThumbnailCount)),
    );
  }, [photos.length]);

  const handleSetMainPhoto = async (index: number) => {
    if (!productId || index <= 0 || index >= photos.length) {
      return;
    }

    try {
      const selected = photos[index];

      const reorderedPhotos = [
        selected,
        ...photos.filter((_, i) => i !== index),
      ];

      await dispatch(
        reorderProductFiles({
          productId: Number(productId),
          files: reorderedPhotos,
        }),
      ).unwrap();

      setCurrentFileIndex(0);
      setThumbnailStartIndex(0);

      showSuccessToast("Erfolg", "Hauptfoto wurde geändert!");
    } catch (error) {
      handleApiError(error, "Fehler beim Ändern des Hauptfotos");
    }
  };

  const handleMovePhotoLeft = async (index: number) => {
    if (!productId || index <= 0) {
      return;
    }

    try {
      const newFiles = [...photos];

      [newFiles[index - 1], newFiles[index]] = [
        newFiles[index],
        newFiles[index - 1],
      ];

      await dispatch(
        reorderProductFiles({ productId: Number(productId), files: newFiles }),
      ).unwrap();

      setCurrentFileIndex(index - 1);
    } catch (error) {
      handleApiError(error, "Fehler beim Ändern der Fotoreihenfolge");
    }
  };

  const handleMovePhotoRight = async (index: number) => {
    if (!productId || index >= photos.length - 1) {
      return;
    }

    try {
      const newFiles = [...photos];

      [newFiles[index], newFiles[index + 1]] = [
        newFiles[index + 1],
        newFiles[index],
      ];

      await dispatch(
        reorderProductFiles({ productId: Number(productId), files: newFiles }),
      ).unwrap();

      setCurrentFileIndex(index + 1);
    } catch (error) {
      handleApiError(error, "Fehler beim Ändern der Fotoreihenfolge");
    }
  };

  const handleOpenPhotoEditor = () => {
    if (!currentFile) {
      return;
    }
    setPhotoEditorOpen(true);
  };

  const handleClosePhotoEditor = () => {
    setPhotoEditorOpen(false);
  };

  const handleSaveEditedPhoto = async (file: File) => {
    if (!currentFile || !productId) {
      return;
    }
    try {
      await dispatch(
        replaceProductFile({ photoId: currentFile.id, file }),
      ).unwrap();
      await dispatch(getProductFiles(Number(productId))).unwrap();

      showSuccessToast("Erfolg", "Foto wurde erfolgreich aktualisiert!");
    } catch (error) {
      handleApiError(error, "Fehler beim Bearbeiten des Fotos");
      throw error;
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (selectedFiles.length === 0 || !productId || photoUploading) return;

    setPhotoUploading(true);
    setPhotoProgress({ current: 0, total: selectedFiles.length });

    let uploadedCount = 0;
    let failedCount = 0;

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        try {
          await dispatch(
            uploadProductFile({
              productId: Number(productId),
              file,
            }),
          ).unwrap();

          uploadedCount++;
        } catch (error) {
          failedCount++;
          handleApiError(error, `Fehler beim Hochladen: ${file.name}`);
        } finally {
          setPhotoProgress({
            current: i + 1,
            total: selectedFiles.length,
          });
        }
      }

      await dispatch(getProductFiles(Number(productId))).unwrap();

      if (uploadedCount > 0) {
        showSuccessToast(
          "Erfolg",
          `${uploadedCount} Bild(er) erfolgreich hochgeladen!`,
        );
      }

      if (failedCount > 0) {
        console.warn(
          `${failedCount} Bild(er) konnten nicht hochgeladen werden.`,
        );
      }
    } catch (error) {
      handleApiError(error, "Fehler beim Aktualisieren der Bilder");
    } finally {
      setPhotoUploading(false);
      setPhotoProgress({ current: 0, total: 0 });
    }
  };

  const handleDocumentUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (selectedFiles.length === 0 || !productId || documentUploading) return;

    const allowedExtensions = /\.(pdf|docx|xlsx|xls)$/i;

    const validFiles = selectedFiles.filter((file) =>
      allowedExtensions.test(file.name),
    );

    const invalidFiles = selectedFiles.filter(
      (file) => !allowedExtensions.test(file.name),
    );

    if (invalidFiles.length > 0) {
      handleApiError(
        new Error(
          `Nicht unterstützte Dateien: ${invalidFiles
            .map((file) => file.name)
            .join(", ")}`,
        ),
        "Ungültiger Dateityp",
      );
    }

    if (validFiles.length === 0) return;

    setDocumentUploading(true);
    setDocumentProgress({ current: 0, total: validFiles.length });

    let uploadedCount = 0;

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];

        try {
          await dispatch(
            uploadProductFile({
              productId: Number(productId),
              file,
            }),
          ).unwrap();

          uploadedCount++;
        } catch (error) {
          handleApiError(error, `Fehler beim Hochladen: ${file.name}`);
        } finally {
          setDocumentProgress({
            current: i + 1,
            total: validFiles.length,
          });
        }
      }

      await dispatch(getProductFiles(Number(productId))).unwrap();

      if (uploadedCount > 0) {
        showSuccessToast(
          "Erfolg",
          `${uploadedCount} Dokument(e) erfolgreich hochgeladen!`,
        );
      }
    } catch (error) {
      handleApiError(error, "Fehler beim Aktualisieren der Dokumente");
    } finally {
      setDocumentUploading(false);
      setDocumentProgress({ current: 0, total: 0 });
    }
  };

  const getDocumentUrl = (file: ProductFile): string =>
    `${import.meta.env.VITE_API_URL}${file.fileUrl}`;

  const handleOpenDocument = (file: ProductFile) => {
    window.open(getDocumentUrl(file), "_blank", "noopener,noreferrer");
  };

  const handleDownloadDocument = (file: ProductFile) => {
    const link = document.createElement("a");
    link.href = getDocumentUrl(file);
    link.download = file.originFileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmDeleteDocument = async () => {
    if (!documentToDelete || !productId || documentDeleting) return;

    setDocumentDeleting(true);

    try {
      await dispatch(deleteProductFile(documentToDelete.id)).unwrap();
      await dispatch(getProductFiles(Number(productId))).unwrap();

      setDocumentToDelete(null);
      showSuccessToast("Erfolg", "Dokument wurde erfolgreich gelöscht!");
    } catch (error) {
      handleApiError(error, "Fehler beim Löschen des Dokuments");
    } finally {
      setDocumentDeleting(false);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (productId) {
      try {
        await dispatch(deleteProductFile(fileId)).unwrap();
        await dispatch(getProductFiles(Number(productId))).unwrap();
        setCurrentFileIndex((prev) =>
          Math.max(0, Math.min(prev, photos.length - 2)),
        );
        showSuccessToast("Erfolg", "Datei wurde erfolgreich gelöscht!");
      } catch (error) {
        handleApiError(error, "Fehler beim Löschen der Datei");
        throw error;
      }
    }
  };

  const handleNextFile = () => {
    setCurrentFileIndex((prevIndex) =>
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const handlePrevFile = () => {
    setCurrentFileIndex((prevIndex) =>
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1,
    );
  };

  const handlePrevThumbnails = () => {
    setThumbnailStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextThumbnails = () => {
    setThumbnailStartIndex((prev) =>
      Math.min(Math.max(0, photos.length - visibleThumbnailCount), prev + 1),
    );
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleDeleteSuccess = () => {
    navigate("/products");
  };

  const handleOpenModal = (index: number) => {
    setCurrentFileIndex(index);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleOpenEditModal = () => {
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  const handleOpenDeletePhotoDialog = () => {
    if (!currentFile) {
      return;
    }

    setPhotoToDelete(currentFile);
    setDeletePhotoDialogOpen(true);
  };

  const handleCloseDeletePhotoDialog = () => {
    setDeletePhotoDialogOpen(false);
    setPhotoToDelete(null);
  };

  const handleConfirmDeletePhoto = async () => {
    if (!photoToDelete) {
      return;
    }

    try {
      await handleDeleteFile(photoToDelete.id);

      handleCloseDeletePhotoDialog();
    } catch {
      // handleDeleteFile уже показывает ошибку
    }
  };

  // Проверка, существует ли файл по текущему индексу
  const isValidIndex =
    currentFileIndex >= 0 && currentFileIndex < photos.length;
  const currentFile = isValidIndex ? photos[currentFileIndex] : null;

  // Определяем, какое изображение использовать
  const imageUrl = currentFile
    ? `${import.meta.env.VITE_API_URL}${currentFile.fileUrl}`
    : NO_IMAGE_PATH;
  const imageAlt = currentFile
    ? currentFile.originFileName
    : "No image available";

  if (loading) {
    return (
      <Container>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !product)
    return (
      <Container>
        <Box mt={4}>
          <Typography variant="h6" color="error">
            {error || "Produkt nicht gefunden"}
          </Typography>
          <Button onClick={handleGoBack}>Zurück</Button>
        </Box>
      </Container>
    );

  const handleEditSuccess = () => {
    setEditModalOpen(false);
  };

  const formattedDate = product.createdDate
    ? new Date(product.createdDate).toLocaleDateString("de-DE") // Формат для Германии (день.месяц.год)
    : "—";

  const formattedLastPurchaseDate = product.dateOfLastPurchase
    ? new Date(product.dateOfLastPurchase).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
    : null;

  const formatDimensions = (dims?: Dimensions | null): string => {
    if (!dims) return "—";

    const parts: string[] = [];

    if (dims.length != null && dims.length > 0)
      parts.push(`L${formatNumber(dims.length)}`);

    if (dims.width != null && dims.width > 0)
      parts.push(`B${formatNumber(dims.width)}`);

    if (dims.height != null && dims.height > 0)
      parts.push(`H${formatNumber(dims.height)}`);

    if (dims.diameter != null && dims.diameter > 0)
      parts.push(`D${formatNumber(dims.diameter)}`);

    return parts.length > 0 ? `${parts.join(", ")} mm` : "—";
  };

  const NON_STOCK_CATEGORIES = ["LEISTUNG", "ABO"];

  const getStockQuantity = (product: any, stock: any): number | null => {
    const categoryName = product.productCategory?.name?.toUpperCase();
    if (categoryName && NON_STOCK_CATEGORIES.includes(categoryName)) {
      return null;
    }

    if (!stock) return 0; // если данных нет
    return stock.quantity ?? 0;
  };

  const handlePageChange = (_: any, value: number) => {
    setPage(value - 1);
  };

  return (
    <Container maxWidth="lg" sx={productCardContainerStyle}>
      <Paper elevation={3} sx={productCardPaperStyle}>
        <Box sx={productCardHeaderStyle}>
          <Typography
            variant="h5"
            sx={{
              color: "inherit",
              fontWeight: 700,
              textAlign: "left",
              flex: 1,
              minWidth: 0,
              pr: 2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {product.name}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexShrink: 0,
            }}
          >
            {getStockQuantity(product, stock) !== null && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  minHeight: 34,
                  px: 1.5,
                  borderRadius: 1,
                  backgroundColor: "rgba(255,255,255,0.12)",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "inherit",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  Auf Lager: {getStockQuantity(product, stock)}
                </Typography>
              </Box>
            )}

            {isAdmin && (
              <DeleteProduct
                productId={product.id}
                productName={product.name}
                productArticle={product.article}
                onSuccessDelete={handleDeleteSuccess}
                trigger={
                  <Tooltip title="Produkt löschen" arrow>
                    <IconButton
                      sx={{
                        color: colors.danger,
                        "&:hover": {
                          color: colors.dangerLight,
                          transform: "scale(1.3)",
                        },
                      }}
                    >
                      <DeleteForeverOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                }
              />
            )}

            <Box
              sx={{
                width: "1px",
                height: 24,
                backgroundColor: "rgba(255,255,255,0.35)",
                mx: 0.5,
              }}
            />

            <Tooltip title="Schließen" arrow>
              <IconButton
                aria-label="Produktkarte schließen"
                onClick={handleGoBack}
                sx={{
                  width: 36,
                  height: 36,
                  color: colors.white,
                  transition: "transform 0.2s ease, background-color 0.2s ease",

                  "&:hover": {
                    transform: "scale(1.3)",
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Tabs
          value={tabIndex}
          onChange={(_, newValue) => setTabIndex(newValue)}
          sx={productCardTabsStyle}
        >
          <Tab label="Artikelinfo" />
          <Tab label="Verlauf" />
          <Tab label={`Dokumente (${documents.length})`} />
        </Tabs>

        {/* Анимированное содержимое */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarGutter: "stable",
            position: "relative",
          }}
        >
          <AnimatePresence mode="wait">
            {tabIndex === 0 ? (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                  duration: 0.18,
                  ease: "easeInOut",
                }}
                style={{
                  width: "100%",
                  minHeight: "100%",
                }}
              >
                {/*  "Artikelinfo" */}
                <Grid container spacing={3} alignItems="stretch">
                  {/* Характеристики */}
                  <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{ display: "flex", flexDirection: "column" }}
                  >
                    <Box sx={productDetailsBoxStyle}>
                      {[
                        ["ID", product.id],
                        ["Artikel", product.article],
                        ["Lieferantartikel", product.vendorArticle || "—"],
                        [
                          "Kaufpreis",
                          `${formatNumber(product.purchasingPrice)} €${
                            formattedLastPurchaseDate
                              ? `  von ${formattedLastPurchaseDate}`
                              : ""
                          }`,
                        ],
                        [
                          "Aufschlag",
                          `${formatNumber(product.markupPercentage)} %`,
                        ],
                        [
                          "Verkaufspreis",
                          `${formatNumber(product.sellingPrice)} €`,
                        ],
                        ["Maßeinheit", product.unitOfMeasurement?.name || "—"],
                        [
                          "Gewicht",
                          product.weight != null
                            ? `${formatWeight(product.weight)} kg`
                            : "—",
                        ],
                        [
                          "Abmessungen",
                          formatDimensions(product.newDimensions),
                        ],
                        ["Kategorie", product.productCategory?.name || "—"],
                        ["Beschreibung", product.description || "—"],
                        ["Lagerplatz", product.storageLocation || "—"],
                        ["Zolltarifnummer", product.customsNumber || "—"],
                        ["Erstellungsdatum", formattedDate],
                      ].map(([label, value]) => (
                        <Box key={label} sx={productDetailRowStyle}>
                          <Typography sx={productDetailLabelStyle}>
                            {label}:
                          </Typography>

                          <Typography sx={productDetailValueStyle}>
                            {value}
                          </Typography>
                        </Box>
                      ))}

                      {isAdmin && (
                        <Box sx={{ mt: 2,  }}>
                          <Button
                            variant="contained"
                            onClick={handleOpenEditModal}
                            sx={{
                              ...primaryButtonStyle,
                              width: "100%",
                            }}
                          >
                            Daten bearbeiten
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  {/* Галерея */}
                  <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{ display: "flex", flexDirection: "column" }}
                  >
                    <Box sx={productGalleryStyle}>
                      <Box
                        sx={{
                          ...productMainImageBoxStyle,
                          minHeight: 300,
                        }}
                      >
                        {photos.length > 1 && (
                          <IconButton
                            onClick={handlePrevFile}
                            sx={galleryArrowLeftStyle}
                          >
                            <ArrowBackIos />
                          </IconButton>
                        )}

                        <Box
                          component="img"
                          src={imageUrl}
                          alt={imageAlt}
                          onClick={() =>
                            currentFile && handleOpenModal(currentFileIndex)
                          }
                          sx={{
                            width: "100%",
                            maxWidth: 430,
                            height: 280,
                            objectFit: "contain",
                            cursor: currentFile ? "pointer" : "default",
                          }}
                        />

                        {photos.length > 1 && (
                          <IconButton
                            onClick={handleNextFile}
                            sx={galleryArrowRightStyle}
                          >
                            <ArrowForwardIos />
                          </IconButton>
                        )}
                      </Box>

                      {photos.length > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                            width: "100%",
                          }}
                        >
                          {/* Листаем миниатюры влево */}
                          <IconButton
                            size="small"
                            onClick={handlePrevThumbnails}
                            disabled={thumbnailStartIndex === 0}
                          >
                            <ArrowBackIos sx={{ fontSize: 16 }} />
                          </IconButton>

                          {/* Показываем максимум 4 фото */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 1,
                              flexWrap: "nowrap",
                            }}
                          >
                            {visibleFiles.map((file, visibleIndex) => {
                              const index = thumbnailStartIndex + visibleIndex;

                              return (
                                <Box
                                  key={file.id}
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 0.5,
                                    mt: 3,
                                  }}
                                >
                                  {/* Миниатюра */}
                                  <Box
                                    onClick={() => setCurrentFileIndex(index)}
                                    sx={thumbnailStyle(
                                      index === currentFileIndex,
                                    )}
                                  >
                                    <Box
                                      component="img"
                                      src={`${import.meta.env.VITE_API_URL}${file.fileUrl}`}
                                      alt={file.originFileName}
                                      sx={{
                                        display: "block",
                                        width: 60,
                                        height: 60,
                                        objectFit: "cover",
                                      }}
                                    />
                                  </Box>

                                  {/* Управление порядком */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: 0.25,
                                    }}
                                  >
                                    {/* Переместить фото влево */}
                                    <Tooltip title="Nach links">
                                      <span>
                                        <IconButton
                                          size="small"
                                          disabled={index === 0}
                                          onClick={() =>
                                            handleMovePhotoLeft(index)
                                          }
                                          sx={{
                                            width: 24,
                                            height: 24,
                                          }}
                                        >
                                          <ArrowBackIos sx={{ fontSize: 12 }} />
                                        </IconButton>
                                      </span>
                                    </Tooltip>

                                    {/* Сделать главным */}
                                    {index !== 0 ? (
                                      <Tooltip title="Als Hauptfoto festlegen">
                                        <Button
                                          size="small"
                                          variant="text"
                                          onClick={() =>
                                            handleSetMainPhoto(index)
                                          }
                                          sx={{
                                            minWidth: 24,
                                            width: 24,
                                            height: 24,
                                            p: 0,
                                            fontSize: 16,
                                            lineHeight: 1,
                                            color: colors.primaryBlue,
                                          }}
                                        >
                                          ☆
                                        </Button>
                                      </Tooltip>
                                    ) : (
                                      <Box
                                        sx={{
                                          width: 24,
                                          height: 24,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          color: colors.primaryBlue,
                                          fontSize: 16,
                                        }}
                                      >
                                        ★
                                      </Box>
                                    )}

                                    {/* Переместить фото вправо */}
                                    <Tooltip title="Nach rechts">
                                      <span>
                                        <IconButton
                                          size="small"
                                          disabled={index === photos.length - 1}
                                          onClick={() =>
                                            handleMovePhotoRight(index)
                                          }
                                          sx={{
                                            width: 24,
                                            height: 24,
                                          }}
                                        >
                                          <ArrowForwardIos
                                            sx={{ fontSize: 12 }}
                                          />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  </Box>
                                </Box>
                              );
                            })}
                          </Box>

                          {/* Листаем миниатюры вправо */}
                          <IconButton
                            size="small"
                            onClick={handleNextThumbnails}
                            disabled={
                              thumbnailStartIndex >=
                              Math.max(0, photos.length - visibleThumbnailCount)
                            }
                          >
                            <ArrowForwardIos sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      )}

                      <Box sx={galleryActionsStyle}>
                        <Button
                          variant="outlined"
                          sx={outlinedButtonStyle}
                          disabled={photoUploading}
                          onClick={() => photoInputRef.current?.click()}
                        >
                          {photoUploading
                            ? "Wird hochgeladen..."
                            : "Bild hochladen"}
                        </Button>

                        <input
                          ref={photoInputRef}
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          multiple
                          style={{ display: "none" }}
                          onChange={handleFileChange}
                        />

                        <Button
                          variant="outlined"
                          sx={outlinedButtonStyle}
                          disabled={!currentFile}
                          onClick={handleOpenPhotoEditor}
                        >
                          Bild bearbeiten
                        </Button>

                        <Button
                          variant="outlined"
                          sx={outlinedDeleteButtonStyle}
                          color="error"
                          disabled={!currentFile}
                          onClick={handleOpenDeletePhotoDialog}
                        >
                          Bild löschen
                        </Button>
                      </Box>
                      {photoUploading && photoProgress.total > 0 && (
                        <Box sx={{ width: "100%", mt: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            Bilder werden hochgeladen: {photoProgress.current}{" "}
                            von {photoProgress.total}
                          </Typography>

                          <LinearProgress
                            variant="determinate"
                            value={
                              (photoProgress.current / photoProgress.total) *
                              100
                            }
                            sx={{ height: 8, borderRadius: 2 }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </motion.div>
            ) : tabIndex === 1 ? (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                  duration: 0.18,
                  ease: "easeInOut",
                }}
                style={{
                  width: "100%",
                  minHeight: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Таблица истории */}
                {loadingHistory ? (
                  <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                  </Box>
                ) : historyRecords.length > 0 ? (
                  <Table sx={{ ...tableStyle, mt: 1 }}>
                    <StyledTableHead>
                      <TableRow>
                        <TableCell>Datum</TableCell>
                        <TableCell>Vorgang</TableCell>
                        <TableCell>Partner</TableCell>
                        <TableCell align="center">Menge</TableCell>
                        <TableCell align="center">Dokument</TableCell>
                      </TableRow>
                    </StyledTableHead>

                    <TableBody>
                      {historyRecords.map((record) => {
                        const type = record.typeOfOperation;

                        const isPositive = [
                          "EINKAUF",
                          "KUNDENERSTATTUNG",
                          "PRODUKTION",
                        ].includes(type);

                        const isNegative = [
                          "VERKAUF",
                          "LIEFERANT_RABATT",
                          "PRODUKTIONSMATERIAL",
                        ].includes(type);

                        let docPath: string | null = null;

                        if (["EINKAUF", "KUNDENERSTATTUNG"].includes(type)) {
                          docPath = `/purchases/${record.documentId}`;
                        } else if (
                          ["VERKAUF", "LIEFERANT_RABATT"].includes(type)
                        ) {
                          docPath = `/sales/${record.documentId}`;
                        } else if (
                          ["PRODUKTION", "PRODUKTIONSMATERIAL"].includes(type)
                        ) {
                          docPath = `/productions/${record.documentId}`;
                        }

                        return (
                          <TableRow
                            key={record.id}
                            onClick={() => docPath && navigate(docPath)}
                            sx={{
                              ...tableRowHoverStyle,
                              cursor: docPath ? "pointer" : "default",
                            }}
                          >
                            <TableCell
                              sx={{
                                ...cellStyle,
                                ...leftBorderCellStyle,
                              }}
                            >
                              {new Date(record.date).toLocaleDateString(
                                "de-DE",
                              )}
                            </TableCell>

                            <TableCell sx={cellStyle}>{type}</TableCell>

                            <TableCell sx={cellStyle}>
                              {record.partnerName || "—"}
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                ...cellStyle,
                                fontWeight: 700,
                                color: isPositive
                                  ? "success.main"
                                  : isNegative
                                    ? "error.main"
                                    : "text.primary",
                              }}
                            >
                              {isPositive && "+"}
                              {isNegative && "-"}
                              {record.quantity}
                            </TableCell>

                            <TableCell align="center" sx={cellStyle}>
                              {record.documentId}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    align="center"
                    mt={3}
                  >
                    Keine Verlauf verfügbar.
                  </Typography>
                )}

                {/* Пагинация */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: "auto",
                    pt: 2,
                    pb: 1,
                  }}
                >
                  <Pagination
                    count={totalPages}
                    page={page + 1}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              </motion.div>
            ) : (
              <motion.div
                key="documents"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                style={{ width: "100%", minHeight: "100%" }}
              >
                <Box sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Typography variant="h6" fontWeight={700}>
                      Produktdokumente
                    </Typography>

                    <Button
                      component="label"
                      variant="contained"
                      startIcon={
                        documentUploading ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : (
                          <UploadFileOutlinedIcon />
                        )
                      }
                      disabled={documentUploading}
                      sx={primaryButtonStyle}
                    >
                      {documentUploading
                        ? "Wird hochgeladen..."
                        : "Dokument hochladen"}

                      <input
                        hidden
                        type="file"
                        accept=".pdf,.docx,.xlsx,.xls"
                        multiple
                        onChange={handleDocumentUpload}
                      />
                    </Button>
                  </Box>

                  {documentUploading && documentProgress.total > 0 && (
                    <Box sx={{ width: "100%", mb: 3 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Dokumente werden hochgeladen: {documentProgress.current}{" "}
                        von {documentProgress.total}
                      </Typography>

                      <LinearProgress
                        variant="determinate"
                        value={
                          (documentProgress.current / documentProgress.total) *
                          100
                        }
                        sx={{ height: 8, borderRadius: 2 }}
                      />
                    </Box>
                  )}

                  {documents.length === 0 ? (
                    <Typography
                      color="text.secondary"
                      textAlign="center"
                      sx={{ py: 5 }}
                    >
                      Keine Dokumente vorhanden.
                    </Typography>
                  ) : (
                    <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                      <List disablePadding>
                        {documents.map((file, index) => {
                          const extension = file.originFileName
                            .split(".")
                            .pop()
                            ?.toLowerCase();

                          const documentIcon =
                            extension === "pdf" ? (
                              <PictureAsPdfOutlinedIcon color="error" />
                            ) : ["xlsx", "xls"].includes(extension ?? "") ? (
                              <TableChartOutlinedIcon color="success" />
                            ) : (
                              <DescriptionOutlinedIcon color="primary" />
                            );

                          return (
                            <React.Fragment key={file.id}>
                              {index > 0 && <Divider />}

                              <ListItem
                                secondaryAction={
                                  <Box sx={{ display: "flex", gap: 0.5 }}>
                                    <Tooltip title="Öffnen">
                                      <IconButton
                                        onClick={() => handleOpenDocument(file)}
                                        aria-label="Dokument öffnen"
                                      >
                                        <OpenInNewOutlinedIcon />
                                      </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Herunterladen">
                                      <IconButton
                                        onClick={() =>
                                          handleDownloadDocument(file)
                                        }
                                        aria-label="Dokument herunterladen"
                                      >
                                        <DownloadOutlinedIcon />
                                      </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Löschen">
                                      <IconButton
                                        color="error"
                                        onClick={() =>
                                          setDocumentToDelete(file)
                                        }
                                        aria-label="Dokument löschen"
                                      >
                                        <DeleteOutlineIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                }
                                sx={{ py: 1.5, pr: 17 }}
                              >
                                <ListItemIcon>{documentIcon}</ListItemIcon>

                                <ListItemText
                                  primary={file.originFileName}
                                  secondary={
                                    extension?.toUpperCase() ?? "Dokument"
                                  }
                                  primaryTypographyProps={{
                                    fontWeight: 500,
                                    sx: { overflowWrap: "anywhere" },
                                  }}
                                />
                              </ListItem>
                            </React.Fragment>
                          );
                        })}
                      </List>
                    </Paper>
                  )}
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Paper>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={imageModalStyle}>
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
            }}
          >
            <Close />
          </IconButton>

          {photos.length > 1 && (
            <IconButton
              onClick={handlePrevFile}
              sx={{
                position: "absolute",
                left: 8,
              }}
            >
              <ArrowBackIos />
            </IconButton>
          )}

          <Box
            component="img"
            src={imageUrl}
            alt={imageAlt}
            sx={{
              maxWidth: "100%",
              maxHeight: "75vh",
              objectFit: "contain",
            }}
          />

          {photos.length > 1 && (
            <IconButton
              onClick={handleNextFile}
              sx={{
                position: "absolute",
                right: 8,
              }}
            >
              <ArrowForwardIos />
            </IconButton>
          )}
        </Box>
      </Modal>
      {/* Модальное окно для редактирования */}
      {editModalOpen && (
        <EditProduct
          productId={Number(productId)}
          closeModal={handleCloseEditModal}
          onSaveSuccess={handleEditSuccess}
        />
      )}

      <Dialog
        open={deletePhotoDialogOpen}
        onClose={handleCloseDeletePhotoDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: 700,
              color: colors.primaryDark,
            }}
          >
            Bild löschen
          </Typography>

          <Typography>Möchten Sie dieses Bild wirklich löschen?</Typography>

          {photoToDelete && (
            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                src={`${import.meta.env.VITE_API_URL}${photoToDelete.fileUrl}`}
                alt={photoToDelete.originFileName}
                sx={{
                  maxWidth: 220,
                  maxHeight: 180,
                  objectFit: "contain",
                  borderRadius: 1,
                  border: `1px solid ${colors.border}`,
                }}
              />
            </Box>
          )}

          {photoToDelete?.id === photos[0]?.id && (
            <Typography
              color="error"
              sx={{
                mt: 2,
                fontWeight: 600,
              }}
            >
              Achtung: Dieses Bild ist aktuell das Hauptfoto.
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              mt: 3,
            }}
          >
            <Button variant="outlined" onClick={handleCloseDeletePhotoDialog}>
              Abbrechen
            </Button>

            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmDeletePhoto}
            >
              Löschen
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={documentToDelete !== null}
        onClose={() => {
          if (!documentDeleting) setDocumentToDelete(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: 700,
              color: colors.primaryDark,
            }}
          >
            Dokument löschen
          </Typography>

          <Typography>Möchten Sie dieses Dokument wirklich löschen?</Typography>

          <Typography
            sx={{
              mt: 2,
              fontWeight: 600,
              overflowWrap: "anywhere",
            }}
          >
            {documentToDelete?.originFileName}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              mt: 3,
            }}
          >
            <Button
              variant="outlined"
              disabled={documentDeleting}
              onClick={() => setDocumentToDelete(null)}
            >
              Abbrechen
            </Button>

            <Button
              variant="contained"
              color="error"
              disabled={documentDeleting}
              onClick={handleConfirmDeleteDocument}
              startIcon={
                documentDeleting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : undefined
              }
            >
              Löschen
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <ProductPhotoEditor
        open={photoEditorOpen}
        imageUrl={
          currentFile
            ? `${import.meta.env.VITE_API_URL}${currentFile.fileUrl}`
            : null
        }
        fileName={currentFile?.originFileName}
        onClose={handleClosePhotoEditor}
        onSave={handleSaveEditedPhoto}
      />
    </Container>
  );
}
