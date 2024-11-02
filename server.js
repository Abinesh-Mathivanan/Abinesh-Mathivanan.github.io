const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

const publicPath = path.join(__dirname);

app.use(express.static(publicPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
