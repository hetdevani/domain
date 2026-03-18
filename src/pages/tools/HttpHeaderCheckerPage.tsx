import React, { useState } from 'react';
import {
    Box, Typography, Container, TextField, Button, Paper,
    CircularProgress, Accordion, AccordionSummary, AccordionDetails, Chip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, ChevronDown, AlertCircle } from 'lucide-react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import SEOHead from '../../components/seo/SEOHead';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/web/publicTool`;

const FAQS = [
    { q: 'What are HTTP headers?', a: 'HTTP headers are metadata sent between a client and server in HTTP requests and responses. They convey information about the request/response body, caching, authentication, redirects, and security policies.' },
    { q: 'What security headers should I have?', a: 'Important security headers include: Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), X-Content-Type-Options, X-Frame-Options, Referrer-Policy, and Permissions-Policy.' },
    { q: 'What does the Status Code mean?', a: '200 OK means success. 3xx codes are redirects. 4xx codes are client errors (404 = not found). 5xx codes are server errors.' },
    { q: 'What is the Cache-Control header?', a: 'Cache-Control directives specify caching behavior. Values like max-age=3600 tell browsers to cache the response for 1 hour. no-cache forces revalidation.' },
    { q: 'How do I fix missing security headers?', a: 'Security headers are added in your web server configuration (nginx.conf, .htaccess, etc.) or in your application\'s middleware. Most frameworks have security header plugins.' },
];

const SECURITY_HEADERS = ['strict-transport-security', 'content-security-policy', 'x-content-type-options', 'x-frame-options', 'referrer-policy', 'permissions-policy'];
const HEADER_COLORS: Record<string, string> = {
    '200': '#2ECC71', '201': '#2ECC71', '301': '#F39C12', '302': '#F39C12',
    '304': '#3498DB', '400': '#E74C3C', '401': '#E74C3C', '403': '#E74C3C',
    '404': '#E74C3C', '500': '#E74C3C', '503': '#E74C3C',
};

