import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './ActiveUsersGraph.css';

const ActiveUsersGraph = () => {
  const data = [
    { name: 'Mon', freelancers: 13000, clients: 1000 },
    { name: 'Tue', freelancers: 300, clients: 80 },
    { name: 'Wed', freelancers: 100, clients: 5 },
    { name: 'Thur', freelancers: 500, clients: 40000 },
    { name: 'Fri', freelancers: 450, clients: 4500 },
    { name: 'Sat', freelancers: 4000, clients: 6000 },
    { name: 'Sun', freelancers: 200, clients: 400 },
  ];

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
        <button className="time-selector">
          Last 7 days
          <span className="dropdown-icon">▼</span>
        </button>
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