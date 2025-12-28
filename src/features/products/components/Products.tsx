import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Box, Pagination,
  TextField,
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
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import ClearIcon from "@mui/icons-material/Clear";
import debounce from "lodash.debounce";
import { selectIsAuthenticated } from "../../auth/authSlice";
import { getProductCategories, selectProductCategories } from "../productCategoriesSlice";
import { useSearchParams } from "react-router-dom";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { getWarehouseStocks, selectWarehouseStocks } from "../../warehouse/warehouseSlice";
import { getAllProductFiles, selectProductFiles } from "../productFilesSlice";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import NoPhotographyIcon from "@mui/icons-material/NoPhotography";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import Tooltip from "@mui/material/Tooltip";


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
  overflow: "hidden",  // обрезаем всё, что не помещается
  textOverflow: "ellipsis",  // добавляем "..."
  borderRight: "1px solid #ddd",
  padding: "6px 12px",
};


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

  const handleSort = (field: string, direction: "asc" | "desc") => {
    const nextSort = direction === "desc" ? `${field},desc` : field;
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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        sx={{
          position: "sticky", // Сделаем панель фиксированной
          top: 0, // Закрепим сверху
          zIndex: 1000, // Повышаем приоритет на случай, если другие элементы будут сверху
          pl: 0,
          pr: { xs: 1, sm: 2 },
        }}
      >
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 200, backgroundColor: "white" }}>
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

          <TextField
            id="search-input"
            label="Suche"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ width: 400, backgroundColor: "white" }}
          />
          <IconButton aria-label="Suche zurücksetzen" onClick={handleClearSearch}>
            <ClearIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Таблица */}
      <Box sx={{ width: "100%", maxWidth: "100%", overflowX: "auto", mb: 2 }}>
        <TableContainer component={Paper} sx={{ mt: 1, ml: 0 }}>
          <Table>
            <StyledTableHead>
              <TableRow>
                <TableCell style={{ display: "none" }}>ID</TableCell>
                <TableCell align="center"></TableCell>
                {/* ===== NAME ===== */}
                <TableCell sx={{ userSelect: "none" }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <span style={{ cursor: "default" }}>Name</span>
                    <Box display="flex" flexDirection="column" ml={0.5} >
                      <ArrowDropUpIcon
                        fontSize="small"
                        onClick={() => handleSort("name", "asc")}
                        sx={{
                          cursor: "pointer",
                          color: sort === "name" ? "#00CBD0" : "#FFFFFF",
                          "&:hover": { color: "#00CBD0" },
                        }}
                      />
                      <ArrowDropDownIcon
                        fontSize="small"
                        onClick={() => handleSort("name", "desc")}
                        sx={{
                          cursor: "pointer",
                          color: sort === "name,desc" ? "#00CBD0" : "#FFFFFF",
                          "&:hover": { color: "#00CBD0" },
                        }}
                      />
                    </Box>
                  </Box>
                </TableCell>

                {/* ===== ARTICLE ===== */}
                <TableCell align="center" sx={{ userSelect: "none" }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <span style={{ cursor: "default" }}>Artikel Nr</span>
                    <Box display="flex" flexDirection="column" ml={0.5} >
                      <ArrowDropUpIcon
                        fontSize="small"
                        onClick={() => handleSort("article", "asc")}
                        sx={{
                          cursor: "pointer",
                          color: sort === "article" ? "#00CBD0" : "#FFFFFF",
                          "&:hover": { color: "#00CBD0" },
                        }}
                      />
                      <ArrowDropDownIcon
                        fontSize="small"
                        onClick={() => handleSort("article", "desc")}
                        sx={{
                          cursor: "pointer",
                          color: sort === "article,desc" ? "#00CBD0" : "#FFFFFF",
                          "&:hover": { color: "#00CBD0" },
                        }}
                      />
                    </Box>
                  </Box>
                </TableCell>

                {/* ===== VENDOR ARTICLE ===== */}
                <TableCell align="center" sx={{ userSelect: "none" }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <span style={{ cursor: "default" }}>Lieferanten Nr</span>
                    <Box display="flex" flexDirection="column" ml={0.5} >
                      <ArrowDropUpIcon
                        fontSize="small"
                        onClick={() => handleSort("vendorArticle", "asc")}
                        sx={{
                          cursor: "pointer",
                          color: sort === "vendorArticle" ? "#00CBD0" : "#FFFFFF",
                          "&:hover": { color: "#00CBD0" },
                        }}
                      />
                      <ArrowDropDownIcon
                        fontSize="small"
                        onClick={() => handleSort("vendorArticle", "desc")}
                        sx={{
                          cursor: "pointer",
                          color: sort === "vendorArticle,desc" ? "#00CBD0" : "#FFFFFF",
                          "&:hover": { color: "#00CBD0" },
                        }}
                      />
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="center">EK preis</TableCell>
                <TableCell align="center">VK preis</TableCell>
                <TableCell align="center">ME</TableCell>
                <TableCell align="center">Gewicht, kg</TableCell>
                <TableCell align="center">Auf Lager</TableCell>
                <TableCell align="center">Kategorie</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => {
                  const hasPhoto = photoMap.get(product.id) === true;

                  return (
                    <TableRow
                      key={product.id}
                      hover
                      sx={{
                        cursor: "pointer",
                        transition: "background-color 0.2s ease",
                        "&:hover": {
                          backgroundColor: "rgba(0, 100, 255, 0.08)", // светло-синий при hover
                        },
                      }}
                      onDoubleClick={() => {
                        // сохраняем позицию скролла перед уходом
                        sessionStorage.setItem("products_scrollY", window.scrollY.toString());
                        navigate(`/product-card/${product.id}`);
                      }}
                    >
                      <TableCell align="center" sx={{ ...cellStyle, maxWidth: 80, borderLeft: "1px solid #ddd" }}>
                        {hasPhoto ? (
                          <Tooltip title="Foto ansehen">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPreview(product.id);
                              }}
                            >
                              <PhotoCameraIcon sx={{ color: "#00CBD0" }} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Kein Foto">
                            <NoPhotographyIcon sx={{ color: "#888" }} />
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell style={{ display: "none", padding: "6px 12px" }}>{product.id}</TableCell>
                      <TableCell sx={{ ...cellStyle, maxWidth: 400, borderLeft: "1px solid #ddd", }}>{product.name}</TableCell>
                      <TableCell sx={{ ...cellStyle, maxWidth: 150, }}>{product.article}</TableCell>
                      <TableCell sx={{ ...cellStyle, maxWidth: 150 }}>{product.vendorArticle}</TableCell>
                      <TableCell sx={{ ...cellStyle, textAlign: "right", maxWidth: 100 }}>{formatNumber(product.purchasingPrice)} €</TableCell>
                      <TableCell sx={{ ...cellStyle, textAlign: "right", maxWidth: 100 }}>{formatNumber(product.sellingPrice)} €</TableCell>
                      <TableCell sx={{ ...cellStyle }}>{product.unitOfMeasurement.name}</TableCell>
                      <TableCell sx={{ ...cellStyle, maxWidth: 80 }}>{product.weight ? formatNumber(product.weight) : ""} </TableCell>
                      <TableCell sx={{ ...cellStyle }} align="right">{getStockQuantity(product) === null ? " " : formatNumber(getStockQuantity(product) ?? 0)}</TableCell>
                      <TableCell sx={{ ...cellStyle, maxWidth: 180 }}>{product.productCategory?.name}</TableCell>
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
