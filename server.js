const express = require('express');
const path = require('path');
const fs = require('fs');
const { marked } = require('marked');

const app = express();
const PORT = process.env.PORT || 3000;
const blogsDir = path.join(__dirname, 'blogs');

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Route to list blog posts
app.get('/blog', (req, res) => {
    fs.readdir(blogsDir, (err, files) => {
        if (err) {
            console.error("Error reading blogs directory:", err);
            return res.status(500).send("Error reading blogs.");
        }
        const blogTitles = files
            .filter(file => path.extname(file) === '.md')
            .map(file => path.basename(file, '.md'));

        // Serve the blog list page
        res.sendFile(path.join(__dirname, 'scrap/blog.html'));
    });
});

// Route to serve individual blog posts
app.get('/blog/:blogName', (req, res) => {
    const blogName = req.params.blogName;
    const blogPath = path.join(blogsDir, `${blogName}.md`);

    fs.readFile(blogPath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading blog post ${blogName}:`, err);
            return res.status(404).send("Blog post not found.");
        }
        try {
            // Render the blog post within an HTML template
            const htmlContent = marked(data);
            const blogPostHTML = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${blogName}</title>
                    <link rel="stylesheet" href="/style.css"> <!-- Include your CSS file -->
                    <script src="/script.js" defer></script> <!-- Include your script.js -->
                </head>
                <body>
                    <div id="single-blog-output">${htmlContent}</div>
                </body>
                </html>
            `;
            res.send(blogPostHTML);
        } catch (markdownErr) {
            console.error(`Error parsing Markdown for ${blogName}:`, markdownErr);
            return res.status(500).send("Error parsing Markdown.");
        }
    });
});

// Catch-all route for other static files or 404s
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