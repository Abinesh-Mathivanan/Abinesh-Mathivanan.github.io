const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const blogsDir = path.join(__dirname, 'blogs');

app.use(express.static(path.join(__dirname)));

app.get('/blog', (req, res) => {
    fs.readdir(blogsDir, (err, files) => {
        if (err) {
            console.error("Error reading blogs directory:", err);
            return res.status(500).send("Error reading blogs.");
        }
        const blogTitles = files
            .filter(file => path.extname(file) === '.md')
            .map(file => path.basename(file, '.md'));

        res.sendFile(path.join(__dirname, 'scrap/blog.html'));
    });
});

app.get('*', (req, res) => {
    const filePath = path.join(__dirname, req.path);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Not Found');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});