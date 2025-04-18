import React, { useEffect, useState, useContext } from 'react';
import {
  Container, Typography, Grid, Card, CardContent,
  Chip, TextField, IconButton, Tooltip, Box, Button
} from '@mui/material';
import { Download as DownloadIcon, Search as SearchIcon } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import { toast } from 'react-toastify';

const MyAgreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchAgreements();
  }, [searchTerm]);

  const fetchAgreements = async () => {
    try {
      const res = await api.get('/agreements/my-agreements');
      setAgreements(res.data.agreements);
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
      setAgreements(res.data);
    } catch (err) {
      toast.error('Search failed');
    }
  };

  const getChipColor = (status) => {
    switch (status) {
      case 'fully-signed':
        return 'success';
      case 'partially-signed':
        return 'warning';
      case 'pending':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container sx={{ mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        📄 My Agreements
      </Typography>

      <Box display="flex" alignItems="center" mb={3}>
        <TextField
          label="Search by title"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Tooltip title="Search">
          <IconButton color="primary" onClick={handleSearch}>
            <SearchIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={4}>
        {agreements.length === 0 ? (
          <Typography variant="body1" color="textSecondary" sx={{ ml: 1 }}>
            No agreements found.
          </Typography>
        ) : (
          agreements.map((agreement) => (
            <Grid item xs={12} sm={6} md={6} key={agreement._id}>
              <Card sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '260px',
                padding: 2,
                justifyContent: 'space-between'
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom noWrap>
                    {agreement.title}
                  </Typography>
                  <Chip
                    label={agreement.status.replace('-', ' ')}
                    color={getChipColor(agreement.status)}
                    sx={{ mt: 1 }}
                  />
                  <Box mt={4}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(agreement._id)}
                    >
                      Download
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default MyAgreements;
