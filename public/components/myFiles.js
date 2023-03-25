import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import FileCard from "./fileCard";
import { Polybase } from "@polybase/client";
import { User_data } from "./../contexts/userContexts";
import { useContext } from "react";
import { useRouter } from "next/router";

const db = new Polybase({
  defaultNamespace:
    "pk/0xf699df4b2989f26513d93e14fd6e0befd620460546f3706a4e35b10ac3838457a031504254ddac46f6519fcf548ec892cc33043ce74c5fa9018ef5948a685e1d/pixie",
});
export const MyFiles = ({ sharedFiles }) => {
  const { user } = useContext(User_data);
  const [userId, setUserId] = useState(user.id);
  const [myFiles, setMyFiles] = useState(user.files);

  useEffect(() => {}, []);

  return (
    <>
      {myFiles.length > 0 ? (
        <div style={{ display: "flex" }}>
          {myFiles?.map((fileid, index) => (
            <div key={index}>
              <FileCard fileid={fileid} sharedFiles={sharedFiles}></FileCard>
            </div>
          ))}
        </div>
      ) : (
        "No files yet"
      )}
    </>
  );
};
