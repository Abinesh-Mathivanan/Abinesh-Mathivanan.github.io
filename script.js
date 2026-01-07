function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
});

async function loadExperiences() {
    try {
        const response = await fetch('assets/experiences.json');
        const experiences = await response.json();
        const experienceCards = document.getElementById('experience-cards');
        experienceCards.innerHTML = '';
        experiences.forEach(exp => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                        <h3>${exp.company}</h3>
                        <p><strong>Role:</strong> ${exp.role}</p>
                        <p><strong>Duration:</strong> ${exp.duration}</p>
                        <ul>${exp.description.map(point => `<li>${point}</li>`).join('')}</ul>
                    `;
            experienceCards.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading experiences:", error);
    }
}

async function loadProjects() {
    try {
        const response = await fetch('assets/projects.json');
        const data = await response.json();
        const projects = data.projects;
        const projectCards = document.getElementById('project-cards');
        projectCards.innerHTML = '';
        projects.forEach(proj => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                        <h3>${proj.title}</h3>
                        <p><strong>Technologies:</strong> ${proj.technologies.join(', ')}</p>
                        <ul>${proj.description.map(point => `<li>${point}</li>`).join('')}</ul>
                    `;
            projectCards.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading projects:", error);
    }
}

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

const showBlogList = () => {
    document.querySelectorAll('#content > div').forEach(div => div.style.display = 'none');
    document.getElementById('blog-list').style.display = 'block';
    document.getElementById('decode-text').style.display = 'none';
    const blogListUl = document.getElementById('blog-list-ul');
    blogListUl.innerHTML = '';
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
        li.onclick = () => displayBlog(blog.file);
        blogListUl.appendChild(li);
    });
};

function displayBlog(filePath) {
    showSection('single-blog');
    fetch(filePath)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load: ${response.statusText}`);
            return response.text();
        })
        .then(data => {
            renderBlogContent(data);
        })
        .catch(error => {
            console.error('Error loading blog:', error);
            alert('Error loading blog: ' + error.message);
        });
}

function renderBlogContent(data) {
    const blogContainer = document.createElement('div');
    blogContainer.innerHTML = marked.parse(data);

    try {
        renderMathInElement(blogContainer, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false }
            ],
            throwOnError: false,
            macros: { "\\RR": "\\mathbb{R}", "\\vec": "\\mathbf", "\\RealNumbers": "\\mathbb{R}" },
            errorCallback: (msg) => { console.error("Failed to render LaTeX:", msg); return `\\text{Error rendering: ${msg}}`; }
        });
    } catch (error) {
        console.error('LaTeX rendering error:', error);
    }

    function applyHighlightTheme() {
        const existingThemeLink = document.getElementById('highlight-theme');
        if (existingThemeLink) {
            existingThemeLink.remove();
        }

        const themeLink = document.createElement('link');
        themeLink.id = 'highlight-theme';
        themeLink.rel = 'stylesheet';

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            themeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/atom-one-dark.min.css';
        } else {
            themeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css';
        }

        document.head.appendChild(themeLink);

        document.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
        });
    }

    applyHighlightTheme();

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyHighlightTheme);

    blogContainer.querySelectorAll('pre code').forEach(block => {
        const container = document.createElement('div');
        container.classList.add('code-container');

        const copyButton = document.createElement('button');
        copyButton.classList.add('copy-button');
        copyButton.textContent = 'Copy';

        copyButton.onclick = () => {
            navigator.clipboard.writeText(block.innerText)
                .then(() => {
                    copyButton.textContent = 'Copied!';
                    setTimeout(() => copyButton.textContent = 'Copy', 2000);
                })
                .catch(err => console.error('Error copying text:', err));
        };

        const codeClone = block.cloneNode(true);
        container.appendChild(copyButton);
        container.appendChild(codeClone);

        block.parentNode.replaceChild(container, block);

        hljs.highlightElement(codeClone);
    });

    document.getElementById('single-blog-output').innerHTML = '';
    document.getElementById('single-blog-output').appendChild(blogContainer);

    const observer = new MutationObserver(() => {
        try {
            renderMathInElement(blogContainer, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false,
                macros: { "\\RR": "\\mathbb{R}", "\\vec": "\\mathbf", "\\RealNumbers": "\\mathbb{R}" },
                errorCallback: (msg) => { console.error("Failed to render LaTeX:", msg); return `\\text{Error rendering: ${msg}}`; }
            });
        } catch (error) {
            console.error('LaTeX re-rendering error:', error);
        }
    });
    observer.observe(blogContainer, { childList: true, subtree: true });
}

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

document.addEventListener("DOMContentLoaded", function () {
    decodeText();
    startDecodeTextLoop();
});

const blogs = [
    { id: 'kimi', title: 'Are Males Afraid of Female Colleagues? ', file: '/blogs/females.md', image: 'images/female.png', excerpt: 'not a simple breakdown' },
    { id: 'kimi', title: 'Kimi', file: '/blogs/kimi.md', image: 'images/kimi.png', excerpt: 'simple breakdown of Kimi 1.5B Model' },
    { id: 'typical-cs', title: 'Typical CS Student', file: '/blogs/typical-cs.md', image: 'images/pixel-ques.png', excerpt: 'just read it' },
    { id: 'beens-blog', title: 'Intro Blog', file: '/blogs/beens-blog.md', image: 'images/pix-cat.png', excerpt: 'Nothing...' }
];