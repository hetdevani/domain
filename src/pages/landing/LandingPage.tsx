import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Container,
    Stack,
    TextField,
    CircularProgress,
    Paper,
    Chip,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import SEOHead from '../../components/seo/SEOHead';
import { motion, AnimatePresence, useReducedMotion, useInView } from 'framer-motion';
import {
    Globe,
    Search,
    ArrowRight,
    Sparkles,
    Users,
    Headphones,
    Zap,
    Lock,
    BarChart2,
    Clock,
    ChevronDown,
    Star,
    CheckCircle,
    XCircle,
    RefreshCw,
    Award,
    TrendingUp,
    Layers,
    HardDrive,
    Cpu,
} from 'lucide-react';
import LandingNavbar from '../../components/layout/LandingNavbar';
import api from '../../api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

/* ═══════════════════════════ DESIGN TOKENS ══════════════════════════════ */
const T = {
    /* backgrounds */
    bgDeep:    '#04060f',
    bgDark:    '#070c1d',
    bgCard:    'rgba(255,255,255,0.035)',
    bgCardHov: 'rgba(255,255,255,0.065)',
    bgLight:   '#f0f4ff',
    bgWhite:   '#ffffff',

    /* amber – primary brand accent */
    amber:     '#f59e0b',
    amberLt:   '#fcd34d',
    amberDk:   '#d97706',
    amberGlow: 'rgba(245,158,11,0.22)',
    amberBg:   'rgba(245,158,11,0.08)',

    /* violet – secondary depth accent */
    violet:    '#7c3aed',
    violetLt:  '#a78bfa',
    violetGlow:'rgba(124,58,237,0.22)',

    /* cyan – tertiary highlight */
    cyan:      '#06b6d4',
    cyanGlow:  'rgba(6,182,212,0.18)',

    /* neutrals */
    textLt:    '#f8fafc',
    textMid:   'rgba(248,250,252,0.75)',
    textDk:    '#0f172a',
    muted:     '#94a3b8',
    mutedDk:   '#64748b',

    /* borders */
    border:    'rgba(148,163,184,0.12)',
    borderLt:  '#e2e8f0',
    borderGold:'rgba(245,158,11,0.28)',

    /* status */
    success:   '#10b981',
    danger:    '#ef4444',
};

/* ════════════════════════ ANIMATION EASINGS ════════════════════════════ */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_SPRING = { type: 'spring', stiffness: 380, damping: 32 } as const;

const fadeUp = {
    hidden:  { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};
const fadeIn = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
};
const stagger = (d = 0.09) => ({ visible: { transition: { staggerChildren: d } } });
const scaleIn = {
    hidden:  { opacity: 0, scale: 0.88 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.48, ease: EASE } },
};

/* ══════════════════════ REUSABLE RADIUS ════════════════════════════════ */
const R  = '16px';
const RS = '12px';

/* ═══════════════════════════ DATA ══════════════════════════════════════ */
const popularTlds = [
    { ext: '.com',     price: '₹899',   popular: true  },
    { ext: '.in',      price: '₹699',   popular: true  },
    { ext: '.net',     price: '₹999',   popular: false },
    { ext: '.org',     price: '₹849',   popular: false },
    { ext: '.co',      price: '₹1,299', popular: true  },
    { ext: '.io',      price: '₹3,499', popular: false },
    { ext: '.store',   price: '₹599',   popular: true  },
    { ext: '.online',  price: '₹499',   popular: true  },
    { ext: '.tech',    price: '₹1,099', popular: false },
    { ext: '.website', price: '₹449',   popular: false },
    { ext: '.co.in',   price: '₹499',   popular: true  },
    { ext: '.info',    price: '₹799',   popular: false },
];

const statsData = [
    { value: 50,   suffix: 'K+',  label: 'Domains Managed',  icon: Globe,      grad: 'linear-gradient(135deg,#f59e0b,#d97706)', glow: 'rgba(245,158,11,0.25)'   },
    { value: 99.9, suffix: '%',   label: 'Uptime SLA',       icon: Zap,        grad: 'linear-gradient(135deg,#10b981,#059669)', glow: 'rgba(16,185,129,0.25)'   },
    { value: 24,   suffix: '/7',  label: 'Expert Support',   icon: Headphones, grad: 'linear-gradient(135deg,#7c3aed,#4f46e5)', glow: 'rgba(124,58,237,0.25)'   },
    { value: 10,   suffix: '+',   label: 'Years Experience', icon: Award,      grad: 'linear-gradient(135deg,#06b6d4,#0284c7)', glow: 'rgba(6,182,212,0.25)'    },
];

const features = [
    { icon: Search,   title: 'Instant Domain Search',    desc: 'Check availability across 100+ TLDs in under 2 seconds. See pricing, status and alternatives side by side.',              grad: 'linear-gradient(145deg,#f59e0b,#d97706)' },
    { icon: Zap,      title: 'One-Click Registration',   desc: 'Register your perfect domain in minutes. Automated DNS configuration, instant activation, no technical knowledge needed.',  grad: 'linear-gradient(145deg,#7c3aed,#4f46e5)' },
    { icon: Lock,     title: 'Free WHOIS Privacy',       desc: 'Protect your personal information from public WHOIS databases. Your privacy is included at no extra cost.',                 grad: 'linear-gradient(145deg,#10b981,#059669)' },
    { icon: BarChart2,title: 'Advanced Dashboard',       desc: 'Manage all your domains, renewals, DNS records and hosting services from one beautiful control panel.',                    grad: 'linear-gradient(145deg,#3b82f6,#2563eb)' },
    { icon: RefreshCw,title: 'Auto Renewal',             desc: 'Never lose your domain accidentally. Smart reminders 60, 30 and 7 days before expiry with auto-renew.',                   grad: 'linear-gradient(145deg,#ec4899,#db2777)' },
    { icon: Headphones,title: '24/7 Expert Support',    desc: 'Get help from real domain experts round the clock. Chat, email, or call — we respond in under 5 minutes.',                 grad: 'linear-gradient(145deg,#f97316,#ea580c)' },
];

const howItWorks = [
    { step: '01', title: 'Search Your Name',     desc: 'Type the domain name you want. We instantly check availability across all major TLDs and show you pricing.', icon: Search },
    { step: '02', title: 'Create Your Account',  desc: 'Sign up in 30 seconds. No credit card required to browse. Add your details and verify your email.',          icon: Users  },
    { step: '03', title: 'Register & Go Live',   desc: 'Complete your purchase with UPI, card or netbanking. Your domain is active within minutes.',                  icon: Globe  },
];

const hostingPlans = [
    {
        name: 'Starter', price: '₹99',   period: '/mo', highlight: false, badge: null,
        desc: 'Perfect for personal websites and small projects.',
        features: ['1 Website','5 GB SSD Storage','10 GB Bandwidth','Free SSL Certificate','5 Email Accounts','cPanel Access','99.9% Uptime'],
        cta: 'Get Started',
    },
    {
        name: 'Business', price: '₹299', period: '/mo', highlight: true,  badge: 'Most Popular',
        desc: 'For growing businesses that need more power.',
        features: ['10 Websites','50 GB SSD Storage','Unlimited Bandwidth','Free SSL Certificate','Unlimited Emails','cPanel Access','Free Domain (1 yr)','Daily Backups','Priority Support'],
        cta: 'Start Free Trial',
    },
    {
        name: 'Pro',     price: '₹599',  period: '/mo', highlight: false, badge: null,
        desc: 'High-performance hosting for serious websites.',
        features: ['Unlimited Websites','200 GB NVMe Storage','Unlimited Bandwidth','Free SSL + Wildcard','Unlimited Emails','cPanel Access','Free Domain (1 yr)','Daily Backups','Priority Support','Dedicated IP','LiteSpeed Server'],
        cta: 'Go Pro',
    },
    {
        name: 'Agency',  price: '₹1,199',period: '/mo', highlight: false, badge: null,
        desc: 'Manage unlimited client sites with ease.',
        features: ['Unlimited Websites','500 GB NVMe Storage','Unlimited Bandwidth','Free SSL + Wildcard','Unlimited Emails','Reseller cPanel','5 Free Domains (1 yr)','Hourly Backups','Dedicated Support Line','3 Dedicated IPs','LiteSpeed + Redis','White-label Ready'],
        cta: 'Contact Sales',
    },
];
void hostingPlans;

