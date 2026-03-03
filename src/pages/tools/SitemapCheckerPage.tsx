import React, { useState } from 'react';
import {
    Box, Typography, Container, TextField, Button, Paper,
    CircularProgress, Accordion, AccordionSummary, AccordionDetails, Chip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronDown, AlertCircle, CheckCircle, XCircle, Link } from 'lucide-react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/web/publicTool`;

const FAQS = [
    { q: 'What is an XML sitemap?', a: 'An XML sitemap is a file that lists all the important URLs on your website, helping search engines discover and crawl your content more efficiently.' },
    { q: 'Where should my sitemap be located?', a: 'The standard location is /sitemap.xml at your root domain (e.g., https://example.com/sitemap.xml). You can also declare it in robots.txt.' },
    { q: 'What is a sitemap index file?', a: 'A sitemap index file references multiple sitemap files. Large sites use it to split their sitemap into multiple files, each containing up to 50,000 URLs.' },
    { q: 'How many URLs can a sitemap contain?', a: 'Each sitemap file can contain up to 50,000 URLs and must be under 50MB uncompressed. Use a sitemap index for larger sites.' },
    { q: 'Does having a sitemap guarantee indexing?', a: 'No. A sitemap tells search engines which pages exist, but Google and others still decide which pages to index based on quality and relevance signals.' },
];

