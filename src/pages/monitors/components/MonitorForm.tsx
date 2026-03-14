import React from 'react';
import {
    alpha,
    Box,
    Chip,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
    Typography
} from '@mui/material';
import { Mail, Plus, Server, Trash2 } from 'lucide-react';
import FormModal from '../../../components/common/FormModal';
import { MONITOR_TYPE, USER_TYPES } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
import { monitorApi } from '../api/monitorApi';

interface MonitorFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: any;
    loading?: boolean;
}

type FormState = {
    name: string;
    url: string;
    type: number;
    checkInterval: number | string;
    keyword: string;
    tcpHost: string;
    sslMonitoring: boolean;
    sslNotifyDays: number | string;
    domainMonitoring: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    notificationCountryCode: string;
    notificationMobile: string;
    ownerId: number | '';
};

type TargetPreview = {
    isValid: boolean;
    normalizedTarget?: string;
    hostname?: string;
    domain?: {
        domain: string;
        source: string | null;
        registrar: string | null;
        expirationDate: string | null;
        expiresInDays: number | null;
    };
};

const defaultState: FormState = {
    name: '',
    url: '',
    type: MONITOR_TYPE.HTTP,
    checkInterval: 5,
    keyword: '',
    tcpHost: '',
    sslMonitoring: false,
    sslNotifyDays: 7,
    domainMonitoring: false,
    emailNotifications: true,
    smsNotifications: false,
    notificationCountryCode: '+91',
    notificationMobile: '',
    ownerId: ''
};

