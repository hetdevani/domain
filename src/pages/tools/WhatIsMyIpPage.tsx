import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Container, Button, Paper,
    CircularProgress, Grid, Accordion, AccordionSummary,
    AccordionDetails, Chip, Divider
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wifi, ChevronDown, AlertCircle, Globe, MapPin, Building,
    Clock, RefreshCw, Monitor, Chrome, Layers, Network
} from 'lucide-react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import SEOHead from '../../components/seo/SEOHead';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/web/publicTool`;

const FAQS = [
    { q: 'What is a public IP address?', a: 'A public IP address is the address assigned to your network by your ISP, visible to the internet. It is different from your private/local IP (192.168.x.x) used within your home network.' },
    { q: 'Why might my IP change?', a: 'Most ISPs assign dynamic IPs that change periodically. If you reconnect to the internet, restart your router, or your DHCP lease expires, you may get a new IP.' },
    { q: 'What is IPv6?', a: 'IPv6 is the newer internet addressing system with 128-bit addresses. It replaces IPv4 (32-bit) due to address exhaustion. If your ISP supports it, you will have both an IPv4 and IPv6 address.' },
    { q: 'Can websites see my IP address?', a: 'Yes. Every HTTP request you make reveals your public IP to the server. This is how geolocation, fraud detection, and regional content work.' },
    { q: 'How can I hide my IP address?', a: 'Using a VPN (Virtual Private Network) or Tor browser routes your traffic through another server, masking your real IP from websites you visit.' },
];

const InfoCard: React.FC<{
    label: string;
    value?: string | number | null;
    icon?: React.ReactNode;
    color?: string;
    mono?: boolean;
    fullWidth?: boolean;
}> = ({ label, value, icon, color = '#1ABC9C', mono = false }) => (
    <Box sx={{
        p: 2.5,
        bgcolor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        height: '100%',
    }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {icon && <Box sx={{ color, opacity: 0.7, display: 'flex', flexShrink: 0 }}>{icon}</Box>}
            <Typography variant="caption" sx={{
                color: '#64748b', textTransform: 'uppercase',
                letterSpacing: '0.07em', fontSize: '0.7rem', fontWeight: 700,
            }}>
                {label}
            </Typography>
        </Box>
        <Typography sx={{
            color: value ? '#334155' : '#cbd5e1',
            fontWeight: value ? 600 : 400,
            wordBreak: 'break-all',
            fontFamily: mono ? 'monospace' : 'inherit',
            fontSize: mono ? '0.82rem' : '0.95rem',
            fontStyle: value ? 'normal' : 'italic',
        }}>
            {value != null && value !== '' ? String(value) : 'Not available'}
        </Typography>
    </Box>
);

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; color: string }> = ({ icon, title, color }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box sx={{ p: 0.75, bgcolor: `${color}18`, borderRadius: '8px', color, display: 'flex' }}>{icon}</Box>
        <Typography variant="overline" sx={{ color: '#1e293b', fontWeight: 700, letterSpacing: '0.1em' }}>
            {title}
        </Typography>
    </Box>
);

const WhatIsMyIpPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchMyIp = async () => {
        setLoading(true); setError(null); setResult(null);
        try {
            const res = await fetch(`${API_BASE}/what-is-my-ip-full`);
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

    useEffect(() => { fetchMyIp(); }, []);

    const renderResult = () => {
        if (!result) return null;

        // Actual API shape:
        // result.ipAddress  → { ipv4, ipv6, detectedIp, detectedFrom }
        // result.location   → { country, region, city, latitude, longitude, timezone, formatted, mapUrl }
        // result.network    → { isp, org, asn }
        // result.client     → { browser, browserVersion, operatingSystem, osVersion, language, userAgent, screenResolution }
        // result.providers  → [{ provider, success, data:{...} }]

        const ipAddr = result.ipAddress || {};
        const loc = result.location || {};
        const net = result.network || {};
        const client = result.client || {};
        const providers: any[] = result.providers || [];

        return (
            <Box>
                {/* ── IP Address Hero ── */}
                <Box sx={{
                    p: { xs: 3, md: 4 },
                    bgcolor: 'rgba(26,188,156,0.08)',
                    border: '1px solid rgba(26,188,156,0.2)',
                    borderRadius: '16px',
                    mb: 3,
                    textAlign: 'center',
                }}>
                    <Typography variant="caption" sx={{
                        color: '#64748b', display: 'block', mb: 1,
                        textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.75rem',
                    }}>
                        Your Detected Public IP
                    </Typography>
                    <Typography variant="h2" sx={{
                        color: '#1ABC9C', fontWeight: 900, fontFamily: 'monospace',
                        fontSize: { xs: '2rem', md: '3rem' }, mb: 1.5,
                    }}>
                        {ipAddr.detectedIp || ipAddr.ipv4 || '—'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                        {ipAddr.ipv4 && ipAddr.ipv4 !== 'UNKNOWN' && (
                            <Chip label={`IPv4: ${ipAddr.ipv4}`} size="small" sx={{ bgcolor: 'rgba(26,188,156,0.12)', color: '#1ABC9C', border: '1px solid rgba(26,188,156,0.25)', fontFamily: 'monospace', fontWeight: 700 }} />
                        )}
                        {ipAddr.ipv6 && ipAddr.ipv6 !== 'UNKNOWN' && (
                            <Chip label={`IPv6: ${ipAddr.ipv6}`} size="small" sx={{ bgcolor: 'rgba(52,152,219,0.12)', color: '#3498DB', border: '1px solid rgba(52,152,219,0.25)', fontFamily: 'monospace', fontWeight: 700 }} />
                        )}
                        {ipAddr.ipv6 === 'UNKNOWN' && (
                            <Chip label="IPv6: Not detected" size="small" sx={{ bgcolor: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0', fontWeight: 600 }} />
                        )}
                        {loc.country && (
                            <Chip label={`📍 ${[loc.city, loc.country].filter(Boolean).join(', ')}`} size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', fontWeight: 600 }} />
                        )}
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <Button size="small" startIcon={<RefreshCw size={13} />} onClick={fetchMyIp}
                            sx={{ color: '#64748b', textTransform: 'none', fontSize: '0.8rem', '&:hover': { color: '#1ABC9C' } }}>
                            Refresh
                        </Button>
                    </Box>
                </Box>

                {/* ── Location ── */}
                <Box sx={{ mb: 3 }}>
                    <SectionHeader icon={<MapPin size={16} />} title="Location" color="#2ECC71" />
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <InfoCard label="Country" value={loc.country} icon={<Globe size={14} />} color="#2ECC71" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <InfoCard label="Region / State" value={loc.region} icon={<MapPin size={14} />} color="#2ECC71" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <InfoCard label="City" value={loc.city} icon={<MapPin size={14} />} color="#2ECC71" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <InfoCard label="Timezone" value={loc.timezone} icon={<Clock size={14} />} color="#2ECC71" />
                        </Grid>
                        {(loc.latitude != null || loc.longitude != null) && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <InfoCard label="Coordinates" value={loc.latitude != null ? `${loc.latitude}, ${loc.longitude}` : null} icon={<MapPin size={14} />} color="#2ECC71" />
                            </Grid>
                        )}
                        {loc.formatted && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <InfoCard label="Formatted Location" value={loc.formatted} icon={<Globe size={14} />} color="#2ECC71" />
                            </Grid>
                        )}
                    </Grid>
                </Box>

                <Divider sx={{ borderColor: '#e2e8f0', mb: 3 }} />

                {/* ── Network ── */}
                <Box sx={{ mb: 3 }}>
                    <SectionHeader icon={<Network size={16} />} title="Network" color="#3498DB" />
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <InfoCard label="ISP" value={net.isp} icon={<Wifi size={14} />} color="#3498DB" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <InfoCard label="Organization" value={net.org} icon={<Building size={14} />} color="#3498DB" />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <InfoCard label="ASN (Autonomous System Number)" value={net.asn} mono color="#3498DB" />
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ borderColor: '#e2e8f0', mb: 3 }} />

                {/* ── Browser / Client ── */}
                <Box sx={{ mb: 3 }}>
                    <SectionHeader icon={<Monitor size={16} />} title="Browser & Device" color="#9B59B6" />
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <InfoCard label="Browser" value={client.browser ? `${client.browser} ${client.browserVersion || ''}`.trim() : null} icon={<Chrome size={14} />} color="#9B59B6" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <InfoCard label="Operating System" value={client.operatingSystem ? `${client.operatingSystem} ${client.osVersion || ''}`.trim() : null} icon={<Layers size={14} />} color="#9B59B6" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <InfoCard label="Language" value={client.language} icon={<Globe size={14} />} color="#9B59B6" />
                        </Grid>
                        {client.screenResolution && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <InfoCard label="Screen Resolution" value={client.screenResolution} color="#9B59B6" />
                            </Grid>
                        )}
                        {client.userAgent && (
                            <Grid size={{ xs: 12 }}>
                                <InfoCard label="User Agent" value={client.userAgent} mono color="#9B59B6" />
                            </Grid>
                        )}
                    </Grid>
                </Box>

                {/* ── Providers ── */}
                {providers.length > 0 && (
                    <>
                        <Divider sx={{ borderColor: '#e2e8f0', mb: 3 }} />
                        <SectionHeader icon={<Globe size={16} />} title={`Geo Providers (${providers.length})`} color="#F39C12" />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {providers.map((p: any, i: number) => {
                                const pd = p.data || {};
                                return (
                                    <Box key={i} sx={{
                                        p: 2.5,
                                        bgcolor: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: p.success && pd.country ? 1.5 : 0 }}>
                                            <Chip
                                                size="small"
                                                label={p.provider}
                                                sx={{ bgcolor: 'rgba(243,156,18,0.1)', color: '#F39C12', border: '1px solid rgba(243,156,18,0.2)', fontWeight: 700, textTransform: 'capitalize' }}
                                            />
                                            <Chip
                                                size="small"
                                                label={p.success ? '✓ Success' : '✗ Failed'}
                                                sx={{
                                                    bgcolor: p.success ? 'rgba(46,204,113,0.1)' : 'rgba(231,76,60,0.1)',
                                                    color: p.success ? '#2ECC71' : '#E74C3C',
                                                    border: `1px solid ${p.success ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)'}`,
                                                    height: 20, fontSize: '0.72rem', fontWeight: 700,
                                                }}
                                            />
                                        </Box>
                                        {p.success && pd.country && (
                                            <Grid container spacing={1}>
                                                {[
                                                    { l: 'IP', v: pd.query },
                                                    { l: 'Country', v: pd.country },
                                                    { l: 'City', v: pd.city },
                                                    { l: 'Region', v: pd.regionName },
                                                    { l: 'ISP', v: pd.isp },
                                                    { l: 'Timezone', v: pd.timezone },
                                                    { l: 'Coords', v: pd.lat != null ? `${pd.lat}, ${pd.lon}` : null },
                                                    { l: 'AS', v: pd.as },
                                                ].filter(item => item.v).map((item) => (
                                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.l}>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Typography variant="caption" sx={{ color: '#94a3b8', flexShrink: 0, minWidth: 56 }}>{item.l}:</Typography>
                                                            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, wordBreak: 'break-all' }}>{item.v}</Typography>
                                                        </Box>
                                                    </Grid>
                                                ))}
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
            <SEOHead
            title="What Is My IP — Detect Your Public IP Address"
            description="Find out your current public IP address, location, ISP and connection details instantly."
            keywords="what is my ip, my ip address, find my ip, public ip address, ip location, ip checker"
            canonical="/tools/what-is-my-ip"
        />
            {/* Hero */}
            <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center', px: 2, background: 'linear-gradient(180deg, rgba(26,188,156,0.07) 0%, transparent 100%)' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <Box sx={{ display: 'inline-flex', p: 2, bgcolor: 'rgba(26,188,156,0.1)', borderRadius: '16px', mb: 3, border: '1px solid rgba(26,188,156,0.25)' }}>
                        <Wifi size={36} color="#1ABC9C" />
                    </Box>
                    <Typography variant="h2" sx={{color: '#1e293b', fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>
                        What Is My IP Address?
                    </Typography>
                    <Typography sx={{ color: '#64748b', maxWidth: 640, mx: 'auto', fontSize: '1.1rem' }}>
                        Instantly detect your public IPv4 & IPv6 address along with location, ISP, browser, OS info — fully automatic, no input needed.
                    </Typography>
                </motion.div>
            </Box>

            <Container maxWidth="md" sx={{ pb: 8 }}>
                <AnimatePresence>
                    {loading && (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Paper elevation={0} sx={{ p: 6, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', mb: 4, textAlign: 'center' }}>
                                <CircularProgress size={40} sx={{ color: '#1ABC9C', mb: 2 }} />
                                <Typography sx={{ color: '#94a3b8' }}>Detecting your IP address…</Typography>
                            </Paper>
                        </motion.div>
                    )}
                    {error && !loading && (
                        <motion.div key="err" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <Paper elevation={0} sx={{ p: 3, bgcolor: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.25)', borderRadius: '14px', mb: 4, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                <AlertCircle size={20} color="#E74C3C" style={{ flexShrink: 0, marginTop: 2 }} />
                                <Box>
                                    <Typography sx={{ color: '#E74C3C' }}>{error}</Typography>
                                    <Button size="small" onClick={fetchMyIp} startIcon={<RefreshCw size={14} />}
                                        sx={{ mt: 1, color: '#E74C3C', textTransform: 'none' }}>
                                        Try Again
                                    </Button>
                                </Box>
                            </Paper>
                        </motion.div>
                    )}
                    {result && !loading && (
                        <motion.div key="res" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', mb: 4 }}>
                                {renderResult()}
                            </Paper>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* How to Use */}
                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', mb: 4 }}>
                    <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 800, mb: 3 }}>About This Tool</Typography>
                    {[
                        { step: '1', title: 'Automatic IP Detection', desc: 'The tool detects your public IPv4 and IPv6 addresses the moment you open the page — no input required.' },
                        { step: '2', title: 'Location & Network Info', desc: 'If geo-data is available, you\'ll see your country, city, region, timezone, ISP, and ASN.' },
                        { step: '3', title: 'Browser & Device Details', desc: 'The client section shows your detected browser, OS, language, and user agent string.' },
                        { step: '4', title: 'Provider Breakdown', desc: 'See which geo-IP data providers were queried and what results each one returned.' },
                    ].map((item) => (
                        <Box key={item.step} sx={{ display: 'flex', gap: 2.5, mb: 2.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(26,188,156,0.15)', border: '1px solid rgba(26,188,156,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Typography sx={{ color: '#1ABC9C', fontWeight: 800, fontSize: '0.85rem' }}>{item.step}</Typography>
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

export default WhatIsMyIpPage;
