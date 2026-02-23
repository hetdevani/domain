import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, CircularProgress, Alert } from '@mui/material';
import Breadcrumb from '../../components/layout/Breadcrumb';
import PlanCard from './components/PlanCard';
import PlanForm from './components/PlanForm';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { usePlanLogic } from './hooks/usePlanLogic';
import { planApi } from './api/planApi';
import type { IPlan } from '../../types';

const PlanManagementPage: React.FC = () => {
    const {
        loading: actionLoading,
        modalOpen,
        confirmOpen,
        selectedPlan,
        refreshTrigger,
        setModalOpen,
        setConfirmOpen,
        handleEdit,
        onFormSubmit,
        onConfirmDelete
    } = usePlanLogic();

    const [plans, setPlans] = useState<IPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await planApi.getPaginated({
                page: 1,
                limit: 100,
                sortBy: { sortOrder: 1 }
            });
            setPlans(response.data.data.data);
            setError(null);
        } catch (err) {
            setError('Failed to load plans. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, [refreshTrigger]);

    return (
        <Box>
            <Breadcrumb />

            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0A3D62' }}>
                    Subscription Plans
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Review and modify service tiers and limits.
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress size={48} thickness={4} />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
            ) : plans.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 4, border: '2px dashed', borderColor: 'divider' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>No plans found</Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {plans.map((plan) => (
                        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={plan.id}>
                            <PlanCard
                                plan={plan}
                                onEdit={handleEdit}
                                isAdmin={true}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            <PlanForm
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={onFormSubmit}
                initialData={selectedPlan}
                loading={actionLoading}
            />

            <ConfirmDialog
                open={confirmOpen}
                title="Delete Plan"
                message={`Are you sure you want to delete the "${selectedPlan?.name}" plan? This might affect users assigned to it.`}
                onConfirm={onConfirmDelete}
                onCancel={() => setConfirmOpen(false)}
                loading={actionLoading}
            />
        </Box>
    );
};

export default PlanManagementPage;
