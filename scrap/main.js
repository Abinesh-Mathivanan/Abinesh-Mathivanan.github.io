document.addEventListener("DOMContentLoaded", () => {
    // Blog data
    const blogs = [
        { id: 'sample-blog', title: 'My First Blog Post', file: '/blogs/sample-blog.md' },
        { id: 'example-blog', title: 'Another Example Blog', file: '/blogs/example-blog.md' },
        { id: 'example-blog', title: 'Another Example Blog', file: '/blogs/example-blog.md' }
        
    ];

    // Function to show a specific section
    function showSection(sectionId) {
        document.querySelectorAll('#content > div').forEach(div => {
            if (div) div.style.display = 'none';
        });

        const section = document.getElementById(sectionId);
        if (section) section.style.display = 'block';

        const decodeTextDiv = document.getElementById('decode-text');
        if (sectionId === 'home-section' && decodeTextDiv) {
            decodeTextDiv.style.display = 'block';
            decodeText(); // Only call decodeText for the home section
        } else if (decodeTextDiv) {
            decodeTextDiv.style.display = 'none';
        }
    }

    // Function to display the blog list
    const showBlogList = () => {
        document.querySelectorAll('#content > div').forEach(div => {
            if (div) div.style.display = 'none';
        });

        const blogList = document.getElementById('blog-list');
        const decodeTextDiv = document.getElementById('decode-text');
        if (blogList) blogList.style.display = 'block';
        if (decodeTextDiv) decodeTextDiv.style.display = 'none';

        const blogListUl = document.getElementById('blog-list-ul');
        if (blogListUl) {
            blogListUl.innerHTML = '';
            blogs.forEach(blog => {
                const li = document.createElement('li');
                li.textContent = blog.title;
                li.onclick = () => displayBlog(blog.file);
                blogListUl.appendChild(li);
            });
        }
    };

    // Function to display a specific blog
    const displayBlog = (filePath) => {
        const blogList = document.getElementById('blog-list');
        const singleBlog = document.getElementById('single-blog');
        const decodeTextDiv = document.getElementById('decode-text');
        
        if (blogList) blogList.style.display = 'none';
        if (singleBlog) singleBlog.style.display = 'block';
        if (decodeTextDiv) decodeTextDiv.style.display = 'none';

        fetch(filePath)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load: ${response.statusText}`);
                return response.text();
            })
            .then(data => {
                const blogContainer = document.createElement('div');
                blogContainer.innerHTML = marked.parse(data);

                renderMathInElement(blogContainer, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false }
                    ],
                    throwOnError: false
                });

                blogContainer.querySelectorAll('pre code').forEach(block => {
                    hljs.highlightElement(block);
                });

                const singleBlogOutput = document.getElementById('single-blog-output');
                if (singleBlogOutput) {
                    singleBlogOutput.innerHTML = blogContainer.innerHTML;
                }
            })
            .catch(error => {
                console.error('Error loading blog:', error);
                alert('Error loading blog: ' + error.message);
            });
    };

    // Function to publish a blog
    const publishBlog = () => {
        const markdownInput = document.getElementById('markdown-input');
        const blogOutput = document.getElementById('blog-output');
        if (markdownInput && blogOutput) {
            const htmlContent = marked.parse(markdownInput.value);
            blogOutput.innerHTML = htmlContent;

            renderMathInElement(blogOutput, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false
            });

            blogOutput.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
        }
    };

    // Show the home section by default on page load
    showSection('home-section');
});
