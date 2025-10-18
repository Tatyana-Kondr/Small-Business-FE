import { apiFetch } from "../../../utils/apiFetch";
import { NewProductionDto, PaginatedResponse, Production } from "../types";

export async function fetchProductions(
  page: number,
  size: number,
  sort: string = "dateOfProduction,DESC",
  searchTerm: string = ""
): Promise<PaginatedResponse<Production>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  queryParams.append("sort", sort);
  if (searchTerm) queryParams.append("search", searchTerm);

  return apiFetch<PaginatedResponse<Production>>(
    `/api/productions?${queryParams.toString()}`,
    {auth: true},
    "Fehler beim Laden der Herstellungen."
  );
}

export async function fetchAddProduction(newProduction: NewProductionDto): Promise<Production> {
  return apiFetch<Production>(
    "/api/productions",
    {
      method: "POST",
      body: JSON.stringify(newProduction),
      headers: { "Content-Type": "application/json" },
      auth: true,
    },
    "Fehler beim Hinzufügen der Herstellung."
  );
}

export async function fetchUpdateProduction(id: number, updatedProduction: NewProductionDto): Promise<Production> {
  return apiFetch<Production>(
    `/api/productions/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(updatedProduction),
      headers: { "Content-Type": "application/json" },
      auth: true,
    },
    `Fehler beim Aktualisieren der Herstellung mit der ID ${id}.`
  );
}

export async function fetchDeleteProduction(id: number): Promise<void> {
  return apiFetch<void>(
    `/api/productions/${id}`,
    { method: "DELETE", auth: true },
    `Fehler beim Löschen der Herstellung mit der ID ${id}.`
  );
}

export async function fetchProductionById(id: number): Promise<Production> {
  return apiFetch<Production>(
    `/api/productions/${id}`,
    {auth: true},
    `Fehler beim Laden der Herstellung mit der ID ${id}.`
  );
}

export async function fetchSearchProductions(
  query: string,
  page: number,
  size: number,
  sort = "dateOfProduction,DESC",
): Promise<PaginatedResponse<Production>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  queryParams.append("sort", sort);

  return apiFetch<PaginatedResponse<Production>>(
    `/api/productions/search/${encodeURIComponent(query)}?${queryParams.toString()}`,
    {auth: true},
    "Fehler bei der Suche der Herstellungen."
  );
}

export async function fetchProductionsByFilter(
  page: number,
  size: number,
  sort = "dateOfProduction,DESC",
  filters?: {
    startDate?: string;
    endDate?: string;
    searchQuery?: string;
  }
): Promise<PaginatedResponse<Production>> {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  queryParams.append("sort", sort);

  if (filters) {
    if (filters.startDate) queryParams.append("startDate", filters.startDate);
    if (filters.endDate) queryParams.append("endDate", filters.endDate);
    if (filters.searchQuery) queryParams.append("searchQuery", filters.searchQuery);
  }

  return apiFetch<PaginatedResponse<Production>>(
    `/api/productions/filter?${queryParams.toString()}`,
    {auth: true},
    "Fehler beim Laden der gefilterten Herstellungen."
  );
}
