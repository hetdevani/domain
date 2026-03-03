import React, { useState } from 'react';
import {
    Box, Typography, Container, TextField, Button, Paper,
    CircularProgress, Grid, Accordion, AccordionSummary, AccordionDetails, Chip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, AlertCircle, Globe, Wifi, Building, Clock, CheckCircle, XCircle } from 'lucide-react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/web/publicTool`;

const FAQS = [
    { q: 'What information does IP Intelligence provide?', a: 'It provides geolocation data including city, region, country, timezone, coordinates (lat/lon), ISP name, organization, and ASN number.' },
    { q: 'Can I look up both IPv4 and IPv6 addresses?', a: 'Yes, the tool supports both IPv4 (e.g., 8.8.8.8) and IPv6 addresses, as well as hostnames that resolve to an IP.' },
    { q: 'How accurate is the geolocation?', a: 'City-level accuracy is typically within 25–50 miles. Country and region-level accuracy is above 95% for most IPs.' },
    { q: 'Can I look up my own IP address?', a: 'Yes! Simply leave the field empty — the tool automatically detects your current public IP address.' },
    { q: 'Is this data available for private IP ranges?', a: 'Private IP ranges (192.168.x.x, 10.x.x.x, 172.16-31.x.x) are not routable on the public internet and will not have geolocation data.' },
];

