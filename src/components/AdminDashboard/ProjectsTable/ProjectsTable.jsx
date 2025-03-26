import React from 'react';
import ProjectStats from '../ProjectsStats/ProjectStats';
import './ProjectsTable.css';

const ProjectsTable = () => {
  const projectStats = [
    {
      id: 1,
      number: '35k',
      label: 'Pending Projects',
      data: [25, 40, 30, 35, 20, 35],
      color: 'rgb(0, 0, 0)' 
    },
    {
      id: 2,
      number: '12k',
      label: 'Rejected Projects',
      data: [15, 25, 35, 20, 30, 25],
      color: 'rgb(0, 0, 0)' 
    },
    {
      id: 3,
      number: '48k',
      label: 'Completed Projects',
      data: [30, 35, 45, 40, 50, 5],
      color: 'rgb(0, 0, 0)' 
    }
  ];

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