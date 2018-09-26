const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const makeDir = require("make-dir");

const app = express();

// Static Express Middleware
app.use("/public", express.static(path.join(__dirname, "public")));

// File max size
const MAX_SIZE = 200000;

// Filter File Types
const fileFilter = (req, file, next) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

  //console.log(file);

  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error("Wrong file type!");
    error.code = "LIMIT_FILE_TYPES";

    return next(error, false);
  }

  next(null, true);
};

// Multer Middleware
const upload = multer({
  //dest: "./tmp/uploads/",
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: MAX_SIZE
  }
});

// Single upload
const singleUpload = inputFile => upload.single(inputFile);

// Mutiple upload
const multipleUpload = inputFile => upload.array(inputFile);

// Validate File Middleware
const validateFile = (error, req, res, next) => {
  if (error.code === "LIMIT_FILE_TYPES") {
    res.status(422).json({ error: "Only images are allowed!" });
    return;
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    res
      .status(422)
      .json({ error: `Too large. Max size is ${MAX_SIZE / 1000}KB` });

    return;
  }

  next();
};

/**
 *  Functions
 */
// Single File Upload Function
const singleFileUpload = async (req, res) => {
  try {
    //console.log(req.file);

    await makeDir("public/images");

    const file = `${Date.now()}-${req.file.originalname}`;

    // Process image with sharp js
    await sharp(req.file.buffer)
      .resize(300)
      .background("white")
      .embed()
      .toFile(`./public/images/${file}`);

    // remove the original file from /tmp/uploads once uploaded
    /*fs.unlink(`./tmp/uploads/${req.file.filename}`, err => {
      if (err) {
        console.log("Failed to delete the file: ", err);
      } else {
        console.log("File Removed!");
      }
    });*/

    return res.json({ file: `/public/images/${file}` });
  } catch (err) {
    return res.status(422).json({ err });
  }
};

// Multiple File Upload Funcstion
const multipleFileUpload = async (req, res) => {
  try {
    console.log(req.files);

    let files = [];

    await makeDir("public/images");

    await req.files.map((file, index) => {
      const imageFile = `./public/images/${Date.now()}-${file.originalname}`;

      sharp(file.buffer)
        .resize(300)
        .background("white")
        .embed()
        .toFile(imageFile);

      return (files[index] = imageFile);
    });

    //console.log(files);

    return res.json({ files });
  } catch (err) {
    return res.status(422).json({ err });
  }
};

/**
 * Routes
 */
// route: single file upload
app.post(
  "/simple-upload",
  singleUpload("file"),
  validateFile,
  singleFileUpload
);

// route: multiple file upload
app.post(
  "/multiple-upload",
  multipleUpload("files"),
  validateFile,
  multipleFileUpload
);

// route: dropzone single file upload
app.post("/dropzone", singleUpload("file"), validateFile, singleFileUpload);

// route: dropzone multiple file upload
app.post(
  "/multiple-dropzone",
  singleUpload("files"),
  validateFile,
  multipleFileUpload
);

const PORT = 3001;

// run server
app.listen(PORT, () => console.log(`Server Running on PORT: ${PORT}`));
