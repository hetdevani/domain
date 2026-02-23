import { useState, useCallback } from 'react';
import { monitorApi } from '../api/monitorApi';
import toast from 'react-hot-toast';

export const useMonitorLogic = () => {
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedMonitor, setSelectedMonitor] = useState<any>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refreshTable = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    const handleCreate = () => {
        setSelectedMonitor(null);
        setModalOpen(true);
    };

    const handleEdit = (monitor: any) => {
        setSelectedMonitor(monitor);
        setModalOpen(true);
    };

    const handleDeleteClick = (monitor: any) => {
        setSelectedMonitor(monitor);
        setConfirmOpen(true);
    };

    const onFormSubmit = async (data: any) => {
        setLoading(true);
        try {
            // Aggressively strip server-side metadata
            const {
                id,
                createdAt,
                updatedAt,
                deletedAt,
                isDeleted,
                isActive,
                ownerId,
                ...sanitizedData
            } = data;

            if (selectedMonitor) {
                await monitorApi.update(selectedMonitor.id, sanitizedData);
                toast.success('Monitor updated successfully');
            } else {
                // If it's a new HTTP monitor, runtime ping to verify
                if (sanitizedData.type === 1 || sanitizedData.type === 2) {
                    toast.loading('Verifying monitor reachability...', { id: 'ping-toast' });
                    try {
                        await monitorApi.runtimePing({ url: sanitizedData.url });
                        toast.success('Monitor verified reachable!', { id: 'ping-toast' });
                    } catch (pingErr: any) {
                        toast.error(`Verification Failed: ${pingErr.response?.data?.message || pingErr.message}. Monitor was NOT created.`, { id: 'ping-toast', duration: 6000 });
                        setLoading(false);
                        return;
                    }
                }

                await monitorApi.create(sanitizedData);
                toast.success('Monitor created successfully');
            }
            setModalOpen(false);
            refreshTable();
        } catch (error: any) {
            toast.error(error.message || 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    const onConfirmDelete = async () => {
        if (!selectedMonitor) return;
        setLoading(true);
        try {
            await monitorApi.delete(selectedMonitor.id);
            toast.success('Monitor deleted successfully');
            setConfirmOpen(false);
            refreshTable();
        } catch (error: any) {
            toast.error(error.message || 'Deletion failed');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (monitor: any) => {
        setLoading(true);
        try {
            if (monitor.isActive) {
                await monitorApi.deactivate(monitor.id);
                toast.success('Monitor deactivated successfully');
            } else {
                await monitorApi.activate(monitor.id);
                toast.success('Monitor activated successfully');
            }
            refreshTable();
        } catch (error: any) {
            toast.error(error.message || 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        modalOpen,
        confirmOpen,
        selectedMonitor,
        refreshTrigger,
        setModalOpen,
        setConfirmOpen,
        handleCreate,
        handleEdit,
        handleDeleteClick,
        handleToggleStatus,
        onFormSubmit,
        onConfirmDelete,
        refreshTable,
    };
};
