import api from './index';

export const statusPageApi = {
    paginate: (params: any) => api.post('/web/statusPage/paginate', params),
    getById: (id: number) => api.get(`/web/statusPage/${id}`),
    create: (data: any) => api.post('/web/statusPage/create', data),
    update: (id: number, data: any) => api.put(`/web/statusPage/${id}`, data),
    activate: (id: number) => api.put(`/web/statusPage/${id}/activate`),
    deactivate: (id: number) => api.put(`/web/statusPage/${id}/deactivate`),
    softDelete: (id: number) => api.put(`/web/statusPage/${id}/soft-delete`),
    getPublicStatus: (slug: string) => api.get(`/web/statusPage/public/${slug}`),
};
