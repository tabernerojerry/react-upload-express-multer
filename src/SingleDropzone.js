import React, { Component, Fragment } from "react";
import axios from "axios";

import Progress from "./Progress";

export class SingleDropzone extends Component {
  state = {
    file: "",
    uploading: false,
    message: "",
    error: false,
    uploadedFiles: [],
    progress: 0,
    visible: false
  };

  // Validate File Method
  validateFile = () => {
    //return true; // testing for server side error

    const { file } = this.state;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    const MAX_SIZE = 200000;

    // check if images size too large return true
    const tooLarge = file.size > MAX_SIZE;

    // check if file attach is image return true
    const isImage = allowedTypes.includes(file.type);

    //console.log("tooLarge:", tooLarge);
    //console.log("isImage:", isImage);

    if (isImage && !tooLarge) {
      this.setState({ error: false, message: "" });

      return true;
    } else {
      this.setState({
        error: true,
        message:
          tooLarge && isImage
            ? `${file.name} - Too large. Max size is ${MAX_SIZE / 1000}KB`
            : `${file.name} - Only images are allowed!`
      });

      return false;
    }
  };

  // Input Change & Submit Form Method
  _onChange = async ({ target: { name, files } }) => {
    await this.setState({
      [name]: files[0],
      visible: true
    });
    //console.log(this.state.file);

    // Auto hide error message in 5seconds
    setTimeout(() => this.setState({ visible: false }), 5000);

    if (!this.validateFile()) return;

    try {
      this.setState({ uploading: true });

      const formData = new FormData();

      formData.append("file", this.state.file);

      // API Call using axios
      const {
        data: { file }
      } = await axios.post("/dropzone", formData, {
        onUploadProgress: e =>
          this.setState({ progress: Math.round((e.loaded * 100) / e.total) })
      });
      //console.log(file);

      await this.setState({
        file: "",
        uploadedFiles: [...this.state.uploadedFiles, file],
        uploading: false,
        progress: 0,
        error: false,
        message: "File has been succussfully uploaded!"
      });

      //console.log("uploadedFiles: ", this.state.uploadedFiles);
    } catch (err) {
      this.setState({
        uploading: false,
        error: true,
        message: err.response.data.error
      });
    }
  };

  render() {
    const {
      uploading,
      message,
      error,
      uploadedFiles,
      progress,
      visible
    } = this.state;
    return (
      <form encType="multipart/form-data">
        {visible &&
          message && (
            <div className={`card-panel ${error ? "red" : "green"}`}>
              <span className="white-text">{message}</span>
            </div>
          )}

        <div className="dropzone z-depth-2">
          <input
            type="file"
            name="file"
            className="input-dropzone"
            onChange={this._onChange}
          />

          {!uploading && (
            <p className="call-to-action">Single File Drag and Drop Upload </p>
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

export default SingleDropzone;
