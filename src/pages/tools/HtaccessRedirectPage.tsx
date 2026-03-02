import React, { useState } from 'react';
import {
    Box, Typography, Container, TextField, Button, Paper,
    CircularProgress, Accordion, AccordionSummary, AccordionDetails,
    Select, MenuItem, FormControl, InputLabel, Grid
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRightLeft, ChevronDown, AlertCircle, Copy, Check,
    Globe, Lock, ArrowRight
} from 'lucide-react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/web/publicTool`;

const REDIRECT_TYPES = [
    {
        value: 'www-to-non-www',
        label: 'WWW → Non-WWW',
        mode: 'www',
        icon: <Globe size={18} />,
        color: '#3498DB',
        example: 'www.example.com → example.com',
        desc: 'Redirect all www traffic to the non-www version',
    },
    {
        value: 'non-www-to-www',
        label: 'Non-WWW → WWW',
        mode: 'www',
        icon: <Globe size={18} />,
        color: '#9B59B6',
        example: 'example.com → www.example.com',
        desc: 'Redirect all non-www traffic to the www version',
    },
    {
        value: 'http-to-https',
        label: 'HTTP → HTTPS',
        mode: 'https',
        icon: <Lock size={18} />,
        color: '#2ECC71',
        example: 'http://example.com → https://example.com',
        desc: 'Force all traffic to use secure HTTPS',
    },
    {
        value: 'https-to-http',
        label: 'HTTPS → HTTP',
        mode: 'https',
        icon: <Lock size={18} />,
        color: '#E67E22',
        example: 'https://example.com → http://example.com',
        desc: 'Downgrade HTTPS traffic to HTTP',
    },
    {
        value: 'old-to-new',
        label: 'Old URL → New URL',
        mode: 'custom',
        icon: <ArrowRight size={18} />,
        color: '#E74C3C',
        example: '/old-page → /new-page',
        desc: 'Redirect a specific old path to a new URL',
    },
];

const REDIRECT_CODES = [
    { value: 301, label: '301 – Permanent', desc: 'SEO-friendly. Passes link equity.' },
    { value: 302, label: '302 – Temporary', desc: 'Does not pass link equity.' },
    { value: 307, label: '307 – Temporary (Strict)', desc: 'Preserves HTTP method.' },
    { value: 308, label: '308 – Permanent (Strict)', desc: 'Preserves HTTP method permanently.' },
];

const FAQS = [
    { q: 'What is an .htaccess file?', a: '.htaccess is a distributed configuration file used on Apache web servers. It allows directory-level configuration overrides including URL redirects, password protection, and custom error pages.' },
    { q: 'What is the difference between 301 and 302 redirects?', a: 'A 301 redirect is permanent and tells search engines to transfer link equity to the new URL. A 302 is temporary and does not transfer link equity — search engines keep indexing the original URL.' },
    { q: 'How do I add redirects to my .htaccess file?', a: 'Paste the generated redirect rules into your .htaccess file (typically at the root of your web server document directory). Place them before any existing RewriteRule directives.' },
    { q: 'Do redirects affect SEO?', a: '301 redirects preserve most SEO value (link equity) when moving pages. Always use 301 redirects when permanently changing URLs to avoid losing rankings.' },
    { q: 'What is mod_rewrite?', a: 'mod_rewrite is an Apache module that provides URL rewriting capabilities. The RewriteEngine On directive activates it, and RewriteRule/RewriteCond are used to define redirect patterns.' },
];

