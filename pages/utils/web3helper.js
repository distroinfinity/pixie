import { Web3Storage } from "web3.storage";
import CryptoJS from "crypto-js";
function getAccessToken() {
  return process.env.NEXT_PUBLIC_WEB3STORAGE_TOKEN;
}
function makeStorageClient() {
  let apiToken = getAccessToken();
  //   console.log("API TOKEN", apiToken);
  if (!apiToken) {
    throw Error("arror reading api token from env");
  }
  return new Web3Storage({ token: apiToken });
}

function makeFileObjects(encryptedString) {
  // You can create File objects from a Blob of binary data
  // see: https://developer.mozilla.org/en-US/docs/Web/API/Blob
  // Here we're just storing a JSON object, but you can store images,
  // audio, or whatever you want!
  const obj = { encryptedString: encryptedString };
  const blob = new Blob([JSON.stringify(obj)], { type: "application/json" });

  const files = [
    // new File(["contents-of-file-1"], "plain-utf8.txt"),
    new File([blob], "hello.json"),
  ];
  return files;
}

async function encryptFile(file) {
  console.log("file", file);
  const arrayBuffer = await file.arrayBuffer();
  const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
  const str = CryptoJS.enc.Hex.stringify(wordArray);
  let key = "ZO9iaefjm9TGxoIWzLnlfOvqGetmGB8E";
  const ct = CryptoJS.AES.encrypt(str, key);
  const ctstr = ct.toString();
  return ctstr;
}

export async function uploadToIPFS(file) {
  return "bafybeifrieavmw4gbzuqjgs4zwvfi3j3bnpu6v6twvphokws3vo2kqfrsu";

  //   let encryptedString = await encryptFile(file);
  //   console.log("encrypted string ", encryptedString);
  //   //   let testBuffer = new Buffer(ctstr);

  //   const client = makeStorageClient();
  //   let files = makeFileObjects(encryptedString);
  //   const cid = await client.put(files);
  //   console.log("stored files with cid:", cid);
  //   return cid;
}

export async function retrieveFromIPFS(cid) {
  const client = makeStorageClient();
  const res = await client.get(cid);
  console.log(`Got a response! [${res.status}] ${res.statusText}`);
  if (!res.ok) {
    throw new Error(`failed to get ${cid} - [${res.status}] ${res.statusText}`);
  }

  // unpack File objects from the response
  const files = await res.files();
  for (const file of files) {
    console.log(`${file.cid} -- ${file.path} -- ${file.size}`);
  }
}
