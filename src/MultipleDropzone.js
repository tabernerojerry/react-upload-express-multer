import React, { Component, Fragment } from "react";
import axios from "axios";
import _ from "lodash";

import Progress from "./Progress";
import Message from "./Message";

export class MultipleDropzone extends Component {
  state = {
    files: [],
    uploadFiles: [],
    uploadedFiles: [],
    message: "",
    uploading: false,
    error: false,
    progress: 0,
    visible: false
  };

  // Auto hide message in 5seconds
  messageVisibility = () =>
    setTimeout(() => this.setState({ visible: false }), 5000);

  // Validate File Method
  validateFile = file => {
    //return ""; // testing for server side error

    const MAX_SIZE = 200000;
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

  // Input Change & Submit Form Method
  _onChange = async ({ target: { name, files } }) => {
    await this.setState({
      [name]: [
        ..._.map(files, file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          invalidMessage: this.validateFile(file)
        }))
      ],
      uploadFiles: [...files],
      visible: true
    });
    //console.log("files: ", this.state.files);
    //console.log("uploadFiles: ", this.state.uploadFiles);

    // Auto hide error message in 5seconds
    this.messageVisibility();

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
        uploadedFiles: [...this.state.uploadedFiles, ...files],
        message:
          files.length > 0 &&
          `${files.length} files has been successfully uploaded`,
        visible: true
      });

      setTimeout(
        () =>
          this.setState({
            files: [],
            uploadFiles: [],
            visible: false
          }),
        5000
      );
    } catch (err) {
      console.log(err);
      this.setState({
        visible: true,
        error: true,
        message: err.response.data.error
      });

      this.messageVisibility();
    }
  };

  render() {
    const {
      files,
      uploading,
      uploadedFiles,
      progress,
      visible,
      message,
      error
    } = this.state;
    return (
      <form encType="multipart/form-data">
        {visible && message && <Message message={message} error={error} />}

        {visible &&
          files.length > 0 &&
          files.map(
            (file, index) =>
              file.invalidMessage && (
                <Message
                  key={index}
                  fileName={file.name}
                  message={file.invalidMessage}
                  error={true}
                />
              )
          )}

        <div className="dropzone z-depth-2">
          <input
            multiple
            type="file"
            name="files"
            className="input-dropzone"
            onChange={this._onChange}
          />

          {!uploading && (
            <p className="call-to-action">
              Multiple Files Drag and Drop Upload
            </p>
          )}

          {uploading && <Progress progress={progress} />}
        </div>

        {uploadedFiles.length > 0 && (
          <Fragment>
            <h5>Successfully uploaded files: </h5>
            {uploadedFiles.map((file, index) => (
              <div className="col s4" key={index}>
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

export default MultipleDropzone;
