import PocketBase from 'pocketbase';
const express = require('express')
const app = express()
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 3000;

const pb = new PocketBase(process.env.PB_URL);
await pb.collection('users').authWithPassword(process.env.PB_USER, process.env.PB_PASS);

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static('public'))

app.get("/", async (req, res) => {
  try {
    const posts = await pb.collection("posts").getFullList({
      filter: 'status = "published"',
      sort: "-created",
    });

    res.render("index", { posts });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading posts");
  }
});

app.get("/post/:url", async (req, res) => {
  try {
    const post = await pb.collection("posts").getFirstListItem(
      `url = "${req.params.url}" && status = "published"`
    );

    const record = await pb.collection('posts').update(post.id, {
      views: post.views + 1,
    });

    res.render("post", { post });
  } catch (err) {
    res.status(404).send("Post not found");
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