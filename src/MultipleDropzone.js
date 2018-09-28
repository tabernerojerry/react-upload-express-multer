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
    //visible: false,
    totalQueue: 0,
    currentFile: 0
  };

  // Auto hide message in 5seconds
  /*messageVisibility = () =>
    setTimeout(() => this.setState({ visible: false }), 8000);*/

  // Validate File Method
  validateFile = file => {
    //return ""; // testing for server side error

    const MAX_SIZE = 5000000; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    // check if images size too large return true
    const tooLarge = file.size > MAX_SIZE;

    // check if file attach is image return true
    const isImage = allowedTypes.includes(file.type);

    if (tooLarge && isImage)
      return `${file.name} - Too large. Max size is ${MAX_SIZE / 1000}KB`;

    if (!isImage) return `${file.name} - Only images are allowed!`;

    return "";
  };

  // Upload Progress Effect
  fileUploadProgress = filedID => async event => {
    await this.setState({
      progress: Math.floor((event.loaded * 100) / event.total)
    });

    //console.log(`filedID: ${filedID} - ${this.state.progress}`);
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
      uploadFiles: [...files]
      //visible: true
    });

    // Auto hide message in 5seconds
    //this.messageVisibility();

    try {
      this.setState({ uploading: true });

      const formData = new FormData();

      // iterate all attach files and validate if a valid file
      const validFiles = _.filter(this.state.uploadFiles, file => {
        if (this.validateFile(file) === "") {
          formData.append("files", file);

          return file;
        }
      });
      //console.log(validFiles);

      let files = [];
      for (let i = 0; i < validFiles.length; i++) {
        let config = {
          onUploadProgress: this.fileUploadProgress(i)
        };

        this.setState({ totalQueue: validFiles.length, currentFile: i + 1 });

        // API Call using axios
        const { data } = await axios.post(
          "/multiple-dropzone",
          formData,
          config
        );

        files = data.files;
      }

      await this.setState({
        uploadedFiles: [...this.state.uploadedFiles, ...files],
        message:
          files.length > 0 &&
          `${files.length} files has been successfully uploaded`,
        //visible: true,
        uploading: false,
        error: false
      });

      /*setTimeout(
        () =>
          this.setState({
            files: [],
            uploadFiles: [],
            visible: false
          }),
        8000
      );*/
    } catch (err) {
      this.setState({
        //visible: true,
        error: true,
        message: err.response.data.error
      });

      //this.messageVisibility();
    }
  };

  render() {
    const {
      files,
      uploading,
      uploadedFiles,
      progress,
      //visible,
      message,
      error,
      totalQueue,
      currentFile
    } = this.state;

    return (
      <form encType="multipart/form-data">
        {message && <Message message={message} error={error} />}

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

          {uploading && (
            <Progress
              progress={progress}
              totalQueue={totalQueue}
              currentFile={currentFile}
            />
          )}
        </div>

        {files.length > 0 &&
          files.map(
            (file, index) =>
              file.invalidMessage && (
                <Message
                  key={index}
                  message={file.invalidMessage}
                  error={true}
                />
              )
          )}

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
