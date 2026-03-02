import React, { useState } from 'react';
import {
    Box, Typography, Container, TextField, Button, Paper,
    CircularProgress, Accordion, AccordionSummary, AccordionDetails, Grid
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronDown, AlertCircle } from 'lucide-react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/web/publicTool`;

const FAQS = [
    { q: 'What is page speed and why does it matter?', a: 'Page speed measures how quickly a web page loads for users. Google uses page speed as a ranking factor. Faster pages improve user experience, reduce bounce rates, and increase conversions.' },
    { q: 'What is the First Contentful Paint (FCP)?', a: 'FCP measures the time from navigation start until the browser renders the first piece of DOM content — text, images, or SVGs. A good FCP is under 1.8 seconds.' },
    { q: 'What is Largest Contentful Paint (LCP)?', a: 'LCP measures when the largest visible content element is rendered. Google considers under 2.5 seconds good. It\'s a Core Web Vital.' },
    { q: 'What is Total Blocking Time (TBT)?', a: 'TBT measures the total time the main thread is blocked after FCP, which delays user interaction. Under 200ms is considered good.' },
    { q: 'How can I improve my page speed score?', a: 'Common improvements: compress images, enable caching, minify CSS/JS, use a CDN, remove render-blocking resources, and lazy-load offscreen images.' },
];

