'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
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
  CircularProgress
} from '@mui/material'
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
  getDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore'
import { signOutUser, getCurrentUser } from '@/firebase';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
}

export default function Dashboard() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
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
    setOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setItemId('')
    setItemName('')
    setItemQuantity(1)
    setItemCategory('')
    setItemExpiration('')
    setItemNotes('')
    setEditMode(false)
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const updateInventory = async () => {
    setLoading(true)
    try {
      let q = query(collection(firestore, 'inventory'))
      
      if (filter) {
        q = query(q, where('category', '==', filter))
      }
      
      q = query(q, orderBy(sort))

      const snapshot = await getDocs(q)
      const inventoryList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setInventory(inventoryList)
    } catch (error) {
      console.error("Error fetching inventory:", error)
      showSnackbar("Failed to fetch inventory", "error")
    } finally {
      setLoading(false)
    }
  }
  
  
  useEffect(() => {
    updateInventory()
  }, [filter, sort])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!itemName.trim()) return

    try {
      const docRef = doc(collection(firestore, 'inventory'), editMode ? itemId : itemName.toLowerCase())
      await setDoc(docRef, {
        name: itemName,
        quantity: itemQuantity,
        category: itemCategory,
        expiration: itemExpiration,
        notes: itemNotes
      }, { merge: true })
      
      handleClose()
      await updateInventory()
      showSnackbar(editMode ? "Item updated successfully" : "Item added successfully")
    } catch (error) {
      console.error("Error adding/updating item:", error)
      showSnackbar("Failed to add/update item", "error")
    }
  }
  
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

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 3,
        bgcolor: '#f5f5f5'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: 1000, mb: 3 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ color: '#2c3e50' }}>
          Food Tracker
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<LogoutIcon />} 
          onClick={handleSignOut}
          sx={{ ml: 2 }}
        >
          Sign Out
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 1000, mb: 3 }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleOpen}
          sx={{ bgcolor: '#27ae60', '&:hover': { bgcolor: '#2ecc71' } }}
        >
          Add New Item
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              label="Filter"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {/* Add menu items based on your categories */}
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
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="expiration">Expiration</MenuItem>
              <MenuItem value="quantity">Quantity</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} sx={{ maxWidth: 1000, mb: 3, boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#34495e' }}>
                <TableCell sx={{ color: 'white' }}>Item</TableCell>
                <TableCell align="right" sx={{ color: 'white' }}>Quantity</TableCell>
                <TableCell sx={{ color: 'white' }}>Category</TableCell>
                <TableCell sx={{ color: 'white' }}>Expiration</TableCell>
                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                <TableCell sx={{ color: 'white' }}>Notes</TableCell>
                <TableCell align="center" sx={{ color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id} sx={{ '&:nth-of-type(odd)': { bgcolor: '#ecf0f1' } }}>
                  <TableCell component="th" scope="row">
                    {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                  </TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.expiration || 'N/A'}</TableCell>
                  <TableCell>
                    <Tooltip title={getExpirationStatus(item.expiration)}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: getExpirationStatus(item.expiration) === 'Good' ? 'green' :
                                   getExpirationStatus(item.expiration) === 'Expiring Soon' ? 'orange' : 'red',
                          display: 'inline-block',
                          mr: 1
                        }}
                      />
                    </Tooltip>
                    {getExpirationStatus(item.expiration)}
                  </TableCell>
                  <TableCell>{item.notes}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Add">
                      <IconButton onClick={() => incrementItem(item)} color="primary">
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove">
                      <IconButton onClick={() => removeItem(item)} color="secondary">
                        <RemoveIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => editItem(item)} color="info">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => deleteItem(item)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
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
        <Box component="form" onSubmit={handleSubmit} sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
            {editMode ? 'Edit Item' : 'Add New Item'}
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
            <Button
              type="submit"
              variant="contained"
              disabled={!itemName.trim()}
              sx={{ bgcolor: '#27ae60', '&:hover': { bgcolor: '#2ecc71' } }}
            >
              {editMode ? 'Update Item' : 'Add Item'}
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}