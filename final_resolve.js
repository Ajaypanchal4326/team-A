
const fs = require('fs');
const filePath = 'c:/Users/LENOVO/Downloads/team-A-request (2)/team-A-request/webapp/src/components/Dashboard.jsx';

try {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log("Original length:", content.length);
    console.log("Original line count:", content.split('\n').length);

    if (content.includes('<<<<<<<')) {
        console.log("FOUND MARKERS!");
        // We'll keep the remote changes (usually the block after =======)
        // because that matches the user's robust fixes I wrote.
        const resolved = content.replace(/<<<<<<< HEAD[\s\S]*?=======([\s\S]*?)>>>>>>> [a-z0-9]+/g, '$1');
        fs.writeFileSync(filePath, resolved, 'utf8');
        console.log("Resolved and saved.");
    } else {
        console.log("Markers not found on disk.");
        // Try to trigger an update by adding/removing a space
        fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
        console.log("Triggered disk update.");
    }
} catch (err) {
    console.error(err);
}
