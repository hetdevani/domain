import api from './index';

export const activityLogApi = {
    getPaginated: (params: any) => api.post('/web/activity-log/list', params),
    getById: (id: string) => api.get(`/web/activity-log/${id}`),
    getUserLogs: (userId: string, params: any) => api.post(`/web/activity-log/user/${userId}`, params),
    getModuleLogs: (module: string, params: any) => api.post(`/web/activity-log/module/${module}`, params),
    search: (params: any) => api.post('/web/activity-log/search', params),
};
