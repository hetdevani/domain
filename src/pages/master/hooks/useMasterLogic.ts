import { useState, useCallback } from 'react';
import type { IMaster } from '../../../types';
import { masterApi } from '../api/masterApi';
import { toast } from 'react-hot-toast';

export const useMasterLogic = () => {
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<IMaster | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleCreate = useCallback(() => {
        setSelectedItem(null);
        setModalOpen(true);
    }, []);

    const handleEdit = useCallback((item: IMaster) => {
        setSelectedItem(item);
        setModalOpen(true);
    }, []);

    const handleDeleteClick = useCallback((item: IMaster) => {
        setSelectedItem(item);
        setConfirmOpen(true);
    }, []);

    const onFormSubmit = useCallback(async (data: Partial<IMaster>) => {
        try {
            setLoading(true);
            if (selectedItem) {
                const { id, createdAt, updatedAt, ...updateData } = data as any;
                await masterApi.update(selectedItem.id, updateData);
                toast.success('Master entry updated successfully');
            } else {
                const { id, createdAt, updatedAt, ...createData } = data as any;
                await masterApi.create(createData);
                toast.success('Master entry created successfully');
            }
            setModalOpen(false);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            toast.error(selectedItem ? 'Failed to update entry' : 'Failed to create entry');
        } finally {
            setLoading(false);
        }
    }, [selectedItem]);

    const onConfirmDelete = useCallback(async () => {
        if (!selectedItem) return;
        try {
            setLoading(true);
            await masterApi.softDelete(selectedItem.id);
            toast.success('Master entry deleted successfully');
            setConfirmOpen(false);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            toast.error('Failed to delete entry');
        } finally {
            setLoading(false);
        }
    }, [selectedItem]);

    return {
        loading,
        modalOpen,
        confirmOpen,
        selectedItem,
        refreshTrigger,
        setModalOpen,
        setConfirmOpen,
        handleCreate,
        handleEdit,
        handleDeleteClick,
        onFormSubmit,
        onConfirmDelete
    };
};
