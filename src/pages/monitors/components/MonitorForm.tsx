import React from 'react';
import {
    alpha,
    Box,
    Chip,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { CircleHelp, Mail, Plus, Server, Trash2 } from 'lucide-react';
import FormModal from '../../../components/common/FormModal';
import { MONITOR_TYPE, USER_TYPES } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
import { monitorApi } from '../api/monitorApi';
import { useTour } from '@reactour/tour';
import type { StepType } from '@reactour/tour';

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
    blacklistMonitoring: boolean;
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
    blacklistMonitoring: false,
    emailNotifications: true,
    smsNotifications: false,
    notificationCountryCode: '+91',
    notificationMobile: '',
    ownerId: ''
};

const MONITOR_TYPE_OPTIONS = [
    { value: MONITOR_TYPE.HTTP, label: 'HTTP(s)' },
    { value: MONITOR_TYPE.PING, label: 'Ping' },
    { value: MONITOR_TYPE.TCP, label: 'TCP Multi-Port' },
    { value: MONITOR_TYPE.DNS, label: 'DNS' },
    { value: MONITOR_TYPE.KEYWORD, label: 'Keyword' },
    // { value: MONITOR_TYPE.CRON, label: 'Cron Job' },
    // { value: MONITOR_TYPE.HEARTBEAT, label: 'Heartbeat' },
    // { value: MONITOR_TYPE.BROWSER, label: 'Headless Browser' },
];

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

const getDefaultEmailRecipients = (user: any): string[] => {
    if (!user) return [];
    if (user.type === USER_TYPES.MASTER_ADMIN) {
        return [];
    }
    return user.email ? [String(user.email).trim().toLowerCase()] : [];
};

const SectionTitle: React.FC<{ step: string; title: string; info: string }> = ({ step, title, info }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Chip
            size="small"
            label={step}
            sx={{
                height: 22,
                fontWeight: 800,
                bgcolor: alpha('#0A3D62', 0.08),
                color: '#0A3D62',
                borderRadius: 1.5
            }}
        />
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0A3D62' }}>
            {title}
        </Typography>
        <Tooltip title={info} placement="top">
            <IconButton size="small" sx={{ p: 0.5, color: '#64748b' }}>
                <CircleHelp size={14} />
            </IconButton>
        </Tooltip>
    </Box>
);

