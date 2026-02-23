import axiosInstance from '../../../api/index';
import type { IMaster } from '../../../types';

export const masterApi = {
    getPaginated: (params: any) => {
        return axiosInstance.post('/web/master/paginate', params);
    },

    create: (data: Partial<IMaster>) => {
        return axiosInstance.post('/web/master/create', data);
    },

    update: (id: number, data: Partial<IMaster>) => {
        return axiosInstance.put(`/web/master/${id}`, data);
    },

    getById: (id: number) => {
        return axiosInstance.get(`/web/master/${id}`);
    },

    activate: (id: number) => {
        return axiosInstance.put(`/web/master/${id}/activate`);
    },

    deactivate: (id: number) => {
        return axiosInstance.put(`/web/master/${id}/deactivate`);
    },

    softDelete: (id: number) => {
        return axiosInstance.put(`/web/master/${id}/soft-delete`);
    },

    setDefault: (id: number) => {
        return axiosInstance.put(`/web/master/${id}/set-default`);
    },

    listByFilter: (filter: any) => {
        return axiosInstance.post('/web/master/list', { filter });
    },
};
