// Types principaux pour l'application Carnet d'adresses

// ===== CONTACTS =====
export interface Contact {
    _id?: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    nameNormalized?: string;
    emailNormalized?: string;
}

// ===== API RESPONSES =====
export interface ApiResponse<T> {
    data: T;
    total: number;
    page: number;
    limit: number;
}

export interface ContactsResponse extends ApiResponse<Contact[]> { }

export interface SearchResponse extends ApiResponse<Contact[]> { }

export interface InitializeResponse {
    message: string;
    updated: number;
}

// ===== PAGINATION =====
export interface PaginationState {
    page: number;
    hasMore: boolean;
    total: number;
    loading: boolean;
}

// ===== MODAL STATES =====
export type ModalMode = 'create' | 'edit';

export interface ModalState {
    open: boolean;
    mode: ModalMode;
    contact: Contact | null;
}

// ===== SNACKBAR =====
export type SnackbarSeverity = 'success' | 'error' | 'info' | 'warning';

export interface SnackbarState {
    open: boolean;
    message: string;
    severity?: SnackbarSeverity;
}

// ===== CONFIRMATION DIALOG =====
export type PendingAction = 'add' | 'edit' | 'delete' | null;

export interface ConfirmDialogState {
    open: boolean;
    message: string;
    pendingAction: PendingAction;
    pendingContact: Contact | Omit<Contact, '_id'> | null;
}

// ===== SEARCH =====
export interface SearchState {
    query: string;
    loading: boolean;
}

// ===== ALPHABET NAVIGATION =====
export interface AlphabetNavigationProps {
    onLetterClick: (letter: string) => void;
    currentLetter?: string;
}

// ===== CONTACT LIST =====
export interface ContactListProps {
    contacts: Contact[];
    onEdit?: (contact: Contact) => void;
    onDelete?: (contact: Contact) => void;
}

export interface SectionedContacts {
    [letter: string]: Contact[];
}

export type ContactSection = [string, Contact[]];

// ===== CONTACT FORM =====
export interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
}

export interface ContactFormErrors {
    name?: string;
    email?: string;
    phone?: string;
}

// ===== CSV IMPORT/EXPORT =====
export interface CsvContact {
    name: string;
    email: string;
    phone: string;
}

export interface CsvImportResult {
    success: boolean;
    message: string;
    imported: number;
    errors: string[];
}

// ===== FILE UPLOAD =====
export interface FileUploadState {
    file: File | null;
    preview: string | null;
    loading: boolean;
    error: string | null;
}

// ===== VALIDATION =====
export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | undefined;
}

export interface ValidationRules {
    name: ValidationRule;
    email: ValidationRule;
    phone: ValidationRule;
}

// ===== THEME & UI =====
export interface ThemeConfig {
    mode: 'light' | 'dark';
    primaryColor: string;
    secondaryColor: string;
}

// ===== ERROR HANDLING =====
export interface ApiError {
    message: string;
    status: number;
    code?: string;
}

// ===== APP STATE =====
export interface AppState {
    contacts: Contact[];
    pagination: PaginationState;
    modal: ModalState;
    snackbar: SnackbarState;
    confirmDialog: ConfirmDialogState;
    search: SearchState;
    currentLetter?: string;
}

// ===== EVENT HANDLERS =====
export type ContactActionHandler = (contact: Contact) => void;
export type ContactFormHandler = (contact: Contact | Omit<Contact, '_id'>) => void;
export type LetterClickHandler = (letter: string) => void;
export type SearchChangeHandler = (query: string) => void;
export type ModalCloseHandler = () => void;

// ===== UTILITY TYPES =====
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type MakeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ===== CONSTANTS =====
export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const PAGE_SIZE = 5;
export const MAX_PAGES = 50;
export const SEARCH_DEBOUNCE_MS = 300;

// ===== ENVIRONMENT =====
export interface Environment {
    API_URL: string;
    NODE_ENV: 'development' | 'production' | 'test';
    VITE_API_URL?: string;
} 