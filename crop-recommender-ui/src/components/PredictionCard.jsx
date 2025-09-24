import React from 'react';
import {
  Card, CardContent, Typography, Grid, Box, Chip, Accordion,
  AccordionSummary, AccordionDetails, Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import ScienceIcon from '@mui/icons-material/Science';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import ShapChart from './ShapChart';

const rankColors = {
  1: 'success',
  2: 'info',
  3: 'warning',
};

// A helper component for displaying key-value pairs consistently
const InfoItem = ({ label, value, icon }) => (
  <Grid item xs={12} sm={6}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      {icon && React.cloneElement(icon, { sx: { mr: 1, color: 'text.secondary' } })}
      <Typography variant="body2" color="text.secondary" component="span">{label}:</Typography>
      <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 'bold' }} component="span">{value}</Typography>
    </Box>
  </Grid>
);

const PredictionCard = ({ prediction, rank }) => {
  const {
    cropDetails, interpretation, shapChartData, nutrientFertilizer,
    waterIrrigation, cyclePostHarvest, actionableRecommendations
  } = prediction;

  const DetailSection = ({ title, icon, data, children }) => (
    <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {icon}
          <Typography sx={{ ml: 1.5, fontWeight: '500' }}>{title}</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={1}>
          {children || Object.entries(data).map(([key, value]) => (
            <InfoItem key={key} label={key} value={value} />
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Card elevation={3} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Chip label={`#${rank} Recommendation`} color={rankColors[rank]} sx={{ fontWeight: 'bold' }} />
            <Typography variant="h4" component="div" color="primary" sx={{ mt: 1 }}>
              {cropDetails.CropName}
            </Typography>
          </Box>
          <Box>
            <Typography variant="h5" color="text.secondary">
              {cropDetails.Confidence}
            </Typography>
            <Typography variant="caption" display="block" align="right">
              Confidence Score
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* --- SHAP Interpretation Section --- */}
        <Typography variant="h6" gutterBottom>Why this crop?</Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <ShapChart data={shapChartData} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <InfoIcon color="action" sx={{ mr: 1.5, mt: 0.5 }} />
              <Typography variant="body1" color="text.secondary">
                {interpretation}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* --- Accordion Details Section --- */}
        <Box>
          <DetailSection title="Actionable Recommendations" icon={<CheckCircleIcon color="success" />}>
            {Object.entries(actionableRecommendations).map(([key, value]) => (
              <InfoItem key={key} label={key} value={value} />
            ))}
          </DetailSection>

          <DetailSection title="Nutrient & Fertilizer Details" icon={<ScienceIcon color="action" />}>
             {Object.entries(nutrientFertilizer).map(([key, value]) => (
              <InfoItem key={key} label={key} value={value} />
            ))}
          </DetailSection>
          
          <DetailSection title="Water & Irrigation" icon={<WaterDropIcon color="action" />}>
             {Object.entries(waterIrrigation).map(([key, value]) => (
              <InfoItem key={key} label={key} value={value} />
            ))}
          </DetailSection>

          <DetailSection title="Crop Cycle & Post-Harvest" icon={<CalendarMonthIcon color="action" />}>
            {Object.entries(cyclePostHarvest).map(([key, value]) => (
              <InfoItem key={key} label={key} value={value} />
            ))}
          </DetailSection>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PredictionCard;