import React, { useState } from 'react';
import {
    Box, Typography, Container, TextField, Button, Paper,
    CircularProgress, Accordion, AccordionSummary, AccordionDetails, Grid
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, ChevronDown, AlertCircle } from 'lucide-react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import SEOHead from '../../components/seo/SEOHead';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/web/publicTool`;

const FAQS = [
    { q: 'How is the word count calculated?', a: 'Words are counted by splitting text on whitespace and punctuation boundaries. Hyphenated words like "state-of-the-art" are counted as one word.' },
    { q: 'What is the difference between characters with and without spaces?', a: 'Characters with spaces counts every character including spaces. Characters without spaces excludes all whitespace, useful for measuring content density.' },
    { q: 'How is reading time estimated?', a: 'Reading time is estimated at the average adult reading speed of 200–250 words per minute.' },
    { q: 'What counts as a sentence?', a: 'Sentences are detected by period, question mark, and exclamation mark terminators. Abbreviations may occasionally be miscounted.' },
    { q: 'Can I analyze text from a URL?', a: 'Yes, you can either paste text directly or provide a URL to have the tool fetch and analyze the page content automatically.' },
];

const StatCard: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
    <Box sx={{ p: 2.5, bgcolor: `${color}08`, border: `1px solid ${color}25`, borderRadius: '12px', textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color, fontWeight: 900, lineHeight: 1 }}>{value}</Typography>
        <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block', fontSize: '0.75rem' }}>{label}</Typography>
    </Box>
);

