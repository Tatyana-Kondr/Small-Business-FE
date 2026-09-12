import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Box,
  Pagination,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Modal,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  getProducts,
  getProductsByCategory,
  selectProductsPaged,
  selectProductsVersion,
  selectTotalPages,
} from "../productsSlice";
import { useNavigate } from "react-router-dom";
import { selectIsAuthenticated } from "../../auth/authSlice";
import {
  getProductCategories,
  selectProductCategories,
} from "../productCategoriesSlice";
import { useSearchParams } from "react-router-dom";
import { getAllProductFiles, selectProductFiles } from "../productFilesSlice";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import NoPhotographyIcon from "@mui/icons-material/NoPhotography";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import Tooltip from "@mui/material/Tooltip";
import HoverExpandText from "../../../components/ui/HoverExpandText";
import {
  categoryCellWidthStyle,
  cellStyle,
  centerCellStyle,
  fixedCellWidth,
  hoverExpandCellStyle,
  leftBorderCellStyle,
  productPhotoCellStyle,
  rightCellStyle,
  StyledTableHead,
  tableContainerStyle,
  tableRowHoverStyle,
  tableStyle,
} from "../../../styles/tableStyles";
import { colors } from "../../../styles/colors";
import SearchBox from "../../../components/ui/SearchBox";
import {
  listPageStyle,
  listPaginationStyle,
  listTableAreaStyle,
  pageToolbarStyle,
} from "../../../styles/formStyles";
import SortableHeader from "../../../components/ui/SortableHeader";
import { Product } from "../types";
import { getAdaptivePageSize } from "../../../utils/getAdaptivePageSize";

const formatNumber = (value: number) => (
  <span style={{ color: value < 0 ? "red" : "inherit" }}>{value}</span>
);

