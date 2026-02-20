import PocketBase from 'pocketbase';
const express = require('express')
const app = express()
import dotenv from "dotenv";
const sanitizeHtml = require("sanitize-html");
dotenv.config();

const port = process.env.PORT || 3000;

const pb = new PocketBase(process.env.PB_URL);
await pb.collection('users').authWithPassword(process.env.PB_USER, process.env.PB_PASS);

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static('public'))

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
      sort: "-created",
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

    const record = await pb.collection('posts').update(post.id, {
      views: post.views + 1,
    });

    res.render("post", { post });
  } catch (err) {
    res.status(404).send("Post not found");
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// const result = await pb.collection('posts').getList(1, 50, {
//   filter: 'status = "published"',
//   sort: '-created',
// });

// console.log(result.items);