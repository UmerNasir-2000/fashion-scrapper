const fs = require("fs/promises");
const getColors = require("get-image-colors");

async function run() {
  try {
    const data = await fs.readFile("data/articles__500.json", "utf8");
    const records = JSON.parse(data);

    for (let record of records) {
      const image = record.images[0];
      const colors = await getColors(image);
      const hexcodes = colors.map((color) => color.hex());
      record.colors = hexcodes;
    }

    await fs.writeFile("articles.json", JSON.stringify(records, null, 2));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
