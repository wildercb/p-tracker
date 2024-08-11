'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Divider,
  CircularProgress,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import { styled } from '@mui/system';
import { Google as GoogleIcon } from '@mui/icons-material';
import { signIn, signUp, signInWithGoogle, getCurrentUser } from '@/firebase';

// Define cyberpunk theme
const cyberpunkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff9f',
    },
    secondary: {
      main: '#ff00a0',
    },
    background: {
      default: '#0a0a0a',
      paper: 'rgba(20, 20, 20, 0.8)',
    },
  },
  typography: {
    fontFamily: '"Orbitron", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      textShadow: '0 0 10px #00ff9f, 0 0 20px #00ff9f, 0 0 30px #00ff9f',
    },
    h2: {
      textShadow: '0 0 5px #00ff9f, 0 0 10px #00ff9f',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'uppercase',
          fontWeight: 'bold',
          '&:hover': {
            boxShadow: '0 0 10px #00ff9f',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#00ff9f',
              borderRadius: 0,
            },
            '&:hover fieldset': {
              borderColor: '#ff00a0',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ff00a0',
            },
          },
        },
      },
    },
  },
});

// Styled components
const CyberpunkBackground = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(45deg, #0a0a0a 25%, #1a1a1a 25%, #1a1a1a 50%, #0a0a0a 50%, #0a0a0a 75%, #1a1a1a 75%, #1a1a1a 100%)',
  backgroundSize: '40px 40px',
  animation: 'moveBackground 4s linear infinite',
  zIndex: -1,
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle, rgba(255,0,160,0.1) 0%, rgba(0,255,159,0.1) 100%)',
  },
  '@keyframes moveBackground': {
    '0%': { backgroundPosition: '0 0' },
    '100%': { backgroundPosition: '40px 40px' },
  },
});

const GlitchText = styled(Typography)({
  position: 'relative',
  '&::before, &::after': {
    content: 'attr(data-text)',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  '&::before': {
    left: '2px',
    textShadow: '-2px 0 #ff00a0',
    animation: 'glitch-anim-1 2s infinite linear alternate-reverse',
  },
  '&::after': {
    left: '-2px',
    textShadow: '2px 0 #00ff9f',
    animation: 'glitch-anim-2 3s infinite linear alternate-reverse',
  },
  '@keyframes glitch-anim-1': {
    '0%': { clipPath: 'inset(20% 0 30% 0)' },
    '100%': { clipPath: 'inset(10% 0 60% 0)' },
  },
  '@keyframes glitch-anim-2': {
    '0%': { clipPath: 'inset(60% 0 10% 0)' },
    '100%': { clipPath: 'inset(30% 0 20% 0)' },
  },
});

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (user) {
        router.replace('/dashboard');
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (tabValue === 0) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={cyberpunkTheme}>
      <CyberpunkBackground />
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <GlitchText component="h1" variant="h2" gutterBottom data-text="Pantry Tracker">
            Pantry Tracker
          </GlitchText>
          <Typography variant="h5" align="center" color="secondary" paragraph>
            Manage your inventory in the neon-lit future
          </Typography>
          <Paper elevation={3} sx={{ mt: 3, p: 3, width: '100%', background: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(10px)' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} centered textColor="secondary" indicatorColor="secondary">
              <Tab label="Sign In" />
              <Tab label="Sign Up" />
            </Tabs>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                {tabValue === 0 ? 'Enter the Grid' : 'Join the Network'}
              </Button>
            </Box>
            <Divider sx={{ my: 3, '&::before, &::after': { borderColor: 'secondary.main' } }}>OR</Divider>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              sx={{ borderColor: 'secondary.main', color: 'secondary.main' }}
            >
              Sync with Google
            </Button>
          </Paper>
        </Box>
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%', backgroundColor: 'rgba(255, 0, 0, 0.8)' }}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}