const InfoCard: React.FC<{ label: string; value?: string | number; icon?: React.ReactNode; color?: string; mono?: boolean }> = ({
    label, value, icon, color = '#3498DB', mono = false,
}) => (
    <Box sx={{ p: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {icon && <Box sx={{ color, opacity: 0.7, display: 'flex' }}>{icon}</Box>}
            <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.7rem', fontWeight: 700 }}>
                {label}
            </Typography>
        </Box>
        <Typography sx={{ color: '#334155', fontWeight: 600, wordBreak: 'break-all', fontFamily: mono ? 'monospace' : 'inherit', fontSize: mono ? '0.85rem' : '0.95rem' }}>
            {value !== undefined && value !== null && value !== '' ? String(value) : 'N/A'}
        </Typography>
    </Box>
);

const IpIntelligencePage: React.FC = () => {
    const [ip, setIp] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCheck = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const query = ip ? `?ip=${encodeURIComponent(ip)}` : '';
            const res = await fetch(`${API_BASE}/ip-intelligence${query}`);
            const data = await res.json();
            if (data.status === 'success' || data.status === 200 || data.code === 'SUCCESS') {
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

    const renderResult = () => {
        if (!result) return null;

        // Actual API shape:
        // result.ip, result.ipVersion, result.detectedFrom
        // result.primary.data → { country, countryCode, regionName, city, zip, lat, lon, timezone, isp, org, as, query }
        // result.providers[] → [{ provider, success, data }]

        const geo = result.primary?.data || {};
        const providers: any[] = result.providers || [];
        const resolvedIp = geo.query || result.ip;

        return (
            <Box>
                {/* IP Hero Card */}
                <Box sx={{
                    p: { xs: 3, md: 4 },
                    bgcolor: 'rgba(52,152,219,0.08)',
                    border: '1px solid rgba(52,152,219,0.2)',
                    borderRadius: '16px',
                    mb: 3,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 2, bgcolor: 'rgba(52,152,219,0.15)', borderRadius: '12px', flexShrink: 0 }}>
                                <Globe size={28} color="#3498DB" />
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.25 }}>
                                    {result.detectedFrom === 'request' ? 'Auto-detected IP' : 'Queried IP'}
                                    {result.ipVersion && <Box component="span" sx={{ ml: 1, color: '#3498DB' }}>· {result.ipVersion}</Box>}
                                </Typography>
                                <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 900, fontFamily: 'monospace', lineHeight: 1 }}>
                                    {resolvedIp}
                                </Typography>
                                {result.ip !== resolvedIp && result.ip && (
                                    <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'monospace' }}>
                                        Input: {result.ip}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {geo.countryCode && (
                                <Chip
                                    label={`${geo.country} (${geo.countryCode})`}
                                    sx={{ bgcolor: 'rgba(52,152,219,0.15)', color: '#3498DB', border: '1px solid rgba(52,152,219,0.3)', fontWeight: 700 }}
                                />
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* Geo Info Grid */}
                <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.1em', display: 'block', mb: 1.5 }}>
                    Location Details
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoCard label="City" value={geo.city} icon={<MapPin size={14} />} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoCard label="Region" value={geo.regionName} icon={<MapPin size={14} />} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoCard label="Country" value={geo.country} icon={<Globe size={14} />} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoCard label="ZIP / Postal Code" value={geo.zip} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoCard label="Timezone" value={geo.timezone} icon={<Clock size={14} />} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoCard label="Coordinates" value={geo.lat != null && geo.lon != null ? `${geo.lat}, ${geo.lon}` : undefined} icon={<MapPin size={14} />} />
                    </Grid>
                </Grid>

                {/* Network Info */}
                <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.1em', display: 'block', mb: 1.5 }}>
                    Network Details
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoCard label="ISP" value={geo.isp} icon={<Wifi size={14} />} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoCard label="Organization" value={geo.org} icon={<Building size={14} />} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <InfoCard label="AS Number" value={geo.as} mono />
                    </Grid>
                </Grid>

                {/* Provider Results */}
                {providers.length > 0 && (
                    <>
                        <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.1em', display: 'block', mb: 1.5 }}>
                            Data Providers ({providers.length})
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {providers.map((p: any, i: number) => {
                                const pData = p.data || {};
                                return (
                                    <Box key={i} sx={{
                                        p: 2.5,
                                        bgcolor: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: p.success ? 1.5 : 0 }}>
                                            {p.success
                                                ? <CheckCircle size={16} color="#2ECC71" />
                                                : <XCircle size={16} color="#E74C3C" />
                                            }
                                            <Typography sx={{ fontWeight: 700, color: '#334155', textTransform: 'capitalize' }}>
                                                {p.provider}
                                            </Typography>
                                            <Chip
                                                size="small"
                                                label={p.success ? 'Success' : 'Failed'}
                                                sx={{
                                                    bgcolor: p.success ? 'rgba(46,204,113,0.1)' : 'rgba(231,76,60,0.1)',
                                                    color: p.success ? '#2ECC71' : '#E74C3C',
                                                    border: `1px solid ${p.success ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)'}`,
                                                    height: 20,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700,
                                                }}
                                            />
                                        </Box>
                                        {p.success && pData.country && (
                                            <Grid container spacing={1}>
                                                {[
                                                    { l: 'IP', v: pData.query },
                                                    { l: 'Country', v: pData.country },
                                                    { l: 'City', v: pData.city },
                                                    { l: 'ISP', v: pData.isp },
                                                    { l: 'Timezone', v: pData.timezone },
                                                    { l: 'Coords', v: pData.lat != null ? `${pData.lat}, ${pData.lon}` : undefined },
                                                ].map((item) => item.v ? (
                                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.l}>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Typography variant="caption" sx={{ color: '#94a3b8', flexShrink: 0, minWidth: 64 }}>{item.l}:</Typography>
                                                            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, wordBreak: 'break-all' }}>{item.v}</Typography>
                                                        </Box>
                                                    </Grid>
                                                ) : null)}
                                            </Grid>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                    </>
                )}
            </Box>
        );
    };

    return (
        <ToolPageLayout>
            {/* Hero */}
            <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center', px: 2, background: 'linear-gradient(180deg, rgba(52,152,219,0.07) 0%, transparent 100%)' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <Box sx={{ display: 'inline-flex', p: 2, bgcolor: 'rgba(52,152,219,0.1)', borderRadius: '16px', mb: 3, border: '1px solid rgba(52,152,219,0.25)' }}>
                        <MapPin size={36} color="#3498DB" />
                    </Box>
                    <Typography variant="h2" sx={{ color: '#1e293b', fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>
                        IP Intelligence Tool
                    </Typography>
                    <Typography sx={{ color: '#64748b', maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}>
                        Instantly geolocate any IP address and uncover detailed information including ISP, organization, timezone, and geographic coordinates.
                    </Typography>
                </motion.div>
            </Box>

            <Container maxWidth="md" sx={{ pb: 8 }}>
                {/* Form */}
                <Paper elevation={0} sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', p: { xs: 3, md: 5 }, mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#334155' }}>IP Address Lookup</Typography>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', mb: 3 }}>
                        Leave blank to detect your own public IP address automatically.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <TextField
                            fullWidth
                            label="IP Address or Hostname"
                            placeholder="8.8.8.8 or example.com (optional)"
                            value={ip}
                            onChange={(e) => setIp(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                            InputLabelProps={{ sx: { color: '#64748b', '&.Mui-focused': { color: '#1e293b' } } }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: '#1e293b', bgcolor: '#f8fafc', height: '56px',
                                    '& fieldset': { borderColor: '#e2e8f0' },
                                    '&:hover fieldset': { borderColor: 'rgba(52,152,219,0.5)' },
                                    '&.Mui-focused fieldset': { borderColor: '#3498DB' },
                                },
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleCheck}
                            disabled={loading}
                            sx={{
                                bgcolor: '#3498DB', px: 4, fontWeight: 700, borderRadius: '10px', minWidth: 140,
                                '&:hover': { bgcolor: '#2980b9' },
                                '&.Mui-disabled': { bgcolor: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.3)' },
                            }}
                        >
                            {loading ? <CircularProgress size={22} color="inherit" /> : 'Lookup IP'}
                        </Button>
                    </Box>
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
                            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', mb: 4 }}>
                                {renderResult()}
                            </Paper>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* How to Use */}
                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', mb: 4 }}>
                    <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 800, mb: 3 }}>How to Use</Typography>
                    {[
                        { step: '1', title: 'Enter an IP or Hostname', desc: 'Type any IPv4/IPv6 address or leave blank to auto-detect your own public IP. Hostnames like google.com are also supported.' },
                        { step: '2', title: 'Click Lookup IP', desc: 'The tool queries multiple geo-IP providers and returns the most accurate location data available.' },
                        { step: '3', title: 'Review Location & Network Data', desc: 'See city, region, country, ISP, organization, timezone, and coordinates. The Provider section shows results from each data source.' },
                    ].map((item) => (
                        <Box key={item.step} sx={{ display: 'flex', gap: 2.5, mb: 2.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(52,152,219,0.15)', border: '1px solid rgba(52,152,219,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Typography sx={{ color: '#3498DB', fontWeight: 800, fontSize: '0.85rem' }}>{item.step}</Typography>
                            </Box>
                            <Box>
                                <Typography sx={{ color: '#1e293b', fontWeight: 700, mb: 0.5 }}>{item.title}</Typography>
                                <Typography sx={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</Typography>
                            </Box>
                        </Box>
                    ))}
                </Paper>

                {/* FAQs */}
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

export default IpIntelligencePage;
