import fs from "fs";
import path from "path";
import { pinFileToIPFS } from "./pinata";

const uploadDataPinata = async () => {

  // Read the second argument to specify in what number of file start to count
  let argument = parseInt(process.argv.slice(2)[0], 10);

  //Check if argument on command exists and It's a number
  if (
    argument === null ||
    argument === undefined ||
    typeof argument !== "number"
  )
    return console.error(
      "Please enter the initial number of your images/json files."
    );

  // Get length of images files
  const imagesDirLen = fs.readdirSync(
    path.join(__dirname, "/data/images")
  ).length;

  // Get length of json files
  const jsonDirLen = fs.readdirSync(path.join(__dirname, "/data/json")).length;

  // Check if its the same lenght (images, json) of files
  if (imagesDirLen !== jsonDirLen) {
    console.error(
      `There are ${imagesDirLen} images and ${jsonDirLen} json files. Not the same length.`
    );
    return;
  }

  for (let i = argument; i <= (argument + imagesDirLen - 1); i++) {
    console.log("Editing file", i);

    // Read Image  and JSON
    const image = fs.createReadStream(
      path.join(__dirname, `/data/images/${i}.png`)
    );
    const json = fs.readFileSync(path.join(__dirname, `/data/json/${i}.json`));

    // Convert to Object
    const JsonParse = JSON.parse(json.toString());

    if (image === null || image === undefined)
      return console.log("Image Not Found:", i);

    if (json === null || json === undefined)
      return console.log("Json Not Found:", i);
    try {
      const { IpfsHash } = await pinFileToIPFS(image, `${i}-charros-jalisco.png`);
      console.log(`Hash of file ${i} is ${IpfsHash}`);

      // Edit Object
      JsonParse["image"] = `ipfs://${IpfsHash}`;

      // Write file JSON with the same name of image 1 - If not launch error
      fs.writeFileSync(
        path.join(__dirname, `/data/json/${i}.json`),
        JSON.stringify(JsonParse)
      );
    } catch (e) {
      console.error(e);
    }
  }
};

uploadDataPinata();
