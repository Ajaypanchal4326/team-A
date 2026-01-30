
const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/LENOVO/Downloads/team-A-request (2)/team-A-request/webapp/src/components/Dashboard.jsx';

try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n');
    let outputLines = [];
    let inHeadBlock = false;
    let inRemoteBlock = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.trim().startsWith('<<<<<<< HEAD')) {
            inHeadBlock = true;
            inRemoteBlock = false;
            continue;
        } else if (line.trim().startsWith('=======')) {
            inHeadBlock = false;
            inRemoteBlock = true;
            continue;
        } else if (line.trim().startsWith('>>>>>>>')) {
            inHeadBlock = false;
            inRemoteBlock = false;
            continue;
        }

        if (inHeadBlock) {
            continue; // Skip HEAD content
        } else if (inRemoteBlock) {
            outputLines.push(line); // Keep remote content
        } else {
            outputLines.push(line); // Keep common content
        }
    }

    fs.writeFileSync(filePath, outputLines.join('\n'), 'utf8');
    console.log(`Resolved ${filePath}`);
} catch (err) {
    console.error("Error resolving file:", err);
}
