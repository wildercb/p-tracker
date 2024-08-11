'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Stack,
  Typography,
  Button,
  Modal,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  CircularProgress,
  createTheme,
  ThemeProvider,
} from '@mui/material'
import { styled, keyframes } from '@mui/system'
import { 
  Add as AddIcon, 
  Remove as RemoveIcon, 
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Logout as LogoutIcon
} from '@mui/icons-material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore'
import { signOutUser, getCurrentUser } from '@/firebase'

// Enhanced Cyberpunk theme
const cyberpunkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff9f',
      light: '#80ffcf',
      dark: '#00b86e',
    },
    secondary: {
      main: '#ff00a0',
      light: '#ff80d0',
      dark: '#b80070',
    },
    background: {
      default: '#0a0a0a',
      paper: 'rgba(20, 20, 20, 0.8)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
    error: {
      main: '#ff3d00',
    },
    warning: {
      main: '#ffab00',
    },
    info: {
      main: '#00b8d4',
    },
    success: {
      main: '#00c853',
    },
  },
  typography: {
    fontFamily: '"Rajdhani", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Orbitron", "Rajdhani", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
    h2: {
      fontFamily: '"Orbitron", "Rajdhani", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 700,
      letterSpacing: '0.05em',
    },
    button: {
      fontFamily: '"Rajdhani", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.1em',
    },
  },
  shape: {
    borderRadius: 0,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Rajdhani';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: local('Rajdhani'), local('Rajdhani-Regular'), url(https://fonts.gstatic.com/s/rajdhani/v10/LDI2apCSOBg7S-QT7p4GM-aUEA.woff2) format('woff2');
        }
        @font-face {
          font-family: 'Orbitron';
          font-style: normal;
          font-display: swap;
          font-weight: 700;
          src: local('Orbitron Bold'), local('Orbitron-Bold'), url(https://fonts.gstatic.com/s/orbitron/v16/yMJWMIlzdpvBhQQL_SC3X9yhF25-T1ny_Cx8.woff2) format('woff2');
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'uppercase',
          fontWeight: 'bold',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '200%',
            height: '100%',
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)',
            transition: 'all 0.5s',
          },
          '&:hover::after': {
            left: '100%',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(0, 255, 159, 0.5)',
              transition: 'border-color 0.3s',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 255, 159, 0.7)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00ff9f',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(0, 255, 159, 0.7)',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#00ff9f',
          },
        },
      },
    },
  },
});

// Advanced animations
const glitchAnimation = keyframes`
  0% {
    text-shadow: 0.05em 0 0 #00ff9f, -0.05em -0.025em 0 #ff00a0, -0.025em 0.05em 0 #ffb300;
  }
  14% {
    text-shadow: 0.05em 0 0 #00ff9f, -0.05em -0.025em 0 #ff00a0, -0.025em 0.05em 0 #ffb300;
  }
  15% {
    text-shadow: -0.05em -0.025em 0 #00ff9f, 0.025em 0.025em 0 #ff00a0, -0.05em -0.05em 0 #ffb300;
  }
  49% {
    text-shadow: -0.05em -0.025em 0 #00ff9f, 0.025em 0.025em 0 #ff00a0, -0.05em -0.05em 0 #ffb300;
  }
  50% {
    text-shadow: 0.025em 0.05em 0 #00ff9f, 0.05em 0 0 #ff00a0, 0 -0.05em 0 #ffb300;
  }
  99% {
    text-shadow: 0.025em 0.05em 0 #00ff9f, 0.05em 0 0 #ff00a0, 0 -0.05em 0 #ffb300;
  }
  100% {
    text-shadow: -0.025em 0 0 #00ff9f, -0.025em -0.025em 0 #ff00a0, -0.025em -0.05em 0 #ffb300;
  }
`;

const scanlineAnimation = keyframes`
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(100%);
  }
`;

// Enhanced styled components
const CyberpunkBackground = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: `
    linear-gradient(to bottom, ${theme.palette.background.default}, ${theme.palette.background.paper}),
    repeating-linear-gradient(to right, ${theme.palette.primary.dark} 0, ${theme.palette.primary.dark} 1px, transparent 1px, transparent 60px),
    repeating-linear-gradient(to bottom, ${theme.palette.primary.dark} 0, ${theme.palette.primary.dark} 1px, transparent 1px, transparent 60px),
    radial-gradient(circle at 50% 50%, ${theme.palette.primary.main} 0, ${theme.palette.primary.main} 1px, transparent 1px)
  `,
  backgroundSize: '100% 100%, 60px 60px, 60px 60px, 30px 30px',
  zIndex: -1,
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.3))',
    pointerEvents: 'none',
  },
}));