const WordCounterPage: React.FC = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Live local stats
    const localStats = React.useMemo(() => {
        if (!text) return null;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        const charsNoSpace = text.replace(/\s/g, '').length;
        const sentences = (text.match(/[.!?]+/g) || []).length;
        const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/).length : 0;
        const readingTime = Math.ceil(words / 225);
        return { words, chars, charsNoSpace, sentences, paragraphs, readingTime };
    }, [text]);

    const handleCheck = async () => {
        if (!text) return;
        setLoading(true); setError(null); setResult(null);
        try {
            const res = await fetch(`${API_BASE}/word-counter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });
            const data = await res.json();
            if (data.status === 'success' || data.status === 200 || data.code === 'SUCCESS') setResult(data.data);
            else setError(data.message || 'Request failed');
        } catch {
            setError('Failed to reach the server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolPageLayout>
            <SEOHead
            title="Word Counter — Count Words, Characters & Reading Time"
            description="Count words, characters, sentences, paragraphs and estimate reading time for any text. Free online word counter and text analyzer."
            keywords="word counter, character counter, word count tool, reading time calculator, text analyzer, online word counter"
            canonical="/tools/word-counter"
        />
            <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center', px: 2, background: 'linear-gradient(180deg, rgba(46,204,113,0.07) 0%, transparent 100%)' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <Box sx={{ display: 'inline-flex', p: 2, bgcolor: 'rgba(46,204,113,0.1)', borderRadius: '16px', mb: 3, border: '1px solid rgba(46,204,113,0.25)' }}>
                        <Type size={36} color="#2ECC71" />
                    </Box>
                    <Typography variant="h2" sx={{ color: '#1e293b', fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>Word Counter</Typography>
                    <Typography sx={{ color: '#64748b', maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}>
                        Count words, characters, sentences, and paragraphs. Get estimated reading time and keyword density for any text or URL.
                    </Typography>
                </motion.div>
            </Box>

            <Container maxWidth="md" sx={{ pb: 8 }}>
                {/* Mode Toggle */}
                {/* <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    {(['text', 'url'] as const).map((m) => (
                        <Button key={m} variant={mode === m ? 'contained' : 'outlined'} onClick={() => { setMode(m); setResult(null); setError(null); }}
                            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, ...(mode === m ? { bgcolor: '#2ECC71', '&:hover': { bgcolor: '#27ae60' } } : { color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.15)', '&:hover': { borderColor: '#2ECC71', color: '#2ECC71' } }) }}>
                            {m === 'text' ? 'Paste Text' : 'From URL'}
                        </Button>
                    ))}
                </Box> */}

                <Paper elevation={0} sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', p: { xs: 3, md: 5 }, mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#334155' }}>Paste Your Text</Typography>
                    <TextField
                        fullWidth multiline rows={8} label="Text to analyze"
                        placeholder="Paste or type your text here…"
                        value={text} onChange={(e) => setText(e.target.value)}
                        InputLabelProps={{ sx: { color: '#64748b', '&.Mui-focused': { color: '#1e293b' } } }}
                        sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#1e293b', bgcolor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' }, '&:hover fieldset': { borderColor: 'rgba(46,204,113,0.5)' }, '&.Mui-focused fieldset': { borderColor: '#2ECC71' } } }}
                    />
                    {localStats && (
                        <Grid container spacing={1.5} sx={{ mb: 2 }}>
                            <Grid size={{ xs: 6, sm: 3 }}><StatCard label="Words" value={localStats.words} color="#2ECC71" /></Grid>
                            <Grid size={{ xs: 6, sm: 3 }}><StatCard label="Characters" value={localStats.chars} color="#3498DB" /></Grid>
                            <Grid size={{ xs: 6, sm: 3 }}><StatCard label="Sentences" value={localStats.sentences} color="#9B59B6" /></Grid>
                            <Grid size={{ xs: 6, sm: 3 }}><StatCard label="Read Time" value={`${localStats.readingTime}m`} color="#F39C12" /></Grid>
                        </Grid>
                    )}
                    <Button variant="contained" fullWidth onClick={handleCheck} disabled={loading || !text}
                        sx={{ bgcolor: '#2ECC71', py: 1.5, fontWeight: 700, borderRadius: '10px', '&:hover': { bgcolor: '#27ae60' }, '&.Mui-disabled': { bgcolor: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.3)' } }}>
                        {loading ? <CircularProgress size={22} color="inherit" /> : 'Analyze Text'}
                    </Button>
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
                                <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 700, mb: 3 }}>Analysis Results</Typography>
                                <Grid container spacing={1.5}>
                                    {result.words !== undefined && <Grid size={{ xs: 6, sm: 4 }}><StatCard label="Words" value={result.words} color="#2ECC71" /></Grid>}
                                    {result.characters !== undefined && <Grid size={{ xs: 6, sm: 4 }}><StatCard label="Characters" value={result.characters} color="#3498DB" /></Grid>}
                                    {result.charactersNoSpaces !== undefined && <Grid size={{ xs: 6, sm: 4 }}><StatCard label="Chars (no spaces)" value={result.charactersNoSpaces} color="#9B59B6" /></Grid>}
                                    {result.sentences !== undefined && <Grid size={{ xs: 6, sm: 4 }}><StatCard label="Sentences" value={result.sentences} color="#F39C12" /></Grid>}
                                    {result.paragraphs !== undefined && <Grid size={{ xs: 6, sm: 4 }}><StatCard label="Paragraphs" value={result.paragraphs} color="#E74C3C" /></Grid>}
                                    {result.readingTime !== undefined && <Grid size={{ xs: 6, sm: 4 }}><StatCard label="Reading Time" value={`${result.readingTime}m`} color="#1ABC9C" /></Grid>}
                                </Grid>
                                {result.topKeywords && (
                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.1em', display: 'block', mb: 1.5 }}>Top Keywords</Typography>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            {result.topKeywords.slice(0, 20).map((kw: any, i: number) => (
                                                <Box key={i} sx={{ px: 2, py: 0.5, bgcolor: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: '6px' }}>
                                                    <Typography variant="caption" sx={{ color: '#2ECC71', fontFamily: 'monospace' }}>{kw.word} <Box component="span" sx={{ color: '#64748b' }}>×{kw.count}</Box></Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </Paper>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', mb: 4 }}>
                    <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 800, mb: 3 }}>How to Use</Typography>
                    {[
                        { step: '1', title: 'Choose Input Mode', desc: 'Use "Paste Text" to type or paste content directly, or "From URL" to fetch and analyze a web page automatically.' },
                        { step: '2', title: 'Live Statistics', desc: 'When pasting text, word and character counts update live as you type — no need to click analyze for basic stats.' },
                        { step: '3', title: 'Click Analyze', desc: 'For full analysis including keyword density and API response, click the Analyze button.' },
                    ].map((item) => (
                        <Box key={item.step} sx={{ display: 'flex', gap: 2.5, mb: 2.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(46,204,113,0.15)', border: '1px solid rgba(46,204,113,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Typography sx={{ color: '#2ECC71', fontWeight: 800, fontSize: '0.85rem' }}>{item.step}</Typography>
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

export default WordCounterPage;
