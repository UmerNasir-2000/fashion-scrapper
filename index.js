const fs = require("fs/promises");
const puppeteer = require("puppeteer");

const URL = `https://asimjofa.com/collections/unstitched`;

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(URL);

  const links = await getProductLinks(page);

  console.log(links.length);

  await browser.close();
}

async function getProductLinks(page) {
  const linkSet = new Set();

  const elements = await page.$$("[data-product-options] a");

  for (let element of elements) {
    let link = await element.evaluate((el) => el.href);
    linkSet.add(link);
  }
  return [...linkSet];
}

run().catch(console.error);
