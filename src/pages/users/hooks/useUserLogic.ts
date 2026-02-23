import { useState, useCallback } from 'react';
import { userApi } from '../api/userApi';
import toast from 'react-hot-toast';

export const useUserLogic = () => {
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refreshTable = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    const handleCreate = () => {
        setSelectedUser(null);
        setModalOpen(true);
    };

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const handleDeleteClick = (user: any) => {
        setSelectedUser(user);
        setConfirmOpen(true);
    };

    const onFormSubmit = async (data: any) => {
        setLoading(true);
        try {
            // Aggressively strip all server-side metadata, Sequelize fields, and internal state
            const {
                id,
                createdAt,
                updatedAt,
                deletedAt,
                isDeleted,
                isActive,
                uniqueCode,
                parentId,
                sessionSummary,
                role,
                androidPlayerId,
                iosPlayerId,
                otp,
                otpSentTime,
                socketConnection,
                lastSocketConnection,
                isTwoFactorEnabled,
                secretKey,
                adminId,
                parent,
                image,
                ...sanitizedData
            } = data;

            if (selectedUser) {
                const { password, ...updateData } = sanitizedData;
                await userApi.update(selectedUser.id, updateData);
                toast.success('User updated successfully');
            } else {
                await userApi.create(sanitizedData);
                toast.success('User created successfully');
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
        if (!selectedUser) return;
        setLoading(true);
        try {
            await userApi.delete(selectedUser.id);
            toast.success('User deleted successfully');
            setConfirmOpen(false);
            refreshTable();
        } catch (error: any) {
            toast.error(error.message || 'Deletion failed');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (user: any) => {
        setLoading(true);
        try {
            if (user.isActive) {
                await userApi.deactivate(user.id);
                toast.success('User deactivated successfully');
            } else {
                await userApi.activate(user.id);
                toast.success('User activated successfully');
            }
            refreshTable();
        } catch (error: any) {
            toast.error(error.message || 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    const onResetPassword = async (userId: number, newPassword: string) => {
        setLoading(true);
        try {
            await userApi.resetPassword(userId, newPassword);
            toast.success('Password reset successfully');
            return true;
        } catch (error: any) {
            toast.error(error.message || 'Reset failed');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
    const [permissionOpen, setPermissionOpen] = useState(false);

    const handleResetPasswordClick = (user: any) => {
        setSelectedUser(user);
        setResetPasswordOpen(true);
    };

    const handlePermissionClick = (user: any) => {
        setSelectedUser(user);
        setPermissionOpen(true);
    };

    const onPermissionSubmit = async (permissions: any) => {
        if (!selectedUser) return;
        setLoading(true);
        try {
            await userApi.update(selectedUser.id, { accessPermission: permissions });
            toast.success('Permissions updated successfully');
            setPermissionOpen(false);
            refreshTable();
        } catch (error: any) {
            toast.error(error.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return {
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
        onPermissionSubmit,
        refreshTable,
    };
};
