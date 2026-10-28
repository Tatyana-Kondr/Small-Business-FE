import type { ReactNode } from "react";

import { useAppDispatch } from "../../../redux/hooks";
import { deleteCustomer } from "../customersSlice";

import { showErrorToast, showSuccessToast } from "../../../utils/toast";
import { getApiErrorMessage } from "../../../utils/errors/handleApiError";

import ConfirmDeleteDialog from "../../../components/ConfirmDeleteDialog";

interface DeleteCustomerProps {
  customerId: number;
  customerName: string;
  trigger?: ReactNode;
}

export default function DeleteCustomer({
  customerId,
  customerName,
  trigger,
}: DeleteCustomerProps) {
  const dispatch = useAppDispatch();

  const handleDelete = async (): Promise<void> => {
    try {
      await dispatch(deleteCustomer(customerId)).unwrap();

      showSuccessToast("Erfolg", `${customerName} wurde erfolgreich gelöscht.`);
    } catch (error: unknown) {
      const err =
        typeof error === "object" && error !== null
          ? (error as Record<string, unknown>)
          : null;

      let message = getApiErrorMessage(
        error,
        `Fehler beim Löschen von ${customerName}.`,
      );

      // Только для DeleteCustomer:
      // извлекаем конкретные причины запрета удаления
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

      // Передаём ошибку ConfirmDeleteDialog
      throw error;
    }
  };

  return (
    <ConfirmDeleteDialog trigger={trigger} onConfirm={handleDelete}>
      Möchten Sie <strong>{customerName}</strong> wirklich löschen?
    </ConfirmDeleteDialog>
  );
}
