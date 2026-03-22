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

    // Categorize modules for better UX
    const CATEGORIES = [
        { 
            title: 'Security & Identity', 
            modules: [MODULES.USER, MODULES.ROLE, MODULES.ACCOUNT_DELETE_REQUEST],
            icon: <Shield size={16} />
        },
        { 
            title: 'Operations', 
            modules: [MODULES.FILE_OPERATION, MODULES.MASTER, MODULES.VERSIONMANAGER],
            icon: <Circle size={14} />
        },
        { 
            title: 'Analytics & Insight', 
            modules: [MODULES.DASH_BOARD, MODULES.USER_LOG, MODULES.ACTIVITY_LOG],
            icon: <CheckCircle2 size={16} />
        },
        { 
            title: 'System Management', 
            modules: [MODULES.SETTING, MODULES.NOTIFICATION, MODULES.STATIC_PAGE],
            icon: <Circle size={14} />
        }
    ];

    return (
        <TableContainer sx={{ maxHeight: '100%', overflow: 'auto' }}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ 
                            fontWeight: 900, 
                            color: '#0A3D62', 
                            py: 2.5, 
                            bgcolor: '#f8fafc',
                            borderBottom: '2px solid #e2e8f0',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Interaction Domain
                        </TableCell>
                        {PERMISSION_TYPES.map(type => (
                            <TableCell key={type} align="center" sx={{ 
                                fontWeight: 900, 
                                color: '#0A3D62', 
                                py: 2.5, 
                                bgcolor: '#f8fafc',
                                borderBottom: '2px solid #e2e8f0',
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                {type}
                            </TableCell>
                        ))}
                        <TableCell align="center" sx={{ 
                            fontWeight: 900, 
                            color: '#0A3D62', 
                            py: 2.5, 
                            bgcolor: '#f8fafc',
                            borderBottom: '2px solid #e2e8f0',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Batch
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {CATEGORIES.map((category) => (
                        <React.Fragment key={category.title}>
                            <TableRow sx={{ bgcolor: alpha('#0A3D62', 0.02) }}>
                                <TableCell colSpan={PERMISSION_TYPES.length + 2} sx={{ py: 1.5, px: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ color: '#0A3D62', display: 'flex' }}>{category.icon}</Box>
                                        <Typography variant="caption" sx={{ fontWeight: 900, color: '#0A3D62', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            {category.title}
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                            {category.modules.map((moduleId) => {
                                const row = normalizedPermissions.find(p => p.module === moduleId);
                                if (!row) return null;
                                const allChecked = PERMISSION_TYPES.every(t => row.permissions[t]);
                                return (
                                    <TableRow key={row.module} sx={{ '&:hover': { bgcolor: alpha('#0A3D62', 0.01) }, transition: 'background-color 0.2s' }}>
                                        <TableCell sx={{ fontWeight: 700, color: '#334155', pl: 4, py: 1.8, fontSize: '0.85rem' }}>
                                            {MODULE_LABELS[row.module] || row.name}
                                        </TableCell>
                                        {PERMISSION_TYPES.map(type => (
                                            <TableCell key={type} align="center">
                                                <Checkbox
                                                    checked={row.permissions[type]}
                                                    onChange={() => handleToggle(row.module, type)}
                                                    icon={<Box sx={{ width: 18, height: 18, borderRadius: '4px', border: '2px solid #e2e8f0' }} />}
                                                    checkedIcon={<CheckCircle2 size={20} color="#2ECC71" />}
                                                    sx={{ 
                                                        p: 0.5,
                                                        transition: 'transform 0.1s',
                                                        '&:active': { transform: 'scale(0.9)' }
                                                    }}
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
                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#0A3D62', opacity: 1 }
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};


export default PermissionMatrix;
