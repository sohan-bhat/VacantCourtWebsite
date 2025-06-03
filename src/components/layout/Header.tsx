import { useState, MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AddCourt from '../courts/AddCourt';
import {
    Button,
    CircularProgress,
    Box,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LoginIcon from '@mui/icons-material/Login';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import '../../styles/layout/Header.css';
import { useAuth } from '../auth/AuthContext';
import { deleteCurrentUserAccount } from '../../services/database/authService';
import toast from 'react-hot-toast';

function Header() {
    const [openAddCourt, setOpenAddCourt] = useState(false);
    const { currentUser, logout, isLoading: authIsLoading } = useAuth();
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleOpenAddCourt = () => {
        if (!currentUser) {
            toast.error("Please log in to add a court.");
            navigate('/auth');
        } else {
            setOpenAddCourt(true);
        }
    };

    const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleSettings = () => {
        navigate('/account');
        handleMenuClose();
    };

    const handleLogout = async () => {
        handleMenuClose();
        try {
            await logout();
            toast.success("Logged out successfully");
            navigate('/');
        } catch (error) {
            toast.error('Failed to log out, please try again');
            console.error("Logout error:", error);
        }
    };

    const openDeleteDialog = () => {
        setDeleteDialogOpen(true);
        handleMenuClose();
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
    };

    const handleDeleteAccount = async () => {
        closeDeleteDialog();
        if (!currentUser) {
            toast.error("No user is signed in.");
            return;
        }
        try {
            await deleteCurrentUserAccount();
            toast.success("Account deleted successfully.");
            navigate('/');
        } catch (error: any) {
            console.error("Delete account error:", error);
            if (error.code === 'auth/requires-recent-login') {
                toast.error("This operation is sensitive and requires recent authentication. Please log out and log back in to delete your account.");
            } else {
                toast.error("Failed to delete account. Please try again.");
            }
        }
    };


    return (
        <header className="app-header">
            <div className="header-container">
                <nav className='main-nav'>
                    <Link to="/" className="logo-link">
                        <img src='/ground.png' alt="Vacant Court Logo" className="header-logo-img" />
                        <span className="header-logo-text">Vacant Court</span>
                    </Link>
                </nav>

                <Box className="header-actions" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {authIsLoading ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : currentUser ? (
                        <>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleOpenAddCourt}
                                startIcon={<AddIcon />}
                            >
                                Add Court
                            </Button>
                            <Tooltip title="Account settings" arrow>
                                <IconButton
                                    onClick={handleMenuOpen}
                                    size="large"
                                    sx={{ color: 'white' }}
                                    aria-controls={menuOpen ? 'account-menu' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={menuOpen ? 'true' : undefined}
                                >
                                    <AccountCircleIcon sx={{ fontSize: '2rem' }} />
                                </IconButton>
                            </Tooltip>
                            <Menu
                                id="account-menu"
                                anchorEl={anchorEl}
                                open={menuOpen}
                                onClose={handleMenuClose}
                                MenuListProps={{
                                    'aria-labelledby': 'account-button',
                                }}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                <MenuItem onClick={handleSettings}>
                                    <ListItemIcon>
                                        <SettingsIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Settings</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>
                                    <ListItemIcon>
                                        <ExitToAppIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Log Out</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={openDeleteDialog} sx={{ color: 'error.main' }}>
                                    <ListItemIcon>
                                        <DeleteForeverIcon fontSize="small" color="error" />
                                    </ListItemIcon>
                                    <ListItemText>Delete Account</ListItemText>
                                </MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/auth')}
                            startIcon={<LoginIcon />}
                            sx={{ textTransform: 'none' }}
                        >
                            Login / Sign Up
                        </Button>
                    )}
                </Box>
            </div>

            <AddCourt
                open={openAddCourt}
                onClose={() => setOpenAddCourt(false)}
            />

            <Dialog
                open={deleteDialogOpen}
                onClose={closeDeleteDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Delete Your Account?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data associated with this account will be removed.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteAccount} color="error" autoFocus>
                        Delete Account
                    </Button>
                </DialogActions>
            </Dialog>
        </header>
    );
}

export default Header;