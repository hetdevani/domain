import React, { useState, useEffect } from 'react';
import { Box, Typography, alpha } from '@mui/material';
import FormModal from '../../../components/common/FormModal';
import PermissionMatrix from './PermissionMatrix';
import { type PermissionModule } from '../../../types';

interface UserPermissionModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (permissions: PermissionModule[]) => void;
    userName: string;
    initialPermissions: PermissionModule[];
    loading?: boolean;
}

const UserPermissionModal: React.FC<UserPermissionModalProps> = ({
    open,
    onClose,
    onSubmit,
    userName,
    initialPermissions,
    loading = false
}) => {
    const [permissions, setPermissions] = useState<PermissionModule[]>([]);

    useEffect(() => {
        if (open) {
            let parsedPermissions = initialPermissions;
            if (typeof (initialPermissions as any) === 'string' && (initialPermissions as any).trim() !== '') {
                try {
                    parsedPermissions = JSON.parse(initialPermissions as any);
                } catch (e) {
                    console.error("Failed to parse initial permissions:", e);
                    parsedPermissions = [];
                }
            }
            setPermissions(Array.isArray(parsedPermissions) ? parsedPermissions : []);
        }
    }, [open, initialPermissions]);

    const handleSave = () => {
        onSubmit(permissions);
    };

    return (
        <FormModal
            open={open}
            onClose={onClose}
            title={`Manage Permissions: ${userName}`}
            isEdit={true}
            loading={loading}
            submitLabel="Save Permissions"
            onSubmit={handleSave}
            maxWidth="md"
        >
            <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, bgcolor: alpha('#0A3D62', 0.04), p: 2, borderRadius: '12px', border: '1px solid', borderColor: alpha('#0A3D62', 0.1) }}>
                    Customize granular access for <strong>{userName}</strong>. These settings will override default role permissions.
                </Typography>
            </Box>

            <PermissionMatrix
                permissions={permissions}
                onChange={setPermissions}
            />
        </FormModal>
    );
};

export default UserPermissionModal;
