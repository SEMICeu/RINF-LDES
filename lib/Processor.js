import { getRINFAuthToken } from "./RMLManager.js";
import { request } from "undici";
import unzipper from "unzipper";
import { readFileSync } from "fs";
import { readFile } from "fs/promises";
import { glob } from "glob";

function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

export async function getRINF(reader, writer, mappingWriter) {
  const token = await getRINFAuthToken();
  const mappingFile = readFileSync("./mappings/SoLTracks-LDES.rml.ttl")
    .toString();
  reader.data(async (country) => {
    const countryMappingFile = mappingFile.replaceAll("${COUNTRY}", country)
      .replaceAll("${OUTPUT_FILE_PATH}", `./output/${country}.ttl`).replaceAll(
        "${RINF_SOURCE}",
        "",
      );
    mappingWriter.push(countryMappingFile);
    console.log("Updated mapping file");

    console.log(
      "request ",
      `https://rinf.era.europa.eu/api/XmlDatasets/${country}`,
    );
    const res = await request(
      `https://rinf.era.europa.eu/api/XmlDatasets/${country}`,
      {
        method: "GET",
        headers: { authorization: `${token.token_type} ${token.access_token}` },
      },
    );

    if (res.headers["content-disposition"]) {
      const fileContents = await streamToString(
        res.body.pipe(unzipper.ParseOne()),
      );
      // parse XML
      writer.push(fileContents);
      console.log("Pushed ", fileContents.length, "bytes");
    } else {
      console.log("No content-disposition");
    }
  });
}

export async function getRINF2(reader, writer) {
  const token = await getRINFAuthToken();

  reader.data(async (country) => {
    console.log(
      "request ",
      `https://rinf.era.europa.eu/api/XmlDatasets/${country}`,
    );
    const res = await request(
      `https://rinf.era.europa.eu/api/XmlDatasets/${country}`,
      {
        method: "GET",
        headers: { authorization: `${token.token_type} ${token.access_token}` },
      },
    );

    if (res.headers["content-disposition"]) {
      const fileContents = await streamToString(
        res.body.pipe(unzipper.ParseOne()),
      );
      // parse XML
      writer.push(fileContents);
      console.log("Pushed ", fileContents.length, "bytes");
    } else {
      console.log("No content-disposition");
    }
  });
}

export function print(reader) {
  reader.data((x) => {
    console.log(x);
  });
}

export async function globRead(globPattern, writer, wait = 0) {
  console.log(globPattern, writer, wait);
  const jsfiles = await glob(globPattern, {});
  const files = await Promise.all(
    jsfiles.map((x) => readFile(x, { encoding: "utf8" })),
  );

  return async () => {
    for (let file of files) {
      await writer.push(file);
      await new Promise((res) => setTimeout(res, wait));
    }
  };
}

export function buffer(reader, writer) {
  const buffer = [];
  let currentPromise = undefined;
  reader.data((x) => {
    buffer.push(x);
    if (!currentPromise) {
      currentPromise = (async () => {
        let item = buffer.shift();
        while (item) {
          await writer.push(item);
          item = buffer.shift();
        }
      })();
    }
  });
}

