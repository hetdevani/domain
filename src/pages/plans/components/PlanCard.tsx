import { Box, Typography, Button, Paper, List, ListItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { Shield, Globe, Users, Clock, Mail, MessageSquare, Webhook } from 'lucide-react';
import type { IPlan } from '../../../types';

interface PlanCardProps {
    plan: IPlan;
    onEdit?: (plan: IPlan) => void;
    isAdmin?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onEdit, isAdmin }) => {
    // const isFree = plan.price === 0;

    const features = [
        { icon: <Shield size={18} />, text: `${plan.maxMonitors} Monitors`, subtext: `Min interval: ${plan.minCheckInterval} min` },
        { icon: <Globe size={18} />, text: `${plan.maxStatusPages} Status Pages` },
        { icon: <Users size={18} />, text: `${plan.maxTeamMembers} Team Members` },
        { icon: <Clock size={18} />, text: `${plan.logRetentionDays} Days Log Retention` },
    ];

    const notifications = [
        { icon: <Mail size={16} />, active: plan.emailNotifications, label: 'Email' },
        { icon: <MessageSquare size={16} />, active: plan.smsNotifications, label: 'SMS' },
        { icon: <Webhook size={16} />, active: plan.webhookNotifications, label: 'Webhook' },
    ];

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 4,
                border: '1px solid',
                borderColor: plan.isDefault ? 'primary.main' : 'divider',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                    borderColor: 'primary.main',
                }
            }}
        >
            {plan.isDefault && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 20,
                        right: -35,
                        transform: 'rotate(45deg)',
                        bgcolor: 'primary.main',
                        color: 'white',
                        py: 0.5,
                        px: 5,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        zIndex: 1
                    }}
                >
                    DEFAULT
                </Box>
            )}

            <Box sx={{ mb: 2 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#0A3D62' }}>
                        {plan.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40, fontSize: '0.8125rem', lineHeight: 1.4 }}>
                        {plan.description || 'Perfect for starting your monitoring journey.'}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    ${plan.price}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ ml: 1 }}>
                    /{plan.billingCycle}
                </Typography>
            </Box>

            <List sx={{ mb: 'auto' }}>
                {features.map((feature, index) => (
                    <ListItem key={index} disableGutters sx={{ py: 0.4 }}>
                        <ListItemIcon sx={{ minWidth: 32, color: 'primary.main' }}>
                            {feature.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={feature.text}
                            secondary={feature.subtext}
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                        />
                    </ListItem>
                ))}
            </List>

            <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 1.5 }}>
                    Notifications
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {notifications.map((n, i) => (
                        <Tooltip key={i} title={`${n.label}: ${n.active ? 'Enabled' : 'Disabled'}`}>
                            <Box
                                sx={{
                                    p: 1,
                                    borderRadius: 1.5,
                                    bgcolor: n.active ? 'rgba(46, 204, 113, 0.1)' : 'rgba(0,0,0,0.04)',
                                    color: n.active ? '#2ecc71' : 'text.disabled',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {n.icon}
                            </Box>
                        </Tooltip>
                    ))}
                </Box>
            </Box>

            {
                isAdmin && (
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            size="medium"
                            onClick={() => onEdit?.(plan)}
                            sx={{
                                borderRadius: 2,
                                fontWeight: 700,
                                boxShadow: 'none',
                                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
                            }}
                        >
                            Edit Plan Details
                        </Button>
                    </Box>
                )
            }
        </Paper >
    );
};

export default PlanCard;
