import React, { useEffect, useState, useContext } from 'react';
import {
  Box, Container, Typography, Grid, Card, Chip, TextField,
  IconButton, Tooltip, Button, ToggleButton, ToggleButtonGroup,
  Paper
} from '@mui/material';
import { Download as DownloadIcon, Search as SearchIcon } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import { toast } from 'react-toastify';

const MyAgreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchAgreements();
  }, [searchTerm, filter]);

  const fetchAgreements = async () => {
    try {
      const res = await api.get('/agreements/my-agreements');
      let filtered = res.data.agreements;
      if (filter !== 'all') {
        filtered = filtered.filter((a) => a.status === filter);
      }
      setAgreements(filtered);
    } catch (err) {
      toast.error('Error loading agreements');
    }
  };

  const handleDownload = async (id) => {
    try {
      const res = await api.get(`/agreements/${id}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `agreement-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      toast.error('Download failed');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchAgreements();
      return;
    }

    try {
      const res = await api.get(`/agreements/search?title=${searchTerm}`);
      let filtered = res.data;
      if (filter !== 'all') {
        filtered = filtered.filter((a) => a.status === filter);
      }
      setAgreements(filtered);
    } catch (err) {
      toast.error('Search failed');
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
             My Agreements
          </Typography>

          <TextField
            label="Search by title"
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
            <ToggleButton value="fully-signed"> Fully Signed</ToggleButton>
            <ToggleButton value="pending"> Pending</ToggleButton>
            <ToggleButton value="partially-signed"> Partially Signed</ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Total Agreements: <strong>{agreements.length}</strong>
            </Typography>
          </Box>
        </Paper>

        {/* RIGHT CONTENT - Agreement Cards */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {agreements.length === 0 ? (
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
                {searchTerm ? 'Try adjusting your search terms or filters' : 'You haven\'t created any agreements yet'}
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {agreements.map((agreement) => (
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
                        label={agreement.status.replace('-', ' ')}
                        color={getChipColor(agreement.status)}
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
                      Creator: <strong>{agreement.creator?.email || user?.email}</strong>
                    </Typography>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2, justifyContent: 'center' }}>
                    
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(agreement._id)}
                      sx={{ minWidth: '120px' }}
                    >
                      Download
                    </Button>
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

export default MyAgreements;


// import React, { useEffect, useState, useContext } from 'react';
// import {
//   Container, Typography, Grid, Card, CardContent,
//   Chip, TextField, IconButton, Tooltip, Box, Button
// } from '@mui/material';
// import { Download as DownloadIcon, Search as SearchIcon } from '@mui/icons-material';
// import { AuthContext } from '../context/AuthContext';
// import api from '../api/api';
// import { toast } from 'react-toastify';

// const MyAgreements = () => {
//   const [agreements, setAgreements] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const { user } = useContext(AuthContext);

//   useEffect(() => {
//     fetchAgreements();
//   }, [searchTerm]);

//   const fetchAgreements = async () => {
//     try {
//       const res = await api.get('/agreements/my-agreements');
//       setAgreements(res.data.agreements);
//     } catch (err) {
//       toast.error('Error loading agreements');
//     }
//   };

//   const handleDownload = async (id) => {
//     try {
//       const res = await api.get(`/agreements/${id}/download`, {
//         responseType: 'blob',
//       });

//       const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `agreement-${id}.pdf`);
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     } catch (err) {
//       toast.error('Download failed');
//     }
//   };

//   const handleSearch = async () => {
//     if (!searchTerm.trim()) {
//       fetchAgreements();
//       return;
//     }

//     try {
//       const res = await api.get(`/agreements/search?title=${searchTerm}`);
//       setAgreements(res.data);
//     } catch (err) {
//       toast.error('Search failed');
//     }
//   };

//   const getChipColor = (status) => {
//     switch (status) {
//       case 'fully-signed':
//         return 'success';
//       case 'partially-signed':
//         return 'warning';
//       case 'pending':
//         return 'error';
//       default:
//         return 'default';
//     }
//   };

//   return (
//     <Container sx={{ mt: 6 }}>
//       <Typography variant="h4" fontWeight={700} gutterBottom>
//         My Agreements
//       </Typography>

//       <Box display="flex" alignItems="center" gap={2} mb={4}>
//         <TextField
//           label="Search by title"
//           variant="outlined"
//           fullWidth
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//         />
//         <Tooltip title="Search">
//           <IconButton color="primary" onClick={handleSearch}>
//             <SearchIcon />
//           </IconButton>
//         </Tooltip>
//       </Box>

//       <Grid container spacing={3}>
//         {agreements.length === 0 ? (
//           <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
//             No agreements found.
//           </Typography>
//         ) : (
//           agreements.map((agreement) => (
//             <Grid item xs={12} sm={6} md={4} key={agreement._id}>
//               <Card sx={{
//                 height: '240px',
//                 p: 2,
//                 display: 'flex',
//                 flexDirection: 'column',
//                 justifyContent: 'space-between',
//                 boxShadow: 3,
//                 borderRadius: 3,
//               }}>
//                 <CardContent sx={{ flexGrow: 1 }}>
//                   <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
//                     {agreement.title}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
//                     Creator: {user?.email}
//                   </Typography>
//                   <Chip
//                     label={agreement.status.replace('-', ' ')}
//                     color={getChipColor(agreement.status)}
//                     variant="outlined"
//                     size="small"
//                     sx={{ mt: 1 }}
//                   />
//                 </CardContent>
//                 <Button
//                   variant="contained"
//                   fullWidth
//                   startIcon={<DownloadIcon />}
//                   onClick={() => handleDownload(agreement._id)}
//                 >
//                   Download PDF
//                 </Button>
//               </Card>
//             </Grid>
//           ))
//         )}
//       </Grid>
//     </Container>
//   );
// };

// export default MyAgreements;

// import React, { useEffect, useState, useContext } from 'react';
// import {
//   Container, Typography, Grid, Card, CardContent,
//   Chip, TextField, IconButton, Tooltip, Box, Button
// } from '@mui/material';
// import { Download as DownloadIcon, Search as SearchIcon } from '@mui/icons-material';
// import { AuthContext } from '../context/AuthContext';
// import api from '../api/api';
// import { toast } from 'react-toastify';

// const MyAgreements = () => {
//   const [agreements, setAgreements] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const { user } = useContext(AuthContext);

//   useEffect(() => {
//     fetchAgreements();
//   }, [searchTerm]);

//   const fetchAgreements = async () => {
//     try {
//       const res = await api.get('/agreements/my-agreements');
//       setAgreements(res.data.agreements);
//     } catch (err) {
//       toast.error('Error loading agreements');
//     }
//   };

//   const handleDownload = async (id) => {
//     try {
//       const res = await api.get(`/agreements/${id}/download`, {
//         responseType: 'blob',
//       });

//       const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `agreement-${id}.pdf`);
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     } catch (err) {
//       toast.error('Download failed');
//     }
//   };

//   const handleSearch = async () => {
//     if (!searchTerm.trim()) {
//       fetchAgreements();
//       return;
//     }

//     try {
//       const res = await api.get(`/agreements/search?title=${searchTerm}`);
//       setAgreements(res.data);
//     } catch (err) {
//       toast.error('Search failed');
//     }
//   };

//   const getChipColor = (status) => {
//     switch (status) {
//       case 'fully-signed':
//         return 'success';
//       case 'partially-signed':
//         return 'warning';
//       case 'pending':
//         return 'error';
//       default:
//         return 'default';
//     }
//   };

//   return (
//     <Container sx={{ mt: 8 }}>
//       <Typography variant="h5" gutterBottom>
//         📄 My Agreements
//       </Typography>

//       <Box display="flex" alignItems="center" mb={3}>
//         <TextField
//           label="Search by title"
//           variant="outlined"
//           fullWidth
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//         />
//         <Tooltip title="Search">
//           <IconButton color="primary" onClick={handleSearch}>
//             <SearchIcon />
//           </IconButton>
//         </Tooltip>
//       </Box>

//       <Grid container spacing={4}>
//         {agreements.length === 0 ? (
//           <Typography variant="body1" color="textSecondary" sx={{ ml: 1 }}>
//             No agreements found.
//           </Typography>
//         ) : (
//           agreements.map((agreement) => (
//             <Grid item xs={12} sm={6} md={6} key={agreement._id}>
//               <Card sx={{
//                 display: 'flex',
//                 flexDirection: 'column',
//                 height: '260px',
//                 padding: 2,
//                 justifyContent: 'space-between'
//               }}>
//                 <CardContent sx={{ flexGrow: 1 }}>
//                   <Typography variant="h6" gutterBottom noWrap>
//                     {agreement.title}
//                   </Typography>
//                   <Chip
//                     label={agreement.status.replace('-', ' ')}
//                     color={getChipColor(agreement.status)}
//                     sx={{ mt: 1 }}
//                   />
//                   <Box mt={4}>
//                     <Button
//                       variant="outlined"
//                       startIcon={<DownloadIcon />}
//                       onClick={() => handleDownload(agreement._id)}
//                     >
//                       Download
//                     </Button>
//                   </Box>
//                 </CardContent>
//               </Card>
//             </Grid>
//           ))
//         )}
//       </Grid>
//     </Container>
//   );
// };

// export default MyAgreements;
