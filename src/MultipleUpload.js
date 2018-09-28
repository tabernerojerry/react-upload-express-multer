import React, { Component, Fragment } from "react";
import axios from "axios";
import _ from "lodash";

import Message from "./Message";

export class MultipleUpload extends Component {
  state = {
    files: [],
    uploadFiles: [],
    uploadedFiles: [],
    message: "",
    error: false
  };

  // Validate Files Method
  validateFile = file => {
    //return ""; // testing for server side error

    const MAX_SIZE = 5000000; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    // check if images size too large return true
    const tooLarge = file.size > MAX_SIZE;

    // check if file attach is image return true
    const isImage = allowedTypes.includes(file.type);

    if (tooLarge && isImage)
      return `Too large. Max size is ${MAX_SIZE / 1000}KB`;

    if (!isImage) return "Only images are allowed!";

    return "";
  };

  // Form Input Change Method
  _onChange = async ({ target: { name, files } }) => {
    await this.setState({
      [name]: [
        ...this.state.files,
        ..._.map(files, file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          invalidMessage: this.validateFile(file)
        }))
      ],
      uploadFiles: [...this.state.uploadFiles, ...files]
    });

    // console.log("files: ", this.state.files);
    //console.log("uploadFiles: ", this.state.uploadFiles);
  };

  // Form Submit Method
  _onSubmit = async event => {
    event.preventDefault();

    try {
      const formData = new FormData();

      // iterate all attach files and validate if a valid file
      _.forEach(this.state.uploadFiles, file => {
        if (this.validateFile(file) === "") {
          formData.append("files", file);
        }
      });

      // API Call using axios
      const {
        data: { files }
      } = await axios.post("/multiple-upload", formData);

      await this.setState({
        files: [],
        uploadFiles: [],
        uploadedFiles: [...files],
        message:
          files.length > 0 &&
          `${files.length} files has been successfully uploaded`
      });
    } catch (err) {
      this.setState({
        error: true,
        message: err.response.data.error
      });
    }
  };

  // Remove file from upload lists
  _onDelete = index => event => {
    event.preventDefault();

    this.setState({
      // UI Files List
      files: this.state.files.filter((file, i) => i !== index),
      // Server Files List
      uploadFiles: this.state.uploadFiles.filter((file, i) => i !== index)
    });
  };

  // Disabled Submit Button if invalid files is in the upload lists (return TRUE or FALSE)
  hasInvalidFiles = () =>
    this.state.files.filter(file => file.invalidMessage).length > 0;

  render() {
    const { files, message, error, uploadedFiles } = this.state;

    return (
      <form encType="multipart/form-data" onSubmit={this._onSubmit}>
        {message && <Message message={message} error={error} />}

        <div className="input-field col s12">
          <div className="btn waves-effect waves-light btn-large btn-upload blue darken-1">
            <span className="valign-wrapper">
              Multiple Uploads <i className="material-icons">file_upload</i>
            </span>
            <input
              multiple
              type="file"
              name="files"
              onChange={this._onChange}
            />
          </div>
        </div>

        {files.length > 0 && (
          <ul className="collection">
            {files.map((file, index) => (
              <li
                key={index}
                className={`collection-item ${file.invalidMessage &&
                  "red-text"}`}
              >
                <div>
                  {file.name}{" "}
                  {file.invalidMessage && `- ${file.invalidMessage}`}
                  <a
                    className="secondary-content"
                    onClick={this._onDelete(index)}
                  >
                    <i className="material-icons">delete</i>
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="input-field col s12">
          <button
            type="submit"
            className="btn waves-effect waves-light orange"
            disabled={this.hasInvalidFiles() && "disabled"}
          >
            Send
          </button>
        </div>

        {uploadedFiles.length > 0 && (
          <Fragment>
            <h5>Successfully uploaded files:</h5>
            {uploadedFiles.map((file, index) => (
              <div className="col s2" key={index}>
                <div className="card">
                  <div className="card-image">
                    <img src={file} alt="" />
                  </div>
                </div>
              </div>
            ))}
          </Fragment>
        )}
      </form>
    );
  }
}

export default MultipleUpload;
