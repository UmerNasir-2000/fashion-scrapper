const fs = require("fs/promises");
const puppeteer = require("puppeteer");

const URL = `https://asimjofa.com/collections/unstitched`;

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--disable-features=SameSiteByDefaultCookies"],
    defaultViewport: null,
  });

  const page = await browser.newPage();

  await page.goto(URL);

  const links = await getProductLinks(page);

  for (let link of links) {
    console.log(`Fetching article from ${link}`);
    const article = await extractArticle(page, link);
    console.log(article);
    console.log(`Fetched...`);
  }

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

async function extractArticle(page, link) {
  await page.goto(link);
  const images = await page.$$eval("img[data-master]", (elements) => {
    return elements.reduce((acc, el) => {
      const imgSources = el.srcset
        .split(", ")
        .filter(Boolean)
        .map((src) => `https:${src.split(" ")[0]}`);
      acc.push(...imgSources);
      return acc;
    }, []);
  });

  return images;
}

run().catch(console.error);
