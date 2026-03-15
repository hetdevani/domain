import React, { useState } from 'react';
import {
    Box, Typography, Container, TextField, Button, Paper,
    CircularProgress, Accordion, AccordionSummary, AccordionDetails,
    Switch, FormControlLabel, Grid, Collapse, Divider
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, ChevronDown, AlertCircle, CheckCircle, XCircle,
    Lock, Shield, Settings, Send, Server
} from 'lucide-react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import SEOHead from '../../components/seo/SEOHead';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/web/publicTool`;
const ACCENT = '#1ABC9C';

const PORT_PRESETS = [
    { port: 25, label: '25', desc: 'SMTP' },
    { port: 465, label: '465', desc: 'SMTPS' },
    { port: 587, label: '587', desc: 'TLS' },
    { port: 2525, label: '2525', desc: 'Alt' },
];

const SECURITY_TYPES = [
    { value: 'NONE', label: 'None', useSecure: false, desc: 'No encryption' },
    { value: 'SSL', label: 'SSL', useSecure: true, desc: 'Implicit SSL' },
    { value: 'TLS', label: 'TLS', useSecure: true, desc: 'Explicit TLS' },
    { value: 'STARTTLS', label: 'STARTTLS', useSecure: true, desc: 'Upgrade to TLS' },
];

const FAQS = [
    { q: 'What does the SMTP Test tool check?', a: 'It tests your SMTP server connectivity, authentication credentials, and optionally sends a real test email to verify the full mail delivery pipeline.' },
    { q: 'What is the difference between SSL, TLS, and STARTTLS?', a: 'SSL (port 465) wraps the entire SMTP connection in SSL. TLS/STARTTLS (port 587) starts an unencrypted connection and upgrades it to TLS. STARTTLS is generally preferred for new setups.' },
    { q: 'What does "Skip Send" do?', a: 'When enabled, the tool only tests the connection and authentication without actually sending an email. Useful for verifying credentials without generating test emails.' },
    { q: 'What does "Allow Self-Signed" mean?', a: 'Some mail servers use self-signed SSL certificates. Enabling this skips certificate validation, which is useful for internal or development servers.' },
    { q: 'Why is port 587 recommended?', a: 'Port 587 is the standard SMTP submission port with STARTTLS. Port 465 is legacy SMTPS. Port 25 is used for server-to-server relay and is often blocked by ISPs.' },
];

const inputSx = {
    '& .MuiOutlinedInput-root': {
        color: '#1e293b',
        bgcolor: '#f8fafc',
        height: '56px',
        '& fieldset': { borderColor: '#e2e8f0' },
        '&:hover fieldset': { borderColor: `${ACCENT}60` },
        '&.Mui-focused fieldset': { borderColor: ACCENT },
    },
    '& .MuiInputLabel-root': { color: '#64748b' },
    '& .MuiInputLabel-root.Mui-focused': { color: ACCENT },
    '& .MuiFormHelperText-root': { color: '#94a3b8' },
};

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Typography sx={{ fontWeight: 700, color: '#334155', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0 }}>
        {children}
    </Typography>
);

interface ResultItem {
    label: string;
    status: 'success' | 'error' | 'warning' | 'info';
    detail?: string;
}

const STATUS_ICON: Record<string, React.ReactNode> = {
    success: <CheckCircle size={16} color="#2ECC71" />,
    error: <XCircle size={16} color="#E74C3C" />,
    warning: <AlertCircle size={16} color="#F39C12" />,
    info: <AlertCircle size={16} color="#3498DB" />,
};
const STATUS_COLOR: Record<string, string> = {
    success: '#2ECC71', error: '#E74C3C', warning: '#F39C12', info: '#3498DB',
};

