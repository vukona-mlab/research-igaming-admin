import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './ProjectStats.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ProjectStats = ({ number, label, data: chartData, color }) => {
  // Chart data
  const data = {
    labels: ['', '', '', '', '', ''], // Empty labels for cleaner look
    datasets: [
      {
        data: chartData,
        fill: false,
        borderColor: color,
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        },
      },
      y: {
        display: false,
        grid: {
          display: false,
        },
        min: 0,
        max: 50, // Set max to prevent too much empty space
      },
    },
    maintainAspectRatio: false,
    elements: {
      line: {
        tension: 0.3,
      },
    },
  };

  return (
    <div className="project-stats-card">
      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
      <div className="stats-content">
        <div className="stats-number">{number}</div>
        <div className="stats-label">{label}</div>
      </div>
    </div>
  );
};

export default ProjectStats;
