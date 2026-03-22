import api from './index';

export const roleApi = {
    getPaginated: (params: any) => api.post('/web/role/paginate', params),
    getById: (id: number | string) => api.get(`/web/role/${id}`),
    create: (data: any) => api.post('/web/role/create', data),
    update: (id: number | string, data: any) => api.put(`/web/role/${id}`, data),
    delete: (id: number | string) => api.put(`/web/role/${id}/soft-delete`),
};
