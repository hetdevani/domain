import React, { useState } from 'react';
import {
    Box, Typography, Container, TextField, Button, Paper,
    CircularProgress, Select, MenuItem, FormControl, InputLabel,
    Accordion, AccordionSummary, AccordionDetails, Grid, LinearProgress, Tooltip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, CheckCircle, XCircle, AlertCircle, Clock, Wifi } from 'lucide-react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/web/publicTool`;

const RECORD_TYPES = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA'];

const CONTINENT_FLAGS: Record<string, string> = {
    'north-america': '🌎',
    'south-america': '🌎',
    'europe': '🌍',
    'africa': '🌍',
    'asia': '🌏',
    'oceania': '🌏',
    'antarctica': '🌐',
};

const FAQS = [
    { q: 'What is DNS propagation?', a: 'DNS propagation is the time it takes for DNS changes to spread across the global network of DNS servers. Changes can take 24–48 hours to propagate fully.' },
    { q: 'Why do I see different results from different locations?', a: 'Each DNS server caches records independently. During propagation, some servers have the new record while others still hold the old cached version.' },
    { q: 'What record types can I check?', a: 'You can check A, AAAA, MX, TXT, NS, CNAME, and SOA records to verify propagation of any DNS change.' },
    { q: 'How long does DNS propagation take?', a: 'It depends on the TTL (Time to Live) value set on the DNS record. Typical TTLs range from 300 seconds (5 min) to 86400 seconds (24 hours).' },
    { q: 'Can I check propagation for any domain?', a: 'Yes. Enter any fully qualified domain name (FQDN) like example.com or subdomain.example.com.' },
];

// Normalize API response — handles both {status:'success',data:{}} and {status:200,code:'SUCCESS',data:{}}
const isSuccess = (data: any) =>
    data.status === 'success' ||
    data.status === 200 ||
    data.code === 'SUCCESS' ||
    data.code === 'success';

