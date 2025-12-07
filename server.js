const { error } = require("console");
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

    resultText = `<div class="result-block">`;


// Phonetics
if (entry.phonetics && entry.phonetics.length > 0) {
  const p = entry.phonetics.find(p => p.text || p.audio);

  if (p) {
    const audioId = `audio_${Date.now()}`;

    resultText += `
      <div class="phonetic">
        ${p.audio ? `
          <i class="fa-solid fa-volume-high"
              style="cursor:pointer; color:#0d6efd; margin-left:8px;"
              onclick="document.getElementById('${audioId}').play()">
          </i>
          <audio id="${audioId}">
            <source src="${p.audio}" type="audio/mpeg">
          </audio>
        ` 
        : ""
      }
        <span class="phonetic-text">${p.text || ""}</span>
      </div>
    `;
  }
}
      
// Meanings
entry.meanings.forEach((meaning, i) => {
  resultText += `
  <div class="meaning-block">
      <p class="meaning-title">
        <i class="fa-solid fa-arrow-right"></i> 
        <b>Meaning ${i + 1}</b> 
        <span class="pos">(${meaning.partOfSpeech})</span>
      </p>
      <ul class="definition-list">
  `;

    if (meaning.definitions && meaning.definitions.length > 0) {
      meaning.definitions.slice(0, 2).forEach((def, j) => {
        resultText += ` 
        <li class="definition-item">
          ${def.definition}
          ${
            def.example ? `<p class="example">
            <u>Example:</u> ${def.example}</p>
            ` : ""
          }
        </li>
        `;
      });
    resultText += `</ul>`;
    }

// Synonyms 
  if (meaning.synonyms && meaning.synonyms.length > 0) {
    const limited = meaning.synonyms.slice(0, 5);

    resultText += `
      <div class="synonym-section">
        <b>Synonyms:</b><br>
        ${limited
          .map(s => `<span class="synonyms-badge">${s}</span>`)
          .join(" ")}
      </div>
    `;
  }

  resultText += `</div>`;
});

resultText += `</div>`;

    res.render("result.ejs", { 
        word: entry.word,
        resultText: resultText.trim() 
    });
  } catch (e) {
    console.error("Error -", e.message);
    res.render("error.ejs", { 
        title: "Lookup Failed!",
        message: "We had trouble finding your word.",
        details: e.message
     });
  }
});


app.listen(port, () => {
    console.log("server is listening");
});