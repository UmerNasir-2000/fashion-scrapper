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

  const articles = [];
  for (let link of links) {
    console.log(`Extracting article from ${link}`);
    const article = await extractArticle(page, link);
    articles.push(article);
  }

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

  const price = await page.$eval(".t4s-product-price span.money", (el) =>
    Number(el.textContent.replace("Rs. ", "").replace(",", ""))
  );

  const description = await page.$eval(".panel p:nth-child(2)", (el) =>
    el.textContent.trim()
  );

  const designDetails = await page.$eval(".panel ul", (el) =>
    Array.from(el.querySelectorAll("li"), (li) => li.textContent.trim())
  );

  const meta = await page.$$eval(".skus", (elements) =>
    elements.map((el) => {
      let [key, ...value] = el.textContent.trim().split(":");
      key = key.trim() === "By Pcs" ? "pieces" : key.trim();
      key = key.charAt(0).toLowerCase() + key.slice(1);
      return { [key]: value.join(":").trim() };
    })
  );

  return { title, price, description, designDetails, images, meta };
}

run().catch(console.error);
