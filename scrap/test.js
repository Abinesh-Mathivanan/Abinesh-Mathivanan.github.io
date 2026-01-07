// List of blogs with their title, file path, and thumbnail image
const blogs = [
    { id: 'beens-blog', title: 'Intro Blog', file: '/blogs/mathjax.html', image: 'images/pix-cat.png', excerpt: 'Nothing...' },
    { id: 'typical-cs', title: 'Typical CS Student', file: '/blogs/typical-cs.html', image: 'images/pixel-ques.png', excerpt: 'just read it' },
    { id: 'KIMI', title: 'KIMI', file: '/blogs/kimi.html', image: 'images/pixel-ques.png', excerpt: 'just read it' }
];

// Toggle dark/light theme
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

// Initialize theme based on localStorage
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
});

// Show the blog list and populate with blog items
const showBlogList = () => {
    document.querySelectorAll('#content > div').forEach(div => div.style.display = 'none');
    document.getElementById('blog-list').style.display = 'block';
    document.getElementById('decode-text').style.display = 'none';
    
    const blogListUl = document.getElementById('blog-list-ul');
    blogListUl.innerHTML = ''; // Clear previous list if any

    blogs.forEach(blog => {
        const li = document.createElement('li');
        li.classList.add('blog-item');
        li.innerHTML = ` 
            <img src="${blog.image}" alt="${blog.title} Thumbnail" class="blog-thumbnail" />
            <div class="blog-content">
                <h3 class="blog-title">${blog.title}</h3>
                <p class="blog-excerpt">${blog.excerpt}</p>
            </div>
        `;
        li.onclick = () => displayBlog(blog.file); // Fetch the blog content on click
        blogListUl.appendChild(li);
    });
};

// Display the selected blog
function displayBlog(filePath) {
    showSection('single-blog'); // Show the single blog section
    fetch(filePath)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load: ${response.statusText}`);
            return response.text();
        })
        .then(data => {
            renderBlogContent(data); // Render the blog content
        })
        .catch(error => {
            console.error('Error loading blog:', error);
            alert('Error loading blog: ' + error.message);
        });
}

// Render the blog content with KaTeX and syntax highlighting
function renderBlogContent(data) {
    const blogContainer = document.createElement('div');
    blogContainer.innerHTML = data;

    // Render KaTeX math after the blog content is loaded
    renderKaTeX(blogContainer);

    // Apply syntax highlighting (if needed)
    applySyntaxHighlighting(blogContainer);

    document.getElementById('single-blog-output').innerHTML = '';
    document.getElementById('single-blog-output').appendChild(blogContainer);
}

// Function to render KaTeX in the blog content
function renderKaTeX(container) {
    const mathElements = container.querySelectorAll('.katex');
    mathElements.forEach(element => {
        const mathContent = element.textContent || element.innerText;
        try {
            katex.render(mathContent, element, {
                throwOnError: false
            });
        } catch (e) {
            console.error('KaTeX rendering error:', e);
        }
    });
}

// Function to apply syntax highlighting using highlight.js
function applySyntaxHighlighting(container) {
    const codeBlocks = container.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        hljs.highlightElement(block);
    });
}

// Show the appropriate section and handle decoding text loop
function showSection(sectionId) {
    const sections = document.querySelectorAll("#content > div");
    sections.forEach(section => section.style.display = "none");
    document.getElementById(sectionId).style.display = "block";

    const decodeTextDiv = document.getElementById("decode-text");
    if (sectionId === "home-section") {
        decodeTextDiv.style.display = "block";
        decodeText();
        startDecodeTextLoop();
    } else {
        decodeTextDiv.style.display = "none";
        stopDecodeTextLoop();
    }

    if (sectionId === "about-section") {
        loadExperiences();
        loadProjects();
    }
}

// Start and stop the decode text loop
let decodeTextLoop = null;
function decodeText() {
    const textElement = document.getElementById('decode-text');
    const lines = Array.from(textElement.querySelectorAll('.line'));
    textElement.innerHTML = '';
    lines.forEach(line => {
        const lineWrapper = document.createElement('div');
        lineWrapper.className = line.className;
        [...line.textContent.trim()].forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            span.dataset.original = char;
            span.className = 'text-animation';
            lineWrapper.appendChild(span);
        });
        textElement.appendChild(lineWrapper);
    });
    const elements = textElement.querySelectorAll('.text-animation');
    randomizeAndSettleText(elements, 2000);
}

function randomizeAndSettleText(elements, duration) {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    const startTime = Date.now();
    const interval = setInterval(() => {
        const progress = (Date.now() - startTime) / duration;
        elements.forEach(el => {
            el.textContent = Math.random() < progress ? el.dataset.original : charset[Math.floor(Math.random() * charset.length)];
        });
        if (progress >= 1) clearInterval(interval);
    }, 100);
}

function startDecodeTextLoop() {
    stopDecodeTextLoop();
    decodeTextLoop = setInterval(() => { decodeText(); }, 6000);
}

function stopDecodeTextLoop() {
    if (decodeTextLoop) {
        clearInterval(decodeTextLoop);
        decodeTextLoop = null;
    }
}

// Event listener to initialize the page
document.addEventListener("DOMContentLoaded", function () {
    showBlogList(); // Show the list of blogs when the page loads
    decodeText();
    startDecodeTextLoop();
});