const SmtpTestPage: React.FC = () => {
    const [smtpServer, setSmtpServer] = useState('');
    const [port, setPort] = useState<number>(587);
    const [emailFrom, setEmailFrom] = useState('');
    const [emailTo, setEmailTo] = useState('');
    const [securityType, setSecurityType] = useState('TLS');
    const [useAuthentication, setUseAuthentication] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [timeoutMs, setTimeoutMs] = useState<number>(10000);
    const [skipSend, setSkipSend] = useState(false);
    const [allowSelfSigned, setAllowSelfSigned] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const selectedSecurity = SECURITY_TYPES.find(s => s.value === securityType)!;

    const isFormValid = smtpServer.trim() && emailFrom.trim() && emailTo.trim() &&
        (!useAuthentication || (username.trim() && password.trim()));

    const handleTest = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        const payload = {
            smtpServer: smtpServer.trim(),
            port,
            emailFrom: emailFrom.trim(),
            emailTo: emailTo.trim(),
            useSecureConnection: selectedSecurity.useSecure,
            securityType,
            useAuthentication,
            username: useAuthentication ? username.trim() : '',
            password: useAuthentication ? password : '',
            timeoutMs,
            skipSend,
            allowSelfSigned,
        };

        try {
            const res = await fetch(`${API_BASE}/smtp-test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.status === 'success' || data.code === 'SUCCESS' || data.status === 200) {
                setResult(data.data);
            } else {
                setError(data.message || 'SMTP test failed');
            }
        } catch {
            setError('Failed to reach the server. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    // Parse result into display items
    const parseResultItems = (data: any): ResultItem[] => {
        if (!data) return [];
        const items: ResultItem[] = [];

        if ('connectionSuccess' in data || 'connected' in data) {
            const ok = data.connectionSuccess ?? data.connected;
            items.push({ label: 'Connection', status: ok ? 'success' : 'error', detail: ok ? `Connected to ${smtpServer}:${port}` : (data.connectionError || 'Connection failed') });
        }
        if ('authSuccess' in data || 'authenticated' in data) {
            const ok = data.authSuccess ?? data.authenticated;
            items.push({ label: 'Authentication', status: ok ? 'success' : 'error', detail: ok ? `Authenticated as ${username}` : (data.authError || 'Authentication failed') });
        }
        if (!skipSend && ('sendSuccess' in data || 'sent' in data || 'emailSent' in data)) {
            const ok = data.sendSuccess ?? data.sent ?? data.emailSent;
            items.push({ label: 'Email Sent', status: ok ? 'success' : 'error', detail: ok ? `Email delivered to ${emailTo}` : (data.sendError || 'Send failed') });
        }
        if ('tlsVersion' in data || 'encryptionUsed' in data) {
            items.push({ label: 'Encryption', status: 'info', detail: data.tlsVersion || data.encryptionUsed || securityType });
        }
        if ('responseTime' in data || 'latencyMs' in data) {
            const ms = data.responseTime ?? data.latencyMs;
            items.push({ label: 'Response Time', status: ms < 2000 ? 'success' : 'warning', detail: `${ms}ms` });
        }
        if ('serverBanner' in data || 'banner' in data) {
            items.push({ label: 'Server Banner', status: 'info', detail: data.serverBanner || data.banner });
        }
        // If no structured keys, show raw
        if (items.length === 0 && data.message) {
            items.push({ label: 'Result', status: 'success', detail: data.message });
        }
        return items;
    };

    const resultItems = parseResultItems(result);
    const overallSuccess = resultItems.length > 0 && resultItems.every(i => i.status === 'success' || i.status === 'info');

    return (
        <ToolPageLayout>
            <SEOHead
            title="SMTP Test — Test Your SMTP Server & Email Authentication"
            description="Test SMTP server connectivity, authentication and email delivery. Verify ports 25, 465, 587 with SSL/TLS and STARTTLS support."
            keywords="smtp test, smtp server test, email server test, smtp authentication, smtp port checker, smtp connection test"
            canonical="/tools/smtp-test"
        />
            {/* Hero */}
            <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center', px: 2, background: `linear-gradient(180deg, ${ACCENT}12 0%, transparent 100%)` }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <Box sx={{ display: 'inline-flex', p: 2, bgcolor: `${ACCENT}18`, borderRadius: '16px', mb: 3, border: `1px solid ${ACCENT}40` }}>
                        <Mail size={36} color={ACCENT} />
                    </Box>
                    <Typography variant="h2" sx={{ color: '#1e293b', fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>
                        SMTP Test Tool
                    </Typography>
                    <Typography sx={{ color: '#64748b', maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}>
                        Test your SMTP server connectivity, validate credentials, and send a real test email to verify your mail server configuration.
                    </Typography>
                </motion.div>
            </Box>

            <Container maxWidth="md" sx={{ pb: 8 }}>
                <Paper elevation={0} sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', p: { xs: 3, md: 5 }, mb: 4 }}>

                    {/* Server Settings */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Server size={15} color={ACCENT} />
                        <SectionLabel>Server Settings</SectionLabel>
                    </Box>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 12, sm: 8 }}>
                            <TextField
                                fullWidth label="SMTP Server" placeholder="smtp.gmail.com"
                                value={smtpServer} onChange={(e) => setSmtpServer(e.target.value)}
                                helperText="Hostname or IP of your mail server"
                                sx={inputSx}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                fullWidth label="Port" type="number"
                                value={port} onChange={(e) => setPort(Number(e.target.value))}
                                helperText="SMTP port number"
                                sx={inputSx}
                            />
                        </Grid>
                    </Grid>

                    {/* Port presets */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 4, flexWrap: 'wrap' }}>
                        {PORT_PRESETS.map(p => (
                            <Box
                                key={p.port}
                                onClick={() => setPort(p.port)}
                                sx={{
                                    px: 2, py: 0.8, borderRadius: '8px', cursor: 'pointer',
                                    border: `1.5px solid ${port === p.port ? ACCENT : '#e2e8f0'}`,
                                    bgcolor: port === p.port ? `${ACCENT}15` : '#f8fafc',
                                    transition: 'all 0.15s',
                                    '&:hover': { border: `1.5px solid ${ACCENT}60` },
                                }}
                            >
                                <Typography sx={{ color: port === p.port ? ACCENT : '#334155', fontWeight: 700, fontSize: '0.82rem' }}>{p.label}</Typography>
                                <Typography sx={{ color: '#64748b', fontSize: '0.68rem' }}>{p.desc}</Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Email Addresses */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Send size={15} color={ACCENT} />
                        <SectionLabel>Email Addresses</SectionLabel>
                    </Box>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth label="From Email" placeholder="notify@yourdomain.com"
                                value={emailFrom} onChange={(e) => setEmailFrom(e.target.value)}
                                helperText="Sender email address"
                                sx={inputSx}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth label="To Email" placeholder="test@example.com"
                                value={emailTo} onChange={(e) => setEmailTo(e.target.value)}
                                helperText="Recipient for the test email"
                                sx={inputSx}
                            />
                        </Grid>
                    </Grid>

                    {/* Security */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Shield size={15} color={ACCENT} />
                        <SectionLabel>Security Type</SectionLabel>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 4, flexWrap: 'wrap' }}>
                        {SECURITY_TYPES.map(s => {
                            const active = securityType === s.value;
                            return (
                                <Box
                                    key={s.value}
                                    onClick={() => setSecurityType(s.value)}
                                    sx={{
                                        px: 2.5, py: 1.2, borderRadius: '10px', cursor: 'pointer', flex: '1 1 auto', minWidth: 90, textAlign: 'center',
                                        border: `1.5px solid ${active ? ACCENT : '#e2e8f0'}`,
                                        bgcolor: active ? `${ACCENT}12` : '#f8fafc',
                                        transition: 'all 0.15s',
                                        '&:hover': { border: `1.5px solid ${ACCENT}50`, bgcolor: `${ACCENT}08` },
                                    }}
                                >
                                    <Typography sx={{ color: active ? ACCENT : '#334155', fontWeight: 700, fontSize: '0.88rem' }}>{s.label}</Typography>
                                    <Typography sx={{ color: '#64748b', fontSize: '0.7rem', mt: 0.3 }}>{s.desc}</Typography>
                                </Box>
                            );
                        })}
                    </Box>

                    {/* Authentication */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Lock size={15} color={ACCENT} />
                        <SectionLabel>Authentication</SectionLabel>
                    </Box>
                    <Box sx={{ p: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', mb: 4 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={useAuthentication}
                                    onChange={(e) => setUseAuthentication(e.target.checked)}
                                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: ACCENT } }}
                                />
                            }
                            label={<Typography sx={{ color: '#334155', fontWeight: 600, fontSize: '0.9rem' }}>Use Authentication</Typography>}
                            sx={{ mb: useAuthentication ? 2 : 0 }}
                        />
                        <Collapse in={useAuthentication}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth label="Username" placeholder="user@example.com"
                                        value={username} onChange={(e) => setUsername(e.target.value)}
                                        sx={inputSx}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth label="Password" type="password"
                                        value={password} onChange={(e) => setPassword(e.target.value)}
                                        sx={inputSx}
                                    />
                                </Grid>
                            </Grid>
                        </Collapse>
                    </Box>

                    {/* Advanced Options */}
                    <Box
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, cursor: 'pointer', width: 'fit-content' }}
                    >
                        <Settings size={15} color="#64748b" />
                        <Typography sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Advanced Options
                        </Typography>
                        <ChevronDown size={14} color="#64748b" style={{ transition: 'transform 0.2s', transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </Box>
                    <Collapse in={showAdvanced}>
                        <Box sx={{ p: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', mb: 4 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        fullWidth label="Timeout (ms)" type="number"
                                        value={timeoutMs} onChange={(e) => setTimeoutMs(Number(e.target.value))}
                                        helperText="Connection timeout in milliseconds"
                                        sx={inputSx}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={skipSend}
                                                onChange={(e) => setSkipSend(e.target.checked)}
                                                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: ACCENT } }}
                                            />
                                        }
                                        label={
                                            <Box>
                                                <Typography sx={{ color: '#334155', fontWeight: 600, fontSize: '0.88rem' }}>Skip Send</Typography>
                                                <Typography sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>Test connection only</Typography>
                                            </Box>
                                        }
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={allowSelfSigned}
                                                onChange={(e) => setAllowSelfSigned(e.target.checked)}
                                                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: ACCENT } }}
                                            />
                                        }
                                        label={
                                            <Box>
                                                <Typography sx={{ color: '#334155', fontWeight: 600, fontSize: '0.88rem' }}>Allow Self-Signed</Typography>
                                                <Typography sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>Skip cert validation</Typography>
                                            </Box>
                                        }
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Collapse>

                    {/* Test Button */}
                    <Button
                        variant="contained" fullWidth onClick={handleTest}
                        disabled={loading || !isFormValid}
                        startIcon={!loading && <Mail size={18} />}
                        sx={{
                            bgcolor: ACCENT, py: 1.6, fontWeight: 700, borderRadius: '10px', fontSize: '1rem',
                            '&:hover': { filter: 'brightness(0.88)', bgcolor: ACCENT },
                            '&.Mui-disabled': { bgcolor: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.3)' },
                        }}
                    >
                        {loading ? <CircularProgress size={22} color="inherit" /> : 'Run SMTP Test'}
                    </Button>
                </Paper>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div key="err" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <Paper elevation={0} sx={{ p: 3, bgcolor: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.25)', borderRadius: '14px', mb: 4, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                <AlertCircle size={20} color="#E74C3C" style={{ flexShrink: 0, marginTop: 2 }} />
                                <Typography sx={{ color: '#E74C3C' }}>{error}</Typography>
                            </Paper>
                        </motion.div>
                    )}

                    {/* Result */}
                    {result && (
                        <motion.div key="res" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#ffffff', border: `1px solid ${overallSuccess ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)'}`, borderRadius: '20px', mb: 4 }}>
                                {/* Header */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                    {overallSuccess
                                        ? <CheckCircle size={22} color="#2ECC71" />
                                        : <XCircle size={22} color="#E74C3C" />
                                    }
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: overallSuccess ? '#2ECC71' : '#E74C3C' }}>
                                        {overallSuccess ? 'SMTP Test Passed' : 'SMTP Test Failed'}
                                    </Typography>
                                    <Box sx={{ ml: 'auto', px: 2, py: 0.5, bgcolor: overallSuccess ? 'rgba(46,204,113,0.12)' : 'rgba(231,76,60,0.12)', borderRadius: '20px', border: `1px solid ${overallSuccess ? 'rgba(46,204,113,0.3)' : 'rgba(231,76,60,0.3)'}` }}>
                                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: overallSuccess ? '#2ECC71' : '#E74C3C' }}>
                                            {smtpServer}:{port}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ borderColor: '#e2e8f0', mb: 3 }} />

                                {/* Result items */}
                                {resultItems.length > 0 ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        {resultItems.map((item, i) => (
                                            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2, bgcolor: `${STATUS_COLOR[item.status]}08`, border: `1px solid ${STATUS_COLOR[item.status]}25`, borderRadius: '10px' }}>
                                                <Box sx={{ mt: 0.2, flexShrink: 0 }}>{STATUS_ICON[item.status]}</Box>
                                                <Box>
                                                    <Typography sx={{ color: '#1e293b', fontWeight: 700, fontSize: '0.88rem' }}>{item.label}</Typography>
                                                    {item.detail && (
                                                        <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mt: 0.3 }}>{item.detail}</Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    /* Fallback: raw JSON */
                                    <Box sx={{ p: 3, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', fontFamily: 'monospace', fontSize: '0.82rem', color: '#475569', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                                        {JSON.stringify(result, null, 2)}
                                    </Box>
                                )}
                            </Paper>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* How to Use */}
                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', mb: 4 }}>
                    <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 800, mb: 3 }}>How to Use</Typography>
                    {[
                        { step: '1', title: 'Enter SMTP Server & Port', desc: 'Input your mail server hostname (e.g. smtp.gmail.com) and select or type the port. Use the presets for common configurations.' },
                        { step: '2', title: 'Set Email Addresses', desc: 'Provide a From address (your sending email) and a To address where the test email should be delivered.' },
                        { step: '3', title: 'Configure Security & Auth', desc: 'Choose the appropriate security type (TLS is recommended) and enter your SMTP credentials if your server requires authentication.' },
                        { step: '4', title: 'Run the Test', desc: 'Click "Run SMTP Test" to verify connectivity, authentication, and email delivery. Use "Skip Send" if you only want to test the connection.' },
                    ].map((item) => (
                        <Box key={item.step} sx={{ display: 'flex', gap: 2.5, mb: 2.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: `${ACCENT}20`, border: `1px solid ${ACCENT}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Typography sx={{ color: ACCENT, fontWeight: 800, fontSize: '0.85rem' }}>{item.step}</Typography>
                            </Box>
                            <Box>
                                <Typography sx={{ color: '#1e293b', fontWeight: 700, mb: 0.5 }}>{item.title}</Typography>
                                <Typography sx={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</Typography>
                            </Box>
                        </Box>
                    ))}
                </Paper>

                {/* FAQ */}
                <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 800, mb: 3 }}>Frequently Asked Questions</Typography>
                {FAQS.map((faq, i) => (
                    <Accordion key={i} disableGutters elevation={0} sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px !important', mb: 1.5, '&:before': { display: 'none' } }}>
                        <AccordionSummary expandIcon={<ChevronDown size={18} color="#94a3b8" />} sx={{ px: 3, py: 1.5 }}>
                            <Typography sx={{ fontWeight: 600, color: '#334155' }}>{faq.q}</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 3, pb: 2.5 }}>
                            <Typography sx={{ color: '#64748b', lineHeight: 1.7 }}>{faq.a}</Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Container>
        </ToolPageLayout>
    );
};

export default SmtpTestPage;
