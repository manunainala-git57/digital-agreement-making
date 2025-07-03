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

        {/* SIDEBAR */}
        <Paper 
          elevation={3}
          sx={{ 
            width: { xs: '100%', md: '300px' },
            minWidth: '280px',
            height: 'fit-content',
            p: 3,
            position: 'sticky',
            top: 20,
            borderRadius: 3,
            bgcolor: '#f5faff',
            border: '1px solid #bbdefb'
          }}
        >
          <Typography variant="h5" fontWeight={700} mb={3} sx={{ color: '#0d47a1' }}>
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
                    <SearchIcon color="primary" />
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
                borderRadius: 2,
                py: 1.3,
                px: 1.5,
                fontSize: '0.9rem',
              }
            }}
          >
            <ToggleButton value="all">All Agreements</ToggleButton>
            <ToggleButton value="fully-signed">Fully Signed</ToggleButton>
            <ToggleButton value="pending">Pending</ToggleButton>
            <ToggleButton value="partially-signed">Partially Signed</ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
            <Typography variant="caption" color="#0d47a1">
              Total Agreements: <strong>{agreements.length}</strong>
            </Typography>
          </Box>
        </Paper>

        {/* MAIN CONTENT */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {agreements.length === 0 ? (
            <Paper 
              elevation={1}
              sx={{ 
                p: 6, 
                textAlign: 'center', 
                borderRadius: 3,
                bgcolor: '#f1f8ff',
                border: '1px solid #bbdefb'
              }}
            >
              <Typography variant="h6" sx={{ color: '#0d47a1', mb: 1 }}>
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
                  elevation={4}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    p: 3,
                    minHeight: '160px',
                    borderRadius: 3,
                    backgroundColor: 'white',
                    border: '1px solid #bbdefb',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 6
                    }
                  }}
                >
                  {/* Agreement Details */}
                  <Box sx={{ flex: 1, pr: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" fontWeight={600} sx={{ flex: 1, color: '#0d47a1' }}>
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
                        lineHeight: 1.5,
                      }}
                    >
                      {agreement.content}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto' }}>
                      Creator: <strong>{agreement.creator?.email || user?.email}</strong>
                    </Typography>
                  </Box>

                  {/* Download Button */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(agreement._id)}
                      sx={{ 
                        background: 'linear-gradient(45deg, #2196f3, #1976d2)',
                        px: 3,
                        color: 'white',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1976d2, #0d47a1)'
                        }
                      }}
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
