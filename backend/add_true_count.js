
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'words.json');

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  try {
    const words = JSON.parse(data);

    const updatedWords = words.map(word => {
      return {
        ...word,
        true_count: 0, // Add the new field with default value 0
      };
    });

    fs.writeFile(filePath, JSON.stringify(updatedWords, null, 2), 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Error writing the file:', writeErr);
      } else {
        console.log('Successfully added "true_count" field to words.json');
      }
    });

  } catch (parseErr) {
    console.error('Error parsing JSON string:', parseErr);
  }
});
