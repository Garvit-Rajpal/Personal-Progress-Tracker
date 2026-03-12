const fs = require('fs');

const html = fs.readFileSync('/tmp/sde.html', 'utf8');

// The chunks are roughly `self.__next_f.push([1,"STRING"])`
const chunkRegex = /self\.__next_f\.push\(\[1,"(.*?)"\]\)/g;
let combinedString = "";
let match;
while ((match = chunkRegex.exec(html)) !== null) {
  // We need to unescape the JS string literal
  try {
    const unescaped = JSON.parse('"' + match[1] + '"');
    combinedString += unescaped;
  } catch(e) {}
}

const sectionsMatch = combinedString.match(/"sections":(\[\{"category_id".*?\}\])/);
if (sectionsMatch) {
  try {
    const sections = JSON.parse(sectionsMatch[1] + '}'); 
    // Wait, the match might go all the way to the end of the JSON object, so we need to be careful
    // The easiest is just regexing problem by problem
  } catch(e) {}
}

// Let's just regex out each problem object from the combined string!
// {"problem_id":"911","problem_name":"Set Matrix Zeroes",...}
const problemRegex = /\{"problem_id":"([^"]+)","problem_name":"([^"]+)",[^}]*"leetcode":"([^"]+)"[^}]*"difficulty":"([^"]+)"\}/g;

let allQuestions = [];
let pMatch;
while ((pMatch = problemRegex.exec(combinedString)) !== null) {
  // Find the category containing this problem.
  // Actually, we can just find all category_names too.
}

console.log("Combined string length:", combinedString.length);
fs.writeFileSync('/tmp/combined.json', combinedString.substring(0, 1000));

// Better approach: Let's extract all category blocks
const categoryRegex = /"category_name":"([^"]+)","problems":(\[\{.*?\}\])/g;

let finalQuestions = [];

let catMatch;
while ((catMatch = categoryRegex.exec(combinedString)) !== null) {
  const categoryName = catMatch[1];
  const problemsStr = catMatch[2];
  
  try {
    // try to parse the array
    // Since it might have trailing stuff, let's just use problem regex on `problemsStr`
    const pRegex = /"problem_name":"([^"]+)"[^{}]*"leetcode":"([^"]+)"[^{}]*"difficulty":"([^"]+)"/g;
    let pm;
    while((pm = pRegex.exec(problemsStr)) !== null) {
      finalQuestions.push({
        topic: categoryName,
        title: pm[1],
        link: pm[2] !== '$undefined' ? pm[2] : null,
        difficulty: pm[3]
      });
    }
  } catch(e) {
    console.log("Error parsing problems for", categoryName);
  }
}

console.log(`Extracted total items: ${finalQuestions.length}`);
fs.writeFileSync('/tmp/191_striver_questions.json', JSON.stringify(finalQuestions, null, 2));

