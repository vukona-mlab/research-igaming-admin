import React, { useState, useEffect } from 'react';
import ProjectStats from '../ProjectsStats/ProjectStats';
import axios from 'axios';
import './ProjectsTable.css';

const ProjectsTable = () => {
  const [projectStats, setProjectStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to format numbers
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  useEffect(() => {
    const fetchProjectStats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        // Check if token already has Bearer prefix
        const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

        const response = await axios.get('http://localhost:8000/api/project-stats', {
          headers: {
            Authorization: authHeader
          }
        });
        const stats = response.data;
        setProjectStats([
          {
            id: 1,
            number: formatNumber(stats.pending),
            label: 'Pending Projects',
            data: [25, 40, 30, 35, 20, 35],
            color: 'rgb(0, 0, 0)',
          },
          {
            id: 2,
            number: formatNumber(stats.rejected),
            label: 'Rejected Projects',
            data: [15, 25, 35, 20, 30, 25],
            color: 'rgb(0, 0, 0)',
          },
          {
            id: 3,
            number: formatNumber(stats.completed),
            label: 'Completed Projects',
            data: [30, 35, 45, 40, 50, 5],
            color: 'rgb(0, 0, 0)',
          },
        ]);
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Authentication failed. Please make sure you are logged in.');
          console.error('Authentication error:', err.response?.data);
        } else if (err.response?.status === 404) {
          setError('Project statistics endpoint not found. Please check the API configuration.');
          console.error('Endpoint not found:', err.response?.data);
        } else {
          setError('Failed to fetch project statistics');
          console.error('Error fetching project statistics:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjectStats();
  }, []);

  if (loading) return <div>Loading project statistics...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="projects-table">
      <div className="projects-stats-grid">
        {projectStats.map((stat) => (
          <ProjectStats
            key={stat.id}
            number={stat.number}
            label={stat.label}
            data={stat.data}
            color={stat.color}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectsTable; 