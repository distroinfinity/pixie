import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { PixieAddress } from "./../../config";
import Pixie from "./../../artifacts/contracts/Pixie.sol/Pixie.json";

import FileCard from "./fileCard";

export const MyFiles = () => {
  const [myFiles, setMyFiles] = useState(null);
  async function getMyFiles() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const provider = new ethers.providers.JsonRpcProvider();
    const signer = provider.getSigner();
    const pixieContract = new ethers.Contract(
      PixieAddress,
      Pixie.abi,
      provider
    );
    const pixie = pixieContract.connect(signer);
    let getFiles;
    try {
      getFiles = await pixie.getFiles();
      console.log("Files fetched ", getFiles);
      setMyFiles(getFiles);
    } catch (error) {
      console.log("error while fetching Files ", error);
      return;
    }
  }
  useEffect(() => {
    getMyFiles();
  }, []);

  return (
    <>
      {myFiles ? (
        <div>
          {myFiles?.map((file, index) => (
            <div key={index}>
              <FileCard data={file}></FileCard>
            </div>
          ))}
        </div>
      ) : (
        "No files yet"
      )}
    </>
  );
};
