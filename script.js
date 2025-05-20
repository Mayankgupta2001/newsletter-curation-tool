const linksContainer = document.getElementById("linksContainer");
const form = document.getElementById("newsletterForm");
const preview = document.getElementById("preview");
const downloadBtn = document.getElementById("downloadBtn");
const markdownBtn = document.getElementById("downloadMarkdown");
const toggleBtn = document.getElementById("toggleDark");
const body = document.getElementById("mainBody");
const copyMarkdownBtn = document.getElementById("copyMarkdown");
const copyStatus = document.getElementById("copyStatus");
const copyHtmlBtn = document.getElementById("copyHtml");

let generatedHtml = "";
let markdownOutput = "";

// Dark Mode on load
if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark");
}

// Toggle dark mode
toggleBtn.addEventListener("click", () => {
  body.classList.toggle("dark");
  localStorage.setItem("theme", body.classList.contains("dark") ? "dark" : "light");
});

// Restore from localStorage
window.addEventListener("DOMContentLoaded", () => {
  const saved = JSON.parse(localStorage.getItem("newsletterData"));
  if (saved) {
    document.getElementById("newsletterTitle").value = saved.title || "";
    saved.links.forEach(link => addLinkInput(link.title, link.desc, link.url));
  } else {
    addLinkInput();
  }
});

function saveToLocalStorage() {
  const title = document.getElementById("newsletterTitle").value;
  const blocks = linksContainer.querySelectorAll(".link-block");

  const links = Array.from(blocks).map(block => {
    const inputs = block.querySelectorAll("input, textarea");
    return {
      title: inputs[0].value.trim(),
      desc: inputs[1].value.trim(),
      url: inputs[2].value.trim()
    };
  });

  localStorage.setItem("newsletterData", JSON.stringify({ title, links }));
}

function addLinkInput(title = "", desc = "", url = "") {
  const div = document.createElement("div");
  div.className = "space-y-2 border-t pt-4 mt-4 link-block";
  div.innerHTML = `
    <input type="text" placeholder="Title" value="${title}" class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
    <textarea placeholder="Description" class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">${desc}</textarea>
    <input type="url" placeholder="URL" value="${url}" class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
    <button type="button" class="text-red-500 underline text-sm remove-btn">Remove</button>
  `;
  linksContainer.appendChild(div);

  div.querySelector(".remove-btn").addEventListener("click", () => {
    div.remove();
    saveToLocalStorage();
  });

  div.querySelectorAll("input, textarea").forEach(el => {
    el.addEventListener("input", saveToLocalStorage);
  });
}

document.getElementById("addLink").addEventListener("click", () => {
  addLinkInput();
  saveToLocalStorage();
});

document.getElementById("newsletterTitle").addEventListener("input", saveToLocalStorage);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  generatePreview();
  saveToLocalStorage();
});

function generatePreview() {
  const title = document.getElementById("newsletterTitle").value;
  const blocks = linksContainer.querySelectorAll(".link-block");

  let linksHtml = "";
  let markdown = `# ${title}\n\n`;

  blocks.forEach(block => {
    const inputs = block.querySelectorAll("input, textarea");
    const linkTitle = inputs[0].value.trim();
    const description = inputs[1].value.trim();
    const url = inputs[2].value.trim();

    if (linkTitle && description && url) {
      linksHtml += `
        <section>
          <h2><a href="${url}" target="_blank">${linkTitle}</a></h2>
          <p>${description}</p>
        </section>
      `;
      markdown += `## [${linkTitle}](${url})\n${description}\n\n`;
    }
  });

  markdownOutput = markdown;

  generatedHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          background: ${body.classList.contains("dark") ? "#111827" : "#f9fafb"};
          color: ${body.classList.contains("dark") ? "#f3f4f6" : "#1f2937"};
          padding: 2rem;
          line-height: 1.7;
          max-width: 700px;
          margin: auto;
        }
        h1 {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
        }
        h2 {
          font-size: 1.2rem;
          margin-bottom: 0.3rem;
        }
        a {
          color: ${body.classList.contains("dark") ? "#3b82f6" : "#2563eb"};
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        section {
          margin-bottom: 1.8rem;
          border-bottom: 1px solid ${body.classList.contains("dark") ? "#374151" : "#e5e7eb"};
          padding-bottom: 1.2rem;
        }
        p {
          margin: 0.2rem 0 0;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${linksHtml}
    </body>
    </html>
  `;

  preview.srcdoc = generatedHtml;
}

// Copy buttons
copyHtmlBtn.addEventListener("click", () => {
  if (!generatedHtml) return alert("Generate newsletter first!");
  navigator.clipboard.writeText(generatedHtml)
    .then(() => alert("✅ HTML copied to clipboard!"))
    .catch(err => alert("❌ Copy failed: " + err));
});

copyMarkdownBtn.addEventListener("click", () => {
  if (!markdownOutput) return alert("Generate newsletter first!");
  navigator.clipboard.writeText(markdownOutput)
    .then(() => {
      copyStatus.classList.remove("hidden");
      setTimeout(() => copyStatus.classList.add("hidden"), 1500);
    });
});

// Download buttons
downloadBtn.addEventListener("click", () => {
  if (!generatedHtml) return alert("Please generate the newsletter first.");
  const blob = new Blob([generatedHtml], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "newsletter.html";
  a.click();
});

markdownBtn.addEventListener("click", () => {
  if (!markdownOutput) return alert("Please generate the newsletter first.");
  const blob = new Blob([markdownOutput], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "newsletter.md";
  a.click();
});
