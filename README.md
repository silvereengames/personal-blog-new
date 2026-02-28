# Silvereen Blog
You can use this as a template for your own blog. Just please give me credit. Eventually I will update this and add proper documentation to make it easier to deploy. For now this is some basic stuff (basically for me) to remember everything.

## Main stack
- BunJS (USE BUN IT PROBABLY WONT WORK WITHOUT IT)
- Pocketbase (Database, eventually I'll include a sample DB file you can use and better instrucions)

## Status
- `published` - the post is available to read and is listed on the homepage
- `unlisted` - the post is still accessable by it's slug at /post/post-slug
- `draft` - the program ignores this, it acts as if it doesn't exist that way you can edit it
- `scheduled` - if the `scheduledRelease` is set and this is the status, the post will release at that time and change it's status to published !STILL IN DEVELOPMENT!

## Shortcodes
The blog also comes with a few shortcodes you can use to render info cards, audio players, videos, etc. I'm adding these at my own pace for whatever the blog may demand. The syntax is very similar to wordpress shortcodes or HTML. Here is an example: `[shortcodename]content[/shortcodename]`. Heres the list:
- `[info]` - info card
- `[warning]` - warning card
- `[error]` - error card
- `[terminal]` - renders a terminal for code showcase
- `[server]` - returns an in-line block for a server IP address or web domain to copy paste easily
- `[youtube]` - put a youtube ID (eg `dQw4w9WgXcQ`) in between the tags to render a youtube embed
- `[audio]` - put a link to a mp3 or wav or any other format the browser can play to render a nice audio player