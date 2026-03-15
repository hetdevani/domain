import React, { useState } from 'react';
import {
    Box, Typography, Container, TextField, Button, Paper,
    CircularProgress, Accordion, AccordionSummary, AccordionDetails, Grid, Chip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, AlertCircle, CheckCircle, AlertTriangle, Clock, Server, Shield, Calendar, RefreshCw } from 'lucide-react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import SEOHead from '../../components/seo/SEOHead';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/web/publicTool`;
const ACCENT = '#8B5CF6';

const FAQS = [
    { q: 'What is domain expiration monitoring?', a: 'Domain expiration monitoring tracks when your domain name registration is set to expire. Letting a domain expire can cause your website to go offline and allow others to register your domain.' },
    { q: 'How are expiration days calculated?', a: 'The expiration date is retrieved from the RDAP (Registration Data Access Protocol) database maintained by domain registries. Days are counted from today to the expiration date.' },
    { q: 'What is RDAP?', a: 'RDAP (Registration Data Access Protocol) is the modern replacement for WHOIS. It provides structured domain registration data including registrar, status codes, nameservers, and key dates.' },
    { q: 'What do domain status codes mean?', a: 'Status codes like "client transfer prohibited" protect your domain from unauthorized transfers. "Server delete prohibited" means the registry has locked deletion. Multiple status codes indicate a well-protected domain.' },
    { q: 'What is DNSSEC?', a: 'DNSSEC (DNS Security Extensions) adds a layer of security to the DNS by digitally signing DNS records. It prevents DNS spoofing and cache poisoning attacks.' },
];

