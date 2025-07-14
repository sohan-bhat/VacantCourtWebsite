import { useState, MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AddCourt from '../courts/AddCourt';
import {
    Button,
    CircularProgress,
    Box,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Divider,
    IconButton,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LoginIcon from '@mui/icons-material/Login';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import GavelIcon from '@mui/icons-material/Gavel';

import '../../styles/layout/Header.css';
import { useAuth } from '../auth/AuthContext';
import toast from 'react-hot-toast';

function Header() {
    const [openAddCourt, setOpenAddCourt] = useState(false);
    const { currentUser, logout, isLoading: authIsLoading } = useAuth();
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

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
            navigate('/auth');
        } catch (error) {
            toast.error('Failed to log out, please try again');
            console.error("Logout error:", error);
        }
    };

    return (
        <header className="app-header">
            <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <nav className='main-nav'>
                    <Link to="/" className="logo-link">
                        <img src='/ground.png' alt="Vacant Court Logo" className="header-logo-img" />
                        <span className="header-logo-text">Vacant Court</span>
                    </Link>
                </nav>

                <Box className="header-actions" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {authIsLoading ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        <>
                            {currentUser && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleOpenAddCourt}
                                    startIcon={<AddIcon />}
                                    sx={{fontFamily: ['Rubik']}}
                                >
                                    Add Court
                                </Button>
                            )}

                            {!currentUser && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => navigate('/auth')}
                                    startIcon={<LoginIcon />}
                                    sx={{ textTransform: 'none', fontFamily: 'Rubik' }}
                                >
                                    Login / Sign Up
                                </Button>
                            )}

                            {currentUser ? (
                                <Tooltip title="Account" arrow>
                                     <Box
                                        onClick={handleMenuOpen}
                                        aria-controls={menuOpen ? 'account-menu' : undefined}
                                        aria-haspopup="true"
                                        aria-expanded={menuOpen ? 'true' : undefined}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            p: '4px',
                                            borderRadius: '50px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                            boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.15)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                boxShadow: '0 0 0 1px rgba(0, 191, 255, 0.8)',
                                            }
                                        }}
                                    >
                                        <Box sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2px solid #00bfff'
                                        }}>
                                            {currentUser.photoURL ? (
                                                <Box component="img" src={currentUser.photoURL} alt="Profile" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <AccountCircleIcon sx={{ fontSize: '40px', color: 'white' }} />
                                            )}
                                        </Box>
                                        <Box sx={{
                                            display: { xs: 'none', sm: 'flex' },
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            color: 'white'
                                        }}>
                                            <Typography fontFamily={"Rubik"}sx={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.2 }}>
                                                {currentUser.displayName || 'User'}
                                            </Typography>
                                            <Typography fontFamily={"Rubik"}sx={{ fontSize: '0.75rem', opacity: 0.8, lineHeight: 1.2, marginRight: '5px' }}>
                                                {currentUser.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Tooltip>
                            ) : (
                                <Tooltip title="Menu" arrow>
                                    <IconButton
                                        onClick={handleMenuOpen}
                                        size="large"
                                        sx={{ color: 'white' }}
                                    >
                                        <MenuIcon sx={{ fontSize: '2rem' }} />
                                    </IconButton>
                                </Tooltip>
                            )}

                            <Menu
                                id="account-menu"
                                anchorEl={anchorEl}
                                open={menuOpen}
                                onClose={handleMenuClose}
                                MenuListProps={{ 'aria-labelledby': 'account-button' }}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            >
                                <MenuItem component={Link} to="/about" onClick={handleMenuClose}>
                                    <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                                    <ListItemText sx={{fontFamily: 'Rubik'}} disableTypography>About</ListItemText>
                                </MenuItem>
                                <MenuItem component={Link} to="/contact" onClick={handleMenuClose}>
                                    <ListItemIcon><ContactMailIcon fontSize="small" /></ListItemIcon>
                                    <ListItemText sx={{fontFamily: 'Rubik'}} disableTypography>Contact</ListItemText>
                                </MenuItem>

                                <Divider sx={{ my: 0.5 }} />

                                <MenuItem component={Link} to="/privacy" onClick={handleMenuClose}>
                                    <ListItemIcon><PrivacyTipIcon fontSize="small" /></ListItemIcon>
                                    <ListItemText sx={{fontFamily: 'Rubik'}} disableTypography>Privacy Policy</ListItemText>
                                </MenuItem>
                                <MenuItem component={Link} to="/tos" onClick={handleMenuClose}>
                                    <ListItemIcon><GavelIcon fontSize="small" /></ListItemIcon>
                                    <ListItemText sx={{fontFamily: 'Rubik'}} disableTypography>Terms of Service</ListItemText>
                                </MenuItem>

                                {currentUser && <Divider sx={{ my: 0.5 }} />}

                                {currentUser && (
                                    <MenuItem onClick={handleSettings}>
                                        <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                                        <ListItemText sx={{fontFamily: 'Rubik'}} disableTypography>Account Settings</ListItemText>
                                    </MenuItem>
                                )}
                                {currentUser && (
                                    <MenuItem onClick={handleLogout}>
                                        <ListItemIcon><ExitToAppIcon fontSize="small" /></ListItemIcon>
                                        <ListItemText sx={{fontFamily: 'Rubik'}} disableTypography>Log Out</ListItemText>
                                    </MenuItem>
                                )}
                            </Menu>
                        </>
                    )}
                </Box>
            </div>

            <AddCourt
                open={openAddCourt}
                onClose={() => setOpenAddCourt(false)}
            />
        </header>
    );
}

export default Header;