const inputSx = (color = '#E74C3C') => ({
    '& .MuiOutlinedInput-root': {
        color: '#fff',
        bgcolor: 'rgba(0,0,0,0.2)',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
        '&:hover fieldset': { borderColor: `${color}80` },
        '&.Mui-focused fieldset': { borderColor: color },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
    '& .MuiInputLabel-root.Mui-focused': { color: color },
});

const HtaccessRedirectPage: React.FC = () => {
    const [redirectType, setRedirectType] = useState('www-to-non-www');
    const [url, setUrl] = useState('');
    const [fromPath, setFromPath] = useState('');
    const [toUrl, setToUrl] = useState('');
    const [code, setCode] = useState<number>(301);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const selected = REDIRECT_TYPES.find(t => t.value === redirectType)!;
    const isCustom = selected.mode === 'custom';

    const isFormValid = isCustom
        ? fromPath.trim() && toUrl.trim()
        : url.trim();

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        const payload = isCustom
            ? { mode: 'custom', url: fromPath.trim(), redirectType: 'old-to-new', toUrl: toUrl.trim(), code }
            : { mode: selected.mode, url: url.trim(), redirectType, code };

        try {
            const res = await fetch(`${API_BASE}/htaccess-redirect-generator`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.status === 'success' || data.code === 'SUCCESS' || data.status === 200) {
                const raw = data.data;
                setResult(typeof raw === 'string' ? raw : raw?.htaccess || raw?.content || JSON.stringify(raw, null, 2));
            } else {
                setError(data.message || 'Request failed');
            }
        } catch {
            setError('Failed to reach the server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <ToolPageLayout>
            {/* Hero */}
            <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center', px: 2, background: 'linear-gradient(180deg, rgba(231,76,60,0.07) 0%, transparent 100%)' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <Box sx={{ display: 'inline-flex', p: 2, bgcolor: 'rgba(231,76,60,0.1)', borderRadius: '16px', mb: 3, border: '1px solid rgba(231,76,60,0.25)' }}>
                        <ArrowRightLeft size={36} color="#E74C3C" />
                    </Box>
                    <Typography variant="h2" sx={{ color: '#ffffff', fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>
                        HTACCESS Redirect Generator
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}>
                        Generate Apache .htaccess redirect rules instantly. Choose your redirect type, enter your domain, and copy the ready-to-use rules.
                    </Typography>
                </motion.div>
            </Box>

            <Container maxWidth="md" sx={{ pb: 8 }}>
                <Paper elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', p: { xs: 3, md: 5 }, mb: 4 }}>

                    {/* Step 1 – Redirect Type */}
                    <Typography sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>
                        Step 1 — Choose Redirect Type
                    </Typography>
                    <Grid container spacing={1.5} sx={{ mb: 4 }}>
                        {REDIRECT_TYPES.map((type) => {
                            const active = redirectType === type.value;
                            return (
                                <Grid size={{ xs: 12, sm: 6 }} key={type.value}>
                                    <Box
                                        onClick={() => setRedirectType(type.value)}
                                        sx={{
                                            p: 2,
                                            borderRadius: '12px',
                                            border: `1.5px solid ${active ? type.color : 'rgba(255,255,255,0.07)'}`,
                                            bgcolor: active ? `${type.color}10` : 'rgba(0,0,0,0.15)',
                                            cursor: 'pointer',
                                            transition: 'all 0.18s',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 1.5,
                                            '&:hover': {
                                                border: `1.5px solid ${type.color}60`,
                                                bgcolor: `${type.color}08`,
                                            },
                                        }}
                                    >
                                        <Box sx={{ p: 0.7, bgcolor: `${type.color}20`, borderRadius: '8px', color: type.color, flexShrink: 0, mt: 0.2 }}>
                                            {type.icon}
                                        </Box>
                                        <Box>
                                            <Typography sx={{ color: active ? type.color : '#e2e8f0', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>
                                                {type.label}
                                            </Typography>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', mt: 0.3, fontFamily: 'monospace' }}>
                                                {type.example}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* Step 2 – URL / Path inputs */}
                    <Typography sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>
                        Step 2 — {isCustom ? 'Enter Paths' : 'Enter Your Domain'}
                    </Typography>

                    <AnimatePresence mode="wait">
                        {isCustom ? (
                            <motion.div key="custom" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth label="From Path" placeholder="/old-page"
                                            value={fromPath} onChange={(e) => setFromPath(e.target.value)}
                                            helperText="The old URL path to redirect from"
                                            FormHelperTextProps={{ sx: { color: 'rgba(255,255,255,0.3)' } }}
                                            sx={inputSx(selected.color)}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth label="To URL" placeholder="https://example.com/new-page"
                                            value={toUrl} onChange={(e) => setToUrl(e.target.value)}
                                            helperText="The destination URL to redirect to"
                                            FormHelperTextProps={{ sx: { color: 'rgba(255,255,255,0.3)' } }}
                                            sx={inputSx(selected.color)}
                                        />
                                    </Grid>
                                </Grid>
                            </motion.div>
                        ) : (
                            <motion.div key="domain" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                                <TextField
                                    fullWidth label="Domain" placeholder="example.com"
                                    value={url} onChange={(e) => setUrl(e.target.value)}
                                    helperText={`Enter your domain without http:// or www — e.g. example.com`}
                                    FormHelperTextProps={{ sx: { color: 'rgba(255,255,255,0.3)' } }}
                                    sx={{ ...inputSx(selected.color), mb: 3 }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Step 3 – Redirect Code */}
                    <Typography sx={{fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>
                        Step 3 — Redirect Code
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 4 }}>
                        <InputLabel sx={{ color: 'rgba(255,255,255,0.4)' }}>HTTP Redirect Code</InputLabel>
                        <Select
                            value={code}
                            label="HTTP Redirect Code"
                            onChange={(e) => setCode(Number(e.target.value))}
                            sx={{
                                color: '#fff',
                                bgcolor: 'rgba(0,0,0,0.2)',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: `${selected.color}80` },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: selected.color },
                                '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' },
                            }}
                            MenuProps={{ PaperProps: { sx: { bgcolor: '#1a2744', border: '1px solid rgba(255,255,255,0.1)' } } }}
                        >
                            {REDIRECT_CODES.map(c => (
                                <MenuItem key={c.value} value={c.value} sx={{ color: '#e2e8f0', flexDirection: 'column', alignItems: 'flex-start', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                                    <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>{c.label}</Typography>
                                    <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{c.desc}</Typography>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Generate */}
                    <Button
                        variant="contained" fullWidth onClick={handleGenerate}
                        disabled={loading || !isFormValid}
                        sx={{
                            bgcolor: selected.color,
                            py: 1.6,
                            fontWeight: 700,
                            borderRadius: '10px',
                            fontSize: '1rem',
                            '&:hover': { filter: 'brightness(0.88)', bgcolor: selected.color },
                            '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' },
                        }}
                    >
                        {loading ? <CircularProgress size={22} color="inherit" /> : 'Generate .htaccess Rules'}
                    </Button>
                </Paper>

                {/* Error / Result */}
                <AnimatePresence>
                    {error && (
                        <motion.div key="err" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <Paper elevation={0} sx={{ p: 3, bgcolor: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.25)', borderRadius: '14px', mb: 4, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                <AlertCircle size={20} color="#E74C3C" style={{ flexShrink: 0, marginTop: 2 }} />
                                <Typography sx={{ color: '#E74C3C' }}>{error}</Typography>
                            </Paper>
                        </motion.div>
                    )}
                    {result && (
                        <motion.div key="res" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', mb: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#e2e8f0' }}>Generated .htaccess Rules</Typography>
                                    <Button
                                        size="small"
                                        startIcon={copied ? <Check size={14} /> : <Copy size={14} />}
                                        onClick={handleCopy}
                                        sx={{ color: copied ? '#2ECC71' : 'rgba(255,255,255,0.5)', textTransform: 'none', borderRadius: '8px', '&:hover': { color: '#E74C3C' } }}
                                    >
                                        {copied ? 'Copied!' : 'Copy'}
                                    </Button>
                                </Box>
                                <Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#a8c5e8', whiteSpace: 'pre-wrap', lineHeight: 1.9 }}>
                                    {result}
                                </Box>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', mt: 1.5, display: 'block' }}>
                                    Paste these rules into your .htaccess file at the root of your web server. Make sure mod_rewrite is enabled on your Apache server.
                                </Typography>
                            </Paper>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* How to Use */}
                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', mb: 4 }}>
                    <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 800, mb: 3 }}>How to Use</Typography>
                    {[
                        { step: '1', title: 'Choose Redirect Type', desc: 'Select the kind of redirect you need — www/non-www, HTTP/HTTPS, or a custom path redirect.' },
                        { step: '2', title: 'Enter Your Domain or Paths', desc: 'For domain-level redirects, enter your domain (e.g. example.com). For custom, enter the old path and new destination URL.' },
                        { step: '3', title: 'Select Redirect Code', desc: 'Use 301 for permanent (SEO-friendly), 302 for temporary, or 307/308 for method-preserving redirects.' },
                        { step: '4', title: 'Generate & Deploy', desc: 'Click Generate, copy the output, and paste it into your .htaccess file. Test thoroughly after deploying.' },
                    ].map((item) => (
                        <Box key={item.step} sx={{ display: 'flex', gap: 2.5, mb: 2.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(231,76,60,0.15)', border: '1px solid rgba(231,76,60,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Typography sx={{ color: '#E74C3C', fontWeight: 800, fontSize: '0.85rem' }}>{item.step}</Typography>
                            </Box>
                            <Box>
                                <Typography sx={{ color: '#ffffff', fontWeight: 700, mb: 0.5 }}>{item.title}</Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</Typography>
                            </Box>
                        </Box>
                    ))}
                </Paper>

                {/* FAQ */}
                <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 800, mb: 3 }}>Frequently Asked Questions</Typography>
                {FAQS.map((faq, i) => (
                    <Accordion key={i} disableGutters elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px !important', mb: 1.5, '&:before': { display: 'none' } }}>
                        <AccordionSummary expandIcon={<ChevronDown size={18} color="rgba(255,255,255,0.5)" />} sx={{ px: 3, py: 1.5 }}>
                            <Typography sx={{ fontWeight: 600, color: '#e2e8f0' }}>{faq.q}</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 3, pb: 2.5 }}>
                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{faq.a}</Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Container>
        </ToolPageLayout>
    );
};

export default HtaccessRedirectPage;