const testimonials = [
    { name: 'Rahul Sharma',  role: 'Founder, TechStartup.in',    av: 'RS', stars: 5, text: 'Plan A Hosting made it incredibly easy to register our startup domain and get hosting up within minutes. The dashboard is clean and the support team is extremely responsive.' },
    { name: 'Priya Nair',    role: 'E-commerce Owner',           av: 'PN', stars: 5, text: 'I have used many domain registrars before but the pricing here is unbeatable for Indian businesses. The auto-renewal feature means I never worry about losing my domain.' },
    { name: 'Arjun Mehta',   role: 'Web Developer & Freelancer', av: 'AM', stars: 5, text: 'Managing 30+ client domains from a single dashboard is a game changer. The agency plan is perfect for my freelance business. Highly recommended.' },
    { name: 'Deepika Rao',   role: 'Digital Marketing Agency',   av: 'DR', stars: 5, text: 'GST-ready invoices are a huge plus for our business accounting. The support team helped us migrate 50 domains seamlessly. Excellent service.' },
];

const faqs = [
    { q: 'How long does domain registration take?',                a: 'Most domains (.com, .in, .net, etc.) are registered instantly upon successful payment. You will receive a confirmation email with your domain details within minutes.' },
    { q: 'Can I transfer my existing domain to Plan A Hosting?',   a: 'Yes! You can transfer any domain to us. The process typically takes 5-7 days and we guide you every step. Your remaining registration period carries over.' },
    { q: 'What payment methods do you accept?',                    a: 'We accept all major Indian payment methods — UPI (PhonePe, Google Pay, Paytm), Credit/Debit Cards (Visa, Mastercard, RuPay), and Netbanking from all major Indian banks.' },
    { q: 'Do you provide free WHOIS privacy protection?',          a: 'Yes! WHOIS privacy is included free with all domain registrations. Your personal contact information is shielded from public WHOIS databases at no extra cost.' },
    { q: 'What is the renewal price for domains?',                 a: 'Renewal prices match registration prices listed on our TLD page — no hidden fees. We send reminders 60, 30 and 7 days before expiry.' },
    { q: 'Do you offer refunds on domain registrations?',          a: 'Domain registrations are generally non-refundable once registered. However, hosting plans come with a 30-day money-back guarantee — no questions asked.' },
    { q: 'Can I host multiple websites on one account?',           a: 'Yes! Our Business, Pro and Agency plans support multiple websites. The Agency plan supports unlimited websites, perfect for freelancers and agencies.' },
    { q: 'Is customer support available in Hindi?',                a: 'Yes! Our support team is fluent in both English and Hindi. Reach us via live chat, email, or phone 24 hours a day, 7 days a week.' },
];

const whyUs = [
    { icon: Award,     title: 'ICANN Accredited',        desc: 'Registered and accredited registrar meeting international standards.' },
    { icon: TrendingUp,title: 'Lowest Prices',           desc: 'No inflated renewal rates. What you see is what you pay, every year.' },
    { icon: Layers,    title: 'All-in-One Platform',     desc: 'Domains, hosting, email and billing — managed from one dashboard.' },
    { icon: HardDrive, title: 'Indian Data Centres',     desc: 'Servers in Mumbai & Chennai for ultra-low latency across India.' },
    { icon: Cpu,       title: 'NVMe SSD Speed',          desc: 'Up to 10× faster than traditional HDD. Your site loads in milliseconds.' },
    { icon: Clock,     title: '99.9% Uptime',            desc: 'Enterprise-grade infrastructure with redundant power, network & cooling.' },
];

/* ═══════════════════════════ INTERFACES ════════════════════════════════ */
interface AvailableDomain { domain: string; extension: string; status: string; price: number; }
interface DomainSearchResponse { searchedDomain: string; available: AvailableDomain[]; taken: string[]; }