const HttpHeaderCheckerPage: React.FC = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCheck = async () => {
        if (!url) return;
        setLoading(true); setError(null); setResult(null);
        try {
            const res = await fetch(`${API_BASE}/http-header-checker?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            if (data.status === 'success' || data.status === 200 || data.code === 'SUCCESS') setResult(data.data);
            else setError(data.message || 'Request failed');
        } catch {
            setError('Failed to reach the server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderHeaders = () => {
        if (!result) return null;
        const headers: Record<string, string> = result.headers || result;
        const statusCode = result.statusCode || result.status;
        const statusColor = HEADER_COLORS[String(statusCode)] || '#888';

        const presentSecHeaders = SECURITY_HEADERS.filter(h => headers[h] || headers[h.toLowerCase()]);
        const missingSecHeaders = SECURITY_HEADERS.filter(h => !headers[h] && !headers[h.toLowerCase()]);

        return (
            <Box>
                {/* Status Code */}
                {statusCode && (
                    <Box sx={{ p: 3, bgcolor: `${statusColor}10`, border: `1px solid ${statusColor}30`, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Typography variant="h3" sx={{ color: statusColor, fontWeight: 900, fontFamily: 'monospace' }}>{statusCode}</Typography>
                        <Typography sx={{ color: '#64748b' }}>HTTP Status Code</Typography>
                    </Box>
                )}

                {/* Security Headers Check */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.1em', display: 'block', mb: 1.5 }}>Security Headers Audit</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                        {presentSecHeaders.map(h => <Chip key={h} label={h} size="small" sx={{ bgcolor: 'rgba(46,204,113,0.1)', color: '#2ECC71', border: '1px solid rgba(46,204,113,0.2)', fontFamily: 'monospace', fontSize: '0.72rem' }} />)}
                        {missingSecHeaders.map(h => <Chip key={h} label={h} size="small" sx={{ bgcolor: 'rgba(231,76,60,0.1)', color: '#E74C3C', border: '1px solid rgba(231,76,60,0.2)', fontFamily: 'monospace', fontSize: '0.72rem' }} />)}
                    </Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>Green = present, Red = missing</Typography>
                </Box>

                {/* All Headers */}
                <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.1em', display: 'block', mb: 1.5 }}>Response Headers</Typography>
                <Box sx={{ bgcolor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                    {Object.entries(headers).map(([key, value], idx) => (
                        <Box key={key} sx={{ display: 'flex', gap: 2, px: 3, py: 1.5, bgcolor: idx % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent', borderBottom: idx < Object.keys(headers).length - 1 ? '1px solid #e2e8f0' : 'none', flexWrap: 'wrap' }}>
                            <Typography sx={{ color: SECURITY_HEADERS.includes(key.toLowerCase()) ? '#2ECC71' : '#9B59B6', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700, minWidth: 220, flexShrink: 0 }}>{key}</Typography>
                            <Typography sx={{ color: '#334155', fontFamily: 'monospace', fontSize: '0.8rem', flex: 1, wordBreak: 'break-all' }}>{String(value)}</Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        );
    };

    return (
        <ToolPageLayout>
            <SEOHead
            title="HTTP Header Checker — Inspect HTTP Response Headers"
            description="Inspect HTTP response headers for any URL. Check security headers, caching policy, redirect chains and server information."
            keywords="http header checker, response headers, security headers, http headers tool, inspect headers, hsts checker"
            canonical="/tools/http-header-checker"
        />
            <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center', px: 2, background: 'linear-gradient(180deg, rgba(231,76,60,0.07) 0%, transparent 100%)' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <Box sx={{ display: 'inline-flex', p: 2, bgcolor: 'rgba(231,76,60,0.1)', borderRadius: '16px', mb: 3, border: '1px solid rgba(231,76,60,0.25)' }}>
                        <Server size={36} color="#E74C3C" />
                    </Box>
                    <Typography variant="h2" sx={{ color: '#1e293b', fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>HTTP Header Checker</Typography>
                    <Typography sx={{ color: '#64748b', maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}>
                        Inspect HTTP response headers for any URL. Check security headers, cache policies, redirects, and server information instantly.
                    </Typography>
                </motion.div>
            </Box>

            <Container maxWidth="md" sx={{ pb: 8 }}>
                <Paper elevation={0} sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', p: { xs: 3, md: 5 }, mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#334155' }}>Check HTTP Headers</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'end', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <TextField
                            fullWidth label="Website URL" placeholder="https://example.com"
                            value={url} onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                            InputLabelProps={{ sx: { color: '#64748b', '&.Mui-focused': { color: '#1e293b' } } }}
                            sx={{ '& .MuiOutlinedInput-root': { color: '#1e293b', bgcolor: '#f8fafc', height: '56px', '& fieldset': { borderColor: '#e2e8f0' }, '&:hover fieldset': { borderColor: 'rgba(231,76,60,0.5)' }, '&.Mui-focused fieldset': { borderColor: '#E74C3C' } } }}
                        />
                        <Button variant="contained" onClick={handleCheck} disabled={loading || !url}
                            sx={{ bgcolor: '#E74C3C', height: '56px', px: 4, fontWeight: 700, borderRadius: '10px', minWidth: 140, whiteSpace: 'nowrap', '&:hover': { bgcolor: '#c0392b' }, '&.Mui-disabled': { bgcolor: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.3)' } }}>
                            {loading ? <CircularProgress size={22} color="inherit" /> : 'Check Headers'}
                        </Button>
                    </Box>
                </Paper>

                <AnimatePresence>
                    {error && (
                        <motion.div key="err" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <Paper elevation={0} sx={{ p: 3, bgcolor: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.25)', borderRadius: '14px', mb: 4, display: 'flex', gap: 1.5 }}>
                                <AlertCircle size={20} color="#E74C3C" style={{ flexShrink: 0 }} />
                                <Typography sx={{ color: '#E74C3C' }}>{error}</Typography>
                            </Paper>
                        </motion.div>
                    )}
                    {result && (
                        <motion.div key="res" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', mb: 4 }}>
                                <Typography variant="h6" sx={{color: '#1e293b', fontWeight: 700, mb: 3 }}>Headers for <Box component="span" sx={{ color: '#E74C3C', fontFamily: 'monospace', fontSize: '0.9em', ml: 1 }}>{url}</Box></Typography>
                                {renderHeaders()}
                            </Paper>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', mb: 4 }}>
                    <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 800, mb: 3 }}>How to Use</Typography>
                    {[
                        { step: '1', title: 'Enter URL', desc: 'Paste a full URL including https:// (e.g., https://example.com). The tool follows redirects and reports the final headers.' },
                        { step: '2', title: 'Check Headers', desc: 'Click the button — our server makes an HTTP request and returns all response headers.' },
                        { step: '3', title: 'Review Security Headers', desc: 'The security audit section highlights which critical security headers are present (green) or missing (red).' },
                        { step: '4', title: 'Fix Missing Headers', desc: 'Add missing security headers via your web server config or application middleware to protect users.' },
                    ].map((item) => (
                        <Box key={item.step} sx={{ display: 'flex', gap: 2.5, mb: 2.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(231,76,60,0.15)', border: '1px solid rgba(231,76,60,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Typography sx={{ color: '#E74C3C', fontWeight: 800, fontSize: '0.85rem' }}>{item.step}</Typography>
                            </Box>
                            <Box><Typography sx={{ color: '#1e293b', fontWeight: 700, mb: 0.5 }}>{item.title}</Typography><Typography sx={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</Typography></Box>
                        </Box>
                    ))}
                </Paper>

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

export default HttpHeaderCheckerPage;
