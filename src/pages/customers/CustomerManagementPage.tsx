import React from 'react';
import { Box, Chip, Avatar, Typography, IconButton, Tooltip } from '@mui/material';
import { ShieldCheck, Ban, Key, Shield, LogIn } from 'lucide-react';

import DynamicTable, { type Column } from '../../components/table/DynamicTable';
import Breadcrumb from '../../components/layout/Breadcrumb';
import CustomerForm from './components/CustomerForm';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PasswordResetModal from '../users/components/PasswordResetModal';
import UserPermissionModal from '../users/components/UserPermissionModal';
import { useUserLogic } from '../users/hooks/useUserLogic';
import { userApi } from '../users/api/userApi';
import { USER_TYPES } from '../../types';
import { useAuth } from '../../contexts/AuthContext';


const CustomerManagementPage: React.FC = () => {
    // Reusing useUserLogic as the backend logic is identical
    const {
        loading,
        modalOpen,
        confirmOpen,
        resetPasswordOpen,
        permissionOpen,
        selectedUser,
        refreshTrigger,
        setModalOpen,
        setConfirmOpen,
        setResetPasswordOpen,
        setPermissionOpen,
        handleCreate,
        handleEdit,
        handleDeleteClick,
        handleToggleStatus,
        handleResetPasswordClick,
        handlePermissionClick,
        onFormSubmit,
        onConfirmDelete,
        onResetPassword,
        onPermissionSubmit
    } = useUserLogic();
    const { impersonate, user: currentUser } = useAuth();


    const columns: Column[] = [
        {
            id: 'name',
            label: 'Customer',
            minWidth: 200,
            format: (value, row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar src={row.image} sx={{ width: 32, height: 32 }}>{value?.charAt(0)}</Avatar>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                        <Typography variant="caption" color="text.secondary">{row.email}</Typography>
                    </Box>
                </Box>
            )
        },
        {
            id: 'uniqueCode',
            label: 'ID',
        },
        {
            id: 'mobile',
            label: 'Mobile',
            format: (value, row) => value ? `${row.countryCode || '+91'} ${value}` : '-'
        },
        {
            id: 'isActive',
            label: 'Status',
            format: (value) => (
                <Chip
                    label={value ? 'Active' : 'Inactive'}
                    size="small"
                    color={value ? 'success' : 'error'}
                    sx={{ fontWeight: 600, borderRadius: 1 }}
                />
            )
        },
        {
            id: 'plan',
            label: 'Plan',
            format: (value) => value?.name || <Typography variant="caption" color="text.secondary">No Plan</Typography>
        },
        {
            id: 'createdAt',
            label: 'Joined Date',
            format: (value) => new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        }
    ];

    const fetchCustomers = async (params: any) => {
        // Inject type filter for customers
        const customerParams = {
            ...params,
            filter: {
                ...params.filter,
                type: USER_TYPES.CUSTOMER
            }
        };
        const response = await userApi.getPaginated(customerParams);
        return {
            data: response.data.data.data,
            total: response.data.data.totalRecords
        };
    };

    return (
        <Box>
            <Breadcrumb />
            <DynamicTable
                key={refreshTrigger}
                title="Customer Management"
                columns={columns}
                fetchData={fetchCustomers}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onCreate={handleCreate}
                searchPlaceholder="Search customers by name or email..."
                searchKeys={['name', 'email']}
                filterConfig={[
                    { key: 'isActive', label: 'Status', type: 'select', options: [{ label: 'Active', value: true }, { label: 'Inactive', value: false }] }
                ]}
                renderExtraActions={(row) => (
                    <>
                        <Tooltip title="Manage Permissions">
                            <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handlePermissionClick(row); }}
                            >
                                <Shield size={16} color="#10b981" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={row.isActive ? 'Deactivate' : 'Activate'}>
                            <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleToggleStatus(row); }}
                            >
                                {row.isActive ? (
                                    <Ban size={16} color="#fbbf24" />
                                ) : (
                                    <ShieldCheck size={16} color="#10b981" />
                                )}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Reset Password">
                            <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleResetPasswordClick(row); }}
                            >
                                <Key size={16} color="#8b5cf6" />
                            </IconButton>
                        </Tooltip>
                        {Number(currentUser?.type) === USER_TYPES.MASTER_ADMIN && (
                            <Tooltip title="Login As Customer">
                                <IconButton
                                    size="small"
                                    onClick={(e) => { e.stopPropagation(); impersonate(row.id); }}
                                >
                                    <LogIn size={16} color="#f97316" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </>

                )}
            />

            <CustomerForm
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={onFormSubmit}
                initialData={selectedUser}
                loading={loading}
            />

            <ConfirmDialog
                open={confirmOpen}
                title="Delete Customer"
                message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
                onConfirm={onConfirmDelete}
                onCancel={() => setConfirmOpen(false)}
                loading={loading}
            />

            <PasswordResetModal
                open={resetPasswordOpen}
                onClose={() => setResetPasswordOpen(false)}
                userName={selectedUser?.name || ''}
                onSubmit={(password: string) => onResetPassword(selectedUser?.id, password)}
                loading={loading}
            />

            <UserPermissionModal
                open={permissionOpen}
                onClose={() => setPermissionOpen(false)}
                userName={selectedUser?.name || ''}
                initialPermissions={selectedUser?.accessPermission || []}
                onSubmit={onPermissionSubmit}
                loading={loading}
            />
        </Box>
    );
};

export default CustomerManagementPage;
