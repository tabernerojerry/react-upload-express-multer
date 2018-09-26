import React, { Component, Fragment } from "react";
import axios from "axios";

export class SimpleUpload extends Component {
  state = {
    file: "",
    message: "",
    error: false,
    uploadedFiles: []
  };

  // Validate File Method
  validateFile = () => {
    const { file } = this.state;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    const MAX_SIZE = 200000;

    // check if images size too large return true
    const tooLarge = file.size > MAX_SIZE;

    // check if file attach is image return true
    const isImage = allowedTypes.includes(file.type);

    //console.log("tooLarge:", tooLarge);
    //console.log("isImage:", isImage);

    isImage && !tooLarge
      ? this.setState({ error: false, message: "" })
      : this.setState({
          error: true,
          message:
            tooLarge && isImage
              ? `Too large. Max size is ${MAX_SIZE / 1000}KB`
              : "Only images are allowed!"
        });
  };

  // Input Change Method
  _onChange = async ({ target: { name, files } }) => {
    await this.setState({ [name]: files[0] });
    //console.log(this.state.file);

    this.validateFile();
  };

  // Submit Form Method
  _onSubmit = async event => {
    event.preventDefault();
    //console.log(this.state);

    try {
      const formData = new FormData();

      formData.append("file", this.state.file);

      // API Call using axios
      const {
        data: { file }
      } = await axios.post("/simple-upload", formData);

      await this.setState({
        file: "",
        uploadedFiles: [...this.state.uploadedFiles, file],
        message: "File has been uploaded",
        error: false
      });
    } catch (err) {
      this.setState({
        message: err.response.data.error,
        error: true
      });
    }
  };

  render() {
    const { file, message, error, uploadedFiles } = this.state;
    return (
      <form encType="multipart/form-data" onSubmit={this._onSubmit}>
        {message && (
          <div className={`card-panel ${error ? "red" : "green"}`}>
            <span className="white-text">{message}</span>
          </div>
        )}
        <div className="input-field col s12">
          <div className="btn waves-effect waves-light btn-large  btn-upload">
            <span className="valign-wrapper">
              Simple Upload <i className="material-icons">file_upload</i>
            </span>
            <input type="file" name="file" onChange={this._onChange} />
          </div>

          {file && <p>{file.name}</p>}
        </div>

        <div className="input-field col s12">
          <button type="submit" className="btn waves-effect waves-light orange">
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

export default SimpleUpload;
