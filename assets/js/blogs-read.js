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
        blogsContainer.innerHTML = `
          <div class="alert alert-danger">
            Failed to load blogs.
          </div>
        `;
      }
    );
  }

  function getSafePreview(blog, maxLen = 220) {
    if (!blog) return "";
    if (blog.preview) {
      return marked.parse(blog.preview);
    }
    if (blog.type === "markdown" && blog.content) {
      const fullHtml = marked.parse(blog.content);
      const text = fullHtml
        .replace(/<[^>]+>/g, " ")
        .replace(/\\s+/g, " ")
        .trim();
      const excerpt =
        text.length > maxLen ? text.slice(0, maxLen).trim() + "..." : text;
      return escapeHtml(excerpt);
    }
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

    let topBlog = null;
    if (blogArray.length > 0) {
      topBlog = blogArray.reduce((prev, curr) => {
        return (curr.upvotes || 0) > (prev.upvotes || 0) ? curr : prev;
      });
    }

    let restBlogs = blogArray.filter((b) => b.id !== topBlog.id);
    restBlogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    blogArray = [topBlog, ...restBlogs];

    blogsContainer.innerHTML = blogArray.map(blogCardHtml).join("");

    document.querySelectorAll(".upvote-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        handleUpvote(btn.dataset.blogId, btn);
      });
    });
  }

  function blogCardHtml(blog) {
    const isUpvoted = upvotedBlogs.includes(blog.id);
    const upClass = isUpvoted ? "upvoted" : "";
    const date = formatDate(blog.createdAt);
    const previewHtml = getSafePreview(blog);

    return `
      <div class="projects-item blog-card" id="blog-card-${blog.id}">
        <!-- CARD TITLE (shown only in preview mode) -->
        <h3 class="blog-title card-title" id="card-title-${
          blog.id
        }">${escapeHtml(blog.title)}</h3>
        
        <!-- PREVIEW CONTENT -->
        <div class="markdown-body blog-preview" id="preview-${blog.id}">
          ${previewHtml}
        </div>
        
        <!-- CARD FOOTER (shown only in preview mode) -->
        <div class="blog-card-footer" id="card-footer-${blog.id}">
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
            <button class="btn read-more-btn" onclick="toggleBlogContent('${
              blog.id
            }')">
              Read More
            </button>
          </div>
        </div>

        <div class="upvote-message" id="upvote-message-${
          blog.id
        }" style="display: none; color: var(--foreground); margin-top: 8px; font-size: 0.8rem;"></div>
        
        <!-- BLOG DETAIL STRUCTURE (shown only in expanded mode) -->
        <div class="blog-full-content" id="full-content-${
          blog.id
        }" style="display: none; margin-top: 0;">
          <div id="blog-detail">
            <h1 id="blog-title">${escapeHtml(blog.title)}</h1>
            <div id="blog-meta">${date}</div>
            <div id="blog-content">
              ${
                blog.type === "markdown"
                  ? marked.parse(blog.content || "")
                  : escapeHtml(blog.content || "")
              }
            </div>
            <div style="margin-top: 20px; text-align: center;">
              <button class="btn show-less-btn" onclick="toggleBlogContent('${
                blog.id
              }', false)">
                Show Less
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Toggle blog content expand/collapse
  window.toggleBlogContent = function (blogId, expand = null) {
    const blogCard = document.getElementById(`blog-card-${blogId}`);
    const cardTitle = document.getElementById(`card-title-${blogId}`);
    const preview = document.getElementById(`preview-${blogId}`);
    const fullContent = document.getElementById(`full-content-${blogId}`);
    const cardFooter = document.getElementById(`card-footer-${blogId}`);

    if (!blogCard || !preview || !fullContent || !cardFooter || !cardTitle)
      return;

    const isCurrentlyExpanded = fullContent.style.display !== "none";
    const shouldExpand = expand !== null ? expand : !isCurrentlyExpanded;

    if (shouldExpand) {
      // Expand - hide preview elements, show full content
      cardTitle.style.display = "none"; // Hide the card title
      preview.style.display = "none";
      cardFooter.style.display = "none";
      fullContent.style.display = "block";

      // Apply blog detail page styling to the card when expanded
      blogCard.style.background = "var(--input-background)";
      blogCard.style.padding = "24px";
      blogCard.style.borderRadius = "12px";
      blogCard.style.color = "var(--input-foreground)";
      blogCard.style.lineHeight = "1.65";
    } else {
      // Collapse - show preview elements, hide full content
      cardTitle.style.display = "block"; // Show the card title back
      preview.style.display = "block";
      cardFooter.style.display = "flex";
      fullContent.style.display = "none";

      // Reset card styling to original
      blogCard.style.background = "";
      blogCard.style.padding = "";
      blogCard.style.borderRadius = "";
      blogCard.style.color = "";
      blogCard.style.lineHeight = "";

      // Scroll to top of the blog card
      blogCard.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  function handleUpvote(blogId, buttonElement) {
    const isAlreadyUpvoted = upvotedBlogs.includes(blogId);
    const upvoteCountElement = buttonElement.querySelector(".upvote-count");
    const messageElement = document.getElementById(`upvote-message-${blogId}`);

    if (isAlreadyUpvoted) {
      // Show "Already upvoted" message
      messageElement.textContent = "You already upvoted this blog";
      messageElement.style.display = "block";
      messageElement.style.color = "var(--color-warning, #f39c12)";
      setTimeout(() => {
        messageElement.style.display = "none";
      }, 2000);
      return;
    }

    // INSTANT UI UPDATE
    buttonElement.classList.add("upvoted");
    const currentCount = parseInt(upvoteCountElement.textContent, 10) || 0;
    upvoteCountElement.textContent = currentCount + 1;

    // Show "Thanks for upvote" message
    messageElement.textContent = "Thanks for the like!";
    messageElement.style.display = "block";
    messageElement.style.color = "var(--color-success, #27ae60)";

    // Update database
    (async () => {
      try {
        const blog = blogs[blogId];
        const newCount = (blog.upvotes || 0) + 1;
        await database.ref(`blogs/${blogId}/upvotes`).set(newCount);

        // Update local data
        blogs[blogId].upvotes = newCount;
        upvotedBlogs.push(blogId);
        localStorage.setItem("upvotedBlogs", JSON.stringify(upvotedBlogs));

        setTimeout(() => {
          messageElement.style.display = "none";
        }, 2000);
      } catch (err) {
        console.error("Upvote error:", err);
        // Revert UI changes on error
        buttonElement.classList.remove("upvoted");
        upvoteCountElement.textContent = currentCount;
        messageElement.textContent = "Failed to upvote";
        messageElement.style.color = "var(--color-error, #e74c3c)";
        setTimeout(() => {
          messageElement.style.display = "none";
        }, 2000);
      }
    })();
  }

  function formatDate(dateStr) {
    if (!dateStr) return "Unknown date";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Invalid date";

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (err) {
      console.error("Date formatting error:", err);
      return "Unknown date";
    }
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
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
