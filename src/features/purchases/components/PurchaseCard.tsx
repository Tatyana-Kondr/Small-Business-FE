import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
  Autocomplete,
  InputLabel,
  SelectChangeEvent,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { Delete as DeleteIcon, Clear as ClearIcon } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { deDE } from "@mui/x-date-pickers/locales";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { NewPurchaseDto, NewPurchaseItemDto, TypeOfDocument } from "../types";
import {
  getProductCategories,
  selectProductCategories,
} from "../../products/productCategoriesSlice";
import {
  getPickProducts,
  selectPickLoading,
  selectPickProducts,
} from "../../products/productsSlice";
import { getPurchaseById, updatePurchase } from "../purchasesSlice";
import {
  getCustomersPickList,
  selectCustomersPickList,
  selectLoadingPick,
} from "../../customers/customersSlice";
import { ProductPickDto } from "../../products/types";
import { handleApiError } from "../../../utils/handleApiError";
import { showSuccessToast } from "../../../utils/toast";
import {
  getDocumentTypes,
  selectTypeOfDocuments,
} from "../typeOfDocumentSlice";
import CompactNumberCell from "../../../components/CompactNumberCell";
import {
  cancelButtonStyle,
  primaryButtonStyle,
} from "../../../styles/buttonStyles";
import {
  actionCellStyle,
  cellStyle,
  centerCellStyle,
  fixedCellWidth,
  rightCellStyle,
  saleTableNameCellStyle,
  saleTableNameInputStyle,
  StyledTableHead,
  tableRowHoverStyle,
} from "../../../styles/tableStyles";
import { colors } from "../../../styles/colors";
import { saleDateFieldStyle } from "../../../styles/formStyles";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { deletePurchaseDocument, getPurchaseDocuments, selectPurchaseDocuments, selectPurchaseDocumentsLoading, uploadPurchaseDocument } from "../purchaseDocumentsSlice";
import { openPurchaseDocument } from "../api";

const typeOptions = ["EINKAUF", "LIEFERANT_RABATT"] as const;
type PurchaseType = (typeof typeOptions)[number];

export default function PurchaseCard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const id = Number(purchaseId);

  const [purchase, setPurchase] = useState<NewPurchaseDto>({
    vendorId: 0,
    vendorName: "",
    purchasingDate: "",
    type: "EINKAUF",
    documentId: 0,
    documentNumber: "",
    purchaseItems: [],
    paymentStatus: "",
  });
  const [dateValue, setDateValue] = useState<Dayjs | null>(null);
  const vendorsPick = useAppSelector(selectCustomersPickList);
  const vendorsPickLoading = useAppSelector(selectLoadingPick);
  const categories = useAppSelector(selectProductCategories);
  const pickProducts = useAppSelector(selectPickProducts);
  const pickLoading = useAppSelector(selectPickLoading);
  const documentTypes = useAppSelector(selectTypeOfDocuments);
  const purchaseDocuments = useAppSelector(selectPurchaseDocuments);
const purchaseDocumentsLoading = useAppSelector(selectPurchaseDocumentsLoading);

