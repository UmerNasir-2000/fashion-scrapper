const fs = require("fs/promises");

async function mergeFiles() {
  const files = await fs.readdir("data");
  const records = [];

  for (let file of files) {
    const data = JSON.parse(await fs.readFile(`data/${file}`, "utf-8"));
    records.push(...data);
  }

  await fs.writeFile("data/articles.json", JSON.stringify(records, null, 2));
}

mergeFiles();
