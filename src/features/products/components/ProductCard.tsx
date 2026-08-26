import type React from "react";
import { useEffect, useState } from "react";
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
import { handleApiError } from "../../../utils/handleApiError";
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
  thumbnailListStyle,
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
import { ProductFile } from "../types";

export default function ProductCard() {
  const { productId } = useParams<{ productId: string }>();
  const dispatch = useAppDispatch();
  const product = useAppSelector(selectProduct);
  const files = useAppSelector(selectProductFiles);
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
  const [openModal, setOpenModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [photoEditorOpen, setPhotoEditorOpen] = useState(false);
  const [deletePhotoDialogOpen, setDeletePhotoDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<ProductFile | null>(null);

  const [page, setPage] = useState(0);

  const NO_IMAGE_PATH = "/media/no.jpg"; // Путь к заглушке

  useEffect(() => {
    if (productId) {
      dispatch(getProduct(Number(productId)));
      dispatch(getProductFiles(Number(productId)));
      dispatch(getProductStock(Number(productId)));
    }
  }, [dispatch, productId]);

  // Обновление данных после закрытия модального окна для редактирования
  useEffect(() => {
    if (!editModalOpen && productId) {
      dispatch(getProduct(Number(productId)));
    }
  }, [editModalOpen, dispatch, productId]);

  useEffect(() => {
    if (tabIndex === 1 && productId) {
      dispatch(
        getProductHistory({ productId: Number(productId), page: 0, size: 50 }),
      );
    }
  }, [tabIndex, productId, dispatch]);

  const handleSetMainPhoto = async (index: number) => {
    if (!productId || index === 0) {
      return;
    }

    try {
      const selected = files[index];
      const newFiles = [selected, ...files.filter((_, i) => i !== index)];

      await dispatch(
        reorderProductFiles({ productId: Number(productId), files: newFiles }),
      ).unwrap();
      setCurrentFileIndex(0);
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
      const newFiles = [...files];

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
    if (!productId || index >= files.length - 1) {
      return;
    }

    try {
      const newFiles = [...files];

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
    if (event.target.files && event.target.files.length > 0 && productId) {
      try {
        await dispatch(
          uploadProductFile({
            productId: Number(productId),
            file: event.target.files[0],
          }),
        ).unwrap();

        await dispatch(getProductFiles(Number(productId))).unwrap();
        showSuccessToast("Erfolg", "Datei wurde erfolgreich hochgeladen!");
      } catch (error) {
        handleApiError(error, "Fehler beim Hochladen der Datei");
      }
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (productId) {
      try {
        await dispatch(deleteProductFile(fileId)).unwrap();
        await dispatch(getProductFiles(Number(productId))).unwrap();
        setCurrentFileIndex((prev) => Math.min(prev, files.length - 2));
        showSuccessToast("Erfolg", "Datei wurde erfolgreich gelöscht!");
      } catch (error) {
        handleApiError(error, "Fehler beim Löschen der Datei");
      }
    }
  };

  const handleNextFile = () => {
    setCurrentFileIndex((prevIndex) =>
      prevIndex === files.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const handlePrevFile = () => {
    setCurrentFileIndex((prevIndex) =>
      prevIndex === 0 ? files.length - 1 : prevIndex - 1,
    );
  };

  const handleGoBack = () => {
    navigate(-1);
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
  const isValidIndex = currentFileIndex >= 0 && currentFileIndex < files.length;
  const currentFile = isValidIndex ? files[currentFileIndex] : null;

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

  const formattedDate = product.createdDate
    ? new Date(product.createdDate).toLocaleDateString("de-DE") // Формат для Германии (день.месяц.год)
    : "—";

  type Dimensions = {
    length?: number;
    width?: number;
    height?: number;
    diameter?: number;
  };

  const formatDimensions = (dims?: Dimensions): string => {
    if (!dims) return "—";
    const parts: string[] = [];

    if (dims.length && dims.length > 0) parts.push(`L${dims.length}`);
    if (dims.width && dims.width > 0) parts.push(`B${dims.width}`);
    if (dims.height && dims.height > 0) parts.push(`H${dims.height}`);
    if (dims.diameter && dims.diameter > 0) parts.push(`D${dims.diameter}`);

    return parts.length > 0 ? parts.join(", ") + " mm" : "—";
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
              whiteSpace: "normal",
              wordBreak: "break-word",
              flex: 1,
              pr: 2,
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
                onSuccessDelete={() => navigate("/products")}
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
                onClick={() => navigate("/products")}
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
        </Tabs>

        {/* Анимированное содержимое */}
        <Box sx={{ flexGrow: 1 }}>
          <AnimatePresence mode="wait">
            {tabIndex === 0 ? (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                style={{ width: "100%" }}
              >
                {/*  "Artikelinfo" */}
                <Grid container spacing={3} alignItems="stretch">
                  {/* Характеристики */}
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Box sx={productDetailsBoxStyle}>
                        {[
                          ["Artikel", product.article],
                          ["Lieferantartikel", product.vendorArticle || "—"],
                          ["Kaufpreis", `${product.purchasingPrice} €`],
                          ["Aufschlag", `${product.markupPercentage} %`],
                          ["Verkaufspreis", `${product.sellingPrice} €`],
                          [
                            "Maßeinheit",
                            product.unitOfMeasurement?.name || "—",
                          ],
                          [
                            "Gewicht",
                            product.weight ? `${product.weight} kg` : "—",
                          ],
                          [
                            "Abmessungen",
                            formatDimensions(product.newDimensions),
                          ],
                          ["Kategorie", product.productCategory?.name || "—"],
                          ["Beschreibung", product.description || "—"],
                          ["Lagerplatz", product.storageLocation || "—"],
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
                          <Button
                            variant="contained"
                            onClick={handleOpenEditModal}
                            sx={{
                              ...primaryButtonStyle,
                              width: "100%",
                              mt: 5,
                            }}
                          >
                            Daten bearbeiten
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Grid>

                  {/* Галерея */}
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Box sx={productGalleryStyle}>
                        <Box
                          sx={{
                            ...productMainImageBoxStyle,
                            minHeight: 360,
                          }}
                        >
                          {files.length > 1 && (
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
                              height: 340,
                              objectFit: "contain",
                              cursor: currentFile ? "pointer" : "default",
                            }}
                          />

                          {files.length > 1 && (
                            <IconButton
                              onClick={handleNextFile}
                              sx={galleryArrowRightStyle}
                            >
                              <ArrowForwardIos />
                            </IconButton>
                          )}
                        </Box>

                        {files.length > 0 && (
                          <Box sx={thumbnailListStyle}>
                            {files.map((file, index) => (
                              <Box
                                key={file.id}
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: 0.5,
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
                                  {/* Влево */}
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
                                        <ArrowBackIos
                                          sx={{
                                            fontSize: 12,
                                          }}
                                        />
                                      </IconButton>
                                    </span>
                                  </Tooltip>

                                  {/* Сделать главным */}
                                  {index !== 0 && (
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
                                  )}

                                  {/* У главного фото оставляем место,  чтобы стрелки у всех стояли ровно */}
                                  {index === 0 && (
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

                                  {/* Вправо */}
                                  <Tooltip title="Nach rechts">
                                    <span>
                                      <IconButton
                                        size="small"
                                        disabled={index === files.length - 1}
                                        onClick={() =>
                                          handleMovePhotoRight(index)
                                        }
                                        sx={{ width: 24, height: 24 }}
                                      >
                                        <ArrowForwardIos
                                          sx={{ fontSize: 12 }}
                                        />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        )}

                        <Box
                          sx={{
                            ...galleryActionsStyle,
                            flexWrap: "wrap",
                            gap: 1,
                          }}
                        >
                          <Button
                            component="label"
                            variant="outlined"
                            sx={outlinedButtonStyle}
                          >
                            Bild hochladen
                            <input
                              hidden
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                          </Button>

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
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                style={{ width: "100%" }}
              >
                {/* Таблица истории */}
                {loadingHistory ? (
                  <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                  </Box>
                ) : historyRecords.length > 0 ? (
                  <Table sx={tableStyle}>
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
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={totalPages}
                    page={page + 1}
                    onChange={handlePageChange}
                    color="primary"
                  />
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

          {files.length > 1 && (
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

          {files.length > 1 && (
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
      <Dialog
        open={editModalOpen}
        onClose={handleCloseEditModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent>
          <EditProduct
            productId={Number(productId)}
            closeModal={handleCloseEditModal}
          />
        </DialogContent>
      </Dialog>

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

          {photoToDelete?.position === 0 && (
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
