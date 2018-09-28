import React from "react";
import PropTypes from "prop-types";

const Message = ({ error, message }) => (
  <div className={`card-panel ${error ? "red" : "green"}`}>
    <span className="white-text">{message}</span>
  </div>
);

Message.propTypes = {
  error: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired
};

export default Message;
