import { useEffect, useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";

import DraggableDialog from "../../../components/DraggableDialog";
import DialogTitleText from "../../../components/DialogTitleText";

import {
  outlinedButtonStyle,
  primaryButtonStyle,
} from "../../../styles/buttonStyles";

import { handleApiError } from "../../../utils/errors/handleApiError";
import { showSuccessToast } from "../../../utils/toast";

import {
  fetchUpdateProductArticle,
  fetchSimilarProductsForUpdate,
} from "../api";

import { ProductPickDto } from "../types";

import ProductDuplicateWarningDialog from "./ProductDuplicateWarningDialog";

import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  getProductCategories,
  selectProductCategories,
} from "../productCategoriesSlice";
import { invalidateProducts } from "../productsSlice";

type EditGeneratedArticleProps = {
  open: boolean;
  productId: number;
  productName: string;
  generatedArticle: string;
  onClose: () => void;
};

export default function EditGeneratedArticle({
  open,
  productId,
  productName,
  generatedArticle,
  onClose,
}: EditGeneratedArticleProps) {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectProductCategories);

  const [article, setArticle] = useState(generatedArticle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [similarProducts, setSimilarProducts] = useState<ProductPickDto[]>([]);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [pendingArticle, setPendingArticle] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setArticle(generatedArticle);
      setError("");
      setSimilarProducts([]);
      setDuplicateDialogOpen(false);
      setPendingArticle(null);
    }
  }, [open, generatedArticle]);

  useEffect(() => {
    if (open && categories.length === 0) {
      dispatch(getProductCategories());
    }
  }, [open, categories.length, dispatch]);

  const saveArticle = async (newArticle: string) => {
    try {
      setLoading(true);

      await fetchUpdateProductArticle(productId, newArticle);

      dispatch(invalidateProducts());

      showSuccessToast(
        "Erfolg",
        `Die Artikelnummer von ${productName} wurde aktualisiert.`,
      );

      setDuplicateDialogOpen(false);
      setPendingArticle(null);
      onClose();
    } catch (err) {
      handleApiError(
        err,
        "Die Artikelnummer konnte nicht aktualisiert werden.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (loading) return;

    const trimmedArticle = article.trim();

    if (!trimmedArticle) {
      setError("Bitte geben Sie eine Artikelnummer ein.");
      return;
    }

    if (trimmedArticle.length > 30) {
      setError("Die Artikelnummer darf maximal 30 Zeichen enthalten.");
      return;
    }

    if (trimmedArticle === generatedArticle) {
      onClose();
      return;
    }

    try {
      setLoading(true);

      const similar = await fetchSimilarProductsForUpdate(
        productId,
        undefined,
        trimmedArticle,
        undefined,
      );

      if (similar.length > 0) {
        setSimilarProducts(similar);
        setPendingArticle(trimmedArticle);
        setDuplicateDialogOpen(true);
        return;
      }

      setLoading(false);
      await saveArticle(trimmedArticle);
    } catch (err) {
      handleApiError(err, "Die Artikelnummer konnte nicht geprüft werden.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDuplicateDialog = () => {
    if (loading) return;

    setDuplicateDialogOpen(false);
    setSimilarProducts([]);
    setPendingArticle(null);
  };

  const handleSaveAnyway = async () => {
    if (!pendingArticle || loading) return;

    await saveArticle(pendingArticle);
  };

  return (
    <>
      <DraggableDialog
        open={open && !duplicateDialogOpen}
        onClose={loading ? undefined : onClose}
        dialogWidth={450}
        maxWidth={false}
        title={<DialogTitleText>Artikelnummer bearbeiten</DialogTitleText>}
        actions={
          <>
            <Button
              variant="outlined"
              sx={outlinedButtonStyle}
              onClick={onClose}
              disabled={loading}
            >
              Übernehmen
            </Button>

            <Button
              variant="contained"
              sx={primaryButtonStyle}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Speichern..." : "Speichern"}
            </Button>
          </>
        }
      >
        <Box sx={{ mt: 2 }}>
          <Typography sx={{ mb: 2 }}>
            Das Produkt <strong>{productName}</strong> wurde erfolgreich
            erstellt. Die Artikelnummer wurde automatisch generiert. Sie können
            diese übernehmen oder ändern.
          </Typography>

          <TextField
            label="Artikelnummer"
            fullWidth
            autoFocus
            value={article}
            onChange={(e) => {
              setArticle(e.target.value);
              setError("");
            }}
            error={Boolean(error)}
            helperText={error}
            disabled={loading}
            slotProps={{
              htmlInput: {
                maxLength: 30,
              },
            }}
          />
        </Box>
      </DraggableDialog>

      <ProductDuplicateWarningDialog
        open={duplicateDialogOpen}
        products={similarProducts}
        categories={categories}
        confirmText="Trotzdem speichern"
        message={
          "Es wurden bereits Produkte mit derselben Artikelnummer gefunden.\n" +
          "Möchten Sie die Artikelnummer trotzdem speichern?"
        }
        loading={loading}
        onCancel={handleCloseDuplicateDialog}
        onConfirm={handleSaveAnyway}
      />
    </>
  );
}
