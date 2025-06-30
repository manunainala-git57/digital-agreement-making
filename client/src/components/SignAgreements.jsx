import React, { useEffect, useState, useContext } from 'react';
import {
  Container, Typography, Grid, Card, CardContent,
  Chip, Button, Box, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Paper, ToggleButton, ToggleButtonGroup, Tooltip
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Search as SearchIcon,
  Download as DownloadIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import { toast } from 'react-toastify';

const SignAgreements = () => {
  const [pendingAgreements, setPendingAgreements] = useState([]);
  const [signedAgreements, setSignedAgreements] = useState([]);
  const [allAgreements, setAllAgreements] = useState([]);
  const [filteredAgreements, setFilteredAgreements] = useState([]);
  const [selectedAgreementId, setSelectedAgreementId] = useState(null);
  const [signatureType, setSignatureType] = useState('typed');
  const [typedSignature, setTypedSignature] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('pending');

  const { user } = useContext(AuthContext);

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
      
      // Combine all agreements for filtering
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

    // Filter by category
    if (filter === 'pending') {
      filtered = filtered.filter(a => a.category === 'pending');
    } else if (filter === 'signed') {
      filtered = filtered.filter(a => a.category === 'signed');
    }

    // Filter by search term
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

  const handleSignClick = (agreementId) => {
    setSelectedAgreementId(agreementId);
    setSignatureType('typed');
    setTypedSignature('');
    setUploadedImage(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedAgreementId(null);
    setIsModalOpen(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      toast.warning('Please upload a PNG or JPEG image');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.warning('Image must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setUploadedImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSign = async () => {
    let signatureValue = '';
    if (signatureType === 'typed') {
      if (!typedSignature.trim()) {
        toast.warning('Please type your signature');
        return;
      }
      signatureValue = typedSignature.trim();
    } else if (signatureType === 'image') {
      if (!uploadedImage) {
        toast.warning('Please upload your signature image');
        return;
      }
      signatureValue = uploadedImage;
    }

    try {
      await api.post(`/agreements/${selectedAgreementId}/sign`, {
        email: user.email,
        type: signatureType,
        value: signatureValue
      });
      toast.success('Signed successfully');
      handleCloseModal();
      fetchAgreements();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Sign failed');
    }
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

  return (
    <Container maxWidth="xl" sx={{ mt: 3, px: 2 }}>
      <Box sx={{ display: 'flex', gap: 3, minHeight: '80vh' }}>
        
        {/* LEFT SIDEBAR - Search and Filters */}
        <Paper 
          elevation={2}
          sx={{ 
            width: { xs: '100%', md: '300px' },
            minWidth: '280px',
            height: 'fit-content',
            p: 3,
            position: 'sticky',
            top: 20,
            borderRadius: 2
          }}
        >
          <Typography variant="h5" fontWeight={700} mb={3} color="primary">
            Sign Agreements
          </Typography>

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
                    <SearchIcon />
                  </IconButton>
                </Tooltip>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Filter by Status
          </Typography>

          <ToggleButtonGroup
            orientation="vertical"
            value={filter}
            exclusive
            onChange={(e, newFilter) => newFilter && setFilter(newFilter)}
            fullWidth
            color="primary"
            sx={{ 
              gap: 1,
              '& .MuiToggleButton-root': {
                textAlign: 'left',
                justifyContent: 'flex-start',
                borderRadius: 1,
                py: 1.5,
                fontSize: '0.9rem'
              }
            }}
          >
            <ToggleButton value="all"> All Agreements</ToggleButton>
            <ToggleButton value="pending"> Pending Signature</ToggleButton>
            <ToggleButton value="signed"> Fully Signed</ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Pending: <strong>{getPendingCount()}</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Signed: <strong>{getSignedCount()}</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Total: <strong>{allAgreements.length}</strong>
            </Typography>
          </Box>
        </Paper>

        {/* RIGHT CONTENT - Agreement Cards */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {filteredAgreements.length === 0 ? (
            <Paper 
              elevation={1}
              sx={{ 
                p: 6, 
                textAlign: 'center', 
                borderRadius: 2,
                bgcolor: 'grey.50'
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No agreements found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'Try adjusting your search terms or filters' : 
                 filter === 'pending' ? 'No agreements pending your signature' : 
                 'No signed agreements found'}
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {filteredAgreements.map((agreement) => (
                <Card
                  key={agreement._id}
                  elevation={3}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    p: 3,
                    minHeight: '160px',
                    height: '160px',
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 6
                    }
                  }}
                >
                  {/* Agreement Details */}
                  <Box sx={{ flex: 1, minWidth: 0, pr: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                         {agreement.title}
                      </Typography>
                      <Chip
                        label={getStatusDisplay(agreement)}
                        color={agreement.category === 'signed' ? 'success' : getChipColor(agreement.status)}
                        variant="outlined"
                        size="small"
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        fontSize: '0.95rem',
                        mb: 2,
                        lineHeight: 1.5,
                        flex: 1
                      }}
                    >
                      {agreement.content}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto' }}>
                      From: <strong>{agreement?.creator?.email || agreement?.creatorEmail}</strong>
                    </Typography>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2, justifyContent: 'center' }}>
                    {agreement.category === 'pending' ? (
                      <Button 
                        variant="contained" 
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleSignClick(agreement._id)}
                        sx={{ minWidth: '140px' }}
                      >
                        Sign Agreement
                      </Button>
                    ) : (
                      <Button 
                        variant="contained" 
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownload(agreement._id)}
                        sx={{ minWidth: '140px' }}
                      >
                        Download PDF
                      </Button>
                    )}
                  </Box>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Signature Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          Sign Agreement
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500]
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" gutterBottom>Choose Signature Method</Typography>

          <Box sx={{ mb: 3 }}>
            <Button
              variant={signatureType === 'typed' ? 'contained' : 'outlined'}
              onClick={() => setSignatureType('typed')}
              sx={{ mr: 1 }}
            >
              Typed Signature
            </Button>
            <Button
              variant={signatureType === 'image' ? 'contained' : 'outlined'}
              onClick={() => setSignatureType('image')}
            >
              Upload Image
            </Button>
          </Box>

          <Box>
            {signatureType === 'typed' && (
              <TextField
                fullWidth
                label="Type your full name as signature"
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                placeholder="Enter your full name"
                sx={{ 
                  '& input': { 
                    fontFamily: 'cursive',
                    fontSize: '1.2rem' 
                  }
                }}
              />
            )}

            {signatureType === 'image' && (
              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ mb: 2, py: 1.5 }}
                >
                  Choose Signature Image
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                </Button>
                {uploadedImage && (
                  <Box sx={{ textAlign: 'center' }}>
                    <img
                      src={uploadedImage}
                      alt="Signature Preview"
                      style={{ 
                        maxHeight: '120px', 
                        maxWidth: '100%',
                        borderRadius: '8px', 
                        border: '2px solid #e0e0e0',
                        padding: '8px',
                        backgroundColor: '#fafafa'
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseModal} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSign} variant="contained" color="primary" size="large">
            Confirm & Sign
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SignAgreements;
// import React, { useEffect, useState, useContext } from 'react';
// import {
//   Container, Typography, Grid, Card, CardContent,
//   Chip, Button, Box, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
// } from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';
// import { AuthContext } from '../context/AuthContext';
// import api from '../api/api';
// import { toast } from 'react-toastify';

// const SignAgreements = () => {
//   const [pendingAgreements, setPendingAgreements] = useState([]);
//   const [signedAgreements, setSignedAgreements] = useState([]);
//   const [selectedAgreementId, setSelectedAgreementId] = useState(null);
//   const [signatureType, setSignatureType] = useState('typed');
//   const [typedSignature, setTypedSignature] = useState('');
//   const [uploadedImage, setUploadedImage] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const { user } = useContext(AuthContext);

//   useEffect(() => {
//     fetchAgreements();
//   }, []);

//   const fetchAgreements = async () => {
//     try {
//       const res = await api.get('/agreements/pending-to-sign');
//       setPendingAgreements(res.data);
//       const resSigned = await api.get('/agreements/all', {
//         headers: { Authorization: `Bearer ${user?.token}` }
//       });
//       setSignedAgreements(resSigned.data);
//     } catch (err) {
//       toast.error('Error loading agreements');
//     }
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

//    const handleImageUpload = (e) => {
//   const file = e.target.files[0];
//   if (!file) return;

//   // Allow only PNG or JPEG
//   const allowedTypes = ['image/png', 'image/jpeg'];
//   if (!allowedTypes.includes(file.type)) {
//     toast.warning('Please upload a PNG or JPEG image');
//     return;
//   }

//   if (file.size > 2 * 1024 * 1024) {
//     toast.warning('Image must be less than 2MB');
//     return;
//   }

//   const reader = new FileReader();
//   reader.onloadend = () => setUploadedImage(reader.result);
//   reader.readAsDataURL(file);
// };



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

//   const cardStyle = {
//     height: '250px',
//     display: 'flex',
//     flexDirection: 'column',
//     justifyContent: 'space-between',
//     padding: 2,
//     overflow: 'hidden',
//     textOverflow: 'ellipsis'
//   };

//   return (
//     <Container sx={{ mt: 8 }}>
//       <Typography variant="h5" gutterBottom>
//         ✍️ Agreements Pending Your Signature
//       </Typography>

//       <Grid container spacing={4}>
//         {pendingAgreements.length === 0 ? (
//           <Typography variant="body1" color="textSecondary" sx={{ ml: 1 }}>
//             No pending agreements found.
//           </Typography>
//         ) : (
//           pendingAgreements.map((agreement) => (
//             <Grid item xs={12} sm={6} md={6} key={agreement._id}>
//               <Card sx={cardStyle}>
//                 <CardContent>
//                   <Typography variant="h6" gutterBottom noWrap>{agreement.title}</Typography>
//                   <Typography variant="body2" color="text.secondary" noWrap>
//                     {agreement.content.length > 40 ? `${agreement.content.substring(0, 40)}...` : agreement.content}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     From: {agreement?.creator?.email || agreement?.creatorEmail}
//                   </Typography>
//                   <Chip label={agreement.status?.replace('-', ' ')} color={getChipColor(agreement.status)} sx={{ mt: 1 }} />
//                 </CardContent>
//                 <Box mt={1}>
//                   <Button variant="contained" onClick={() => handleSignClick(agreement._id)}>
//                     Sign
//                   </Button>
//                 </Box>
//               </Card>
//             </Grid>
//           ))
//         )}
//       </Grid>

//       <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
//         📁 Signed Agreements
//       </Typography>

//       <Grid container spacing={4}>
//         {signedAgreements.length === 0 ? (
//           <Typography variant="body1" color="textSecondary" sx={{ ml: 1 }}>
//             No fully signed agreements found.
//           </Typography>
//         ) : (
//           signedAgreements.map((agreement) => (
//             <Grid item xs={12} sm={6} md={6} key={agreement._id}>
//               <Card sx={cardStyle}>
//                 <CardContent>
//                   <Typography variant="h6" gutterBottom noWrap>{agreement.title}</Typography>
//                   <Typography variant="body2" color="text.secondary" noWrap>
//                     {agreement.content.length > 40 ? `${agreement.content.substring(0, 40)}...` : agreement.content}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     From: {agreement?.creator?.email || agreement?.creatorEmail}
//                   </Typography>
//                   <Chip label="Fully Signed" color="success" sx={{ mt: 1 }} />
//                 </CardContent>
//                 <Box mt={1}>
//                   <Button variant="contained" onClick={() => handleDownload(agreement._id)}>
//                     Download PDF
//                   </Button>
//                 </Box>
//               </Card>
//             </Grid>
//           ))
//         )}
//       </Grid>

//       {/* Signature Modal */}
//       <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
//         <DialogTitle>
//           Sign Agreement
//           <IconButton
//             aria-label="close"
//             onClick={handleCloseModal}
//             sx={{
//               position: 'absolute',
//               right: 8,
//               top: 8,
//               color: (theme) => theme.palette.grey[500]
//             }}
//           >
//             <CloseIcon />
//           </IconButton>
//         </DialogTitle>
//         <DialogContent dividers>
//           <Typography variant="subtitle1" gutterBottom>Choose Signature Method</Typography>

//           <Button
//             variant={signatureType === 'typed' ? 'contained' : 'outlined'}
//             onClick={() => setSignatureType('typed')}
//             sx={{ mr: 1 }}
//           >
//             Typed
//           </Button>
//           <Button
//             variant={signatureType === 'image' ? 'contained' : 'outlined'}
//             onClick={() => setSignatureType('image')}
//           >
//             Upload
//           </Button>

//           <Box mt={2}>
//             {signatureType === 'typed' && (
//               <TextField
//                 fullWidth
//                 label="Typed Signature"
//                 value={typedSignature}
//                 onChange={(e) => setTypedSignature(e.target.value)}
//               />
//             )}

//             {signatureType === 'image' && (
//               <>
//                 <input type="file" accept="image/*" onChange={handleImageUpload} />
//                 {uploadedImage && (
//                   <img
//                     src={uploadedImage}
//                     alt="Signature Preview"
//                     style={{ maxHeight: '150px', marginTop: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
//                   />
//                 )}
//               </>
//             )}
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleSign} variant="contained" color="primary">
//             Confirm & Sign
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Container>
//   );
// };

// export default SignAgreements;
