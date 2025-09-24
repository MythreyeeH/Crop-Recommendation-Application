import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList, Cell
} from 'recharts';
import { Typography, Box } from '@mui/material';

// Custom Tooltip for better styling
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <Box sx={{ bgcolor: 'white', p: 1.5, border: '1px solid #ccc', borderRadius: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{label}</Typography>
        <Typography variant="body2" color={value > 0 ? '#66c2a5' : '#fc8d62'}>
          {`Contribution: ${value.toFixed(2)}%`}
        </Typography>
      </Box>
    );
  }
  return null;
};

// Custom Label component to position text on top of/below the bars
const renderCustomizedLabel = (props) => {
  const { x, y, width, value } = props;
  const offset = value > 0 ? -10 : 20; // Position above positive bars, below negative bars
  const textAnchor = "middle";

  return (
    <text x={x + width / 2} y={y + offset} fill="#333" textAnchor={textAnchor} dy={-4} fontSize={12}>
      {`${value.toFixed(1)}%`}
    </text>
  );
};


const ShapChart = ({ data }) => {
  // 1. --- UPDATED: Matched Matplotlib's sorting order (ascending by absolute impact) ---
  const sortedData = [...data].sort((a, b) => Math.abs(a.contribution) - Math.abs(b.contribution));

  return (
    <Box sx={{ height: 350, width: '100%' }}>
      <Typography variant="subtitle1" align="center" gutterBottom color="text.secondary">
        Feature Contribution to Prediction (%)
      </Typography>
      {/* 2. --- UPDATED: Switched to a vertical layout by removing 'layout' prop --- */}
      <ResponsiveContainer>
        <BarChart
          data={sortedData}
          margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          {/* 3. --- UPDATED: Feature names are now on the X-axis --- */}
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />

          {/* 4. --- UPDATED: Numerical values are now on the Y-axis, with a '%' formatter --- */}
          <YAxis
            tickFormatter={(tick) => `${tick}%`}
            domain={['auto', 'auto']}
            tick={{ fontSize: 12 }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Bar dataKey="contribution">
            {/* 5. --- UPDATED: Added custom data labels to match Matplotlib plot --- */}
            <LabelList dataKey="contribution" content={renderCustomizedLabel} />
            {sortedData.map((entry, index) => {
              // 6. --- UPDATED: Matched the exact colors from your Python script ---
              const positive_color = '#66c2a5'; // Soft teal/green
              const negative_color = '#fc8d62'; // Soft orange/peach
              return <Cell key={`cell-${index}`} fill={entry.contribution > 0 ? positive_color : negative_color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ShapChart;