export default function Products() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const products = useAppSelector(selectProductsPaged);
  const totalPages = useAppSelector(selectTotalPages);

  const categories = useAppSelector(selectProductCategories);
  const productFiles = useAppSelector(selectProductFiles);
  const productsVersion = useAppSelector(selectProductsVersion);

  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(Number(searchParams.get("page")) || 0);
  const [pageSize, setPageSize] = useState(getAdaptivePageSize);
  const [sort, setSort] = useState(searchParams.get("sort") || "name");
  const [openPreview, setOpenPreview] = useState(false);
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    searchParams.get("category") || "",
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchTerm]);

  useEffect(() => {
    const handleResize = () => {
      const newPageSize = getAdaptivePageSize();

      setPageSize((prev) => {
        if (prev === newPageSize) {
          return prev;
        }

        setPage(0);
        return newPageSize;
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    dispatch(getProductCategories());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getAllProductFiles());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    setSearchParams({
      page: page.toString(),
      search: searchTerm,
      category: selectedCategoryId,
      sort,
    });
  }, [page, searchTerm, selectedCategoryId, sort, setSearchParams]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const categoryIdNum = selectedCategoryId
      ? Number(selectedCategoryId)
      : null;

    if (categoryIdNum) {
      dispatch(
        getProductsByCategory({
          categoryId: categoryIdNum,
          page,
          size: pageSize,
          sort,
          searchTerm: debouncedSearchTerm,
        }),
      );
    } else {
      dispatch(
        getProducts({
          page,
          size: pageSize,
          searchTerm: debouncedSearchTerm,
          sort,
        }),
      );
    }
  }, [
    dispatch,
    isAuthenticated,
    selectedCategoryId,
    page,
    pageSize,
    debouncedSearchTerm,
    sort,
    productsVersion,
  ]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handlePageChange = (_: any, value: number) => {
    setPage(value - 1);
  };

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    setSelectedCategoryId(e.target.value);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setPage(0);
  };

  const handleSort = (field: string, direction: "ASC" | "DESC") => {
    setSort(`${field},${direction}`);
    setPage(0);
  };

  const NON_STOCK_CATEGORIES = ["LEISTUNG", "ABO"];

  const getStockQuantity = (product: Product): number | null => {
    const categoryName = product.productCategory?.name?.toUpperCase();

    if (categoryName && NON_STOCK_CATEGORIES.includes(categoryName)) {
      return null;
    }

    return product.quantity ?? 0;
  };

  const handleOpenPreview = (productId: number) => {
    const related = productFiles
      .filter(
        (f) =>
          (f.product?.id === productId || f.productId === productId) &&
          f.fileUrl &&
          !f.fileUrl.toLowerCase().includes("no.jpg"),
      )

      .map((f) => `${import.meta.env.VITE_API_URL}${f.fileUrl}`);

    if (related.length > 0) {
      setCurrentPhotos(related);
      setCurrentPhotoIndex(0);
      setOpenPreview(true);
    } else {
      console.warn("⚠️ Нет фото для продукта:", productId);
    }
  };

  const handleClosePreview = () => setOpenPreview(false);
  const handlePrevPhoto = () =>
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? currentPhotos.length - 1 : prev - 1,
    );
  const handleNextPhoto = () =>
    setCurrentPhotoIndex((prev) =>
      prev === currentPhotos.length - 1 ? 0 : prev + 1,
    );

  return (
    <Box sx={listPageStyle}>
      <Box sx={pageToolbarStyle}>
        <Box display="flex" gap={2}>
          <FormControl sx={{ minWidth: 200, backgroundColor: "white" }}>
            <InputLabel id="category-select-label">Kategorie</InputLabel>
            <Select
              labelId="category-select-label"
              value={selectedCategoryId ?? ""}
              label="Kategorie"
              onChange={handleCategoryChange}
            >
              <MenuItem value="">Alle Kategorien</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <SearchBox
            value={searchTerm}
            onChange={handleSearchChange}
            onClear={handleClearSearch}
          />
        </Box>
      </Box>

      {/* Таблица */}
      <Box sx={listTableAreaStyle}>
        <TableContainer
          component={Paper}
          sx={{ ...tableContainerStyle, mt: 1 }}
        >
          <Table sx={{ ...tableStyle, minWidth: 1200 }}>
            <StyledTableHead>
              <TableRow>
                <TableCell align="center" sx={fixedCellWidth(40)} />

                <TableCell sx={{ minWidth: 300 }}>
                  <SortableHeader
                    title="Name"
                    field="name"
                    activeSort={[sort]}
                    onSort={handleSort}
                  />
                </TableCell>

                <TableCell sx={fixedCellWidth(120)}>
                  <SortableHeader
                    title="Artikel Nr"
                    field="article"
                    activeSort={[sort]}
                    onSort={handleSort}
                  />
                </TableCell>

                <TableCell align="center" sx={fixedCellWidth(140)}>
                  <SortableHeader
                    title="Lieferanten Nr"
                    field="vendorArticle"
                    activeSort={[sort]}
                    onSort={handleSort}
                  />
                </TableCell>
                <TableCell align="center" sx={fixedCellWidth(100)}>
                  EK preis
                </TableCell>
                <TableCell align="center" sx={fixedCellWidth(100)}>
                  VK preis
                </TableCell>
                <TableCell align="center" sx={fixedCellWidth(80)}>
                  ME
                </TableCell>
                <TableCell align="center" sx={fixedCellWidth(80)}>
                  Gewicht, kg
                </TableCell>
                <TableCell align="center" sx={fixedCellWidth(70)}>
                  Auf Lager
                </TableCell>
                <TableCell align="center" sx={categoryCellWidthStyle}>
                  Kategorie
                </TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => {
                  const hasPhoto = product.hasPhoto === true;

                  return (
                    <TableRow
                      key={product.id}
                      sx={tableRowHoverStyle}
                      onDoubleClick={() => {
                        navigate(`/product-card/${product.id}`);
                      }}
                    >
                      <TableCell sx={productPhotoCellStyle}>
                        <Box
                          sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {hasPhoto ? (
                            <Tooltip title="Foto ansehen">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenPreview(product.id);
                                }}
                                sx={{
                                  p: 0,
                                  width: 24,
                                  height: 24,
                                }}
                              >
                                <PhotoCameraIcon
                                  sx={{
                                    fontSize: 21,
                                    color: colors.accent,
                                    "&:hover": {
                                      color: colors.gradientLight,
                                    },
                                  }}
                                />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Kein Foto">
                              <Box
                                sx={{
                                  width: 24,
                                  height: 24,
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <NoPhotographyIcon
                                  sx={{
                                    fontSize: 21,
                                    color: colors.grey,
                                  }}
                                />
                              </Box>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          ...hoverExpandCellStyle,
                          ...leftBorderCellStyle,
                        }}
                      >
                        <HoverExpandText
                          text={product.name ?? ""}
                          hoverBgColor={colors.tableHover}
                        />
                      </TableCell>
                      <TableCell sx={{ ...cellStyle, ...fixedCellWidth(120) }}>
                        {product.article}
                      </TableCell>
                      <TableCell sx={{ ...cellStyle, ...fixedCellWidth(140) }}>
                        {product.vendorArticle}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...rightCellStyle,
                          ...fixedCellWidth(100),
                        }}
                      >
                        {formatNumber(product.purchasingPrice)} €
                      </TableCell>
                      <TableCell
                        sx={{
                          ...rightCellStyle,
                          ...fixedCellWidth(100),
                        }}
                      >
                        {formatNumber(product.sellingPrice)} €
                      </TableCell>
                      <TableCell
                        sx={{
                          ...centerCellStyle,
                          ...fixedCellWidth(80),
                        }}
                      >
                        {product.unitOfMeasurement.name}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...rightCellStyle,
                          ...fixedCellWidth(80),
                        }}
                      >
                        {product.weight
                          ? formatNumber(product.weight)
                          : ""}{" "}
                      </TableCell>
                      <TableCell
                        sx={{ ...rightCellStyle, ...fixedCellWidth(70) }}
                      >
                        {getStockQuantity(product) === null
                          ? " "
                          : formatNumber(getStockQuantity(product) ?? 0)}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...hoverExpandCellStyle,
                          ...categoryCellWidthStyle,
                        }}
                      >
                        <HoverExpandText
                          text={product.productCategory?.name ?? ""}
                          hoverBgColor={colors.tableHover}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    Keine Produkte gefunden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box sx={listPaginationStyle}>
        <Pagination
          count={totalPages}
          page={page + 1}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
      <Modal open={openPreview} onClose={handleClosePreview}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxWidth: 900,
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <IconButton
            onClick={handleClosePreview}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>

          {/* Стрелка влево */}
          {currentPhotos.length > 1 && (
            <IconButton
              onClick={handlePrevPhoto}
              sx={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <ArrowBackIos />
            </IconButton>
          )}

          {/* Само фото */}
          <img
            src={currentPhotos[currentPhotoIndex]}
            alt="Produktfoto"
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              objectFit: "contain",
              borderRadius: 8,
            }}
          />

          {/* Стрелка вправо */}
          {currentPhotos.length > 1 && (
            <IconButton
              onClick={handleNextPhoto}
              sx={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <ArrowForwardIos />
            </IconButton>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
