import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import DynamicTable, { type Column } from '../../components/table/DynamicTable';
import Breadcrumb from '../../components/layout/Breadcrumb';
import MasterForm from './components/MasterForm';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useMasterLogic } from './hooks/useMasterLogic';
import { masterApi } from './api/masterApi';

const MasterManagementPage: React.FC = () => {
    const {
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
    } = useMasterLogic();

    const columns: Column[] = [
        { id: 'name', label: 'Name', sortable: true },
        { id: 'code', label: 'Code', sortable: true },
        {
            id: 'isActive',
            label: 'Status',
            format: (value: boolean) => (
                <Chip
                    label={value ? 'Active' : 'Inactive'}
                    color={value ? 'success' : 'default'}
                    size="small"
                />
            )
        },
        {
            id: 'isDefault',
            label: 'Default',
            format: (value: boolean) => value ? <Chip label="Yes" size="small" color="primary" /> : 'No'
        },
        { id: 'sortingSequence', label: 'Order' },
    ];

    return (
        <Box>
            <Breadcrumb />

            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0A3D62', letterSpacing: '-0.02em' }}>
                    Master Data Management
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Manage lookup values, categories, and system constants.
                </Typography>
            </Box>

            <DynamicTable
                key={refreshTrigger}
                title="Master Data List"
                columns={columns}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onCreate={handleCreate}
                fetchData={async (params) => {
                    const res = await masterApi.getPaginated(params);
                    return {
                        data: res.data.data.data,
                        total: res.data.data.totalRecords
                    };
                }}
            />

            <MasterForm
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={onFormSubmit}
                initialData={selectedItem}
                loading={loading}
            />

            <ConfirmDialog
                open={confirmOpen}
                title="Delete Master Entry"
                message={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
                onConfirm={onConfirmDelete}
                onCancel={() => setConfirmOpen(false)}
                loading={loading}
            />
        </Box>
    );
};

export default MasterManagementPage;