/* ═══════════════════════════ HOOKS ═════════════════════════════════════ */
function useCountUp(target: number, duration = 1800, start = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime: number | null = null;
        const step = (ts: number) => {
            if (!startTime) startTime = ts;
            const progress = Math.min((ts - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(parseFloat((eased * target).toFixed(target % 1 !== 0 ? 1 : 0)));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [start, target, duration]);
    return count;
}

/* ═══════════════════════════ SMALL UI PIECES ═══════════════════════════ */
function SectionBadge({ children }: { children: React.ReactNode }) {
    return (
        <Box
            sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.75,
                bgcolor: T.amberBg, border: `1px solid ${T.amberGlow}`,
                borderRadius: 99, px: 1.75, py: 0.55, mb: 2,
            }}
        >
            <Sparkles size={12} color={T.amber} />
            <Typography sx={{ color: T.amber, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.11em', textTransform: 'uppercase' }}>
                {children}
            </Typography>
        </Box>
    );
}

function SectionTitle({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
    return (
        <Typography sx={{
            color: light ? T.textLt : T.textDk,
            fontSize: { xs: '1.8rem', md: '2.3rem' },
            fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.14,
            mb: 1.5, fontFamily: '"Outfit","DM Sans",sans-serif',
        }}>
            {children}
        </Typography>
    );
}

function SectionSub({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
    return (
        <Typography sx={{
            color: light ? T.muted : T.mutedDk,
            fontSize: '1.0375rem', lineHeight: 1.68, maxWidth: 560, mx: 'auto',
        }}>
            {children}
        </Typography>
    );
}

/* scroll-reveal wrapper */
function Reveal({ children, delay = 0, from = 'bottom' }:
    { children: React.ReactNode; delay?: number; from?: 'bottom' | 'left' | 'right' | 'scale' }) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-64px' });
    const variants = from === 'scale' ? scaleIn
        : from === 'left'  ? { hidden: { opacity: 0, x: -28 }, visible: { opacity: 1, x: 0, transition: { duration: 0.52, ease: EASE } } }
        : from === 'right' ? { hidden: { opacity: 0, x:  28 }, visible: { opacity: 1, x: 0, transition: { duration: 0.52, ease: EASE } } }
        : fadeUp;
    return (
        <motion.div ref={ref} variants={variants} initial="hidden"
            animate={inView ? 'visible' : 'hidden'} transition={{ delay }}>
            {children}
        </motion.div>
    );
}

/* animated stat card */
function StatCard({ value, suffix, label, icon: Icon, grad, glow }: {
    value: number; suffix: string; label: string;
    icon: React.ElementType; grad: string; glow: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });
    const count = useCountUp(value, 1600, inView);
    return (
        <motion.div whileHover={{ y: -6, scale: 1.03 }} transition={{ type: 'spring', stiffness: 380, damping: 28 }}>
            <Box ref={ref} sx={{
                textAlign: 'center', py: 3.5, px: 2.5,
                borderRadius: '20px',
                bgcolor: 'rgba(255,255,255,0.05)',
                border: `1px solid rgba(255,255,255,0.09)`,
                backdropFilter: 'blur(14px)',
                transition: 'border-color 0.22s, box-shadow 0.22s',
                '&:hover': { borderColor: glow.replace('0.25', '0.5'), boxShadow: `0 0 32px ${glow}` },
            }}>
                <Box sx={{
                    width: 54, height: 54, borderRadius: '14px', mx: 'auto', mb: 2,
                    background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 8px 24px ${glow}`,
                }}>
                    <Icon size={24} color="#fff" strokeWidth={2.2} />
                </Box>
                <Typography sx={{
                    fontSize: { xs: '2.2rem', md: '2.7rem' }, fontWeight: 900, lineHeight: 1,
                    fontFamily: '"Outfit",sans-serif', mb: 0.75,
                    background: `${grad}`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                    {count}{suffix}
                </Typography>
                <Typography sx={{ color: T.muted, fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.02em' }}>
                    {label}
                </Typography>
            </Box>
        </motion.div>
    );
}

/* ═══════════════════════════════ PAGE ══════════════════════════════════ */
const LandingPage: React.FC = () => {
    const rm = useReducedMotion();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<DomainSearchResponse | null>(null);
    const [openFaq, setOpenFaq] = useState<number | false>(false);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const q = searchQuery.trim().toLowerCase().replace(/^www\./, '').replace(/\.[a-z.]+$/, '');
        if (!q || q.length < 2) { toast.error('Enter at least 2 characters (e.g. mybrand).'); return; }
        setIsSearching(true); setSearchResults(null);
        try {
            const res = await api.get('/domains/check', { params: { domainName: q } });
            const data = res.data?.data as DomainSearchResponse | undefined;
            if (data) {
                setSearchResults(data);
                if (!data.available?.length && !data.taken?.length)
                    toast('No results returned for that search.', { icon: 'ℹ️' });
            } else { toast.error('Something went wrong. Please try again.'); }
        } catch (err: unknown) {
            toast.error(err && typeof err === 'object' && 'message' in err
                ? String((err as { message: string }).message)
                : 'Could not check that name right now. Please try again.');
        } finally { setIsSearching(false); }
    };

    /* floating orb helper */
    const Orb = ({ sx }: { sx: object }) =>
        !rm ? (
            <motion.div
                aria-hidden
                style={{ position: 'absolute', borderRadius: '50%', pointerEvents: 'none', ...sx as React.CSSProperties }}
                animate={{ y: [0, -20, 0], scale: [1, 1.06, 1] }}
                transition={{ duration: 10 + Math.random() * 4, repeat: Infinity, ease: 'easeInOut' }}
            />
        ) : null;

    /* ── Rich JSON-LD schemas for Google ranking ───────────────────── */
    const ldSchemas = [
        /* WebPage */
        {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': 'https://planahosting.in/#webpage',
            'url': 'https://planahosting.in/',
            'name': 'Domain Registration India | Buy .com .in Domains — Plan A Hosting',
            'description': 'Register .com, .in, .store & 100+ domains starting ₹449/yr with free WHOIS privacy, instant activation & GST invoices.',
            'inLanguage': 'en-IN',
            'isPartOf': { '@id': 'https://planahosting.in/#website' },
            'about': { '@id': 'https://planahosting.in/#organization' },
            'datePublished': '2014-01-01',
            'dateModified': '2026-04-18',
            'breadcrumb': {
                '@type': 'BreadcrumbList',
                'itemListElement': [{ '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://planahosting.in/' }],
            },
        },
        /* FAQPage — powers Google FAQ rich snippets */
        {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': faqs.map((f) => ({
                '@type': 'Question',
                'name': f.q,
                'acceptedAnswer': { '@type': 'Answer', 'text': f.a },
            })),
        },
        /* ItemList — domain extensions */
        {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            'name': 'Popular Domain Extensions',
            'description': 'Top domain extensions available for registration at Plan A Hosting',
            'itemListElement': popularTlds.map((tld, i) => ({
                '@type': 'ListItem',
                'position': i + 1,
                'name': `${tld.ext} Domain Registration`,
                'description': `Register a ${tld.ext} domain starting at ${tld.price}/year`,
                'url': 'https://planahosting.in/',
            })),
        },
        /* HowTo — 3-step process for Google rich results */
        {
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            'name': 'How to Register a Domain Name in India',
            'description': 'Register your domain name and get online in under 5 minutes with Plan A Hosting.',
            'totalTime': 'PT5M',
            'step': howItWorks.map((s, i) => ({
                '@type': 'HowToStep',
                'position': i + 1,
                'name': s.title,
                'text': s.desc,
                'url': `https://planahosting.in/#how-it-works`,
            })),
        },
        /* AggregateRating — star ratings in SERPs */
        {
            '@context': 'https://schema.org',
            '@type': 'Service',
            'name': 'Domain Registration India',
            'provider': { '@id': 'https://planahosting.in/#organization' },
            'serviceType': 'Domain Registration',
            'areaServed': 'India',
            'aggregateRating': {
                '@type': 'AggregateRating',
                'ratingValue': '4.9',
                'reviewCount': '50000',
                'bestRating': '5',
                'worstRating': '1',
            },
            'review': testimonials.map((t) => ({
                '@type': 'Review',
                'author': { '@type': 'Person', 'name': t.name },
                'reviewBody': t.text,
                'reviewRating': { '@type': 'Rating', 'ratingValue': t.stars, 'bestRating': 5 },
            })),
        },
    ];

    return (
        <Box sx={{ bgcolor: T.bgWhite, color: T.textDk, overflowX: 'hidden' }}>
            <SEOHead
                title="Domain Registration India | Buy .com .in Domains — Plan A Hosting"
                description="Register .com, .in, .store & 100+ domains from ₹449/yr. Free WHOIS privacy, instant activation & GST invoices. 50,000+ Indian businesses trust Plan A Hosting."
                keywords="domain registration india, buy domain name india, .in domain registration, .com domain india, cheap domain india, web hosting india, best domain registrar india, register domain online india, domain name india, free whois privacy india, gst invoice domain, plan a hosting"
                canonical="/"
                schema={ldSchemas}
            />
            <LandingNavbar />

            {/* ═══════════════════════ HERO ═══════════════════════════ */}
            <Box id="search" component="section" sx={{
                background: `linear-gradient(160deg, ${T.bgDeep} 0%, #070b1c 45%, #0c1230 100%)`,
                pt: { xs: 7, md: 10 }, pb: { xs: 10, md: 15 },
                position: 'relative', overflow: 'hidden', scrollMarginTop: '80px',
            }}>
                {/* Aurora gradient layers */}
                <Box aria-hidden sx={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: [
                        `radial-gradient(ellipse 80% 60% at 10% 0%,  ${T.violetGlow} 0%, transparent 55%)`,
                        `radial-gradient(ellipse 70% 50% at 90% 10%, ${T.amberGlow}  0%, transparent 52%)`,
                        `radial-gradient(ellipse 50% 40% at 50% 80%, ${T.cyanGlow}   0%, transparent 48%)`,
                    ].join(','),
                }} />

                {/* Animated orbs */}
                <Orb sx={{ top: '8%', left: '6%', width: 440, height: 440, background: `radial-gradient(circle, ${T.amberGlow} 0%, transparent 68%)`, filter: 'blur(2px)' }} />
                <Orb sx={{ bottom: '10%', right: '4%', width: 360, height: 360, background: `radial-gradient(circle, ${T.violetGlow} 0%, transparent 65%)` }} />
                <Orb sx={{ top: '30%', right: '22%', width: 200, height: 200, background: `radial-gradient(circle, ${T.cyanGlow} 0%, transparent 65%)` }} />

                {/* Dot-grid */}
                <Box aria-hidden sx={{
                    position: 'absolute', inset: 0, opacity: 0.035, pointerEvents: 'none',
                    backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)`,
                    backgroundSize: '36px 36px',
                }} />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <motion.div initial="hidden" animate="visible" variants={stagger(0.11)}>

                        {/* Badge */}
                        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 16 }}>
                            <Box sx={{
                                display: 'inline-flex', alignItems: 'center', gap: 1,
                                bgcolor: T.amberBg, border: `1px solid ${T.amberGlow}`,
                                borderRadius: 99, px: 2.25, py: 0.7,
                            }}>
                                <motion.div
                                    animate={rm ? {} : { rotate: [0, 14, -8, 0], scale: [1, 1.1, 1] }}
                                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                    <Sparkles size={14} color={T.amber} />
                                </motion.div>
                                <Typography sx={{ color: T.amber, fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                    India's Trusted Domain & Hosting Partner
                                </Typography>
                            </Box>
                        </motion.div>

                        {/* Headline with gradient text */}
                        <motion.div variants={fadeUp}>
                            <Typography component="h1" sx={{
                                textAlign: 'center',
                                fontSize: { xs: '2.2rem', sm: '3rem', md: '4rem' },
                                fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.035em',
                                fontFamily: '"Outfit","DM Sans",sans-serif', mb: 2.5,
                            }}>
                                <Box component="span" sx={{ color: T.textLt }}>Find the Perfect{' '}</Box>
                                <Box component="span" sx={{
                                    background: `linear-gradient(135deg, ${T.amberLt} 0%, ${T.amber} 45%, ${T.amberDk} 100%)`,
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}>
                                    Domain Name
                                </Box>
                                <Box component="br" />
                                <Box component="span" sx={{ color: T.textLt }}>for Your </Box>
                                <Box component="span" sx={{
                                    background: `linear-gradient(135deg, ${T.violetLt} 0%, ${T.violet} 60%, ${T.cyan} 100%)`,
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}>
                                    Business
                                </Box>
                            </Typography>
                        </motion.div>

                        {/* Sub-headline */}
                        <motion.div variants={fadeIn}>
                            <Typography sx={{
                                color: T.muted, maxWidth: 580, mx: 'auto',
                                textAlign: 'center', fontSize: '1.0625rem', lineHeight: 1.72, mb: 5,
                            }}>
                                Search across 100+ domain extensions. Get free WHOIS privacy, instant activation,
                                and GST-ready invoices — built for Indian businesses.
                            </Typography>
                        </motion.div>

                        {/* Search box */}
                        <motion.div variants={fadeUp}>
                            <Box
                                component="form" onSubmit={handleSearch}
                                sx={{
                                    display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
                                    maxWidth: 760, mx: 'auto',
                                    borderRadius: R, overflow: 'hidden',
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    border: `1px solid rgba(255,255,255,0.1)`,
                                    backdropFilter: 'blur(20px)',
                                    boxShadow: `0 0 0 1px rgba(245,158,11,0.12) inset, 0 32px 80px rgba(0,0,0,0.5)`,
                                    transition: 'box-shadow 0.25s',
                                    '&:focus-within': {
                                        boxShadow: `0 0 0 2px ${T.amber}60 inset, 0 32px 80px rgba(0,0,0,0.5)`,
                                    },
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, px: 2.5 }}>
                                    <Search size={20} color={T.muted} style={{ flexShrink: 0 }} />
                                    <TextField
                                        fullWidth
                                        placeholder="Type your brand name (e.g. mycompany)"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        variant="standard"
                                        InputProps={{
                                            disableUnderline: true,
                                            sx: { px: 1.5, py: 1.9, fontSize: '1.05rem', fontWeight: 500, color: '#e2e8f0' },
                                        }}
                                    />
                                </Box>
                                <Box
                                    component={motion.div}
                                    whileHover={!isSearching ? { scale: 1.02 } : {}}
                                    whileTap={!isSearching ? { scale: 0.97 } : {}}
                                    sx={{ display: 'flex', alignSelf: 'stretch', position: 'relative', overflow: 'hidden' }}
                                >
                                    <Button
                                        type="submit" disabled={isSearching}
                                        sx={{
                                            flex: 1,
                                            background: `linear-gradient(135deg, ${T.amberLt} 0%, ${T.amber} 50%, ${T.amberDk} 100%)`,
                                            color: '#0a0f1e', fontWeight: 800, fontSize: '0.95rem',
                                            px: { xs: 3, sm: 4 }, py: 2,
                                            width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 175 },
                                            borderRadius: 0,
                                            '&:hover': { filter: 'brightness(1.1)' },
                                            '&:disabled': { bgcolor: '#92400e', color: '#fff' },
                                            /* shimmer overlay */
                                            '&::after': {
                                                content: '""', position: 'absolute',
                                                top: 0, left: '-100%', width: '60%', height: '100%',
                                                background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)',
                                                animation: isSearching ? 'none' : 'btnShimmer 2.4s infinite',
                                            },
                                            '@keyframes btnShimmer': {
                                                '0%':   { left: '-100%' },
                                                '100%': { left: '200%' },
                                            },
                                        }}
                                    >
                                        {isSearching
                                            ? <CircularProgress size={22} sx={{ color: 'inherit' }} />
                                            : <><Search size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />Search Domains</>
                                        }
                                    </Button>
                                </Box>
                            </Box>

                            {/* TLD quick chips */}
                            <Stack direction="row" spacing={0.75} justifyContent="center" flexWrap="wrap" sx={{ mt: 2.5, gap: 0.5 }}>
                                {['.com', '.in', '.co.in', '.store', '.online', '.co'].map((t) => (
                                    <Chip key={t} label={t} size="small"
                                        onClick={() => setSearchQuery(prev => prev.replace(/\.[a-z.]+$/, '') + t)}
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.07)', color: T.muted,
                                            border: `1px solid ${T.border}`, fontSize: '0.75rem',
                                            cursor: 'pointer', transition: 'all 0.18s',
                                            '&:hover': { bgcolor: T.amberBg, color: T.amber, borderColor: T.amberGlow },
                                        }}
                                    />
                                ))}
                                <Typography sx={{ color: T.muted, fontSize: '0.75rem', alignSelf: 'center' }}>
                                    + 100 more
                                </Typography>
                            </Stack>
                        </motion.div>

                        {/* Trust micro row */}
                        <motion.div variants={fadeIn}>
                            <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap" sx={{ mt: 4, gap: 1 }}>
                                {['Free WHOIS Privacy', 'Instant Activation', 'GST Invoices', 'ICANN Accredited'].map((t) => (
                                    <Stack key={t} direction="row" spacing={0.75} alignItems="center">
                                        <CheckCircle size={14} color={T.success} />
                                        <Typography sx={{ color: 'rgba(148,163,184,0.85)', fontSize: '0.8125rem', fontWeight: 500 }}>{t}</Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </motion.div>
                    </motion.div>
                </Container>
            </Box>

            {/* ══════════════ SEARCH RESULTS ═══════════════════════════ */}
            <AnimatePresence>
                {searchResults && (
                    <motion.section
                        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }} transition={EASE_SPRING}
                    >
                        <Box sx={{ bgcolor: '#f1f5fb', borderTop: `1px solid ${T.borderLt}`, py: { xs: 5, md: 7 } }}>
                            <Container maxWidth="md">
                                <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', mb: 3, color: T.textDk, fontFamily: '"Outfit",sans-serif' }}>
                                    Results for{' '}
                                    <Box component="span" sx={{ color: T.amber }}>"{searchResults.searchedDomain}"</Box>
                                </Typography>

                                {searchResults.available?.length > 0 && (
                                    <Box sx={{ mb: 3 }}>
                                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: T.success, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5 }}>
                                            Available
                                        </Typography>
                                        <Stack spacing={1.5}>
                                            {searchResults.available.map((d, i) => (
                                                <motion.div key={d.domain} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                                                    <Paper elevation={0} sx={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        p: 2, borderRadius: RS, border: `1.5px solid ${T.success}44`,
                                                        bgcolor: '#fff', boxShadow: '0 2px 8px rgba(16,185,129,0.07)', flexWrap: 'wrap', gap: 1,
                                                    }}>
                                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                                            <CheckCircle size={18} color={T.success} />
                                                            <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', color: T.textDk }}>{d.domain}</Typography>
                                                            <Chip label="Available" size="small" sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 700, height: 22, fontSize: '0.68rem' }} />
                                                        </Stack>
                                                        <Stack direction="row" alignItems="center" spacing={2}>
                                                            <Typography sx={{ fontWeight: 800, color: T.textDk, fontSize: '1.0625rem' }}>
                                                                {d.price > 0 ? `₹${d.price.toLocaleString('en-IN')}/yr` : 'Check pricing'}
                                                            </Typography>
                                                            <Button variant="contained" size="small" onClick={() => navigate('/signup')} sx={{
                                                                bgcolor: T.success, color: '#fff', fontWeight: 700,
                                                                borderRadius: RS, px: 2.5, fontSize: '0.8125rem',
                                                                '&:hover': { bgcolor: '#059669' },
                                                            }}>
                                                                Register
                                                            </Button>
                                                        </Stack>
                                                    </Paper>
                                                </motion.div>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}

                                {searchResults.taken?.length > 0 && (
                                    <Box>
                                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: T.mutedDk, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5 }}>
                                            Already Taken
                                        </Typography>
                                        <Stack spacing={1}>
                                            {searchResults.taken.map((d) => (
                                                <Paper key={d} elevation={0} sx={{
                                                    display: 'flex', alignItems: 'center', p: 1.75,
                                                    borderRadius: RS, border: `1px solid ${T.borderLt}`,
                                                    bgcolor: '#f8fafc', gap: 1.5,
                                                }}>
                                                    <XCircle size={17} color={T.danger} />
                                                    <Typography sx={{ fontWeight: 600, color: T.mutedDk, fontSize: '0.9375rem', textDecoration: 'line-through' }}>{d}</Typography>
                                                    <Chip label="Taken" size="small" sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 700, height: 20, fontSize: '0.66rem' }} />
                                                </Paper>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}

                                <Box sx={{ mt: 3, textAlign: 'center' }}>
                                    <Button onClick={() => { setSearchResults(null); setSearchQuery(''); }}
                                        sx={{ color: T.mutedDk, fontWeight: 600, fontSize: '0.875rem' }}>
                                        Clear &amp; search again
                                    </Button>
                                </Box>
                            </Container>
                        </Box>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* ══════════════ TLD PRICING STRIP ═══════════════════════ */}
            <Box id="tlds" component="section" sx={{ bgcolor: T.bgLight, borderTop: `1px solid ${T.borderLt}`, py: { xs: 6, md: 8 }, scrollMarginTop: '80px', overflow: 'hidden' }}>
                {/* Auto-scroll marquee ticker */}
                <Box sx={{
                    bgcolor: T.bgDeep, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`,
                    py: 1.25, mb: 6, overflow: 'hidden', position: 'relative',
                    '&::before, &::after': {
                        content: '""', position: 'absolute', top: 0, bottom: 0, width: 80, zIndex: 1, pointerEvents: 'none',
                    },
                    '&::before': { left: 0, background: `linear-gradient(to right, ${T.bgDeep}, transparent)` },
                    '&::after':  { right: 0, background: `linear-gradient(to left,  ${T.bgDeep}, transparent)` },
                }}>
                    <motion.div
                        animate={{ x: ['0%', '-50%'] }}
                        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                        style={{ display: 'flex', gap: 32, width: 'max-content' }}
                    >
                        {[...popularTlds, ...popularTlds].map((tld, i) => (
                            <Stack key={i} direction="row" alignItems="center" spacing={1.25} sx={{ flexShrink: 0 }}>
                                <Typography sx={{ color: T.amber, fontWeight: 800, fontSize: '0.9rem', fontFamily: '"Outfit",sans-serif' }}>{tld.ext}</Typography>
                                <Typography sx={{ color: T.muted, fontWeight: 600, fontSize: '0.8rem' }}>{tld.price}/yr</Typography>
                                {tld.popular && <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: T.amber }} />}
                                <Box sx={{ width: 1, height: 16, bgcolor: T.border, mx: 1 }} />
                            </Stack>
                        ))}
                    </motion.div>
                </Box>

                <Container maxWidth="lg">
                    <Reveal>
                        <Box sx={{ textAlign: 'center', mb: 5 }}>
                            <SectionBadge>Domain Pricing</SectionBadge>
                            <SectionTitle>Popular Domain Extensions</SectionTitle>
                            <SectionSub>Transparent yearly pricing — no hidden renewal fees, ever.</SectionSub>
                        </Box>
                    </Reveal>
                    <Grid container spacing={2}>
                        {popularTlds.map((tld, i) => (
                            <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={tld.ext}>
                                <Reveal delay={i * 0.04}>
                                    <motion.div whileHover={{ y: -6, scale: 1.04 }} transition={{ type: 'spring', stiffness: 400, damping: 26 }}>
                                        <Paper elevation={0} onClick={() => document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' })}
                                            sx={{
                                                p: 2.5, borderRadius: R, textAlign: 'center',
                                                border: tld.popular ? `1.5px solid ${T.amberGlow}` : `1px solid ${T.borderLt}`,
                                                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                                                bgcolor: tld.popular ? T.amberBg : '#fff',
                                                transition: 'box-shadow 0.22s, border-color 0.22s',
                                                '&:hover': {
                                                    boxShadow: `0 14px 36px ${T.amberGlow}`,
                                                    borderColor: T.amber,
                                                    bgcolor: 'rgba(245,158,11,0.05)',
                                                },
                                            }}>
                                            {tld.popular && (
                                                <Box sx={{
                                                    position: 'absolute', top: 0, right: 0,
                                                    bgcolor: T.amber, color: '#000', fontSize: '0.55rem', fontWeight: 800,
                                                    px: 1, py: 0.35, borderBottomLeftRadius: 8, letterSpacing: '0.09em',
                                                }}>HOT</Box>
                                            )}
                                            <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: T.textDk, fontFamily: '"Outfit",sans-serif', letterSpacing: '-0.01em' }}>
                                                {tld.ext}
                                            </Typography>
                                            <Box sx={{ height: 2, width: 28, bgcolor: T.amber, borderRadius: 99, mx: 'auto', my: 0.75, opacity: 0.6 }} />
                                            <Typography sx={{ color: T.amber, fontWeight: 800, fontSize: '0.9375rem' }}>
                                                {tld.price}
                                            </Typography>
                                            <Typography sx={{ color: T.mutedDk, fontSize: '0.68rem', mt: 0.15, letterSpacing: '0.06em', textTransform: 'uppercase' }}>/year</Typography>
                                        </Paper>
                                    </motion.div>
                                </Reveal>
                            </Grid>
                        ))}
                    </Grid>
                    <Reveal delay={0.15}>
                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                            <Button variant="outlined" endIcon={<ArrowRight size={17} />} sx={{
                                borderColor: T.amber, color: T.amber, fontWeight: 700, borderRadius: RS, px: 3,
                                '&:hover': { bgcolor: T.amberBg, borderColor: T.amberDk },
                            }}>
                                View All Domain Extensions
                            </Button>
                        </Box>
                    </Reveal>
                </Container>
            </Box>

            {/* ══════════════ STATS BAR ════════════════════════════════ */}
            <Box component="section" sx={{
                background: `linear-gradient(135deg, ${T.bgDeep} 0%, #0a0f24 50%, #070c1d 100%)`,
                py: { xs: 5, md: 7 }, borderTop: `1px solid ${T.border}`,
                position: 'relative', overflow: 'hidden',
            }}>
                <Box aria-hidden sx={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${T.amberGlow} 0%, transparent 65%)`,
                    opacity: 0.4,
                }} />
                <Container maxWidth="lg" sx={{ position: 'relative' }}>
                    <Grid container spacing={2.5} justifyContent="center">
                        {statsData.map((s, i) => (
                            <Grid size={{ xs: 6, md: 3 }} key={s.label}>
                                <Reveal delay={i * 0.08}>
                                    <StatCard value={s.value} suffix={s.suffix} label={s.label} icon={s.icon} grad={s.grad} glow={s.glow} />
                                </Reveal>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* ══════════════ FEATURES ════════════════════════════════ */}
            <Box id="features" component="section" sx={{
                bgcolor: T.bgLight, py: { xs: 7, md: 10 }, scrollMarginTop: '80px',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Subtle mesh grid background */}
                <Box aria-hidden sx={{
                    position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4,
                    backgroundImage: `linear-gradient(${T.borderLt} 1px, transparent 1px), linear-gradient(90deg, ${T.borderLt} 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }} />
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Reveal>
                        <Box sx={{ textAlign: 'center', mb: 6 }}>
                            <SectionBadge>Everything You Need</SectionBadge>
                            <SectionTitle>Built for Speed, Security &amp; Scale</SectionTitle>
                            <SectionSub>Every feature you need to launch and grow your online presence — all included.</SectionSub>
                        </Box>
                    </Reveal>
                    <Grid container spacing={3}>
                        {features.map((f, i) => {
                            const Icon = f.icon;
                            /* extract a glow color from the gradient string */
                            const glowColor = f.grad.match(/#[0-9a-f]{6}/i)?.[0] ?? T.amber;
                            return (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={f.title}>
                                    <Reveal delay={i * 0.06}>
                                        <motion.div whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 380, damping: 28 }} style={{ height: '100%' }}>
                                            <Paper elevation={0} sx={{
                                                p: 3.5, borderRadius: R, height: '100%',
                                                border: `1px solid ${T.borderLt}`, bgcolor: '#fff',
                                                position: 'relative', overflow: 'hidden',
                                                transition: 'box-shadow 0.28s, border-color 0.28s',
                                                /* per-card colored top border on hover */
                                                '&::before': {
                                                    content: '""', position: 'absolute', top: 0, left: 0, right: 0,
                                                    height: 3, background: f.grad,
                                                    transform: 'scaleX(0)', transformOrigin: 'left',
                                                    transition: 'transform 0.32s ease',
                                                    borderTopLeftRadius: R, borderTopRightRadius: R,
                                                },
                                                '&:hover': {
                                                    boxShadow: `0 24px 56px ${glowColor}22`,
                                                    borderColor: `${glowColor}44`,
                                                    '&::before': { transform: 'scaleX(1)' },
                                                },
                                            }}>
                                                <motion.div whileHover={{ rotate: [0, -8, 8, 0], scale: 1.08 }} transition={{ duration: 0.4 }}>
                                                    <Box sx={{
                                                        width: 56, height: 56, borderRadius: '16px', mb: 2.5,
                                                        background: f.grad, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        boxShadow: `0 10px 28px ${glowColor}40`,
                                                    }}>
                                                        <Icon size={26} color="#fff" strokeWidth={2} />
                                                    </Box>
                                                </motion.div>
                                                <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', mb: 1, color: T.textDk, fontFamily: '"Outfit",sans-serif' }}>
                                                    {f.title}
                                                </Typography>
                                                <Typography sx={{ color: T.mutedDk, fontSize: '0.9rem', lineHeight: 1.68 }}>
                                                    {f.desc}
                                                </Typography>
                                            </Paper>
                                        </motion.div>
                                    </Reveal>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Container>
            </Box>

            {/* ══════════════ HOW IT WORKS ════════════════════════════ */}
            <Box id="how-it-works" component="section" sx={{
                bgcolor: T.bgLight,
                py: { xs: 8, md: 12 }, scrollMarginTop: '80px', position: 'relative', overflow: 'hidden',
            }}>
                {/* subtle background decoration */}
                <Box aria-hidden sx={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: [
                        `radial-gradient(ellipse 50% 40% at 0% 30%, rgba(245,158,11,0.06) 0%, transparent 60%)`,
                        `radial-gradient(ellipse 40% 35% at 100% 70%, rgba(124,58,237,0.05) 0%, transparent 55%)`,
                    ].join(','),
                }} />
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Reveal>
                        <Box sx={{ textAlign: 'center', mb: { xs: 7, md: 9 } }}>
                            <SectionBadge>Simple Process</SectionBadge>
                            <SectionTitle>Get Online in 3 Easy Steps</SectionTitle>
                            <SectionSub>From searching your domain name to going live — less than 5 minutes.</SectionSub>
                        </Box>
                    </Reveal>

                    {/* Steps — alternating layout */}
                    <Stack spacing={{ xs: 6, md: 0 }}>
                        {howItWorks.map((step, i) => {
                            const Icon = step.icon;
                            const isEven = i % 2 === 1;
                            const gradients = [
                                `linear-gradient(135deg, ${T.amber} 0%, ${T.amberDk} 100%)`,
                                `linear-gradient(135deg, ${T.violet} 0%, #4f46e5 100%)`,
                                `linear-gradient(135deg, #10b981 0%, #059669 100%)`,
                            ];
                            const glows = [T.amberGlow, T.violetGlow, 'rgba(16,185,129,0.22)'];
                            const bgAccents = ['rgba(245,158,11,0.06)', 'rgba(124,58,237,0.06)', 'rgba(16,185,129,0.06)'];
                            return (
                                <Box key={step.step} sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: isEven ? 'row-reverse' : 'row' },
                                    alignItems: 'center',
                                    gap: { xs: 4, md: 8 },
                                    py: { xs: 2, md: 5 },
                                    position: 'relative',
                                    '&:not(:last-child)::after': {
                                        content: '""',
                                        display: { xs: 'none', md: 'block' },
                                        position: 'absolute',
                                        bottom: 0,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: 2,
                                        height: 40,
                                        background: `linear-gradient(to bottom, ${T.borderLt}, transparent)`,
                                    },
                                }}>
                                    {/* Visual side */}
                                    <Reveal from={isEven ? 'right' : 'left'} delay={0.05}>
                                        <Box sx={{
                                            flex: '0 0 auto',
                                            width: { xs: 220, md: 300 },
                                            height: { xs: 220, md: 300 },
                                            borderRadius: '50%',
                                            background: bgAccents[i],
                                            border: `2px solid ${glows[i].replace('0.22', '0.18')}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            position: 'relative',
                                            mx: 'auto',
                                            boxShadow: `0 0 0 12px ${bgAccents[i]}`,
                                        }}>
                                            {/* Step number badge */}
                                            <Box sx={{
                                                position: 'absolute', top: 10, right: 10,
                                                width: 44, height: 44, borderRadius: '50%',
                                                background: gradients[i],
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: `0 4px 14px ${glows[i]}`,
                                                zIndex: 1,
                                            }}>
                                                <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#fff', fontFamily: '"Outfit",sans-serif' }}>
                                                    {step.step}
                                                </Typography>
                                            </Box>
                                            {/* Main icon circle */}
                                            <motion.div
                                                animate={rm ? {} : { y: [0, -10, 0] }}
                                                transition={{ duration: 3.5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
                                            >
                                                <Box sx={{
                                                    width: { xs: 110, md: 140 },
                                                    height: { xs: 110, md: 140 },
                                                    borderRadius: '50%',
                                                    background: gradients[i],
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    boxShadow: `0 20px 60px ${glows[i]}`,
                                                }}>
                                                    <Icon size={56} color="#fff" strokeWidth={1.8} />
                                                </Box>
                                            </motion.div>
                                        </Box>
                                    </Reveal>

                                    {/* Text side */}
                                    <Reveal from={isEven ? 'left' : 'right'} delay={0.12}>
                                        <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' }, maxWidth: { md: 480 } }}>
                                            <Box sx={{
                                                display: 'inline-block',
                                                background: gradients[i],
                                                borderRadius: '8px',
                                                px: 1.5, py: 0.4, mb: 2,
                                            }}>
                                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                                                    Step {step.step}
                                                </Typography>
                                            </Box>
                                            <Typography sx={{
                                                fontWeight: 800, fontSize: { xs: '1.6rem', md: '2rem' },
                                                color: T.textDk, mb: 1.75, lineHeight: 1.15,
                                                fontFamily: '"Outfit","DM Sans",sans-serif', letterSpacing: '-0.02em',
                                            }}>
                                                {step.title}
                                            </Typography>
                                            <Typography sx={{ color: T.mutedDk, fontSize: '1.0125rem', lineHeight: 1.75, mb: 3 }}>
                                                {step.desc}
                                            </Typography>
                                            {i === 2 && (
                                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
                                                    <Button variant="contained" size="large" endIcon={<ArrowRight size={18} />}
                                                        onClick={() => document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' })}
                                                        sx={{
                                                            background: `linear-gradient(135deg, ${T.amberLt} 0%, ${T.amber} 55%, ${T.amberDk} 100%)`,
                                                            color: '#0a0f1e', fontWeight: 800, borderRadius: RS, px: 3.5, py: 1.4,
                                                            boxShadow: `0 6px 24px ${T.amberGlow}`,
                                                            '&:hover': { filter: 'brightness(1.1)' },
                                                        }}>
                                                        Search Your Domain Now
                                                    </Button>
                                                </motion.div>
                                            )}
                                        </Box>
                                    </Reveal>
                                </Box>
                            );
                        })}
                    </Stack>
                </Container>
            </Box>

            {/* ══════════════ HOSTING PLANS ═══════════════════════════ */}
            {/* Hosting plans hidden for now */}

            {/* ══════════════ WHY CHOOSE US ═══════════════════════════ */}
            <Box id="platform" component="section" sx={{
                background: `linear-gradient(155deg, ${T.bgDeep} 0%, #0a1028 55%, #070c1d 100%)`,
                py: { xs: 7, md: 10 }, scrollMarginTop: '80px', position: 'relative', overflow: 'hidden',
            }}>
                <Box aria-hidden sx={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: `radial-gradient(ellipse 70% 50% at 100% 50%, ${T.violetGlow} 0%, transparent 55%)`,
                }} />
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Reveal from="left">
                                <SectionBadge>Why Plan A Hosting</SectionBadge>
                                <SectionTitle light>India's Most Trusted Domain &amp; Hosting Platform</SectionTitle>
                                <Typography sx={{ color: T.muted, fontSize: '1rem', lineHeight: 1.72, mt: 2, mb: 3.5 }}>
                                    Helping Indian businesses establish their online presence since 2014.
                                    From solopreneurs to enterprises — thousands of customers trust us with their most important digital asset.
                                </Typography>
                                <Stack spacing={1.5} sx={{ mb: 4 }}>
                                    {['ICANN Accredited Registrar','Data Centres in India','GST Compliant Invoices','Free WHOIS Privacy on all domains','24/7 Hindi & English Support'].map((item) => (
                                        <Stack key={item} direction="row" spacing={1.5} alignItems="center">
                                            <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: `${T.success}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <CheckCircle size={14} color={T.success} />
                                            </Box>
                                            <Typography sx={{ color: 'rgba(241,245,249,0.9)', fontSize: '0.9375rem' }}>{item}</Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Button variant="contained" endIcon={<ArrowRight size={18} />} onClick={() => navigate('/signup')} sx={{
                                        background: `linear-gradient(135deg, ${T.amberLt} 0%, ${T.amber} 55%, ${T.amberDk} 100%)`,
                                        color: '#0a0f1e', fontWeight: 800, borderRadius: RS, px: 3.5, py: 1.4,
                                        boxShadow: `0 6px 24px ${T.amberGlow}`,
                                        '&:hover': { filter: 'brightness(1.1)' },
                                    }}>
                                        Create Free Account
                                    </Button>
                                </motion.div>
                            </Reveal>
                        </Grid>
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Grid container spacing={2.5}>
                                {whyUs.map((item, i) => {
                                    const Icon = item.icon;
                                    return (
                                        <Grid size={{ xs: 12, sm: 6 }} key={item.title}>
                                            <Reveal delay={i * 0.07}>
                                                <motion.div whileHover={{ y: -3 }} transition={EASE_SPRING}>
                                                    <Paper elevation={0} sx={{
                                                        p: 3, borderRadius: R, bgcolor: T.bgCard,
                                                        border: `1px solid ${T.border}`, transition: 'all 0.2s',
                                                        '&:hover': { bgcolor: T.bgCardHov, borderColor: `${T.amber}35` },
                                                    }}>
                                                        <Stack direction="row" spacing={2} alignItems="flex-start">
                                                            <Box sx={{
                                                                width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
                                                                background: `linear-gradient(135deg, ${T.amber}, ${T.amberDk})`,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                boxShadow: `0 4px 14px ${T.amberGlow}`,
                                                            }}>
                                                                <Icon size={20} color="#0a0f1e" strokeWidth={2.2} />
                                                            </Box>
                                                            <Box>
                                                                <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: T.textLt, mb: 0.5, fontFamily: '"Outfit",sans-serif' }}>
                                                                    {item.title}
                                                                </Typography>
                                                                <Typography sx={{ color: T.muted, fontSize: '0.84rem', lineHeight: 1.62 }}>
                                                                    {item.desc}
                                                                </Typography>
                                                            </Box>
                                                        </Stack>
                                                    </Paper>
                                                </motion.div>
                                            </Reveal>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* ══════════════ TESTIMONIALS ════════════════════════════ */}
            <Box component="section" sx={{
                bgcolor: T.bgLight, py: { xs: 7, md: 10 },
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Large decorative background quote */}
                <Typography aria-hidden sx={{
                    position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
                    fontSize: '28rem', fontWeight: 900, lineHeight: 1,
                    color: T.amber, opacity: 0.03, pointerEvents: 'none', userSelect: 'none',
                    fontFamily: 'Georgia, serif',
                }}>
                    "
                </Typography>
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Reveal>
                        <Box sx={{ textAlign: 'center', mb: 6 }}>
                            <SectionBadge>Customer Stories</SectionBadge>
                            <SectionTitle>Loved by Thousands of Indian Businesses</SectionTitle>
                            <SectionSub>Don't take our word for it — hear from our customers.</SectionSub>
                        </Box>
                    </Reveal>
                    <Grid container spacing={3}>
                        {testimonials.map((t, i) => {
                            const accentGrads = [
                                `linear-gradient(180deg, ${T.amber}, ${T.amberDk})`,
                                `linear-gradient(180deg, ${T.violet}, #4f46e5)`,
                                `linear-gradient(180deg, #10b981, #059669)`,
                                `linear-gradient(180deg, ${T.cyan}, #0284c7)`,
                            ];
                            return (
                                <Grid size={{ xs: 12, sm: 6 }} key={t.name}>
                                    <Reveal delay={i * 0.08}>
                                        <motion.div whileHover={{ y: -6 }} transition={EASE_SPRING} style={{ height: '100%' }}>
                                            <Paper elevation={0} sx={{
                                                p: 3.5, borderRadius: R, height: '100%',
                                                border: `1px solid ${T.borderLt}`, bgcolor: '#fff',
                                                position: 'relative', overflow: 'hidden',
                                                transition: 'box-shadow 0.26s, border-color 0.26s',
                                                '&:hover': { boxShadow: '0 20px 52px rgba(0,0,0,0.1)', borderColor: `${T.amber}45` },
                                            }}>
                                                {/* Colored left accent bar */}
                                                <Box sx={{
                                                    position: 'absolute', left: 0, top: 0, bottom: 0,
                                                    width: 4, background: accentGrads[i % accentGrads.length],
                                                    borderTopLeftRadius: R, borderBottomLeftRadius: R,
                                                }} />
                                                {/* Decorative quote mark */}
                                                <Typography aria-hidden sx={{
                                                    position: 'absolute', top: 10, right: 20,
                                                    fontSize: '5rem', lineHeight: 1, fontWeight: 900,
                                                    color: T.amber, opacity: 0.08,
                                                    fontFamily: 'Georgia, serif', pointerEvents: 'none',
                                                }}>
                                                    "
                                                </Typography>
                                                <Box sx={{ pl: 1.5 }}>
                                                    <Stack direction="row" spacing={0.4} sx={{ mb: 2 }}>
                                                        {Array.from({ length: t.stars }).map((_, si) => (
                                                            <Star key={si} size={15} color={T.amber} fill={T.amber} />
                                                        ))}
                                                    </Stack>
                                                    <Typography sx={{ color: T.mutedDk, fontSize: '0.9375rem', lineHeight: 1.74, mb: 3, fontStyle: 'italic' }}>
                                                        "{t.text}"
                                                    </Typography>
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        <Box sx={{
                                                            width: 48, height: 48, borderRadius: '50%',
                                                            background: accentGrads[i % accentGrads.length],
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '0.82rem', fontWeight: 800, color: '#fff', flexShrink: 0,
                                                            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                                                        }}>
                                                            {t.av}
                                                        </Box>
                                                        <Box>
                                                            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: T.textDk }}>{t.name}</Typography>
                                                            <Typography sx={{ color: T.mutedDk, fontSize: '0.8rem' }}>{t.role}</Typography>
                                                        </Box>
                                                    </Stack>
                                                </Box>
                                            </Paper>
                                        </motion.div>
                                    </Reveal>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Container>
            </Box>

            {/* ══════════════ FAQ ══════════════════════════════════════ */}
            <Box id="faq" component="section" sx={{
                background: `linear-gradient(160deg, #08102a 0%, ${T.bgDeep} 55%, #070c1d 100%)`,
                py: { xs: 7, md: 10 }, scrollMarginTop: '80px',
            }}>
                <Container maxWidth="md">
                    <Reveal>
                        <Box sx={{ textAlign: 'center', mb: 6 }}>
                            <SectionBadge>FAQ</SectionBadge>
                            <SectionTitle light>Frequently Asked Questions</SectionTitle>
                            <SectionSub light>Everything you need to know about domains and hosting.</SectionSub>
                        </Box>
                    </Reveal>
                    <Stack spacing={1.5}>
                        {faqs.map((faq, i) => (
                            <Reveal key={i} delay={i * 0.04}>
                                <Accordion expanded={openFaq === i} onChange={() => setOpenFaq(openFaq === i ? false : i)} elevation={0}
                                    sx={{
                                        bgcolor: openFaq === i ? 'rgba(245,158,11,0.07)' : T.bgCard,
                                        border: `1px solid ${openFaq === i ? T.amber + '55' : T.border}`,
                                        borderRadius: `${R} !important`, '&:before': { display: 'none' },
                                        overflow: 'hidden', transition: 'all 0.2s',
                                    }}>
                                    <AccordionSummary
                                        expandIcon={
                                            <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.25 }}>
                                                <ChevronDown size={20} color={openFaq === i ? T.amber : T.muted} />
                                            </motion.div>
                                        }
                                        sx={{ px: 3, py: 0.75 }}
                                    >
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: openFaq === i ? T.amber : T.textLt, fontFamily: '"Outfit",sans-serif' }}>
                                            {faq.q}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ px: 3, pb: 2.5 }}>
                                        <Typography sx={{ color: T.muted, fontSize: '0.9375rem', lineHeight: 1.72 }}>
                                            {faq.a}
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                            </Reveal>
                        ))}
                    </Stack>
                    <Reveal delay={0.2}>
                        <Box sx={{ mt: 5, textAlign: 'center' }}>
                            <Typography sx={{ color: T.muted, fontSize: '0.9375rem', mb: 2 }}>
                                Still have questions? Our support team is available 24/7.
                            </Typography>
                            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
                                <Button variant="outlined" startIcon={<Headphones size={18} />} onClick={() => navigate('/signup')} sx={{
                                    borderColor: T.amber, color: T.amber, fontWeight: 700, borderRadius: RS, px: 3,
                                    '&:hover': { bgcolor: T.amberBg, borderColor: T.amberDk },
                                }}>
                                    Contact Support
                                </Button>
                            </motion.div>
                        </Box>
                    </Reveal>
                </Container>
            </Box>

            {/* ══════════════ FINAL CTA ════════════════════════════════ */}
            <Box component="section" sx={{ bgcolor: T.bgLight, py: { xs: 8, md: 12 }, borderTop: `1px solid ${T.borderLt}` }}>
                <Container maxWidth="md">
                    <Reveal from="scale">
                        <Paper elevation={0} sx={{
                            p: { xs: 4, md: 7 }, borderRadius: '24px',
                            background: `linear-gradient(140deg, ${T.bgDeep} 0%, #0c1535 55%, #0a112e 100%)`,
                            border: `1px solid rgba(245,158,11,0.2)`,
                            textAlign: 'center', position: 'relative', overflow: 'hidden',
                            boxShadow: `0 40px 100px rgba(4,6,15,0.35), 0 0 0 1px rgba(245,158,11,0.08) inset`,
                        }}>
                            {/* multi-layer glow */}
                            <Box aria-hidden sx={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 500, height: 250, borderRadius: '50%', background: `radial-gradient(ellipse, ${T.amberGlow} 0%, transparent 65%)`, pointerEvents: 'none' }} />
                            <Box aria-hidden sx={{ position: 'absolute', bottom: -60, left: '10%', width: 280, height: 200, borderRadius: '50%', background: `radial-gradient(ellipse, ${T.violetGlow} 0%, transparent 65%)`, pointerEvents: 'none' }} />

                            <motion.div animate={rm ? {} : { y: [0, -8, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
                                <Globe size={52} color={T.amber} style={{ marginBottom: 20, filter: `drop-shadow(0 0 16px ${T.amberGlow})` }} />
                            </motion.div>

                            <Typography sx={{
                                color: T.textLt, fontSize: { xs: '1.8rem', md: '2.6rem' },
                                fontWeight: 900, lineHeight: 1.08, mb: 2,
                                fontFamily: '"Outfit",sans-serif', letterSpacing: '-0.025em',
                            }}>
                                Your domain is waiting.<br />
                                <Box component="span" sx={{
                                    background: `linear-gradient(135deg, ${T.amberLt} 0%, ${T.amber} 55%, ${T.amberDk} 100%)`,
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                }}>
                                    Claim it today.
                                </Box>
                            </Typography>
                            <Typography sx={{ color: T.muted, fontSize: '1.0625rem', lineHeight: 1.7, mb: 4.5, maxWidth: 480, mx: 'auto' }}>
                                Join 50,000+ Indian businesses who trust Plan A Hosting for their domain and hosting needs.
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Button variant="contained" size="large" endIcon={<ArrowRight size={20} />}
                                        onClick={() => document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' })}
                                        sx={{
                                            background: `linear-gradient(135deg, ${T.amberLt} 0%, ${T.amber} 55%, ${T.amberDk} 100%)`,
                                            color: '#0a0f1e', fontWeight: 800, borderRadius: RS, px: 4.5, py: 1.75, fontSize: '1rem',
                                            boxShadow: `0 8px 32px ${T.amberGlow}`,
                                            '&:hover': { filter: 'brightness(1.1)', boxShadow: `0 12px 40px rgba(245,158,11,0.42)` },
                                        }}>
                                        Search Your Domain
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Button variant="outlined" size="large" onClick={() => navigate('/signup')} sx={{
                                        borderColor: 'rgba(148,163,184,0.3)', color: T.textLt, fontWeight: 700,
                                        borderRadius: RS, px: 4.5, py: 1.75,
                                        '&:hover': { borderColor: T.amber, bgcolor: T.amberBg },
                                    }}>
                                        Create Free Account
                                    </Button>
                                </motion.div>
                            </Stack>
                            <Typography sx={{ mt: 3, color: T.muted, fontSize: '0.8125rem' }}>
                                No credit card required &nbsp;·&nbsp; Free WHOIS privacy &nbsp;·&nbsp; 30-day money-back guarantee
                            </Typography>
                        </Paper>
                    </Reveal>
                </Container>
            </Box>
        </Box>
    );
};

export default LandingPage;
