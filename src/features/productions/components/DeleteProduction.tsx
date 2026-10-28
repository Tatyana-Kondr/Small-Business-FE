import type { ReactNode } from "react";

import { useAppDispatch } from "../../../redux/hooks";
import { deleteProduction } from "../productionsSlice";

import { showSuccessToast } from "../../../utils/toast";
import { handleApiError } from "../../../utils/errors/handleApiError";

import ConfirmDeleteDialog from "../../../components/ConfirmDeleteDialog";
import { formatLocalDate } from "../../../utils/formatLocalDate";

interface DeleteProductionProps {
  productionId: number;
  dateOfProduction: string;
  trigger?: ReactNode;
}

export default function DeleteProduction({
  productionId,
  dateOfProduction,
  trigger,
}: DeleteProductionProps) {
  const dispatch = useAppDispatch();

  const handleDelete = async (): Promise<void> => {
    try {
      await dispatch(deleteProduction(productionId)).unwrap();

      showSuccessToast("Erfolg", "Die Herstellung wurde erfolgreich gelöscht.");
    } catch (error) {
      handleApiError(error, "Fehler beim Löschen der Herstellung.");

      throw error;
    }
  };

  const formattedDate = formatLocalDate(dateOfProduction);

  return (
    <ConfirmDeleteDialog trigger={trigger} onConfirm={handleDelete}>
      Möchten Sie die Herstellung Nr. <strong>{productionId}</strong> vom{" "}
      <strong>{formattedDate}</strong> wirklich löschen?
    </ConfirmDeleteDialog>
  );
}
