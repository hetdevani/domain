import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { Plus } from 'lucide-react';
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

            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0A3D62' }}>
                        Master Data Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage lookup values, categories, and system constants.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={handleCreate}
                    sx={{ borderRadius: 2.5, px: 3 }}
                >
                    Add Entry
                </Button>
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
