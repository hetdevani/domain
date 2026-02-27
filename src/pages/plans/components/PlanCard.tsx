import { Box, Typography, Button, Paper, List, ListItem, ListItemIcon, ListItemText, Tooltip, alpha } from '@mui/material';
import { Shield, Globe, Users, Clock, Mail, MessageSquare, Webhook, Check } from 'lucide-react';
import type { IPlan } from '../../../types';

interface PlanCardProps {
    plan: IPlan;
    onEdit?: (plan: IPlan) => void;
    isAdmin?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onEdit, isAdmin }) => {
    const features = [
        { icon: <Shield size={16} />, text: `${plan.maxMonitors} Monitors`, subtext: `Min interval: ${plan.minCheckInterval} min` },
        { icon: <Globe size={16} />, text: `${plan.maxStatusPages} Status Pages` },
        { icon: <Users size={16} />, text: `${plan.maxTeamMembers} Team Members` },
        { icon: <Clock size={16} />, text: `${plan.logRetentionDays} Days Log Retention` },
    ];

    const notifications = [
        { icon: <Mail size={14} />, active: plan.emailNotifications, label: 'Email' },
        { icon: <MessageSquare size={14} />, active: plan.smsNotifications, label: 'SMS' },
        { icon: <Webhook size={14} />, active: plan.webhookNotifications, label: 'Webhook' },
    ];

    return (
        <Paper
            elevation={0}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                border: plan.isDefault ? '2px solid #0A3D62' : '1px solid rgba(0,0,0,0.08)',
                overflow: 'hidden',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
                    borderColor: '#0A3D62',
                }
            }}
        >
            {/* Card Header */}
            <Box sx={{
                p: 3,
                background: plan.isDefault
                    ? 'linear-gradient(135deg, #0A3D62 0%, #1a5276 100%)'
                    : 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {plan.isDefault && (
                    <Box sx={{
                        position: 'absolute',
                        top: 14,
                        right: -28,
                        transform: 'rotate(45deg)',
                        bgcolor: '#2ECC71',
                        color: 'white',
                        py: 0.4,
                        px: 5,
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        boxShadow: '0 2px 8px rgba(46,204,113,0.4)',
                    }}>
                        Default
                    </Box>
                )}

                <Typography variant="overline" sx={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: plan.isDefault ? 'rgba(255,255,255,0.7)' : '#64748b',
                    display: 'block',
                    mb: 0.5
                }}>
                    Plan
                </Typography>
                <Typography variant="h5" sx={{
                    fontWeight: 900,
                    color: plan.isDefault ? '#ffffff' : '#0A3D62',
                    letterSpacing: '-0.02em',
                    mb: 0.5
                }}>
                    {plan.name}
                </Typography>
                <Typography variant="body2" sx={{
                    color: plan.isDefault ? 'rgba(255,255,255,0.75)' : '#64748b',
                    fontSize: '0.8125rem',
                    lineHeight: 1.5,
                    minHeight: 36
                }}>
                    {plan.description || 'Perfect for starting your monitoring journey.'}
                </Typography>
            </Box>

            {/* Price Section */}
            <Box sx={{ px: 3, pt: 2.5, pb: 1, display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#0A3D62', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    ${plan.price}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                    /{plan.billingCycle}
                </Typography>
            </Box>

            {/* Features */}
            <List sx={{ px: 2, flexGrow: 1 }}>
                {features.map((feature, index) => (
                    <ListItem key={index} disableGutters sx={{ py: 0.5, alignItems: 'flex-start' }}>
                        <ListItemIcon sx={{ minWidth: 28, mt: 0.25 }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                bgcolor: alpha('#0A3D62', 0.08),
                                color: '#0A3D62',
                            }}>
                                <Check size={12} strokeWidth={3} />
                            </Box>
                        </ListItemIcon>
                        <ListItemText
                            primary={feature.text}
                            secondary={feature.subtext}
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 600, color: '#374151', fontSize: '0.8375rem' }}
                            secondaryTypographyProps={{ variant: 'caption', color: 'text.disabled' }}
                        />
                    </ListItem>
                ))}
            </List>

            {/* Notifications */}
            <Box sx={{ px: 3, pb: 2, mt: 1 }}>
                <Typography variant="caption" sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color: '#94a3b8',
                    display: 'block',
                    mb: 1
                }}>
                    Notifications
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {notifications.map((n, i) => (
                        <Tooltip key={i} title={`${n.label}: ${n.active ? 'Enabled' : 'Disabled'}`}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                px: 1.25,
                                py: 0.6,
                                borderRadius: 1.5,
                                bgcolor: n.active ? alpha('#2ECC71', 0.1) : 'rgba(0,0,0,0.04)',
                                color: n.active ? '#2ecc71' : '#94a3b8',
                                border: `1px solid ${n.active ? alpha('#2ECC71', 0.2) : 'transparent'}`,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                cursor: 'default',
                            }}>
                                {n.icon}
                                <span>{n.label}</span>
                            </Box>
                        </Tooltip>
                    ))}
                </Box>
            </Box>

            {/* Action */}
            {isAdmin && (
                <Box sx={{ px: 3, pb: 3 }}>
                    <Button
                        fullWidth
                        variant={plan.isDefault ? 'contained' : 'outlined'}
                        size="medium"
                        onClick={() => onEdit?.(plan)}
                        sx={{
                            borderRadius: 2,
                            fontWeight: 700,
                            py: 1,
                            boxShadow: 'none',
                            bgcolor: plan.isDefault ? '#0A3D62' : 'transparent',
                            borderColor: plan.isDefault ? '#0A3D62' : 'rgba(10,61,98,0.25)',
                            color: plan.isDefault ? '#fff' : '#0A3D62',
                            '&:hover': {
                                boxShadow: '0 4px 14px rgba(10,61,98,0.2)',
                                bgcolor: plan.isDefault ? '#0d4d7a' : alpha('#0A3D62', 0.06),
                            }
                        }}
                    >
                        Edit Plan
                    </Button>
                </Box>
            )}
        </Paper>
    );
};

export default PlanCard;
