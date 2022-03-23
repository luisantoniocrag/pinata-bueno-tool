import fs from "fs";
import path from "path";
import { pinFileToIPFS } from "./pinata";

const uploadDataPinata = async () => {
  const argument = process.argv.slice(2)[0];

  const imagesDirLen = fs.readdirSync(
    path.join(__dirname, "/data/images")
  ).length;
  const jsonDirLen = fs.readdirSync(path.join(__dirname, "/data/json")).length;

  // Check if its the same lenght
  if (imagesDirLen !== jsonDirLen) {
    console.error(
      "Error: There are different lengths between images and json files"
    );
    return;
  }

  //Check if argument exists
  if (argument !== null || argument !== undefined) {
    for (let i = parseInt(argument, 10); i <= imagesDirLen - 1; i++) {
      console.log("Editing file", i);

      // Read Image  and JSON
      const image = fs.createReadStream(
        path.join(__dirname, `/data/images/${i}.png`)
      );
      const json = fs.readFileSync(
        path.join(__dirname, `/data/json/${i}.json`)
      );

      // Convert to Object
      const JsonParse = JSON.parse(json.toString());

      if (image === null || image === undefined)
        return console.log("Image Not Found:", i);

      if (json === null || json === undefined)
        return console.log("Json Not Found:", i);

      try {
        const { IpfsHash } = await pinFileToIPFS(image, `${i}-bm.png`);
        console.log(`Hash of file ${i} is ${IpfsHash}`);

        // Edit Object
        JsonParse["image"] = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;

        // Write file JSON with the same name of image 1 - If not launch error
        fs.writeFileSync(
          path.join(__dirname, `/data/json/${i}.json`),
          JSON.stringify(JsonParse)
        );
      } catch (e) {
        console.error(e);
      }
    }
  } else
    return console.error(
      "Please enter the initial number of your images/json files."
    );
};

uploadDataPinata();
