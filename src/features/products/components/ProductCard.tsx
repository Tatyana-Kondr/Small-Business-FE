import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../../redux/hooks"
import { getProduct, selectProduct, selectLoading, selectError } from "../productsSlice"
import { getProductFiles, deleteProductFile, selectProductFiles, uploadProductFile } from "../productFilesSlice"
import { CircularProgress, Container, Box, Typography, Button, Paper, Grid, Modal, IconButton, Dialog, DialogContent, Tabs, Tab, Table, TableHead, TableRow, TableCell, TableBody, styled, Pagination } from "@mui/material"
import { ArrowBackIos, ArrowForwardIos, Close } from "@mui/icons-material"
import EditProduct from "./EditProduct"
import DeleteProduct from "./DeleteProduct"
import { showSuccessToast } from "../../../utils/toast"
import { handleApiError } from "../../../utils/handleApiError"
import { selectRoles } from "../../auth/authSlice"
import { getProductHistory, getProductStock, selectLoadingRecords, selectSelectedWarehouseStock, selectWarehouseRecordPages, selectWarehouseRecords } from "../../warehouse/warehouseSlice"
import { motion, AnimatePresence } from "framer-motion"

// Стили для заголовков таблицы
const StyledTableHead = styled(TableHead)({
    backgroundColor: "#1a3d6d",
    "& th": {
        color: "white",
        fontWeight: "bold",
        borderRight: "1px solid #ddd",
    },
});

// Стили для полей в таблице
const cellStyle = {
    whiteSpace: "nowrap",  // запрещаем перенос строк
    borderRight: "1px solid #ddd",
    padding: "6px 12px",
};