const SitemapCheckerPage: React.FC = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCheck = async () => {
        if (!url) return;
        setLoading(true); setError(null); setResult(null);
        try {
            const res = await fetch(`${API_BASE}/sitemap-checker?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            const isSuccess = data.code === 'SUCCESS' || data.status === 200 || data.status === 'success' || String(data.status) === '200';
            if (isSuccess) {
                setResult(data.data ?? null);
            } else {
                setError(typeof data.message === 'string' ? data.message : 'Request failed');
            }
        } catch {
            setError('Failed to reach the server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderResult = () => {
        if (!result) return null;

        // API shape: { origin, candidatesChecked, sitemaps: [{sitemapUrl, found, statusCode, responseTimeMs, urlCount, isIndexSitemap}], hasAnySitemap }
        const sitemaps: any[] = Array.isArray(result.sitemaps) ? result.sitemaps : [];
        const hasAnySitemap: boolean = result.hasAnySitemap ?? sitemaps.some((s: any) => s.found);
        const totalUrls: number = sitemaps.reduce((acc: number, s: any) => acc + (s.urlCount ?? 0), 0);

        return (
            <Box>
                {/* Overall status */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'stretch' }}>
                    <Box sx={{ p: 2.5, bgcolor: hasAnySitemap ? 'rgba(46,204,113,0.08)' : 'rgba(231,76,60,0.08)', border: `1px solid ${hasAnySitemap ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)'}`, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {hasAnySitemap ? <CheckCircle size={20} color="#2ECC71" /> : <XCircle size={20} color="#E74C3C" />}
                        <Typography sx={{ color: hasAnySitemap ? '#2ECC71' : '#E74C3C', fontWeight: 700 }}>
                            {hasAnySitemap ? 'Sitemap Found' : 'No Sitemap Found'}
                        </Typography>
                    </Box>
                    <Box sx={{ p: 2.5, bgcolor: 'rgba(142,68,173,0.08)', border: '1px solid rgba(142,68,173,0.2)', borderRadius: '12px' }}>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Total URLs</Typography>
                        <Typography variant="h5" sx={{ color: '#8E44AD', fontWeight: 900 }}>{totalUrls}</Typography>
                    </Box>
                    <Box sx={{ p: 2.5, bgcolor: 'rgba(52,152,219,0.08)', border: '1px solid rgba(52,152,219,0.2)', borderRadius: '12px' }}>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Sitemaps</Typography>
                        <Typography variant="h5" sx={{ color: '#3498DB', fontWeight: 900 }}>{sitemaps.length}</Typography>
                    </Box>
                    {result.origin && (
                        <Box sx={{ p: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Link size={14} color="#94a3b8" />
                            <Typography sx={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.82rem' }}>{result.origin}</Typography>
                        </Box>
                    )}
                </Box>

                {/* Sitemap entries */}
                {sitemaps.length > 0 && (
                    <Box>
                        <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.1em', display: 'block', mb: 1.5 }}>
                            Sitemap Details
                        </Typography>
                        {sitemaps.map((s: any, i: number) => (
                            <Box key={i} sx={{ p: 2.5, bgcolor: s.found ? 'rgba(46,204,113,0.04)' : 'rgba(231,76,60,0.04)', border: `1px solid ${s.found ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)'}`, borderRadius: '12px', mb: 2 }}>
                                {/* URL row */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                    {s.found ? <CheckCircle size={16} color="#2ECC71" /> : <XCircle size={16} color="#E74C3C" />}
                                    <Typography sx={{ color: '#475569', fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all', flex: 1 }}>
                                        {s.sitemapUrl}
                                    </Typography>
                                    {s.isIndexSitemap && (
                                        <Chip label="Index" size="small" sx={{ bgcolor: 'rgba(52,152,219,0.15)', color: '#3498DB', border: '1px solid rgba(52,152,219,0.3)', fontWeight: 700, flexShrink: 0 }} />
                                    )}
                                </Box>
                                {/* Stats row */}
                                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                    {s.statusCode != null && (
                                        <Box>
                                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>HTTP Status</Typography>
                                            <Typography sx={{ color: s.statusCode === 200 ? '#2ECC71' : '#F39C12', fontWeight: 700, fontSize: '0.9rem' }}>{s.statusCode}</Typography>
                                        </Box>
                                    )}
                                    {s.urlCount != null && (
                                        <Box>
                                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>URLs</Typography>
                                            <Typography sx={{ color: '#8E44AD', fontWeight: 700, fontSize: '0.9rem' }}>{s.urlCount}</Typography>
                                        </Box>
                                    )}
                                    {s.responseTimeMs != null && (
                                        <Box>
                                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Response Time</Typography>
                                            <Typography sx={{ color: '#9B59B6', fontWeight: 700, fontSize: '0.9rem' }}>{s.responseTimeMs}ms</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        );
    };

    return (
        <ToolPageLayout>
            <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center', px: 2, background: 'linear-gradient(180deg, rgba(142,68,173,0.07) 0%, transparent 100%)' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <Box sx={{ display: 'inline-flex', p: 2, bgcolor: 'rgba(142,68,173,0.1)', borderRadius: '16px', mb: 3, border: '1px solid rgba(142,68,173,0.25)' }}>
                        <FileText size={36} color="#8E44AD" />
                    </Box>
                    <Typography variant="h2" sx={{ color: '#1e293b', fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>Sitemap Checker</Typography>
                    <Typography sx={{ color: '#64748b', maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}>
                        Validate and analyze XML sitemaps. Check URL count, detect sitemap index files, and verify proper formatting for SEO compliance.
                    </Typography>
                </motion.div>
            </Box>

            <Container maxWidth="md" sx={{ pb: 8 }}>
                <Paper elevation={0} sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', p: { xs: 3, md: 5 }, mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#334155' }}>Check Sitemap</Typography>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', mb: 3 }}>Enter the sitemap URL directly (e.g., https://example.com/sitemap.xml) or the root domain to auto-detect.</Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <TextField
                            fullWidth label="Sitemap URL" placeholder="https://example.com/sitemap.xml"
                            value={url} onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                            InputLabelProps={{ sx: { color: '#64748b', '&.Mui-focused': { color: '#1e293b' } } }}
                            sx={{ '& .MuiOutlinedInput-root': { color: '#1e293b', bgcolor: '#f8fafc', height: '56px', '& fieldset': { borderColor: '#e2e8f0' }, '&:hover fieldset': { borderColor: 'rgba(142,68,173,0.5)' }, '&.Mui-focused fieldset': { borderColor: '#8E44AD' } } }}
                        />
                        <Button variant="contained" onClick={handleCheck} disabled={loading || !url}
                            sx={{ bgcolor: '#8E44AD', px: 4, fontWeight: 700, borderRadius: '10px', minWidth: 140, whiteSpace: 'nowrap', '&:hover': { bgcolor: '#7d3c98' }, '&.Mui-disabled': { bgcolor: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.3)' } }}>
                            {loading ? <CircularProgress size={22} color="inherit" /> : 'Check Sitemap'}
                        </Button>
                    </Box>
                </Paper>

                <AnimatePresence>
                    {error && (
                        <motion.div key="err" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <Paper elevation={0} sx={{ p: 3, bgcolor: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.25)', borderRadius: '14px', mb: 4, display: 'flex', gap: 1.5 }}>
                                <AlertCircle size={20} color="#E74C3C" style={{ flexShrink: 0 }} />
                                <Typography sx={{ color: '#E74C3C' }}>{typeof error === 'string' ? error : 'An error occurred'}</Typography>
                            </Paper>
                        </motion.div>
                    )}
                    {result && (
                        <motion.div key="res" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', mb: 4 }}>
                                <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 700, mb: 3 }}>Sitemap Analysis</Typography>
                                {renderResult()}
                            </Paper>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', mb: 4 }}>
                    <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 800, mb: 3 }}>How to Use</Typography>
                    {[
                        { step: '1', title: 'Enter Sitemap URL', desc: 'Paste the direct URL to your sitemap.xml file or enter your domain root to let the tool auto-detect /sitemap.xml.' },
                        { step: '2', title: 'Click Check Sitemap', desc: 'The tool fetches and parses the XML sitemap, detecting whether it\'s a standard sitemap or a sitemap index.' },
                        { step: '3', title: 'Review URL List', desc: 'See all URLs, their last modification dates, priorities, and change frequencies (if specified).' },
                    ].map((item) => (
                        <Box key={item.step} sx={{ display: 'flex', gap: 2.5, mb: 2.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(142,68,173,0.15)', border: '1px solid rgba(142,68,173,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Typography sx={{ color: '#8E44AD', fontWeight: 800, fontSize: '0.85rem' }}>{item.step}</Typography>
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

export default SitemapCheckerPage;
