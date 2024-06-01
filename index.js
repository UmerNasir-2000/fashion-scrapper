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

  const articles = await Promise.all(
    links.map((link) => extractArticle(page, link))
  );

  await fs.writeFile("articles.json", JSON.stringify(articles, null, 2));

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

  const title = await page.$eval(".t4s-product__title", (el) => el.textContent);
  const price = await page.$eval(
    ".t4s-product-price span.money",
    (el) => el.textContent
  );
  const description = await page.$eval(
    ".panel p:nth-child(2)",
    (el) => el.textContent
  );

  const designDetails = await page.$eval(".panel ul", (el) =>
    Array.from(el.querySelectorAll("li"), (li) => li.textContent)
  );

  return { title, price, description, designDetails, images };
}

run().catch(console.error);
