import type { ReactNode } from "react";

import { useAppDispatch } from "../../../redux/hooks";
import { deletePurchase } from "../purchasesSlice";

import { showSuccessToast } from "../../../utils/toast";
import { handleApiError } from "../../../utils/errors/handleApiError";

import ConfirmDeleteDialog from "../../../components/ConfirmDeleteDialog";
import { formatLocalDate } from "../../../utils/formatLocalDate";

interface DeletePurchaseProps {
  purchaseId: number;
  vendorName: string;
  purchasingDate: string;
  trigger?: ReactNode;
}

export default function DeletePurchase({
  purchaseId,
  vendorName,
  purchasingDate,
  trigger,
}: DeletePurchaseProps) {
  const dispatch = useAppDispatch();

  const handleDelete = async (): Promise<void> => {
    try {
      await dispatch(deletePurchase(purchaseId)).unwrap();

      showSuccessToast("Erfolg", "Die Bestellung wurde erfolgreich gelöscht.");
    } catch (error) {
      handleApiError(error, "Fehler beim Löschen der Bestellung.");

      throw error;
    }
  };

  const formattedDate = formatLocalDate(purchasingDate);

  return (
    <ConfirmDeleteDialog trigger={trigger} onConfirm={handleDelete}>
      Möchten Sie die Bestellung Nr. <strong>{purchaseId}</strong> von{" "}
      <strong>{vendorName}</strong> vom <strong>{formattedDate}</strong>{" "}
      wirklich löschen?
    </ConfirmDeleteDialog>
  );
}
