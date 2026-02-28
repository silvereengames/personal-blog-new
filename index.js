import PocketBase from 'pocketbase';
const express = require('express')
const app = express()
import dotenv from "dotenv";
const sanitizeHtml = require("sanitize-html");
dotenv.config();
const rateLimit = require('express-rate-limit');
const { parsePostContent } = require('./utils/shortcodes');

const port = process.env.PORT || 3000;

const pb = new PocketBase(process.env.PB_URL);
await pb.collection('users').authWithPassword(process.env.PB_USER, process.env.PB_PASS);

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static('public'))

const likeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
  max: 3, // Limit each IP to 3 requests per windowMs
  message: { error: "You're doing that too much. Please try again in an hour." },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

function createExcerpt(html, length = 120) {
  const clean = sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {}
  })
    .replace(/\s+/g, " ")
    .trim();

  if (clean.length <= length) return clean;
  return clean.substring(0, length) + "...";
}

app.get("/", async (req, res) => {
  try {
    const posts = await pb.collection("posts").getFullList({
      filter: 'status = "published"',
      sort: "-featured,-created",
    });

    const formattedPosts = posts.map(post => ({
      ...post,
      excerpt: createExcerpt(post.content, 120)
    }));

    res.render("index", { posts: formattedPosts });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading posts");
  }
});

app.get("/post/:url", async (req, res) => {
  try {
    const post = await pb.collection("posts").getFirstListItem(
      `url = "${req.params.url}" && (status = "published" || status = "unlisted")`
    );

    post.content = parsePostContent(post.content);

    post.excerpt = createExcerpt(post.content, 120);

    const record = await pb.collection('posts').update(post.id, {
      views: post.views + 1,
    });

    res.render("post", { post });
  } catch (err) {
    //res.status(404).send("Post not found");
    res.redirect("/");
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const authData = await pb.collection('users')
      .authWithPassword(email, password);

    res.json({
      token: authData.token,
      user: authData.record
    });

  } catch (err) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// --- Like a post (with rate limiting) ---
app.post("/api/posts/:url/like", likeLimiter, async (req, res) => {
  try {
    const post = await pb.collection("posts").getFirstListItem(
      `url = "${req.params.url}"`
    );

    const currentLikes = post.likes || 0;

    await pb.collection('posts').update(post.id, {
      likes: currentLikes + 1,
    });

    res.json({ success: true, likes: currentLikes + 1 });
  } catch (err) {
    console.error("Error liking post:", err);
    res.status(500).json({ error: "Could not like post" });
  }
});

// --- Unlike a post (with rate limiting) ---
app.post("/api/posts/:url/unlike", likeLimiter, async (req, res) => {
  try {
    const post = await pb.collection("posts").getFirstListItem(
      `url = "${req.params.url}"`
    );

    const currentLikes = post.likes || 0;
    const newLikes = Math.max(0, currentLikes - 1);

    await pb.collection('posts').update(post.id, {
      likes: newLikes,
    });

    res.json({ success: true, likes: newLikes });
  } catch (err) {
    console.error("Error unliking post:", err);
    res.status(500).json({ error: "Could not unlike post" });
  }
});

// --- Dynamic Sitemap Route ---
app.get("/sitemap.xml", async (req, res) => {
  try {
    // 1. Fetch all published posts
    const posts = await pb.collection("posts").getFullList({
      filter: 'status = "published"',
      sort: "-updated", // Sort by when they were last modified
    });

    const baseUrl = "https://silvereen.dev";

    // 2. Build the XML string
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`;

    // 3. Loop through posts and add them to the XML
    posts.forEach((post) => {
      xml += `
  <url>
    <loc>${baseUrl}/post/${post.url}</loc>
    <lastmod>${new Date(post.updated).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += `\n</urlset>`;

    // 4. Set the correct header and send the response
    res.header("Content-Type", "application/xml");
    res.send(xml);

  } catch (err) {
    console.error("Error generating sitemap:", err);
    res.status(500).send("Error generating sitemap");
  }
});

// --- Background Post Scheduler ---
// Runs automatically every 60,000 milliseconds (1 minute)
setInterval(async () => {
  try {
    // Get current UTC time in PocketBase's preferred format: "YYYY-MM-DD HH:mm:ss.SSSZ"
    const now = new Date().toISOString().replace('T', ' ');

    // 1. Fetch posts where status is "scheduled" AND the schedule time is right now or in the past
    const readyPosts = await pb.collection("posts").getFullList({
      filter: `status = "scheduled" && schedule <= "${now}"`,
    });

    if (readyPosts.length > 0) {
      console.log(`⏰ Found ${readyPosts.length} scheduled post(s) ready to publish.`);
    }

    // 2. Loop through and update their status
    for (const post of readyPosts) {
      await pb.collection("posts").update(post.id, {
        status: "published",
        // Optional: Update the 'created' date to 'now' so it jumps to the top of your feed
        // created: now 
      });

      console.log(`✅ Automatically published: ${post.title}`);
    }

  } catch (err) {
    // Keeps your server from crashing if PocketBase blips
    console.error("Error running background schedule checker:", err.message);
  }
}, 60 * 1000);

app.use((req, res) => {
    res.redirect("/");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// const result = await pb.collection('posts').getList(1, 50, {
//   filter: 'status = "published"',
//   sort: '-created',
// });

// console.log(result.items);