import AdbIcon from '@mui/icons-material/Adb';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../State/Authentication/Action';
import Login from '../../Pages/LoginPage/LoginPage';
import Signup from '../../Pages/SignupPage/SignupPage';

const Header = (props) => {
    const navigate = useNavigate();
    const dispatch=useDispatch();
    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginDialogueOpen, setLoginDialogueOpen] = useState(false);
    const [signupDialogueOpen, setSignupDialogueOpen] = useState(false);
    
    // Open Login dialog from signup page
    const handleSignupDialogFromLogin = () => {
        handleCloseLoginDialog();
        handleOpenSignupDialog();
    };

    // Open Signup dialog from login page
    const handleLoginDialogFromSignup = () => {
        handleCloseSignupDialog();
        handleOpenLoginDialog();
    };

    // Open the login dialogue Box
    const handleOpenLoginDialog = () => {
        setLoginDialogueOpen(true);
    };

    // Close the Login dialogue Box
    const handleCloseLoginDialog = () => {
        setLoginDialogueOpen(false);
    };

    // Open the login dialogue Box
    const handleOpenSignupDialog = () => {
        setSignupDialogueOpen(true);
    };

    // Close the Login dialogue Box
    const handleCloseSignupDialog = () => {
        setSignupDialogueOpen(false);
    };

    // Check for JWT in localStorage on component mount
    useEffect(() => {
        const jwt = localStorage.getItem('JWT');
        setIsLoggedIn(!!jwt);
    }, []);

    // opens the navigation menu
    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    // opens the user menu
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    // closes the navigation menu
    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    // closes the user menu
    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    // handle the login 
    const handleLogin = () => {
        setLoginDialogueOpen(true);
    };

    // handle the logout
    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
        window.location.reload();
        handleCloseNavMenu();
    };

    // handle the hunt navigation clicked
    const handleHuntClicked = () => {
            navigate('/hunts');
        // take user to pre-defined hunt page where he can participate in a hunt
        handleCloseNavMenu();
    };

    // handle the create navigation clicked
    const handleCreateClicked = () => {
        navigate('/create-hunt');
        handleCloseNavMenu();
    };

    // handle the custom navigation clicked
    const handleCustomeClicked = () => {
        handleCloseNavMenu();
    }

    // just a comment
    // const navigateToHome=()=>{
    //     navigate('/');
    // }

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        RAFTEL
                    </Typography>

                    {/* Menu for small screens */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                            keepMounted
                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{ display: { xs: 'block', md: 'none' } }}
                        >
                            <MenuItem key="hunt" onClick={handleHuntClicked}>
                                <Typography sx={{ textAlign: 'center' }}>Hunt</Typography>
                            </MenuItem>
                            <MenuItem key="create" onClick={handleCreateClicked}>
                                <Typography sx={{ textAlign: 'center' }}>Create</Typography>
                            </MenuItem>
                            <MenuItem key="custom" onClick={handleCustomeClicked}>
                                <Typography sx={{ textAlign: 'center' }}>Custom</Typography>
                            </MenuItem>
                        </Menu>
                    </Box>

                    <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        RAFTEL
                    </Typography>

                    {/* Menu for larger screens */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        <Button key="hunt" onClick={handleHuntClicked} sx={{ my: 2, color: 'white', display: 'block' }}>
                            Hunt
                        </Button>
                        <Button key="create" onClick={handleCreateClicked} sx={{ my: 2, color: 'white', display: 'block' }}>
                            Create
                        </Button>
                        <Button key="custom" onClick={handleCustomeClicked} sx={{ my: 2, color: 'white', display: 'block' }}>
                            Custom
                        </Button>
                    </Box>

                    {/* Conditional rendering for login/logout and profile */}
                    {isLoggedIn ? (
                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="Open settings">
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                    <Avatar alt="User Avatar" src="/static/images/avatar/2.jpg" />
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                keepMounted
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                <MenuItem key="profile" onClick={handleCloseUserMenu}>
                                    <Typography onClick={()=>navigate('/profile')} sx={{ textAlign: 'center' }}>Profile</Typography>
                                </MenuItem>
                                <MenuItem key="leaderboard" onClick={handleCloseUserMenu}>
                                    <Typography onClick={()=>navigate('/profile')} sx={{ textAlign: 'center' }}>Leaderboard</Typography>
                                </MenuItem>
                                <MenuItem key="logout" onClick={handleLogout}>
                                    <Typography sx={{ textAlign: 'center' }}>Logout</Typography>
                                </MenuItem>
                            </Menu>
                        </Box>
                    ) : (
                        <Box>
                            <Button
                                variant="contained"
                                onClick={handleLogin}
                                sx={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}
                            >
                                <Typography variant="button">Login</Typography>
                            </Button>
                        </Box>
                    )}
                </Toolbar>
            </Container>
            <Login open={loginDialogueOpen} handleClose={handleCloseLoginDialog} handleSignup={handleSignupDialogFromLogin} />
            <Signup open={signupDialogueOpen} onClose={handleCloseSignupDialog} handleLogin={handleLoginDialogFromSignup} />
        </AppBar>
    );
};

export default Header;
