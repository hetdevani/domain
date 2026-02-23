import api from '../../../api';

export const monitorApi = {
    getPaginated: (params: any) => api.post('/web/monitor/paginate', params),
    getById: (id: number) => api.get(`/web/monitor/${id}`),
    create: (data: any) => api.post('/web/monitor/create', data),
    update: (id: number, data: any) => api.put(`/web/monitor/${id}`, data),
    delete: (id: number) => api.put(`/web/monitor/${id}/soft-delete`),
    activate: (id: number) => api.put(`/web/monitor/${id}/activate`),
    deactivate: (id: number) => api.put(`/web/monitor/${id}/deactivate`),
    downloadReport: (data: any) => api.post('/web/monitor/download-report', data),
    runtimePing: (data: { url: string }) => api.post('/web/monitor/runtime-ping', data),
};
