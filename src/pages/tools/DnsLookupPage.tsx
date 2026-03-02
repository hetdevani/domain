import React, { useState } from 'react';
import {
    Box, Typography, Container, TextField, Button, Paper,
    CircularProgress, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, AlertCircle } from 'lucide-react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/web/publicTool`;

const FAQS = [
    { q: 'What is a DNS lookup?', a: 'A DNS lookup is the process of querying DNS servers to translate a domain name into various record types (A, MX, TXT, NS, etc.) stored in the DNS zone.' },
    { q: 'What record types are returned?', a: 'Our tool returns all available record types: A (IPv4), AAAA (IPv6), MX (mail), TXT (verification/SPF), NS (nameservers), CNAME, and SOA records.' },
    { q: 'Why are my DNS records not showing up?', a: 'Newly created records may take time to propagate. Also, some records require specific parent zone delegation to be visible publicly.' },
    { q: 'How is this different from DNS Propagation Checker?', a: 'DNS Lookup queries a single resolver for all record types. DNS Propagation Checker queries multiple global servers to verify a specific record type has spread.' },
    { q: 'Can I check DNS for any domain?', a: 'Yes, any publicly registered domain. Private domains on internal networks won\'t be accessible from our public resolvers.' },
];

type DnsCell = { text: string; mono?: boolean; badge?: boolean; dim?: boolean; right?: boolean; wrap?: boolean };
const DNS_CFG: Record<string, { color: string; columns: string[]; gridCols: string; getCells: (r: any) => DnsCell[] }> = {
    A:     { color: '#2ECC71', columns: ['IP Address', 'TTL'],              gridCols: '1fr 72px',       getCells: (r) => [{ text: r.address ?? '—', mono: true }, { text: String(r.ttl ?? '—'), dim: true, right: true }] },
    AAAA:  { color: '#3498DB', columns: ['IPv6 Address', 'TTL'],            gridCols: '1fr 72px',       getCells: (r) => [{ text: r.address ?? '—', mono: true }, { text: String(r.ttl ?? '—'), dim: true, right: true }] },
    MX:    { color: '#E74C3C', columns: ['Priority', 'Mail Server', 'TTL'], gridCols: '72px 1fr 72px',  getCells: (r) => [{ text: String(r.priority ?? '—'), badge: true }, { text: r.exchange ?? '—', mono: true }, { text: String(r.ttl ?? '—'), dim: true, right: true }] },
    TXT:   { color: '#F39C12', columns: ['Value', 'TTL'],                   gridCols: '1fr 72px',       getCells: (r) => [{ text: r.data ?? (Array.isArray(r.entries) ? r.entries.join('') : JSON.stringify(r)), mono: true, wrap: true }, { text: String(r.ttl ?? '—'), dim: true, right: true }] },
    NS:    { color: '#9B59B6', columns: ['Nameserver', 'TTL'],              gridCols: '1fr 72px',       getCells: (r) => [{ text: r.ns ?? '—', mono: true }, { text: String(r.ttl ?? '—'), dim: true, right: true }] },
    CNAME: { color: '#1ABC9C', columns: ['Target', 'TTL'],                  gridCols: '1fr 72px',       getCells: (r) => [{ text: r.name ?? '—', mono: true }, { text: String(r.ttl ?? '—'), dim: true, right: true }] },
    SOA:   { color: '#E67E22', columns: ['Primary NS', 'Admin Email', 'Serial', 'TTL'], gridCols: '1fr 1fr 90px 72px', getCells: (r) => [{ text: r.nsname ?? '—', mono: true }, { text: r.hostmaster ?? '—', mono: true }, { text: String(r.serial ?? '—') }, { text: String(r.ttl ?? '—'), dim: true, right: true }] },
};