const GlitchText = styled(Typography)(({ theme }) => ({
  position: 'relative',
  animation: `${glitchAnimation} 2.5s infinite`,
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
    clipPath: 'inset(44% 0 56% 0)',
    animation: `${glitchAnimation} 2.5s infinite alternate-reverse`,
  },
  '&::after': {
    left: '-2px',
    textShadow: '2px 0 #00ff9f',
    clipPath: 'inset(52% 0 48% 0)',
    animation: `${glitchAnimation} 3.5s infinite alternate`,
  },
}));

const HolographicContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent 0%, rgba(0, 255, 159, 0.1) 50%, transparent 100%)',
    zIndex: 1,
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: theme.palette.primary.main,
    opacity: 0.5,
    animation: `${scanlineAnimation} 10s linear infinite`,
    zIndex: 2,
    pointerEvents: 'none',
  },
}));

const NeonButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    backgroundColor: theme.palette.primary.main,
    opacity: 0,
    transform: 'rotate(30deg)',
    transition: 'opacity 0.3s, transform 0.3s',
  },
  '&:hover::before': {
    opacity: 0.1,
    transform: 'rotate(30deg) translate(-30%, -30%)',
  },
  '&:hover': {
    boxShadow: `0 0 10px ${theme.palette.primary.main}, 0 0 20px ${theme.palette.primary.main}`,
  },
}));

const NeonTableCell = styled(TableCell)(({ theme }) => ({
  borderColor: theme.palette.primary.main,
  transition: 'background-color 0.3s',
  '&:hover': {
    backgroundColor: `${theme.palette.primary.main}20`,
  },
}));



const NeonText = styled(Typography)({
  textShadow: '0 0 5px #00ff9f, 0 0 10px #00ff9f, 0 0 20px #00ff9f',
});


const NeonIconButton = styled(IconButton)({
  color: '#00ff9f',
  '&:hover': {
    backgroundColor: 'rgba(0, 255, 159, 0.1)',
  },
});

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #00ff9f',
  boxShadow: '0 0 20px #00ff9f',
  p: 4,
  borderRadius: 2,
};

