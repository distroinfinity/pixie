import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { PixieAddress } from "./../../config";
import Pixie from "./../../artifacts/contracts/Pixie.sol/Pixie.json";
import lighthouse, { upload } from "@lighthouse-web3/sdk";
import FileCard from "./fileCard";
import { Polybase } from "@polybase/client";

const db = new Polybase({
  defaultNamespace:
    "pk/0xf699df4b2989f26513d93e14fd6e0befd620460546f3706a4e35b10ac3838457a031504254ddac46f6519fcf548ec892cc33043ce74c5fa9018ef5948a685e1d/pixie",
});
export const MyFiles = () => {
  const [myFiles, setMyFiles] = useState([]);

  async function getMyFiles() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const provider = new ethers.providers.JsonRpcProvider();
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    // console.log(address);
    // const uploadsRes = await lighthouse.getUploads(address);

    // console.log(uploadsRes.data.uploads);
    let user;
    try {
      user = await db.collection("User").record(address).get();
    } catch (error) {
      console.log("User does not exist, please sign up", error);
      return;
    }
    console.log("useer data", user.data);
    setMyFiles(user.data.files);
  }
  useEffect(() => {
    getMyFiles();
  }, []);

  return (
    <>
      {myFiles.length > 0 ? (
        <div style={{ display: "flex" }}>
          {myFiles?.map((fileid, index) => (
            <div key={index}>
              <FileCard fileid={fileid}></FileCard>
            </div>
          ))}
        </div>
      ) : (
        "No files yet"
      )}
    </>
  );
};