const DnsResultViewer: React.FC<{ data: any }> = ({ data }) => {
    const activeTypes = Object.keys(DNS_CFG).filter(type => data[type] && data[type].length > 0);
    if (!activeTypes.length) return <Typography sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', py: 4 }}>No DNS records found.</Typography>;
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {activeTypes.map((type) => {
                const cfg = DNS_CFG[type];
                return (
                    <Box key={type} sx={{ borderRadius: '14px', border: `1px solid ${cfg.color}25`, overflow: 'hidden' }}>
                        <Box sx={{ px: 3, py: 1.5, bgcolor: `${cfg.color}10`, borderBottom: `1px solid ${cfg.color}20`, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ px: 1.5, py: 0.5, bgcolor: `${cfg.color}25`, borderRadius: '6px', border: `1px solid ${cfg.color}40` }}>
                                <Typography sx={{ color: cfg.color, fontWeight: 800, fontFamily: 'monospace', fontSize: '0.8rem' }}>{type}</Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>{data[type].length} record{data[type].length > 1 ? 's' : ''}</Typography>
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: cfg.gridCols, gap: 2, px: 3, py: 1, bgcolor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            {cfg.columns.map((col, ci) => (
                                <Typography key={ci} sx={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 600, textAlign: ci === cfg.columns.length - 1 ? 'right' : 'left' }}>{col}</Typography>
                            ))}
                        </Box>
                        {data[type].map((record: any, idx: number) => (
                            <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: cfg.gridCols, gap: 2, px: 3, py: 1.5, alignItems: 'center', bgcolor: idx % 2 === 0 ? 'rgba(0,0,0,0.12)' : 'transparent', borderBottom: idx < data[type].length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                                {cfg.getCells(record).map((cell, ci) => (
                                    <Typography key={ci} component="span" sx={{ fontFamily: cell.mono ? 'monospace' : 'inherit', fontSize: cell.mono ? '0.83rem' : '0.875rem', color: cell.dim ? 'rgba(255,255,255,0.28)' : (cell.badge ? cfg.color : '#e2e8f0'), fontWeight: cell.dim ? 400 : (cell.badge ? 700 : 500), textAlign: cell.right ? 'right' : 'left', wordBreak: cell.wrap ? 'break-all' : 'normal' }}>{cell.text}</Typography>
                                ))}
                            </Box>
                        ))}
                    </Box>
                );
            })}
        </Box>
    );
};

const DnsLookupPage: React.FC = () => {
    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCheck = async () => {
        if (!domain) return;
        setLoading(true); setError(null); setResult(null);
        try {
            const res = await fetch(`${API_BASE}/dns-lookup?domain=${encodeURIComponent(domain)}`);
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
            <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center', px: 2, background: 'linear-gradient(180deg, rgba(155,89,182,0.07) 0%, transparent 100%)' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <Box sx={{ display: 'inline-flex', p: 2, bgcolor: 'rgba(155,89,182,0.1)', borderRadius: '16px', mb: 3, border: '1px solid rgba(155,89,182,0.25)' }}>
                        <Search size={36} color="#9B59B6" />
                    </Box>
                    <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>DNS Lookup Tool</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}>
                        Query all DNS record types for any domain instantly. View A, AAAA, MX, TXT, NS, CNAME, and SOA records with their TTL values.
                    </Typography>
                </motion.div>
            </Box>

            <Container maxWidth="md" sx={{ pb: 8 }}>
                <Paper elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', p: { xs: 3, md: 5 }, mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#e2e8f0' }}>Domain DNS Lookup</Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <TextField
                            fullWidth label="Domain Name" placeholder="example.com"
                            value={domain} onChange={(e) => setDomain(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                            InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)' } }}
                            sx={{ '& .MuiOutlinedInput-root': { color: '#fff', bgcolor: 'rgba(0,0,0,0.2)', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(155,89,182,0.5)' }, '&.Mui-focused fieldset': { borderColor: '#9B59B6' } } }}
                        />
                        <Button variant="contained" onClick={handleCheck} disabled={loading || !domain}
                            sx={{ bgcolor: '#9B59B6', px: 4, fontWeight: 700, borderRadius: '10px', minWidth: 140, '&:hover': { bgcolor: '#8e44ad' }, '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' } }}>
                            {loading ? <CircularProgress size={22} color="inherit" /> : 'Lookup DNS'}
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
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>DNS Records for <Box component="span" sx={{ color: '#9B59B6', fontFamily: 'monospace' }}>{domain}</Box></Typography>
                                <DnsResultViewer data={result} />
                            </Paper>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>How to Use</Typography>
                    {[
                        { step: '1', title: 'Enter a Domain', desc: 'Type the domain you want to inspect (e.g., google.com). Subdomains like mail.google.com also work.' },
                        { step: '2', title: 'Click Lookup DNS', desc: 'Our resolver queries the domain\'s authoritative nameservers for all DNS record types.' },
                        { step: '3', title: 'Analyze Records', desc: 'Each record type is displayed in a color-coded table with values and TTL. Check A records for IPs, MX for mail servers, TXT for SPF/DKIM.' },
                    ].map((item) => (
                        <Box key={item.step} sx={{ display: 'flex', gap: 2.5, mb: 2.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(155,89,182,0.15)', border: '1px solid rgba(155,89,182,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Typography sx={{ color: '#9B59B6', fontWeight: 800, fontSize: '0.85rem' }}>{item.step}</Typography>
                            </Box>
                            <Box><Typography sx={{ fontWeight: 700, mb: 0.5 }}>{item.title}</Typography><Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</Typography></Box>
                        </Box>
                    ))}
                </Paper>

                <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>Frequently Asked Questions</Typography>
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

export default DnsLookupPage;
