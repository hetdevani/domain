import api from './index';

export interface DashboardStats {
    monitors: {
        total: number;
        up: number;
        down: number;
        averageUptime: number;
    };
    warnings: {
        sslExpiry: number;
        domainExpiry: number;
    };
    incidents: {
        open: number;
        resolved: number;
        recent: { date: string; count: number }[];
        recentList?: Array<{
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
        }>;
    };
    notifications: {
        total: number;
    };
    monitoring: {
        totalChecks: number;
        upChecks: number;
    };
    users: {
        total: number;
        customers: number;
        admins: number;
        recent: { date: string; count: number }[];
    };
}

export const dashboardApi = {
    getStats: () => api.get<{ data: DashboardStats }>('/web/dashboard/get-stats'),
};
