import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const CustomLineChart = ({ data, metrics = ['clicks', 'impressions'], colors = ['#3b82f6', '#ec4899'] }) => {
  const formatTooltipValue = (value, name) => {
    if (name === 'clicks') return [value.toLocaleString(), 'Clicks'];
    if (name === 'impressions') return [value.toLocaleString(), 'Impressions'];
    return [value, name];
  };

  const formatXAxisLabel = (tickItem) => {
    return format(new Date(tickItem), 'MMM dd');
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatXAxisLabel}
          stroke="#6b7280"
          fontSize={12}
        />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip 
          formatter={formatTooltipValue}
          labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy')}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        {metrics.map((metric, index) => (
          <Line
            key={metric}
            type="monotone"
            dataKey={metric}
            stroke={colors[index] || '#3b82f6'}
            strokeWidth={2}
            dot={{ fill: colors[index] || '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: colors[index] || '#3b82f6', strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CustomLineChart;