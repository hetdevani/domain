import React, { useMemo } from 'react';
import {
    Box,
    Checkbox,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    alpha,
    Switch
} from '@mui/material';
import { Shield, CheckCircle2, Circle } from 'lucide-react';
import { MODULES, type PermissionModule, type Permissions } from '../../../types';

interface PermissionMatrixProps {
    permissions: PermissionModule[];
    onChange: (permissions: PermissionModule[]) => void;
}

const MODULE_LABELS: Record<number, string> = {
    [MODULES.USER]: 'User Management',
    [MODULES.ROLE]: 'Role Management',
    [MODULES.USER_LOG]: 'User Logs',
    [MODULES.FILE_OPERATION]: 'File Operations',
    [MODULES.DASH_BOARD]: 'Dashboard Access',
    [MODULES.SETTING]: 'System Settings',
    [MODULES.MASTER]: 'Master Data',
    [MODULES.NOTIFICATION]: 'Notifications',
    [MODULES.STATIC_PAGE]: 'Static Pages',
    [MODULES.ACCOUNT_DELETE_REQUEST]: 'Account Deletion Requests',
    [MODULES.ACTIVITY_LOG]: 'Activity Logs',
    [MODULES.VERSIONMANAGER]: 'Version Management',
};

const PERMISSION_TYPES: (keyof Permissions)[] = ['list', 'view', 'insert', 'update', 'delete'];

const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ permissions, onChange }) => {
    // Ensure we have entries for all modules
    const normalizedPermissions = useMemo(() => {
        let safePermissions: PermissionModule[] = [];

        if (Array.isArray(permissions)) {
            safePermissions = permissions;
        } else if (typeof (permissions as any) === 'string' && (permissions as any).trim() !== '') {
            try {
                safePermissions = JSON.parse(permissions as any);
            } catch (e) {
                console.error("Failed to parse permissions string:", e);
                safePermissions = [];
            }
        }

        const currentMap = new Map(safePermissions.map(p => [p.module, p]));
        return Object.entries(MODULES).map(([key, value]) => {
            const existing = currentMap.get(value);
            if (existing) return existing;
            return {
                module: value,
                name: key,
                permissions: {
                    list: false,
                    view: false,
                    insert: false,
                    update: false,
                    delete: false
                }
            };
        });
    }, [permissions]);

    const handleToggle = (module: number, type: keyof Permissions) => {
        const updated = normalizedPermissions.map(p => {
            if (p.module === module) {
                return {
                    ...p,
                    permissions: {
                        ...p.permissions,
                        [type]: !p.permissions[type]
                    }
                };
            }
            return p;
        });
        onChange(updated);
    };

    const handleToggleRow = (module: number, checked: boolean) => {
        const updated = normalizedPermissions.map(p => {
            if (p.module === module) {
                return {
                    ...p,
                    permissions: {
                        list: checked,
                        view: checked,
                        insert: checked,
                        update: checked,
                        delete: checked
                    }
                };
            }
            return p;
        });
        onChange(updated);
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0A3D62', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Shield size={20} /> Access Permissions
            </Typography>
            <TableContainer component={Paper} sx={{ borderRadius: '16px', border: '1px solid', borderColor: alpha('#000', 0.08), boxShadow: 'none', overflow: 'hidden' }}>
                <Table size="small">
                    <TableHead sx={{ bgcolor: alpha('#0A3D62', 0.04) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: '#0A3D62', py: 2 }}>Module Name</TableCell>
                            {PERMISSION_TYPES.map(type => (
                                <TableCell key={type} align="center" sx={{ fontWeight: 700, color: '#0A3D62', py: 2, textTransform: 'capitalize' }}>
                                    {type}
                                </TableCell>
                            ))}
                            <TableCell align="center" sx={{ fontWeight: 700, color: '#0A3D62', py: 2 }}>All</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {normalizedPermissions.map((row) => {
                            const allChecked = PERMISSION_TYPES.every(t => row.permissions[t]);
                            return (
                                <TableRow key={row.module} sx={{ '&:hover': { bgcolor: alpha('#0A3D62', 0.02) } }}>
                                    <TableCell sx={{ fontWeight: 600, color: '#4B5563' }}>
                                        {MODULE_LABELS[row.module] || row.name}
                                    </TableCell>
                                    {PERMISSION_TYPES.map(type => (
                                        <TableCell key={type} align="center">
                                            <Checkbox
                                                checked={row.permissions[type]}
                                                onChange={() => handleToggle(row.module, type)}
                                                icon={<Circle size={20} color={alpha('#000', 0.2)} />}
                                                checkedIcon={<CheckCircle2 size={20} color="#2ECC71" />}
                                                sx={{ p: 0.5 }}
                                            />
                                        </TableCell>
                                    ))}
                                    <TableCell align="center">
                                        <Switch
                                            size="small"
                                            checked={allChecked}
                                            onChange={(e) => handleToggleRow(row.module, e.target.checked)}
                                            sx={{
                                                '& .MuiSwitch-switchBase.Mui-checked': { color: '#0A3D62' },
                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#0A3D62' }
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default PermissionMatrix;
