import React, { useState } from 'react';
import axios from 'axios';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Container, Typography, CircularProgress, Alert, Grid, Box,
  CssBaseline, AppBar, Toolbar, Fab, Modal
} from '@mui/material';
import SpaIcon from '@mui/icons-material/Spa';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';

import PredictionForm from './components/PredictionForm';
import PredictionCard from './components/PredictionCard';
import Chatbot from './Chatbot'; // Import the new Chatbot component
import './App.css';

// Define a clean, nature-inspired theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // A nice, deep green
    },
    secondary: {
      main: '#81c784', // A lighter, complementary green
    },
    background: {
      default: '#f4f6f8', // A very light grey for a clean background
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
});

function App() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // New state to manage the chatbot modal
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const handlePredict = async (formData) => {
    setLoading(true);
    setError('');
    setPredictions([]);
    try {
      // IMPORTANT: Make sure your Flask API is running on this address
      const response = await axios.post('http://127.0.0.1:5000/predict', formData);
      setPredictions(response.data);
    } catch (err) {
      console.error("API Error:", err);
      setError('Failed to get predictions. Please ensure the backend is running and check your input values.');
    } finally {
      setLoading(false);
    }
  };

  // Handlers for the chatbot modal
  const handleOpenChatbot = () => setIsChatbotOpen(true);
  const handleCloseChatbot = () => setIsChatbotOpen(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <SpaIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AgriMind: Smart Crop Recommendation
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Find the Perfect Crop for Your Land
        </Typography>
        <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 4 }}>
          Enter your environmental conditions below to receive AI-powered crop recommendations.
        </Typography>

        <PredictionForm onPredict={handlePredict} isLoading={loading} />

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

        {predictions.length > 0 && (
          <Box sx={{ mt: 5 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Top 3 Recommendations
            </Typography>
            <Grid container spacing={4}>
              {predictions.map((pred, index) => (
                <Grid item xs={12} key={index}>
                  <PredictionCard prediction={pred} rank={index + 1} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
      
      {/* Floating Action Button for Chatbot */}
      <Fab
        color="primary"
        aria-label="chat"
        onClick={handleOpenChatbot}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <ChatBubbleIcon />
      </Fab>

      {/* Chatbot Modal */}
      <Chatbot isOpen={isChatbotOpen} onClose={handleCloseChatbot} />

    </ThemeProvider>
  );
}

export default App;


