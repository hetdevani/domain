export interface Permissions {
    list: boolean;
    view: boolean;
    insert: boolean;
    update: boolean;
    delete: boolean;
}

export interface PermissionModule {
    module: number;
    name: string;
    permissions: Permissions;
    id?: number;
}

export interface IUser {
    id: number;
    name: string;
    type: number;
    countryCode: string;
    mobile: string;
    email: string;
    uniqueCode: string;
    role?: string;
    accessPermission?: PermissionModule[];
    image?: string;
    isActive?: boolean;
    isTwoFactorEnabled: boolean;
    planId?: number;
    plan?: IPlan;
    createdAt?: string;
    updatedAt?: string;
}

export interface IRecentIncident {
    id: number;
    cause: string;
    status: number;
    startTime: string;
    endTime?: string;
    createdAt?: string;
    monitor?: {
        id: number;
        name: string;
        url: string;
        type: number;
    };
}

export interface IMonitor {
    id: number;
    name: string;
    url: string;
    type: number;
    checkInterval: number;
    sslMonitoring?: boolean;
    sslNotifyDays?: number;
    sslExpiresAt?: string;
    sslWarningDaysRemaining?: number;
    sslIssuer?: string;
    sslProtocol?: string;
    sslCipher?: string;
    sslSubject?: string;
    sslIsWildcard?: boolean;
    domainMonitoring?: boolean;
    domainExpiresAt?: string;
    domainWarningDaysRemaining?: number;
    domainNameServers?: string;
    domainRegistrar?: string;
    domainStatus?: string;
    domainDnsRecords?: string;
    blacklistMonitoring?: boolean;
    lastBlacklistStatus?: string;
    isActive?: boolean;
    lastStatus?: number;
    ownerId?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface IStatusPage {
    id: number;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    theme?: string; // Hex color e.g. '#0A3D62'
    ownerId: number;
    isActive: boolean;
    monitors?: IMonitor[];
    createdAt?: string;
    updatedAt?: string;
}

export interface IPlan {
    id: number;
    name: string;
    slug: string;
    description?: string;
    price: number;
    billingCycle: string;
    maxMonitors: number;
    minCheckInterval: number;
    maxStatusPages: number;
    maxTeamMembers: number;
    logRetentionDays: number;
    smsNotifications: boolean;
    webhookNotifications: boolean;
    emailNotifications: boolean;
    isDefault: boolean;
    sortOrder: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface IMaster {
    id: number;
    name: string;
    code: string;
    description?: string;
    isActive: boolean;
    isDefault: boolean;
    sortingSequence?: number;
    image?: string;
    parentId?: number;
    createdAt?: string;
    updatedAt?: string;
}

export const MODULES = {
    USER: 1,
    ROLE: 2,
    USER_LOG: 3,
    FILE_OPERATION: 4,
    DASH_BOARD: 5,
    SETTING: 6,
    MASTER: 7,
    NOTIFICATION: 8,
    STATIC_PAGE: 9,
    ACCOUNT_DELETE_REQUEST: 10,
    ACTIVITY_LOG: 11,
    VERSIONMANAGER: 12,
    SQLMODULETEST: 13,
    MONITOR: 14,
    INCIDENT: 15,
    PLAN: 19,
    PUBLICTOOL: 20,
    STATUS_PAGE: 21,
    REPORT: 22,
};

export const USER_TYPES = {
    MASTER_ADMIN: 1,
    ADMIN: 2,
    CUSTOMER: 3,
};

export const MONITOR_TYPE = {
    HTTP: 1,
    PING: 2,
    TCP: 3,
    DNS: 4,
    KEYWORD: 5,
    CRON: 6,
    HEARTBEAT: 7,
    BROWSER: 8,
};

export const MONITOR_STATUS = {
    UP: 1,
    DOWN: 2,
    DEGRADED: 3,
    UNKNOWN: 4
};

export const INCIDENT_STATUS = {
    OPEN: 1,
    RESOLVED: 2
};

export interface IIncident {
    id: number;
    monitorId: number;
    startTime: string;
    endTime?: string;
    cause: string;
    status: number;
    ownerId: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
    monitor?: {
        id: number;
        name: string;
        url: string;
    };
}


export interface PaginatedResponse<T> {
    data: {
        data: T[];
        totalRecords: number;
        totalPages: number;
        page: number;
        limit: number;
    };
    status: string;
    message: string;
}
