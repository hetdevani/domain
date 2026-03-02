import React, { useState } from 'react';
import {
    Box, Typography, Button, Container,
    TextField, Paper, CircularProgress, Grid,
    Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Activity, Globe, Bell, Server, ArrowRight,
    Search, Wifi, Lock, MapPin,
    Zap, Mail, MessageSquare, Send,
    Cloud, ChevronDown, Plus, Eye, Monitor,
    Users, TrendingUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LandingNavbar from '../../components/layout/LandingNavbar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
    { time: '10:00', responseTime: 120 },
    { time: '10:05', responseTime: 110 },
    { time: '10:10', responseTime: 130 },
    { time: '10:15', responseTime: 125 },
    { time: '10:20', responseTime: 150 },
    { time: '10:25', responseTime: 800 },
    { time: '10:30', responseTime: 120 },
    { time: '10:35', responseTime: 115 },
    { time: '10:40', responseTime: 118 },
    { time: '10:45', responseTime: 125 },
    { time: '10:50', responseTime: 110 },
    { time: '10:55', responseTime: 112 },
];

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/web/publicTool`;

type DnsCell = { text: string; mono?: boolean; badge?: boolean; dim?: boolean; right?: boolean; wrap?: boolean };

const DNS_CONFIG: Record<string, { color: string; columns: string[]; gridCols: string; getCells: (r: any) => DnsCell[] }> = {
    A:     { color: '#2ECC71', columns: ['IP Address', 'TTL'],              gridCols: '1fr 72px',       getCells: (r) => [{ text: r.address ?? '—', mono: true }, { text: String(r.ttl ?? '—'), dim: true, right: true }] },
    AAAA:  { color: '#3498DB', columns: ['IPv6 Address', 'TTL'],            gridCols: '1fr 72px',       getCells: (r) => [{ text: r.address ?? '—', mono: true }, { text: String(r.ttl ?? '—'), dim: true, right: true }] },
    MX:    { color: '#E74C3C', columns: ['Priority', 'Mail Server', 'TTL'], gridCols: '72px 1fr 72px',  getCells: (r) => [{ text: String(r.priority ?? '—'), badge: true }, { text: r.exchange ?? '—', mono: true }, { text: String(r.ttl ?? '—'), dim: true, right: true }] },
    TXT:   { color: '#F39C12', columns: ['Value', 'TTL'],                   gridCols: '1fr 72px',       getCells: (r) => [{ text: r.data ?? (Array.isArray(r.entries) ? r.entries.join('') : JSON.stringify(r)), mono: true, wrap: true }, { text: String(r.ttl ?? '—'), dim: true, right: true }] },
    NS:    { color: '#9B59B6', columns: ['Nameserver', 'TTL'],              gridCols: '1fr 72px',       getCells: (r) => [{ text: r.ns ?? '—', mono: true }, { text: String(r.ttl ?? '—'), dim: true, right: true }] },
    CNAME: { color: '#1ABC9C', columns: ['Target', 'TTL'],                  gridCols: '1fr 72px',       getCells: (r) => [{ text: r.name ?? '—', mono: true }, { text: String(r.ttl ?? '—'), dim: true, right: true }] },
    SOA:   { color: '#E67E22', columns: ['Primary NS', 'Admin Email', 'Serial', 'TTL'], gridCols: '1fr 1fr 90px 72px', getCells: (r) => [{ text: r.nsname ?? '—', mono: true }, { text: r.hostmaster ?? '—', mono: true }, { text: String(r.serial ?? '—') }, { text: String(r.ttl ?? '—'), dim: true, right: true }] },
};

const DNSResultViewer: React.FC<{ data: any }> = ({ data }) => {
    const activeTypes = Object.keys(DNS_CONFIG).filter(type => data[type] && data[type].length > 0);

    if (activeTypes.length === 0) {
        return (
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', py: 4 }}>
                No DNS records found for this domain.
            </Typography>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {activeTypes.map((type) => {
                const cfg = DNS_CONFIG[type];
                return (
                    <Box key={type} sx={{ borderRadius: '14px', border: `1px solid ${cfg.color}25`, overflow: 'hidden' }}>

                        {/* Type header */}
                        <Box sx={{ px: 3, py: 1.5, bgcolor: `${cfg.color}10`, borderBottom: `1px solid ${cfg.color}20`, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ px: 1.5, py: 0.5, bgcolor: `${cfg.color}25`, borderRadius: '6px', border: `1px solid ${cfg.color}40` }}>
                                <Typography sx={{ color: cfg.color, fontWeight: 800, fontFamily: 'monospace', fontSize: '0.8rem', letterSpacing: '0.04em' }}>
                                    {type}
                                </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                {data[type].length} record{data[type].length > 1 ? 's' : ''}
                            </Typography>
                        </Box>

                        {/* Column headers */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: cfg.gridCols, gap: 2, px: 3, py: 1, bgcolor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            {cfg.columns.map((col, ci) => (
                                <Typography key={ci} sx={{
                                    color: 'rgba(255,255,255,0.28)', fontSize: '0.68rem',
                                    textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 600,
                                    textAlign: ci === cfg.columns.length - 1 ? 'right' : (type === 'MX' && ci === 0 ? 'center' : 'left'),
                                }}>
                                    {col}
                                </Typography>
                            ))}
                        </Box>

                        {/* Data rows */}
                        {data[type].map((record: any, idx: number) => (
                            <Box key={idx} sx={{
                                display: 'grid', gridTemplateColumns: cfg.gridCols,
                                gap: 2, px: 3, py: 1.5, alignItems: 'center',
                                bgcolor: idx % 2 === 0 ? 'rgba(0,0,0,0.12)' : 'transparent',
                                borderBottom: idx < data[type].length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                            }}>
                                {cfg.getCells(record).map((cell, ci) => (
                                    <Typography key={ci} component="span" sx={{
                                        fontFamily: cell.mono ? 'monospace' : 'inherit',
                                        fontSize: cell.mono ? '0.83rem' : '0.875rem',
                                        color: cell.dim ? 'rgba(255,255,255,0.28)' : (cell.badge ? cfg.color : '#e2e8f0'),
                                        fontWeight: cell.dim ? 400 : (cell.badge ? 700 : 500),
                                        textAlign: cell.right ? 'right' : (cell.badge ? 'center' : 'left'),
                                        wordBreak: cell.wrap ? 'break-all' : 'normal',
                                        ...(cell.badge ? {
                                            display: 'inline-block',
                                            bgcolor: `${cfg.color}15`,
                                            border: `1px solid ${cfg.color}35`,
                                            borderRadius: '6px',
                                            px: 1.5, py: 0.25,
                                        } : {})
                                    }}>
                                        {cell.text}
                                    </Typography>
                                ))}
                            </Box>
                        ))}
                    </Box>
                );
            })}
        </Box>
    );
};

const IPResultViewer: React.FC<{ data: any }> = ({ data }) => {
    const infoItems = [
        { label: 'City', value: data.city },
        { label: 'Region', value: data.regionName },
        { label: 'Country', value: data.country },
        { label: 'Timezone', value: data.timezone },
        { label: 'Coordinates', value: `${data.lat}, ${data.lon}` },
        { label: 'ISP', value: data.isp },
        { label: 'Organization', value: data.org },
        { label: 'AS Number', value: data.as },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{
                p: 3,
                bgcolor: 'rgba(52, 152, 219, 0.08)',
                border: '1px solid rgba(52, 152, 219, 0.2)',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', gap: 2
            }}>
                <Box sx={{ p: 2, bgcolor: 'rgba(52, 152, 219, 0.15)', borderRadius: '10px', flexShrink: 0 }}>
                    <Globe size={24} color="#3498DB" />
                </Box>
                <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block' }}>IP Address</Typography>
                    <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, fontFamily: 'monospace' }}>{data.query}</Typography>
                </Box>
            </Box>
            <Grid container spacing={2}>
                {infoItems.map((item, idx) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                        <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', mb: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
                                {item.label}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 600 }}>
                                {item.value || 'N/A'}
                            </Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

const SSLResultViewer: React.FC<{ data: any }> = ({ data }) => {
    const days = data.days_remaining;
    const isExpired = days <= 0;
    const isWarning = days > 0 && days < 30;
    const statusColor = isExpired ? '#E74C3C' : isWarning ? '#F39C12' : '#2ECC71';
    const statusLabel = isExpired ? 'Expired' : isWarning ? 'Expiring Soon' : 'Valid';
    const progressPct = Math.min(100, Math.max(0, (days / 365) * 100));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{
                p: 3,
                bgcolor: `${statusColor}10`,
                border: `1px solid ${statusColor}30`,
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 2, bgcolor: `${statusColor}20`, borderRadius: '10px', flexShrink: 0 }}>
                        <Lock size={24} color={statusColor} />
                    </Box>
                    <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block' }}>Certificate Status</Typography>
                        <Typography variant="h6" sx={{ color: statusColor, fontWeight: 700 }}>{statusLabel}</Typography>
                    </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h4" sx={{ color: statusColor, fontWeight: 900 }}>
                        {isExpired ? '—' : `${days}d`}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>days remaining</Typography>
                </Box>
            </Box>

            <Box sx={{ px: 0.5 }}>
                <Box sx={{ height: 6, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${progressPct}%`, bgcolor: statusColor, borderRadius: '3px' }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>0d</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>365d</Typography>
                </Box>
            </Box>

            <Grid container spacing={2}>
                {[
                    { label: 'Valid From', value: new Date(data.valid_from).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) },
                    { label: 'Valid To', value: new Date(data.valid_to).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) },
                    { label: 'Issued By', value: data.issuer?.O || data.issuer?.CN || 'N/A' },
                    { label: 'Common Name', value: data.subject?.CN || 'N/A' },
                ].map((item, idx) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                        <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', mb: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
                                {item.label}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 600 }}>
                                {item.value}
                            </Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

