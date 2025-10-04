export interface Company {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
    bank: string;
    ibanNumber: string;
    bicNumber: string;
    vatId: string;
    logoUrl: string;
}

export interface NewCompanyDto {
    name: string;
    address: string;
    phone: string;
    email: string;
    bank: string;
    ibanNumber: string;
    bicNumber: string;
    vatId: string;
}

export interface CompanyState {
    selectedCompany: Company | undefined;
    loading: boolean;
    error: string | null;
}
