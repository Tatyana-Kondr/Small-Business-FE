import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../../redux/hooks"
import { getProduct, selectProduct, selectLoading, selectError } from "../productsSlice"
import { getProductFiles, uploadProductFile, deleteProductFile, selectProductFiles } from "../productFilesSlice"
import { CircularProgress, Container, Box, Typography, Button, Paper, Grid, Modal, IconButton, Dialog, DialogContent, Tooltip } from "@mui/material"
import { ArrowBackIos, ArrowForwardIos, Close } from "@mui/icons-material"
import EditProduct from "./EditProduct"
import ClearIcon from '@mui/icons-material/Clear';
import DeleteProduct from "./DeleteProduct"


export default function ProductCard() {
    const { productId } = useParams<{ productId: string }>()
    const dispatch = useAppDispatch()
    const product = useAppSelector(selectProduct)
    const files = useAppSelector(selectProductFiles)
    const loading = useAppSelector(selectLoading)
    const error = useAppSelector(selectError)
    const navigate = useNavigate()

    const [currentFileIndex, setCurrentFileIndex] = useState(0)
    const [openModal, setOpenModal] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);

    const BASE_URL = "http://localhost:8080";
    const NO_IMAGE_PATH = "/media/no.jpg"; // Путь к заглушке

    useEffect(() => {
        if (productId) {
            dispatch(getProduct(Number(productId)))
            dispatch(getProductFiles(Number(productId)))
        }
    }, [dispatch, productId])

    // Обновление данных после закрытия модального окна для редактирования
    useEffect(() => {
        if (!editModalOpen && productId) {
            dispatch(getProduct(Number(productId)));
        }
    }, [editModalOpen, dispatch, productId]);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0 && productId) {
            dispatch(
                uploadProductFile({
                    productId: Number(productId),
                    file: event.target.files[0],
                })
            ).then(() => {
                dispatch(getProductFiles(Number(productId))); // Обновляем файлы после загрузки
            });
        }
    };


    const handleDeleteFile = (fileId: number) => {
        if (productId) {
            dispatch(deleteProductFile(fileId))
        }
    }

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
    const imageUrl = currentFile ? `${BASE_URL}${currentFile.fileUrl}` : NO_IMAGE_PATH;
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

    if (error) {
        return (
            <Container>
                <Box mt={4}>
                    <Typography variant="h6" color="error">
                        Error: {error}
                    </Typography>
                    <Button variant="contained" color="primary" onClick={handleGoBack} sx={{ mt: 2 }}>
                        Go Back
                    </Button>
                </Box>
            </Container>
        )
    }

    if (!product) {
        return (
            <Container>
                <Box mt={4}>
                    <Typography variant="h6">Produkt nicht gefunden</Typography>
                    <Button variant="contained" color="primary" onClick={handleGoBack} sx={{ mt: 2 }}>
                        Go Back
                    </Button>
                </Box>
            </Container>
        )
    }

    const formattedDate = product.createdDate
        ? new Date(product.createdDate).toLocaleDateString("de-DE") // Формат для Германии (день.месяц.год)
        : "—";

    return (

        <Container>
            <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden", p: 3 }}>
                {/* Основная сетка с двумя частями: таблица слева и просмотр картинок справа */}
                <Box
                    sx={{
                        backgroundImage: "linear-gradient(to right, #003c8f, #0288d1)",
                        color: "#fff",
                        padding: "12px 20px",
                        textAlign: "left",
                        marginBottom: "20px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
                        display: "flex",
                        justifyContent: "space-between"
                    }}
                >
                    <Typography variant="h5">{product.name}</Typography>
                    <Tooltip title="Schliessen" arrow>
                        <IconButton
                            onClick={handleGoBack}
                            sx={{
                                width: 40,
                                height: 40,
                                backgroundColor: "#d32f2f", 
                                color: "white",
                                borderRadius: "50%",
                                transition: "background-color 0.3s ease",

                                "&:hover": {
                                    backgroundColor: "red", 
                                },

                                "& .MuiSvgIcon-root": {
                                    transition: "transform 0.3s ease, color 0.3s ease",
                                },

                                "&:hover .MuiSvgIcon-root": {
                                    transform: "scale(1.2)", // увеличение при наведении
                                },
                            }}
                        >
                            <ClearIcon fontSize="medium" />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Grid container spacing={3}>
                    {/* Левая часть с таблицей */}
                    <Grid item xs={12} sm={5}>
                        {/* Таблица с данными */}
                        <Box sx={{ p: 3, display: "flex", flexDirection: "column", justifyContent: "space-around", height: "100%", marginBottom: "10px" }}>
                            <Grid container spacing={2}>
                                {[
                                    ["Artikel", product.article],
                                    ["Lieferantartikel", product.vendorArticle || "—"],
                                    ["Kaufpreis", `${product.purchasingPrice} €`],
                                    ["Aufschlag", `${product.markupPercentage} %`],
                                    ["Verkaufspreis", `${product.sellingPrice} €`],
                                    ["Maßeinheit", product.unitOfMeasurement || "—"],
                                    ["Gewicht", product.weight ? `${product.weight} kg` : "—"],
                                    ["Abmessungen", product.newDimensions ? `${product.newDimensions.height} x ${product.newDimensions.length} x ${product.newDimensions.width} mm` : "—"],
                                    ["Kategorie", product.productCategory?.name || "—"],
                                    ["Beschreibung", product.description || "—"],
                                    ["Erstellungsdatum", formattedDate],
                                ].map(([label, value]) => (
                                    <Grid container key={label} spacing={2} alignItems="center" sx={{ height: '50px' }}>
                                        <Grid item xs={4} >
                                            <Typography variant="body1" sx={{ fontWeight: "bold", textAlign: "left", color: "#01579b", fontSize: 14 }}>{label}:</Typography>
                                        </Grid>
                                        <Grid item xs={8}>
                                            <Typography variant="body1" sx={{ textAlign: "right", fontSize: 14 }}>{value}</Typography>
                                        </Grid>
                                    </Grid>
                                ))}
                            </Grid>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, marginTop: 2 }}>
                                <Button variant="contained" onClick={handleOpenEditModal}>
                                    Daten bearbeiten
                                </Button>
                                <DeleteProduct
                                    productId={product.id}
                                    productName={product.name}
                                    productArticle={product.article}
                                    onSuccessDelete={() => navigate("/")} 
                                />
                            </Box>
                        </Box>
                    </Grid>

                    {/* Правая часть с окном для просмотра картинок */}
                    <Grid item xs={12} sm={7}>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, height: "100%" }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", mb: 0.5 }}>
                                <IconButton onClick={handlePrevFile}>
                                    <ArrowBackIos />
                                </IconButton>
                                <img
                                    src={imageUrl}
                                    alt={imageAlt}
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: "400px",
                                        objectFit: "contain",
                                    }}
                                    onClick={() => currentFile && handleOpenModal(currentFileIndex)}
                                />
                                <IconButton onClick={handleNextFile}>
                                    <ArrowForwardIos />
                                </IconButton>
                            </Box>

                            {/* Кнопки загрузки и удаления фото под изображением */}
                            <Box sx={{ display: "flex", justifyContent: "center", gap: 8, mt: 0 }}>
                                <Button >
                                    Bild hochladen
                                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                                </Button>

                                <Button
                                    color="error"
                                    onClick={() => handleDeleteFile(files[currentFileIndex]?.id)}
                                    disabled={files.length === 0}
                                >
                                    Bild löschen
                                </Button>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

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

        </Container>
    )
}
