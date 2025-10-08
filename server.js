const express = require("express");
const axios = require("axios").default;
const path = require("path");
const app = express();
const port = 8080;

app.use(express.static(path.join(__dirname,'views')));
app.use(express.static(path.join(__dirname, 'public')));

//Index route
app.get("/",(req, res) => {
    res.render("index.ejs");
});

//Search route
app.get("/searchword", async (req, res) => {
    const word = req.query.word; // Get the word from URL query

      if (!word) {
        return res.status(400).send("Please provide a word, e.g. /searchword?word=apple");
        };

  try {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    const response = await axios.get(url); // JSON is default
    const entry = response.data[0];  // The first element of response.data contains the main entry

    // Check if the entry has meanings
    if (!entry.meanings || entry.meanings.length === 0) {
      return res.send("No definitions found.");
    };

    // Initialize a string to build a readable text output
    let resultText = 
    `Word: ${entry.word}\nPhonetic: ${entry.phonetic || "N/A"}\n\n`;

    // Loop through all meanings
    entry.meanings.forEach((meaning, i) => {
      resultText += `Meaning ${i + 1} (${meaning.partOfSpeech}):\n`;

      if (meaning.definitions && meaning.definitions.length > 0) {
        meaning.definitions.forEach((def, j) => {
          resultText += `  ${j + 1}. ${def.definition}\n`;
          if (def.example) {
            resultText += `     → Example: ${def.example}\n`;
          };
        });
      } else {
        resultText += "  No definitions available.\n";
      };
      resultText += "\n";   // Add a blank line between meanings
    });

    // Set response type to plain text
    // res.type("text/plain");
    res.render("result.ejs", { 
        word: entry.word,
        resultText: resultText.trim() 
    });
  } catch (e) {
    console.error("Error -", e.message);
    res.status(404).send("No such word found.");
  }
});


app.listen(port, () => {
    console.log("server is listening");
});