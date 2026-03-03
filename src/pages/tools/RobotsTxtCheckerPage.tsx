import React, { useState } from 'react';
import {
    Box, Typography, Container, TextField, Button, Paper,
    CircularProgress, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronDown, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/web/publicTool`;

const FAQS = [
    { q: 'What is robots.txt?', a: 'Robots.txt is a text file placed at the root of a website that instructs search engine crawlers which pages they are allowed or disallowed to crawl and index.' },
    { q: 'Does robots.txt guarantee privacy?', a: 'No. Robots.txt is publicly visible and disallowing a URL only requests that crawlers respect the rule — it doesn\'t prevent direct access or archiving.' },
    { q: 'What is the difference between Disallow and Noindex?', a: 'Disallow in robots.txt prevents crawlers from fetching the URL. Noindex in meta tags allows crawling but prevents indexing. They serve different purposes.' },
    { q: 'What does Disallow: / mean?', a: 'Disallow: / blocks all crawlers from the entire website. This is often used on staging or development sites to prevent accidental indexing.' },
    { q: 'What is a sitemap directive in robots.txt?', a: 'The Sitemap: directive in robots.txt points search engines to the XML sitemap file, helping them discover all pages on the site efficiently.' },
];

const RobotsTxtCheckerPage: React.FC = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCheck = async () => {
        if (!url) return;
        setLoading(true); setError(null); setResult(null);
        try {
            const res = await fetch(`${API_BASE}/robots-txt-checker?url=${encodeURIComponent(url)}`);
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
        const raw = result.raw || result.content || result.robotsTxt || '';
        const rules: any[] = result.rules || result.parsed || [];
        const sitemaps: string[] = result.sitemaps || [];

        return (
            <Box>
                {/* Stats */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    {result.found !== undefined && (
                        <Box sx={{ p: 2.5, bgcolor: result.found ? 'rgba(46,204,113,0.08)' : 'rgba(231,76,60,0.08)', border: `1px solid ${result.found ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)'}`, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {result.found ? <CheckCircle size={20} color="#2ECC71" /> : <XCircle size={20} color="#E74C3C" />}
                            <Typography sx={{ color: result.found ? '#2ECC71' : '#E74C3C', fontWeight: 700 }}>{result.found ? 'robots.txt Found' : 'robots.txt Not Found'}</Typography>
                        </Box>
                    )}
                    {sitemaps.length > 0 && (
                        <Box sx={{ p: 2.5, bgcolor: 'rgba(52,152,219,0.08)', border: '1px solid rgba(52,152,219,0.2)', borderRadius: '12px' }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>Sitemaps</Typography>
                            <Typography variant="h5" sx={{ color: '#3498DB', fontWeight: 900 }}>{sitemaps.length}</Typography>
                        </Box>
                    )}
                </Box>

                {/* Sitemaps */}
                {sitemaps.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="overline" sx={{ color: '#ffffff', fontWeight: 700, letterSpacing: '0.1em', display: 'block', mb: 1 }}>Declared Sitemaps</Typography>
                        {sitemaps.map((s, i) => (
                            <Box key={i} sx={{ p: 2, bgcolor: 'rgba(52,152,219,0.05)', border: '1px solid rgba(52,152,219,0.15)', borderRadius: '8px', mb: 1 }}>
                                <Typography sx={{ color: '#3498DB', fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>{s}</Typography>
                            </Box>
                        ))}
                    </Box>
                )}

                {/* Parsed Rules */}
                {rules.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="overline" sx={{ color: '#ffffff', fontWeight: 700, letterSpacing: '0.1em', display: 'block', mb: 1.5 }}>Parsed Rules</Typography>
                        {rules.map((rule, i) => (
                            <Box key={i} sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', mb: 1.5 }}>
                                <Typography sx={{ color: '#E67E22', fontFamily: 'monospace', fontSize: '0.8rem', mb: 1 }}>User-agent: {rule.userAgent || rule.agent || '*'}</Typography>
                                {(rule.allow || []).map((p: string, j: number) => (
                                    <Box key={j} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <CheckCircle size={13} color="#2ECC71" />
                                        <Typography sx={{ color: '#2ECC71', fontFamily: 'monospace', fontSize: '0.8rem' }}>Allow: {p}</Typography>
                                    </Box>
                                ))}
                                {(rule.disallow || []).map((p: string, j: number) => (
                                    <Box key={j} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <XCircle size={13} color="#E74C3C" />
                                        <Typography sx={{ color: '#E74C3C', fontFamily: 'monospace', fontSize: '0.8rem' }}>Disallow: {p}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        ))}
                    </Box>
                )}

                {/* Raw Content */}
                {raw && (
                    <Box>
                        <Typography variant="overline" sx={{ color: '#ffffff', fontWeight: 700, letterSpacing: '0.1em', display: 'block', mb: 1 }}>Raw Content</Typography>
                        <Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', fontFamily: 'monospace', fontSize: '0.82rem', color: '#a8b5c8', whiteSpace: 'pre-wrap', maxHeight: 400, overflow: 'auto', lineHeight: 1.7 }}>
                            {raw}
                        </Box>
                    </Box>
                )}
            </Box>
        );
    };

    return (
        <ToolPageLayout>
            <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center', px: 2, background: 'linear-gradient(180deg, rgba(230,126,34,0.07) 0%, transparent 100%)' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <Box sx={{ display: 'inline-flex', p: 2, bgcolor: 'rgba(230,126,34,0.1)', borderRadius: '16px', mb: 3, border: '1px solid rgba(230,126,34,0.25)' }}>
                        <Shield size={36} color="#E67E22" />
                    </Box>
                    <Typography variant="h2" sx={{ color: '#ffffff', fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>Robots.txt Checker</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}>
                        Fetch, validate, and analyze any website's robots.txt file. Check crawl rules, disallowed paths, allowed bots, and declared sitemaps.
                    </Typography>
                </motion.div>
            </Box>

            <Container maxWidth="md" sx={{ pb: 8 }}>
                <Paper elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', p: { xs: 3, md: 5 }, mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#e2e8f0' }}>Check robots.txt</Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <TextField
                            fullWidth label="Website URL" placeholder="https://example.com"
                            value={url} onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                            InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)', '&.Mui-focused': { color: '#fff' } } }}
                            sx={{ '& .MuiOutlinedInput-root': { color: '#fff', bgcolor: 'rgba(0,0,0,0.2)', height: '56px', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(230,126,34,0.5)' }, '&.Mui-focused fieldset': { borderColor: '#E67E22' } } }}
                        />
                        <Button variant="contained" onClick={handleCheck} disabled={loading || !url}
                            sx={{ bgcolor: '#E67E22', px: 4, fontWeight: 700, borderRadius: '10px', minWidth: 140, '&:hover': { bgcolor: '#d35400' }, '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' } }}>
                            {loading ? <CircularProgress size={22} color="inherit" /> : 'Check'}
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
                            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', mb: 4 }}>
                                <Typography variant="h6" sx={{color: '#ffffff', fontWeight: 700, mb: 3 }}>robots.txt for <Box component="span" sx={{ color: '#E67E22', fontFamily: 'monospace', fontSize: '0.9em', ml: 1 }}>{url}</Box></Typography>
                                {renderResult()}
                            </Paper>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', mb: 4 }}>
                    <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 800, mb: 3 }}>How to Use</Typography>
                    {[
                        { step: '1', title: 'Enter Website URL', desc: 'Type the root URL of the website (e.g., https://example.com). The tool automatically fetches /robots.txt from that domain.' },
                        { step: '2', title: 'Click Check', desc: 'The tool fetches the robots.txt file, parses all directives, and extracts user-agent rules and sitemaps.' },
                        { step: '3', title: 'Review Rules', desc: 'See each user-agent\'s allowed and disallowed paths, along with any declared sitemap URLs.' },
                    ].map((item) => (
                        <Box key={item.step} sx={{ display: 'flex', gap: 2.5, mb: 2.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(230,126,34,0.15)', border: '1px solid rgba(230,126,34,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Typography sx={{ color: '#E67E22', fontWeight: 800, fontSize: '0.85rem' }}>{item.step}</Typography>
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

export default RobotsTxtCheckerPage;
