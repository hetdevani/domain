import React from 'react';
import {
    alpha,
    Box,
    Button,
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
    Typography,
    CircularProgress,
} from '@mui/material';
import {
    CircleHelp,
    Globe,
    Wifi,
    Server,
    Search,
    FileSearch,
    Mail,
    Plus,
    Save,
    Trash2,
    ShieldCheck,
    CalendarClock,
    BellRing,
    MessageSquare,
    CheckCircle2,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import FormModal from '../../../components/common/FormModal';
import { ButtonLoader } from '../../../components/common/Loaders';
import { MONITOR_TYPE, USER_TYPES } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
import { monitorApi } from '../api/monitorApi';
// import { useTour } from '@reactour/tour';
// import type { StepType } from '@reactour/tour';

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
    ownerId: '',
};

const MONITOR_TYPE_OPTIONS = [
    { value: MONITOR_TYPE.HTTP, label: 'HTTP(s)', icon: <Globe size={22} />, desc: 'Web & API', color: '#3498DB' },
    { value: MONITOR_TYPE.PING, label: 'Ping', icon: <Wifi size={22} />, desc: 'Host reachability', color: '#2ECC71' },
    { value: MONITOR_TYPE.TCP, label: 'TCP Ports', icon: <Server size={22} />, desc: 'Multi-port', color: '#8b5cf6' },
    { value: MONITOR_TYPE.DNS, label: 'DNS', icon: <Search size={22} />, desc: 'DNS resolution', color: '#f59e0b' },
    { value: MONITOR_TYPE.KEYWORD, label: 'Keyword', icon: <FileSearch size={22} />, desc: 'Content watch', color: '#ef4444' },
];

