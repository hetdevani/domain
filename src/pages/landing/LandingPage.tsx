import React, { useState } from 'react';
import {
    Box, Typography, Button, Container, AppBar, Toolbar,
    Tabs, Tab, TextField, Paper, CircularProgress, Grid
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Activity, Globe, Bell, Server, ArrowRight,
    Search, Wifi, Lock, MapPin, User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
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

const DNSResultViewer: React.FC<{ data: any }> = ({ data }) => {
    const recordTypes = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME'];

    return (
        <Grid container spacing={2}>
            {recordTypes.map((type) => (
                <Grid size={{ xs: 12 }} key={type}>
                    <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Typography variant="overline" sx={{ color: '#2ECC71', fontWeight: 700, mb: 1, display: 'block' }}>
                            {type} Records
                        </Typography>
                        {data[type] && data[type].length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {data[type].map((record: any, idx: number) => (
                                    <Box key={idx} sx={{
                                        p: 1.5,
                                        bgcolor: 'rgba(0,0,0,0.2)',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: 2
                                    }}>
                                        <Typography sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                            {record.address || record.data || record.ns || record.name ||
                                                (record.exchange ? `${record.priority} ${record.exchange}` : JSON.stringify(record))}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
                                            TTL: {record.ttl}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
                                No {type} records found.
                            </Typography>
                        )}
                    </Box>
                </Grid>
            ))}
        </Grid>
    );
};

const IPResultViewer: React.FC<{ data: any }> = ({ data }) => {
    const infoItems = [
        { label: 'IP Address', value: data.query },
        { label: 'Location', value: `${data.city}, ${data.regionName}, ${data.country}` },
        { label: 'ISP', value: data.isp },
        { label: 'Organization', value: data.org },
        { label: 'AS', value: data.as },
        { label: 'Timezone', value: data.timezone },
        { label: 'Coordinates', value: `${data.lat}, ${data.lon}` },
    ];

    return (
        <Grid container spacing={2}>
            {infoItems.map((item, idx) => (
                <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                    <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 0.5, display: 'block' }}>
                            {item.label}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.value || 'N/A'}
                        </Typography>
                    </Box>
                </Grid>
            ))}
        </Grid>
    );
};

const SSLResultViewer: React.FC<{ data: any }> = ({ data }) => {
    const infoItems = [
        { label: 'Days Remaining', value: `${data.days_remaining} days`, color: data.days_remaining < 30 ? '#E74C3C' : '#2ECC71' },
        { label: 'Valid From', value: new Date(data.valid_from).toLocaleDateString() },
        { label: 'Valid To', value: new Date(data.valid_to).toLocaleDateString() },
        { label: 'Issuer', value: data.issuer?.O || data.issuer?.CN },
        { label: 'Subject', value: data.subject?.CN },
    ];

    return (
        <Grid container spacing={2}>
            {infoItems.map((item, idx) => (
                <Grid size={{ xs: 12 }} key={idx}>
                    <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 0.5, display: 'block' }}>
                            {item.label}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: (item as any).color || '#fff' }}>
                            {item.value || 'N/A'}
                        </Typography>
                    </Box>
                </Grid>
            ))}
        </Grid>
    );
};

const PingResultViewer: React.FC<{ data: any }> = ({ data }) => (
    <Box sx={{
        p: 2,
        bgcolor: 'rgba(0,0,0,0.4)',
        borderRadius: '12px',
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        whiteSpace: 'pre-wrap',
        border: '1px solid rgba(255,255,255,0.05)',
        color: '#2ECC71'
    }}>
        {data.output}
    </Box>
);

