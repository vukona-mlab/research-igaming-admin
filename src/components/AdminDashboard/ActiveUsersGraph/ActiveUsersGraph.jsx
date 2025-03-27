import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './ActiveUsersGraph.css';

const ActiveUsersGraph = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(7);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:8000/api/daily-active-users?days=${timeRange}`, {
          headers: {
            Authorization: token
          }
        });
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch active users data');
        console.error('Error fetching active users data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const formatYAxis = (value) => {
    if (value >= 1000) {
      return `${value / 1000}k`;
    }
    return value;
  };

  // Calculate max value from data for Y-axis
  const maxValue = Math.max(
    ...data.map(item => Math.max(item.freelancers, item.clients))
  );

  // Generate nice round numbers for ticks
  const generateNiceTicks = (max) => {
    const roundedMax = Math.ceil(max / 1000) * 1000;
    const step = roundedMax / 4;
    return [0, step, step * 2, step * 3, roundedMax];
  };

  const handleTimeRangeChange = (days) => {
    setTimeRange(days);
    setLoading(true);
  };

  if (loading) return <div className="active-users-container">Loading graph data...</div>;
  if (error) return <div className="active-users-container">Error: {error}</div>;

  return (
    <div className="active-users-container">
      <div className="graph-header">
        <h2>Active Users</h2>
        <div className="legend">
          <span className="legend-item">
            <span className="dot freelancer"></span>
            Freelancers
          </span>
          <span className="legend-item">
            <span className="dot client"></span>
            Clients
          </span>
        </div>
        <div className="time-selector">
          <select 
            value={timeRange} 
            onChange={(e) => handleTimeRangeChange(Number(e.target.value))}
            className="time-select"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
      </div>
      
      <div className="graph-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false}
              stroke="#E5E7EB"
            />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              axisLine={false}
              tickLine={false}
              ticks={generateNiceTicks(maxValue)}
              dx={-10}
              domain={[0, 'auto']}
            />
            <Tooltip 
              contentStyle={{ 
                background: 'white',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              formatter={(value) => [`${formatYAxis(value)}`, '']}
            />
            <Line
              type="monotone"
              dataKey="freelancers"
              stroke="#FF4D4D"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "#FF4D4D" }}
            />
            <Line
              type="monotone"
              dataKey="clients"
              stroke="#333333"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "#333333" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActiveUsersGraph; 