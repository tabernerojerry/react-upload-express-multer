import React from "react";

const Progress = ({ progress }) => (
  <div className="progress">
    <div className="determinate" style={{ width: `${progress}%` }} />
  </div>
);

export default Progress;