const ScoreGauge: React.FC<{ score: number; label: string; color: string }> = ({ score, label, color }) => {
    const pct = Math.min(100, Math.max(0, score));
    return (
        <Box sx={{ textAlign: 'center', p: 2 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, mb: 1 }}>
                <Box component="svg" viewBox="0 0 36 36" sx={{ width: 80, height: 80, transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke={color} strokeWidth="3"
                        strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
                </Box>
                <Typography sx={{ position: 'absolute', color, fontWeight: 900, fontSize: '1.1rem' }}>{score}</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', fontSize: '0.75rem' }}>{label}</Typography>
        </Box>
    );
};

const MetricRow: React.FC<{ label: string; value?: string; unit?: string; status?: 'good' | 'needs-improvement' | 'poor' }> = ({ label, value, unit, status }) => {
    const statusColors = { good: '#2ECC71', 'needs-improvement': '#F39C12', poor: '#E74C3C' };
    const color = status ? statusColors[status] : '#e2e8f0';
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem' }}>{label}</Typography>
            <Typography sx={{ color, fontWeight: 700, fontFamily: 'monospace', fontSize: '0.9rem' }}>{value || 'N/A'}{unit ? ` ${unit}` : ''}</Typography>
        </Box>
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

    const getScoreColor = (score: number) => score >= 90 ? '#2ECC71' : score >= 50 ? '#F39C12' : '#E74C3C';
    const getStatus = (value: number, good: number, poor: number): 'good' | 'needs-improvement' | 'poor' =>
        value <= good ? 'good' : value <= poor ? 'needs-improvement' : 'poor';

    const renderResult = () => {
        if (!result) return null;
        const perf = result.performance || result.score || {};
        const metrics = result.metrics || result;

        return (
            <Box>
                {/* Score Gauges */}
                {(result.scores || result.categories) && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mb: 4, p: 3, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
                        {Object.entries(result.scores || result.categories || {}).map(([key, val]: [string, any]) => {
                            const score = typeof val === 'number' ? val : val?.score ? Math.round(val.score * 100) : 0;
                            return <ScoreGauge key={key} score={score} label={key.replace(/-/g, ' ')} color={getScoreColor(score)} />;
                        })}
                    </Box>
                )}

                {/* Core Web Vitals */}
                <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.1em', display: 'block', mb: 1.5 }}>Core Web Vitals & Metrics</Typography>
                <Box sx={{ bgcolor: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', px: 3, mb: 3 }}>
                    {metrics.fcp !== undefined && <MetricRow label="First Contentful Paint (FCP)" value={metrics.fcp} unit="s" status={getStatus(parseFloat(metrics.fcp), 1.8, 3)} />}
                    {metrics.lcp !== undefined && <MetricRow label="Largest Contentful Paint (LCP)" value={metrics.lcp} unit="s" status={getStatus(parseFloat(metrics.lcp), 2.5, 4)} />}
                    {metrics.tbt !== undefined && <MetricRow label="Total Blocking Time (TBT)" value={metrics.tbt} unit="ms" status={getStatus(parseFloat(metrics.tbt), 200, 600)} />}
                    {metrics.cls !== undefined && <MetricRow label="Cumulative Layout Shift (CLS)" value={metrics.cls} status={getStatus(parseFloat(metrics.cls), 0.1, 0.25)} />}
                    {metrics.tti !== undefined && <MetricRow label="Time to Interactive (TTI)" value={metrics.tti} unit="s" status={getStatus(parseFloat(metrics.tti), 3.8, 7.3)} />}
                    {metrics.si !== undefined && <MetricRow label="Speed Index (SI)" value={metrics.si} unit="s" status={getStatus(parseFloat(metrics.si), 3.4, 5.8)} />}
                    {metrics.ttfb !== undefined && <MetricRow label="Time to First Byte (TTFB)" value={metrics.ttfb} unit="ms" status={getStatus(parseFloat(metrics.ttfb), 800, 1800)} />}
                </Box>

                {/* Raw JSON fallback */}
                {!metrics.fcp && !metrics.lcp && (
                    <Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 1 }}>Raw Response</Typography>
                        <Box component="pre" sx={{ color: '#a8b5c8', fontSize: '0.8rem', overflow: 'auto', maxHeight: 300 }}>
                            {JSON.stringify(result, null, 2)}
                        </Box>
                    </Box>
                )}
            </Box>
        );
    };

    return (
        <ToolPageLayout>
            <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center', px: 2, background: 'linear-gradient(180deg, rgba(243,156,18,0.07) 0%, transparent 100%)' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <Box sx={{ display: 'inline-flex', p: 2, bgcolor: 'rgba(243,156,18,0.1)', borderRadius: '16px', mb: 3, border: '1px solid rgba(243,156,18,0.25)' }}>
                        <Zap size={36} color="#F39C12" />
                    </Box>
                    <Typography variant="h2" sx={{ color: '#ffffff', fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>Page Speed Metrics</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}>
                        Measure your website's Core Web Vitals and performance metrics. Check FCP, LCP, TBT, CLS, and overall performance scores.
                    </Typography>
                </motion.div>
            </Box>

            <Container maxWidth="md" sx={{ pb: 8 }}>
                <Paper elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', p: { xs: 3, md: 5 }, mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#e2e8f0' }}>Analyze Page Speed</Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <TextField
                            fullWidth label="Website URL" placeholder="https://example.com"
                            value={url} onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                            InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)' } }}
                            sx={{ '& .MuiOutlinedInput-root': { color: '#fff', bgcolor: 'rgba(0,0,0,0.2)', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(243,156,18,0.5)' }, '&.Mui-focused fieldset': { borderColor: '#F39C12' } } }}
                        />
                        <Button variant="contained" onClick={handleCheck} disabled={loading || !url}
                            sx={{ bgcolor: '#F39C12', px: 4, fontWeight: 700, borderRadius: '10px', minWidth: 160, '&:hover': { bgcolor: '#e67e22' }, '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' } }}>
                            {loading ? <><CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />Analyzing…</> : 'Analyze Speed'}
                        </Button>
                    </Box>
                    {loading && <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', mt: 1.5, display: 'block' }}>This may take 15–30 seconds while we run performance audits…</Typography>}
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
                            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', mb: 4 }}>
                                <Typography variant="h6" sx={{color: '#ffffff', fontWeight: 700, mb: 3 }}>Performance Report for <Box component="span" sx={{ color: '#F39C12', fontFamily: 'monospace', fontSize: '0.9em' }}>{url}</Box></Typography>
                                {renderResult()}
                            </Paper>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', mb: 4 }}>
                    <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 800, mb: 3 }}>How to Use</Typography>
                    {[
                        { step: '1', title: 'Enter URL', desc: 'Paste the full URL of the page you want to test. Use the actual page URL, not just the domain.' },
                        { step: '2', title: 'Click Analyze Speed', desc: 'Our server runs performance audits using real browser testing. This can take 15–30 seconds.' },
                        { step: '3', title: 'Review Core Web Vitals', desc: 'Green metrics are good. Yellow needs improvement. Red metrics require attention and will hurt SEO rankings.' },
                        { step: '4', title: 'Optimize', desc: 'Use the results to prioritize optimizations. Focus on LCP and TBT first as they have the biggest SEO impact.' },
                    ].map((item) => (
                        <Box key={item.step} sx={{ display: 'flex', gap: 2.5, mb: 2.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(243,156,18,0.15)', border: '1px solid rgba(243,156,18,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Typography sx={{ color: '#F39C12', fontWeight: 800, fontSize: '0.85rem' }}>{item.step}</Typography>
                            </Box>
                            <Box><Typography sx={{ color: '#ffffff', fontWeight: 700, mb: 0.5 }}>{item.title}</Typography><Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</Typography></Box>
                        </Box>
                    ))}
                </Paper>

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

export default PageSpeedPage;
