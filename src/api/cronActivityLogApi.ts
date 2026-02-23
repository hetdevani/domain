import api from './index';

export const cronActivityLogApi = {
    getPaginated: (params: any) => api.post('/web/cron-activity-log/paginate', params),
    getById: (id: string) => api.get(`/web/cron-activity-log/${id}`),
};
