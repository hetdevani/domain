import React, { useState } from 'react';
import {
    Box, Typography, Container, TextField, Button, Paper,
    CircularProgress, Accordion, AccordionSummary, AccordionDetails, Grid, Tooltip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronDown, AlertCircle, Clock, Eye, MousePointer, LayoutDashboard, Timer, Gauge, Server } from 'lucide-react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';

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

const getStatus = (value: number, good: number, poor: number): 'good' | 'needs-improvement' | 'poor' =>
    value <= good ? 'good' : value <= poor ? 'needs-improvement' : 'poor';

const STATUS_LABEL: Record<string, string> = { good: 'Good', 'needs-improvement': 'Needs Improvement', poor: 'Poor' };
const STATUS_COLOR: Record<string, string> = { good: '#2ECC71', 'needs-improvement': '#F39C12', poor: '#E74C3C' };

// Big circular score gauge
const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
    const color = getScoreColor(score);
    const pct = Math.min(100, Math.max(0, score));
    const circumference = 2 * Math.PI * 52;
    const dash = (pct / 100) * circumference;
    const label = score >= 90 ? 'Good' : score >= 50 ? 'Needs Work' : 'Poor';
    return (
        <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 140, height: 140 }}>
                <Box component="svg" viewBox="0 0 120 120" sx={{ width: 140, height: 140, position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="8"
                        strokeDasharray={`${dash} ${circumference - dash}`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 0.8s ease' }}
                    />
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ color, fontWeight: 900, fontSize: '2rem', lineHeight: 1 }}>{score}</Typography>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>/100</Typography>
                </Box>
            </Box>
            <Typography sx={{ color, fontWeight: 700, fontSize: '0.85rem', mt: 1 }}>{label}</Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>Performance Score</Typography>
        </Box>
    );
};

