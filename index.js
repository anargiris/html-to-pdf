const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { v4: uuidv4 } = require("uuid");

async function htmlToPdf(htmlFilePath, pdfFilePath, options = {}) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Convert relative image paths to absolute
    let content = fs.readFileSync(htmlFilePath, "utf8");
    content = content.replace(/src="([^"]+)"/g, (match, p1) => {
      if (p1.startsWith("http") || p1.startsWith("file:///")) {
        return match; // Ignore absolute URLs and file URLs
      }
      const imagePath = path.join(__dirname, p1);
      return `src="file://${imagePath}"`;
    });

    // Write the modified content to a temporary file
    const tempHtmlPath = path.join(os.tmpdir(), `${uuidv4()}.html`);
    fs.writeFileSync(tempHtmlPath, content);

    // Use page.goto() to load the HTML file
    await page.goto(`file://${tempHtmlPath}`, { waitUntil: "networkidle0" });

    const pdfOptions = { format: "A4", ...options };
    await page.pdf({ path: pdfFilePath, ...pdfOptions });

    await browser.close();
    console.log(`PDF generated: ${pdfFilePath}`);
  } catch (error) {
    console.error(`Error generating PDF: ${error.message}`);
  }
}

// Example usage
const htmlFilePath = path.join(__dirname, "index.html");
const pdfFilePath = path.join(__dirname, "output.pdf");

htmlToPdf(htmlFilePath, pdfFilePath);
