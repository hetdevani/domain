import api from '../../../api';

export const userApi = {
    getPaginated: (params: any) => api.post('/web/user/paginate', params),
    getById: (id: number) => api.get(`/web/user/${id}`),
    create: (data: any) => api.post('/web/user/create', data),
    update: (id: number, data: any) => api.put(`/web/user/${id}`, data),
    delete: (id: number) => api.put(`/web/user/${id}/soft-delete`),
    activate: (id: number) => api.put(`/web/user/${id}/activate`),
    deactivate: (id: number) => api.put(`/web/user/${id}/deactivate`),
    resetPassword: (id: number, newPassword: string) => api.post('/web/user/reset-password', { id, newPassword }),
    downloadReport: (data: any) => api.post('/web/user/download-report', data),
};
