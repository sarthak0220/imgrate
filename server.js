const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const PORT = 3000;

// Serve static files
app.use("/static", express.static(path.join(__dirname, "static")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates/index.html"));
});

// Multer memory storage to avoid saving original file
const upload = multer({ storage: multer.memoryStorage() });

// POST /optimize route (send to FastAPI directly)
app.post("/optimize", upload.single("image"), async (req, res) => {
  const maxSize = req.query.max_size_kb || 300;

  try {
    const formData = new FormData();
    formData.append("image", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const fastapiRes = await axios.post(
      `http://localhost:8000/optimize?max_size_kb=${maxSize}`,
      formData,
      {
        headers: formData.getHeaders(),
        responseType: "arraybuffer",
      }
    );

    const ext = path.extname(req.file.originalname);
    const base = path.basename(req.file.originalname, ext);
    const outputPath = `uploads/${base}_${Date.now()}_compressed${ext}`;

    const buffer = fastapiRes.data; // Already binary
    const sizeKB = (buffer.length / 1024).toFixed(2);
    fs.writeFileSync(outputPath, buffer);

    res.json({
      url: `http://localhost:${PORT}/${outputPath.replace("\\", "/")}`,
      sizeKB,
    });

  } catch (err) {
    console.error("FastAPI error:", err.message);
    res.status(500).json({ error: "Compression failed" });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
