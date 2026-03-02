const puppeteer = require("puppeteer");
const ejs = require("ejs");
const path = require("path");

exports.generatePDF = async (data) => {

  const html = await ejs.renderFile(
    path.join(__dirname, "../templates/resumeTemplate.ejs"),
    data
  );

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);

  const pdf = await page.pdf({ format: "A4" });

  await browser.close();
  return pdf;
};
