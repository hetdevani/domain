import api from './index';
import type { IIncident, PaginatedResponse } from '../types';

export const incidentApi = {
    paginate: (data: any) =>
        api.post<PaginatedResponse<IIncident>>('/web/incident/paginate', data),

    getById: (id: number) =>
        api.get(`/web/incident/${id}`),

    resolve: (id: number) =>
        api.put(`/web/incident/${id}/resolve`),
};
