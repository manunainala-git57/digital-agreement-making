// src/pages/SignAgreements.jsx
import React, { useEffect, useState, useContext } from 'react';
import {
  Container, Typography, Card, Chip, Button, Box, TextField,
  IconButton, Paper, ToggleButton, ToggleButtonGroup,
  Tooltip, Fab, Drawer, useMediaQuery
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';

const SignAgreements = () => {
  const [pendingAgreements, setPendingAgreements] = useState([]);
  const [signedAgreements, setSignedAgreements] = useState([]);
  const [allAgreements, setAllAgreements] = useState([]);
  const [filteredAgreements, setFilteredAgreements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('pending');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchAgreements();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filter, allAgreements]);

  const fetchAgreements = async () => {
    try {
      const resPending = await api.get('/agreements/pending-to-sign');
      const resSigned = await api.get('/agreements/all', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });

      setPendingAgreements(resPending.data);
      setSignedAgreements(resSigned.data);

      const combined = [
        ...resPending.data.map(a => ({ ...a, category: 'pending' })),
        ...resSigned.data.map(a => ({ ...a, category: 'signed' }))
      ];
      setAllAgreements(combined);
    } catch (err) {
      toast.error('Error loading agreements');
    }
  };

  const applyFilters = () => {
    let filtered = allAgreements;
    if (filter === 'pending') {
      filtered = filtered.filter(a => a.category === 'pending');
    } else if (filter === 'signed') {
      filtered = filtered.filter(a => a.category === 'signed');
    }
    if (searchTerm.trim()) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.creator?.email || a.creatorEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredAgreements(filtered);
  };

  const handleSearch = () => {
    applyFilters();
  };

  const handleDownload = async (agreementId) => {
    try {
      const res = await api.get(`/agreements/${agreementId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `agreement-${agreementId}.pdf`;
      a.click();
    } catch (err) {
      toast.error('Failed to download PDF');
    }
  };

  const getChipColor = (status) => {
    switch (status) {
      case 'fully-signed': return 'success';
      case 'partially-signed': return 'warning';
      case 'pending': return 'error';
      default: return 'default';
    }
  };

  const getStatusDisplay = (agreement) => {
    if (agreement.category === 'signed') return 'Fully Signed';
    return agreement.status?.replace('-', ' ') || 'Pending';
  };

  const getPendingCount = () => allAgreements.filter(a => a.category === 'pending').length;
  const getSignedCount = () => allAgreements.filter(a => a.category === 'signed').length;

  const FilterPanel = (
    <Paper elevation={3} sx={{ width: { xs: '100%', md: '300px' }, minWidth: '280px', p: 3, bgcolor: '#f5faff', border: '1px solid #bbdefb', borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={3} sx={{ color: '#0d47a1' }}>Sign Agreements</Typography>
      <TextField
        label="Search agreements"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        InputProps={{
          endAdornment: (
            <Tooltip title="Search">
              <IconButton onClick={handleSearch} size="small">
                <SearchIcon color="primary" />
              </IconButton>
            </Tooltip>
          ),
        }}
        sx={{ mb: 3 }}
      />
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>Filter by Status</Typography>
      <ToggleButtonGroup
        orientation="vertical"
        value={filter}
        exclusive
        onChange={(e, newFilter) => newFilter && setFilter(newFilter)}
        fullWidth
        color="primary"
        sx={{ gap: 1, '& .MuiToggleButton-root': { textAlign: 'left', justifyContent: 'flex-start', borderRadius: 2, py: 1.3, px: 1.5, fontSize: '0.9rem' } }}
      >
        <ToggleButton value="all">All Agreements</ToggleButton>
        <ToggleButton value="pending">Pending Signature</ToggleButton>
        <ToggleButton value="signed">Fully Signed</ToggleButton>
      </ToggleButtonGroup>
      <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="caption" color="#0d47a1">Pending: <strong>{getPendingCount()}</strong></Typography>
        <Typography variant="caption" color="#0d47a1">Signed: <strong>{getSignedCount()}</strong></Typography>
        <Typography variant="caption" color="#0d47a1">Total: <strong>{allAgreements.length}</strong></Typography>
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 3, px: 2, position: 'relative' }}>
      {isMobile && (
        <Fab color="primary" aria-label="filter" onClick={() => setDrawerOpen(true)} sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
          <FilterIcon />
        </Fab>
      )}

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 300, p: 2 }}>{FilterPanel}</Box>
      </Drawer>

      <Box sx={{ display: 'flex', gap: 3, minHeight: '80vh' }}>
        {!isMobile && FilterPanel}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {filteredAgreements.length === 0 ? (
            <Paper elevation={1} sx={{ p: 6, textAlign: 'center', borderRadius: 3, bgcolor: '#f1f8ff', border: '1px solid #bbdefb' }}>
              <Typography variant="h6" sx={{ color: '#0d47a1', mb: 1 }}>No agreements found</Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'Try adjusting your search terms or filters' : filter === 'pending' ? 'No agreements pending your signature' : 'No signed agreements found'}
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {filteredAgreements.map((agreement) => (
                <Card key={agreement._id} elevation={4} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'flex-start', p: 3, minHeight: '160px', borderRadius: 3, backgroundColor: 'white', border: '1px solid #bbdefb', transition: 'all 0.2s ease-in-out', '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 } }}>
                  <Box sx={{ flex: 1, pr: { sm: 2 }, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" fontWeight={600} sx={{ flex: 1, color: '#0d47a1' }}>{agreement.title}</Typography>
                      <Chip label={getStatusDisplay(agreement)} color={agreement.category === 'signed' ? 'success' : getChipColor(agreement.status)} variant="outlined" size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', fontSize: '0.95rem', lineHeight: 1.5 }}>{agreement.content}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto' }}>From: <strong>{agreement?.creator?.email || agreement?.creatorEmail}</strong></Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 2, sm: 0 } }}>
                    {agreement.category === 'pending' ? (
                      <Button variant="contained" size="small" startIcon={<EditIcon />} onClick={() => toast.info('Signing flow coming soon')} sx={{ background: 'linear-gradient(45deg, #2196f3, #1976d2)', px: 3, color: 'white', '&:hover': { background: 'linear-gradient(45deg, #1976d2, #0d47a1)' } }}>Sign Agreement</Button>
                    ) : (
                      <Button variant="contained" size="small" startIcon={<DownloadIcon />} onClick={() => handleDownload(agreement._id)} sx={{ background: 'linear-gradient(45deg, #2196f3, #1976d2)', px: 3, color: 'white', '&:hover': { background: 'linear-gradient(45deg, #1976d2, #0d47a1)' } }}>Download PDF</Button>
                    )}
                  </Box>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default SignAgreements;

// // src/pages/SignAgreements.jsx
// import React, { useEffect, useState, useContext } from 'react';
// import {
//   Container, Typography, Grid, Card, CardContent,
//   Chip, Button, Box, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
//   Paper, ToggleButton, ToggleButtonGroup, Tooltip,
//   Fab, Drawer, useMediaQuery
// } from '@mui/material';
// import {
//   Close as CloseIcon,
//   Search as SearchIcon,
//   Download as DownloadIcon,
//   Edit as EditIcon
// } from '@mui/icons-material';
// import { FilterList as FilterIcon } from '@mui/icons-material';
// import { useTheme } from '@mui/material/styles';
// import { AuthContext } from '../context/AuthContext';
// import api from '../api/api';
// import { toast } from 'react-toastify';

// const SignAgreements = () => {
//   const [pendingAgreements, setPendingAgreements] = useState([]);
//   const [signedAgreements, setSignedAgreements] = useState([]);
//   const [allAgreements, setAllAgreements] = useState([]);
//   const [filteredAgreements, setFilteredAgreements] = useState([]);
//   const [selectedAgreementId, setSelectedAgreementId] = useState(null);
//   const [signatureType, setSignatureType] = useState('typed');
//   const [typedSignature, setTypedSignature] = useState('');
//   const [uploadedImage, setUploadedImage] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filter, setFilter] = useState('pending');
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//   const [drawerOpen, setDrawerOpen] = useState(false);

//   const { user } = useContext(AuthContext);

//   useEffect(() => {
//     fetchAgreements();
//   }, []);

//   useEffect(() => {
//     applyFilters();
//   }, [searchTerm, filter, allAgreements]);

//   const fetchAgreements = async () => {
//     try {
//       const resPending = await api.get('/agreements/pending-to-sign');
//       const resSigned = await api.get('/agreements/all', {
//         headers: { Authorization: `Bearer ${user?.token}` }
//       });

//       setPendingAgreements(resPending.data);
//       setSignedAgreements(resSigned.data);

//       const combined = [
//         ...resPending.data.map(a => ({ ...a, category: 'pending' })),
//         ...resSigned.data.map(a => ({ ...a, category: 'signed' }))
//       ];
//       setAllAgreements(combined);
//     } catch (err) {
//       toast.error('Error loading agreements');
//     }
//   };

//   const applyFilters = () => {
//     let filtered = allAgreements;
//     if (filter === 'pending') {
//       filtered = filtered.filter(a => a.category === 'pending');
//     } else if (filter === 'signed') {
//       filtered = filtered.filter(a => a.category === 'signed');
//     }
//     if (searchTerm.trim()) {
//       filtered = filtered.filter(a =>
//         a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         a.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (a.creator?.email || a.creatorEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }
//     setFilteredAgreements(filtered);
//   };

//   const handleSearch = () => {
//     applyFilters();
//   };

//   const handleSignClick = (agreementId) => {
//     setSelectedAgreementId(agreementId);
//     setSignatureType('typed');
//     setTypedSignature('');
//     setUploadedImage(null);
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setSelectedAgreementId(null);
//     setIsModalOpen(false);
//   };

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const allowedTypes = ['image/png', 'image/jpeg'];
//     if (!allowedTypes.includes(file.type)) {
//       toast.warning('Please upload a PNG or JPEG image');
//       return;
//     }
//     if (file.size > 2 * 1024 * 1024) {
//       toast.warning('Image must be less than 2MB');
//       return;
//     }
//     const reader = new FileReader();
//     reader.onloadend = () => setUploadedImage(reader.result);
//     reader.readAsDataURL(file);
//   };

//   const handleSign = async () => {
//     let signatureValue = '';
//     if (signatureType === 'typed') {
//       if (!typedSignature.trim()) {
//         toast.warning('Please type your signature');
//         return;
//       }
//       signatureValue = typedSignature.trim();
//     } else if (signatureType === 'image') {
//       if (!uploadedImage) {
//         toast.warning('Please upload your signature image');
//         return;
//       }
//       signatureValue = uploadedImage;
//     }
//     try {
//       await api.post(`/agreements/${selectedAgreementId}/sign`, {
//         email: user.email,
//         type: signatureType,
//         value: signatureValue
//       });
//       toast.success('Signed successfully');
//       handleCloseModal();
//       fetchAgreements();
//     } catch (err) {
//       toast.error(err.response?.data?.error || 'Sign failed');
//     }
//   };

//   const handleDownload = async (agreementId) => {
//     try {
//       const res = await api.get(`/agreements/${agreementId}/download`, { responseType: 'blob' });
//       const url = window.URL.createObjectURL(new Blob([res.data]));
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `agreement-${agreementId}.pdf`;
//       a.click();
//     } catch (err) {
//       toast.error('Failed to download PDF');
//     }
//   };

//   const getChipColor = (status) => {
//     switch (status) {
//       case 'fully-signed': return 'success';
//       case 'partially-signed': return 'warning';
//       case 'pending': return 'error';
//       default: return 'default';
//     }
//   };

//   const getStatusDisplay = (agreement) => {
//     if (agreement.category === 'signed') return 'Fully Signed';
//     return agreement.status?.replace('-', ' ') || 'Pending';
//   };

//   const getPendingCount = () => allAgreements.filter(a => a.category === 'pending').length;
//   const getSignedCount = () => allAgreements.filter(a => a.category === 'signed').length;

//   return (
//     <Container maxWidth="xl" sx={{ mt: 3, px: 2 }}>
//       <Box sx={{ display: 'flex', gap: 3, minHeight: '80vh' }}>
//         <Paper elevation={3} sx={{ width: { xs: '100%', md: '300px' }, minWidth: '280px', height: 'fit-content', p: 3, position: 'sticky', top: 20, borderRadius: 3, bgcolor: '#f5faff', border: '1px solid #bbdefb' }}>
//           <Typography variant="h5" fontWeight={700} mb={3} sx={{ color: '#0d47a1' }}>Sign Agreements</Typography>
//           <TextField
//             label="Search agreements"
//             variant="outlined"
//             fullWidth
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//             InputProps={{
//               endAdornment: (
//                 <Tooltip title="Search">
//                   <IconButton onClick={handleSearch} size="small">
//                     <SearchIcon color="primary" />
//                   </IconButton>
//                 </Tooltip>
//               ),
//             }}
//             sx={{ mb: 3 }}
//           />
//           <Typography variant="subtitle1" fontWeight={600} gutterBottom>Filter by Status</Typography>
//           <ToggleButtonGroup
//             orientation="vertical"
//             value={filter}
//             exclusive
//             onChange={(e, newFilter) => newFilter && setFilter(newFilter)}
//             fullWidth
//             color="primary"
//             sx={{ gap: 1, '& .MuiToggleButton-root': { textAlign: 'left', justifyContent: 'flex-start', borderRadius: 2, py: 1.3, px: 1.5, fontSize: '0.9rem' } }}
//           >
//             <ToggleButton value="all">All Agreements</ToggleButton>
//             <ToggleButton value="pending">Pending Signature</ToggleButton>
//             <ToggleButton value="signed">Fully Signed</ToggleButton>
//           </ToggleButtonGroup>
//             <Box
//             sx={{
//               mt: 3,
//               p: 2,
//               bgcolor: '#e3f2fd',
//               borderRadius: 2,
//               display: 'flex',
//               justifyContent: 'space-between',
//               flexWrap: 'wrap',
//               gap: 2,
//             }}
//           >
//             <Typography variant="caption" color="#0d47a1">
//               Pending: <strong>{getPendingCount()}</strong>
//             </Typography>
//             <Typography variant="caption" color="#0d47a1">
//               Signed: <strong>{getSignedCount()}</strong>
//             </Typography>
//             <Typography variant="caption" color="#0d47a1">
//               Total: <strong>{allAgreements.length}</strong>
//             </Typography>
//           </Box>

//         </Paper>
//         <Box sx={{ flex: 1, minWidth: 0 }}>
//           {filteredAgreements.length === 0 ? (
//             <Paper elevation={1} sx={{ p: 6, textAlign: 'center', borderRadius: 3, bgcolor: '#f1f8ff', border: '1px solid #bbdefb' }}>
//               <Typography variant="h6" sx={{ color: '#0d47a1', mb: 1 }}>No agreements found</Typography>
//               <Typography variant="body2" color="text.secondary">
//                 {searchTerm ? 'Try adjusting your search terms or filters' : filter === 'pending' ? 'No agreements pending your signature' : 'No signed agreements found'}
//               </Typography>
//             </Paper>
//           ) : (
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//               {filteredAgreements.map((agreement) => (
//                 <Card key={agreement._id} elevation={4} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', p: 3, minHeight: '160px', borderRadius: 3, backgroundColor: 'white', border: '1px solid #bbdefb', transition: 'all 0.2s ease-in-out', '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 } }}>
//                   <Box sx={{ flex: 1, pr: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                       <Typography variant="h6" fontWeight={600} sx={{ flex: 1, color: '#0d47a1' }}>{agreement.title}</Typography>
//                       <Chip label={getStatusDisplay(agreement)} color={agreement.category === 'signed' ? 'success' : getChipColor(agreement.status)} variant="outlined" size="small" />
//                     </Box>
//                     <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', fontSize: '0.95rem', lineHeight: 1.5 }}>{agreement.content}</Typography>
//                     <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto' }}>From: <strong>{agreement?.creator?.email || agreement?.creatorEmail}</strong></Typography>
//                   </Box>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
//                     {agreement.category === 'pending' ? (
//                       <Button variant="contained" size="small" startIcon={<EditIcon />} onClick={() => handleSignClick(agreement._id)} sx={{ background: 'linear-gradient(45deg, #2196f3, #1976d2)', px: 3, color: 'white', '&:hover': { background: 'linear-gradient(45deg, #1976d2, #0d47a1)' } }}>Sign Agreement</Button>
//                     ) : (
//                       <Button variant="contained" size="small" startIcon={<DownloadIcon />} onClick={() => handleDownload(agreement._id)} sx={{ background: 'linear-gradient(45deg, #2196f3, #1976d2)', px: 3, color: 'white', '&:hover': { background: 'linear-gradient(45deg, #1976d2, #0d47a1)' } }}>Download PDF</Button>
//                     )}
//                   </Box>
//                 </Card>
//               ))}
//             </Box>
//           )}
//         </Box>
//       </Box>
      
//     </Container>
//   );
// };

// export default SignAgreements;
