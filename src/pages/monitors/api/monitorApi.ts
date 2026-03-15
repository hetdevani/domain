import api from '../../../api';
import { MONITOR_TYPE } from '../../../types';

const extractHostname = (input: string, type?: number) => {
    const value = String(input || '').trim().replace(/^tcp:\/\//i, '');
    if (!value) return '';

    if (type === MONITOR_TYPE.TCP) {
        const separatorIndex = value.lastIndexOf(':');
        return separatorIndex === -1 ? value : value.slice(0, separatorIndex).trim();
    }

    if (type === MONITOR_TYPE.KEYWORD && value.includes('|')) {
        return extractHostname(value.split('|')[0], MONITOR_TYPE.HTTP);
    }

    try {
        if (value.includes('://')) {
            return new URL(value).hostname;
        }
        return new URL(`https://${value}`).hostname;
    } catch {
        return value.split('/')[0].trim();
    }
};

const normalizeTarget = (input: string, type: number) => {
    const value = String(input || '').trim();
    if ([MONITOR_TYPE.HTTP, MONITOR_TYPE.KEYWORD, MONITOR_TYPE.BROWSER].includes(type) && value && !value.includes('://')) {
        return `https://${value}`;
    }
    return value;
};

const extractRegistrarFromRdap = (rdap: any) => {
    const registrarEntity = Array.isArray(rdap?.entities)
        ? rdap.entities.find((entity: any) => Array.isArray(entity?.roles) && entity.roles.includes('registrar'))
        : null;

    return registrarEntity?.vcardArray?.[1]
        ?.find((entry: any) => Array.isArray(entry) && entry[0] === 'fn')?.[3]
        || registrarEntity?.handle
        || null;
};

export const monitorApi = {
    getPaginated: (params: any) => api.post('/web/monitor/paginate', params),
    getById: (id: number) => api.get(`/web/monitor/${id}`),
    create: (data: any) => api.post('/web/monitor/create', data),
    update: (id: number, data: any) => api.put(`/web/monitor/${id}`, data),
    delete: (id: number) => api.put(`/web/monitor/${id}/soft-delete`),
    activate: (id: number) => api.put(`/web/monitor/${id}/activate`),
    deactivate: (id: number) => api.put(`/web/monitor/${id}/deactivate`),
    sendTestAlert: (id: number) => api.post(`/web/monitor/${id}/test-alert`),
    getAlertHistory: (id: number) => api.get(`/web/monitor/${id}/alert-history`),
    getPerformance: (id: number, params?: { days?: number }) => api.get(`/web/monitor/${id}/performance`, { params }),
    downloadReport: (data: any) => api.post('/web/monitor/download-report', data),
    runtimePing: (data: { url: string }) => api.post('/web/monitor/runtime-ping', data),
    refreshWarnings: (id: number) => api.post(`/web/monitor/${id}/refresh-warnings`),
    previewTarget: async (data: { url: string; type: number; domainMonitoring?: boolean }) => {
        try {
            return await api.post('/web/monitor/preview-target', data);
        } catch (error: any) {
            if (error?.response?.status !== 404) {
                throw error;
            }

            const normalizedTarget = normalizeTarget(data.url, data.type);
            const hostname = extractHostname(normalizedTarget, data.type);

            if (!hostname) {
                throw { ...error, message: 'Unable to resolve target hostname' };
            }

            if ([MONITOR_TYPE.HTTP, MONITOR_TYPE.KEYWORD, MONITOR_TYPE.BROWSER].includes(data.type)) {
                await api.post('/web/monitor/runtime-ping', { url: normalizedTarget });
            }

            let domain: any = undefined;
            if (data.domainMonitoring) {
                const domainResponse = await api.get('/web/publicTool/domain-expiration', {
                    params: { domain: hostname }
                });
                const domainData = domainResponse.data?.data || {};
                const rdap = domainData.rdap || {};

                domain = {
                    domain: domainData.domain || hostname,
                    source: domainData.source || rdap?.port43 || rdap?.links?.[0]?.href || 'rdap.org',
                    registrar: domainData.registrar || extractRegistrarFromRdap(rdap),
                    expirationDate: domainData.expirationDate || null,
                    expiresInDays: domainData.expiresInDays ?? null
                };
            }

            return {
                data: {
                    data: {
                        isValid: true,
                        normalizedTarget,
                        hostname,
                        domain
                    }
                }
            };
        }
    },
};
