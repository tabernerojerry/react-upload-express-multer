import React from "react";
import PropTypes from "prop-types";

const Progress = ({ progress, totalQueue, currentFile, fileName }) => (
  <div className="col s12">
    {totalQueue > 0 && (
      <h6 className="center">
        uploading {currentFile} of {totalQueue} files
      </h6>
    )}

    {fileName && <h6 className="center">uploading {fileName}</h6>}

    <div className="progress">
      <div className="determinate" style={{ width: `${progress}%` }} />
    </div>
  </div>
);

Progress.propTypes = {
  progress: PropTypes.number.isRequired,
  totalQueue: PropTypes.number,
  currentFile: PropTypes.number,
  fileName: PropTypes.string
};

export default Progress;