const DnsPropagationPage: React.FC = () => {
    const [domain, setDomain] = useState('');
    const [recordType, setRecordType] = useState('A');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCheck = async () => {
        if (!domain) return;
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const res = await fetch(`${API_BASE}/dns-propagation/check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain, recordType }),
            });
            const data = await res.json();
            if (isSuccess(data) && data.data) {
                setResult(data.data);
            } else {
                setError(data.message || 'Request failed');
            }
        } catch {
            setError('Failed to reach the server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderResults = () => {
        if (!result) return null;

        // Actual API shape: { summary, results: [ { resolver, status, answers, responseTimeMs, error } ] }
        const summary = result.summary || {};
        const servers: any[] = result.results || [];

        if (!servers.length) {
            return (
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', py: 4 }}>
                    No propagation data returned.
                </Typography>
            );
        }

        const propagatedCount = summary.propagated ?? servers.filter((s: any) => s.status === 'propagated').length;
        const total = summary.total ?? servers.length;
        const pct = summary.propagationPercent ?? Math.round((propagatedCount / total) * 100);
        const pctColor = pct === 100 ? '#2ECC71' : pct >= 50 ? '#F39C12' : '#E74C3C';

        return (
            <Box>
                {/* Summary Bar */}
                <Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                        <Typography sx={{ fontWeight: 700, color: '#e2e8f0' }}>
                            Propagation Status for{' '}
                            <Box component="span" sx={{ color: '#2ECC71', fontFamily: 'monospace' }}>{result.domain}</Box>
                            {' '}<Box component="span" sx={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: '0.85em' }}>{result.recordType}</Box>
                        </Typography>
                        <Typography sx={{ color: pctColor, fontWeight: 900, fontSize: '1.4rem' }}>{pct}%</Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                            height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.07)',
                            '& .MuiLinearProgress-bar': { bgcolor: pctColor, borderRadius: 4 },
                        }}
                    />
                    <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle size={15} color="#2ECC71" />
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                <Box component="span" sx={{ color: '#2ECC71', fontWeight: 700 }}>{propagatedCount}</Box> Propagated
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <XCircle size={15} color="#E74C3C" />
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                <Box component="span" sx={{ color: '#E74C3C', fontWeight: 700 }}>{summary.notPropagated ?? (total - propagatedCount)}</Box> Pending
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Globe size={15} color="rgba(255,255,255,0.4)" />
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                <Box component="span" sx={{ fontWeight: 700, color: '#e2e8f0' }}>{total}</Box> Servers Checked
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Server Grid */}
                <Grid container spacing={1.5}>
                    {servers.map((server: any, idx: number) => {
                        const ok = server.status === 'propagated';
                        const resolver = server.resolver || {};
                        const answers: string[] = server.answers || [];
                        const flag = CONTINENT_FLAGS[resolver.continentCode] || '🌐';

                        return (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                                <Box sx={{
                                    p: 2,
                                    bgcolor: ok ? 'rgba(46,204,113,0.04)' : 'rgba(231,76,60,0.04)',
                                    border: `1px solid ${ok ? 'rgba(46,204,113,0.18)' : 'rgba(231,76,60,0.18)'}`,
                                    borderRadius: '12px',
                                    height: '100%',
                                }}>
                                    {/* Header row */}
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontSize: '1rem', flexShrink: 0 }}>{flag}</Typography>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography sx={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.82rem', lineHeight: 1.2 }}>
                                                    {resolver.name || `Server ${idx + 1}`}
                                                </Typography>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>
                                                    {resolver.countryName || resolver.continentName || ''}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        {ok
                                            ? <CheckCircle size={16} color="#2ECC71" style={{ flexShrink: 0 }} />
                                            : <XCircle size={16} color="#E74C3C" style={{ flexShrink: 0 }} />
                                        }
                                    </Box>

                                    {/* Resolver IP */}
                                    <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', fontFamily: 'monospace', mb: 0.75 }}>
                                        {resolver.ip} · {resolver.provider}
                                    </Typography>

                                    {/* Answers */}
                                    {answers.length > 0 ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, mb: 0.75 }}>
                                            {answers.map((ans: string, ai: number) => (
                                                <Typography key={ai} sx={{
                                                    color: ok ? '#2ECC71' : '#E74C3C',
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.78rem',
                                                    wordBreak: 'break-all',
                                                    bgcolor: ok ? 'rgba(46,204,113,0.07)' : 'rgba(231,76,60,0.07)',
                                                    px: 1, py: 0.25, borderRadius: '4px',
                                                }}>
                                                    {ans}
                                                </Typography>
                                            ))}
                                        </Box>
                                    ) : server.error ? (
                                        <Typography sx={{ color: '#E74C3C', fontSize: '0.75rem', fontStyle: 'italic' }}>
                                            {server.error}
                                        </Typography>
                                    ) : null}

                                    {/* Response time */}
                                    {server.responseTimeMs != null && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                            <Clock size={11} color="rgba(255,255,255,0.25)" />
                                            <Typography sx={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.7rem' }}>
                                                {server.responseTimeMs} ms
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>
        );
    };

    return (
        <ToolPageLayout>
            {/* Hero */}
            <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center', px: 2, background: 'linear-gradient(180deg, rgba(46,204,113,0.06) 0%, transparent 100%)' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <Box sx={{ display: 'inline-flex', p: 2, bgcolor: 'rgba(46,204,113,0.1)', borderRadius: '16px', mb: 3, border: '1px solid rgba(46,204,113,0.2)' }}>
                        <Globe size={36} color="#2ECC71" />
                    </Box>
                    <Typography variant="h2" sx={{ color: '#ffffff', fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>
                        DNS Propagation Checker
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}>
                        Verify how quickly your DNS changes spread across global nameservers. Check any record type from multiple worldwide locations in real-time.
                    </Typography>
                </motion.div>
            </Box>

            <Container maxWidth="lg" sx={{ pb: 8 }}>
                {/* Form */}
                <Paper elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', p: { xs: 3, md: 5 }, mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#e2e8f0' }}>Check DNS Propagation</Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mb: 2 }}>
                        <TextField
                            fullWidth
                            label="Domain Name"
                            placeholder="example.com"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                            InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)' } }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: '#fff',
                                    bgcolor: 'rgba(0,0,0,0.2)',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                    '&:hover fieldset': { borderColor: 'rgba(46,204,113,0.5)' },
                                    '&.Mui-focused fieldset': { borderColor: '#2ECC71' },
                                },
                            }}
                        />
                        <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                            <InputLabel sx={{ color: 'rgba(255,255,255,0.4)' }}>Record Type</InputLabel>
                            <Select
                                value={recordType}
                                label="Record Type"
                                onChange={(e) => setRecordType(e.target.value)}
                                sx={{
                                    color: '#fff',
                                    bgcolor: 'rgba(0,0,0,0.2)',
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(46,204,113,0.5)' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2ECC71' },
                                    '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' },
                                }}
                                MenuProps={{ PaperProps: { sx: { bgcolor: '#1a2744', border: '1px solid rgba(255,255,255,0.1)' } } }}
                            >
                                {RECORD_TYPES.map((t) => (
                                    <MenuItem key={t} value={t} sx={{ color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 700, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>{t}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleCheck}
                        disabled={loading || !domain}
                        sx={{
                            bgcolor: '#2ECC71', py: 1.5, fontWeight: 700, borderRadius: '10px', fontSize: '1rem',
                            '&:hover': { bgcolor: '#27ae60' },
                            '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' },
                        }}
                    >
                        {loading ? <><CircularProgress size={20} color="inherit" sx={{ mr: 1.5 }} />Checking propagation…</> : 'Check Propagation'}
                    </Button>
                </Paper>

                {/* Results */}
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
                            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', mb: 4 }}>
                                {renderResults()}
                            </Paper>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* How to Use */}
                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', mb: 4 }}>
                    <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 800, mb: 3 }}>How to Use</Typography>
                    {[
                        { step: '1', title: 'Enter Domain', desc: 'Type or paste the domain name you want to check (e.g., example.com or sub.example.com).' },
                        { step: '2', title: 'Select Record Type', desc: 'Choose the DNS record type you recently changed — A for IP, MX for mail, TXT for verification codes, etc.' },
                        { step: '3', title: 'Click Check Propagation', desc: 'Our tool queries 30+ global DNS resolvers simultaneously and shows which ones have your updated record.' },
                        { step: '4', title: 'Review Results', desc: 'Green = record propagated to that server. Red = still has old record or no response. The propagation % shows overall progress.' },
                    ].map((item) => (
                        <Box key={item.step} sx={{ display: 'flex', gap: 2.5, mb: 2.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(46,204,113,0.15)', border: '1px solid rgba(46,204,113,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Typography sx={{ color: '#2ECC71', fontWeight: 800, fontSize: '0.85rem' }}>{item.step}</Typography>
                            </Box>
                            <Box>
                                <Typography sx={{ color: '#ffffff', fontWeight: 700, mb: 0.5 }}>{item.title}</Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</Typography>
                            </Box>
                        </Box>
                    ))}
                </Paper>

                {/* FAQs */}
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

export default DnsPropagationPage;