const WhoisResultViewer: React.FC<{ data: any }> = ({ data }) => {
    // RDAP responses are complex, we'll extract key information
    const entities = data.entities?.map((e: any) => e.vcardArray?.[1]?.[2]?.[3]).filter(Boolean).join(', ');
    const events = data.events?.map((e: any) => ({
        action: e.eventAction,
        date: new Date(e.eventDate).toLocaleDateString()
    })) || [];

    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
                <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Typography variant="overline" sx={{ color: '#2ECC71', fontWeight: 700, mb: 1, display: 'block' }}>Registration Details</Typography>
                    <Typography variant="body2"><strong>Domain Name:</strong> {data.ldhName}</Typography>
                    <Typography variant="body2"><strong>Status:</strong> {data.status?.join(', ')}</Typography>
                    <Typography variant="body2"><strong>Entities:</strong> {entities || 'N/A'}</Typography>
                </Box>
            </Grid>
            {events.map((event: any, idx: number) => (
                <Grid size={{ xs: 12, sm: 4 }} key={idx}>
                    <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block' }}>{event.action}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{event.date}</Typography>
                    </Box>
                </Grid>
            ))}
            <Grid size={{ xs: 12 }}>
                <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Typography variant="overline" sx={{ color: '#2ECC71', fontWeight: 700, mb: 1, display: 'block' }}>Raw RDAP Data</Typography>
                    <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', p: 1, borderRadius: '8px', maxHeight: 200, overflow: 'auto' }}>
                        <pre style={{ fontSize: '0.75rem', margin: 0 }}>{JSON.stringify(data, null, 2)}</pre>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
};

