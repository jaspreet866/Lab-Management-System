import React from "react";

export const StatCardSkeleton = () => (
  <div className="stat-card skeleton-stat-card">
    <div className="skeleton-line skeleton-icon"></div>
    <div className="skeleton-content">
      <div className="skeleton-line skeleton-title"></div>
      <div className="skeleton-line skeleton-number"></div>
      <div className="skeleton-line skeleton-sub"></div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="table-responsive skeleton-table-wrapper">
    <table className="table modern-table">
      <thead>
        <tr>
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i}>
              <div className="skeleton-line skeleton-th"></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }).map((_, c) => (
              <td key={c}>
                <div className="skeleton-line skeleton-td"></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const ChartSkeleton = () => (
  <div className="chart-card skeleton-chart-card p-4">
    <div className="skeleton-line skeleton-title mb-4" style={{ width: "40%" }}></div>
    <div className="skeleton-chart-box"></div>
  </div>
);
