import api from './index';

export interface DashboardStats {
    monitors: {
        total: number;
        up: number;
        down: number;
    };
    incidents: {
        open: number;
        resolved: number;
        recent: { date: string; count: number }[];
    };
    notifications: {
        total: number;
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
