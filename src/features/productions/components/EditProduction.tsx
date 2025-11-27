import { useEffect, useMemo, useState } from 'react';
import {
  Box, TextField, Button, Typography, IconButton,
  Table, TableHead,
  TableRow, TableCell, TableBody, Autocomplete,
  Grid,
  styled,
  Paper,
  InputAdornment,
  Container,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Product } from '../../products/types';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { ClearIcon, DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/de';
import { deDE } from '@mui/x-date-pickers/locales';
import { getProducts } from '../../products/productsSlice';
import { selectProductCategories } from '../../products/productCategoriesSlice';

import { handleApiError } from '../../../utils/handleApiError';
import { showSuccessToast } from '../../../utils/toast';
import { NewProductionDto, NewProductionItemDto, ProductionItem } from '../types';
import { getProductionById, updateProduction } from '../productionsSlice';
import { useNavigate, useParams } from 'react-router-dom';

const StyledTableHead = styled(TableHead)(({
  backgroundColor: "#1a3d6d",
  "& th": {
    position: "sticky",
    top: 0,
    backgroundColor: "#1a3d6d",
    color: "white",
    fontWeight: "bold",
    borderRight: "1px solid #ddd",
    textAlign: "center",
    zIndex: 1,
  },
}));
const StyledTableRow = styled(TableRow)({
  "&:hover": {
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
  },
});


export default function EditProduction() {

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { productionId } = useParams<{ productionId: string }>();
  const id = Number(productionId);

  const products = useAppSelector((state) => state.products.productsList);
  const categories = useAppSelector(selectProductCategories);


  const [production, setProduction] = useState<NewProductionDto>({
    productId: 0,
    dateOfProduction: "",
    type: "PRODUKTION",
    quantity: 0,
    unitPrice: 0,
    amount: 0,
    productionItems: [],
    productArticle: "",
    productName: "",
  });

  const [dateValue, setDateValue] = useState<Dayjs | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    dispatch(getProducts({ page: 0, size: 100 })).unwrap().catch(console.error);
  }, [dispatch]);

  useEffect(() => {
    dispatch(getProductionById(id))
      .unwrap()
      .then((p) => {
        setProduction({
          productId: p.productId,
          dateOfProduction: p.dateOfProduction,
          type: p.type,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          amount: p.amount,
          productArticle: p.productArticle,
          productName: p.productName,

          productionItems: p.productionItems.map((item: ProductionItem) => ({
            id: item.id,
            productionId: id,
            productId: item.productId,
            productArticle: item.productArticle,
            productName: item.productName,
            type: item.type,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        });
        setDateValue(p.dateOfProduction ? dayjs(p.dateOfProduction) : null);
      })
      .catch((error) => handleApiError(error, "Fehler beim Laden der Herstellung."));
  }, [dispatch, id]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return products
      .filter((p) =>
        (term === "" ||
          p.name.toLowerCase().includes(term) ||
          p.article?.toLowerCase().includes(term)) &&
        (selectedCategory === null || p.productCategory.id === selectedCategory)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, searchTerm, selectedCategory]);

  // Итоги
  const materialsTotal = production.productionItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const productTotal = production.quantity * production.unitPrice;
  const margin = productTotal - materialsTotal;
  const marginPercent = productTotal > 0 ? (margin / productTotal) * 100 : 0;

  const handleAddProductAsMain = (product: Product) => {
    setProduction((prev) => ({
      ...prev,
      productId: product.id,
      unitPrice: product.sellingPrice,
      amount: prev.quantity * product.sellingPrice,
    }));
  };

  const handleAddProductAsMaterial = (product: Product) => {
    const item: NewProductionItemDto = {
      productionId: id, // <- используем id из useParams()
      productId: product.id,
      type: "PRODUKTIONSMATERIAL",
      quantity: 1,
      unitPrice: product.purchasingPrice,
      totalPrice: product.purchasingPrice,
    };
    setProduction((prev: any) => ({
      ...prev,
      productionItems: [...prev.productionItems, item],
    }));
  };

  const handleMainChange = (field: "quantity" | "unitPrice", value: number) => {
    setProduction((prev) => {
      const updated = { ...prev, [field]: value };
      updated.amount = updated.quantity * updated.unitPrice;
      return updated;
    });
  };

  const handleItemChange = (index: number, field: "quantity" | "unitPrice", value: number) => {
    setProduction((prev: any) => {
      const updatedItems = [...prev.productionItems];
      const currentItem = { ...updatedItems[index], [field]: value };
      currentItem.totalPrice = currentItem.quantity * currentItem.unitPrice;
      updatedItems[index] = currentItem;
      return { ...prev, productionItems: updatedItems };
    });
  };

  const handleRemoveItem = (index: number) => {
    setProduction((prev: NewProductionDto) => ({
      ...prev,
      productionItems: prev.productionItems.filter(
        (_: NewProductionItemDto, i: number) => i !== index
      ),
    }));
  };

  const handleSubmit = () => {
    if (!production.productId) {
      handleApiError(new Error("Bitte wählen Sie ein Hauptprodukt."));
      return;
    }
    if (!production.dateOfProduction) {
      handleApiError(new Error("Bitte wählen Sie ein Datum."));
      return;
    }

    const payload: NewProductionDto = {
      productId: production.productId,
      dateOfProduction: production.dateOfProduction,
      type: production.type,
      quantity: production.quantity,
      unitPrice: production.unitPrice,
      amount: production.quantity * production.unitPrice,
      productionItems: production.productionItems
        .filter((item) => item.quantity > 0) // исключаем нулевые позиции
        .map((item) => ({
          productionId: id,
          productId: item.productId,
          type: "PRODUKTIONSMATERIAL",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
    };

    dispatch(updateProduction({ id, updatedProduction: payload }))
      .unwrap()
      .then(() => {
        showSuccessToast("Erfolg", "Herstellung erfolgreich aktualisiert.");
        navigate("/productions");
      })
      .catch((error) =>
        handleApiError(error, "Die Herstellung konnte nicht aktualisiert werden.")
      );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3 }}>
      <Grid container spacing={3} sx={{ p: 2 }}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              {/* Дата */}
              <Grid item xs={4}>
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="de"
                  localeText={deDE.components.MuiLocalizationProvider.defaultProps.localeText}
                >
                  <DatePicker
                    label="Datum"
                    value={dateValue}
                    onChange={(newValue) => {
                      setDateValue(newValue);
                      setProduction((prev) => ({
                        ...prev,
                        dateOfProduction: newValue ? newValue.format("YYYY-MM-DD") : "",
                      }));
                    }}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
            </Box>

            {/* Таблица произведённого товара */}
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ color: "#00acc1", mb: 2, textAlign: 'left', fontWeight: "bold", textDecoration: 'underline', }}>
                Produziertes Produkt
              </Typography>
              <Table size="small">
                <StyledTableHead>
                  <TableRow>
                    <TableCell>Artikel</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Menge</TableCell>
                    <TableCell>Preis</TableCell>
                    <TableCell>Summe</TableCell>
                  </TableRow>
                </StyledTableHead>
                <TableBody>
                  <StyledTableRow>
                    <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd", borderLeft: "1px solid #ddd" }}>
                      {production.productArticle ?? "—"}
                    </TableCell>
                    <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd" }}>
                      {production.productName ?? "—"}
                    </TableCell>
                    <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd", width: 100 }}>
                      <TextField
                        type="number"
                        variant="standard"
                        size="small"
                        value={production.quantity}
                        onChange={(e) => handleMainChange("quantity", parseFloat(e.target.value))}
                        InputProps={{ disableUnderline: true }}
                        inputProps={{ 'aria-label': 'Menge', min: 0, step: 0.01 }}
                        sx={{
                          fontSize: '0.875rem',
                          '& .MuiInputBase-root': { border: 'none' },
                          '& .MuiInputBase-input': { fontSize: '0.875rem', padding: 0, textAlign: 'center' },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd", width: 150 }}>
                      <TextField
                        type="number"
                        variant="standard"
                        size="small"
                        value={production.unitPrice}
                        onChange={(e) =>
                          handleMainChange("unitPrice", parseFloat(e.target.value))}
                        InputProps={{ disableUnderline: true }}
                        inputProps={{ 'aria-label': 'Einzelpreis', min: 0, step: 0.01 }}
                        sx={{
                          fontSize: '0.875rem',
                          '& .MuiInputBase-root': { border: 'none' },
                          '& .MuiInputBase-input': { fontSize: '0.875rem', padding: 0, textAlign: 'center' },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd", width: 150, textAlign: 'right' }}>{production.amount.toFixed(2)}</TableCell>
                  </StyledTableRow>
                </TableBody>
              </Table>
            </Box>

            {/* Таблица материалов */}
            <Box sx={{ mt: 5, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ color: "#00acc1", mb: 2, textAlign: 'left', fontWeight: "bold", textDecoration: 'underline', }}>
                Materialien
              </Typography>
              <Table size="small">
                <StyledTableHead>
                  <TableRow>
                    <TableCell>Artikel</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Menge</TableCell>
                    <TableCell>Preis</TableCell>
                    <TableCell>Summe</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </StyledTableHead>
                <TableBody>
                  {production.productionItems.map((item, index) => (
                    <StyledTableRow key={index}>
                      <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd", borderLeft: "1px solid #ddd" }}>
                        {item.productArticle}
                      </TableCell>

                      <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd" }}>
                        {item.productName}
                      </TableCell>

                      <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd", width: 100 }}>
                        <TextField
                          type="number"
                          variant="standard"
                          size="small"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", parseFloat(e.target.value))
                          }
                          InputProps={{ disableUnderline: true }}
                          inputProps={{ 'aria-label': 'Menge', min: 0, step: 0.01 }}
                          sx={{
                            fontSize: '0.875rem',
                            '& .MuiInputBase-root': { border: 'none' },
                            '& .MuiInputBase-input': { fontSize: '0.875rem', padding: 0, textAlign: 'center' },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd", width: 150 }}>
                        <TextField
                          type="number"
                          variant="standard"
                          size="small"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(index, "unitPrice", parseFloat(e.target.value))
                          }
                          InputProps={{ disableUnderline: true }}
                          inputProps={{ 'aria-label': 'Einzelpreis', min: 0, step: 0.01 }}
                          sx={{
                            fontSize: '0.875rem',
                            '& .MuiInputBase-root': { border: 'none' },
                            '& .MuiInputBase-input': { fontSize: '0.875rem', padding: 0, textAlign: 'center' },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd", width: 150, textAlign: 'right' }}>
                        {item.totalPrice.toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ padding: "6px 6px", borderRight: "1px solid #ddd", width: 50 }}>
                        <IconButton onClick={() => handleRemoveItem(index)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2, textAlign: "left" }}>
              {/* Итоги слева */}
              <Grid item xs={8}>
                <Box sx={{ pt: 2, mt: 2 }}>
                  <Typography>
                    Materialien: <b>{materialsTotal.toFixed(2)}</b>
                  </Typography>
                  <Typography>
                    Produziertes Produkt: <b>{productTotal.toFixed(2)}</b>
                  </Typography>
                  <Typography color={margin >= 0 ? "success.main" : "error.main"}>
                    Marge: <b>{margin.toFixed(2)}</b> ({marginPercent.toFixed(2)}%)
                  </Typography>
                </Box>
              </Grid>

              {/* Кнопки справа */}
              <Grid item xs={4}>
                <Box sx={{ mt: 8, textAlign: "right" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                  >
                    Aktualisieren
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Фильтрация и выбор продуктов */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography sx={{ color: "#00acc1", mb: 2, textAlign: 'left', fontWeight: "bold" }}>Produkte hinzufügen</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TextField
                  label="Suche"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  fullWidth
                  InputProps={{
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setSearchTerm("")}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <Autocomplete
                  options={categories}
                  getOptionLabel={(option) => option.name}
                  onChange={(_, value) => setSelectedCategory(value?.id ?? null)}
                  value={categories.find((c) => c.id === selectedCategory) || null}
                  renderInput={(params) => (
                    <TextField {...params} label="Kategorie" fullWidth />
                  )}
                />
              </Grid>
            </Grid>

            <Box sx={{ height: 200, overflowY: "auto", mt: 2 }}>
              <Table size="small">
                <StyledTableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Artikel</TableCell>
                    <TableCell>Aktionen</TableCell>
                  </TableRow>
                </StyledTableHead>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <StyledTableRow key={product.id}>
                      <TableCell sx={{ borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd" }}>{product.name}</TableCell>
                      <TableCell sx={{ borderRight: "1px solid #ddd" }}>{product.article}</TableCell>
                      <TableCell sx={{ borderRight: "1px solid #ddd", width: 240 }}>
                        <Button
                          size="small"
                          onClick={() => handleAddProductAsMain(product)}
                          sx={{
                            backgroundColor: "transparent",
                            "&:hover": {
                              color: "#C91959",
                            },
                          }}
                        >
                          Als Produkt
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleAddProductAsMaterial(product)}
                          sx={{
                            backgroundColor: "transparent",
                            "&:hover": {
                              color: "#C91959",
                            },
                          }}
                        >
                          Als Material
                        </Button>
                      </TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}