export default function Dashboard() {
  console.log("Dashboard component rendering");
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [itemId, setItemId] = useState('')
  const [itemName, setItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState(1)
  const [itemCategory, setItemCategory] = useState('')
  const [itemExpiration, setItemExpiration] = useState('')
  const [itemNotes, setItemNotes] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [filter, setFilter] = useState('')
  const [sort, setSort] = useState('name')
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.replace('/');
      } else {
        updateInventory();
      }
    };
    checkAuth();
  }, [router]);

  const handleOpen = () => setOpen(true)

  const handleClose = () => {
    setOpen(false);
    resetForm();
  }

  const resetForm = () => {
    setItemId('');
    setItemName('');
    setItemQuantity(1);
    setItemCategory('');
    setItemExpiration('');
    setItemNotes('');
    setEditMode(false);
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const updateInventory = async () => {
    console.log("Starting updateInventory");
    setLoading(true);
    try {
      console.log("Fetching inventory from Firestore");
      const querySnapshot = await getDocs(collection(firestore, 'inventory'));
      console.log("Firestore query complete");
  
      const inventoryList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("Processed inventory list:", inventoryList);
  
      setInventory(inventoryList);
      console.log("Local inventory state updated");
    } catch (error) {
      console.error("Error in updateInventory:", error);
      showSnackbar("Failed to fetch inventory: " + error.message, "error");
    } finally {
      setLoading(false);
      console.log("updateInventory complete, loading set to false");
    }
  };
  
  
  useEffect(() => {
    updateInventory()
  }, [])

  // ... existing code ...

const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Form submitted");
  
  if (!itemName.trim()) {
    console.log("Item name is empty, returning");
    showSnackbar("Item name cannot be empty", "error");
    return;
  }

  setLoading(true);
  console.log("Setting loading to true");

  try {
    console.log("Preparing new item object");
    const newItem = {
      name: itemName,
      quantity: itemQuantity,
      category: itemCategory,
      expiration: itemExpiration,
      notes: itemNotes
    };
    console.log("New item object:", newItem);

    console.log("Preparing to add document to Firestore");
    const docRef = doc(firestore, 'inventory', itemName.toLowerCase());
    console.log("Document reference created:", docRef);

    console.log("Attempting to set document in Firestore");
    await setDoc(docRef, newItem);
    console.log("Document successfully added to Firestore");

    console.log("Closing modal");
    handleClose();

    console.log("Showing success snackbar");
    showSnackbar("Item added successfully");

    console.log("Refreshing inventory");
    await updateInventory();
    console.log("Inventory refresh complete");

  } catch (error) {
    console.error("Error in handleSubmit:", error);
    showSnackbar("Failed to add item: " + error.message, "error");
  } finally {
    console.log("Setting loading to false");
    setLoading(false);
  }
};

  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item.id)
      if (item.quantity > 1) {
        await setDoc(docRef, { ...item, quantity: item.quantity - 1 }, { merge: true })
      } else {
        await deleteDoc(docRef)
      }
      await updateInventory()
      showSnackbar("Item quantity decreased")
    } catch (error) {
      console.error("Error removing item:", error)
      showSnackbar("Failed to remove item", "error")
    }
  }

  const incrementItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item.id)
      await setDoc(docRef, { ...item, quantity: item.quantity + 1 }, { merge: true })
      await updateInventory()
      showSnackbar("Item quantity increased")
    } catch (error) {
      console.error("Error incrementing item:", error)
      showSnackbar("Failed to increase item quantity", "error")
    }
  }

  const deleteItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item.id)
      await deleteDoc(docRef)
      await updateInventory()
      showSnackbar("Item deleted successfully")
    } catch (error) {
      console.error("Error deleting item:", error)
      showSnackbar("Failed to delete item", "error")
    }
  }

  const editItem = (item) => {
    setEditMode(true)
    setItemId(item.id)
    setItemName(item.name)
    setItemQuantity(item.quantity)
    setItemCategory(item.category)
    setItemExpiration(item.expiration)
    setItemNotes(item.notes)
    setOpen(true)
  }

  const getExpirationStatus = (expirationDate) => {
    if (!expirationDate) return 'N/A'
    const today = new Date()
    const expDate = new Date(expirationDate)
    const daysUntilExpiration = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiration < 0) return 'Expired'
    if (daysUntilExpiration <= 7) return 'Expiring Soon'
    return 'Good'
  }

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      showSnackbar("Failed to sign out", "error");
    }
  };

  const MemoizedBackground = useMemo(() => <CyberpunkBackground />, []);

