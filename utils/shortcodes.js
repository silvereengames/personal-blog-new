// --- 1. Define your custom shortcodes here ---
const shortcodeRegistry = {

    'warning': (content) => `
        <div class="callout callout-warning">
            <div class="callout-icon">
                <i class="bi bi-exclamation-circle"></i>
            </div>
            <div class="callout-text">${content}</div>
        </div>
    `,

    'info': (content) => `
        <div class="callout callout-info">
            <div class="callout-icon">
                <i class="bi bi-info-circle"></i>
            </div>
            <div class="callout-text">${content}</div>
        </div>
    `,

    'error': (content) => `
        <div class="callout callout-error">
            <div class="callout-icon">
                <i class="bi bi-exclamation-circle"></i>
            </div>
            <div class="callout-text">${content}</div>
        </div>
    `,

    'terminal': (content) => {
        // Clean up PocketBase's formatting tags
        const cleanCode = content
            .replace(/<\/p>\s*<p>/gi, '\n') // Turn paragraph breaks into newlines
            .replace(/<br\s*\/?>/gi, '\n')  // Turn <br> (Shift+Enter) into newlines
            .replace(/<\/?p>/gi, '')        // Strip any remaining outer <p> tags
            .trim();                        // Remove extra whitespace at the start/end

        return `
        <div class="terminal-block">
            <div class="terminal-header">
                <div class="terminal-dots">
                    <span class="term-dot close"></span>
                    <span class="term-dot minimize"></span>
                    <span class="term-dot maximize"></span>
                </div>
                <div class="terminal-title">bash</div>
                <button class="terminal-copy" onclick="
                    navigator.clipboard.writeText(this.closest('.terminal-block').querySelector('code').innerText);
                    const btn = this;
                    const originalHtml = btn.innerHTML;
                    btn.innerHTML = '<i class=&quot;bi bi-check2&quot;></i> Copied!';
                    btn.style.color = 'var(--accent-color)';
                    setTimeout(() => { 
                        btn.innerHTML = originalHtml; 
                        btn.style.color = ''; 
                    }, 2000);
                ">
                    <i class="bi bi-clipboard"></i> Copy
                </button>
            </div>
            <div class="terminal-body">
                <pre><code>${cleanCode}</code></pre>
            </div>
        </div>
        `;
    }
};

// --- 2. The core parsing engine ---
function parsePostContent(htmlString) {
    if (!htmlString) return "";

    let processedHtml = htmlString;

    // This Regex powerfully matches: [tag]content[/tag]
    // It also optionally matches <p> tags around it, destroying them so we don't inject <div> elements inside <p> elements (which is invalid HTML!)
    const shortcodeRegex = /(?:<p>)?\s*\[(\w+)\]([\s\S]*?)\[\/\1\]\s*(?:<\/p>)?/g;

    processedHtml = processedHtml.replace(shortcodeRegex, (match, tag, innerContent) => {
        // If the tag exists in our registry above, replace it!
        if (shortcodeRegistry[tag]) {
            return shortcodeRegistry[tag](innerContent.trim());
        }
        // If it's not a registered tag, leave it completely alone
        return match;
    });

    return processedHtml;
}

module.exports = { parsePostContent };