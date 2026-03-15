import React from 'react';
import { Box, Typography, Button, Container, Grid, Accordion, AccordionSummary, AccordionDetails, Chip } from '@mui/material';
import SEOHead from '../../components/seo/SEOHead';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Activity, Globe, Bell, Server, ArrowRight,
    Search, Wifi, Lock, MapPin,
    Zap, Mail, MessageSquare, Send,
    Cloud, ChevronDown, Plus, Eye, Monitor,
    Users, TrendingUp, CheckCircle
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

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const features = [
        { icon: <Globe size={28} color="#2ECC71" />, bg: 'rgba(46,204,113,0.1)', title: 'HTTP/HTTPS Monitoring', desc: 'Monitor website uptime and response times with detailed performance metrics and status code tracking.' },
        { icon: <Wifi size={28} color="#3498DB" />, bg: 'rgba(52,152,219,0.1)', title: 'Ping Monitoring', desc: 'Check server connectivity and latency across your infrastructure with real-time network diagnostics.' },
        { icon: <Server size={28} color="#9B59B6" />, bg: 'rgba(155,89,182,0.1)', title: 'Port Monitoring', desc: 'Verify specific ports are open and responsive to ensure your services are accessible.' },
        { icon: <Search size={28} color="#F39C12" />, bg: 'rgba(243,156,18,0.1)', title: 'DNS Monitoring', desc: 'Track DNS record changes and resolution times to prevent configuration issues.' },
        { icon: <Lock size={28} color="#E74C3C" />, bg: 'rgba(231,76,60,0.1)', title: 'SSL Certificate Monitoring', desc: 'Get alerts before certificates expire and ensure your sites remain secure and trusted.' },
        { icon: <Eye size={28} color="#1ABC9C" />, bg: 'rgba(26,188,156,0.1)', title: 'Keyword Monitoring', desc: 'Detect content changes on your pages and monitor for specific keywords or phrases.' },
        { icon: <MapPin size={28} color="#E67E22" />, bg: 'rgba(230,126,34,0.1)', title: 'Multi-Location Checks', desc: 'Global monitoring from 15+ locations to eliminate false positives and ensure accuracy.' },
        { icon: <Bell size={28} color="#3498DB" />, bg: 'rgba(52,152,219,0.1)', title: 'Custom Alerts', desc: 'Flexible notification rules and escalation policies tailored to your team\'s workflow.' }
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', color: '#1e293b', overflowX: 'hidden' }}>
            <SEOHead
                title="Lease Packet Tools — Free Website Monitoring Services"
                description="Free online tools for developers and SEO professionals. DNS lookup, page speed analysis, IP intelligence, domain monitoring, SMTP testing and more. Monitor everything, miss nothing."
                keywords="website monitoring, uptime monitoring, dns tools, seo tools, developer tools, page speed test, domain monitoring, ip lookup, sitemap checker"
                canonical="/"
                ogType="website"
                schema={{
                    '@context': 'https://schema.org',
                    '@type': 'WebApplication',
                    'name': 'Lease Packet Tools',
                    'url': 'https://tools.leasepacket.com',
                    'description': 'Free online tools for developers and SEO professionals.',
                    'applicationCategory': 'DeveloperApplication',
                    'operatingSystem': 'Any',
                    'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' }
                }}
            />
            <LandingNavbar />

            {/* Hero Section */}
            <Box sx={{ background: 'linear-gradient(180deg, rgba(46,204,113,0.06) 0%, rgba(255,255,255,0) 60%)', pt: { xs: 12, md: 18 }, pb: { xs: 6, md: 12 }, px: 2 }}>
                <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <Chip
                            label="Trusted by 10,000+ monitors worldwide"
                            icon={<CheckCircle size={14} color="#2ECC71" />}
                            sx={{ mb: 3, bgcolor: 'rgba(46,204,113,0.1)', color: '#16a34a', border: '1px solid rgba(46,204,113,0.25)', fontWeight: 600, px: 1 }}
                        />
                        <Typography variant="h1" sx={{ color: '#0f172a', fontSize: { xs: '2.6rem', md: '4.5rem' }, fontWeight: 900, lineHeight: 1.1, mb: 3, letterSpacing: '-0.02em' }}>
                            Monitor Everything.<br />
                            <Box component="span" sx={{ color: '#2ECC71' }}>Miss Nothing.</Box>
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#64748b', maxWidth: 700, mx: 'auto', mb: 5, fontWeight: 400, lineHeight: 1.7, fontSize: { xs: '1rem', md: '1.15rem' } }}>
                            The ultimate infrastructure monitoring platform for your servers, websites, and APIs. Get real-time alerts and brilliant analytics instantly.
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                            {isAuthenticated ? (
                                <Button variant="contained" size="large" onClick={() => navigate('/dashboard')} endIcon={<ArrowRight size={18} />}
                                    sx={{ bgcolor: '#2ECC71', px: 5, py: 1.8, fontSize: '1rem', fontWeight: 700, borderRadius: '12px', boxShadow: '0 8px 24px rgba(46,204,113,0.35)', '&:hover': { bgcolor: '#27ae60', transform: 'translateY(-2px)', boxShadow: '0 12px 28px rgba(46,204,113,0.4)' }, transition: 'all 0.2s' }}>
                                    Go to Dashboard
                                </Button>
                            ) : (
                                <>
                                    <Button variant="contained" size="large" onClick={() => navigate('/signup')} endIcon={<ArrowRight size={18} />}
                                        sx={{ bgcolor: '#2ECC71', px: 5, py: 1.8, fontSize: '1rem', fontWeight: 700, borderRadius: '12px', boxShadow: '0 8px 24px rgba(46,204,113,0.35)', '&:hover': { bgcolor: '#27ae60', transform: 'translateY(-2px)', boxShadow: '0 12px 28px rgba(46,204,113,0.4)' }, transition: 'all 0.2s' }}>
                                        Start Monitoring Free
                                    </Button>
                                    <Button variant="outlined" size="large" onClick={() => navigate('/login')}
                                        sx={{ color: '#334155', borderColor: '#e2e8f0', px: 4, py: 1.8, fontSize: '1rem', fontWeight: 600, borderRadius: '12px', '&:hover': { borderColor: '#2ECC71', color: '#2ECC71', bgcolor: 'rgba(46,204,113,0.04)' }, transition: 'all 0.2s' }}>
                                        Sign In
                                    </Button>
                                </>
                            )}
                        </Box>
                    </motion.div>

                    {/* Stats Bar */}
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} style={{ marginTop: '56px' }}>
                        <Grid container spacing={3}>
                            {[
                                { icon: <Zap size={24} color="#2ECC71" />, value: '12ms', label: 'Avg Response Time', color: '#2ECC71' },
                                { icon: <Monitor size={24} color="#3498DB" />, value: '10,000+', label: 'Monitors Tracked', color: '#3498DB' },
                                { icon: <Globe size={24} color="#F39C12" />, value: '15+', label: 'Global Locations', color: '#F39C12' },
                                { icon: <TrendingUp size={24} color="#9B59B6" />, value: '99.9%', label: 'Uptime', color: '#9B59B6' }
                            ].map((stat, idx) => (
                                <Grid size={{ xs: 6, md: 3 }} key={idx}>
                                    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}>
                                        <Box sx={{ p: 3, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', transition: 'all 0.2s', '&:hover': { border: `1px solid ${stat.color}40`, boxShadow: `0 8px 24px ${stat.color}15`, transform: 'translateY(-4px)' } }}>
                                            <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center', p: 1.2, bgcolor: `${stat.color}12`, borderRadius: '10px', width: 'fit-content', mx: 'auto' }}>{stat.icon}</Box>
                                            <Typography variant="h4" sx={{ color: '#0f172a', fontWeight: 800, mb: 0.5, fontSize: { xs: '1.6rem', md: '2rem' } }}>{stat.value}</Typography>
                                            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 500 }}>{stat.label}</Typography>
                                        </Box>
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>
                    </motion.div>

                    {/* Chart */}
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} style={{ marginTop: '60px' }}>
                        <Box sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', p: { xs: 3, md: 5 }, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                                <Box sx={{ textAlign: 'left' }}>
                                    <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 800, mb: 0.5 }}>Live Response Metrics — google.com</Typography>
                                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>Visualizing API endpoint response times across the global CDN network</Typography>
                                </Box>
                                <Chip label="● Live" size="small" sx={{ bgcolor: 'rgba(46,204,113,0.1)', color: '#16a34a', border: '1px solid rgba(46,204,113,0.2)', fontWeight: 700, fontSize: '0.75rem' }} />
                            </Box>
                            <Box sx={{ height: 320, width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#2ECC71" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="time" stroke="#cbd5e1" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <YAxis stroke="#cbd5e1" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} labelStyle={{ color: '#334155', fontWeight: 600 }} itemStyle={{ color: '#2ECC71' }} />
                                        <Area type="monotone" dataKey="responseTime" stroke="#2ECC71" strokeWidth={2.5} fillOpacity={1} fill="url(#colorResponse)" dot={false} activeDot={{ r: 5, fill: '#2ECC71', strokeWidth: 0 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </Box>
                    </motion.div>
                </Container>
            </Box>

            {/* How It Works */}
            <Box sx={{ bgcolor: '#f8fafc', py: { xs: 8, md: 14 }, borderTop: '1px solid #f1f5f9' }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
                        <Typography variant="overline" sx={{ color: '#2ECC71', fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.8rem' }}>Simple Setup</Typography>
                        <Typography variant="h3" sx={{ color: '#0f172a', fontWeight: 800, mt: 1, mb: 2, fontSize: { xs: '1.9rem', md: '2.6rem' } }}>How It Works</Typography>
                        <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 400, fontSize: '1rem' }}>Get started in three simple steps</Typography>
                    </Box>
                    <Grid container spacing={4}>
                        {[
                            { icon: <Plus size={36} color="#2ECC71" />, bg: 'rgba(46,204,113,0.1)', step: '01', title: 'Add Your Monitors', desc: 'Set up monitoring for your websites, APIs, and servers in just 30 seconds. No complex configuration required.' },
                            { icon: <Activity size={36} color="#3498DB" />, bg: 'rgba(52,152,219,0.1)', step: '02', title: 'We Check Continuously', desc: 'Our global network monitors your services 24/7 from multiple locations, ensuring accuracy and reliability.' },
                            { icon: <Bell size={36} color="#F39C12" />, bg: 'rgba(243,156,18,0.1)', step: '03', title: 'Get Instant Alerts', desc: 'Receive immediate notifications via Email, SMS, Slack, or your preferred channel when issues are detected.' }
                        ].map((item, idx) => (
                            <Grid size={{ xs: 12, md: 4 }} key={idx}>
                                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: idx * 0.15 }} viewport={{ once: true }}>
                                    <Box sx={{ p: 4, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', textAlign: 'center', position: 'relative', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', transition: 'all 0.25s', height: '100%', '&:hover': { border: '1px solid rgba(46,204,113,0.3)', boxShadow: '0 12px 32px rgba(46,204,113,0.1)', transform: 'translateY(-6px)' } }}>
                                        <Typography variant="h2" sx={{ position: 'absolute', top: 16, right: 24, color: '#f1f5f9', fontWeight: 900, fontSize: '4.5rem', lineHeight: 1, userSelect: 'none' }}>{item.step}</Typography>
                                        <Box sx={{ mb: 3, p: 2.5, bgcolor: item.bg, display: 'inline-flex', borderRadius: '16px' }}>{item.icon}</Box>
                                        <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 700, mb: 1.5 }}>{item.title}</Typography>
                                        <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.75 }}>{item.desc}</Typography>
                                    </Box>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Features Grid */}
            <Box sx={{ bgcolor: '#ffffff', py: { xs: 8, md: 14 }, borderTop: '1px solid #f1f5f9' }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
                        <Typography variant="overline" sx={{ color: '#2ECC71', fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.8rem' }}>Full Coverage</Typography>
                        <Typography variant="h3" sx={{ color: '#0f172a', fontWeight: 800, mt: 1, mb: 2, fontSize: { xs: '1.9rem', md: '2.6rem' } }}>Comprehensive Monitoring Solutions</Typography>
                        <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 400, fontSize: '1rem', maxWidth: 600, mx: 'auto' }}>Everything you need to keep your infrastructure online and performing optimally.</Typography>
                    </Box>
                    <Grid container spacing={3}>
                        {features.map((feature, idx) => (
                            <Grid size={{ xs: 12, sm: 6, md: 6 }} key={idx}>
                                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.08 }} viewport={{ once: true }}>
                                    <Box sx={{ p: 3.5, bgcolor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', gap: 2.5, alignItems: 'flex-start', transition: 'all 0.25s', '&:hover': { border: '1px solid rgba(46,204,113,0.3)', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', transform: 'translateY(-3px)' } }}>
                                        <Box sx={{ p: 1.8, bgcolor: feature.bg, borderRadius: '12px', flexShrink: 0, display: 'flex' }}>{feature.icon}</Box>
                                        <Box>
                                            <Typography sx={{ color: '#0f172a', fontWeight: 700, mb: 0.75, fontSize: '0.95rem' }}>{feature.title}</Typography>
                                            <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.7 }}>{feature.desc}</Typography>
                                        </Box>
                                    </Box>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Integrations */}
            <Box sx={{ bgcolor: '#f8fafc', py: { xs: 8, md: 14 }, borderTop: '1px solid #f1f5f9' }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
                        <Typography variant="overline" sx={{ color: '#2ECC71', fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.8rem' }}>Notifications</Typography>
                        <Typography variant="h3" sx={{ color: '#0f172a', fontWeight: 800, mt: 1, mb: 2, fontSize: { xs: '1.9rem', md: '2.6rem' } }}>Connect Your Favorite Tools</Typography>
                        <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 400, fontSize: '1rem' }}>Get instant alerts through multiple notification channels</Typography>
                    </Box>
                    <Grid container spacing={3}>
                        {[
                            { icon: <Mail size={28} />, color: '#E74C3C', title: 'Email', desc: 'Detailed incident reports delivered to your inbox with customizable templates.' },
                            { icon: <MessageSquare size={28} />, color: '#00A4EF', title: 'SMS', desc: 'Critical alerts sent directly to your phone for immediate attention.' },
                            { icon: <MessageSquare size={28} />, color: '#611F69', title: 'Slack', desc: 'Real-time notifications in your team channels with rich formatting.' },
                            { icon: <Send size={28} />, color: '#0088CC', title: 'Telegram', desc: 'Instant messaging alerts with bot integration for quick responses.' },
                            { icon: <Cloud size={28} />, color: '#2ECC71', title: 'Webhooks', desc: 'Custom integrations with your existing tools and workflows.' },
                            { icon: <Bell size={28} />, color: '#F39C12', title: 'Push Notifications', desc: 'Mobile and desktop push alerts for on-the-go monitoring.' }
                        ].map((integration, idx) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: idx * 0.08 }} viewport={{ once: true }}>
                                    <Box sx={{ p: 3.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', transition: 'all 0.25s', height: '100%', '&:hover': { border: `1px solid ${integration.color}40`, boxShadow: `0 10px 28px ${integration.color}15`, transform: 'translateY(-5px)' } }}>
                                        <Box sx={{ mb: 2, p: 2, bgcolor: `${integration.color}12`, display: 'inline-flex', borderRadius: '14px', color: integration.color }}>{integration.icon}</Box>
                                        <Typography sx={{ color: '#0f172a', fontWeight: 700, mb: 1, fontSize: '0.95rem' }}>{integration.title}</Typography>
                                        <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.65 }}>{integration.desc}</Typography>
                                    </Box>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Trust Metrics */}
            <Box sx={{ bgcolor: '#ffffff', py: { xs: 8, md: 14 }, borderTop: '1px solid #f1f5f9' }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
                        <Typography variant="overline" sx={{ color: '#2ECC71', fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.8rem' }}>By the Numbers</Typography>
                        <Typography variant="h3" sx={{ color: '#0f172a', fontWeight: 800, mt: 1, mb: 2, fontSize: { xs: '1.9rem', md: '2.6rem' } }}>Trusted by Thousands Worldwide</Typography>
                        <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 400, fontSize: '1rem' }}>Join our growing community of satisfied users</Typography>
                    </Box>
                    <Grid container spacing={3}>
                        {[
                            { icon: <Monitor size={36} color="#2ECC71" />, value: '10,000+', label: 'Total Monitors Tracked', color: '#2ECC71' },
                            { icon: <TrendingUp size={36} color="#3498DB" />, value: '99.9%', label: 'Average Uptime', color: '#3498DB' },
                            { icon: <Globe size={36} color="#F39C12" />, value: '15+', label: 'Global Monitoring Locations', color: '#F39C12' },
                            { icon: <Users size={36} color="#9B59B6" />, value: '50+', label: 'Countries Served', color: '#9B59B6' }
                        ].map((metric, idx) => (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: idx * 0.12 }} viewport={{ once: true }}>
                                    <Box sx={{ p: 4, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', transition: 'all 0.25s', height: '100%', '&:hover': { border: `1px solid ${metric.color}35`, boxShadow: `0 12px 32px ${metric.color}15`, transform: 'translateY(-6px)' } }}>
                                        <Box sx={{ mb: 2.5, p: 2, bgcolor: `${metric.color}12`, display: 'inline-flex', borderRadius: '14px' }}>{metric.icon}</Box>
                                        <Typography variant="h3" sx={{ color: metric.color, fontWeight: 900, mb: 0.75, fontSize: { xs: '2rem', md: '2.5rem' } }}>{metric.value}</Typography>
                                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>{metric.label}</Typography>
                                    </Box>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* FAQ */}
            <Box sx={{ bgcolor: '#f8fafc', py: { xs: 8, md: 14 }, borderTop: '1px solid #f1f5f9' }}>
                <Container maxWidth="md">
                    <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
                        <Typography variant="overline" sx={{ color: '#2ECC71', fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.8rem' }}>FAQ</Typography>
                        <Typography variant="h3" sx={{ color: '#0f172a', fontWeight: 800, mt: 1, mb: 2, fontSize: { xs: '1.9rem', md: '2.6rem' } }}>Frequently Asked Questions</Typography>
                        <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 400, fontSize: '1rem' }}>Everything you need to know about our monitoring platform</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {[
                            { question: 'How does uptime monitoring work?', answer: 'Our platform performs automated checks on your websites, servers, and APIs at regular intervals. If any check fails, you\'re immediately notified through your preferred channels.' },
                            { question: 'What happens when a monitor fails?', answer: 'When a monitor detects downtime, we send instant alerts via Email, SMS, Slack, or other configured channels. You\'ll receive detailed incident information to help diagnose the issue quickly.' },
                            { question: 'How often are checks performed?', answer: 'Check intervals range from 30 seconds to 5 minutes depending on your plan. Enterprise customers can configure custom intervals as low as 10 seconds.' },
                            { question: 'Can I monitor multiple websites?', answer: 'Yes! You can monitor unlimited websites, APIs, servers, and ports. Each monitor can be configured independently with different check intervals and alert settings.' },
                            { question: 'What notification methods are available?', answer: 'We support Email, SMS, Push notifications, Slack, Telegram, Discord, and custom webhooks. You can configure multiple notification channels for redundancy.' },
                            { question: 'How accurate is the monitoring?', answer: 'We use distributed monitoring from 15+ global locations to eliminate false positives. A site is only marked as down when multiple locations confirm the outage.' },
                            { question: 'Can I integrate with my existing tools?', answer: 'Absolutely! We support webhooks for custom integrations, plus native integrations with Slack, Telegram, Discord, and popular incident management platforms.' },
                            { question: 'What types of monitoring do you support?', answer: 'HTTP/HTTPS website monitoring, Ping monitoring, Port monitoring, DNS record checks, SSL certificate monitoring, and keyword monitoring. All available in one platform.' }
                        ].map((faq, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.04 }} viewport={{ once: true }}>
                                <Accordion disableGutters elevation={0} sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px !important', '&:before': { display: 'none' }, '&.Mui-expanded': { border: '1px solid rgba(46,204,113,0.3)', boxShadow: '0 4px 16px rgba(46,204,113,0.08)' } }}>
                                    <AccordionSummary expandIcon={<ChevronDown size={18} color="#94a3b8" />} sx={{ px: 3, py: 1.5, '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                                        <Typography sx={{ color: '#1e293b', fontWeight: 700, fontSize: '0.95rem' }}>{faq.question}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ px: 3, pb: 3 }}>
                                        <Typography sx={{ color: '#64748b', lineHeight: 1.8, fontSize: '0.9rem' }}>{faq.answer}</Typography>
                                    </AccordionDetails>
                                </Accordion>
                            </motion.div>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* CTA Banner */}
            <Box sx={{ bgcolor: '#ffffff', py: { xs: 8, md: 14 }, borderTop: '1px solid #f1f5f9' }}>
                <Container maxWidth="md">
                    <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
                        <Box sx={{ background: '#0A3D62', borderRadius: '28px', p: { xs: 5, md: 8 }, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,204,113,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                            <Box sx={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,204,113,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <Chip label="No credit card required" sx={{ mb: 3, bgcolor: 'rgba(46,204,113,0.15)', color: '#4ade80', border: '1px solid rgba(46,204,113,0.25)', fontWeight: 600, fontSize: '0.75rem' }} />
                                <Typography variant="h2" sx={{ color: '#ffffff', fontWeight: 900, mb: 2.5, fontSize: { xs: '1.9rem', md: '3rem' }, lineHeight: 1.2 }}>
                                    Ready to Ensure 100% Uptime?
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 4.5, maxWidth: 560, mx: 'auto', lineHeight: 1.75, fontSize: '1rem' }}>
                                    Join thousands of businesses monitoring their infrastructure with confidence. Start in 30 seconds.
                                </Typography>
                                <Button variant="contained" size="large" onClick={() => navigate('/signup')} endIcon={<ArrowRight size={18} />}
                                    sx={{ bgcolor: '#2ECC71', px: 5, py: 1.8, fontSize: '1rem', fontWeight: 700, borderRadius: '12px', boxShadow: '0 8px 24px rgba(46,204,113,0.4)', '&:hover': { bgcolor: '#27ae60', transform: 'translateY(-2px)', boxShadow: '0 12px 32px rgba(46,204,113,0.5)' }, transition: 'all 0.2s' }}>
                                    Start Monitoring Free
                                </Button>
                            </Box>
                        </Box>
                    </motion.div>
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ py: 5, px: 2, textAlign: 'center', borderTop: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                {/* <img src="/logo-white.png" alt="Logo" style={{ height: 28, marginBottom: 12, filter: 'brightness(0) saturate(100%) invert(10%) sepia(20%) saturate(500%) hue-rotate(180deg)' }} /> */}
                <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>
                    © {new Date().getFullYear()} Lease Packet Tools. All rights reserved.
                </Typography>
            </Box>
        </Box>
    );
};

export default LandingPage;
