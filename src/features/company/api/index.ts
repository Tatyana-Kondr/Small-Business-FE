import { apiFetch } from "../../../utils/apiFetch";
import { Company, NewCompanyDto } from "../types";


export async function fetchCompany(): Promise<Company> {
  return apiFetch<Company>(
    `/api/companies`,
    { auth: true },
    "Fehler beim Laden des Unternehmens."
  );
}

export async function fetchCreateCompany(data: NewCompanyDto): Promise<Company> {
  return apiFetch<Company>(
    `/api/companies`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      auth: true,
    },
    "Fehler beim Erstellen des Unternehmens."
  );
}

export async function fetchUpdateCompany(
  id: number,
  data: NewCompanyDto
): Promise<Company> {
  return apiFetch<Company>(
    `/api/companies/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      auth: true,
    },
    "Fehler beim Aktualisieren des Unternehmens."
  );
}

export async function fetchUploadLogo(id: number, formData: FormData): Promise<Company> {
  return apiFetch<Company>(
    `/api/companies/${id}/logo`,
    {
      method: "POST",
      body: formData,
      auth: true,
    },
    "Fehler beim Hochladen des Logos."
  );
}
