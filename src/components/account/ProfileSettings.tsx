import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
    Box, Typography, Paper, TextField, Button, Avatar, Badge,
    IconButton, CircularProgress, Stack, Alert, InputAdornment,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { updateUserProfile, updateUserPassword, deleteCurrentUserAccount } from '../../services/authService';
import { uploadImage } from '../../services/storageService';
import toast from 'react-hot-toast';

const ProfileSettings: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isUploading, setIsUploading] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUpdatingPass, setIsUpdatingPass] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [confirmationText, setConfirmationText] = useState('');

    const openDeleteDialog = () => setDeleteDialogOpen(true);
    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setConfirmationText('');
    };

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !currentUser) return;

        setIsUploading(true);
        const toastId = toast.loading('Uploading picture...');
        try {
            const photoURL = await uploadImage(file, currentUser.uid);
            await updateUserProfile({ photoURL });
            toast.success('Profile picture updated!', { id: toastId });
            window.location.reload();
        } catch (error) {
            toast.error('Failed to upload image.', { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (displayName === currentUser?.displayName) return;

        setIsUpdatingProfile(true);
        try {
            await updateUserProfile({ displayName });
            toast.success('Display name updated!');
            window.location.reload();
        } catch (error) {
            toast.error('Failed to update profile.');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }

        setIsUpdatingPass(true);
        try {
            await updateUserPassword(newPassword);
            toast.success('Password updated successfully! You have been logged out.');
            await logout();
        } catch (error: any) {
             if (error.code === 'auth/requires-recent-login') {
                toast.error("Please log out and log back in to change your password.", { duration: 5000 });
            } else {
                toast.error('Failed to update password.');
            }
        } finally {
            setIsUpdatingPass(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (confirmationText !== 'DELETE') {
            toast.error('Please type DELETE to confirm.');
            return;
        }
        
        closeDeleteDialog();
        if (!currentUser) {
            toast.error("No user is signed in.");
            return;
        }
        try {
            await deleteCurrentUserAccount();
            toast.success("Account deleted successfully.");
            navigate('/auth');
        } catch (error: any) {
            console.error("Delete account error:", error);
            if (error.code === 'auth/requires-recent-login') {
                toast.error("This operation is sensitive and requires recent authentication. Please log out and log back in to delete your account.");
            } else {
                toast.error("Failed to delete account. Please try again.");
            }
        }
    };

    const cardStyles = {
        p: { xs: 2, md: 4 },
        borderRadius: '16px',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        background: 'linear-gradient(145deg, #ffffff, #f7f9fc)',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
        },
    };

    const buttonStyles = {
        fontWeight: 'bold',
        borderRadius: '8px',
        px: 3,
        py: 1.5,
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        }
    };

    return (
        <>
            <Stack spacing={5} sx={{ maxWidth: '800px' }}>
                <Paper component="form" onSubmit={handleProfileUpdate} sx={cardStyles}>
                    <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                        Profile Details
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems="center">
                        <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                                <IconButton onClick={handleAvatarClick} sx={{ bgcolor: 'primary.main', color: 'white', p: 1, boxShadow: '0 2px 5px rgba(0,0,0,0.2)', '&:hover': { bgcolor: 'primary.dark' } }}>
                                    {isUploading ? <CircularProgress size={24} color="inherit" /> : <EditIcon />}
                                </IconButton>
                            }
                        >
                            <Avatar src={currentUser?.photoURL || ''} sx={{ width: 100, height: 100, border: '3px solid white', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}/>
                        </Badge>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" hidden />
                        
                        <Stack spacing={2.5} sx={{ width: '100%' }}>
                            <TextField fullWidth label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} variant="filled" />
                            <TextField fullWidth label="Email Address" value={currentUser?.email || ''} disabled variant="filled" />
                        </Stack>
                    </Stack>
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="submit" variant="contained" sx={buttonStyles} disabled={isUpdatingProfile || displayName === currentUser?.displayName}>
                            {isUpdatingProfile ? <CircularProgress size={24} color="inherit" /> : 'Save Profile'}
                        </Button>
                    </Box>
                </Paper>

                <Paper component="form" onSubmit={handlePasswordUpdate} sx={cardStyles}>
                     <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                        Change Password
                    </Typography>
                    <Alert severity="warning" sx={{ mb: 3, borderRadius: '8px' }}>For your security, you will be logged out after a successful password change.</Alert>
                    <Stack spacing={3}>
                        <TextField
                            type={showNewPassword ? 'text' : 'password'}
                            label="New Password"
                            variant="filled"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            type={showConfirmPassword ? 'text' : 'password'}
                            label="Confirm New Password"
                            variant="filled"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Stack>
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="submit" variant="contained" sx={buttonStyles} disabled={isUpdatingPass || !newPassword}>
                            {isUpdatingPass ? <CircularProgress size={24} color="inherit" /> : 'Update Password'}
                        </Button>
                    </Box>
                </Paper>
                
                <Paper sx={{ ...cardStyles, border: '1px solid', borderColor: 'error.main' }}>
                    <Typography variant="h5" color="error" sx={{ fontWeight: 'bold' }} gutterBottom>
                        Danger Zone
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Once you delete your account, there is no going back. All associated data will be permanently removed. Please be certain.
                    </Typography>
                    <Button variant="contained" color="error" onClick={openDeleteDialog} sx={buttonStyles}>
                        Delete My Account
                    </Button>
                </Paper>
            </Stack>

            <Dialog
                open={deleteDialogOpen}
                onClose={closeDeleteDialog}
                aria-labelledby="delete-account-dialog-title"
            >
                <DialogTitle id="delete-account-dialog-title" sx={{ textAlign: 'center', pt: 3 }}>
                    <Stack direction="column" alignItems="center" spacing={1}>
                        <WarningAmberIcon sx={{ fontSize: '3.5rem', color: 'error.main' }} />
                        <Typography variant="h5" component="span" sx={{ fontWeight: 'bold' }}>
                            Are you absolutely sure?
                        </Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText component="div" sx={{ textAlign: 'center', mb: 2 }}>
                        This action is irreversible. All of your data will be permanently deleted.
                        <Box component="ul" sx={{ textAlign: 'left', mt: 2, pl: 4, color: 'text.secondary' }}>
                            <li>Your user profile (email, name, photo)</li>
                            <li>All active court notification requests</li>
                        </Box>
                    </DialogContentText>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                        To confirm, please type <strong>DELETE</strong> in the box below.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="delete-confirmation"
                        label="Type DELETE to confirm"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        placeholder="DELETE"
                        autoComplete="off"
                    />
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px' }}>
                    <Button onClick={closeDeleteDialog} variant="outlined" color="secondary">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteAccount}
                        variant="contained"
                        color="error"
                        disabled={confirmationText !== 'DELETE'}
                    >
                        Delete My Account
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ProfileSettings;