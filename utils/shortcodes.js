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
    },
    'server': (ip) => `
        <div style="background: var(--card-bg); border: 1px solid var(--border-color); padding: 1rem 1.5rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin: 1.5rem 0;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <i class="bi bi-exclamation-circle" style="color: var(--accent-color); font-size: 1.5rem;"></i>
                <div>
                    <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Address</div>
                    <div style="font-family: monospace; font-size: 1.1rem; color: #fff;">${ip.trim()}</div>
                </div>
            </div>
            <button onclick="navigator.clipboard.writeText('${ip.trim()}'); const btn = this; const og = btn.innerHTML; btn.innerHTML='<i class=&quot;bi bi-check2&quot;></i> Copied!'; setTimeout(()=>btn.innerHTML=og, 2000)" style="background: color-mix(in srgb, var(--accent-color) 10%, transparent); color: var(--accent-color); border: 1px solid color-mix(in srgb, var(--accent-color) 30%, transparent); padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: 600; font-family: 'Inter', sans-serif;">
                <i class="bi bi-clipboard"></i> Copy IP
            </button>
        </div>
    `,
    'youtube': (videoId) => `
        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);">
            <iframe src="https://www.youtube.com/embed/${videoId.trim()}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe>
        </div>
    `,
    'audio': (url) => `
        <div style="background: var(--card-bg); border: 1px solid var(--border-color); padding: 0.75rem; border-radius: 50px; display: flex; align-items: center; gap: 1rem; margin: 2rem 0; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
            <button onclick="const a = this.nextElementSibling; if(a.paused){a.play(); this.innerHTML='<i class=&quot;bi bi-pause-fill&quot;></i>'}else{a.pause(); this.innerHTML='<i class=&quot;bi bi-play-fill&quot;></i>'}" style="background: var(--accent-color); color: #000; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; transition: transform 0.1s;">
                <i class="bi bi-play-fill"></i>
            </button>
            <audio src="${url.trim()}" onended="this.previousElementSibling.innerHTML='<i class=&quot;bi bi-play-fill&quot;></i>'"></audio>
            <div style="flex-grow: 1; font-size: 0.95rem; color: var(--text-main); font-weight: 500;">Original Audio Track</div>
            <i class="bi bi-soundwave" style="color: var(--text-muted); font-size: 1.25rem; margin-right: 1rem;"></i>
        </div>
    `,
    'ref': (content) => {
        const parts = content.split('|').map(s => s.trim());
        const title = parts[0] || 'Reference Link';
        const url = parts[1] || '#';

        const cleanUrl = url.replace(/^https?:\/\//, '');

        return `
        <a href="${url}" target="_blank" class="reference-block">
            <div class="ref-icon">
                <i class="bi bi-bookmark-fill"></i>
            </div>
            <div class="ref-content">
                <div class="ref-title">${title}</div>
                <div class="ref-url">${cleanUrl}</div>
            </div>
            <div class="ref-arrow">
                <i class="bi bi-box-arrow-up-right"></i>
            </div>
        </a>
        `;
    },
    'dropdown': (content, title) => {
        const dropTitle = title || "Click to expand";

        return `
        <details class="custom-dropdown">
            <summary class="dropdown-summary">
                <span class="dropdown-title">${dropTitle}</span>
                <i class="bi bi-chevron-down dropdown-icon"></i>
            </summary>
            <div class="dropdown-content">
                ${content}
            </div>
        </details>
        `;
    },
    'quote': (content, source) => {
        const citationHtml = source
            ? `<cite class="quote-source">&mdash; ${source}</cite>`
            : '';

        return `
        <blockquote class="custom-quote">
            <i class="bi bi-quote quote-icon"></i>
            <div class="quote-content">${content}</div>
            ${citationHtml}
        </blockquote>
        `;
    },
    'random': (content) => {
        const items = content.split(',').map(item => item.trim());
        const validItems = items.filter(item => item.length > 0);
        if (validItems.length === 0) return '';
        const randomIndex = Math.floor(Math.random() * validItems.length);
        return validItems[randomIndex];
    },
};

// --- 2. The core parsing engine ---
function parsePostContent(htmlString) {
    if (!htmlString) return "";

    let processedHtml = htmlString;

    const shortcodeRegex = /(?:<p>)?\s*\[(\w+)(?:=([^\]]+))?\]([\s\S]*?)\[\/\1\]\s*(?:<\/p>)?/g;

    processedHtml = processedHtml.replace(shortcodeRegex, (match, tag, arg, innerContent) => {
        if (shortcodeRegistry[tag]) {

            // THE FIX: Recursively parse the inside content BEFORE rendering the HTML template
            const deeplyParsedContent = parsePostContent(innerContent);

            return shortcodeRegistry[tag](deeplyParsedContent.trim(), arg ? arg.trim() : null);
        }
        return match;
    });

    return processedHtml;
}

module.exports = { parsePostContent };

module.exports = { parsePostContent };

module.exports = { parsePostContent };