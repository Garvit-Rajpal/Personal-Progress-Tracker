const https = require('https');
const fs = require('fs');

https.get('https://takeuforward.org/dsa/strivers-sde-sheet-top-coding-interview-problems', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      // Find the __NEXT_DATA__ block or similar JSON state
      const match = data.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
      if (match) {
        fs.writeFileSync('/tmp/sde_sheet.json', match[1]);
        console.log('Successfully saved __NEXT_DATA__ to /tmp/sde_sheet.json');
      } else {
        console.log('Could not find __NEXT_DATA__. Saving full HTML to /tmp/sde.html');
        fs.writeFileSync('/tmp/sde.html', data);
      }
    } catch (e) {
      console.error(e);
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
