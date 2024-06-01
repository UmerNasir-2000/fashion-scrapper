const fs = require("fs/promises");
const puppeteer = require("puppeteer");

const URL = `https://asimjofa.com/collections/unstitched`;

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(URL);

  const links = await getProductLinks(page);

  for (let link of links) {
    const article = await extractArticle(page, link);
    console.log(article);
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
    return elements.map((el) => {
      let srcset = el.srcset;
      let urls = srcset
        .split(",")
        .map((url) => {
          url = url.trim();
          let jpgIndex = url.indexOf(".jpg");
          let jpegIndex = url.indexOf(".jpeg");
          if (jpgIndex !== -1) {
            url = url.substring(0, jpgIndex + 4);
          } else if (jpegIndex !== -1) {
            url = url.substring(0, jpegIndex + 5);
          }
          if (url.length === 0) {
            return null;
          }
          return "https:" + url;
        })
        .filter(Boolean); // filter out null values
      return urls.filter(Boolean);
    });
  });

  return images.filter(Boolean);
}

run().catch(console.error);