const getDomainTargetHostname = (target: string) => {
    const value = target.trim().replace(/^tcp:\/\//i, '');
    if (!value) return '';

    try {
        if (value.includes('://')) {
            return new URL(value).hostname;
        }
        return new URL(`https://${value}`).hostname;
    } catch {
        return value.split('/')[0].trim();
    }
};

const isValidDomainMonitoringTarget = (target: string) => {
    const hostname = getDomainTargetHostname(target);
    if (!hostname) return false;
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return false;
    if (hostname.includes(' ')) return false;

    return /^(?=.{1,253}$)(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$/.test(hostname);
};

const MonitorForm: React.FC<MonitorFormProps> = ({
    open,
    onClose,
    onSubmit,
    initialData,
    loading = false
}) => {
    const { user } = useAuth();
    const [customers, setCustomers] = React.useState<any[]>([]);
    const [form, setForm] = React.useState<FormState>(defaultState);
    const [notificationEmails, setNotificationEmails] = React.useState<string[]>([]);
    const [emailDraft, setEmailDraft] = React.useState('');
    const [tcpPorts, setTcpPorts] = React.useState<string[]>([]);
    const [tcpPortDraft, setTcpPortDraft] = React.useState('');
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [targetPreview, setTargetPreview] = React.useState<TargetPreview | null>(null);
    const [previewLoading, setPreviewLoading] = React.useState(false);

    React.useEffect(() => {
        if (open && user?.type === USER_TYPES.MASTER_ADMIN) {
            import('../../users/api/userApi').then(({ userApi }) => {
                userApi.getPaginated({ filter: { type: USER_TYPES.CUSTOMER }, limit: 100 })
                    .then((res) => setCustomers(res.data.data.data || []))
                    .catch((e) => console.error('Could not fetch customers', e));
            });
        }
    }, [open, user]);

    React.useEffect(() => {
        if (!open) return;

        if (!initialData) {
            setForm({
                ...defaultState,
                emailNotifications: user?.type === USER_TYPES.MASTER_ADMIN || !!user?.plan?.emailNotifications,
            });
            setNotificationEmails([]);
            setTcpPorts([]);
            setEmailDraft('');
            setTcpPortDraft('');
            setErrors({});
            setTargetPreview(null);
            return;
        }

        const nextForm: FormState = {
            name: initialData.name || '',
            url: initialData.url || '',
            type: initialData.type || MONITOR_TYPE.HTTP,
            checkInterval: initialData.checkInterval ?? 5,
            keyword: '',
            tcpHost: '',
            sslMonitoring: !!initialData.sslMonitoring,
            sslNotifyDays: initialData.sslNotifyDays ?? 7,
            domainMonitoring: !!initialData.domainMonitoring,
            emailNotifications: !!initialData.emailNotifications,
            smsNotifications: !!initialData.smsNotifications,
            notificationCountryCode: initialData.notificationCountryCode || '+91',
            notificationMobile: initialData.notificationMobile || '',
            ownerId: initialData.ownerId || ''
        };

        if (nextForm.type === MONITOR_TYPE.KEYWORD && nextForm.url.includes('|')) {
            const [baseUrl, keyword] = nextForm.url.split('|');
            nextForm.url = baseUrl;
            nextForm.keyword = keyword || '';
        }

        if (nextForm.type === MONITOR_TYPE.TCP && nextForm.url.includes(':')) {
            const [tcpHost, ...rest] = nextForm.url.split(':');
            nextForm.tcpHost = tcpHost;
            setTcpPorts(rest.join(':').split(',').map((item: string) => item.trim()).filter(Boolean));
        } else {
            setTcpPorts([]);
        }

        setNotificationEmails(
            (initialData.notificationEmails || '')
                .split(',')
                .map((item: string) => item.trim())
                .filter(Boolean)
        );
        setEmailDraft('');
        setTcpPortDraft('');
        setErrors({});
        setTargetPreview(null);
        setForm(nextForm);
    }, [open, initialData, user]);

    const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: '' }));
        if (key === 'url' || key === 'tcpHost' || key === 'type' || key === 'domainMonitoring') {
            setTargetPreview(null);
        }
    };

    const addEmail = () => {
        const value = emailDraft.trim().toLowerCase();
        if (!value) return;
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!isValid) {
            setErrors((prev) => ({ ...prev, notificationEmails: 'Enter a valid email address' }));
            return;
        }
        if (!notificationEmails.includes(value)) {
            setNotificationEmails((prev) => [...prev, value]);
        }
        setEmailDraft('');
        setErrors((prev) => ({ ...prev, notificationEmails: '' }));
    };

    const addTcpPort = () => {
        const value = tcpPortDraft.trim();
        if (!value) return;
        const numericValue = Number(value);
        if (!Number.isInteger(numericValue) || numericValue < 1 || numericValue > 65535) {
            setErrors((prev) => ({ ...prev, tcpPorts: 'Port must be between 1 and 65535' }));
            return;
        }
        if (!tcpPorts.includes(String(numericValue))) {
            setTcpPorts((prev) => [...prev, String(numericValue)]);
        }
        setTcpPortDraft('');
        setErrors((prev) => ({ ...prev, tcpPorts: '' }));
        setTargetPreview(null);
    };

    const getPreviewPayload = () => {
        let target = form.url.trim();

        if (form.type === MONITOR_TYPE.TCP) {
            target = form.tcpHost.trim();
            if (tcpPorts.length) {
                target = `${target}:${tcpPorts.join(',')}`;
            }
        }

        return {
            url: target,
            type: form.type,
            domainMonitoring: form.domainMonitoring
        };
    };

    const validateTargetPreview = async () => {
        const payload = getPreviewPayload();
        if (!payload.url) return false;

        setPreviewLoading(true);
        try {
            const response = await monitorApi.previewTarget(payload);
            setTargetPreview(response.data.data);
            setErrors((prev) => ({
                ...prev,
                url: '',
                tcpHost: '',
                domainMonitoring: ''
            }));
            return true;
        } catch (error: any) {
            setTargetPreview(null);
            const message = error?.response?.data?.message || error?.message || 'Target validation failed';
            if (form.type === MONITOR_TYPE.TCP) {
                setErrors((prev) => ({ ...prev, tcpHost: message }));
            } else {
                setErrors((prev) => ({ ...prev, url: message }));
            }
            if (form.domainMonitoring) {
                setErrors((prev) => ({ ...prev, domainMonitoring: message }));
            }
            return false;
        } finally {
            setPreviewLoading(false);
        }
    };

    React.useEffect(() => {
        if (!open || !form.domainMonitoring) return;

        const hasRunnableTarget = form.type === MONITOR_TYPE.TCP
            ? !!form.tcpHost.trim() && tcpPorts.length > 0
            : !!form.url.trim();

        if (hasRunnableTarget) {
            void validateTargetPreview();
        }
    }, [open, form.domainMonitoring, form.type, form.url, form.tcpHost, tcpPorts.join(',')]);

    const handleKeyAdd = (
        event: React.KeyboardEvent<HTMLElement>,
        handler: () => void
    ) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            handler();
        }
    };

    const validate = () => {
        const nextErrors: Record<string, string> = {};

        if (!form.name.trim()) nextErrors.name = 'Monitor name is required';
        if (!form.type) nextErrors.type = 'Monitor type is required';

        const minInterval = user?.type === USER_TYPES.MASTER_ADMIN ? 1 : (user?.plan?.minCheckInterval || 5);
        const interval = Number(form.checkInterval);
        if (!Number.isInteger(interval) || interval < minInterval) {
            nextErrors.checkInterval = `Minimum ${minInterval} minute(s) required`;
        }

        if (form.type === MONITOR_TYPE.TCP) {
            if (!form.tcpHost.trim()) nextErrors.tcpHost = 'TCP host is required';
            if (!tcpPorts.length) nextErrors.tcpPorts = 'Add at least one port';
        } else if (!form.url.trim()) {
            nextErrors.url = 'Target is required';
        }

        if (form.type === MONITOR_TYPE.KEYWORD && !form.keyword.trim()) {
            nextErrors.keyword = 'Keyword is required for keyword monitoring';
        }

        if (form.domainMonitoring) {
            const targetForDomainValidation = form.type === MONITOR_TYPE.TCP
                ? form.tcpHost.trim()
                : form.url.trim();

            if (!isValidDomainMonitoringTarget(targetForDomainValidation)) {
                nextErrors.domainMonitoring = 'Domain expiry monitoring needs a valid domain like example.com or https://example.com';
            }
        }

        if (form.emailNotifications && !notificationEmails.length) {
            nextErrors.notificationEmails = 'Add at least one notification email';
        }

        if (form.smsNotifications && !form.notificationMobile.trim()) {
            nextErrors.notificationMobile = 'Mobile number is required for SMS alerts';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        const isPreviewValid = await validateTargetPreview();
        if (!isPreviewValid) return;

        const payload: any = {
            name: form.name.trim(),
            type: form.type,
            checkInterval: Number(form.checkInterval),
            sslMonitoring: form.sslMonitoring,
            sslNotifyDays: Number(form.sslNotifyDays || 7),
            domainMonitoring: form.domainMonitoring,
            emailNotifications: form.emailNotifications,
            smsNotifications: form.smsNotifications,
            notificationEmails: notificationEmails.join(','),
            notificationCountryCode: form.notificationCountryCode.trim() || '+91',
            notificationMobile: form.notificationMobile.trim() || undefined,
        };

        if (user?.type === USER_TYPES.MASTER_ADMIN && form.ownerId) {
            payload.ownerId = form.ownerId;
        }

        if (form.type === MONITOR_TYPE.TCP) {
            payload.url = `${form.tcpHost.trim()}:${tcpPorts.join(',')}`;
        } else if (form.type === MONITOR_TYPE.KEYWORD) {
            payload.url = `${form.url.trim()}|${form.keyword.trim()}`;
        } else {
            payload.url = form.url.trim();
        }

        onSubmit(payload);
    };

    const showEmailSection = user?.type === USER_TYPES.MASTER_ADMIN || !!user?.plan?.emailNotifications;
    const showSmsSection = user?.type === USER_TYPES.MASTER_ADMIN || !!user?.plan?.smsNotifications;

    return (
        <FormModal
            open={open}
            onClose={onClose}
            title={initialData ? 'Update Monitor Settings' : 'Add New Monitor'}
            isEdit={!!initialData}
            loading={loading}
            onSubmit={handleSubmit}
            maxWidth="xl"
        >
            <Grid container spacing={3}>
                {user?.type === USER_TYPES.MASTER_ADMIN && (
                    <Grid size={{ xs: 12 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Assign to Customer</InputLabel>
                            <Select
                                value={form.ownerId}
                                label="Assign to Customer"
                                onChange={(e) => updateField('ownerId', e.target.value as number | '')}
                            >
                                <MenuItem value="">Select Customer</MenuItem>
                                {customers.map((customer) => (
                                    <MenuItem key={customer.id} value={customer.id}>
                                        {customer.name} ({customer.email})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                )}

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Monitor Name"
                        placeholder="e.g. Production Website"
                        value={form.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth size="small" error={!!errors.type}>
                        <InputLabel>Check Type</InputLabel>
                        <Select
                            value={form.type}
                            label="Check Type"
                            onChange={(e) => updateField('type', Number(e.target.value))}
                        >
                            <MenuItem value={MONITOR_TYPE.HTTP}>HTTP(s)</MenuItem>
                            <MenuItem value={MONITOR_TYPE.PING}>Ping</MenuItem>
                            <MenuItem value={MONITOR_TYPE.TCP}>TCP Multi-Port</MenuItem>
                            <MenuItem value={MONITOR_TYPE.DNS}>DNS</MenuItem>
                            <MenuItem value={MONITOR_TYPE.KEYWORD}>Keyword</MenuItem>
                        </Select>
                        {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                    </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Check Interval (Minutes)"
                        value={form.checkInterval}
                        onChange={(e) => updateField('checkInterval', e.target.value)}
                        error={!!errors.checkInterval}
                        helperText={errors.checkInterval || `Minimum ${user?.type === USER_TYPES.MASTER_ADMIN ? 1 : (user?.plan?.minCheckInterval || 5)} minute(s) for your access level`}
                    />
                </Grid>

                {form.type !== MONITOR_TYPE.TCP && (
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            size="small"
                            label={form.type === MONITOR_TYPE.PING ? 'Host or IP' : 'Target URL / Domain'}
                            placeholder={form.type === MONITOR_TYPE.HTTP ? 'https://example.com' : 'example.com'}
                            value={form.url}
                            onChange={(e) => updateField('url', e.target.value)}
                            onBlur={() => {
                                if (form.url.trim()) {
                                    void validateTargetPreview();
                                }
                            }}
                            error={!!errors.url}
                            helperText={errors.url || (targetPreview?.hostname && form.type !== MONITOR_TYPE.TCP ? `Validated host: ${targetPreview.hostname}` : '')}
                        />
                    </Grid>
                )}

                {form.type === MONITOR_TYPE.KEYWORD && (
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Keyword to Watch"
                            placeholder="Press enter after typing the keyword you expect on the page"
                            value={form.keyword}
                            onChange={(e) => updateField('keyword', e.target.value)}
                            error={!!errors.keyword}
                            helperText={errors.keyword || 'The monitor will fail when this keyword is missing from the response'}
                        />
                    </Grid>
                )}

                {form.type === MONITOR_TYPE.TCP && (
                    <>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="TCP Host"
                                placeholder="example.com or 192.168.1.10"
                                value={form.tcpHost}
                                onChange={(e) => updateField('tcpHost', e.target.value)}
                                onBlur={() => {
                                    if (form.tcpHost.trim() && tcpPorts.length) {
                                        void validateTargetPreview();
                                    }
                                }}
                                error={!!errors.tcpHost}
                                helperText={errors.tcpHost || 'One host, many ports. It still counts as one monitor.'}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Add TCP Port"
                                placeholder="Type port and press Enter"
                                value={tcpPortDraft}
                                onChange={(e) => setTcpPortDraft(e.target.value)}
                                onKeyDown={(e) => handleKeyAdd(e, addTcpPort)}
                                error={!!errors.tcpPorts}
                                helperText={errors.tcpPorts || 'Example: 80, 443, 8080. Press Enter after each port.'}
                                InputProps={{
                                    endAdornment: (
                                        <Box
                                            component="button"
                                            type="button"
                                            onClick={addTcpPort}
                                            sx={{
                                                border: 0,
                                                bgcolor: 'transparent',
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: '#0A3D62',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Plus size={18} />
                                        </Box>
                                    )
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    border: '1px dashed rgba(10,61,98,0.25)',
                                    bgcolor: alpha('#0A3D62', 0.02)
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <Server size={16} color="#0A3D62" />
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0A3D62' }}>
                                        Active TCP Ports
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {tcpPorts.length === 0 ? (
                                        <Typography variant="caption" color="text.secondary">
                                            No ports added yet. Add ports one by one with Enter.
                                        </Typography>
                                    ) : (
                                        tcpPorts.map((port) => (
                                            <Chip
                                                key={port}
                                                label={`Port ${port}`}
                                                onDelete={() => setTcpPorts((prev) => prev.filter((item) => item !== port))}
                                                deleteIcon={<Trash2 size={14} />}
                                                sx={{ fontWeight: 700, bgcolor: alpha('#0A3D62', 0.08), color: '#0A3D62' }}
                                            />
                                        ))
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                    </>
                )}

                <Grid size={{ xs: 12, md: 6 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={form.domainMonitoring}
                                onChange={(e) => updateField('domainMonitoring', e.target.checked)}
                            />
                        }
                        label="Enable Domain Expiry Monitoring"
                    />
                    <FormHelperText error={!!errors.domainMonitoring} sx={{ ml: 0 }}>
                        {errors.domainMonitoring || 'Only selected monitors with a valid real domain will be scanned for expiry warnings.'}
                    </FormHelperText>
                </Grid>

                {previewLoading && (
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="caption" color="text.secondary">
                            Validating target and loading live domain details...
                        </Typography>
                    </Grid>
                )}

                {form.domainMonitoring && targetPreview?.domain && (
                    <Grid size={{ xs: 12 }}>
                        <Box
                            sx={{
                                p: 2.5,
                                borderRadius: 3,
                                border: '1px solid rgba(245,158,11,0.2)',
                                bgcolor: alpha('#f59e0b', 0.05)
                            }}
                        >
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0A3D62', mb: 1.5 }}>
                                Live Domain Details
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Typography variant="caption" color="text.secondary">Domain</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                                        {targetPreview.domain.domain}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Typography variant="caption" color="text.secondary">Source</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827', wordBreak: 'break-word' }}>
                                        {targetPreview.domain.source || 'Not available'}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Typography variant="caption" color="text.secondary">Registrar</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                                        {targetPreview.domain.registrar || 'Not available'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                )}

                <Grid size={{ xs: 12, md: 6 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={form.sslMonitoring}
                                onChange={(e) => updateField('sslMonitoring', e.target.checked)}
                            />
                        }
                        label="Enable SSL Certificate Monitoring"
                    />
                </Grid>

                {form.sslMonitoring && (
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Notify Before Expiry (Days)"
                            value={form.sslNotifyDays}
                            onChange={(e) => updateField('sslNotifyDays', e.target.value)}
                        />
                    </Grid>
                )}

                <Grid size={{ xs: 12 }}>
                    <Box
                        sx={{
                            p: 2.5,
                            borderRadius: 4,
                            bgcolor: '#F8FAFC',
                            border: '1px solid rgba(0,0,0,0.06)'
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0A3D62', mb: 2 }}>
                            Notification Channels
                        </Typography>

                        <Grid container spacing={2.5}>
                            {showEmailSection && (
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={form.emailNotifications}
                                                onChange={(e) => updateField('emailNotifications', e.target.checked)}
                                            />
                                        }
                                        label="Email Alerts"
                                    />
                                </Grid>
                            )}

                            {showSmsSection && (
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={form.smsNotifications}
                                                onChange={(e) => updateField('smsNotifications', e.target.checked)}
                                            />
                                        }
                                        label="SMS Alerts"
                                    />
                                </Grid>
                            )}

                            {form.emailNotifications && (
                                <>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Add Notification Email"
                                            placeholder="Type email and press Enter"
                                            value={emailDraft}
                                            onChange={(e) => setEmailDraft(e.target.value)}
                                            onKeyDown={(e) => handleKeyAdd(e, addEmail)}
                                            error={!!errors.notificationEmails}
                                            helperText={errors.notificationEmails || 'Add recipients one by one. No comma-separated text needed.'}
                                            InputProps={{
                                                startAdornment: <Mail size={16} style={{ marginRight: 8, color: '#64748b' }} />,
                                                endAdornment: (
                                                    <Box
                                                        component="button"
                                                        type="button"
                                                        onClick={addEmail}
                                                        sx={{
                                                            border: 0,
                                                            bgcolor: 'transparent',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            color: '#0A3D62',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <Plus size={18} />
                                                    </Box>
                                                )
                                            }}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {notificationEmails.length === 0 ? (
                                                <Typography variant="caption" color="text.secondary">
                                                    No notification emails added yet.
                                                </Typography>
                                            ) : (
                                                notificationEmails.map((email) => (
                                                    <Chip
                                                        key={email}
                                                        label={email}
                                                        onDelete={() => setNotificationEmails((prev) => prev.filter((item) => item !== email))}
                                                        deleteIcon={<Trash2 size={14} />}
                                                        sx={{ fontWeight: 700 }}
                                                    />
                                                ))
                                            )}
                                        </Box>
                                    </Grid>
                                </>
                            )}

                            {form.smsNotifications && (
                                <>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Country Code"
                                            placeholder="+91"
                                            value={form.notificationCountryCode}
                                            onChange={(e) => updateField('notificationCountryCode', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 8 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Mobile Number"
                                            placeholder="9876543210"
                                            value={form.notificationMobile}
                                            onChange={(e) => updateField('notificationMobile', e.target.value)}
                                            error={!!errors.notificationMobile}
                                            helperText={errors.notificationMobile}
                                        />
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </Box>
                </Grid> 
            </Grid>
        </FormModal>
    );
};

export default MonitorForm;
