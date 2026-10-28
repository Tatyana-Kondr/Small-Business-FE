import type { ReactNode } from "react";

import { useAppDispatch } from "../../../redux/hooks";
import { deleteSale } from "../salesSlice";

import { showSuccessToast } from "../../../utils/toast";
import { handleApiError } from "../../../utils/errors/handleApiError";

import ConfirmDeleteDialog from "../../../components/ConfirmDeleteDialog";

interface DeleteSaleProps {
  saleId: number;
  customerName: string;
  salesDate: string;
  trigger?: ReactNode;
}

export default function DeleteSale({
  saleId,
  customerName,
  salesDate,
  trigger,
}: DeleteSaleProps) {
  const dispatch = useAppDispatch();

  const handleDelete = async (): Promise<void> => {
    try {
      await dispatch(deleteSale(saleId)).unwrap();

      showSuccessToast("Erfolg", "Der Auftrag wurde erfolgreich gelöscht.");
    } catch (error) {
      handleApiError(error, "Fehler beim Löschen des Auftrags.");

      throw error;
    }
  };

  const date = new Date(salesDate);

  const formattedDate = Number.isNaN(date.getTime())
    ? salesDate
    : date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

  return (
    <ConfirmDeleteDialog trigger={trigger} onConfirm={handleDelete}>
      Möchten Sie den Auftrag Nr. <strong>{saleId}</strong> von{" "}
      <strong>{customerName}</strong> vom <strong>{formattedDate}</strong>{" "}
      wirklich löschen?
    </ConfirmDeleteDialog>
  );
}