const PublicToolsUI: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const tools = [
        { name: 'DNS Lookup', icon: <Search size={20} />, endpoint: '/dns-lookup', field: 'domain', placeholder: 'example.com' },
        { name: 'IP Info', icon: <MapPin size={20} />, endpoint: '/ip-intelligence', field: 'ip', placeholder: '8.8.8.8' },
        { name: 'SSL Check', icon: <Lock size={20} />, endpoint: '/ssl-check', field: 'hostname', placeholder: 'google.com' },
        { name: 'WHOIS', icon: <Globe size={20} />, endpoint: '/whois', field: 'domain', placeholder: 'google.com' },
        { name: 'Ping', icon: <Wifi size={20} />, endpoint: '/ping', field: 'host', placeholder: '1.1.1.1' },
    ];

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
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '24px',
            p: 4,
            backdropFilter: 'blur(10px)'
        }}>
            <Tabs
                value={activeTab}
                onChange={(_, v) => { setActiveTab(v); setInputValue(''); setResult(null); setError(null); }}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                    mb: 4,
                    '& .MuiTabs-indicator': { bgcolor: '#2ECC71' },
                    '& .MuiTab-root': {
                        color: 'rgba(255,255,255,0.5)',
                        minHeight: '64px',
                        '&.Mui-selected': { color: '#fff' }
                    }
                }}
            >
                {tools.map((tool, i) => (
                    <Tab key={i} icon={tool.icon} iconPosition="start" label={tool.name} sx={{ fontSize: '0.9rem', textTransform: 'none' }} />
                ))}
            </Tabs>

            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder={tools[activeTab].placeholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleRunTool()}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            color: '#fff',
                            bgcolor: 'rgba(0,0,0,0.2)',
                            borderRadius: '12px',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                            '&.Mui-focused fieldset': { borderColor: '#2ECC71' },
                        }
                    }}
                />
                <Button
                    variant="contained"
                    onClick={handleRunTool}
                    disabled={loading || !inputValue}
                    sx={{
                        bgcolor: '#2ECC71',
                        px: { xs: 2, sm: 4 },
                        minWidth: { xs: '100%', sm: '120px' },
                        borderRadius: '12px',
                        '&:hover': { bgcolor: '#27ae60' }
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Run Analysis'}
                </Button>
            </Box>

            <AnimatePresence mode="wait">
                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
                    </motion.div>
                )}
                {result && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Box sx={{
                            p: 1,
                            borderRadius: '12px',
                            maxHeight: 600,
                            overflow: 'auto',
                            textAlign: 'left'
                        }}>
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
        { icon: <Activity size={32} color="#2ECC71" />, title: 'Real-time Uptime Monitoring', desc: 'Track your servers and APIs with precise HTTP, Ping, and Port checks.' },
        { icon: <Bell size={32} color="#F39C12" />, title: 'Instant Incident Alerts', desc: 'Get notified immediately via Email, SMS, and Push when a monitor goes down.' },
        { icon: <Globe size={32} color="#3498DB" />, title: 'Global Public Tools', desc: 'DNS Lookups, IP Intelligence, and SSL Certificate tracking all from one dashboard.' },
        { icon: <Server size={32} color="#9B59B6" />, title: 'Advanced Analytics', desc: 'Detailed response time charts and global outage monitoring.' }
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#0f172a', color: '#fff', overflowX: 'hidden' }}>
            <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, backgroundImage: 'radial-gradient(circle at center, #2ECC71 0%, transparent 50%)', backgroundSize: '150% 150%', zIndex: 0, pointerEvents: 'none' }} />

            <AppBar position="fixed" elevation={0} sx={{ bgcolor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.1)', zIndex: 10 }}>
                <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <img src="/logo.png" alt="Logo" style={{ height: 40 }} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {isAuthenticated ? (
                            <Button variant="outlined" onClick={() => navigate('/dashboard')} startIcon={<User size={18} />} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', px: 3, borderRadius: '8px', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>Profile</Button>
                        ) : (
                            <>
                                <Button variant="outlined" onClick={() => navigate('/login')} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', px: 3, borderRadius: '8px', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>Log In</Button>
                                <Button variant="contained" onClick={() => navigate('/signup')} sx={{ bgcolor: '#2ECC71', px: 3, borderRadius: '8px', boxShadow: '0 4px 14px 0 rgba(46, 204, 113, 0.39)', '&:hover': { bgcolor: '#27ae60' } }}>Register</Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ pt: 20, pb: 15, position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <Typography variant="h1" sx={{ fontSize: { xs: '3rem', md: '5rem' }, fontWeight: 900, lineHeight: 1.1, mb: 3 }}>
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
                                <Button variant="outlined" size="large" onClick={() => navigate('/login')} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)', px: 5, py: 2, fontSize: '1.1rem', fontWeight: 700, borderRadius: '12px', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.05)' } }}>Admin Dashboard</Button>
                            </>
                        )}
                    </Box>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} style={{ marginTop: '80px' }}>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', p: { xs: 2, md: 5 }, backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', position: 'relative' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, textAlign: 'left', mb: 1 }}>Live Response Metrics (Example.com)</Typography>
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

            <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', py: 15, position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 10 }}>
                        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>Powerful Analytics Array</Typography>
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)' }}>Everything you need to keep your infrastructure online.</Typography>
                    </Box>
                    <Grid container spacing={4}>
                        {features.map((feature, idx) => (
                            <Grid size={{ xs: 12, md: 6 }} key={idx}>
                                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.1 }} viewport={{ once: true }}>
                                    <Box sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', transform: 'translateY(-5px)', border: '1px solid rgba(46, 204, 113, 0.2)' } }}>
                                        <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(0,0,0,0.3)', display: 'inline-flex', borderRadius: '16px' }}>{feature.icon}</Box>
                                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>{feature.title}</Typography>
                                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{feature.desc}</Typography>
                                    </Box>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            <Box sx={{ py: 15, position: 'relative', zIndex: 1 }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>Free Public Utilities</Typography>
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)' }}>Try our network diagnostic tools without an account.</Typography>
                    </Box>
                    <PublicToolsUI />
                </Container>
            </Box>

            <Box sx={{ py: 6, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>© {new Date().getFullYear()} Lease Packet Pool. Powered by Sadhguru Infotech.</Typography>
            </Box>
        </Box>
    );
};

export default LandingPage;
