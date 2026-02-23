import { useState } from 'react';
import { incidentApi } from '../../../api/incidentApi';
import toast from 'react-hot-toast';

export const useIncidentLogic = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleResolve = async (id: number) => {
        setLoading(true);
        try {
            await incidentApi.resolve(id);
            toast.success('Incident resolved successfully');
            setRefreshTrigger(prev => prev + 1);
        } catch (error: any) {
            toast.error(error.message || 'Failed to resolve incident');
        } finally {
            setLoading(false);
        }
    };

    return {
        refreshTrigger,
        loading,
        handleResolve,
        setRefreshTrigger
    };
};
