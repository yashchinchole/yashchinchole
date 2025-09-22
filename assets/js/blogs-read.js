(() => {
  const blogsContainer = document.getElementById("blogs-container");
  const blogsEmpty = document.getElementById("blogs-empty");

  let database, blogsRef;
  let blogs = {};
  let upvotedBlogs = JSON.parse(localStorage.getItem("upvotedBlogs") || "[]");

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    try {
      firebase.initializeApp(window.firebaseConfig);
      database = firebase.database();
      blogsRef = database.ref("blogs");

      loadBlogs();
    } catch (err) {
      console.error("Firebase init error:", err);
    }
  }

  function loadBlogs() {
    blogsRef.on(
      "value",
      (snapshot) => {
        blogs = snapshot.val() || {};
        renderBlogs();
      },
      (error) => {
        console.error("Error fetching blogs:", error);
        blogsContainer.innerHTML =
          "<p style='color:red'>Failed to load blogs.</p>";
      }
    );
  }

  // --- PREVIEW SAFE EXCERPT ---
  function getSafePreview(blog, maxLen = 220) {
    if (!blog) return "";

    // If preview exists in DB, prefer it
    if (blog.preview) {
      return marked.parse(blog.preview);
    }

    // If Markdown, render full HTML -> strip tags -> truncate
    if (blog.type === "markdown" && blog.content) {
      const fullHtml = marked.parse(blog.content);
      const text = fullHtml
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const excerpt =
        text.length > maxLen ? text.slice(0, maxLen).trim() + "..." : text;
      return escapeHtml(excerpt);
    }

    // Plain text blogs
    const textContent = blog.content || "";
    const excerpt =
      textContent.length > maxLen
        ? textContent.slice(0, maxLen).trim() + "..."
        : textContent;
    return escapeHtml(excerpt);
  }

  function renderBlogs() {
    let blogArray = Object.values(blogs || {}).filter(
      (b) => b.author?.name === "Yash Chinchole"
    );

    if (!blogArray.length) {
      blogsContainer.innerHTML = "";
      blogsEmpty.style.display = "block";
      return;
    }

    blogsEmpty.style.display = "none";

    // find the blog with the most upvotes
    let topBlog = null;
    if (blogArray.length > 0) {
      topBlog = blogArray.reduce((prev, curr) => {
        return (curr.upvotes || 0) > (prev.upvotes || 0) ? curr : prev;
      });
    }

    // filter out the top blog from the rest
    let restBlogs = blogArray.filter((b) => b.id !== topBlog.id);

    // sort the rest by latest date
    restBlogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // final array: top blog first, then the rest
    blogArray = [topBlog, ...restBlogs];

    blogsContainer.innerHTML = blogArray.map(blogCardHtml).join("");

    // add event listeners
    document.querySelectorAll(".upvote-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        handleUpvote(btn.dataset.blogId);
      });
    });
  }

  // --- BLOG CARD (PREVIEW) ---
  function blogCardHtml(blog) {
    const isUpvoted = upvotedBlogs.includes(blog.id);
    const upClass = isUpvoted ? "upvoted" : "";
    const date = formatDate(blog.createdAt);

    const previewHtml = getSafePreview(blog);

    return `
    <div class="projects-item blog-card">
      <h3 class="blog-title">${escapeHtml(blog.title)}</h3>
      
      <div class="markdown-body blog-preview">
        ${previewHtml}
      </div>
      
      <div class="blog-card-footer">
        <!-- Author hidden via CSS if needed -->
        <span class="blog-meta">
          <span class="author-name">${escapeHtml(
            blog.author?.name || "Unknown"
          )}</span>
          <span class="blog-date">${date}</span>
        </span>
        
        <div class="blog-card-actions">
          <button class="btn upvote-btn ${upClass}" data-blog-id="${blog.id}">
            <i class="fas fa-arrow-up"></i>
            <span class="upvote-count">${blog.upvotes || 0}</span>
          </button>
          <a href="blog.html?id=${blog.id}" class="btn read-more-btn">
            Read More
          </a>
        </div>
      </div>
    </div>
  `;
  }

  // --- UPVOTES ---
  async function handleUpvote(blogId) {
    if (upvotedBlogs.includes(blogId)) {
      showToast("You already upvoted this blog", "warning");
      return;
    }

    try {
      const blog = blogs[blogId];
      if (!blog) return;

      const newCount = (blog.upvotes || 0) + 1;
      await database.ref(`blogs/${blogId}/upvotes`).set(newCount);

      upvotedBlogs.push(blogId);
      localStorage.setItem("upvotedBlogs", JSON.stringify(upvotedBlogs));

      showToast("Thanks for the like!", "success");
    } catch (err) {
      console.error("Upvote error:", err);
      showToast("Failed to upvote", "error");
    }
  }

  // --- HELPERS ---
  function formatDate(dateStr) {
    try {
      return new Intl.DateTimeFormat("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Kolkata",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  }

  function escapeHtml(text = "") {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function showToast(msg, type = "info") {
    const toast = document.createElement("div");
    toast.style.cssText =
      "position:fixed; top:20px; right:20px; z-index:1060; min-width:260px;";
    toast.innerHTML = `<div class="alert ${
      type === "error"
        ? "alert-danger"
        : type === "success"
        ? "alert-success"
        : type === "warning"
        ? "alert-warning"
        : "alert-info"
    }">${escapeHtml(msg)}</div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
})();
