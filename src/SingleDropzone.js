import React, { Component, Fragment } from "react";
import axios from "axios";

import Progress from "./Progress";
import Message from "./Message";

export class SingleDropzone extends Component {
  state = {
    file: "",
    uploading: false,
    message: "",
    error: false,
    uploadedFiles: [],
    progress: 0
  };

  // Validate File Method
  validateFile = () => {
    //return true; // testing for server side error

    const { file } = this.state;

    const MAX_SIZE = 5000000; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

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
      [name]: files[0]
    });

    // skip process if invalid file
    if (!this.validateFile()) return;

    try {
      this.setState({ uploading: true });

      const formData = new FormData();

      formData.append("file", this.state.file);

      // API Call using axios
      const {
        data: { file }
      } = await axios.post("/single-dropzone", formData, {
        onUploadProgress: event =>
          this.setState({
            progress: Math.floor((event.loaded * 100) / event.total)
          })
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
      file,
      uploading,
      message,
      error,
      uploadedFiles,
      progress
    } = this.state;
    return (
      <form encType="multipart/form-data">
        {message && <Message message={message} error={error} />}

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

          {uploading && <Progress progress={progress} fileName={file.name} />}
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