const MonitorForm: React.FC<MonitorFormProps> = ({
    open,
    onClose,
    onSubmit,
    initialData,
    loading = false
}) => {
    const { user } = useAuth();
    const { setSteps, setCurrentStep, setIsOpen } = useTour();
    const [customers, setCustomers] = React.useState<any[]>([]);
    const [form, setForm] = React.useState<FormState>(defaultState);
    const [notificationEmails, setNotificationEmails] = React.useState<string[]>([]);
    const [emailDraft, setEmailDraft] = React.useState('');
    const [tcpPorts, setTcpPorts] = React.useState<string[]>([]);
    const [tcpPortDraft, setTcpPortDraft] = React.useState('');
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [targetPreview, setTargetPreview] = React.useState<TargetPreview | null>(null);
    const [previewLoading, setPreviewLoading] = React.useState(false);
    const [lastPreviewKey, setLastPreviewKey] = React.useState('');

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
            setNotificationEmails(getDefaultEmailRecipients(user));
            setTcpPorts([]);
            setEmailDraft('');
            setTcpPortDraft('');
            setErrors({});
            setTargetPreview(null);
            setLastPreviewKey('');
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
            blacklistMonitoring: !!initialData.blacklistMonitoring,
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
            ((initialData.notificationEmails || '') as string)
                .split(',')
                .map((item: string) => item.trim().toLowerCase())
                .filter(Boolean)
        );
        setEmailDraft('');
        setTcpPortDraft('');
        setErrors({});
        setTargetPreview(null);
        setLastPreviewKey('');
        setForm(nextForm);
    }, [open, initialData, user]);

    React.useEffect(() => {
        if (!open || !user || user.type !== USER_TYPES.MASTER_ADMIN) return;
        if (!form.ownerId) return;

        const selectedCustomer = customers.find((item: any) => Number(item.id) === Number(form.ownerId));
        const selectedEmail = String(selectedCustomer?.email || '').trim().toLowerCase();

        if (!selectedEmail) return;
        setNotificationEmails((prev) => (prev.includes(selectedEmail) ? prev : [selectedEmail]));
    }, [open, form.ownerId, customers, user]);

    const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: '' }));
        if (key === 'url' || key === 'tcpHost' || key === 'type' || key === 'domainMonitoring') {
            setTargetPreview(null);
            setLastPreviewKey('');
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
        setLastPreviewKey('');
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

    const getPreviewKey = (payload: { url: string; type: number; domainMonitoring?: boolean }) =>
        `${payload.type}::${String(payload.url || '').trim()}::${payload.domainMonitoring ? 1 : 0}`;

    const validateTargetPreview = async (force = false) => {
        const payload = getPreviewPayload();
        if (!payload.url) return false;
        const nextPreviewKey = getPreviewKey(payload);

        if (!force && targetPreview && lastPreviewKey === nextPreviewKey) {
            return true;
        }

        setPreviewLoading(true);
        try {
            const response = await monitorApi.previewTarget(payload);
            setTargetPreview(response.data.data);
            setLastPreviewKey(nextPreviewKey);
            setErrors((prev) => ({
                ...prev,
                url: '',
                tcpHost: '',
                domainMonitoring: ''
            }));
            return true;
        } catch (error: any) {
            setTargetPreview(null);
            setLastPreviewKey('');
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
            void validateTargetPreview(false);
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

        const isPreviewValid = await validateTargetPreview(false);
        if (!isPreviewValid) return;

        const payload: any = {
            name: form.name.trim(),
            type: form.type,
            checkInterval: Number(form.checkInterval),
            sslMonitoring: form.sslMonitoring,
            sslNotifyDays: Number(form.sslNotifyDays || 7),
            domainMonitoring: form.domainMonitoring,
            retryLogic: 1,
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
    const isCustomerLogin = user?.type === USER_TYPES.CUSTOMER;
    const supportsSslMonitoring = [MONITOR_TYPE.HTTP, MONITOR_TYPE.KEYWORD, MONITOR_TYPE.BROWSER].includes(form.type);
    const supportsDomainMonitoring = [MONITOR_TYPE.HTTP, MONITOR_TYPE.PING, MONITOR_TYPE.TCP, MONITOR_TYPE.DNS, MONITOR_TYPE.KEYWORD, MONITOR_TYPE.BROWSER].includes(form.type);
    const showExtraOptionsStep = supportsDomainMonitoring || supportsSslMonitoring;
    const notificationStepLabel = showExtraOptionsStep ? 'Step 4' : 'Step 3';
    const usesStandardTargetField = ![MONITOR_TYPE.TCP].includes(form.type);
    const targetLabel = form.type === MONITOR_TYPE.PING
        ? 'Host or IP'
        : form.type === MONITOR_TYPE.DNS
            ? 'Domain Name'
            : form.type === MONITOR_TYPE.CRON
                ? 'Cron Job Name or Source'
                : form.type === MONITOR_TYPE.HEARTBEAT
                    ? 'Heartbeat Name or Source'
                    : form.type === MONITOR_TYPE.BROWSER
                        ? 'Browser Test URL'
                        : 'Target URL / Domain';
    const targetPlaceholder = form.type === MONITOR_TYPE.HTTP
        ? 'https://example.com'
        : form.type === MONITOR_TYPE.PING
            ? 'example.com or 8.8.8.8'
            : form.type === MONITOR_TYPE.DNS
                ? 'example.com'
                : form.type === MONITOR_TYPE.CRON
                    ? 'nightly-data-sync'
                    : form.type === MONITOR_TYPE.HEARTBEAT
                        ? 'primary-worker-heartbeat'
                        : form.type === MONITOR_TYPE.BROWSER
                            ? 'https://example.com/login'
                            : 'example.com';
    const targetHelper = form.type === MONITOR_TYPE.CRON
        ? 'Use a recognizable job/source name. The monitor will be marked down if its expected ping is missed.'
        : form.type === MONITOR_TYPE.HEARTBEAT
            ? 'Use a recognizable service/source name. The monitor stays healthy when your service sends a ping in time.'
            : form.type === MONITOR_TYPE.BROWSER
                ? 'Runs a browser-style reachability check against this page URL.'
                : errors.url;

    const tourSteps = React.useMemo<StepType[]>(() => {
        const steps: StepType[] = [
            {
                selector: '.tour-monitor-step-basic',
                content: 'Step 1: Set monitor name, type, and check interval.',
            },
            {
                selector: '.tour-monitor-step-target',
                content: 'Step 2: Fill target input based on selected monitor type.',
            },
        ];

        if (showExtraOptionsStep) {
            steps.push({
                selector: '.tour-monitor-step-options',
                content: 'Step 3: Optional SSL/domain monitoring options.',
            });
        }

        steps.push({
            selector: '.tour-monitor-step-alerts',
            content: `${notificationStepLabel}: Configure email and SMS alerts.`,
        });

        if (form.type === MONITOR_TYPE.TCP) {
            steps.push({
                selector: '.tour-monitor-tcp-ports',
                content: 'Add multiple TCP ports here. This still counts as one monitor.',
            });
        }

        if (form.domainMonitoring) {
            steps.push({
                selector: '.tour-monitor-domain-live',
                content: 'After validation, live domain details show here.',
            });
        }

        return steps;
    }, [form.type, form.domainMonitoring, notificationStepLabel, showExtraOptionsStep]);

    const startGuidedTour = () => {
        if (!isCustomerLogin) return;
        setSteps?.(tourSteps);
        setCurrentStep?.(0);
        setIsOpen?.(true);
    };

    React.useEffect(() => {
        if (!supportsSslMonitoring && form.sslMonitoring) {
            updateField('sslMonitoring', false);
        }
        if (!supportsDomainMonitoring && form.domainMonitoring) {
            updateField('domainMonitoring', false);
        }
    }, [form.type, supportsSslMonitoring, supportsDomainMonitoring]); // eslint-disable-line react-hooks/exhaustive-deps

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
                <Grid size={{ xs: 12 }} className="tour-monitor-step-basic">
                    <SectionTitle
                        step="Step 1"
                        title="Basic Setup"
                        info="Choose monitor owner (if admin), name, type, and check interval first."
                    />
                    {isCustomerLogin && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                            <Chip
                                label="Guide Me"
                                size="small"
                                clickable
                                onClick={startGuidedTour}
                                sx={{ fontWeight: 700, bgcolor: alpha('#0A3D62', 0.08), color: '#0A3D62' }}
                            />
                        </Box>
                    )}
                </Grid>

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
                            {MONITOR_TYPE_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
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

                <Grid size={{ xs: 12 }} className="tour-monitor-step-target">
                    <SectionTitle
                        step="Step 2"
                        title="Target Configuration"
                        info="Input fields change by monitor type so users enter only what is needed."
                    />
                </Grid>

                {usesStandardTargetField && (
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            size="small"
                            label={targetLabel}
                            placeholder={targetPlaceholder}
                            value={form.url}
                            onChange={(e) => updateField('url', e.target.value)}
                            onBlur={() => {
                                if (form.url.trim()) {
                                    void validateTargetPreview(false);
                                }
                            }}
                            error={!!errors.url}
                            helperText={errors.url || (targetPreview?.hostname && form.type !== MONITOR_TYPE.TCP ? `Validated host: ${targetPreview.hostname}` : targetHelper)}
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

                {(form.type === MONITOR_TYPE.CRON || form.type === MONITOR_TYPE.HEARTBEAT) && (
                    <Grid size={{ xs: 12 }}>
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                border: '1px dashed rgba(10,61,98,0.2)',
                                bgcolor: alpha('#0A3D62', 0.03)
                            }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0A3D62', mb: 0.5 }}>
                                {form.type === MONITOR_TYPE.CRON ? 'Cron monitor behavior' : 'Heartbeat monitor behavior'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {form.type === MONITOR_TYPE.CRON
                                    ? 'After creation, your cron job should call the generated ping URL on schedule. Missing pings will create incidents.'
                                    : 'After creation, your app or worker should call the generated ping URL regularly. Missing pings will mark the monitor as down.'}
                            </Typography>
                        </Box>
                    </Grid>
                )}

                {form.type === MONITOR_TYPE.BROWSER && (
                    <Grid size={{ xs: 12 }}>
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                border: '1px dashed rgba(10,61,98,0.2)',
                                bgcolor: alpha('#0A3D62', 0.03)
                            }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0A3D62', mb: 0.5 }}>
                                Headless browser monitor
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Use this when you want browser-style page validation instead of a basic HTTP check.
                            </Typography>
                        </Box>
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
                                        void validateTargetPreview(false);
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

                        <Grid size={{ xs: 12 }} className="tour-monitor-tcp-ports">
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
                                                onDelete={() => {
                                                    setTcpPorts((prev) => prev.filter((item) => item !== port));
                                                    setTargetPreview(null);
                                                    setLastPreviewKey('');
                                                }}
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

                {showExtraOptionsStep && (
                    <Grid size={{ xs: 12 }} className="tour-monitor-step-options">
                        <SectionTitle
                            step="Step 3"
                            title="Extra Monitoring Options"
                            info="Enable only relevant options for this monitor type. Unsupported options are hidden automatically."
                        />
                    </Grid>
                )}

                {showExtraOptionsStep && supportsDomainMonitoring && (
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
                            {errors.domainMonitoring || 'Only valid domain targets are allowed for domain expiry scans.'}
                        </FormHelperText>
                    </Grid>
                )}

                {showExtraOptionsStep && (
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={form.blacklistMonitoring}
                                    onChange={(e) => updateField('blacklistMonitoring', e.target.checked)}
                                />
                            }
                            label="Enable Blacklist Monitoring"
                        />
                        <FormHelperText sx={{ ml: 0 }}>
                            Check if domain/IP is listed on major RBLs (Spamhaus, Barracuda, etc).
                        </FormHelperText>
                    </Grid>
                )}

                {previewLoading && (
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="caption" color="text.secondary">
                            Validating target and loading live domain details...
                        </Typography>
                    </Grid>
                )}

                {form.domainMonitoring && targetPreview?.domain && (
                    <Grid size={{ xs: 12 }} className="tour-monitor-domain-live">
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
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Typography variant="caption" color="text.secondary">Expiry Date</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                                        {targetPreview.domain.expirationDate
                                            ? new Date(targetPreview.domain.expirationDate).toLocaleDateString()
                                            : 'Not available'}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Typography variant="caption" color="text.secondary">Days Remaining</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                                        {targetPreview.domain.expiresInDays != null
                                            ? `${targetPreview.domain.expiresInDays} day(s)`
                                            : 'Not available'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                )}

                {showExtraOptionsStep && supportsSslMonitoring && (
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
                )}

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

                <Grid size={{ xs: 12 }} className="tour-monitor-step-alerts">
                    <Box
                        sx={{
                            p: 2.5,
                            borderRadius: 4,
                            bgcolor: '#F8FAFC',
                            border: '1px solid rgba(0,0,0,0.06)'
                        }}
                    >
                        <SectionTitle
                            step={notificationStepLabel}
                            title="Notification Channels"
                            info="Configure recipients and phone number for monitor alerts."
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                            Currently active channels for monitor alerts: Email and SMS.
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
