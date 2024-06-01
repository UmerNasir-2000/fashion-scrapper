const fs = require("fs/promises");
const puppeteer = require("puppeteer");

const URL = `https://asimjofa.com/collections/unstitched`;

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(URL);
  //   await page.screenshot({ path: "site.png" });

  const elements = await page.$$("[data-product-options]");
  let htmlString = ``;
  for (let element of elements) {
    htmlString += await element.evaluate((el) => el.outerHTML);
  }

  await fs.writeFile("output.html", htmlString);

  await browser.close();
}

run().catch(console.error);
