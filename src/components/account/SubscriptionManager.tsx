import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getRequestsByUserId, removeNotificationRequest, NotificationRequest } from '../../services/notificationService';
import { Paper, Typography, List, ListItem, ListItemText, IconButton, CircularProgress, Box, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import toast from 'react-hot-toast';

const SubscriptionManager: React.FC = () => {
    const { currentUser } = useAuth();
    const [subscriptions, setSubscriptions] = useState<NotificationRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        
        const fetchSubs = async () => {
            try {
                const subs = await getRequestsByUserId(currentUser.uid);
                setSubscriptions(subs);
            } catch (error) {
                toast.error("Could not fetch your subscriptions.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubs();
    }, [currentUser]);

    const handleCancelSub = async (requestId: string) => {
        try {
            await removeNotificationRequest(requestId);
            setSubscriptions(prev => prev.filter(sub => sub.id !== requestId));
            toast.success("Subscription cancelled.");
        } catch (error) {
            toast.error("Failed to cancel subscription.");
        }
    };

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    }

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>My Subscriptions</Typography>
            {subscriptions.length === 0 ? (
                <Alert severity="info">You are not subscribed to any court notifications.</Alert>
            ) : (
                <List>
                    {subscriptions.map((sub) => (
                        <ListItem
                            key={sub.id}
                            divider
                            secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => handleCancelSub(sub.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <ListItemText
                                primary={sub.courtName}
                                secondary={`Requested on: ${new Date().toLocaleDateString()}`}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Paper>
    );
};

export default SubscriptionManager;