import axiosInstance from '../../../api/index';
import type { IPlan } from '../../../types';

export const planApi = {
    getPaginated: (params: any) => {
        return axiosInstance.post<any>('/web/plan/paginate', params);
    },

    create: (data: Partial<IPlan>) => {
        return axiosInstance.post('/web/plan/create', data);
    },

    update: (id: number, data: Partial<IPlan>) => {
        return axiosInstance.put(`/web/plan/${id}`, data);
    },

    getById: (id: number) => {
        return axiosInstance.get(`/web/plan/${id}`);
    },

    activate: (id: number) => {
        return axiosInstance.put(`/web/plan/${id}/activate`);
    },

    deactivate: (id: number) => {
        return axiosInstance.put(`/web/plan/${id}/deactivate`);
    },

    softDelete: (id: number) => {
        return axiosInstance.put(`/web/plan/${id}/soft-delete`);
    },
};
