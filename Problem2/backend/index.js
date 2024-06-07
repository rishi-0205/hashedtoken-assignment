const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

let savedText = "";

app.post("/save", (req, res) => {
  const { diff, timestamps } = req.body;
  console.log("Received diff:", diff);
  console.log("Timestamps:", timestamps);

  // Apply the diff to the savedText
  const diff_match_patch = require("diff-match-patch");
  const dmp = new diff_match_patch();
  const patches = dmp.patch_make(savedText, diff);
  const [newText, results] = dmp.patch_apply(patches, savedText);

  // Check if all patches applied successfully
  if (results.every((result) => result)) {
    savedText = newText;
    console.log("Updated saved text:", savedText);
    res.sendStatus(200);
  } else {
    console.error("Failed to apply patches:", results);
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