const getDomainTargetHostname = (target: string) => {
    const value = target.trim().replace(/^tcp:\/\//i, '');
    if (!value) return '';
    try {
        if (value.includes('://')) return new URL(value).hostname;
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
    if (user.type === USER_TYPES.MASTER_ADMIN) return [];
    return user.email ? [String(user.email).trim().toLowerCase()] : [];
};

// ─── Section Panel ────────────────────────────────────────────────────────────

const SectionPanel: React.FC<{
    step: string;
    title: string;
    info: string;
    accentColor?: string;
    children: React.ReactNode;
    className?: string;
}> = ({ step, title, info, accentColor = '#0A3D62', children, className }) => (
    <Box
        className={className}
        sx={{
            position: 'relative',
            p: { xs: 2, md: 2 },
            borderRadius: '14px',
            border: '1px solid rgba(0,0,0,0.07)',
            bgcolor: '#ffffff',
            overflow: 'hidden',
            // '&::before': {
            //     content: '""',
            //     position: 'absolute',
            //     left: 0,
            //     top: 0,
            //     bottom: 0,
            //     width: 4,
            //     borderRadius: '14px 0 0 14px',
            //     background: accentColor,
            // },
        }}
    >
        {/* Step header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5, pl: 0.5 }}>
            <Box
                sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '7px',
                    bgcolor: accentColor,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.688rem',
                    fontWeight: 800,
                    flexShrink: 0,
                    fontFamily: '"DM Sans", monospace',
                    letterSpacing: '0.02em',
                }}
            >
                {step}
            </Box>
            <Typography
                sx={{
                    fontWeight: 800,
                    color: '#0f172a',
                    fontSize: '0.9375rem',
                    letterSpacing: '-0.01em',
                    fontFamily: '"Outfit", "DM Sans", sans-serif',
                }}
            >
                {title}
            </Typography>
            <Tooltip title={info} placement="top">
                <IconButton size="small" sx={{ p: 0.4, color: '#7e8a99', '&:hover': { color: '#94a3b8' } }}>
                    <CircleHelp size={14} />
                </IconButton>
            </Tooltip>
        </Box>
        {children}
    </Box>
);

// ─── MonitorForm ──────────────────────────────────────────────────────────────

const MonitorForm: React.FC<MonitorFormProps> = ({
    open,
    onClose,
    onSubmit,
    initialData,
    loading = false,
}) => {
    const { user } = useAuth();
    // const { setSteps, setCurrentStep, setIsOpen } = useTour();
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
    const [activeStep, setActiveStep] = React.useState(0);

    React.useEffect(() => {
        if (open && user?.type === USER_TYPES.MASTER_ADMIN) {
            import('../../users/api/userApi').then(({ userApi }) => {
                userApi
                    .getPaginated({ filter: { type: USER_TYPES.CUSTOMER }, limit: 100 })
                    .then(res => setCustomers(res.data.data.data || []))
                    .catch(e => console.error('Could not fetch customers', e));
            });
        }
    }, [open, user]);

    React.useEffect(() => {
        if (!open) return;
        if (!initialData) {
            setForm({
                ...defaultState,
                emailNotifications:
                    user?.type === USER_TYPES.MASTER_ADMIN || !!user?.plan?.emailNotifications,
            });
            setNotificationEmails(getDefaultEmailRecipients(user));
            setTcpPorts([]);
            setEmailDraft('');
            setTcpPortDraft('');
            setErrors({});
            setTargetPreview(null);
            setLastPreviewKey('');
            setActiveStep(0);
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
            ownerId: initialData.ownerId || '',
        };

        if (nextForm.type === MONITOR_TYPE.KEYWORD && nextForm.url.includes('|')) {
            const [baseUrl, keyword] = nextForm.url.split('|');
            nextForm.url = baseUrl;
            nextForm.keyword = keyword || '';
        }

        if (nextForm.type === MONITOR_TYPE.TCP && nextForm.url.includes(':')) {
            const [tcpHost, ...rest] = nextForm.url.split(':');
            nextForm.tcpHost = tcpHost;
            setTcpPorts(
                rest
                    .join(':')
                    .split(',')
                    .map((item: string) => item.trim())
                    .filter(Boolean)
            );
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
        const selectedCustomer = customers.find(
            (item: any) => Number(item.id) === Number(form.ownerId)
        );
        const selectedEmail = String(selectedCustomer?.email || '').trim().toLowerCase();
        if (!selectedEmail) return;
        setNotificationEmails(prev =>
            prev.includes(selectedEmail) ? prev : [selectedEmail]
        );
    }, [open, form.ownerId, customers, user]);

    const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setErrors(prev => ({ ...prev, [key]: '' }));
        if (key === 'url' || key === 'tcpHost' || key === 'type' || key === 'domainMonitoring') {
            setTargetPreview(null);
            setLastPreviewKey('');
        }
    };

    const addEmail = () => {
        const value = emailDraft.trim().toLowerCase();
        if (!value) return;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setErrors(prev => ({ ...prev, notificationEmails: 'Enter a valid email address' }));
            return;
        }
        if (!notificationEmails.includes(value)) {
            setNotificationEmails(prev => [...prev, value]);
        }
        setEmailDraft('');
        setErrors(prev => ({ ...prev, notificationEmails: '' }));
    };

    const addTcpPort = () => {
        const value = tcpPortDraft.trim();
        if (!value) return;
        const numericValue = Number(value);
        if (!Number.isInteger(numericValue) || numericValue < 1 || numericValue > 65535) {
            setErrors(prev => ({ ...prev, tcpPorts: 'Port must be between 1 and 65535' }));
            return;
        }
        if (!tcpPorts.includes(String(numericValue))) {
            setTcpPorts(prev => [...prev, String(numericValue)]);
        }
        setTcpPortDraft('');
        setErrors(prev => ({ ...prev, tcpPorts: '' }));
        setTargetPreview(null);
        setLastPreviewKey('');
    };

    const getPreviewPayload = () => {
        let target = form.url.trim();
        if (form.type === MONITOR_TYPE.TCP) {
            target = form.tcpHost.trim();
            if (tcpPorts.length) target = `${target}:${tcpPorts.join(',')}`;
        }
        return { url: target, type: form.type, domainMonitoring: form.domainMonitoring };
    };

    const getPreviewKey = (payload: {
        url: string;
        type: number;
        domainMonitoring?: boolean;
    }) => `${payload.type}::${String(payload.url || '').trim()}::${payload.domainMonitoring ? 1 : 0}`;

    const validateTargetPreview = async (force = false) => {
        const payload = getPreviewPayload();
        if (!payload.url) return false;
        const nextPreviewKey = getPreviewKey(payload);
        if (!force && targetPreview && lastPreviewKey === nextPreviewKey) return true;

        setPreviewLoading(true);
        try {
            const response = await monitorApi.previewTarget(payload);
            setTargetPreview(response.data.data);
            setLastPreviewKey(nextPreviewKey);
            setErrors(prev => ({ ...prev, url: '', tcpHost: '', domainMonitoring: '' }));
            return true;
        } catch (error: any) {
            setTargetPreview(null);
            setLastPreviewKey('');
            const message =
                error?.response?.data?.message || error?.message || 'Target validation failed';
            if (form.type === MONITOR_TYPE.TCP) {
                setErrors(prev => ({ ...prev, tcpHost: message }));
            } else {
                setErrors(prev => ({ ...prev, url: message }));
            }
            if (form.domainMonitoring) {
                setErrors(prev => ({ ...prev, domainMonitoring: message }));
            }
            return false;
        } finally {
            setPreviewLoading(false);
        }
    };

    React.useEffect(() => {
        if (!open || !form.domainMonitoring) return;
        const hasRunnableTarget =
            form.type === MONITOR_TYPE.TCP
                ? !!form.tcpHost.trim() && tcpPorts.length > 0
                : !!form.url.trim();
        if (hasRunnableTarget) void validateTargetPreview(false);
    }, [open, form.domainMonitoring, form.type, form.url, form.tcpHost, tcpPorts.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleKeyAdd = (event: React.KeyboardEvent<HTMLElement>, handler: () => void) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            handler();
        }
    };

    const validate = () => {
        const nextErrors: Record<string, string> = {};
        if (!form.name.trim()) nextErrors.name = 'Monitor name is required';
        if (!form.type) nextErrors.type = 'Monitor type is required';

        const minInterval =
            user?.type === USER_TYPES.MASTER_ADMIN ? 1 : user?.plan?.minCheckInterval || 5;
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
            const targetForDomainValidation =
                form.type === MONITOR_TYPE.TCP ? form.tcpHost.trim() : form.url.trim();
            if (!isValidDomainMonitoringTarget(targetForDomainValidation)) {
                nextErrors.domainMonitoring =
                    'Domain expiry monitoring needs a valid domain like example.com';
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

    const handleNext = async () => {
        const nextErrors: Record<string, string> = {};

        if (activeStep === 0) {
            if (!form.name.trim()) nextErrors.name = 'Monitor name is required';
            if (!form.type) nextErrors.type = 'Monitor type is required';
            const minInterval = user?.type === USER_TYPES.MASTER_ADMIN ? 1 : user?.plan?.minCheckInterval || 5;
            const interval = Number(form.checkInterval);
            if (!Number.isInteger(interval) || interval < minInterval) {
                nextErrors.checkInterval = `Minimum ${minInterval} minute(s) required`;
            }
        }

        if (activeStep === 1) {
            if (form.type === MONITOR_TYPE.TCP) {
                if (!form.tcpHost.trim()) nextErrors.tcpHost = 'TCP host is required';
                if (!tcpPorts.length) nextErrors.tcpPorts = 'Add at least one port';
            } else if (![MONITOR_TYPE.CRON, MONITOR_TYPE.HEARTBEAT].includes(form.type)) {
                if (!form.url.trim()) nextErrors.url = 'Target is required';
            }
            if (form.type === MONITOR_TYPE.KEYWORD && !form.keyword.trim()) {
                nextErrors.keyword = 'Keyword is required for keyword monitoring';
            }
        }

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        if (activeStep === 1) {
            const hasTarget = form.type === MONITOR_TYPE.TCP
                ? !!form.tcpHost.trim() && tcpPorts.length > 0
                : !!form.url.trim();
            if (hasTarget && ![MONITOR_TYPE.CRON, MONITOR_TYPE.HEARTBEAT].includes(form.type)) {
                const isPreviewValid = await validateTargetPreview(false);
                if (!isPreviewValid) return;
            }
        }

        setActiveStep(prev => prev + 1);
    };

    const handleBack = () => {
        setErrors({});
        setActiveStep(prev => prev - 1);
    };

    const showEmailSection =
        user?.type === USER_TYPES.MASTER_ADMIN || !!user?.plan?.emailNotifications;
    const showSmsSection =
        user?.type === USER_TYPES.MASTER_ADMIN || !!user?.plan?.smsNotifications;
    // const isCustomerLogin = user?.type === USER_TYPES.CUSTOMER;
    const supportsSslMonitoring = [
        MONITOR_TYPE.HTTP,
        MONITOR_TYPE.KEYWORD,
        MONITOR_TYPE.BROWSER,
    ].includes(form.type);
    const supportsDomainMonitoring = [
        MONITOR_TYPE.HTTP,
        MONITOR_TYPE.PING,
        MONITOR_TYPE.TCP,
        MONITOR_TYPE.DNS,
        MONITOR_TYPE.KEYWORD,
        MONITOR_TYPE.BROWSER,
    ].includes(form.type);
    const showExtraOptionsStep = supportsDomainMonitoring || supportsSslMonitoring;
    const notificationStepNum = showExtraOptionsStep ? '4' : '3';
    const usesStandardTargetField = ![MONITOR_TYPE.TCP].includes(form.type);

    const targetLabel =
        form.type === MONITOR_TYPE.PING
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

    const targetPlaceholder =
        form.type === MONITOR_TYPE.HTTP
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

    const targetHelper =
        form.type === MONITOR_TYPE.CRON
            ? 'Missing pings will mark the monitor as down.'
            : form.type === MONITOR_TYPE.HEARTBEAT
                ? 'Stay healthy by sending a ping on time.'
                : form.type === MONITOR_TYPE.BROWSER
                    ? 'Runs a browser-style reachability check.'
                    : errors.url;

    // const tourSteps = React.useMemo<StepType[]>(() => {
    //     switch (activeStep) {
    //         case 0:
    //             return [
    //                 { selector: '.tour-monitor-step-basic', content: 'Start here — give your monitor a name, pick a type, and set the check interval.' },
    //             ];
    //         case 1:
    //             return [
    //                 { selector: '.tour-monitor-step-target', content: 'Enter the target for your monitor — URL, hostname, or IP depending on the type selected.' },
    //                 ...(form.type === MONITOR_TYPE.TCP ? [{ selector: '.tour-monitor-tcp-ports', content: 'Add the TCP ports you want to check for this host.' }] : []),
    //             ];
    //         case 2:
    //             return showExtraOptionsStep ? [
    //                 { selector: '.tour-monitor-step-options', content: 'Optional extras — enable domain expiry tracking, SSL certificate alerts, and blacklist monitoring.' },
    //                 ...(form.domainMonitoring ? [{ selector: '.tour-monitor-domain-live', content: 'Live domain details fetched in real-time from WHOIS.' }] : []),
    //             ] : [];
    //         default:
    //             return [
    //                 { selector: '.tour-monitor-step-alerts', content: 'Set up your notification channels — get alerted via email or SMS when your monitor goes down.' },
    //             ];
    //     }
    // }, [activeStep, form.type, form.domainMonitoring, showExtraOptionsStep]);

    // const startGuidedTour = () => {
    //     if (!isCustomerLogin) return;
    //     setSteps?.(tourSteps);
    //     setCurrentStep?.(0);
    //     setIsOpen?.(true);
    // };

    React.useEffect(() => {
        if (!supportsSslMonitoring && form.sslMonitoring) updateField('sslMonitoring', false);
        if (!supportsDomainMonitoring && form.domainMonitoring) updateField('domainMonitoring', false);
    }, [form.type, supportsSslMonitoring, supportsDomainMonitoring]); // eslint-disable-line react-hooks/exhaustive-deps

    const selectedTypeOption = MONITOR_TYPE_OPTIONS.find(o => o.value === form.type);

    const steps = React.useMemo(() => {
        const s = [
            { label: 'Basic Setup', color: '#0A3D62' },
            { label: 'Target', color: selectedTypeOption?.color || '#3498DB' },
        ];
        if (showExtraOptionsStep) s.push({ label: 'Options', color: '#f59e0b' });
        s.push({ label: 'Notifications', color: '#2ECC71' });
        return s;
    }, [showExtraOptionsStep, selectedTypeOption?.color]);

    const isLastStep = activeStep === steps.length - 1;

    // If extra options step disappears (type change), clamp activeStep
    React.useEffect(() => {
        if (!showExtraOptionsStep && activeStep >= 2) {
            setActiveStep(1);
        }
    }, [showExtraOptionsStep]); // eslint-disable-line react-hooks/exhaustive-deps

    const footerActions = (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Button
                variant="text"
                color="inherit"
                onClick={onClose}
                disabled={loading}
                sx={{ px: { xs: 1.5, md: 2.5 }, py: 1, borderRadius: '10px', fontWeight: 600, color: 'text.secondary', fontSize: { xs: '0.82rem', md: '0.875rem' }, '&:hover': { bgcolor: alpha('#000', 0.05) } }}
            >
                Cancel
            </Button>
            <Box sx={{ flex: 1 }} />
            {activeStep > 0 && (
                <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={loading}
                    startIcon={<ChevronLeft size={15} />}
                    sx={{ px: { xs: 1.5, md: 3 }, py: 1, borderRadius: '10px', fontWeight: 600, fontSize: { xs: '0.82rem', md: '0.875rem' }, borderColor: '#e2e8f0', color: '#334155', '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' } }}
                >
                    Back
                </Button>
            )}
            {isLastStep ? (
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading ? null : (initialData ? <Save size={16} /> : <Plus size={16} />)}
                    sx={{
                        px: { xs: 2, md: 4 }, py: 1, borderRadius: '10px', fontWeight: 700,
                        fontSize: { xs: '0.82rem', md: '0.95rem' },
                        backgroundColor: initialData ? '#0A3D62' : '#2ECC71',
                        boxShadow: `0 8px 20px -4px ${alpha(initialData ? '#0A3D62' : '#2ECC71', 0.4)}`,
                        minWidth: { xs: 'unset', md: 160 },
                        '&:hover': { backgroundColor: initialData ? '#072e4a' : '#27ae60' },
                        '&.Mui-disabled': { backgroundColor: alpha(initialData ? '#0A3D62' : '#2ECC71', 0.5), color: '#fff' },
                    }}
                >
                    {loading ? <ButtonLoader /> : (initialData ? 'Update' : 'Confirm & Add')}
                </Button>
            ) : (
                <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={previewLoading}
                    endIcon={<ChevronRight size={15} />}
                    sx={{
                        px: { xs: 2, md: 4 }, py: 1, borderRadius: '10px', fontWeight: 700,
                        fontSize: { xs: '0.82rem', md: '0.875rem' },
                        minWidth: { xs: 'unset', md: 130 },
                        backgroundColor: steps[activeStep]?.color || '#0A3D62',
                        boxShadow: `0 8px 20px -4px ${alpha(steps[activeStep]?.color || '#0A3D62', 0.35)}`,
                        '&:hover': { backgroundColor: steps[activeStep]?.color || '#0A3D62', filter: 'brightness(0.9)' },
                        '&.Mui-disabled': { backgroundColor: alpha(steps[activeStep]?.color || '#0A3D62', 0.5), color: '#fff' },
                    }}
                >
                    {previewLoading ? <ButtonLoader /> : 'Next'}
                </Button>
            )}
        </Box>
    );

    return (
        <FormModal
            open={open}
            onClose={onClose}
            title={initialData ? 'Update Monitor' : 'Add New Monitor'}
            isEdit={!!initialData}
            loading={loading}
            onSubmit={handleSubmit}
            maxWidth="xl"
            footerActions={footerActions}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Guide Me button */}
                {/* {isCustomerLogin && (
                    <Chip
                        label="Guide Me"
                        size="small"
                        clickable
                        onClick={startGuidedTour}
                        sx={{
                            ml: 2,
                            flexShrink: 0,
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            bgcolor: alpha(steps[activeStep]?.color || '#0A3D62', 0.08),
                            color: steps[activeStep]?.color || '#0A3D62',
                            border: '1px solid',
                            borderColor: alpha(steps[activeStep]?.color || '#0A3D62', 0.2),
                            alignSelf: 'flex-start',
                        }}
                    />
                )} */}
                {/* ── Custom Step Indicator ── */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    {/* Step circles + connectors */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                        {steps.map((step, idx) => (
                            <React.Fragment key={step.label}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
                                    <Box
                                        onClick={() => idx < activeStep && setActiveStep(idx)}
                                        sx={{
                                            width: { xs: 30, md: 36 },
                                            height: { xs: 30, md: 36 },
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: idx < activeStep ? '#2ECC71' : idx === activeStep ? step.color : '#f1f5f9',
                                            color: idx <= activeStep ? '#fff' : '#94a3b8',
                                            fontWeight: 800,
                                            fontSize: { xs: '0.78rem', md: '0.875rem' },
                                            border: `2px solid ${idx < activeStep ? '#2ECC71' : idx === activeStep ? step.color : '#e2e8f0'}`,
                                            boxShadow: idx === activeStep ? `0 4px 14px ${alpha(step.color, 0.35)}` : 'none',
                                            cursor: idx < activeStep ? 'pointer' : 'default',
                                            transition: 'all 0.2s',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {idx < activeStep ? <CheckCircle2 size={15} /> : idx + 1}
                                    </Box>
                                    <Typography sx={{
                                        fontSize: { xs: '0.62rem', md: '0.7rem' },
                                        fontWeight: idx === activeStep ? 700 : 500,
                                        color: idx === activeStep ? step.color : idx < activeStep ? '#64748b' : '#94a3b8',
                                        whiteSpace: 'nowrap',
                                        textAlign: 'center',
                                        display: { xs: idx === activeStep ? 'block' : 'none', md: 'block' },
                                        transition: 'color 0.2s',
                                        letterSpacing: '0.01em',
                                    }}>
                                        {step.label}
                                    </Typography>
                                </Box>
                                {idx < steps.length - 1 && (
                                    <Box sx={{
                                        flex: 1,
                                        height: 2,
                                        mt: { xs: '14px', md: '17px' },
                                        bgcolor: idx < activeStep ? '#2ECC71' : '#e2e8f0',
                                        transition: 'background-color 0.3s ease',
                                        mx: { xs: 0.5, md: 1 },
                                        borderRadius: 1,
                                    }} />
                                )}
                            </React.Fragment>
                        ))}
                    </Box>


                </Box>

                {/* ── Customer Assignment (admin only, shown on step 0) ── */}
                {activeStep === 0 && user?.type === USER_TYPES.MASTER_ADMIN && (
                    <FormControl fullWidth size="small">
                        <InputLabel>Assign to Customer</InputLabel>
                        <Select
                            value={form.ownerId}
                            label="Assign to Customer"
                            onChange={e => updateField('ownerId', e.target.value as number | '')}
                        >
                            <MenuItem value="">Select Customer</MenuItem>
                            {customers.map(customer => (
                                <MenuItem key={customer.id} value={customer.id}>
                                    {customer.name} ({customer.email})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                {/* ── Step 1: Basic Setup ── */}
                {activeStep === 0 && <SectionPanel
                    step="1"
                    title="Basic Setup"
                    info="Choose monitor name, type, and check interval."
                    accentColor="#0A3D62"
                    className="tour-monitor-step-basic"
                >
                    <Grid container spacing={2.5}>
                        {/* Monitor Name */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Monitor Name"
                                placeholder="e.g. Production Website"
                                value={form.name}
                                onChange={e => updateField('name', e.target.value)}
                                error={!!errors.name}
                                helperText={errors.name}
                            />
                        </Grid>

                        {/* Check Interval */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Check Interval (Minutes)"
                                value={form.checkInterval}
                                onChange={e => updateField('checkInterval', e.target.value)}
                                error={!!errors.checkInterval}
                                helperText={
                                    errors.checkInterval ||
                                    `Min ${user?.type === USER_TYPES.MASTER_ADMIN ? 1 : user?.plan?.minCheckInterval || 5} min for your plan`
                                }
                            />
                        </Grid>

                        {/* Monitor Type Cards */}
                        <Grid size={{ xs: 12 }}>
                            <Typography
                                sx={{
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: '#64748b',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.07em',
                                    mb: 1.25,
                                }}
                            >
                                Monitor Type
                            </Typography>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(5, 1fr)' },
                                    gap: { xs: 1, md: 1.25 },
                                }}
                            >
                                {MONITOR_TYPE_OPTIONS.map(option => {
                                    const isSelected = form.type === option.value;
                                    return (
                                        <Box
                                            key={option.value}
                                            onClick={() => updateField('type', option.value)}
                                            sx={{
                                                p: { xs: 1.25, md: 1.75 },
                                                borderRadius: '12px',
                                                border: `1.5px solid ${isSelected ? option.color : 'rgba(0,0,0,0.09)'}`,
                                                bgcolor: isSelected
                                                    ? alpha(option.color, 0.07)
                                                    : '#FAFBFC',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 0.75,
                                                position: 'relative',
                                                '&:hover': {
                                                    borderColor: option.color,
                                                    bgcolor: alpha(option.color, 0.05),
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: `0 4px 12px ${alpha(option.color, 0.12)}`,
                                                },
                                            }}
                                        >
                                            {isSelected && (
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 6,
                                                        right: 6,
                                                        color: option.color,
                                                    }}
                                                >
                                                    <CheckCircle2 size={13} />
                                                </Box>
                                            )}
                                            <Box
                                                sx={{
                                                    color: isSelected ? option.color : '#94a3b8',
                                                    transition: 'color 0.15s ease',
                                                }}
                                            >
                                                {option.icon}
                                            </Box>
                                            <Typography
                                                sx={{
                                                    fontWeight: 700,
                                                    fontSize: '0.78rem',
                                                    color: isSelected ? option.color : '#374151',
                                                    textAlign: 'center',
                                                    lineHeight: 1.2,
                                                    transition: 'color 0.15s ease',
                                                }}
                                            >
                                                {option.label}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: '0.65rem',
                                                    color: '#94a3b8',
                                                    textAlign: 'center',
                                                    lineHeight: 1.2,
                                                }}
                                            >
                                                {option.desc}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                            {errors.type && (
                                <FormHelperText error sx={{ mt: 0.5 }}>
                                    {errors.type}
                                </FormHelperText>
                            )}
                        </Grid>
                    </Grid>
                </SectionPanel>
                }

                {/* ── Step 2: Target Configuration ── */}
                {activeStep === 1 && <SectionPanel
                    step="2"
                    title="Target Configuration"
                    info="Input fields adapt based on the monitor type selected above."
                    accentColor={selectedTypeOption?.color || '#3498DB'}
                    className="tour-monitor-step-target"
                >
                    <Grid container spacing={2.5}>
                        {/* Standard URL field */}
                        {usesStandardTargetField && (
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label={targetLabel}
                                    placeholder={targetPlaceholder}
                                    value={form.url}
                                    onChange={e => updateField('url', e.target.value)}
                                    onBlur={() => {
                                        if (form.url.trim()) void validateTargetPreview(false);
                                    }}
                                    error={!!errors.url}
                                    helperText={
                                        errors.url ||
                                        (targetPreview?.hostname && form.type !== MONITOR_TYPE.TCP
                                            ? `✓ Validated: ${targetPreview.hostname}`
                                            : targetHelper)
                                    }
                                    InputProps={{
                                        endAdornment: previewLoading ? (
                                            <CircularProgress size={14} sx={{ color: '#94a3b8' }} />
                                        ) : targetPreview?.hostname && !errors.url ? (
                                            <CheckCircle2 size={16} color="#10b981" />
                                        ) : null,
                                    }}
                                />
                            </Grid>
                        )}

                        {/* Keyword field */}
                        {form.type === MONITOR_TYPE.KEYWORD && (
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Keyword to Watch"
                                    placeholder="Enter expected keyword on the page"
                                    value={form.keyword}
                                    onChange={e => updateField('keyword', e.target.value)}
                                    error={!!errors.keyword}
                                    helperText={
                                        errors.keyword ||
                                        'Monitor fails when this keyword is absent from the response'
                                    }
                                />
                            </Grid>
                        )}

                        {/* Cron / Heartbeat info box */}
                        {(form.type === MONITOR_TYPE.CRON || form.type === MONITOR_TYPE.HEARTBEAT) && (
                            <Grid size={{ xs: 12 }}>
                                <Box
                                    sx={{
                                        p: 2.25,
                                        borderRadius: '10px',
                                        border: '1px dashed rgba(10,61,98,0.2)',
                                        bgcolor: alpha('#0A3D62', 0.03),
                                        display: 'flex',
                                        gap: 1.5,
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    <AlertCircle size={16} color="#0A3D62" style={{ marginTop: 2, flexShrink: 0 }} />
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0A3D62', mb: 0.4 }}>
                                            {form.type === MONITOR_TYPE.CRON
                                                ? 'Cron monitor behavior'
                                                : 'Heartbeat monitor behavior'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {form.type === MONITOR_TYPE.CRON
                                                ? 'Your cron job must call the generated ping URL on schedule. Missing pings create incidents.'
                                                : 'Your app or worker must call the generated ping URL regularly. Missing pings mark the monitor as down.'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        )}

                        {/* TCP fields */}
                        {form.type === MONITOR_TYPE.TCP && (
                            <>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="TCP Host"
                                        placeholder="example.com or 192.168.1.10"
                                        value={form.tcpHost}
                                        onChange={e => updateField('tcpHost', e.target.value)}
                                        onBlur={() => {
                                            if (form.tcpHost.trim() && tcpPorts.length)
                                                void validateTargetPreview(false);
                                        }}
                                        error={!!errors.tcpHost}
                                        helperText={
                                            errors.tcpHost || 'One host, many ports — counts as one monitor.'
                                        }
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Add TCP Port"
                                        placeholder="Type port and press Enter (e.g. 443)"
                                        value={tcpPortDraft}
                                        onChange={e => setTcpPortDraft(e.target.value)}
                                        onKeyDown={e => handleKeyAdd(e, addTcpPort)}
                                        error={!!errors.tcpPorts}
                                        helperText={
                                            errors.tcpPorts || 'Ports: 80, 443, 8080 — press Enter after each.'
                                        }
                                        InputProps={{
                                            endAdornment: (
                                                <IconButton size="small" onClick={addTcpPort} sx={{ color: '#0A3D62' }}>
                                                    <Plus size={16} />
                                                </IconButton>
                                            ),
                                        }}
                                    />
                                </Grid>

                                {/* TCP Ports list */}
                                <Grid size={{ xs: 12 }} className="tour-monitor-tcp-ports">
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: '10px',
                                            border: '1px dashed rgba(139,92,246,0.25)',
                                            bgcolor: alpha('#8b5cf6', 0.03),
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
                                            <Server size={14} color="#8b5cf6" />
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: '#8b5cf6',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.07em',
                                                    fontSize: '0.65rem',
                                                }}
                                            >
                                                Active TCP Ports
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                            {tcpPorts.length === 0 ? (
                                                <Typography variant="caption" color="text.secondary">
                                                    No ports added yet. Add ports one by one above.
                                                </Typography>
                                            ) : (
                                                tcpPorts.map(port => (
                                                    <Chip
                                                        key={port}
                                                        label={`Port ${port}`}
                                                        size="small"
                                                        onDelete={() => {
                                                            setTcpPorts(prev => prev.filter(p => p !== port));
                                                            setTargetPreview(null);
                                                            setLastPreviewKey('');
                                                        }}
                                                        deleteIcon={<Trash2 size={12} />}
                                                        sx={{
                                                            fontWeight: 700,
                                                            bgcolor: alpha('#8b5cf6', 0.1),
                                                            color: '#8b5cf6',
                                                            border: '1px solid',
                                                            borderColor: alpha('#8b5cf6', 0.25),
                                                        }}
                                                    />
                                                ))
                                            )}
                                        </Box>
                                    </Box>
                                </Grid>
                            </>
                        )}
                    </Grid>
                </SectionPanel>
                }

                {/* ── Step 3: Extra Monitoring Options ── */}
                {activeStep === 2 && showExtraOptionsStep && (
                    <SectionPanel
                        step="3"
                        title="Extra Monitoring Options"
                        info="Enable only options relevant to this monitor type. Unsupported options are hidden automatically."
                        accentColor="#f59e0b"
                        className="tour-monitor-step-options"
                    >
                        <Grid container spacing={2}>
                            {/* Domain Monitoring toggle */}
                            {supportsDomainMonitoring && (
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: '10px',
                                            border: `1px solid ${form.domainMonitoring ? alpha('#f59e0b', 0.35) : 'rgba(0,0,0,0.07)'}`,
                                            bgcolor: form.domainMonitoring ? alpha('#f59e0b', 0.04) : '#FAFBFC',
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={form.domainMonitoring}
                                                    onChange={e =>
                                                        updateField('domainMonitoring', e.target.checked)
                                                    }
                                                    size="small"
                                                />
                                            }
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                    <CalendarClock size={15} color="#f59e0b" />
                                                    <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                                                        Domain Expiry Monitoring
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5, pl: 4 }}>
                                            Track domain registration expiry dates
                                        </Typography>
                                        {errors.domainMonitoring && (
                                            <FormHelperText error sx={{ pl: 4, mt: 0.25 }}>
                                                {errors.domainMonitoring}
                                            </FormHelperText>
                                        )}
                                    </Box>
                                </Grid>
                            )}

                            {/* Blacklist Monitoring toggle */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: '10px',
                                        border: `1px solid ${form.blacklistMonitoring ? alpha('#ef4444', 0.3) : 'rgba(0,0,0,0.07)'}`,
                                        bgcolor: form.blacklistMonitoring ? alpha('#ef4444', 0.03) : '#FAFBFC',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={form.blacklistMonitoring}
                                                onChange={e =>
                                                    updateField('blacklistMonitoring', e.target.checked)
                                                }
                                                size="small"
                                            />
                                        }
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                <AlertCircle size={15} color="#ef4444" />
                                                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                                                    Blacklist Monitoring
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5, pl: 4 }}>
                                        Check against Spamhaus, Barracuda & major RBLs
                                    </Typography>
                                </Box>
                            </Grid>

                            {/* SSL Monitoring toggle */}
                            {supportsSslMonitoring && (
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: '10px',
                                            border: `1px solid ${form.sslMonitoring ? alpha('#2ECC71', 0.35) : 'rgba(0,0,0,0.07)'}`,
                                            bgcolor: form.sslMonitoring ? alpha('#2ECC71', 0.04) : '#FAFBFC',
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={form.sslMonitoring}
                                                    onChange={e =>
                                                        updateField('sslMonitoring', e.target.checked)
                                                    }
                                                    size="small"
                                                />
                                            }
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                    <ShieldCheck size={15} color="#2ECC71" />
                                                    <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                                                        SSL Certificate Monitoring
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5, pl: 4 }}>
                                            Alert before certificate expires
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}

                            {/* SSL Notify Days */}
                            {form.sslMonitoring && (
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        label="Notify Before Expiry (Days)"
                                        value={form.sslNotifyDays}
                                        onChange={e => updateField('sslNotifyDays', e.target.value)}
                                        helperText="Get notified this many days before the SSL cert expires"
                                    />
                                </Grid>
                            )}

                            {/* Domain preview loading */}
                            {previewLoading && (
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CircularProgress size={14} sx={{ color: '#f59e0b' }} />
                                        <Typography variant="caption" color="text.secondary">
                                            Validating target and fetching live domain details…
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}

                            {/* Domain preview card */}
                            {form.domainMonitoring && targetPreview?.domain && (
                                <Grid size={{ xs: 12 }} className="tour-monitor-domain-live">
                                    <Box
                                        sx={{
                                            p: 2.5,
                                            borderRadius: '12px',
                                            border: '1px solid',
                                            borderColor: alpha('#f59e0b', 0.25),
                                            bgcolor: alpha('#f59e0b', 0.04),
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                            <CalendarClock size={15} color="#f59e0b" />
                                            <Typography
                                                sx={{
                                                    fontWeight: 800,
                                                    color: '#0f172a',
                                                    fontSize: '0.875rem',
                                                    fontFamily: '"Outfit", "DM Sans", sans-serif',
                                                }}
                                            >
                                                Live Domain Details
                                            </Typography>
                                        </Box>
                                        <Grid container spacing={1.5}>
                                            {[
                                                { label: 'Domain', value: targetPreview.domain.domain },
                                                { label: 'Source', value: targetPreview.domain.source || 'Not available' },
                                                { label: 'Registrar', value: targetPreview.domain.registrar || 'Not available' },
                                                {
                                                    label: 'Expiry Date',
                                                    value: targetPreview.domain.expirationDate
                                                        ? new Date(targetPreview.domain.expirationDate).toLocaleDateString()
                                                        : 'Not available',
                                                },
                                                {
                                                    label: 'Days Remaining',
                                                    value:
                                                        targetPreview.domain.expiresInDays != null
                                                            ? `${targetPreview.domain.expiresInDays} day(s)`
                                                            : 'Not available',
                                                },
                                            ].map(item => (
                                                <Grid key={item.label} size={{ xs: 6, md: 4 }}>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: '#94a3b8',
                                                            display: 'block',
                                                            mb: 0.25,
                                                            fontWeight: 600,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.06em',
                                                            fontSize: '0.65rem',
                                                        }}
                                                    >
                                                        {item.label}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ fontWeight: 700, color: '#0f172a', wordBreak: 'break-word' }}
                                                    >
                                                        {item.value}
                                                    </Typography>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </SectionPanel>
                )}

                {/* ── Step 4: Notification Channels ── */}
                {isLastStep && <SectionPanel
                    step={notificationStepNum}
                    title="Notification Channels"
                    info="Configure recipients for monitor down/up alerts."
                    accentColor="#2ECC71"
                    className="tour-monitor-step-alerts"
                >
                    <Grid container spacing={2}>
                        {/* Email toggle */}
                        {showEmailSection && (
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: '10px',
                                        border: `1px solid ${form.emailNotifications ? alpha('#2ECC71', 0.3) : 'rgba(0,0,0,0.07)'}`,
                                        bgcolor: form.emailNotifications ? alpha('#2ECC71', 0.04) : '#FAFBFC',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={form.emailNotifications}
                                                onChange={e =>
                                                    updateField('emailNotifications', e.target.checked)
                                                }
                                                size="small"
                                            />
                                        }
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                <BellRing size={15} color="#2ECC71" />
                                                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                                                    Email Alerts
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5, pl: 4 }}>
                                        Send alerts to email recipients
                                    </Typography>
                                </Box>
                            </Grid>
                        )}

                        {/* SMS toggle */}
                        {showSmsSection && (
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: '10px',
                                        border: `1px solid ${form.smsNotifications ? alpha('#3498DB', 0.3) : 'rgba(0,0,0,0.07)'}`,
                                        bgcolor: form.smsNotifications ? alpha('#3498DB', 0.04) : '#FAFBFC',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={form.smsNotifications}
                                                onChange={e =>
                                                    updateField('smsNotifications', e.target.checked)
                                                }
                                                size="small"
                                            />
                                        }
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                <MessageSquare size={15} color="#3498DB" />
                                                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                                                    SMS Alerts
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5, pl: 4 }}>
                                        Send alerts to mobile number
                                    </Typography>
                                </Box>
                            </Grid>
                        )}

                        {/* Email input + chips */}
                        {form.emailNotifications && (
                            <>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Add Notification Email"
                                        placeholder="Type email and press Enter"
                                        value={emailDraft}
                                        onChange={e => setEmailDraft(e.target.value)}
                                        onKeyDown={e => handleKeyAdd(e, addEmail)}
                                        error={!!errors.notificationEmails}
                                        helperText={
                                            errors.notificationEmails ||
                                            'Add recipients one by one. Press Enter after each.'
                                        }
                                        InputProps={{
                                            startAdornment: (
                                                <Mail size={15} style={{ marginRight: 8, color: '#94a3b8', flexShrink: 0 }} />
                                            ),
                                            endAdornment: (
                                                <IconButton
                                                    size="small"
                                                    onClick={addEmail}
                                                    sx={{ color: '#0A3D62' }}
                                                >
                                                    <Plus size={16} />
                                                </IconButton>
                                            ),
                                        }}
                                    />
                                </Grid>
                                {notificationEmails.length > 0 && (
                                    <Grid size={{ xs: 12 }}>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                            {notificationEmails.map(email => (
                                                <Chip
                                                    key={email}
                                                    label={email}
                                                    size="small"
                                                    onDelete={() =>
                                                        setNotificationEmails(prev =>
                                                            prev.filter(e => e !== email)
                                                        )
                                                    }
                                                    deleteIcon={<Trash2 size={12} />}
                                                    icon={<Mail size={12} />}
                                                    sx={{
                                                        fontWeight: 600,
                                                        bgcolor: alpha('#2ECC71', 0.08),
                                                        color: '#15803d',
                                                        border: '1px solid',
                                                        borderColor: alpha('#2ECC71', 0.25),
                                                        '& .MuiChip-icon': { color: '#15803d' },
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </Grid>
                                )}
                            </>
                        )}

                        {/* SMS number inputs */}
                        {form.smsNotifications && (
                            <>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Country Code"
                                        placeholder="+91"
                                        value={form.notificationCountryCode}
                                        onChange={e =>
                                            updateField('notificationCountryCode', e.target.value)
                                        }
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 8 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Mobile Number"
                                        placeholder="9876543210"
                                        value={form.notificationMobile}
                                        onChange={e =>
                                            updateField('notificationMobile', e.target.value)
                                        }
                                        error={!!errors.notificationMobile}
                                        helperText={errors.notificationMobile}
                                        InputProps={{
                                            startAdornment: (
                                                <MessageSquare
                                                    size={15}
                                                    style={{ marginRight: 8, color: '#94a3b8', flexShrink: 0 }}
                                                />
                                            ),
                                        }}
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </SectionPanel>
                }
            </Box>
        </FormModal>
    );
};

export default MonitorForm;