// Individual metric card
const MetricCard: React.FC<{
    label: string;
    abbr: string;
    value?: string | number;
    unit?: string;
    good: number;
    poor: number;
    icon: React.ReactNode;
    description: string;
    isLowerBetter?: boolean;
}> = ({ label, abbr, value, unit, good, poor, icon, description, isLowerBetter = true }) => {
    const numVal = value !== undefined ? parseFloat(String(value)) : NaN;
    const hasValue = !isNaN(numVal) && value !== undefined && value !== null;
    const status: 'good' | 'needs-improvement' | 'poor' = hasValue
        ? getStatus(isLowerBetter ? numVal : (100 - numVal), isLowerBetter ? good : (100 - poor), isLowerBetter ? poor : (100 - good))
        : 'poor';
    const color = hasValue ? STATUS_COLOR[status] : '#cbd5e1';

    // Progress bar: 0% = 0, 100% = at or beyond "poor" threshold
    const barPct = hasValue ? Math.min(100, (numVal / poor) * 100) : 0;

    return (
        <Tooltip title={description} placement="top" arrow>
            <Box sx={{
                p: 2.5, borderRadius: '14px',
                bgcolor: hasValue ? `${color}08` : 'rgba(0,0,0,0.02)',
                border: `1px solid ${hasValue ? `${color}25` : '#e2e8f0'}`,
                height: '100%',
                cursor: 'default',
                transition: 'border-color 0.2s',
                '&:hover': { border: `1px solid ${color}50` },
            }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: hasValue ? color : '#cbd5e1', display: 'flex' }}>{icon}</Box>
                        <Box>
                            <Typography sx={{ color: '#1e293b', fontWeight: 700, fontSize: '0.82rem', lineHeight: 1.2 }}>{label}</Typography>
                            <Typography sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>{abbr}</Typography>
                        </Box>
                    </Box>
                    {hasValue && (
                        <Box sx={{ px: 1.2, py: 0.4, bgcolor: `${color}18`, border: `1px solid ${color}35`, borderRadius: '20px', flexShrink: 0 }}>
                            <Typography sx={{ color, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {STATUS_LABEL[status]}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Value */}
                <Typography sx={{ color: hasValue ? color : '#cbd5e1', fontWeight: 900, fontSize: '1.8rem', fontFamily: 'monospace', lineHeight: 1, mb: 0.5 }}>
                    {hasValue ? value : '—'}
                    {hasValue && unit && <Typography component="span" sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#94a3b8', ml: 0.5 }}>{unit}</Typography>}
                </Typography>

                {/* Threshold bar */}
                <Box sx={{ mt: 2, height: 4, bgcolor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                    <Box sx={{
                        height: '100%',
                        width: `${barPct}%`,
                        bgcolor: color,
                        borderRadius: '2px',
                        transition: 'width 0.8s ease',
                    }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography sx={{ fontSize: '0.62rem', color: '#2ECC71' }}>Good ≤{good}{unit}</Typography>
                    <Typography sx={{ fontSize: '0.62rem', color: '#E74C3C' }}>{'Poor >'}{poor}{unit}</Typography>
                </Box>
            </Box>
        </Tooltip>
    );
};

const PageSpeedPage: React.FC = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCheck = async () => {
        if (!url) return;
        setLoading(true); setError(null); setResult(null);
        try {
            const res = await fetch(`${API_BASE}/page-speed-basic-metrics?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            if (data.status === 'success' || data.status === 200 || data.code === 'SUCCESS') setResult(data.data);
            else setError(data.message || 'Request failed');
        } catch {
            setError('Failed to reach the server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderResult = () => {
        if (!result) return null;
        const metrics = result.metrics || result;

        // Extract performance score
        const perfScore: number | null =
            typeof result.performanceScore === 'number' ? result.performanceScore :
            typeof result.score === 'number' ? result.score :
            result.scores?.performance !== undefined ? Math.round(result.scores.performance * (result.scores.performance <= 1 ? 100 : 1)) :
            result.categories?.performance?.score !== undefined ? Math.round(result.categories.performance.score * 100) :
            null;

        // Resolve metric values, handling both nested and flat API shapes
        const fcp = metrics.fcp ?? metrics.firstContentfulPaint;
        const lcp = metrics.lcp ?? metrics.largestContentfulPaint;
        const tbt = metrics.tbt ?? metrics.totalBlockingTime;
        const cls = metrics.cls ?? metrics.cumulativeLayoutShift;
        const tti = metrics.tti ?? metrics.timeToInteractive;
        const si  = metrics.si  ?? metrics.speedIndex;
        const ttfb = metrics.ttfb ?? metrics.timeToFirstByte;

        const hasAnyMetric = [fcp, lcp, tbt, cls, tti, si, ttfb].some(v => v !== undefined && v !== null);

        const CORE_METRICS = [
            { label: 'First Contentful Paint', abbr: 'FCP', value: fcp, unit: 's', good: 1.8, poor: 3, icon: <Eye size={16} />, description: 'Time until the browser renders the first piece of DOM content. Good: < 1.8s' },
            { label: 'Largest Contentful Paint', abbr: 'LCP', value: lcp, unit: 's', good: 2.5, poor: 4, icon: <LayoutDashboard size={16} />, description: 'Time until the largest content element is visible. Core Web Vital. Good: < 2.5s' },
            { label: 'Total Blocking Time', abbr: 'TBT', value: tbt, unit: 'ms', good: 200, poor: 600, icon: <MousePointer size={16} />, description: 'Total time the main thread is blocked, delaying interaction. Good: < 200ms' },
            { label: 'Cumulative Layout Shift', abbr: 'CLS', value: cls, unit: '', good: 0.1, poor: 0.25, icon: <Gauge size={16} />, description: 'Measures visual stability — how much the page shifts during load. Core Web Vital. Good: < 0.1' },
        ];

        const OTHER_METRICS = [
            { label: 'Time to Interactive', abbr: 'TTI', value: tti, unit: 's', good: 3.8, poor: 7.3, icon: <Timer size={16} />, description: 'Time until the page is fully interactive. Good: < 3.8s' },
            { label: 'Speed Index', abbr: 'SI', value: si, unit: 's', good: 3.4, poor: 5.8, icon: <Zap size={16} />, description: 'How quickly content is visually populated. Good: < 3.4s' },
            { label: 'Time to First Byte', abbr: 'TTFB', value: ttfb, unit: 'ms', good: 800, poor: 1800, icon: <Server size={16} />, description: 'Time until the first byte of the response is received. Good: < 800ms' },
            { label: 'First Input Delay', abbr: 'FID', value: metrics.fid ?? metrics.firstInputDelay, unit: 'ms', good: 100, poor: 300, icon: <Clock size={16} />, description: 'Time from first interaction to browser response. Core Web Vital. Good: < 100ms' },
        ];

        return (
            <Box>
                {/* Score + URL header */}
                <Box sx={{ display: 'flex', gap: 3, mb: 4, alignItems: 'center', flexWrap: 'wrap', p: 3, bgcolor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    {perfScore !== null && <ScoreRing score={perfScore} />}
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography sx={{ color: '#1e293b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, mb: 0.5 }}>Analyzed URL</Typography>
                        <Typography sx={{ color: '#475569', fontFamily: 'monospace', fontSize: '0.88rem', wordBreak: 'break-all', mb: 2 }}>{url}</Typography>
                        {/* Score legend */}
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {[{ color: '#2ECC71', label: '90–100 Good' }, { color: '#F39C12', label: '50–89 Needs Improvement' }, { color: '#E74C3C', label: '0–49 Poor' }].map(item => (
                                <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                                    <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>{item.label}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>

                {/* Core Web Vitals */}
                {hasAnyMetric && (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Zap size={14} color={ACCENT} />
                            <Typography sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Core Web Vitals
                            </Typography>
                        </Box>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            {CORE_METRICS.map((m) => (
                                m.value !== undefined && m.value !== null ? (
                                    <Grid key={m.abbr} size={{ xs: 12, sm: 6 }}>
                                        <MetricCard {...m} />
                                    </Grid>
                                ) : null
                            ))}
                        </Grid>

                        {/* Other Metrics */}
                        {OTHER_METRICS.some(m => m.value !== undefined && m.value !== null) && (
                            <>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Clock size={14} color="#94a3b8" />
                                    <Typography sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        Additional Metrics
                                    </Typography>
                                </Box>
                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                    {OTHER_METRICS.map((m) => (
                                        m.value !== undefined && m.value !== null ? (
                                            <Grid key={m.abbr} size={{ xs: 12, sm: 6 }}>
                                                <MetricCard {...m} />
                                            </Grid>
                                        ) : null
                                    ))}
                                </Grid>
                            </>
                        )}
                    </>
                )}

                {/* Fallback raw JSON */}
                {!hasAnyMetric && (
                    <Box sx={{ p: 3, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                        <Typography variant="caption" sx={{ color: '#1e293b', display: 'block', mb: 1 }}>Raw Response</Typography>
                        <Box component="pre" sx={{ color: '#475569', fontSize: '0.8rem', overflow: 'auto', maxHeight: 300, m: 0 }}>
                            {JSON.stringify(result, null, 2)}
                        </Box>
                    </Box>
                )}
            </Box>
        );
    };

    return (
        <ToolPageLayout>
            <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center', px: 2, background: `linear-gradient(180deg, ${ACCENT}12 0%, transparent 100%)` }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <Box sx={{ display: 'inline-flex', p: 2, bgcolor: `${ACCENT}18`, borderRadius: '16px', mb: 3, border: `1px solid ${ACCENT}40` }}>
                        <Zap size={36} color={ACCENT} />
                    </Box>
                    <Typography variant="h2" sx={{ color: '#1e293b', fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>Page Speed Metrics</Typography>
                    <Typography sx={{ color: '#64748b', maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}>
                        Measure your website's Core Web Vitals and performance metrics. Check FCP, LCP, TBT, CLS, and overall performance scores.
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
                                Running performance audits — this may take 15–30 seconds…
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
                                <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 700, mb: 3 }}>Performance Report</Typography>
                                {renderResult()}
                            </Paper>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', mb: 4 }}>
                    <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 800, mb: 3 }}>How to Use</Typography>
                    {[
                        { step: '1', title: 'Enter URL', desc: 'Paste the full URL of the page you want to test. Use the actual page URL, not just the domain.' },
                        { step: '2', title: 'Click Analyze Speed', desc: 'Our server runs performance audits using real browser testing. This can take 15–30 seconds.' },
                        { step: '3', title: 'Review Core Web Vitals', desc: 'Green metrics are good. Yellow needs improvement. Red metrics require attention and will hurt SEO rankings.' },
                        { step: '4', title: 'Optimize', desc: 'Use the results to prioritize optimizations. Focus on LCP and TBT first as they have the biggest SEO impact.' },
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
