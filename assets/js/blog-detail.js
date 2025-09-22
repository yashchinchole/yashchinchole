(() => {
  const titleEl = document.getElementById("blog-title");
  const metaEl = document.getElementById("blog-meta");
  const contentEl = document.getElementById("blog-content");
  const upvoteBtn = document.getElementById("upvoteBtn");
  const upvoteCountEl = document.getElementById("upvoteCount");

  let database, blogsRef;
  let blogId = new URLSearchParams(window.location.search).get("id");
  let upvotedBlogs = JSON.parse(localStorage.getItem("upvotedBlogs") || "[]");
  let blogData;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    if (!blogId) {
      titleEl.textContent = "Blog not found";
      return;
    }

    try {
      firebase.initializeApp(window.firebaseConfig);
    } catch (e) {
      if (!/already exists/.test(e.message)) console.error(e);
    }

    database = firebase.database();
    blogsRef = database.ref("blogs");

    loadBlog();
  }

  function loadBlog() {
    blogsRef.child(blogId).once("value", (snapshot) => {
      blogData = snapshot.val();
      if (!blogData) {
        titleEl.textContent = "Blog not found";
        return;
      }
      renderBlog(blogData);
    });
  }

  function renderBlog(blog) {
    titleEl.textContent = blog.title;

    metaEl.textContent = formatDate(blog.createdAt);

    if (blog.type === "markdown") {
      contentEl.innerHTML = marked.parse(blog.content || "");
    } else {
      contentEl.textContent = blog.content || "";
    }

    upvoteCountEl.textContent = blog.upvotes || 0;
    if (upvotedBlogs.includes(blog.id)) {
      upvoteBtn.classList.add("upvoted");
    }

    upvoteBtn.addEventListener("click", () => handleUpvote(blog.id));
  }

  async function handleUpvote(id) {
    if (upvotedBlogs.includes(id)) {
      showToast("You already upvoted this blog", "warning");
      return;
    }

    upvoteBtn.classList.add("upvoted");
    let currentCount = parseInt(upvoteCountEl.textContent, 10) || 0;
    upvoteCountEl.textContent = currentCount + 1;

    try {
      const newCount = (blogData.upvotes || 0) + 1;
      await database.ref(`blogs/${id}/upvotes`).set(newCount);
      blogData.upvotes = newCount;
      upvotedBlogs.push(id);
      localStorage.setItem("upvotedBlogs", JSON.stringify(upvotedBlogs));
      showToast("Thanks for the like!", "success");
    } catch (err) {
      console.error("Upvote error:", err);
      showToast("Failed to upvote", "error");
    }
  }

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
    }">${msg}</div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
})();
