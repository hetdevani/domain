import { useState, useCallback } from 'react';
import type { IPlan } from '../../../types';
import { planApi } from '../api/planApi';
import { toast } from 'react-hot-toast';

export const usePlanLogic = () => {
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<IPlan | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleCreate = useCallback(() => {
        setSelectedPlan(null);
        setModalOpen(true);
    }, []);

    const handleEdit = useCallback((plan: IPlan) => {
        setSelectedPlan(plan);
        setModalOpen(true);
    }, []);

    const handleDeleteClick = useCallback((plan: IPlan) => {
        setSelectedPlan(plan);
        setConfirmOpen(true);
    }, []);

    const handleToggleStatus = useCallback(async (plan: IPlan) => {
        try {
            setLoading(true);
            if (plan.isActive) {
                await planApi.deactivate(plan.id);
                toast.success('Plan deactivated');
            } else {
                await planApi.activate(plan.id);
                toast.success('Plan activated');
            }
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setLoading(false);
        }
    }, []);

    const onFormSubmit = useCallback(async (data: Partial<IPlan>) => {
        try {
            setLoading(true);
            if (selectedPlan) {
                const { id, createdAt, updatedAt, ...updateData } = data as any;
                await planApi.update(selectedPlan.id, updateData);
                toast.success('Plan updated successfully');
            } else {
                const { id, createdAt, updatedAt, ...createData } = data as any;
                await planApi.create(createData);
                toast.success('Plan created successfully');
            }
            setModalOpen(false);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            toast.error(selectedPlan ? 'Failed to update plan' : 'Failed to create plan');
        } finally {
            setLoading(false);
        }
    }, [selectedPlan]);

    const onConfirmDelete = useCallback(async () => {
        if (!selectedPlan) return;
        try {
            setLoading(true);
            await planApi.softDelete(selectedPlan.id);
            toast.success('Plan deleted successfully');
            setConfirmOpen(false);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            toast.error('Failed to delete plan');
        } finally {
            setLoading(false);
        }
    }, [selectedPlan]);

    return {
        loading,
        modalOpen,
        confirmOpen,
        selectedPlan,
        refreshTrigger,
        setModalOpen,
        setConfirmOpen,
        handleCreate,
        handleEdit,
        handleDeleteClick,
        handleToggleStatus,
        onFormSubmit,
        onConfirmDelete
    };
};
