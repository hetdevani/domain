import api from './index';

export const reportApi = {
    paginate: (params: any) => api.post('/web/report/paginate', params),
    getById: (id: number) => api.get('/web/report/:id'.replace(':id', id.toString())),
    create: (data: any) => api.post('/web/report/create', data),
    update: (id: number, data: any) => api.put(`/web/report/${id}`, data),
    softDelete: (id: number) => api.put(`/web/report/${id}/soft-delete`),
    trigger: (id: number) => api.post(`/web/report/${id}/trigger`),
};
