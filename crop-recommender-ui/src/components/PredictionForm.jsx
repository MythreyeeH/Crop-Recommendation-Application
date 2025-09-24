import React, { useState } from 'react';
import { Card, CardContent, Grid, TextField, Typography, Box } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import SendIcon from '@mui/icons-material/Send';

const initialFormData = {
  temperature: '25',
  humidity: '80',
  sunlight_hours: '8',
  ph: '6.5',
  rainfall: '100',
  soil_moisture: '60',
};

const PredictionForm = ({ onPredict, isLoading }) => {
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPredict(formData);
  };

  return (
    <Card elevation={2} sx={{ borderRadius: '16px' }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom color="primary">
          Environmental Data
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Temperature (°C)"
                name="temperature"
                type="number"
                value={formData.temperature}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Humidity (%)"
                name="humidity"
                type="number"
                value={formData.humidity}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Sunlight (Hours/Day)"
                name="sunlight_hours"
                type="number"
                value={formData.sunlight_hours}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Soil pH"
                name="ph"
                type="number"
                value={formData.ph}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Rainfall (mm)"
                name="rainfall"
                type="number"
                value={formData.rainfall}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Soil Moisture (%)"
                name="soil_moisture"
                type="number"
                value={formData.soil_moisture}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              endIcon={<SendIcon />}
              loading={isLoading}
              loadingPosition="end"
            >
              <span>Recommend Crop</span>
            </LoadingButton>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default PredictionForm;