const PingResultViewer: React.FC<{ data: any }> = ({ data }) => (
    <Box sx={{
        p: 2.5,
        bgcolor: 'rgba(0,0,0,0.4)',
        borderRadius: '12px',
        fontFamily: 'monospace',
        fontSize: '0.83rem',
        whiteSpace: 'pre-wrap',
        border: '1px solid rgba(255,255,255,0.06)',
        color: '#2ECC71',
        lineHeight: 1.8
    }}>
        {data.output}
    </Box>
);

const WhoisResultViewer: React.FC<{ data: any }> = ({ data }) => {
    const entities = data.entities?.map((e: any) => e.vcardArray?.[1]?.[2]?.[3]).filter(Boolean) || [];
    const eventColors: Record<string, string> = {
        'registration': '#2ECC71',
        'expiration': '#E74C3C',
        'last changed': '#F39C12',
    };
    const displayEvents = (data.events || []).filter((e: any) => e.eventAction !== 'last update of RDAP database').map((e: any) => ({
        action: e.eventAction,
        date: new Date(e.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ p: 3, bgcolor: 'rgba(46, 204, 113, 0.08)', border: '1px solid rgba(46, 204, 113, 0.2)', borderRadius: '12px' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5 }}>Domain Name</Typography>
                <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, fontFamily: 'monospace', mb: 1.5 }}>
                    {data.ldhName?.toUpperCase() || 'N/A'}
                </Typography>
                {data.status && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {data.status.slice(0, 4).map((s: string, i: number) => (
                            <Box key={i} sx={{ px: 1.5, py: 0.4, bgcolor: 'rgba(46, 204, 113, 0.1)', border: '1px solid rgba(46, 204, 113, 0.2)', borderRadius: '6px' }}>
                                <Typography variant="caption" sx={{ color: '#2ECC71', fontSize: '0.7rem', fontFamily: 'monospace' }}>{s}</Typography>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>

            {displayEvents.length > 0 && (
                <Box>
                    <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.35)', px: 0.5, display: 'block', mb: 1.5, letterSpacing: '0.1em' }}>Key Dates</Typography>
                    <Grid container spacing={2}>
                        {displayEvents.map((event: any, idx: number) => {
                            const color = eventColors[event.action.toLowerCase()] || '#3498DB';
                            return (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                                    <Box sx={{ p: 2, bgcolor: `${color}08`, border: `1px solid ${color}25`, borderRadius: '10px' }}>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize', display: 'block', mb: 0.5 }}>
                                            {event.action}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: color, fontWeight: 700 }}>{event.date}</Typography>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
            )}

            {entities.length > 0 && (
                <Box sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem', display: 'block', mb: 1 }}>
                        Contacts
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#e2e8f0' }}>{entities.join(', ')}</Typography>
                </Box>
            )}
        </Box>
    );
};

const PublicToolsUI: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const tools = [
        { name: 'DNS Lookup', icon: <Search size={16} />, endpoint: '/dns-lookup', field: 'domain', placeholder: 'example.com', desc: 'Query all DNS record types for a domain', color: '#2ECC71' },
        { name: 'IP Info', icon: <MapPin size={16} />, endpoint: '/ip-intelligence', field: 'ip', placeholder: '8.8.8.8', desc: 'Geolocate and get details for any IP address', color: '#3498DB' },
        { name: 'SSL Check', icon: <Lock size={16} />, endpoint: '/ssl-check', field: 'hostname', placeholder: 'google.com', desc: 'Verify SSL certificate validity and expiry', color: '#E74C3C' },
        { name: 'WHOIS', icon: <Globe size={16} />, endpoint: '/whois', field: 'domain', placeholder: 'google.com', desc: 'Look up domain registration information', color: '#F39C12' },
        { name: 'Ping', icon: <Wifi size={16} />, endpoint: '/ping', field: 'host', placeholder: '1.1.1.1', desc: 'Test host reachability and latency', color: '#9B59B6' },
    ];

    const activeTool = tools[activeTab];

    const handleRunTool = async () => {
        if (!inputValue) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const tool = tools[activeTab];
            const response = await fetch(`${API_BASE_URL}${tool.endpoint}?${tool.field}=${inputValue}`);
            const data = await response.json();

            if (data.status === 'success') {
                setResult(data.data);
            } else {
                setError(data.message || 'Request failed');
            }
        } catch (err) {
            setError('Failed to connect to backend.');
        } finally {
            setLoading(false);
        }
    };

    const renderResult = () => {
        if (!result) return null;
        switch (activeTab) {
            case 0: return <DNSResultViewer data={result} />;
            case 1: return <IPResultViewer data={result} />;
            case 2: return <SSLResultViewer data={result} />;
            case 3: return <WhoisResultViewer data={result} />;
            case 4: return <PingResultViewer data={result} />;
            default: return <pre style={{ color: '#fff' }}>{JSON.stringify(result, null, 2)}</pre>;
        }
    };

    return (
        <Paper elevation={0} sx={{
            bgcolor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '24px',
            p: { xs: 3, md: 5 },
            backdropFilter: 'blur(10px)'
        }}>
            {/* Tool Selector */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 4, flexWrap: 'wrap' }}>
                {tools.map((tool, i) => (
                    <Box
                        key={i}
                        onClick={() => { setActiveTab(i); setInputValue(''); setResult(null); setError(null); }}
                        sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            px: 2.5, py: 1.5,
                            borderRadius: '10px',
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: activeTab === i ? tool.color : 'rgba(255,255,255,0.08)',
                            bgcolor: activeTab === i ? `${tool.color}12` : 'transparent',
                            color: activeTab === i ? tool.color : '#ffffff',
                            transition: 'all 0.2s',
                            userSelect: 'none',
                            '&:hover': {
                                borderColor: `${tool.color}80`,
                                color: activeTab === i ? tool.color : '#ffffff',
                                bgcolor: `${tool.color}08`,
                            }
                        }}
                    >
                        {tool.icon}
                        <Typography sx={{ fontWeight: 600, color: activeTab === i ? tool.color : '#ffffff', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{tool.name}</Typography>
                    </Box>
                ))}
            </Box>

            {/* Input */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', display: 'block', mb: 1.5, fontSize: '0.8rem' }}>
                    {activeTool.desc}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder={activeTool.placeholder}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleRunTool()}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                color: '#fff',
                                bgcolor: 'rgba(0,0,0,0.25)',
                                fontSize: '0.95rem',
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                '&:hover fieldset': { borderColor: `${activeTool.color}60` },
                                '&.Mui-focused fieldset': { borderColor: activeTool.color },
                            }
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleRunTool}
                        disabled={loading || !inputValue}
                        sx={{
                            bgcolor: activeTool.color,
                            px: { xs: 2, sm: 4 },
                            minWidth: { xs: '100%', sm: '160px' },
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            '&:hover': { bgcolor: activeTool.color, filter: 'brightness(0.85)' },
                            '&.Mui-disabled': { color: 'rgba(255,255,255,0.4)', bgcolor: 'rgba(255,255,255,0.07)' },
                        }}
                    >
                        {loading ? <CircularProgress size={22} color="inherit" /> : 'Analyze'}
                    </Button>
                </Box>
            </Box>

            <AnimatePresence mode="wait">
                {error && (
                    <motion.div key="error" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <Box sx={{ p: 2.5, bgcolor: 'rgba(231, 76, 60, 0.08)', border: '1px solid rgba(231, 76, 60, 0.25)', borderRadius: '10px', mb: 2 }}>
                            <Typography sx={{ color: '#E74C3C', fontSize: '0.9rem' }}>{error}</Typography>
                        </Box>
                    </motion.div>
                )}
                {result && (
                    <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Box sx={{
                            pt: 2,
                            borderTop: '1px solid rgba(255,255,255,0.06)',
                            maxHeight: 600,
                            overflow: 'auto',
                        }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', display: 'block', mb: 2, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                Results for "{inputValue}"
                            </Typography>
                            {renderResult()}
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>
        </Paper>
    );
};


const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const features = [
        { icon: <Globe size={32} color="#2ECC71" />, title: 'HTTP/HTTPS Monitoring', desc: 'Monitor website uptime and response times with detailed performance metrics and status code tracking.' },
        { icon: <Wifi size={32} color="#3498DB" />, title: 'Ping Monitoring', desc: 'Check server connectivity and latency across your infrastructure with real-time network diagnostics.' },
        { icon: <Server size={32} color="#9B59B6" />, title: 'Port Monitoring', desc: 'Verify specific ports are open and responsive to ensure your services are accessible.' },
        { icon: <Search size={32} color="#F39C12" />, title: 'DNS Monitoring', desc: 'Track DNS record changes and resolution times to prevent configuration issues.' },
        { icon: <Lock size={32} color="#E74C3C" />, title: 'SSL Certificate Monitoring', desc: 'Get alerts before certificates expire and ensure your sites remain secure and trusted.' },
        { icon: <Eye size={32} color="#1ABC9C" />, title: 'Keyword Monitoring', desc: 'Detect content changes on your pages and monitor for specific keywords or phrases.' },
        { icon: <MapPin size={32} color="#E67E22" />, title: 'Multi-Location Checks', desc: 'Global monitoring from 15+ locations to eliminate false positives and ensure accuracy.' },
        { icon: <Bell size={32} color="#3498DB" />, title: 'Custom Alerts', desc: 'Flexible notification rules and escalation policies tailored to your team\'s workflow.' }
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#0f172a', color: '#fff', overflowX: 'hidden' }}>
            <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, backgroundImage: 'radial-gradient(circle at center, #2ECC71 0%, transparent 50%)', backgroundSize: '150% 150%', zIndex: 0, pointerEvents: 'none' }} />

            <LandingNavbar />

            <Container maxWidth="lg" sx={{ pt: { xs: 12, md: 20 }, pb: { xs: 6, md: 15 }, position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <Typography variant="h1" sx={{color: '#ffffff', fontSize: { xs: '3rem', md: '5rem' }, fontWeight: 900, lineHeight: 1.1, mb: 3 }}>
                        Monitor Everything.<br />
                        <Box component="span" sx={{ color: '#2ECC71' }}>Miss Nothing.</Box>
                    </Typography>
                    <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: '800px', mx: 'auto', mb: 6, fontWeight: 400 }}>
                        The ultimate infrastructure monitoring platform for your servers, websites, and APIs. Get real-time alerts and brilliant analytics instantly.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
                        {isAuthenticated ? (
                            <Button variant="contained" size="large" onClick={() => navigate('/dashboard')} endIcon={<ArrowRight />} sx={{ bgcolor: '#2ECC71', px: 5, py: 2, fontSize: '1.1rem', fontWeight: 700, borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(46, 204, 113, 0.4)', '&:hover': { bgcolor: '#27ae60', transform: 'translateY(-2px)' }, transition: 'all 0.3s' }}>Go to Dashboard</Button>
                        ) : (
                            <>
                                <Button variant="contained" size="large" onClick={() => navigate('/signup')} endIcon={<ArrowRight />} sx={{ bgcolor: '#2ECC71', px: 5, py: 2, fontSize: '1.1rem', fontWeight: 700, borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(46, 204, 113, 0.4)', '&:hover': { bgcolor: '#27ae60', transform: 'translateY(-2px)' }, transition: 'all 0.3s' }}>Start Monitoring Free</Button>
                                {/* <Button variant="outlined" size="large" onClick={() => navigate('/login')} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)', px: 5, py: 2, fontSize: '1.1rem', fontWeight: 700, borderRadius: '12px', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.05)' } }}>Admin Dashboard</Button> */}
                            </>
                        )}
                    </Box>
                </motion.div>

                {/* Stats Bar */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} style={{ marginTop: '60px' }}>
                    <Grid container spacing={3}>
                        {[
                            { icon: <Zap size={28} color="#2ECC71" />, value: '12ms', label: 'Avg Response Time' },
                            { icon: <Monitor size={28} color="#3498DB" />, value: '10,000+', label: 'Monitors Tracked' },
                            { icon: <Globe size={28} color="#F39C12" />, value: '15+', label: 'Global Locations' },
                            { icon: <TrendingUp size={28} color="#9B59B6" />, value: '99.9%', label: 'Uptime' }
                        ].map((stat, idx) => (
                            <Grid size={{ xs: 6, md: 3 }} key={idx}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.6 + idx * 0.1 }}
                                >
                                    <Box sx={{
                                        p: 3,
                                        bgcolor: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '16px',
                                        backdropFilter: 'blur(10px)',
                                        textAlign: 'center',
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(46, 204, 113, 0.2)',
                                            transform: 'translateY(-5px)'
                                        }
                                    }}>
                                        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>{stat.icon}</Box>
                                        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mb: 0.5 }}>{stat.value}</Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>{stat.label}</Typography>
                                    </Box>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} style={{ marginTop: '80px' }}>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', p: { xs: 2, md: 5 }, backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', position: 'relative' }}>
                        <Typography variant="h5" sx={{color: '#ffffff', fontWeight: 800, textAlign: 'left', mb: 1 }}>Live Response Metrics (google.com)</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'left', mb: 4 }}>Visualizing API endpoint response times across the global CDN network.</Typography>
                        <Box sx={{ height: 400, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#2ECC71" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" />
                                    <YAxis stroke="rgba(255,255,255,0.3)" />
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                    <Area type="monotone" dataKey="responseTime" stroke="#2ECC71" strokeWidth={3} fillOpacity={1} fill="url(#colorResponse)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </Box>
                </motion.div>
            </Container>

            {/* How It Works Section */}
            <Box sx={{ py: { xs: 6, md: 15 }, position: 'relative', zIndex: 1 }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
                        <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 800, mb: 2 }}>How It Works</Typography>
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)' }}>Get started in three simple steps</Typography>
                    </Box>
                    <Grid container spacing={6}>
                        {[
                            { icon: <Plus size={40} color="#2ECC71" />, step: '01', title: 'Add Your Monitors', desc: 'Set up monitoring for your websites, APIs, and servers in just 30 seconds. No complex configuration required.' },
                            { icon: <Activity size={40} color="#3498DB" />, step: '02', title: 'We Check Continuously', desc: 'Our global network monitors your services 24/7 from multiple locations, ensuring accuracy and reliability.' },
                            { icon: <Bell size={40} color="#F39C12" />, step: '03', title: 'Get Instant Alerts', desc: 'Receive immediate notifications via Email, SMS, Slack, or your preferred channel when issues are detected.' }
                        ].map((item, idx) => (
                            <Grid size={{ xs: 12, md: 4 }} key={idx}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: idx * 0.15 }}
                                    viewport={{ once: true }}
                                >
                                    <Box sx={{
                                        p: 5,
                                        bgcolor: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '24px',
                                        textAlign: 'center',
                                        position: 'relative',
                                        transition: 'all 0.3s',
                                        height: '100%',
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(46, 204, 113, 0.2)',
                                            transform: 'translateY(-8px)'
                                        }
                                    }}>
                                        <Typography variant="h2" sx={{
                                            position: 'absolute',
                                            top: 20,
                                            right: 30,
                                            color: 'rgba(255,255,255,0.05)',
                                            fontWeight: 900,
                                            fontSize: '5rem'
                                        }}>{item.step}</Typography>
                                        <Box sx={{
                                            mb: 3,
                                            p: 3,
                                            bgcolor: 'rgba(0,0,0,0.3)',
                                            display: 'inline-flex',
                                            borderRadius: '20px'
                                        }}>{item.icon}</Box>
                                        <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 700, mb: 2 }}>{item.title}</Typography>
                                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{item.desc}</Typography>
                                    </Box>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', py: { xs: 6, md: 15 }, position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
                        <Typography variant="h3" sx={{color: '#ffffff', fontWeight: 800, mb: 2 }}>Comprehensive Monitoring Solutions</Typography>
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)' }}>Everything you need to keep your infrastructure online and performing optimally.</Typography>
                    </Box>
                    <Grid container spacing={4}>
                        {features.map((feature, idx) => (
                            <Grid size={{ xs: 12, md: 6 }} key={idx}>
                                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.1 }} viewport={{ once: true }}>
                                    <Box sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', transform: 'translateY(-5px)', border: '1px solid rgba(46, 204, 113, 0.2)' } }}>
                                        <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(0,0,0,0.3)', display: 'inline-flex', borderRadius: '16px' }}>{feature.icon}</Box>
                                        <Typography variant="h5" sx={{color: '#ffffff', fontWeight: 700, mb: 2 }}>{feature.title}</Typography>
                                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{feature.desc}</Typography>
                                    </Box>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Integration Showcase */}
            <Box sx={{ py: { xs: 6, md: 15 }, position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
                        <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 800, mb: 2 }}>Connect Your Favorite Tools</Typography>
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)' }}>Get instant alerts through multiple notification channels</Typography>
                    </Box>
                    <Grid container spacing={4}>
                        {[
                            { icon: <Mail size={32} />, color: '#E74C3C', title: 'Email', desc: 'Detailed incident reports delivered to your inbox with customizable templates.' },
                            { icon: <MessageSquare size={32} />, color: '#00A4EF', title: 'SMS', desc: 'Critical alerts sent directly to your phone for immediate attention.' },
                            { icon: <MessageSquare size={32} />, color: '#611F69', title: 'Slack', desc: 'Real-time notifications in your team channels with rich formatting.' },
                            { icon: <Send size={32} />, color: '#0088CC', title: 'Telegram', desc: 'Instant messaging alerts with bot integration for quick responses.' },
                            { icon: <Cloud size={32} />, color: '#2ECC71', title: 'Webhooks', desc: 'Custom integrations with your existing tools and workflows.' },
                            { icon: <Bell size={32} />, color: '#F39C12', title: 'Push Notifications', desc: 'Mobile and desktop push alerts for on-the-go monitoring.' }
                        ].map((integration, idx) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                                    viewport={{ once: true }}
                                >
                                    <Box sx={{
                                        p: 4,
                                        bgcolor: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '20px',
                                        textAlign: 'center',
                                        transition: 'all 0.3s',
                                        height: '100%',
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.04)',
                                            border: `1px solid ${integration.color}40`,
                                            transform: 'translateY(-5px)',
                                            boxShadow: `0 10px 30px ${integration.color}20`
                                        }
                                    }}>
                                        <Box sx={{
                                            mb: 2,
                                            p: 2.5,
                                            bgcolor: `${integration.color}20`,
                                            display: 'inline-flex',
                                            borderRadius: '16px',
                                            color: integration.color
                                        }}>{integration.icon}</Box>
                                        <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, mb: 1.5 }}>{integration.title}</Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{integration.desc}</Typography>
                                    </Box>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Trust Metrics Section */}
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', py: { xs: 6, md: 15 }, position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
                        <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 800, mb: 2 }}>Trusted by Thousands Worldwide</Typography>
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)' }}>Join our growing community of satisfied users</Typography>
                    </Box>
                    <Grid container spacing={4}>
                        {[
                            { icon: <Monitor size={40} color="#2ECC71" />, value: '10,000+', label: 'Total Monitors Tracked', color: '#2ECC71' },
                            { icon: <TrendingUp size={40} color="#3498DB" />, value: '99.9%', label: 'Average Uptime', color: '#3498DB' },
                            { icon: <Globe size={40} color="#F39C12" />, value: '15+', label: 'Global Monitoring Locations', color: '#F39C12' },
                            { icon: <Users size={40} color="#9B59B6" />, value: '50+', label: 'Countries Served', color: '#9B59B6' }
                        ].map((metric, idx) => (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: idx * 0.12 }}
                                    viewport={{ once: true }}
                                >
                                    <Box sx={{
                                        p: 5,
                                        bgcolor: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '24px',
                                        textAlign: 'center',
                                        transition: 'all 0.3s',
                                        height: '100%',
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.05)',
                                            border: `1px solid ${metric.color}40`,
                                            transform: 'translateY(-8px)',
                                            boxShadow: `0 15px 35px ${metric.color}20`
                                        }
                                    }}>
                                        <Box sx={{
                                            mb: 3,
                                            p: 2.5,
                                            bgcolor: `${metric.color}15`,
                                            display: 'inline-flex',
                                            borderRadius: '18px'
                                        }}>{metric.icon}</Box>
                                        <Typography variant="h3" sx={{ color: metric.color, fontWeight: 900, mb: 1 }}>{metric.value}</Typography>
                                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{metric.label}</Typography>
                                    </Box>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            <Box sx={{ py: { xs: 6, md: 15 }, position: 'relative', zIndex: 1 }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 8 } }}>
                        <Typography variant="h3" sx={{color: '#ffffff', fontWeight: 800, mb: 2 }}>Free Public Utilities</Typography>
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)' }}>Try our network diagnostic tools without an account.</Typography>
                    </Box>
                    <PublicToolsUI />
                </Container>
            </Box>

            {/* FAQ Section */}
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', py: { xs: 6, md: 15 }, position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Container maxWidth="md">
                    <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 8 } }}>
                        <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 800, mb: 2 }}>Frequently Asked Questions</Typography>
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)' }}>Everything you need to know about our monitoring platform</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {[
                            {
                                question: 'How does uptime monitoring work?',
                                answer: 'Our platform performs automated checks on your websites, servers, and APIs at regular intervals. If any check fails, you\'re immediately notified through your preferred channels.'
                            },
                            {
                                question: 'What happens when a monitor fails?',
                                answer: 'When a monitor detects downtime, we send instant alerts via Email, SMS, Slack, or other configured channels. You\'ll receive detailed incident information to help diagnose the issue quickly.'
                            },
                            {
                                question: 'How often are checks performed?',
                                answer: 'Check intervals range from 30 seconds to 5 minutes depending on your plan. Enterprise customers can configure custom intervals as low as 10 seconds.'
                            },
                            {
                                question: 'Can I monitor multiple websites?',
                                answer: 'Yes! You can monitor unlimited websites, APIs, servers, and ports. Each monitor can be configured independently with different check intervals and alert settings.'
                            },
                            {
                                question: 'What notification methods are available?',
                                answer: 'We support Email, SMS, Push notifications, Slack, Telegram, Discord, and custom webhooks. You can configure multiple notification channels for redundancy.'
                            },
                            {
                                question: 'How accurate is the monitoring?',
                                answer: 'We use distributed monitoring from 15+ global locations to eliminate false positives. A site is only marked as down when multiple locations confirm the outage.'
                            },
                            {
                                question: 'Can I integrate with my existing tools?',
                                answer: 'Absolutely! We support webhooks for custom integrations, plus native integrations with Slack, Telegram, Discord, and popular incident management platforms.'
                            },
                            {
                                question: 'What types of monitoring do you support?',
                                answer: 'HTTP/HTTPS website monitoring, Ping monitoring, Port monitoring, DNS record checks, SSL certificate monitoring, and keyword monitoring. All available in one platform.'
                            }
                        ].map((faq, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: idx * 0.05 }}
                                viewport={{ once: true }}
                            >
                                <Accordion
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '16px !important',
                                        '&:before': { display: 'none' },
                                        '&.Mui-expanded': {
                                            bgcolor: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(46, 204, 113, 0.2)'
                                        },
                                        mb: 0
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ChevronDown size={20} color="#2ECC71" />}
                                        sx={{
                                            px: 3,
                                            py: 1.5,
                                            '& .MuiAccordionSummary-content': { my: 2 }
                                        }}
                                    >
                                        <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700 }}>{faq.question}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ px: 3, pb: 3 }}>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>{faq.answer}</Typography>
                                    </AccordionDetails>
                                </Accordion>
                            </motion.div>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* Final CTA Banner */}
            <Box sx={{ py: { xs: 3, md: 15 }, position: 'relative', zIndex: 1, overflow: 'hidden' }}>
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at center, rgba(46, 204, 113, 0.1) 0%, transparent 70%)',
                    zIndex: 0
                }} />
                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <Box sx={{
                            bgcolor: 'rgba(255,255,255,0.03)',
                            border: '2px solid rgba(46, 204, 113, 0.2)',
                            borderRadius: '32px',
                            p: { xs: 5, md: 8 },
                            textAlign: 'center',
                            backdropFilter: 'blur(20px)'
                        }}>
                            <Typography variant="h2" sx={{ color: '#ffffff', fontWeight: 900, mb: 3, fontSize: { xs: '2rem', md: '3.5rem' } }}>
                                Ready to Ensure 100% Uptime?
                            </Typography>
                            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 5, maxWidth: '600px', mx: 'auto' }}>
                                Join thousands of businesses monitoring their infrastructure with confidence. Start in 30 seconds, no credit card required.
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/signup')}
                                endIcon={<ArrowRight />}
                                sx={{
                                    bgcolor: '#2ECC71',
                                    px: 4,
                                    py: 2.5,
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    borderRadius: '16px',
                                    boxShadow: '0 15px 35px rgba(46, 204, 113, 0.4)',
                                    '&:hover': {
                                        bgcolor: '#27ae60',
                                        transform: 'translateY(-3px)',
                                        boxShadow: '0 20px 40px rgba(46, 204, 113, 0.5)'
                                    },
                                    transition: 'all 0.3s'
                                }}
                            >
                                Start Monitoring Free
                            </Button>
                        </Box>
                    </motion.div>
                </Container>
            </Box>

            <Box sx={{ py: 6, px:1, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                    © {new Date().getFullYear()} Lease Packet Tools. {' '}
                </Typography>
            </Box>
        </Box>
    );
};

export default LandingPage;