export default function ProductCard() {
    const { productId } = useParams<{ productId: string }>()
    const dispatch = useAppDispatch()
    const product = useAppSelector(selectProduct)
    const files = useAppSelector(selectProductFiles)
    const loading = useAppSelector(selectLoading)
    const error = useAppSelector(selectError)
    const stock = useAppSelector(selectSelectedWarehouseStock);
    const userRole = useAppSelector(selectRoles);
    const isAdmin = userRole === "ADMIN";
    const [tabIndex, setTabIndex] = useState(0);
    const historyRecords = useAppSelector(selectWarehouseRecords);
    const loadingHistory = useAppSelector(selectLoadingRecords);
    const totalPages = useAppSelector(selectWarehouseRecordPages);

    const navigate = useNavigate()

    const [currentFileIndex, setCurrentFileIndex] = useState(0)
    const [openModal, setOpenModal] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [page, setPage] = useState(0);

    const NO_IMAGE_PATH = "/media/no.jpg"; // Путь к заглушке

    useEffect(() => {
        if (productId) {
            dispatch(getProduct(Number(productId)))
            dispatch(getProductFiles(Number(productId)))
            dispatch(getProductStock(Number(productId)))
        }
    }, [dispatch, productId])

    // Обновление данных после закрытия модального окна для редактирования
    useEffect(() => {
        if (!editModalOpen && productId) {
            dispatch(getProduct(Number(productId)));
        }
    }, [editModalOpen, dispatch, productId]);

    useEffect(() => {
        if (tabIndex === 1 && productId) {
            dispatch(getProductHistory({ productId: Number(productId), page: 0, size: 50 }));
        }
    }, [tabIndex, productId, dispatch]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0 && productId) {
            try {
                await dispatch(
                    uploadProductFile({
                        productId: Number(productId),
                        file: event.target.files[0],
                    })
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
        setCurrentFileIndex((prevIndex) => (prevIndex === files.length - 1 ? 0 : prevIndex + 1))
    }

    const handlePrevFile = () => {
        setCurrentFileIndex((prevIndex) => (prevIndex === 0 ? files.length - 1 : prevIndex - 1))
    }

    const handleGoBack = () => {
        navigate(-1)
    }

    const handleOpenModal = (index: number) => {
        setCurrentFileIndex(index)
        setOpenModal(true)
    }

    const handleCloseModal = () => {
        setOpenModal(false)
    }

    const handleOpenEditModal = () => {
        setEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditModalOpen(false);
    };

    // Проверка, существует ли файл по текущему индексу
    const isValidIndex = currentFileIndex >= 0 && currentFileIndex < files.length;
    const currentFile = isValidIndex ? files[currentFileIndex] : null;

    // Определяем, какое изображение использовать
    const imageUrl = currentFile ? `${import.meta.env.VITE_API_URL}${currentFile.fileUrl}` : NO_IMAGE_PATH;
    const imageAlt = currentFile ? currentFile.originFileName : "No image available";

    if (loading) {
        return (
            <Container>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <CircularProgress />
                </Box>
            </Container>
        )
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
        )

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

        <Container maxWidth="lg" sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <Paper
                elevation={3}
                sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    p: 3,
                    width: { xs: "100%", sm: "95%", md: "90%", lg: "1200px" },
                    mx: "auto",
                    minHeight: "750px",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s ease"
                }}
            >
                {/* Заголовок */}
                <Box
                    sx={{
                        backgroundImage: "linear-gradient(to right, #003c8f, #0288d1)",
                        color: "#fff",
                        padding: "12px 20px",
                        borderRadius: "8px",
                        mb: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                >
                    <Typography variant="h5">{product.name}</Typography>
                    {getStockQuantity(product, stock) !== null && (
                        <Typography variant="h6">
                            Auf Lager: {getStockQuantity(product, stock)}
                        </Typography>
                    )}
                </Box>

                {/* Вкладки */}
                <Tabs
                    value={tabIndex}
                    onChange={(_, newValue) => setTabIndex(newValue)}
                    indicatorColor="primary"
                    textColor="primary"
                    sx={{
                        mb: 2,
                        "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
                        "& .Mui-selected": { color: "#0288d1" },
                    }}
                >
                    <Tab label="Artikelinfo" />
                    <Tab label="Verlauf" />
                </Tabs>

                {/* Анимированное содержимое */}
                <Box sx={{ flexGrow: 1, position: "relative" }}>
                    <AnimatePresence mode="wait">
                        {tabIndex === 0 ? (
                            <motion.div
                                key="info"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.3 }}
                                style={{ position: "absolute", width: "100%" }}
                            >
                                {/*  "Artikelinfo" */}
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={5}>
                                        <Box sx={{ p: 3 }}>
                                            {[
                                                ["Artikel", product.article],
                                                ["Lieferantartikel", product.vendorArticle || "—"],
                                                ["Kaufpreis", `${product.purchasingPrice} €`],
                                                ["Aufschlag", `${product.markupPercentage} %`],
                                                ["Verkaufspreis", `${product.sellingPrice} €`],
                                                ["Maßeinheit", product.unitOfMeasurement.name || "—"],
                                                ["Gewicht", product.weight ? `${product.weight} kg` : "—"],
                                                ["Abmessungen", formatDimensions(product.newDimensions)],
                                                ["Kategorie", product.productCategory?.name || "—"],
                                                ["Beschreibung", product.description || "—"],
                                                ["Lagerplatz", product.storageLocation || "—"],
                                                ["Erstellungsdatum", formattedDate]
                                            ].map(([label, value]) => (
                                                <Box
                                                    key={label}
                                                    display="flex"
                                                    justifyContent="space-between"
                                                    borderBottom="1px solid #eee"
                                                    py={0.5}
                                                >
                                                    <Typography sx={{ fontWeight: 600, color: "#01579b" }}>
                                                        {label}:
                                                    </Typography>
                                                    <Typography>{value}</Typography>
                                                </Box>
                                            ))}
                                            <Box mt={4} display="flex" flexDirection="column" gap={1}>
                                                <Button variant="contained" onClick={handleOpenEditModal}>
                                                    Daten bearbeiten
                                                </Button>
                                                {isAdmin && (
                                                    <DeleteProduct
                                                        productId={product.id}
                                                        productName={product.name}
                                                        productArticle={product.article}
                                                        onSuccessDelete={() => navigate("/")}
                                                    />
                                                )}
                                            </Box>
                                        </Box>
                                    </Grid>

                                    {/* Правая часть с окном для просмотра картинок */}
                                    <Grid item xs={12} sm={7} >
                                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, height: "100%" }}>
                                            <Box sx={{ position: "relative", display: "flex", justifyContent: "center", width: "100%", mb: 1 }}>
                                                <IconButton onClick={handlePrevFile} sx={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", zIndex: 1, }}>
                                                    <ArrowBackIos />
                                                </IconButton>
                                                <img
                                                    src={imageUrl}
                                                    alt={imageAlt}
                                                    style={{
                                                        maxWidth: "calc(100% - 80px)", // оставляем место для обеих стрелок
                                                        maxHeight: "400px",
                                                        objectFit: "contain",
                                                        borderRadius: 8,
                                                        cursor: currentFile ? "pointer" : "default",
                                                    }}
                                                    onClick={() => currentFile && handleOpenModal(currentFileIndex)}
                                                />
                                                <IconButton onClick={handleNextFile} sx={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", zIndex: 1, }}>
                                                    <ArrowForwardIos />
                                                </IconButton>
                                            </Box>

                                            {/* Миниатюрная галерея */}
                                            {files.length > 0 && (
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        flexWrap: "wrap",
                                                        gap: 1,
                                                        mt: 1,
                                                    }}
                                                >
                                                    {files.map((file, index) => (
                                                        <Box
                                                            key={file.id}
                                                            onClick={() => setCurrentFileIndex(index)}
                                                            sx={{
                                                                border:
                                                                    index === currentFileIndex
                                                                        ? "2px solid #0288d1"
                                                                        : "1px solid #ccc",
                                                                borderRadius: 2,
                                                                padding: "2px",
                                                                cursor: "pointer",
                                                                transition: "transform 0.2s ease",
                                                                "&:hover": {
                                                                    transform: "scale(1.05)",
                                                                },
                                                            }}
                                                        >
                                                            <img
                                                                src={`${import.meta.env.VITE_API_URL}${file.fileUrl}`}
                                                                alt={file.originFileName}
                                                                style={{
                                                                    width: 60,
                                                                    height: 60,
                                                                    objectFit: "cover",
                                                                    borderRadius: 4,
                                                                }}
                                                            />
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}

                                            {/* Кнопки загрузки и удаления фото под изображением */}
                                            <Box sx={{ display: "flex", justifyContent: "center", gap: 8, mt: 0 }}>
                                                <label htmlFor="upload-file-input">
                                                    <Button component="span">
                                                        Bild hochladen
                                                    </Button>
                                                </label>
                                                <input
                                                    id="upload-file-input"
                                                    type="file"
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    onChange={handleFileChange}
                                                />

                                                <Button
                                                    color="error"
                                                    onClick={() => currentFile && handleDeleteFile(currentFile.id)}
                                                    disabled={!currentFile}
                                                >
                                                    Bild löschen
                                                </Button>
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
                                style={{ position: "absolute", width: "100%" }}
                            >
                                {/* Таблица истории */}
                                {loadingHistory ? (
                                    <Box display="flex" justifyContent="center" mt={4}>
                                        <CircularProgress />
                                    </Box>
                                ) : historyRecords.length > 0 ? (
                                    <Table>
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
                                                const isPositive =
                                                    ["EINKAUF", "KUNDENERSTATTUNG", "PRODUKTION"].includes(type);
                                                const isNegative =
                                                    ["VERKAUF", "LIEFERANT_RABATT", "PRODUKTIONSMATERIAL"].includes(type);

                                                const color = isPositive
                                                    ? "green"
                                                    : isNegative
                                                        ? "red"
                                                        : "inherit";

                                                // определяем путь для перехода
                                                let docPath = null;
                                                if (["EINKAUF", "KUNDENERSTATTUNG"].includes(type)) {
                                                    docPath = `/purchases/${record.documentId}`;
                                                } else if (["VERKAUF", "LIEFERANT_RABATT"].includes(type)) {
                                                    docPath = `/sales/${record.documentId}`;
                                                } else if (["PRODUKTION", "PRODUKTIONSMATERIAL"].includes(type)) {
                                                    docPath = `/productions/${record.documentId}`;
                                                }

                                                return (
                                                    <TableRow
                                                        key={record.id}
                                                        hover
                                                        onClick={() => docPath && navigate(docPath)}
                                                        sx={{
                                                            cursor: docPath ? "pointer" : "default",
                                                            transition: "background-color 0.2s ease",
                                                            "&:hover": {
                                                                backgroundColor: docPath ? "rgba(0,0,0,0.04)" : "inherit",
                                                            },
                                                        }}
                                                    >
                                                        <TableCell sx={{ ...cellStyle, borderLeft: "1px solid #ddd" }}>  {new Date(record.date).toLocaleDateString("de-DE")} </TableCell>
                                                        <TableCell sx={{ ...cellStyle }}>{type}</TableCell>
                                                        <TableCell sx={{ ...cellStyle }}> {record.partnerName || "—"} </TableCell>
                                                        <TableCell sx={{ ...cellStyle, fontWeight: "bold", color, }}  align="center">  {isPositive && "+"}  {isNegative && "-"} {record.quantity} </TableCell>
                                                        <TableCell align="center" sx={cellStyle}> {record.documentId} </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <Typography variant="body1" color="text.secondary" align="center" mt={3}>
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
                    </AnimatePresence >
                </Box >
            </Paper >

            <Modal open={openModal} onClose={handleCloseModal}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "80%",
                        maxWidth: 800,
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <IconButton onClick={handleCloseModal} sx={{ position: "absolute", top: 10, right: 10 }}>
                        <Close />
                    </IconButton>
                    <IconButton onClick={handlePrevFile} sx={{ position: "absolute", left: 10 }}>
                        <ArrowBackIos />
                    </IconButton>
                    <img
                        src={imageUrl}
                        alt={imageAlt}
                        style={{
                            maxWidth: "100%",
                            maxHeight: "500px",
                            objectFit: "contain",
                        }}
                    />
                    <IconButton onClick={handleNextFile} sx={{ position: "absolute", right: 10 }}>
                        <ArrowForwardIos />
                    </IconButton>
                </Box>
            </Modal>
            {/* Модальное окно для редактирования */}
            <Dialog open={editModalOpen} onClose={handleCloseEditModal} fullWidth maxWidth="sm">
                <DialogContent>
                    <EditProduct productId={Number(productId)} closeModal={handleCloseEditModal} />
                </DialogContent>
            </Dialog>

        </Container >
    )
}


