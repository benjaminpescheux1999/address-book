// Export centralisé de tous les types

// Types de contact
export * from './contact';

// Types utilitaires
export interface IApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Types pour les configurations
export interface IAppConfig {
    port: number;
    mongoUri: string;
    nodeEnv: string;
}

// Types pour les logs
export interface ILogEntry {
    timestamp: Date;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    data?: any;
}

// Types pour les validations
export interface IValidationError {
    field: string;
    message: string;
    value?: any;
}

export interface IValidationErrors {
    errors: IValidationError[];
}

// Types pour les fichiers
export interface IFileInfo {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}

// Types pour les opérations de base de données
export interface IDatabaseResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    affectedRows?: number;
}

// Types pour les statistiques
export interface IContactStats {
    total: number;
    withAvatar: number;
    withoutAvatar: number;
    byDomain: Record<string, number>;
} 