import React, { useState } from 'react';
import {
    Box, Typography, Container, TextField, Button, Paper,
    CircularProgress, Accordion, AccordionSummary, AccordionDetails, Chip,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSearch, ChevronDown, AlertCircle, ExternalLink } from 'lucide-react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/web/publicTool`;

const FAQS = [
    { q: 'What are meta tags and why do they matter?', a: 'Meta tags are HTML elements in the <head> section that provide metadata about a webpage. They influence search engine rankings, social sharing previews, and browser behavior.' },
    { q: 'What meta tags does this tool check?', a: 'It checks title, description, keywords, Open Graph tags (og:title, og:description, og:image), Twitter Card tags, robots directive, viewport, charset, and canonical URL.' },
    { q: 'What is a good meta description length?', a: 'Google typically displays 150–160 characters. Keep descriptions between 120–160 characters for optimal SEO performance.' },
    { q: 'What is the ideal title tag length?', a: 'Title tags should be 50–60 characters. Longer titles get truncated in search results, which can hurt click-through rates.' },
    { q: 'What are Open Graph tags?', a: 'Open Graph (og:) tags control how your page appears when shared on social media platforms like Facebook, LinkedIn, and Twitter.' },
];

const MetaTagAnalyzerPage: React.FC = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCheck = async () => {
        if (!url) return;
        setLoading(true); setError(null); setResult(null);
        try {
            const res = await fetch(`${API_BASE}/meta-tag-analyzer?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            if (data.status === 'success' || data.status === 200 || data.code === 'SUCCESS') setResult(data.data);
            else setError(data.message || 'Request failed');
        } catch {
            setError('Failed to reach the server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderMeta = () => {
        if (!result) return null;

        const meta = result.meta || {};
        const allTags: { name: string | null; property: string | null; content: string | null; raw: string }[] = result.metaTags || [];

        const basicItems: { label: string; value: string }[] = [];
        if (result.title) basicItems.push({ label: 'Title', value: result.title });
        if (meta.description) basicItems.push({ label: 'Description', value: meta.description });
        if (meta.keywords) basicItems.push({ label: 'Keywords', value: meta.keywords });
        if (result.canonical) basicItems.push({ label: 'Canonical URL', value: result.canonical });
        if (meta.robots) basicItems.push({ label: 'Robots', value: meta.robots });
        if (meta.viewport) basicItems.push({ label: 'Viewport', value: meta.viewport });

        const ogTags = allTags.filter(t => t.property?.startsWith('og:'));
        const twitterTags = allTags.filter(t => t.name?.startsWith('twitter:') || t.property?.startsWith('twitter:'));
        const otherTags = allTags.filter(t => !t.property?.startsWith('og:') && !t.name?.startsWith('twitter:') && !t.property?.startsWith('twitter:'));

        const ogImage = ogTags.find(t => t.property === 'og:image')?.content;
        const twitterImage = twitterTags.find(t => t.name === 'twitter:image' || t.property === 'twitter:image')?.content;
        const socialImage = ogImage || twitterImage;

        const descLen = meta.description?.length || 0;
        const titleLen = result.title?.length || 0;

        const SectionHeader = ({ label, color }: { label: string; color: string }) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ width: 6, height: 20, bgcolor: color, borderRadius: '3px' }} />
                <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.1em' }}>{label}</Typography>
            </Box>
        );

        const TagRow = ({ label, value, color }: { label: string; value: string; color: string }) => (
            <Box sx={{ display: 'flex', gap: 2, p: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', mb: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ color, fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700, minWidth: 160, flexShrink: 0 }}>{label}</Typography>
                <Typography sx={{ color: '#e2e8f0', fontSize: '0.875rem', flex: 1, wordBreak: 'break-all' }}>{value}</Typography>
            </Box>
        );

        return (
            <Box>
                {/* Stats */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <Box sx={{ p: 2.5, bgcolor: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: '12px' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>Title Length</Typography>
                        <Typography variant="h5" sx={{ color: titleLen > 0 && titleLen <= 60 ? '#2ECC71' : titleLen > 60 ? '#F39C12' : '#E74C3C', fontWeight: 900 }}>
                            {titleLen}<Typography component="span" variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>/60</Typography>
                        </Typography>
                    </Box>
                    <Box sx={{ p: 2.5, bgcolor: 'rgba(52,152,219,0.08)', border: '1px solid rgba(52,152,219,0.2)', borderRadius: '12px' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>Description Length</Typography>
                        <Typography variant="h5" sx={{ color: descLen > 0 && descLen <= 160 ? '#2ECC71' : descLen > 160 ? '#F39C12' : '#E74C3C', fontWeight: 900 }}>
                            {descLen}<Typography component="span" variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>/160</Typography>
                        </Typography>
                    </Box>
                    <Box sx={{ p: 2.5, bgcolor: 'rgba(243,156,18,0.08)', border: '1px solid rgba(243,156,18,0.2)', borderRadius: '12px' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>Total Meta Tags</Typography>
                        <Typography variant="h5" sx={{ color: '#F39C12', fontWeight: 900 }}>{result.totalMetaTags ?? allTags.length}</Typography>
                    </Box>
                    {result.responseTimeMs != null && (
                        <Box sx={{ p: 2.5, bgcolor: 'rgba(155,89,182,0.08)', border: '1px solid rgba(155,89,182,0.2)', borderRadius: '12px' }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>Response Time</Typography>
                            <Typography variant="h5" sx={{ color: '#9B59B6', fontWeight: 900 }}>
                                {result.responseTimeMs}<Typography component="span" variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>ms</Typography>
                            </Typography>
                        </Box>
                    )}
                    {result.statusCode != null && (
                        <Box sx={{ p: 2.5, bgcolor: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: '12px' }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>HTTP Status</Typography>
                            <Typography variant="h5" sx={{ color: result.statusCode === 200 ? '#2ECC71' : '#F39C12', fontWeight: 900 }}>{result.statusCode}</Typography>
                        </Box>
                    )}
                </Box>

                {/* Social share image preview */}
                {socialImage && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.7rem', mb: 1, display: 'block' }}>Social Share Preview Image</Typography>
                        <Box component="img" src={socialImage} alt="OG Image" sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: '8px', objectFit: 'cover', display: 'block' }} onError={(e: any) => { e.target.style.display = 'none'; }} />
                    </Box>
                )}

                {/* Basic SEO */}
                {basicItems.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <SectionHeader label="Basic SEO" color="#2ECC71" />
                        {basicItems.map((item, idx) => <TagRow key={idx} label={item.label} value={item.value} color="#2ECC71" />)}
                    </Box>
                )}

                {/* Open Graph */}
                {ogTags.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <SectionHeader label="Open Graph" color="#3498DB" />
                        {ogTags.map((tag, idx) => (
                            <TagRow key={idx} label={tag.property!} value={tag.content ?? ''} color="#3498DB" />
                        ))}
                    </Box>
                )}

                {/* Twitter Card */}
                {twitterTags.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <SectionHeader label="Twitter Card" color="#1DA1F2" />
                        {twitterTags.map((tag, idx) => (
                            <TagRow key={idx} label={tag.name ?? tag.property ?? ''} value={tag.content ?? ''} color="#1DA1F2" />
                        ))}
                    </Box>
                )}

                {/* Other meta tags */}
                {otherTags.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <SectionHeader label="Other Meta Tags" color="#95A5A6" />
                        {otherTags.map((tag, idx) => {
                            const label = tag.name ?? tag.property ?? (tag.raw?.match(/charset/i) ? 'charset' : 'meta');
                            const value = tag.content ?? tag.raw ?? '';
                            return <TagRow key={idx} label={label} value={value} color="#95A5A6" />;
                        })}
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
                        <FileSearch size={36} color="#F39C12" />
                    </Box>
                    <Typography variant="h2" sx={{ color: '#ffffff', fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>Meta Tag Analyzer</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}>
                        Analyze all meta tags on any webpage including Open Graph, Twitter Cards, SEO title, description, robots directives, and more.
                    </Typography>
                </motion.div>
            </Box>

            <Container maxWidth="md" sx={{ pb: 8 }}>
                <Paper elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', p: { xs: 3, md: 5 }, mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#e2e8f0' }}>Analyze Meta Tags</Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <TextField
                            fullWidth label="Website URL" placeholder="https://example.com"
                            value={url} onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                            InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)' } }}
                            sx={{ '& .MuiOutlinedInput-root': { color: '#fff', bgcolor: 'rgba(0,0,0,0.2)', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(243,156,18,0.5)' }, '&.Mui-focused fieldset': { borderColor: '#F39C12' } } }}
                        />
                        <Button variant="contained" onClick={handleCheck} disabled={loading || !url}
                            sx={{ bgcolor: '#F39C12', px: 4, fontWeight: 700, borderRadius: '10px', minWidth: 140, '&:hover': { bgcolor: '#e67e22' }, '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' } }}>
                            {loading ? <CircularProgress size={22} color="inherit" /> : 'Analyze'}
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
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Typography variant="h6" sx={{color: '#ffffff', fontWeight: 700 }}>Results for</Typography>
                                    <Chip label={url} size="small" icon={<ExternalLink size={12} />} sx={{ bgcolor: 'rgba(243,156,18,0.1)', color: '#F39C12', border: '1px solid rgba(243,156,18,0.2)', fontFamily: 'monospace', fontSize: '0.75rem', maxWidth: 300 }} />
                                </Box>
                                {renderMeta()}
                            </Paper>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', mb: 4 }}>
                    <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 800, mb: 3 }}>How to Use</Typography>
                    {[
                        { step: '1', title: 'Enter the URL', desc: 'Type or paste the full URL of the webpage you want to analyze (include https://).' },
                        { step: '2', title: 'Click Analyze', desc: 'Our server fetches the page and extracts all meta tags from the HTML head section.' },
                        { step: '3', title: 'Review SEO Metrics', desc: 'See title and description lengths, Open Graph tags for social sharing, Twitter Card tags, robots directives, and more.' },
                        { step: '4', title: 'Fix Issues', desc: 'Missing or overlong meta tags are highlighted. Fix them in your CMS or HTML to improve SEO and social sharing.' },
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

export default MetaTagAnalyzerPage;