return (
  <ThemeProvider theme={cyberpunkTheme}>
    {MemoizedBackground}
    <HolographicContainer
      sx={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 3,
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: 1200, mb: 3 }}>
        <GlitchText variant="h2" component="h1" data-text="Neon Pantry Hub">
          Pantry Hub
        </GlitchText>
        <NeonButton 
          variant="outlined" 
          startIcon={<LogoutIcon />} 
          onClick={handleSignOut}
          sx={{ borderColor: 'secondary.main', color: 'secondary.main' }}
        >
          Disconnect
        </NeonButton>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 1200, mb: 3 }}>
        <NeonButton 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleOpen}
          sx={{ bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
        >
          Add New Item
        </NeonButton>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              label="Filter"
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.light',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="Fruits">Fruits</MenuItem>
              <MenuItem value="Vegetables">Vegetables</MenuItem>
              <MenuItem value="Dairy">Dairy</MenuItem>
              <MenuItem value="Grains">Grains</MenuItem>
              <MenuItem value="Protein">Protein</MenuItem>
            </Select>
          </FormControl>

          <FormControl variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel>Sort</InputLabel>
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              label="Sort"
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.light',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="expiration">Expiration</MenuItem>
              <MenuItem value="quantity">Quantity</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {loading ? (
        <CircularProgress sx={{ color: 'secondary.main' }} />
      ) : (
        <TableContainer component={Paper} sx={{ 
          maxWidth: 1200, 
          mb: 3, 
          boxShadow: (theme) => `0 0 20px ${theme.palette.primary.main}`,
          backgroundColor: 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(10px)',
          border: (theme) => `1px solid ${theme.palette.primary.main}`,
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(0, 255, 159, 0.1)' }}>
                <NeonTableCell>Item</NeonTableCell>
                <NeonTableCell align="right">Quantity</NeonTableCell>
                <NeonTableCell>Category</NeonTableCell>
                <NeonTableCell>Expiration</NeonTableCell>
                <NeonTableCell>Status</NeonTableCell>
                <NeonTableCell>Notes</NeonTableCell>
                <NeonTableCell align="center">Actions</NeonTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id} sx={{ '&:nth-of-type(odd)': { bgcolor: 'rgba(0, 255, 159, 0.05)' } }}>
                  <NeonTableCell component="th" scope="row">
                    {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                  </NeonTableCell>
                  <NeonTableCell align="right">{item.quantity}</NeonTableCell>
                  <NeonTableCell>{item.category}</NeonTableCell>
                  <NeonTableCell>{item.expiration || 'N/A'}</NeonTableCell>
                  <NeonTableCell>
                    <Tooltip title={getExpirationStatus(item.expiration)}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: getExpirationStatus(item.expiration) === 'Good' ? '#00ff9f' :
                                   getExpirationStatus(item.expiration) === 'Expiring Soon' ? '#ff9f00' : '#ff00a0',
                          display: 'inline-block',
                          mr: 1,
                          boxShadow: `0 0 10px ${getExpirationStatus(item.expiration) === 'Good' ? '#00ff9f' :
                                      getExpirationStatus(item.expiration) === 'Expiring Soon' ? '#ff9f00' : '#ff00a0'}`,
                        }}
                      />
                    </Tooltip>
                    {getExpirationStatus(item.expiration)}
                  </NeonTableCell>
                  <NeonTableCell>{item.notes}</NeonTableCell>
                  <NeonTableCell align="center">
                    <Tooltip title="Add">
                      <IconButton onClick={() => incrementItem(item)} sx={{ color: 'primary.main' }}>
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove">
                      <IconButton onClick={() => removeItem(item)} sx={{ color: 'secondary.main' }}>
                        <RemoveIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => editItem(item)} sx={{ color: 'info.main' }}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => deleteItem(item)} sx={{ color: 'error.main' }}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </NeonTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

  <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        
        <Box component="form" onSubmit={handleSubmit} sx={{
          ...modalStyle,
          bgcolor: 'background.paper',
          border: (theme) => `2px solid ${theme.palette.primary.main}`,
          boxShadow: (theme) => `0 0 20px ${theme.palette.primary.main}`,
        }}>
          <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom sx={{ color: 'primary.main' }}>
            Add New Item
          </Typography>
          <Stack spacing={3}>
            <TextField
              label="Item Name"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
            <TextField
              label="Quantity"
              variant="outlined"
              type="number"
              fullWidth
              value={itemQuantity}
              onChange={(e) => setItemQuantity(parseInt(e.target.value))}
              required
            />
            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                value={itemCategory}
                label="Category"
                onChange={(e) => setItemCategory(e.target.value)}
                required
              >
                <MenuItem value="Fruits">Fruits</MenuItem>
                <MenuItem value="Vegetables">Vegetables</MenuItem>
                <MenuItem value="Dairy">Dairy</MenuItem>
                <MenuItem value="Grains">Grains</MenuItem>
                <MenuItem value="Protein">Protein</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Expiration Date"
              variant="outlined"
              type="date"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              value={itemExpiration}
              onChange={(e) => setItemExpiration(e.target.value)}
            />
            <TextField
              label="Notes"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={itemNotes}
              onChange={(e) => setItemNotes(e.target.value)}
            />
            <NeonButton
              type="button"
              variant="contained"
              disabled={!itemName.trim() || loading}
              onClick={handleSubmit}
              sx={{ bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
            >
              {loading ? 'Adding...' : 'Add Item'}
            </NeonButton>
          </Stack>
        </Box>
      </Modal>


      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%', 
            backgroundColor: 'rgba(0, 255, 159, 0.9)',
            color: 'background.default',
            '& .MuiAlert-icon': {
              color: 'background.default',
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </HolographicContainer>
  </ThemeProvider>
);}