import type { ReactNode } from "react";

import { useAppDispatch } from "../../../redux/hooks";
import { deleteProduct } from "../productsSlice";

import { showErrorToast, showSuccessToast } from "../../../utils/toast";
import { getApiErrorMessage } from "../../../utils/errors/handleApiError";

import ConfirmDeleteDialog from "../../../components/ConfirmDeleteDialog";

interface DeleteProductProps {
  productId: number;
  productName: string;
  productArticle: string;
  onSuccessDelete?: () => void;
  trigger?: ReactNode;
}

export default function DeleteProduct({
  productId,
  productName,
  productArticle,
  onSuccessDelete,
  trigger,
}: DeleteProductProps) {
  const dispatch = useAppDispatch();

  const handleDelete = async (): Promise<void> => {
    try {
      await dispatch(deleteProduct(productId)).unwrap();
    } catch (error: unknown) {
      const err =
        typeof error === "object" && error !== null
          ? (error as Record<string, unknown>)
          : null;

      let message = getApiErrorMessage(
        error,
        `Fehler beim Löschen des Produkts ${productName}.`,
      );

      // Конкретные причины запрета удаления от Backend
      if (err?.status === 409 && Array.isArray(err.errors)) {
        const messages = err.errors
          .filter(
            (item): item is { message: string } =>
              typeof item === "object" &&
              item !== null &&
              "message" in item &&
              typeof item.message === "string",
          )
          .map((item) => item.message.trim())
          .filter(Boolean);

        if (messages.length > 0) {
          message = messages.join("\n");
        }
      }

      showErrorToast("Fehler beim Löschen", message);

      // ConfirmDeleteDialog перехватит ошибку и останется открытым
      throw error;
    }

    showSuccessToast("Erfolg", `${productName} wurde erfolgreich gelöscht.`);

    // Переход к списку только после успешного удаления
    onSuccessDelete?.();
  };

  return (
    <ConfirmDeleteDialog trigger={trigger} onConfirm={handleDelete}>
      Möchten Sie das Produkt <strong>{productName}</strong> mit der
      Artikelnummer <strong>{productArticle}</strong> wirklich löschen?
    </ConfirmDeleteDialog>
  );
}
