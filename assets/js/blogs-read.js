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

    // sort: top upvotes first, then latest
    blogArray.sort((a, b) => {
      const upA = a.upvotes || 0;
      const upB = b.upvotes || 0;
      if (upB !== upA) return upB - upA;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    blogsContainer.innerHTML = blogArray.map(blogCardHtml).join("");

    // add event listeners
    document.querySelectorAll(".upvote-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        handleUpvote(btn.dataset.blogId);
      });
    });

    document.querySelectorAll(".read-more-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = btn.dataset.blogId;
        renderBlogInline(blogs[id]);
      });
    });
  }

  // --- INLINE FULL BLOG RENDER ---
  function renderBlogInline(blog) {
    blogsContainer.innerHTML = `
      <div class="markdown-body" style="padding:20px; background:var(--input-background); border-radius:12px;">
        <h2>${escapeHtml(blog.title)}</h2>
        <div style="margin-bottom:10px; color:var(--color-keywords)">
          ${escapeHtml(blog.author?.name || "Unknown")} • ${formatDate(
      blog.createdAt
    )}
        </div>
        <div>
          ${
            blog.type === "markdown"
              ? marked.parse(blog.content || "")
              : escapeHtml(blog.content || "")
          }
        </div>
        <button class="btn" onclick="location.reload()">⬅ Back to Blogs</button>
      </div>
    `;
  }

  // --- BLOG CARD (PREVIEW) ---
  function blogCardHtml(blog) {
    const isUpvoted = upvotedBlogs.includes(blog.id);
    const upClass = isUpvoted ? "upvoted" : "";
    const date = formatDate(blog.createdAt);

    const previewHtml = getSafePreview(blog);

    return `
      <div class="projects-item blog-card" style="width:100%; margin:8px 0; padding:16px; border-radius:8px; background:var(--input-background);">
        <h3 style="color:var(--color-class-name); margin-bottom:8px;">
          ${escapeHtml(blog.title)}
        </h3>
        <div class="markdown-body" style="margin-bottom:10px; color:var(--foreground);">
          ${previewHtml}
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="color:var(--color-keywords)">
            ${escapeHtml(blog.author?.name || "Unknown")} • ${date}
          </div>
          <div>
            <button class="btn upvote-btn ${upClass}" data-blog-id="${blog.id}">
              <i class="fas fa-arrow-up"></i> <span>${blog.upvotes || 0}</span>
            </button>
            <button class="btn btn-outline-primary read-more-btn" data-blog-id="${
              blog.id
            }">
              Read More
            </button>
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
        month: "short",
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
