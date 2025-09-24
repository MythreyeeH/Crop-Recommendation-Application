import React, { useState, useRef, useEffect } from 'react';
import {
  Box, IconButton, TextField, CircularProgress, Typography, Paper,
  List, ListItem, ListItemText, InputAdornment, Button, Alert,
  Dialog, DialogContent, DialogTitle, Slide
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CloseIcon from '@mui/icons-material/Close';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StopIcon from '@mui/icons-material/Stop';

import pcmToWav from './WavEncoder.js';
// This utility file is not provided, so I will comment it out.
// import { personalizeGeminiRequest } from './utils/personalize-gemini'; 

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const Chatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [playingIndex, setPlayingIndex] = useState(null);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(new Audio());

  // Dummy user state since personalize-gemini.js is not available
  const [user, setUser] = useState({
    username: 'Farmer',
    context: 'friendly and conversational',
  });

  // Dummy function to replace the import
  const personalizeGeminiRequest = (text, user) => {
    return {
      contents: [
        {
          parts: [
            {
              text: `As a friendly AI assistant named AgriMind, speaking to ${user.username}, please respond in a ${user.context} manner to the following query: "${text}"`,
            },
          ],
        },
      ],
    };
  };

  useEffect(() => {
    if (!SpeechRecognition) {
      setError('Speech Recognition is not supported in this browser. Please use Chrome or a compatible browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'auto';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSendMessage(transcript);
    };
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event);
      setError('Could not process speech. Please try again.');
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;

    return () => {
      if (recognition) recognition.stop();
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setError('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
        setError("Microphone access denied. Please allow access in your browser settings.");
      }
    }
  };

  const handleSendMessage = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const apiKey = "AIzaSyAWswN_gkL-XveVSpJUo15PTI3uMFwqYio";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const payload = personalizeGeminiRequest(text, user);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);

      const result = await response.json();
      const botResponse = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (botResponse) {
        const botMessage = { role: 'bot', content: botResponse };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('No response from bot.');
      }
    } catch (err) {
      console.error('Gemini API Error:', err);
      setError('Sorry, I am unable to respond right now. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTextToSpeech = async (text, index) => {
    if (playingIndex === index) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingIndex(null);
      return;
    }

    if (!audioRef.current.paused) {
      audioRef.current.pause();
    }
    
    setPlayingIndex(index);
    console.log(`Requesting TTS for index ${index}: "${text.substring(0, 30)}..."`);

    try {
      const apiKey = "AIzaSyAWswN_gkL-XveVSpJUo15PTI3uMFwqYio";
      // --- FIX: Corrected API URL to use the TTS model name ---
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
      
      const payload = {
        contents: [{ parts: [{ text: `Say this: ${text}` }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Achird" } } }
        },
        model: "gemini-2.5-flash-preview-tts"
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('TTS API Response Status:', response.status);

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`TTS API error: ${response.statusText} - ${errorBody}`);
      }

      const result = await response.json();
      console.log('TTS API Response Body:', result);

      const audioPart = result?.candidates?.[0]?.content?.parts?.[0];
      const audioData = audioPart?.inlineData?.data;
      const mimeType = audioPart?.inlineData?.mimeType;

      if (audioData && mimeType && mimeType.startsWith("audio/")) {
        console.log(`Received audio data. Mime type: ${mimeType}`);
        const match = mimeType.match(/rate=(\d+)/);
        const sampleRate = match ? parseInt(match[1], 10) : 24000;
        console.log(`Using sample rate: ${sampleRate}`);
        
        const pcmData = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
        const pcm16 = new Int16Array(pcmData.buffer);
        
        const wavBlob = pcmToWav(pcm16, sampleRate);
        const audioUrl = URL.createObjectURL(wavBlob);
        
        audioRef.current.src = audioUrl;
        audioRef.current.play();

        audioRef.current.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setPlayingIndex(null);
        };
      } else {
        throw new Error('Invalid or missing audio data from TTS API.');
      }
    } catch (err) {
      console.error('TTS API Error:', err);
      setError('Could not play audio. Check console for details.');
      setPlayingIndex(null);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      TransitionComponent={Transition}
      keepMounted
      sx={{ '& .MuiDialog-paper': { height: '80vh', display: 'flex', flexDirection: 'column' } }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Ask AgriMind
        </Typography>
        <IconButton aria-label="close" onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
          {messages.length === 0 && (
            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body1">
                Hello! I am your AI assistant for AgriMind. How can I help you today?
              </Typography>
            </Box>
          )}
          {messages.map((msg, index) => (
            <ListItem
              key={index}
              sx={{
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 1,
              }}
            >
              <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              }}>
                <Box
                  sx={{
                    bgcolor: msg.role === 'user' ? '#e0f7fa' : '#f0f0f0',
                    color: 'text.primary',
                    borderRadius: '16px',
                    p: 2,
                    maxWidth: '85%',
                    wordBreak: 'break-word',
                  }}
                >
                  <ListItemText primary={msg.content} />
                </Box>
                {msg.role === 'bot' && (
                  <IconButton 
                    size="small"
                    onClick={() => handleTextToSpeech(msg.content, index)}
                    disabled={loading}
                  >
                    {playingIndex === index ? <StopIcon color="primary" /> : <VolumeUpIcon />}
                  </IconButton>
                )}
              </Box>
            </ListItem>
          ))}
          <div ref={chatEndRef} />
        </List>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress size={24} /></Box>}
        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
      </DialogContent>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderTop: '1px solid #e0e0e0' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type or speak your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleToggleListening} color={isListening ? 'error' : 'primary'} disabled={loading}>
                  {isListening ? <MicOffIcon /> : <MicIcon />}
                </IconButton>
              </InputAdornment>
            ),
            sx: { borderRadius: '24px' },
          }}
          sx={{ mr: 1 }}
        />
        <Button
          variant="contained"
          onClick={() => handleSendMessage()}
          disabled={loading || !input.trim()}
          sx={{ borderRadius: '24px', minWidth: 'auto', p: 2 }}
        >
          <SendIcon />
        </Button>
      </Box>
    </Dialog>
  );
};

export default Chatbot;


