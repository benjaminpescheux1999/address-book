// Types pour les contacts et opérations associées

// Interface de base pour un contact
export interface IContact {
    _id?: string;
    name: string;
    nameNormalized?: string;
    email: string;
    emailNormalized?: string;
    phone: string;
    avatar?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Interface pour la création d'un contact (sans les champs automatiques)
export interface ICreateContact {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
}

// Interface pour la mise à jour d'un contact (tous les champs optionnels)
export interface IUpdateContact {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
}

// Interface pour la réponse paginée
export interface IPaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

// Interface pour les paramètres de pagination
export interface IPaginationParams {
    page?: string | number;
    limit?: string | number;
}

// Interface pour les paramètres de recherche
export interface ISearchParams extends IPaginationParams {
    q?: string;
}

// Interface pour la réponse d'import CSV
export interface IImportResponse {
    message: string;
    imported?: number;
    ignored?: number;
}

// Interface pour la réponse de suppression
export interface IDeleteResponse {
    message: string;
    deletedCount?: number;
}

// Interface pour les données CSV brutes
export interface ICSVRow {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
}

// Interface pour les contacts validés
export interface IValidatedContact extends ICSVRow {
    nameNormalized: string;
    emailNormalized: string;
}

// Interface pour les erreurs d'API
export interface IApiError {
    error: string;
}

// Interface pour les contacts existants (pour vérification d'unicité)
export interface IExistingContact {
    _id: string;
    emailNormalized: string;
    phone: string;
}

// Types pour les fonctions de validation
export type ValidationFunction = (value: string) => boolean;

// Interface pour les résultats de validation
export interface IValidationResult {
    isValid: boolean;
    message?: string;
} 