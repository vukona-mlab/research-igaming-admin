import React from 'react';
import PropTypes from 'prop-types';
import './TableStat.css';

const TableStat = ({ data, columns }) => {
  if (!data || !columns) return null;

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={`${rowIndex}-${column.key}`}>
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TableStat.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
};

// Example usage:
const ExampleTable = () => {
  const columns = [
    { key: 'activeUsers', title: 'Active Users' },
    { key: 'activeClients', title: 'Active Clients' },
    { key: 'activeFreelancer', title: 'Active Freelancer' },
    { key: 'blockedUsers', title: 'Blocked Users' },
    { key: 'blockedClients', title: 'Blocked Clients' },
    { key: 'blockedFreelancer', title: 'Blocked Freelancer' }
  ];

  const data = [
    {
      activeUsers: '800 000',
      activeClients: '480 000',
      activeFreelancer: '320 000',
      blockedUsers: '520',
      blockedClients: '500',
      blockedFreelancer: '20'
    }
  ];

  return <TableStat data={data} columns={columns} />;
};

export default ExampleTable; 