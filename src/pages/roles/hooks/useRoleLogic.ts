import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { roleApi } from '../../../api/roleApi';

export const useRoleLogic = () => {

    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: 1,
                limit: 100, // Fetch all roles for the tab layout
                sortBy: { createdAt: 1 } // Sort by creation date to keep tabs consistent
            };
            const response = await roleApi.getPaginated(params);
            setRoles(response.data.data.data);
        } catch (error: any) {
            console.error('Failed to fetch roles:', error);
        } finally {
            setLoading(false);
        }
    }, [refreshTrigger]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const onFormSubmit = async (roleId: any, data: any) => {
        setLoading(true);
        try {
            await roleApi.update(roleId, data);
            toast.success('Role updated successfully');
            setRefreshTrigger(prev => prev + 1);
        } catch (error: any) {
            toast.error(error.message || 'Failed to save role');
        } finally {
            setLoading(false);
        }
    };

    return {
        roles,
        loading,
        activeTab,
        setActiveTab,
        onFormSubmit
    };
};


