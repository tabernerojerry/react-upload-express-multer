import React from "react";

const Message = ({ error = false, message = "", fileName = "" }) => (
  <div className={`card-panel ${error ? "red" : "green"}`}>
    <span className="white-text">
      {fileName && `${fileName} - `}
      {message}
    </span>
  </div>
);

export default Message;
