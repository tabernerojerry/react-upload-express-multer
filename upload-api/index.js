const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const makeDir = require("make-dir");

const app = express();

// Static Express Middleware
app.use("/public", express.static(path.join(__dirname, "public")));

// File max size 5MB
const MAX_SIZE = 5000000;

// Filter File Types
const fileFilter = (req, file, next) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

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

// Remove white space to image file name
const splitFileName = file => file.split(" ").join("-");

/**
 *  Functions
 */
// Single File Upload Function
const singleFileUpload = async (req, res) => {
  try {
    // Create public/images folder if not exist
    await makeDir("public/images");

    const file = `${Date.now()}-${splitFileName(req.file.originalname)}`;

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
    // Create public/images folder if not exist
    await makeDir("public/images");

    let files = [];
    for (let [index, file] of req.files.entries()) {
      const imageFile = `./public/images/${Date.now()}-${splitFileName(
        file.originalname
      )}`;

      await sharp(file.buffer)
        .resize(300)
        .background("white")
        .embed()
        .toFile(imageFile);

      files[index] = imageFile;
    }
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
app.post(
  "/single-dropzone",
  singleUpload("file"),
  validateFile,
  singleFileUpload
);

// route: dropzone multiple file upload
app.post(
  "/multiple-dropzone",
  multipleUpload("files"),
  validateFile,
  multipleFileUpload
);

const PORT = 3001;

// run server
app.listen(PORT, () => console.log(`Server Running on PORT: ${PORT}`));
