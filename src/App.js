import React, { Component, Fragment } from "react";

import "./style.css";

import SimpleUpload from "./SimpleUpload";
import MultipleUpload from "./MultipleUpload";
import SingleDropzone from "./SingleDropzone";
import MultipleDropzone from "./MultipleDropzone";

class App extends Component {
  render() {
    return (
      <Fragment>
        <div className="container">
          <div className="row">
            <h1 className="center-align">File Upload</h1>
            <h5 className="center-align">React, Express, Multer, and Sharp.</h5>

            <div className="col s6">
              <SimpleUpload />
            </div>

            <div className="col s6">
              <MultipleUpload />
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col s12">
              <SingleDropzone />
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col s12">
              <MultipleDropzone />
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default App;
