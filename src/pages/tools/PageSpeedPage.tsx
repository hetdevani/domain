import React, { useState } from 'react';
import {
    Box, Typography, Container, TextField, Button, Paper,
    CircularProgress, Accordion, AccordionSummary, AccordionDetails, Grid, Chip, Tabs, Tab
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, ChevronDown, AlertCircle, Monitor, Smartphone,
    CheckCircle, AlertTriangle, Lightbulb, ShieldAlert
} from 'lucide-react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import SEOHead from '../../components/seo/SEOHead';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/web/publicTool`;
const ACCENT = '#F39C12';

const FAQS = [
    { q: 'What is page speed and why does it matter?', a: 'Page speed measures how quickly a web page loads for users. Google uses page speed as a ranking factor. Faster pages improve user experience, reduce bounce rates, and increase conversions.' },
    { q: 'What is the First Contentful Paint (FCP)?', a: 'FCP measures the time from navigation start until the browser renders the first piece of DOM content — text, images, or SVGs. A good FCP is under 1.8 seconds.' },
    { q: 'What is Largest Contentful Paint (LCP)?', a: 'LCP measures when the largest visible content element is rendered. Google considers under 2.5 seconds good. It\'s a Core Web Vital.' },
    { q: 'What is Total Blocking Time (TBT)?', a: 'TBT measures the total time the main thread is blocked after FCP, which delays user interaction. Under 200ms is considered good.' },
    { q: 'How can I improve my page speed score?', a: 'Common improvements: compress images, enable caching, minify CSS/JS, use a CDN, remove render-blocking resources, and lazy-load offscreen images.' },
];

const getScoreColor = (score: number) =>
    score >= 90 ? '#2ECC71' : score >= 50 ? '#F39C12' : '#E74C3C';

const getScoreLabel = (score: number) =>
    score >= 90 ? 'Good' : score >= 50 ? 'Needs Work' : 'Poor';

