import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table, TableBody, TableCell,
  TableContainer, TableRow, Paper, Box, Pagination,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Modal
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { getProducts, getProductsByCategory, selectProductsPaged, selectTotalPages } from "../productsSlice";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";
import { selectIsAuthenticated } from "../../auth/authSlice";
import { getProductCategories, selectProductCategories } from "../productCategoriesSlice";
import { useSearchParams } from "react-router-dom";
import { getWarehouseStocks, selectWarehouseStocks } from "../../warehouse/warehouseSlice";
import { getAllProductFiles, selectProductFiles } from "../productFilesSlice";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import NoPhotographyIcon from "@mui/icons-material/NoPhotography";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import Tooltip from "@mui/material/Tooltip";
import HoverExpandText from "../../../components/ui/HoverExpandText";
import { cellStyle, fixedCellWidth, hoverExpandCellStyle, leftBorderCellStyle, productPhotoCellStyle, StyledTableHead, tableContainerStyle, tableRowHoverStyle, tableStyle } from "../../../styles/tableStyles";
import { colors } from "../../../styles/colors";
import SearchBox from "../../../components/ui/SearchBox";
import { pageToolbarStyle } from "../../../styles/formStyles";
import SortableHeader from "../../../components/ui/SortableHeader";


// Функция для окрашивания чисел
const formatNumber = (value: number) => (
  <span style={{ color: value < 0 ? "red" : "inherit" }}>{value}</span>
);

