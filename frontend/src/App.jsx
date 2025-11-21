import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
  Cable as CableIcon,
  Router as RouterIcon
} from '@mui/icons-material';

const API_BASE = 'http://localhost:8000';

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [data, setData] = useState({
    korisnici: [],
    lokacije: [],
    veze: [],
    oprema: []
  });
  const [stats, setStats] = useState({});
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState({});
  const [currentEntity, setCurrentEntity] = useState('korisnici');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch data
  const fetchData = async (entity) => {
    try {
      const response = await fetch(`${API_BASE}/${entity}`);
      const result = await response.json();
      setData(prev => ({ ...prev, [entity]: result }));
    } catch (error) {
      console.error(`Error fetching ${entity}:`, error);
      showSnackbar(`Greška pri dohvaćanju ${entity}`, 'error');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/stats`);
      const result = await response.json();
      setStats(result);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchData('korisnici');
    fetchData('lokacije');
    fetchData('veze');
    fetchData('oprema');
    fetchStats();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    const entities = ['korisnici', 'lokacije', 'veze', 'oprema'];
    setCurrentEntity(entities[newValue]);
  };

  const handleOpen = (entity, item = null) => {
    setCurrentEntity(entity);
    if (item) {
      setCurrentItem(item);
      setEditMode(true);
    } else {
      setCurrentItem(getEmptyItem(entity));
      setEditMode(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentItem({});
    setEditMode(false);
  };

  const getEmptyItem = (entity) => {
    switch (entity) {
      case 'korisnici':
        return {
          oib: '',
          naziv: '',
          adresa: '',
          tip_korisnika: 'fizicki',
          paket_usluga: '',
          status: 'aktivan',
          kontakt_admin: '',
          kontakt_tehnika: ''
        };
      case 'lokacije':
        return {
          naziv: '',
          tip: 'korisnik',
          adresa: '',
          latitude: null,
          longitude: null,
          status: 'aktivna',
          korisnik_id: null
        };
      case 'veze':
        return {
          lokacija_a_id: null,
          lokacija_b_id: null,
          tip: 'optika',
          kapacitet_vlakana: null,
          kapacitet_parica: null,
          brzina_mbps: null,
          status: 'aktivan',
          redundantna_veza_id: null
        };
      case 'oprema':
        return {
          lokacija_id: null,
          tip: 'switch',
          proizvodjac: '',
          model: '',
          serijski_broj: '',
          inventurni_broj: '',
          status: 'u_upotrebi',
          datum_instalacije: null
        };
      default:
        return {};
    }
  };

  const handleSave = async () => {
    try {
      const url = editMode
        ? `${API_BASE}/${currentEntity}/${currentItem.id}`
        : `${API_BASE}/${currentEntity}`;
      
      const method = editMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentItem),
      });

      if (response.ok) {
        fetchData(currentEntity);
        handleClose();
        showSnackbar(editMode ? 'Uspješno ažurirano!' : 'Uspješno dodano!');
      } else {
        throw new Error('Greška pri spremanju');
      }
    } catch (error) {
      console.error('Error saving:', error);
      showSnackbar('Greška pri spremanju podataka', 'error');
    }
  };

  const handleDelete = async (entity, id) => {
    if (!window.confirm('Jeste li sigurni da želite obrisati ovaj zapis?')) return;

    try {
      const response = await fetch(`${API_BASE}/${entity}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData(entity);
        showSnackbar('Uspješno obrisano!');
      } else {
        throw new Error('Greška pri brisanju');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      showSnackbar('Greška pri brisanju', 'error');
    }
  };

  const handleInputChange = (field, value) => {
    setCurrentItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Render form fields based on entity
  const renderFormFields = () => {
    switch (currentEntity) {
      case 'korisnici':
        return (
          <>
            <TextField
              fullWidth
              label="OIB"
              value={currentItem.oib || ''}
              onChange={(e) => handleInputChange('oib', e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Naziv"
              value={currentItem.naziv || ''}
              onChange={(e) => handleInputChange('naziv', e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Adresa"
              value={currentItem.adresa || ''}
              onChange={(e) => handleInputChange('adresa', e.target.value)}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Tip korisnika</InputLabel>
              <Select
                value={currentItem.tip_korisnika || 'fizicki'}
                onChange={(e) => handleInputChange('tip_korisnika', e.target.value)}
              >
                <MenuItem value="fizicki">Fizički</MenuItem>
                <MenuItem value="pravni">Pravni</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Paket usluga"
              value={currentItem.paket_usluga || ''}
              onChange={(e) => handleInputChange('paket_usluga', e.target.value)}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={currentItem.status || 'aktivan'}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <MenuItem value="aktivan">Aktivan</MenuItem>
                <MenuItem value="neaktivan">Neaktivan</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Kontakt - administracija"
              value={currentItem.kontakt_admin || ''}
              onChange={(e) => handleInputChange('kontakt_admin', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Kontakt - tehnika"
              value={currentItem.kontakt_tehnika || ''}
              onChange={(e) => handleInputChange('kontakt_tehnika', e.target.value)}
              margin="normal"
            />
          </>
        );

      case 'lokacije':
        return (
          <>
            <TextField
              fullWidth
              label="Naziv"
              value={currentItem.naziv || ''}
              onChange={(e) => handleInputChange('naziv', e.target.value)}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Tip</InputLabel>
              <Select
                value={currentItem.tip || 'korisnik'}
                onChange={(e) => handleInputChange('tip', e.target.value)}
              >
                <MenuItem value="korisnik">Korisnik</MenuItem>
                <MenuItem value="servisna">Servisna</MenuItem>
                <MenuItem value="pomocna">Pomoćna</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Adresa"
              value={currentItem.adresa || ''}
              onChange={(e) => handleInputChange('adresa', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Latitude"
              type="number"
              value={currentItem.latitude || ''}
              onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value))}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Longitude"
              type="number"
              value={currentItem.longitude || ''}
              onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value))}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={currentItem.status || 'aktivna'}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <MenuItem value="planirana">Planirana</MenuItem>
                <MenuItem value="aktivna">Aktivna</MenuItem>
                <MenuItem value="neaktivna">Neaktivna</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Korisnik</InputLabel>
              <Select
                value={currentItem.korisnik_id || ''}
                onChange={(e) => handleInputChange('korisnik_id', e.target.value || null)}
              >
                <MenuItem value="">Bez korisnika</MenuItem>
                {data.korisnici.map(k => (
                  <MenuItem key={k.id} value={k.id}>{k.naziv}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        );

      case 'veze':
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Lokacija A</InputLabel>
              <Select
                value={currentItem.lokacija_a_id || ''}
                onChange={(e) => handleInputChange('lokacija_a_id', e.target.value)}
                required
              >
                {data.lokacije.map(l => (
                  <MenuItem key={l.id} value={l.id}>{l.naziv}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Lokacija B</InputLabel>
              <Select
                value={currentItem.lokacija_b_id || ''}
                onChange={(e) => handleInputChange('lokacija_b_id', e.target.value)}
                required
              >
                {data.lokacije.map(l => (
                  <MenuItem key={l.id} value={l.id}>{l.naziv}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Tip</InputLabel>
              <Select
                value={currentItem.tip || 'optika'}
                onChange={(e) => handleInputChange('tip', e.target.value)}
              >
                <MenuItem value="optika">Optika</MenuItem>
                <MenuItem value="bakar">Bakar</MenuItem>
                <MenuItem value="wireless">Wireless</MenuItem>
                <MenuItem value="P2P">P2P</MenuItem>
                <MenuItem value="P2MP">P2MP</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Kapacitet vlakana"
              type="number"
              value={currentItem.kapacitet_vlakana || ''}
              onChange={(e) => handleInputChange('kapacitet_vlakana', parseInt(e.target.value) || null)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Kapacitet parica"
              type="number"
              value={currentItem.kapacitet_parica || ''}
              onChange={(e) => handleInputChange('kapacitet_parica', parseInt(e.target.value) || null)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Brzina (Mbps)"
              type="number"
              value={currentItem.brzina_mbps || ''}
              onChange={(e) => handleInputChange('brzina_mbps', parseInt(e.target.value) || null)}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={currentItem.status || 'aktivan'}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <MenuItem value="aktivan">Aktivan</MenuItem>
                <MenuItem value="planiran">Planiran</MenuItem>
                <MenuItem value="u_kvaru">U kvaru</MenuItem>
              </Select>
            </FormControl>
          </>
        );

      case 'oprema':
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Lokacija</InputLabel>
              <Select
                value={currentItem.lokacija_id || ''}
                onChange={(e) => handleInputChange('lokacija_id', e.target.value)}
                required
              >
                {data.lokacije.map(l => (
                  <MenuItem key={l.id} value={l.id}>{l.naziv}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Tip</InputLabel>
              <Select
                value={currentItem.tip || 'switch'}
                onChange={(e) => handleInputChange('tip', e.target.value)}
              >
                <MenuItem value="switch">Switch</MenuItem>
                <MenuItem value="router">Router</MenuItem>
                <MenuItem value="ONT">ONT</MenuItem>
                <MenuItem value="antena">Antena</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Proizvođač"
              value={currentItem.proizvodjac || ''}
              onChange={(e) => handleInputChange('proizvodjac', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Model"
              value={currentItem.model || ''}
              onChange={(e) => handleInputChange('model', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Serijski broj"
              value={currentItem.serijski_broj || ''}
              onChange={(e) => handleInputChange('serijski_broj', e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Inventurni broj"
              value={currentItem.inventurni_broj || ''}
              onChange={(e) => handleInputChange('inventurni_broj', e.target.value)}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={currentItem.status || 'u_upotrebi'}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <MenuItem value="u_upotrebi">U upotrebi</MenuItem>
                <MenuItem value="rezerva">Rezerva</MenuItem>
                <MenuItem value="otpisana">Otpisana</MenuItem>
              </Select>
            </FormControl>
          </>
        );

      default:
        return null;
    }
  };

  // Render table based on entity
  const renderTable = (entity) => {
    const items = data[entity] || [];
    
    if (items.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            Nema podataka
          </Typography>
        </Box>
      );
    }

    switch (entity) {
      case 'korisnici':
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>OIB</TableCell>
                  <TableCell>Naziv</TableCell>
                  <TableCell>Tip</TableCell>
                  <TableCell>Paket</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Akcije</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.oib}</TableCell>
                    <TableCell>{item.naziv}</TableCell>
                    <TableCell>{item.tip_korisnika}</TableCell>
                    <TableCell>{item.paket_usluga}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        color={item.status === 'aktivan' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpen(entity, item)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(entity, item.id)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'lokacije':
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Naziv</TableCell>
                  <TableCell>Tip</TableCell>
                  <TableCell>Adresa</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Korisnik ID</TableCell>
                  <TableCell align="right">Akcije</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.naziv}</TableCell>
                    <TableCell>{item.tip}</TableCell>
                    <TableCell>{item.adresa}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        color={item.status === 'aktivna' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{item.korisnik_id || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpen(entity, item)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(entity, item.id)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'veze':
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Lokacija A</TableCell>
                  <TableCell>Lokacija B</TableCell>
                  <TableCell>Tip</TableCell>
                  <TableCell>Brzina (Mbps)</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Akcije</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.lokacija_a_id}</TableCell>
                    <TableCell>{item.lokacija_b_id}</TableCell>
                    <TableCell>{item.tip}</TableCell>
                    <TableCell>{item.brzina_mbps || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        color={item.status === 'aktivan' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpen(entity, item)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(entity, item.id)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'oprema':
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Lokacija ID</TableCell>
                  <TableCell>Tip</TableCell>
                  <TableCell>Proizvođač</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Serijski broj</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Akcije</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.lokacija_id}</TableCell>
                    <TableCell>{item.tip}</TableCell>
                    <TableCell>{item.proizvodjac}</TableCell>
                    <TableCell>{item.model}</TableCell>
                    <TableCell>{item.serijski_broj}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        color={item.status === 'u_upotrebi' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpen(entity, item)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(entity, item.id)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Hitronet EMS - MVP Demo
        </Typography>
        
        {/* Statistics Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PeopleIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      Korisnici
                    </Typography>
                    <Typography variant="h5">
                      {stats.korisnici || 0}
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      {stats.aktivni_korisnici || 0} aktivnih
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      Lokacije
                    </Typography>
                    <Typography variant="h5">
                      {stats.lokacije || 0}
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      {stats.aktivne_lokacije || 0} aktivnih
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CableIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      Veze
                    </Typography>
                    <Typography variant="h5">
                      {stats.veze || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <RouterIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      Oprema
                    </Typography>
                    <Typography variant="h5">
                      {stats.oprema || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Korisnici" icon={<PeopleIcon />} iconPosition="start" />
              <Tab label="Lokacije" icon={<LocationIcon />} iconPosition="start" />
              <Tab label="Veze" icon={<CableIcon />} iconPosition="start" />
              <Tab label="Oprema" icon={<RouterIcon />} iconPosition="start" />
            </Tabs>
            <Box>
              <IconButton 
                onClick={() => {
                  const entities = ['korisnici', 'lokacije', 'veze', 'oprema'];
                  fetchData(entities[tabValue]);
                  fetchStats();
                }}
              >
                <RefreshIcon />
              </IconButton>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  const entities = ['korisnici', 'lokacije', 'veze', 'oprema'];
                  handleOpen(entities[tabValue]);
                }}
              >
                Dodaj
              </Button>
            </Box>
          </Box>

          {/* Tab Panels */}
          <Box sx={{ p: 2 }}>
            {tabValue === 0 && renderTable('korisnici')}
            {tabValue === 1 && renderTable('lokacije')}
            {tabValue === 2 && renderTable('veze')}
            {tabValue === 3 && renderTable('oprema')}
          </Box>
        </Paper>

        {/* Dialog for Create/Edit */}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editMode ? 'Uredi' : 'Dodaj'} - {currentEntity}
          </DialogTitle>
          <DialogContent>
            {renderFormFields()}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Odustani</Button>
            <Button onClick={handleSave} variant="contained" color="primary">
              Spremi
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default App;