// Circular score gauge
const ScoreRing: React.FC<{ score: number; label: string; size?: number }> = ({ score, label, size = 100 }) => {
    const color = getScoreColor(score);
    const r = 38;
    const circumference = 2 * Math.PI * r;
    const dash = (Math.min(100, score) / 100) * circumference;
    return (
        <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
                <Box component="svg" viewBox="0 0 90 90" sx={{ width: size, height: size, position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                    <circle cx="45" cy="45" r={r} fill="none" stroke="#e2e8f0" strokeWidth="7" />
                    <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="7"
                        strokeDasharray={`${dash} ${circumference - dash}`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 0.8s ease' }}
                    />
                </Box>
                <Typography sx={{ color, fontWeight: 900, fontSize: size >= 100 ? '1.5rem' : '1.1rem', lineHeight: 1 }}>{score}</Typography>
            </Box>
            <Typography sx={{ color: '#475569', fontWeight: 600, fontSize: '0.78rem', mt: 0.75, lineHeight: 1.2 }}>{label}</Typography>
            <Typography sx={{ color, fontWeight: 700, fontSize: '0.68rem' }}>{getScoreLabel(score)}</Typography>
        </Box>
    );
};

const MetricPill: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = '#1e293b' }) => (
    <Box sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center' }}>
        <Typography sx={{ color, fontWeight: 800, fontSize: '1.2rem', fontFamily: 'monospace', lineHeight: 1 }}>{value}</Typography>
        <Typography sx={{ color: '#94a3b8', fontSize: '0.68rem', mt: 0.5, fontWeight: 500 }}>{label}</Typography>
    </Box>
);

const PageSpeedPage: React.FC = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [strategy, setStrategy] = useState<'desktop' | 'mobile'>('desktop');

    const handleCheck = async () => {
        if (!url) return;
        setLoading(true); setError(null); setResult(null); setStrategy('desktop');
        try {
            const res = await fetch(`${API_BASE}/pagespeed/deep/?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            if (data.success === true) setResult(data);
            else setError(data.message || 'Request failed');
        } catch {
            setError('Failed to reach the server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderResult = () => {
        if (!result) return null;

        // Deep API: result.mobile.normalized / result.desktop.normalized
        const view = result[strategy]?.normalized ?? result[strategy] ?? {};
        const scores = view.scores ?? {};
        const cwv = view.coreWebVitals ?? {};
        const screenshot: string | null = view.screenshots?.final ?? null;
        const opportunities: any[] = view.opportunities ?? [];
        const diagnostics: any[] = view.diagnostics ?? [];
        const failedDiagnostics = diagnostics.filter((d: any) => d.score === 0);
        const passedCount = diagnostics.filter((d: any) => d.score > 0 || d.score === null).length;

        const SCORE_ITEMS = [
            { label: 'Performance', key: 'performance' },
            { label: 'Accessibility', key: 'accessibility' },
            { label: 'Best Practices', key: 'bestPractices' },
            { label: 'SEO', key: 'seo' },
        ];

        const CWV_ITEMS = [
            { label: 'FCP', full: 'First Contentful Paint', key: 'FCP' },
            { label: 'LCP', full: 'Largest Contentful Paint', key: 'LCP' },
            { label: 'CLS', full: 'Cumulative Layout Shift', key: 'CLS' },
            { label: 'TBT', full: 'Total Blocking Time', key: 'TBT' },
            { label: 'SI', full: 'Speed Index', key: 'speedIndex' },
            { label: 'TTFB', full: 'Time to First Byte', key: 'TTFB' },
            { label: 'INP', full: 'Interaction to Next Paint', key: 'INP' },
        ];

        return (
            <Box>
                {/* Header: URL + strategy tabs */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography sx={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, mb: 0.5 }}>Analyzed URL</Typography>
                        <Typography sx={{ color: '#475569', fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>{result.url}</Typography>
                    </Box>
                    <Tabs
                        value={strategy}
                        onChange={(_e, v) => setStrategy(v)}
                        sx={{
                            minHeight: 36, bgcolor: '#f1f5f9', borderRadius: '10px', p: 0.5,
                            '& .MuiTab-root': { minHeight: 32, py: 0.5, px: 2, borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem', color: '#64748b' },
                            '& .Mui-selected': { color: '#1e293b !important', bgcolor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
                            '& .MuiTabs-indicator': { display: 'none' },
                        }}
                    >
                        <Tab icon={<Monitor size={14} />} iconPosition="start" label="Desktop" value="desktop" />
                        <Tab icon={<Smartphone size={14} />} iconPosition="start" label="Mobile" value="mobile" />
                    </Tabs>
                </Box>

                {/* Score Rings + Screenshot */}
                <Box sx={{ p: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', mb: 3, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 280 }}>
                        <Typography sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>
                            Lighthouse Scores
                        </Typography>
                        <Grid container spacing={1.5}>
                            {SCORE_ITEMS.map(({ label, key }) => (
                                scores[key] !== undefined ? (
                                    <Grid key={key} size={{ xs: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <ScoreRing score={scores[key]} label={label} size={90} />
                                        </Box>
                                    </Grid>
                                ) : null
                            ))}
                        </Grid>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                            {[{ color: '#2ECC71', label: '90–100 Good' }, { color: '#F39C12', label: '50–89 Needs Work' }, { color: '#E74C3C', label: '0–49 Poor' }].map(item => (
                                <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>{item.label}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Page Screenshot */}
                    {screenshot && (
                        <Box sx={{ flexShrink: 0 }}>
                            <Typography sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1 }}>
                                Page Screenshot
                            </Typography>
                            <Box
                                component="img"
                                src={screenshot}
                                alt="Page screenshot"
                                sx={{ width: 140, height: 'auto', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', display: 'block' }}
                            />
                        </Box>
                    )}
                </Box>

                {/* Core Web Vitals */}
                {Object.keys(cwv).length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Zap size={13} color={ACCENT} /> Core Web Vitals & Lab Metrics
                        </Typography>
                        <Grid container spacing={1.5}>
                            {CWV_ITEMS.map(({ label, full, key }) => (
                                cwv[key] !== undefined && cwv[key] !== 'N/A' ? (
                                    <Grid key={key} size={{ xs: 6, sm: 4, md: 3 }}>
                                        <MetricPill label={`${label} — ${full}`} value={String(cwv[key])} />
                                    </Grid>
                                ) : null
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* Opportunities */}
                {opportunities.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Lightbulb size={13} color="#F39C12" /> Opportunities
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {opportunities.map((op: any, i: number) => (
                                <Box key={i} sx={{ p: 2, bgcolor: 'rgba(243,156,18,0.06)', border: '1px solid rgba(243,156,18,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <AlertTriangle size={15} color="#F39C12" style={{ flexShrink: 0 }} />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{ color: '#1e293b', fontWeight: 700, fontSize: '0.85rem' }}>{op.title}</Typography>
                                        {op.displayValue && (
                                            <Typography sx={{ color: '#64748b', fontSize: '0.78rem', mt: 0.25 }}>{op.displayValue}</Typography>
                                        )}
                                    </Box>
                                    {op.savingsMs > 0 && (
                                        <Chip
                                            label={`Save ${op.savingsMs >= 1000 ? (op.savingsMs / 1000).toFixed(1) + 's' : op.savingsMs + 'ms'}`}
                                            size="small"
                                            sx={{ bgcolor: 'rgba(243,156,18,0.12)', color: '#d97706', border: '1px solid rgba(243,156,18,0.3)', fontWeight: 700, fontSize: '0.7rem', flexShrink: 0 }}
                                        />
                                    )}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Diagnostics */}
                {failedDiagnostics.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <ShieldAlert size={13} color="#E74C3C" /> Failed Audits
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {failedDiagnostics.map((d: any, i: number) => (
                                <Box key={i} sx={{ p: 2, bgcolor: 'rgba(231,76,60,0.05)', border: '1px solid rgba(231,76,60,0.18)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <AlertCircle size={15} color="#E74C3C" style={{ flexShrink: 0 }} />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{ color: '#1e293b', fontWeight: 700, fontSize: '0.85rem' }}>{d.title}</Typography>
                                        {d.displayValue && (
                                            <Typography sx={{ color: '#64748b', fontSize: '0.78rem', mt: 0.25 }}>{d.displayValue}</Typography>
                                        )}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Passed audits summary */}
                {passedCount > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: '10px' }}>
                        <CheckCircle size={16} color="#2ECC71" />
                        <Typography sx={{ color: '#2ECC71', fontWeight: 700, fontSize: '0.85rem' }}>
                            {passedCount} audit{passedCount !== 1 ? 's' : ''} passed
                        </Typography>
                    </Box>
                )}
            </Box>
        );
    };

    return (
        <ToolPageLayout>
            <SEOHead
            title="Page Speed Metrics — Full Lighthouse Audit & Core Web Vitals"
            description="Run a full Google Lighthouse audit. Check Core Web Vitals (FCP, LCP, CLS, TBT), performance scores, opportunities and diagnostics for Desktop and Mobile."
            keywords="page speed test, lighthouse audit, core web vitals, lcp fcp cls tbt, google pagespeed insights, website speed test"
            canonical="/tools/page-speed"
        />
            <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center', px: 2, background: `linear-gradient(180deg, ${ACCENT}12 0%, transparent 100%)` }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <Box sx={{ display: 'inline-flex', p: 2, bgcolor: `${ACCENT}18`, borderRadius: '16px', mb: 3, border: `1px solid ${ACCENT}40` }}>
                        <Zap size={36} color={ACCENT} />
                    </Box>
                    <Typography variant="h2" sx={{ color: '#1e293b', fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>Page Speed Metrics</Typography>
                    <Typography sx={{ color: '#64748b', maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}>
                        Full Lighthouse audit — Core Web Vitals, scores, opportunities, and diagnostics for Desktop & Mobile.
                    </Typography>
                </motion.div>
            </Box>

            <Container maxWidth="md" sx={{ pb: 8 }}>
                <Paper elevation={0} sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', p: { xs: 3, md: 5 }, mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#334155' }}>Analyze Page Speed</Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <TextField
                            fullWidth label="Website URL" placeholder="https://example.com"
                            value={url} onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                            InputLabelProps={{ sx: { color: '#64748b', '&.Mui-focused': { color: '#1e293b' } } }}
                            sx={{ '& .MuiOutlinedInput-root': { color: '#1e293b', bgcolor: '#f8fafc', height: '56px', '& fieldset': { borderColor: '#e2e8f0' }, '&:hover fieldset': { borderColor: `${ACCENT}80` }, '&.Mui-focused fieldset': { borderColor: ACCENT } } }}
                        />
                        <Button variant="contained" onClick={handleCheck} disabled={loading || !url}
                            sx={{ bgcolor: ACCENT, px: 4, fontWeight: 700, borderRadius: '10px', minWidth: 160, whiteSpace: 'nowrap', '&:hover': { filter: 'brightness(0.88)', bgcolor: ACCENT }, '&.Mui-disabled': { bgcolor: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.3)' } }}>
                            {loading ? <><CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />Analyzing…</> : 'Analyze Speed'}
                        </Button>
                    </Box>
                    {loading && (
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={12} sx={{ color: '#94a3b8' }} />
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                Running full Lighthouse audit — this may take 20–40 seconds…
                            </Typography>
                        </Box>
                    )}
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
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                                    <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 700 }}>Performance Report</Typography>
                                    <Chip label={result.provider ?? 'Lighthouse'} size="small" sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontSize: '0.7rem', fontWeight: 600 }} />
                                </Box>
                                {renderResult()}
                            </Paper>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', mb: 4 }}>
                    <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 800, mb: 3 }}>How to Use</Typography>
                    {[
                        { step: '1', title: 'Enter URL', desc: 'Paste the full URL of the page you want to test.' },
                        { step: '2', title: 'Click Analyze Speed', desc: 'We run a full Google Lighthouse audit for Desktop and Mobile. This takes 20–40 seconds.' },
                        { step: '3', title: 'Switch Desktop / Mobile', desc: 'Use the tabs to compare Lighthouse scores and metrics between both strategies.' },
                        { step: '4', title: 'Fix Opportunities & Diagnostics', desc: 'Opportunities show estimated savings. Failed audits highlight specific issues to address for better scores.' },
                    ].map((item) => (
                        <Box key={item.step} sx={{ display: 'flex', gap: 2.5, mb: 2.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: `${ACCENT}25`, border: `1px solid ${ACCENT}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Typography sx={{ color: ACCENT, fontWeight: 800, fontSize: '0.85rem' }}>{item.step}</Typography>
                            </Box>
                            <Box>
                                <Typography sx={{ color: '#1e293b', fontWeight: 700, mb: 0.5 }}>{item.title}</Typography>
                                <Typography sx={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</Typography>
                            </Box>
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

export default PageSpeedPage;