const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  useEffect(() => {
    dispatch(getDocumentTypes());
  }, [dispatch]);

  useEffect(() => {
    // Загрузка поставщиков
    dispatch(getCustomersPickList())
      .unwrap()
      .catch((error) =>
        handleApiError(error, "Fehler beim Laden der Lieferanten."),
      );

    // Загрузка данных покупки
    dispatch(getPurchaseById(Number(purchaseId)))
      .unwrap()
      .then((p) => {
        setPurchase({
          vendorId: p.vendorId,
          vendorName: p.vendorName,
          purchasingDate: p.purchasingDate,
          type: p.type,
          documentId: p.document?.id ?? 0,
          document: p.document,
          documentNumber: p.documentNumber,
          purchaseItems: p.purchaseItems,
          paymentStatus: p.paymentStatus,
        });
        setDateValue(p.purchasingDate ? dayjs(p.purchasingDate) : null);
      })
      .catch((error) =>
        handleApiError(error, "Fehler beim Laden der Bestellung."),
      );

    dispatch(getProductCategories());
  }, [dispatch, purchaseId]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedTerm(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    dispatch(
      getPickProducts({
        searchTerm: debouncedTerm,
        categoryId: selectedCategory ?? null,
        limit: 50,
      }),
    );
  }, [dispatch, debouncedTerm, selectedCategory]);

  useEffect(() => {
    setSearchTerm("");
  }, [selectedCategory]);

  useEffect(() => {
  if (!id || Number.isNaN(id)) return;

  dispatch(getPurchaseDocuments(id))
    .unwrap()
    .catch((error) =>
      handleApiError(
        error,
        "Fehler beim Laden der Dokumente."
      )
    );
}, [dispatch, id]);

  const { subtotal, taxSum, total } = useMemo(() => {
    if (!purchase.purchaseItems || purchase.purchaseItems.length === 0) {
      return { subtotal: 0, taxSum: 0, total: 0 };
    }

    let subtotal = 0;
    let taxSum = 0;
    let total = 0;

    for (const item of purchase.purchaseItems) {
      subtotal += item.totalPrice;
      taxSum += item.taxAmount;
      total += item.totalAmount;
    }

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxSum: parseFloat(taxSum.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  }, [purchase.purchaseItems]);

  const handleUploadDocument = async () => {
  if (!documentFile) {
    handleApiError(
      new Error("Bitte wählen Sie zuerst eine Datei aus.")
    );
    return;
  }

  try {
    await dispatch(
      uploadPurchaseDocument({
        purchaseId: id,
        file: documentFile,
        documentName:
          purchase?.document?.name ?? "Dokument",
        vendorName:
          purchase?.vendorName ?? "Lieferant",
        purchaseDate:
          purchase?.purchasingDate ?? "Datum",
      })
    ).unwrap();

    setDocumentFile(null);

    showSuccessToast(
      "Erfolg",
      "Dokument erfolgreich hochgeladen"
    );
  } catch (error) {
    handleApiError(
      error,
      "Dokument konnte nicht hochgeladen werden."
    );
  }
};

const handleDeleteDocument = async (
  documentId: number
) => {
  try {
    await dispatch(
      deletePurchaseDocument(documentId)
    ).unwrap();

    showSuccessToast(
      "Erfolg",
      "Dokument erfolgreich gelöscht"
    );
  } catch (error) {
    handleApiError(
      error,
      "Dokument konnte nicht gelöscht werden."
    );
  }
};

  const handleAddProductToCart = (product: ProductPickDto) => {
    const quantity = 1;
    const unitPrice = product.purchasingPrice;
    const totalPrice = quantity * unitPrice;
    const taxPercentage = 19;
    const taxAmount = (totalPrice * taxPercentage) / 100;
    const totalAmount = totalPrice + taxAmount;

    const item: NewPurchaseItemDto = {
      productId: product.id,
      productName: product.name,
      purchaseId: Number(purchaseId),
      quantity,
      unitPrice,
      totalPrice,
      taxPercentage,
      taxAmount,
      totalAmount,
      position: purchase.purchaseItems.length + 1,
    };

    setPurchase((prev) => ({
      ...prev,
      purchaseItems: [...prev.purchaseItems, item],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setPurchase((prev) => ({
      ...prev,
      purchaseItems: prev.purchaseItems.filter((_, i) => i !== index),
    }));
  };

  const recalculateItem = (item: NewPurchaseItemDto): NewPurchaseItemDto => {
    const quantity = item.quantity ?? 0;
    const unitPrice = item.unitPrice ?? 0;
    const taxPercentage = item.taxPercentage ?? 0;

    const totalPrice = quantity * unitPrice;
    const taxAmount = (totalPrice * taxPercentage) / 100;
    const totalAmount = totalPrice + taxAmount;

    return {
      ...item,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    };
  };

  const handleItemChange = (
    index: number,
    field: keyof NewPurchaseItemDto,
    value: string | number,
  ) => {
    setPurchase((prevPurchase) => {
      const updatedItems = [...prevPurchase.purchaseItems];
      const currentItem = { ...updatedItems[index] };

      if (
        field === "taxPercentage" ||
        field === "quantity" ||
        field === "unitPrice"
      ) {
        const parsedValue = Number(value);
        if (!isNaN(parsedValue)) {
          (currentItem as any)[field] = parsedValue;
        }
      } else {
        (currentItem as any)[field] = value;
      }

      updatedItems[index] = recalculateItem(currentItem);

      return {
        ...prevPurchase,
        purchaseItems: updatedItems,
      };
    });
  };

  const handleSubmit = () => {
    if (!purchase.purchaseItems.length) {
      handleApiError(new Error("Die Bestellung enthält keine Artikel."));
      return;
    }

    if (!purchase.vendorId || !purchase.purchasingDate) {
      handleApiError(
        new Error("Bitte füllen Sie alle Pflichtfelder korrekt aus."),
      );
      return;
    }

    const updatedPurchaseItems = purchase.purchaseItems.map((item, index) => ({
      ...item,
      taxPercentage: item.taxPercentage ?? 0,
      taxAmount:
        (item.unitPrice ?? 0) *
        (item.quantity ?? 0) *
        ((item.taxPercentage ?? 0) / 100),
      totalAmount:
        (item.unitPrice ?? 0) * (item.quantity ?? 0) +
        (item.unitPrice ?? 0) *
          (item.quantity ?? 0) *
          ((item.taxPercentage ?? 0) / 100),
      position: index + 1,
    }));

    const updatedPurchaseToSend: NewPurchaseDto = {
      ...purchase,
      purchaseItems: updatedPurchaseItems,
      documentId: purchase.documentId,
    };

    dispatch(updatePurchase({ id, updatedPurchase: updatedPurchaseToSend }))
      .unwrap()
      .then(() => {
        showSuccessToast("Erfolg", "Bestellung erfolgreich aktualisiert");
        navigate("/purchases");
      })
      .catch((error) =>
        handleApiError(
          error,
          "Die Bestellung konnte nicht aktualisiert werden.",
        ),
      );
  };

  const selectedVendor =
    vendorsPick.find((v) => v.id === purchase.vendorId) ??
    (purchase.vendorName
      ? {
          id: purchase.vendorId,
          name: purchase.vendorName,
          customerNumber: null,
        }
      : null);

  return (
    <Container maxWidth="xl" sx={{ mt: 3 }}>
      <Grid container spacing={3} sx={{ p: 2 }}>
        <Grid item xs={12} md={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h5"
                sx={{ color: "#0277bd", fontWeight: "bold" }}
              >
                {`Bestellung Nr. ${id}`}
              </Typography>

              <Grid item xs={3} sx={{ pl: 2, pb: 2, pt: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="purchase-type-label">
                    Art der Operation
                  </InputLabel>

                  <Select
                    labelId="purchase-type-label"
                    label="Art der Operation"
                    value={purchase.type}
                    onChange={(e) =>
                      setPurchase({
                        ...purchase,
                        type: e.target.value as PurchaseType,
                      })
                    }
                  >
                    {typeOptions.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Box>

            {/* Lieferant */}
<Grid container spacing={2} sx={{ mb: 2 }}>

  {/* LINKS: Bestelldaten */}
  <Grid item xs={12} md={9}>
    <Box
      sx={{
        height: "100%",
      }}
    >
      {/* Lieferant */}
      <Autocomplete
        fullWidth
        loading={vendorsPickLoading}
        options={[...vendorsPick].sort((a, b) =>
          a.name.localeCompare(b.name)
        )}
        getOptionLabel={(option) =>
          option.customerNumber
            ? `${option.name} (${option.customerNumber})`
            : option.name
        }
        isOptionEqualToValue={(option, value) =>
          option.id === value.id
        }
        value={selectedVendor}
        onChange={(_, value) => {
          setPurchase((prev) => ({
            ...prev,
            vendorId: value?.id ?? 0,
            vendorName: value?.name ?? "",
          }));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Lieferant"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {vendorsPickLoading && (
                    <CircularProgress size={18} />
                  )}

                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {/* Datum / Dokument / Dokumentnummer */}
      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid item xs={4}>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="de"
            localeText={
              deDE.components.MuiLocalizationProvider.defaultProps
                .localeText
            }
          >
            <DatePicker
              label="Datum"
              value={dateValue}
              onChange={(newValue) => {
                setDateValue(newValue);

                setPurchase((prev) => ({
                  ...prev,
                  purchasingDate: newValue
                    ? newValue.format("YYYY-MM-DD")
                    : "",
                }));
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  sx: saleDateFieldStyle,
                },
              }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={4}>
          <FormControl fullWidth>
            <InputLabel id="purchase-document-label">
              Dokument
            </InputLabel>

            <Select
              labelId="purchase-document-label"
              label="Dokument"
              value={purchase.documentId || ""}
              onChange={(e: SelectChangeEvent<number>) => {
                const selectedId = Number(e.target.value);

                setPurchase((prev) => ({
                  ...prev,
                  documentId: selectedId,
                }));
              }}
            >
              <MenuItem value="">Bitte wählen</MenuItem>

              {documentTypes.map((doc: TypeOfDocument) => (
                <MenuItem key={doc.id} value={doc.id}>
                  {doc.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={4}>
          <TextField
            label="Dokumentnummer"
            value={purchase.documentNumber}
            onChange={(e) =>
              setPurchase((prev) => ({
                ...prev,
                documentNumber: e.target.value,
              }))
            }
            fullWidth
          />
        </Grid>
      </Grid>
    </Box>
  </Grid>


  {/* RECHTS: Dokumente */}
  <Grid item xs={12} md={3}>
    <Box
      sx={{
        height: "100%",
        minHeight: 118,
        px: 1.5,
        py: 1,
        border: `1px solid ${colors.border}`,
        borderRadius: 1,
        boxSizing: "border-box",
      }}
    >

      {/* Upload */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: purchaseDocuments.length > 0 ? 0.5 : 0,
        }}
      >
        <Button
          variant="outlined"
          component="label"
          size="small"
          startIcon={<UploadFileIcon />}
          sx={{
            flex: 1,
            minWidth: 0,
            whiteSpace: "nowrap",
          }}
        >
          Datei wählen

          <input
            hidden
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setDocumentFile(file);
            }}
          />
        </Button>

        <Button
          variant="contained"
          size="small"
          onClick={handleUploadDocument}
          disabled={!documentFile || purchaseDocumentsLoading}
          sx={{
            minWidth: 42,
            px: 1,
          }}
        >
          <UploadFileIcon fontSize="small" />
        </Button>
      </Box>

      {/* Выбранный файл до загрузки */}
      {documentFile && (
        <Tooltip title={documentFile.name} arrow>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mb: 0.5,
              textAlign: "left",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {documentFile.name}
          </Typography>
        </Tooltip>
      )}

      {purchaseDocumentsLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 0.5,
          }}
        >
          <CircularProgress size={18} />
        </Box>
      )}

      {/* Загруженные документы */}
      {!purchaseDocumentsLoading && (
        <Box
          sx={{
            maxHeight: 72,
            overflowY: "auto",
          }}
        >
          {purchaseDocuments.map((document) => (
            <Box
              key={document.id}
              sx={{
                display: "flex",
                alignItems: "center",
                minHeight: 30,
                borderTop: `1px solid ${colors.border}`,
              }}
            >
              <Tooltip
                title={document.originFileName}
                arrow
              >
                <Typography
                  variant="caption"
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    textAlign: "left",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {document.originFileName}
                </Typography>
              </Tooltip>

              <Tooltip title="Öffnen" arrow>
                <IconButton
                  size="small"
                  onClick={() =>
                    openPurchaseDocument(document.fileUrl)
                  }
                  sx={{ p: 0.4 }}
                >
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Löschen" arrow>
                <IconButton
                  size="small"
                  onClick={() =>
                    handleDeleteDocument(document.id)
                  }
                  sx={{
                    p: 0.4,
                    "&:hover": {
                      color: "#d32f2f",
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))}

          {purchaseDocuments.length === 0 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                textAlign: "left",
                mt: 0.5,
              }}
            >
              Keine Dokumente
            </Typography>
          )}
        </Box>
      )}
    </Box>
  </Grid>

</Grid>

            <Box
              sx={{
                minHeight: 200,
                overflowY: "auto",
                mb: 2,
                border: `1px solid ${colors.border}`,
              }}
            >
              <Table size="small">
                <StyledTableHead>
                  <TableRow>
                    <TableCell sx={{ ...fixedCellWidth(45), fontSize: "12px" }}>
                      Pos
                    </TableCell>
                    <TableCell sx={{ width: "60%" }}>Name</TableCell>
                    <TableCell sx={fixedCellWidth(80)}>Menge</TableCell>
                    <TableCell sx={fixedCellWidth(95)}>Preis</TableCell>
                    <TableCell sx={{ ...fixedCellWidth(75), fontSize: "12px" }}>
                      MWSt%
                    </TableCell>
                    <TableCell sx={fixedCellWidth(95)}>Netto</TableCell>
                    <TableCell sx={fixedCellWidth(95)}>MWSt</TableCell>
                    <TableCell sx={fixedCellWidth(40)}></TableCell>
                  </TableRow>
                </StyledTableHead>

                <TableBody>
                  {purchase.purchaseItems.map((item, index) => (
                    <TableRow key={index} sx={tableRowHoverStyle}>
                      <TableCell
                        sx={{
                          ...centerCellStyle,
                          ...fixedCellWidth(45),
                          borderLeft: `1px solid ${colors.border}`,
                        }}
                      >
                        {index + 1}
                      </TableCell>

                      <TableCell
                        sx={{
                          ...saleTableNameCellStyle,
                          width: "60%",
                          verticalAlign: "middle",
                          py: 1,
                        }}
                      >
                        <TextField
                          variant="standard"
                          multiline
                          minRows={1}
                          maxRows={3}
                          fullWidth
                          value={item.productName}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "productName",
                              e.target.value,
                            )
                          }
                          slotProps={{
                            input: {
                              disableUnderline: true,
                            },
                          }}
                          sx={saleTableNameInputStyle}
                        />
                      </TableCell>

                      <TableCell
                        sx={{
                          ...cellStyle,
                          ...fixedCellWidth(80),
                        }}
                      >
                        <CompactNumberCell
                          value={item.quantity}
                          min={0}
                          step={1}
                          align="center"
                          onChange={(value) =>
                            handleItemChange(index, "quantity", value)
                          }
                        />
                      </TableCell>

                      <TableCell
                        sx={{
                          ...cellStyle,
                          ...fixedCellWidth(95),
                        }}
                      >
                        <CompactNumberCell
                          value={item.unitPrice}
                          min={0}
                          step={0.01}
                          onChange={(value) =>
                            handleItemChange(index, "unitPrice", value)
                          }
                        />
                      </TableCell>

                      <TableCell
                        sx={{
                          ...cellStyle,
                          ...fixedCellWidth(75),
                        }}
                      >
                        <CompactNumberCell
                          value={item.taxPercentage}
                          min={0}
                          max={100}
                          step={1}
                          onChange={(value) =>
                            handleItemChange(index, "taxPercentage", value)
                          }
                        />
                      </TableCell>

                      <TableCell
                        sx={{
                          ...rightCellStyle,
                          ...fixedCellWidth(95),
                        }}
                      >
                        {item.totalPrice.toLocaleString("de-DE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>

                      <TableCell
                        sx={{
                          ...rightCellStyle,
                          ...fixedCellWidth(95),
                        }}
                      >
                        {item.taxAmount.toLocaleString("de-DE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>

                      <TableCell
                        sx={{
                          ...actionCellStyle,
                          ...fixedCellWidth(40),
                        }}
                      >
                        <Tooltip title="Löschen" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveItem(index)}
                            aria-label="Zeile löschen"
                            sx={{
                              p: 0.5,
                              transition: "transform 0.2s ease-in-out",

                              "&:hover": {
                                color: "#d32f2f",
                                transform: "scale(1.2)",
                                backgroundColor: "transparent",
                              },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

                  {purchase.purchaseItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        Keine Artikel vorhanden
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: 3,
                mt: 3,
                mb: 5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                }}
              >
                <Button
                  onClick={() => navigate("/purchases")}
                  sx={cancelButtonStyle}
                >
                  Abbrechen
                </Button>

                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  sx={primaryButtonStyle}
                  disabled={
                    !purchase.vendorId ||
                    !purchase.purchasingDate ||
                    purchase.purchaseItems.length === 0
                  }
                >
                  Aktualisieren
                </Button>
              </Box>

              <Box
                sx={{
                  minWidth: 260,
                  textAlign: "right",
                }}
              >
                <Typography>Netto: {subtotal.toFixed(2)} €</Typography>

                <Typography>MWSt: {taxSum.toFixed(2)} €</Typography>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                  }}
                >
                  Gesamtbetrag: {total.toFixed(2)} €
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <Select
                      value={selectedCategory || ""}
                      onChange={(e) =>
                        setSelectedCategory(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      displayEmpty
                    >
                      <MenuItem value="">Alle Kategorien</MenuItem>
                      {[...categories]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((cat) => (
                          <MenuItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    placeholder="Produktname, Artikel, Lieferanten-Artikel suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setSearchTerm("")}>
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Box
                sx={{
                  maxHeight: 263,
                  overflowY: "auto",
                  mt: 1,
                  border: "1px solid #ddd",
                }}
              >
                {pickLoading && (
                  <Box sx={{ p: 1, textAlign: "center", color: "#00acc1" }}>
                    <CircularProgress size={20} />
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      Produkte werden geladen…
                    </Typography>
                  </Box>
                )}

                {!pickLoading &&
                  pickProducts.length === 0 &&
                  (searchTerm.length >= 2 || selectedCategory !== null) && (
                    <Box
                      sx={{
                        p: 1,
                        textAlign: "center",
                        color: "text.secondary",
                      }}
                    >
                      <Typography variant="caption">
                        Keine Produkte gefunden
                      </Typography>
                    </Box>
                  )}
                <Table size="small">
                  <StyledTableHead>
                    <TableRow>
                      <TableCell>Artikelname</TableCell>
                      <TableCell>Artikel</TableCell>
                      <TableCell>Lieferanten-Artikel</TableCell>
                      <TableCell>Preis</TableCell>
                    </TableRow>
                  </StyledTableHead>
                  <TableBody>
                    {pickProducts.map((product) => (
                      <TableRow
                        key={product.id}
                        sx={tableRowHoverStyle}
                        onDoubleClick={() => handleAddProductToCart(product)}
                      >
                        <TableCell sx={cellStyle}>
                          {product.name}
                        </TableCell>

                        <TableCell sx={cellStyle}>
                          {product.article}
                        </TableCell>

                        <TableCell sx={cellStyle}>
                          {product.vendorArticle ?? ""}
                        </TableCell>

                        <TableCell sx={rightCellStyle}>
                          {product.purchasingPrice.toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!pickLoading && pickProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          Keine Produkte gefunden
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