export default function Products() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const products = useAppSelector(selectProductsPaged);
  const totalPages = useAppSelector(selectTotalPages);
  const warehouseStocks = useAppSelector(selectWarehouseStocks);
  const categories = useAppSelector(selectProductCategories);
  const productFiles = useAppSelector(selectProductFiles);

  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(Number(searchParams.get("page")) || 0);
  const [sort, setSort] = useState(searchParams.get("sort") || "name");
  const [openPreview, setOpenPreview] = useState(false);
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    searchParams.get("category") || ""
  );

  useEffect(() => {
    dispatch(getProductCategories());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getWarehouseStocks({ page: 0, size: 500 })); // Загружаем все остатки
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getAllProductFiles());
    }
  }, [dispatch, isAuthenticated]);


  // ===== Синхронизация с URL при изменении =====
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

    const categoryIdNum = selectedCategoryId ? Number(selectedCategoryId) : null;

    if (categoryIdNum) {
      dispatch(getProductsByCategory({
        categoryId: categoryIdNum,
        page,
        size: 15,
        sort,
        searchTerm,
      }));
    } else {
      dispatch(getProducts({ page, searchTerm, sort }));
    }
    const savedScroll = sessionStorage.getItem("products_scrollY");
    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo({
          top: Number(savedScroll),
          behavior: "smooth",
        });
        sessionStorage.removeItem("products_scrollY"); // очищаем
      }, 300);
    }
  }, [dispatch, isAuthenticated, selectedCategoryId, page, searchTerm, sort]);

  // ===== Скролл вверх при смене фильтров =====
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedCategoryId, searchTerm]);

  // ===== Поиск с debounce =====
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setPage(0);
      setSearchParams({
        page: "0",
        search: term,
        category: selectedCategoryId,
        sort
      });

      const categoryIdNum = selectedCategoryId ? Number(selectedCategoryId) : null;

      if (categoryIdNum) {
        dispatch(
          getProductsByCategory({
            categoryId: categoryIdNum,
            page: 0,
            size: 15,
            sort,
            searchTerm: term,
          })
        );
      } else {
        dispatch(getProducts({ page: 0, searchTerm: term, sort }));
      }
    }, 500),
    [selectedCategoryId, sort]
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm); // Обновляем строку поиска
    debouncedSearch(newSearchTerm); // Запускаем дебаунс для поиска
  };

  const handlePageChange = (_: any, value: number) => {
    const newPage = value - 1;
    setPage(newPage);
    setSearchParams({
      page: newPage.toString(),
      search: searchTerm,
      category: selectedCategoryId,
      sort
    });
  };

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    setSelectedCategoryId(value);
    setPage(0);
    setSearchParams({
      page: "0",
      search: searchTerm,
      category: value,
    });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setPage(0);
    setSearchParams({
      page: "0",
      search: "",
      category: selectedCategoryId,
      sort
    });

    const categoryIdNum = selectedCategoryId ? Number(selectedCategoryId) : null;

    if (categoryIdNum) {
      dispatch(
        getProductsByCategory({
          categoryId: categoryIdNum,
          page: 0,
          size: 15,
          sort: "name",
          searchTerm: "",
        })
      );
    } else {
      dispatch(getProducts({ page: 0, size: 15, sort }));
    }
  };

  const handleSort = (field: string, direction: "ASC" | "DESC") => {
    const nextSort = `${field},${direction}`;

    setSort(nextSort);
    setPage(0);

    setSearchParams({
      page: "0",
      search: searchTerm,
      category: selectedCategoryId,
      sort: nextSort,
    });
  };

  const NON_STOCK_CATEGORIES = ["LEISTUNG", "ABO"];

  const getStockQuantity = (product: any): number | null => {
    const categoryName = product.productCategory?.name?.toUpperCase();
    if (categoryName && NON_STOCK_CATEGORIES.includes(categoryName)) {
      return null;
    }

    const stock = warehouseStocks.find(s => s.productId === product.id);
    return stock ? stock.quantity : 0;
  };

  // Быстрая карта: productId → true
  const photoMap = useMemo(() => {
    const map = new Map<number, boolean>();
    productFiles.forEach((file) => {
      const productId = file.product?.id || file.productId;
      if (productId && file.fileUrl && !file.fileUrl.toLowerCase().includes("no.jpg")) {
        map.set(productId, true);
      }
    });
    console.log("📸 Фото есть у продуктов:", Array.from(map.keys()));
    return map;
  }, [productFiles]);


  // Функция открытия предпросмотра
  const handleOpenPreview = (productId: number) => {
    const related = productFiles
      .filter(
        (f) =>
          (f.product?.id === productId || f.productId === productId) &&
          f.fileUrl &&
          !f.fileUrl.toLowerCase().includes("no.jpg")
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
      prev === 0 ? currentPhotos.length - 1 : prev - 1
    );
  const handleNextPhoto = () =>
    setCurrentPhotoIndex((prev) =>
      prev === currentPhotos.length - 1 ? 0 : prev + 1
    );

  return (
    <Box sx={{ p: 0, m: 0, width: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", }}>

      {/* Верхняя панель */}
      <Box sx={pageToolbarStyle}>
        <Box display="flex" gap={2}>
          <FormControl sx={{ minWidth: 200, backgroundColor: "white" }}>
            <InputLabel id="category-select-label">Kategorie</InputLabel>
            <Select
              labelId="category-select-label"
              value={selectedCategoryId ?? ""}
              label="Kategorie"
              onChange={handleCategoryChange}>
              <MenuItem value="">Alle Kategorien</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Поиск */}
          <SearchBox
            value={searchTerm}
            onChange={handleSearchChange}
            onClear={handleClearSearch}
          />
        </Box>
      </Box>

      {/* Таблица */}
      <Box sx={{ width: "100%", maxWidth: "100%", overflowX: "auto", mb: 2 }}>
        <TableContainer component={Paper} sx={{ ...tableContainerStyle, mt: 1 }}>
          <Table sx={tableStyle}>
            <StyledTableHead>
              <TableRow>
                
                <TableCell align="center" sx={fixedCellWidth(50)} />
                {/* ===== NAME ===== */}
                 <TableCell sx={{ width: "30%" }}>
                  <SortableHeader
                    title="Name"
                    field="name"
                    activeSort={[sort]}
                    onSort={handleSort}
                  />
                </TableCell>

                {/* ===== ARTICLE ===== */}
                <TableCell sx={fixedCellWidth(150)}>
                  <SortableHeader
                    title="Artikel Nr"
                    field="article"
                    activeSort={[sort]}
                    onSort={handleSort}
                  />
                </TableCell>

                {/* ===== VENDOR ARTICLE ===== */}
                <TableCell align="center" sx={fixedCellWidth(150)}>
                  <SortableHeader
                    title="Lieferanten Nr"
                    field="vendorArticle"
                    activeSort={[sort]}
                    onSort={handleSort}
                    align="center"
                  />
                </TableCell>
                <TableCell align="center" sx={fixedCellWidth(90)}>EK preis</TableCell>
                <TableCell align="center" sx={fixedCellWidth(90)}>VK preis</TableCell>
                <TableCell align="center" sx={fixedCellWidth(80)}>ME</TableCell>
                <TableCell align="center" sx={fixedCellWidth(75)}>Gewicht, kg</TableCell>
                <TableCell align="center" sx={fixedCellWidth(55)}>Auf Lager</TableCell>
                <TableCell align="center" sx={{ width: "18%" }}>Kategorie</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => {
                  const hasPhoto = photoMap.get(product.id) === true;

                  return (
                    <TableRow
                      key={product.id}
                      sx={tableRowHoverStyle}
                      onDoubleClick={() => {
                        // сохраняем позицию скролла перед уходом
                        sessionStorage.setItem("products_scrollY", window.scrollY.toString());
                        navigate(`/product-card/${product.id}`);
                      }}
                    >
                      
                      <TableCell align="center" sx={productPhotoCellStyle}>
                        {hasPhoto ? (
                          <Tooltip title="Foto ansehen">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPreview(product.id);
                              }}
                            >
                              <PhotoCameraIcon sx={{ color: colors.accent, "&:hover": { color: colors.gradientLight, }, }} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Kein Foto">
                            <NoPhotographyIcon sx={{ color: colors.grey }} />
                          </Tooltip>
                        )}
                      </TableCell>
                      
                      <TableCell
                        sx={{
                          ...hoverExpandCellStyle,
                          ...leftBorderCellStyle,
                          width: "30%",
                        }}
                      >
                        <HoverExpandText text={product.name ?? ""} maxWidth={360} hoverBgColor="#f5f5f5"  />
                      </TableCell>
                      <TableCell sx={{ ...cellStyle, ...fixedCellWidth(150), }}>{product.article}</TableCell>
                      <TableCell sx={{ ...cellStyle, ...fixedCellWidth(150), }}>{product.vendorArticle}</TableCell>
                      <TableCell sx={{ ...cellStyle, ...fixedCellWidth(90), textAlign: "right", }}>{formatNumber(product.purchasingPrice)} €</TableCell>
                      <TableCell sx={{ ...cellStyle, ...fixedCellWidth(90), textAlign: "right", }}>{formatNumber(product.sellingPrice)} €</TableCell>
                      <TableCell sx={{ ...cellStyle, ...fixedCellWidth(80), }}>{product.unitOfMeasurement.name}</TableCell>
                      <TableCell sx={{ ...cellStyle, ...fixedCellWidth(75), }}>{product.weight ? formatNumber(product.weight) : ""} </TableCell>
                      <TableCell sx={{ ...cellStyle, ...fixedCellWidth(55), }} align="right">{getStockQuantity(product) === null ? " " : formatNumber(getStockQuantity(product) ?? 0)}</TableCell>
                      <TableCell sx={{ ...hoverExpandCellStyle, width: "18%" }}>
                        <HoverExpandText text={product.productCategory?.name ?? ""} maxWidth={160} hoverBgColor={colors.tableHover} />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center">Keine Produkte gefunden</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Пагинация */}
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={totalPages} // Используем количество страниц из состояния
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