const getExpiryColor = (days: number) => days <= 30 ? '#E74C3C' : days <= 90 ? '#F39C12' : '#2ECC71';
const getExpiryLabel = (days: number) => days <= 30 ? 'Critical' : days <= 90 ? 'Expiring Soon' : 'Active';
const getExpiryIcon = (days: number) => days <= 30
    ? <AlertCircle size={18} color="#E74C3C" />
    : days <= 90
        ? <AlertTriangle size={18} color="#F39C12" />
        : <CheckCircle size={18} color="#2ECC71" />;

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; accent?: string }> = ({ icon, label, value, accent = ACCENT }) => (
    <Box sx={{ p: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Box sx={{ p: 1.2, bgcolor: `${accent}12`, borderRadius: '10px', color: accent, display: 'flex', flexShrink: 0 }}>{icon}</Box>
        <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>{label}</Typography>
            <Box sx={{ color: '#1e293b', fontWeight: 600, fontSize: '0.9rem', wordBreak: 'break-word' }}>{value}</Box>
        </Box>
    </Box>
);

const DomainMonitoringPage: React.FC = () => {
    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCheck = async () => {
        const clean = domain.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
        if (!clean) return;
        setLoading(true); setError(null); setResult(null);
        try {
            const res = await fetch(`${API_BASE}/domain-expiration?domain=${encodeURIComponent(clean)}`);
            const data = await res.json();
            if (data.code === 'SUCCESS' || data.status === 200) setResult(data.data);
            else setError(data.message || 'Request failed');
        } catch {
            setError('Failed to reach the server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderResult = () => {
        if (!result) return null;

        const rdap = result.rdap ?? {};
        const days: number = result.expiresInDays ?? 0;
        const expiryColor = getExpiryColor(days);

        // Extract registrar name
        const registrarEntity = (rdap.entities ?? []).find((e: any) => e.roles?.includes('registrar'));
        const registrarName = registrarEntity?.vcardArray?.[1]?.find((v: any[]) => v[0] === 'fn')?.[3] ?? '—';

        // Extract events
        const events: any[] = rdap.events ?? [];
        const getEvent = (action: string) => events.find(e => e.eventAction === action)?.eventDate;
        const registeredDate = getEvent('registration');
        const lastChanged = getEvent('last changed');

        // Nameservers
        const nameservers: string[] = (rdap.nameservers ?? []).map((ns: any) => ns.ldhName);

        // Status codes
        const statusCodes: string[] = rdap.status ?? [];

        // DNSSEC
        const dnssec = rdap.secureDNS?.delegationSigned;

        return (
            <Box>
                {/* Domain + Expiry Hero */}
                <Box sx={{ p: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', mb: 3, display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Expiry ring */}
                    <Box sx={{ textAlign: 'center', flexShrink: 0 }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 110, height: 110 }}>
                            <Box component="svg" viewBox="0 0 100 100" sx={{ width: 110, height: 110, position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                                <circle cx="50" cy="50" r="44" fill="none" stroke="#e2e8f0" strokeWidth="7" />
                                <circle cx="50" cy="50" r="44" fill="none" stroke={expiryColor} strokeWidth="7"
                                    strokeDasharray={`${Math.min(100, (Math.min(days, 365) / 365) * 276.46)} 276.46`}
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dasharray 0.8s ease' }}
                                />
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography sx={{ color: expiryColor, fontWeight: 900, fontSize: '1.5rem', lineHeight: 1 }}>{days}</Typography>
                                <Typography sx={{ color: '#94a3b8', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>days left</Typography>
                            </Box>
                        </Box>
                        <Chip
                            label={getExpiryLabel(days)}
                            icon={getExpiryIcon(days)}
                            size="small"
                            sx={{ mt: 1, bgcolor: `${expiryColor}12`, color: expiryColor, border: `1px solid ${expiryColor}30`, fontWeight: 700, fontSize: '0.72rem' }}
                        />
                    </Box>

                    {/* Domain info */}
                    <Box sx={{ flex: 1, minWidth: 180 }}>
                        <Typography sx={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, mb: 0.5 }}>Domain</Typography>
                        <Typography sx={{ color: '#0f172a', fontWeight: 800, fontSize: '1.5rem', fontFamily: 'monospace', mb: 1.5 }}>{result.domain}</Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <Calendar size={14} color="#94a3b8" />
                                <Typography sx={{ color: '#64748b', fontSize: '0.82rem' }}>
                                    Expires: <strong>{formatDate(result.expirationDate)}</strong>
                                </Typography>
                            </Box>
                            {registeredDate && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    <Clock size={14} color="#94a3b8" />
                                    <Typography sx={{ color: '#64748b', fontSize: '0.82rem' }}>
                                        Registered: <strong>{formatDate(registeredDate)}</strong>
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* Info cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoCard icon={<Server size={16} />} label="Registrar" value={registrarName} accent="#3498DB" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoCard icon={<Shield size={16} />} label="DNSSEC" value={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                {dnssec ? <CheckCircle size={15} color="#2ECC71" /> : <AlertCircle size={15} color="#94a3b8" />}
                                <Typography sx={{ fontWeight: 600, color: dnssec ? '#2ECC71' : '#64748b', fontSize: '0.9rem' }}>
                                    {dnssec ? 'Signed (Enabled)' : 'Not Signed'}
                                </Typography>
                            </Box>
                        } accent="#E74C3C" />
                    </Grid>
                    {lastChanged && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <InfoCard icon={<RefreshCw size={16} />} label="Last Updated" value={formatDate(lastChanged)} accent="#F39C12" />
                        </Grid>
                    )}
                    <Grid size={{ xs: 12, sm: lastChanged ? 6 : 12 }}>
                        <InfoCard icon={<Globe size={16} />} label="Registry Handle" value={
                            <Typography sx={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>{rdap.handle ?? '—'}</Typography>
                        } accent={ACCENT} />
                    </Grid>
                </Grid>

                {/* Domain Status */}
                {statusCodes.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5 }}>Domain Status</Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {statusCodes.map((s) => (
                                <Chip
                                    key={s}
                                    label={s}
                                    size="small"
                                    icon={<CheckCircle size={12} color="#2ECC71" />}
                                    sx={{ bgcolor: 'rgba(46,204,113,0.08)', color: '#16a34a', border: '1px solid rgba(46,204,113,0.2)', fontWeight: 600, fontSize: '0.72rem', fontFamily: 'monospace' }}
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Nameservers */}
                {nameservers.length > 0 && (
                    <Box>
                        <Typography sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5 }}>Nameservers</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {nameservers.map((ns, i) => (
                                <Box key={ns} sx={{ px: 2.5, py: 1.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ width: 22, height: 22, borderRadius: '6px', bgcolor: `${ACCENT}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Typography sx={{ color: ACCENT, fontWeight: 800, fontSize: '0.65rem' }}>{i + 1}</Typography>
                                    </Box>
                                    <Typography sx={{ color: '#1e293b', fontFamily: 'monospace', fontWeight: 600, fontSize: '0.88rem' }}>{ns}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}
            </Box>
        );
    };

    return (
        <ToolPageLayout>
            <SEOHead
            title="Domain Monitoring — Check Domain Expiry & WHOIS Data"
            description="Check domain expiration dates, registrar details, nameservers, DNSSEC status and RDAP registration data for any domain."
            keywords="domain expiry checker, domain monitoring, whois lookup, domain registration, domain expiration date, rdap lookup"
            canonical="/tools/domain-monitoring"
        />
            <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center', px: 2, background: `linear-gradient(180deg, ${ACCENT}12 0%, transparent 100%)` }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <Box sx={{ display: 'inline-flex', p: 2, bgcolor: `${ACCENT}18`, borderRadius: '16px', mb: 3, border: `1px solid ${ACCENT}40` }}>
                        <Globe size={36} color={ACCENT} />
                    </Box>
                    <Typography variant="h2" sx={{ color: '#1e293b', fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>Domain Monitoring</Typography>
                    <Typography sx={{ color: '#64748b', maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}>
                        Check domain expiration dates, registrar details, nameservers, DNSSEC status, and RDAP registration data instantly.
                    </Typography>
                </motion.div>
            </Box>

            <Container maxWidth="md" sx={{ pb: 8 }}>
                <Paper elevation={0} sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', p: { xs: 3, md: 5 }, mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#334155' }}>Check Domain Expiration</Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <TextField
                            fullWidth label="Domain Name" placeholder="example.com"
                            value={domain} onChange={(e) => setDomain(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                            InputLabelProps={{ sx: { color: '#64748b', '&.Mui-focused': { color: '#1e293b' } } }}
                            sx={{ '& .MuiOutlinedInput-root': { color: '#1e293b', bgcolor: '#f8fafc', height: '56px', '& fieldset': { borderColor: '#e2e8f0' }, '&:hover fieldset': { borderColor: `${ACCENT}80` }, '&.Mui-focused fieldset': { borderColor: ACCENT } } }}
                        />
                        <Button variant="contained" onClick={handleCheck} disabled={loading || !domain.trim()}
                            sx={{ bgcolor: ACCENT, px: 4, fontWeight: 700, borderRadius: '10px', minWidth: 160, whiteSpace: 'nowrap', '&:hover': { filter: 'brightness(0.9)', bgcolor: ACCENT }, '&.Mui-disabled': { bgcolor: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.3)' } }}>
                            {loading ? <><CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />Checking…</> : 'Check Domain'}
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
                            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', mb: 4 }}>
                                <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 700, mb: 3 }}>Domain Report</Typography>
                                {renderResult()}
                            </Paper>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', mb: 4 }}>
                    <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 800, mb: 3 }}>How to Use</Typography>
                    {[
                        { step: '1', title: 'Enter Domain', desc: 'Type the domain name (e.g. example.com). No need to include http:// or www.' },
                        { step: '2', title: 'Click Check Domain', desc: 'We query the RDAP registry to fetch live registration data for the domain.' },
                        { step: '3', title: 'Review Expiration', desc: 'The expiry ring shows days remaining. Red means critical (<30 days), orange is a warning (<90 days), green is safe.' },
                        { step: '4', title: 'Check Details', desc: 'Review registrar, nameservers, DNSSEC, and status codes to ensure your domain is properly configured and protected.' },
                    ].map((item) => (
                        <Box key={item.step} sx={{ display: 'flex', gap: 2.5, mb: 2.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: `${ACCENT}18`, border: `1px solid ${ACCENT}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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

export default DomainMonitoringPage;
