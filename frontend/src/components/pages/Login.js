import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Swal from 'sweetalert2'; // Import SweetAlert2
import logo from '../assets/img/Logo.png'; // Import the logo
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  Divider,
  Fade,
  CircularProgress,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from '@mui/icons-material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (email === 'admin' && password === 'admin') {
    navigate('/super-admin-dashboard');
    return;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Hardcoded admin login for testing
    if (email === 'admin' && password === 'admin') {
      setLoading(false);
      navigate('/super-admin-dashboard');
      return;
    }

    try {
      const response = await api.post('api/auth/login', { email, password });

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'You have successfully logged in!',
        showConfirmButton: false,
        timer: 1500,
      });

    

      // Redirect based on user role
      if (response.data.user.isActive) {
          // Store user data in local storage
      localStorage.setItem('userId', response.data.user._id);
      localStorage.setItem('userRole', response.data.user.userRole);
        switch (response.data.user.userRole) {
          case 'HOD':
            navigate('/hod-dashboard');
            break;
          case 'Logistics Officer':
            navigate('/logistics-officer-dashboard');
            break;
          case 'Bursar':
            navigate('/bursar-dashboard');
            break;
          case 'Warehouse Officer':
            navigate('/warehouse-officer-dashboard');
            break;
          case 'Rector':
            navigate('/rector-dashboard');
            break;
          case 'Supplier':
            navigate('/supplier-dashboard');
            break;
          case 'Procurement Officer':
            navigate('/procurement-officer-dashboard');
            break;
          default:
            navigate('/user-dashboard');
        }
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Account Inactive',
          text: 'Your account is not active. Please contact the administrator.',
        });
      }
    } catch (error) {
      // Show error message
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.response?.data?.message || 'An error occurred. Please try again.',
      });
      console.error('Login Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Animation Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'float 20s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-20px) rotate(180deg)' },
          },
        }}
      />

      {/* Left Section: Visual Design */}
      <Fade in timeout={1000}>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 4,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box sx={{ textAlign: 'center', maxWidth: '600px' }}>
            {/* Logo Section */}
            <Fade in timeout={1500}>
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <img 
                    src={logo} 
                    alt="KDU Logo" 
                    style={{ 
                      height: '100px', 
                      width: 'auto',
                    }} 
                  />
                </Box>
              </Box>
            </Fade>
            
            <Fade in timeout={2000}>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold', 
                  mb: 3,
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                General Sir John Kotelawala Defence University Southern Campus 
              </Typography>
            </Fade>
            
            <Fade in timeout={2500}>
              <Typography 
                variant="h4" 
                sx={{ 
                  lineHeight: 1.6, 
                  mb: 4,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                  fontWeight: 300,
                }}
              >
                Tender Management System
              </Typography>
            </Fade>

            <Fade in timeout={3000}>
              <Box sx={{ mt: 4 }}>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', opacity: 0.9 }}>
                  Streamline your procurement process with our comprehensive tender management solution
                </Typography>
              </Box>
            </Fade>
          </Box>
        </Box>
      </Fade>

      {/* Right Section: Login Form */}
      <Fade in timeout={1000}>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Card
            elevation={24}
            sx={{
              width: '100%',
              maxWidth: '450px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 5 }}>
              {/* Logo in the login form */}
              

              <Fade in timeout={2000}>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  align="center" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                >
                  Welcome Back
                </Typography>
              </Fade>

              <Fade in timeout={2200}>
                <Typography 
                  variant="body1" 
                  align="center" 
                  sx={{ 
                    color: 'text.secondary',
                    mb: 4,
                  }}
                >
                  Sign in to your account to continue
                </Typography>
              </Fade>

              <Fade in timeout={2500}>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                        },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: '#667eea' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    sx={{ 
                      mb: 4,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                        },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#667eea' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleTogglePassword}
                            edge="end"
                            sx={{ color: '#667eea' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      mt: 2,
                      mb: 3,
                      py: 1.8,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                      },
                      '&:disabled': {
                        background: '#ccc',
                      },
                    }}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </Box>
              </Fade>

              <Fade in timeout={3000}>
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    or
                  </Typography>
                </Divider>
              </Fade>

              <Fade in timeout={3200}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Don't have an account?{' '}
                    <Link 
                      href="/register" 
                      variant="body2" 
                      sx={{ 
                        color: '#667eea', 
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          color: '#764ba2',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Create Account
                    </Link>
                  </Typography>
                </Box>
              </Fade>
            </CardContent>
          </Card>
        </Box>
      </Fade>
    </Box>
  );
};

export default Login;