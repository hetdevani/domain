import React, { useState } from 'react';
import {
    Box, Typography, Container, Button, Paper,
    CircularProgress, Accordion, AccordionSummary, AccordionDetails,
    Slider, Switch, FormControlLabel, Select, MenuItem, FormControl,
    InputLabel, Grid, Tabs, Tab
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { AlignLeft, ChevronDown, AlertCircle, Copy, Check } from 'lucide-react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/web/publicTool`;

const FAQS = [
    { q: 'What is Lorem Ipsum?', a: 'Lorem Ipsum is placeholder text derived from Cicero\'s "de Finibus Bonorum et Malorum". It\'s been used by typographers since the 1500s to fill layouts before real content is available.' },
    { q: 'Why use Lorem Ipsum and not random text?', a: 'Lorem Ipsum has a natural distribution of letters, making it look like readable English. Random text can be distracting, while Lorem Ipsum lets reviewers focus on the design.' },
    { q: 'What are HTML elements in Lorem Ipsum for?', a: 'When building web layouts, you often need to test how styled HTML elements (bold, links, headers, lists) look. HTML-enabled Lorem Ipsum includes these elements for realistic previews.' },
    { q: 'What is the difference between words, sentences, and paragraphs?', a: 'Words gives you a specific word count. Sentences generates complete sentences. Paragraphs generates full paragraphs of standard length.' },
    { q: 'Can I start the text with "Lorem ipsum dolor sit amet"?', a: 'Yes! Enable the "Start with Lorem" toggle to begin generated text with the classic Lorem ipsum opening phrase.' },
];

const LoremIpsumPage: React.FC = () => {
    const [quantity, setQuantity] = useState(3);
    const [formatType, setFormatType] = useState('paragraphs');
    const [paragraphLength, setParagraphLength] = useState('medium');
    const [startWithLorem, setStartWithLorem] = useState(true);
    const [htmlLinks, setHtmlLinks] = useState(false);
    const [htmlBoldItalic, setHtmlBoldItalic] = useState(false);
    const [htmlHeaders, setHtmlHeaders] = useState(false);
    const [htmlUl, setHtmlUl] = useState(false);
    const [htmlOl, setHtmlOl] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [viewTab, setViewTab] = useState(0);

    const handleGenerate = async () => {
        setLoading(true); setError(null); setResult(null); setViewTab(0);
        try {
            const res = await fetch(`${API_BASE}/lorem-ipsum-generator`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quantity,
                    paragraphLength,
                    formatType,
                    startWithLorem,
                    htmlElements: {
                        links: htmlLinks,
                        boldItalic: htmlBoldItalic,
                        headers: htmlHeaders,
                        unorderedList: htmlUl,
                        orderedList: htmlOl,
                        descriptionList: false,
                        blockquotes: false,
                        preCode: false,
                        turnOffHtmlElements: false,
                    },
                }),
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

    const handleCopy = () => {
        const text = viewTab === 1 && result?.html ? result.html : (result?.text || '');
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <ToolPageLayout>
            <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center', px: 2, background: 'linear-gradient(180deg, rgba(52,152,219,0.07) 0%, transparent 100%)' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <Box sx={{ display: 'inline-flex', p: 2, bgcolor: 'rgba(52,152,219,0.1)', borderRadius: '16px', mb: 3, border: '1px solid rgba(52,152,219,0.25)' }}>
                        <AlignLeft size={36} color="#3498DB" />
                    </Box>
                    <Typography variant="h2" sx={{ color: '#ffffff', fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>Lorem Ipsum Generator</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}>
                        Generate placeholder text with full control over quantity, format, and HTML elements. Perfect for design mockups and development.
                    </Typography>
                </motion.div>
            </Box>

            <Container maxWidth="md" sx={{ pb: 8 }}>
                <Paper elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', p: { xs: 3, md: 5 }, mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#e2e8f0' }}>Generator Settings</Typography>

                    <Grid container spacing={3}>
                        {/* Format Type */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel sx={{ color: 'rgba(255,255,255,0.4)', '&.Mui-focused': { color: '#fff' } }}>Format</InputLabel>
                                <Select value={formatType} label="Format" onChange={(e) => setFormatType(e.target.value)}
                                    sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,0.2)', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(52,152,219,0.5)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3498DB' }, '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' } }}
                                    MenuProps={{ PaperProps: { sx: { bgcolor: '#1a2744', border: '1px solid rgba(255,255,255,0.1)' } } }}>
                                    {['paragraphs', 'sentences', 'words'].map(f => <MenuItem key={f} value={f} sx={{ color: '#e2e8f0', textTransform: 'capitalize', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>{f}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Paragraph Length */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel sx={{ color: 'rgba(255,255,255,0.4)', '&.Mui-focused': { color: '#fff' } }}>Paragraph Length</InputLabel>
                                <Select value={paragraphLength} label="Paragraph Length" onChange={(e) => setParagraphLength(e.target.value)}
                                    sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,0.2)', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(52,152,219,0.5)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3498DB' }, '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' } }}
                                    MenuProps={{ PaperProps: { sx: { bgcolor: '#1a2744', border: '1px solid rgba(255,255,255,0.1)' } } }}>
                                    {['short', 'medium', 'long'].map(l => <MenuItem key={l} value={l} sx={{ color: '#e2e8f0', textTransform: 'capitalize', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>{l}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Quantity Slider */}
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ px: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>Quantity</Typography>
                                    <Typography sx={{ color: '#3498DB', fontWeight: 700 }}>{quantity} {formatType}</Typography>
                                </Box>
                                <Slider value={quantity} min={1} max={formatType === 'words' ? 500 : 10} onChange={(_, v) => setQuantity(v as number)}
                                    sx={{ color: '#3498DB', '& .MuiSlider-thumb': { bgcolor: '#3498DB' }, '& .MuiSlider-rail': { bgcolor: 'rgba(255,255,255,0.1)' } }} />
                            </Box>
                        </Grid>

                        {/* Toggles */}
                        <Grid size={{ xs: 12 }}>
                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>Options</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {[
                                    { label: 'Start with Lorem', value: startWithLorem, onChange: setStartWithLorem },
                                    { label: 'HTML Links', value: htmlLinks, onChange: setHtmlLinks },
                                    { label: 'Bold & Italic', value: htmlBoldItalic, onChange: setHtmlBoldItalic },
                                    { label: 'Headers', value: htmlHeaders, onChange: setHtmlHeaders },
                                    { label: 'Unordered List', value: htmlUl, onChange: setHtmlUl },
                                    { label: 'Ordered List', value: htmlOl, onChange: setHtmlOl },
                                ].map((item) => (
                                    <FormControlLabel key={item.label} label={<Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem' }}>{item.label}</Typography>}
                                        control={<Switch size="small" checked={item.value} onChange={(e) => item.onChange(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#3498DB' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#3498DB' } }} />}
                                        sx={{ m: 0.5, p: 1, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px' }} />
                                ))}
                            </Box>
                        </Grid>
                    </Grid>

                    <Button variant="contained" fullWidth onClick={handleGenerate} disabled={loading}
                        sx={{ mt: 3, bgcolor: '#3498DB', py: 1.5, fontWeight: 700, borderRadius: '10px', fontSize: '1rem', '&:hover': { bgcolor: '#2980b9' }, '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' } }}>
                        {loading ? <CircularProgress size={22} color="inherit" /> : 'Generate Lorem Ipsum'}
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
                            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', mb: 4 }}>
                                {/* Header */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700 }}>Generated Text</Typography>
                                    <Button size="small" startIcon={copied ? <Check size={14} /> : <Copy size={14} />} onClick={handleCopy}
                                        sx={{ color: copied ? '#2ECC71' : 'rgba(255,255,255,0.5)', textTransform: 'none', borderRadius: '8px', '&:hover': { color: '#3498DB' } }}>
                                        {copied ? 'Copied!' : 'Copy'}
                                    </Button>
                                </Box>

                                {/* Metadata chips */}
                                <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
                                    {result.type && (
                                        <Box sx={{ px: 1.5, py: 0.5, bgcolor: 'rgba(52,152,219,0.1)', border: '1px solid rgba(52,152,219,0.2)', borderRadius: '6px' }}>
                                            <Typography variant="caption" sx={{ color: '#3498DB', fontWeight: 600, textTransform: 'capitalize' }}>{result.type}</Typography>
                                        </Box>
                                    )}
                                    {result.count != null && (
                                        <Box sx={{ px: 1.5, py: 0.5, bgcolor: 'rgba(52,152,219,0.1)', border: '1px solid rgba(52,152,219,0.2)', borderRadius: '6px' }}>
                                            <Typography variant="caption" sx={{ color: '#3498DB', fontWeight: 600 }}>Count: {result.count}</Typography>
                                        </Box>
                                    )}
                                    {result.paragraphLength && (
                                        <Box sx={{ px: 1.5, py: 0.5, bgcolor: 'rgba(52,152,219,0.1)', border: '1px solid rgba(52,152,219,0.2)', borderRadius: '6px' }}>
                                            <Typography variant="caption" sx={{ color: '#3498DB', fontWeight: 600, textTransform: 'capitalize' }}>{result.paragraphLength}</Typography>
                                        </Box>
                                    )}
                                    {result.htmlEnabled && (
                                        <Box sx={{ px: 1.5, py: 0.5, bgcolor: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: '6px' }}>
                                            <Typography variant="caption" sx={{ color: '#2ECC71', fontWeight: 600 }}>HTML Enabled</Typography>
                                        </Box>
                                    )}
                                    {result.text && (
                                        <Box sx={{ px: 1.5, py: 0.5, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px' }}>
                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                                                {result.text.split(/\s+/).filter(Boolean).length} words
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                {/* Text / HTML tabs (only when HTML available) */}
                                {result.html && (
                                    <Tabs value={viewTab} onChange={(_, v) => setViewTab(v)} sx={{ mb: 2, minHeight: 36, '& .MuiTabs-indicator': { bgcolor: '#3498DB' }, '& .MuiTab-root': { color: 'rgba(255,255,255,0.6)', minHeight: 36, textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }, '& .Mui-selected': { color: '#3498DB !important' } }}>
                                        <Tab label="Plain Text" />
                                        <Tab label="HTML Source" />
                                        <Tab label="HTML Preview" />
                                    </Tabs>
                                )}

                                {/* Plain text view */}
                                {(viewTab === 0 || !result.html) && (
                                    <Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', color: '#c8d6e5', fontSize: '0.9rem', lineHeight: 1.8, maxHeight: 500, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                                        {result.text || ''}
                                    </Box>
                                )}

                                {/* HTML source view */}
                                {viewTab === 1 && result.html && (
                                    <Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#a8b5c8', lineHeight: 1.7, maxHeight: 500, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                                        {result.html}
                                    </Box>
                                )}

                                {/* HTML rendered preview */}
                                {viewTab === 2 && result.html && (
                                    <Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', color: '#c8d6e5', fontSize: '0.9rem', lineHeight: 1.8, maxHeight: 500, overflow: 'auto', '& h1,& h2,& h3': { color: '#fff', mt: 2, mb: 1 }, '& b,& strong': { color: '#fff' }, '& i,& em': { color: '#94a3b8' }, '& a': { color: '#3498DB' }, '& ul,& ol': { pl: 3 } }}
                                        dangerouslySetInnerHTML={{ __html: result.html }} />
                                )}
                            </Paper>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', mb: 4 }}>
                    <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 800, mb: 3 }}>How to Use</Typography>
                    {[
                        { step: '1', title: 'Choose Format', desc: 'Select whether to generate paragraphs (for body text), sentences (for specific amounts), or individual words.' },
                        { step: '2', title: 'Set Quantity', desc: 'Drag the slider to choose how many paragraphs, sentences, or words you need.' },
                        { step: '3', title: 'Configure Options', desc: 'Toggle "Start with Lorem" to use the classic opening. Enable HTML elements if you\'re testing a styled layout.' },
                        { step: '4', title: 'Generate & Copy', desc: 'Click Generate, then use the Copy button to copy the result to your clipboard.' },
                    ].map((item) => (
                        <Box key={item.step} sx={{ display: 'flex', gap: 2.5, mb: 2.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(52,152,219,0.15)', border: '1px solid rgba(52,152,219,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Typography sx={{ color: '#3498DB', fontWeight: 800, fontSize: '0.85rem' }}>{item.step}</Typography>
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

export default LoremIpsumPage;
