import React, { useContext, useEffect, useState } from "react";
import FileCard from "../../public/components/fileCard";
import { useRouter } from "next/router";
import { Grid } from "@mui/material";
import { Polybase } from "@polybase/client";
import Button from "@mui/material/Button";
import { revokeFileAccess } from "@lighthouse-web3/sdk";
import lighthouse from "@lighthouse-web3/sdk";
import ClickContext from "./../../public/contexts/userContexts";

const db = new Polybase({
  defaultNamespace:
    "pk/0xf699df4b2989f26513d93e14fd6e0befd620460546f3706a4e35b10ac3838457a031504254ddac46f6519fcf548ec892cc33043ce74c5fa9018ef5948a685e1d/pixie",
});

const File = () => {
  // const [clickAmount, increment] = useContext(ClickContext);

  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState(null);

  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    loadData();
  }, [router.isReady]);

  async function loadData() {
    const fileId = router.query.fileId;
    console.log("here file page", fileId);
    let file = await db.collection("Files").record(fileId).get();
    console.log("fetched file", file.data);
    setFile(file.data);
  }
  async function revokeFileAccess(cid, from) {
    console.log("testing", cid, from);
    const res = await lighthouse.revokeFileAccess();
  }
  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <img src={fileData ? fileData : "/images/imgPlaceholder.png"} />
          <Button
            variant="outlined"
            onClick={() => {
              console.log("Unlock Clicked");
            }}
          >
            Unlock
          </Button>
        </Grid>
        <Grid item xs={6}>
          {/* clicked count {clickAmount}
          <button onClick={increment}>Increment</button> */}
          <br></br> <br></br>
          name: {file?.name} <br></br>
          id: {file?.id} <br></br>
          created at: {file?.timeCreated} <br></br> <br></br> <br></br>{" "}
          <br></br>
          <Button
            variant="outlined"
            onClick={() => {
              console.log("Mint Clicked");
            }}
          >
            Mint Passes
          </Button>
          <br></br>
          Total NFT passes: <br></br>
          Sold: <br></br>
          Left: <br></br>
        </Grid>
        <Grid item xs={6}>
          <h2>Shared with</h2>
          {file?.sharedWith.map((item, index) => {
            return (
              <div key={index}>
                <p>
                  {index}. {item}
                </p>
                <Button
                  variant="outlined"
                  onClick={() => {
                    revokeFileAccess(file.cid, item);
                  }}
                >
                  Revoke Access
                </Button>
              </div>
            );
          })}
        </Grid>
        <Grid item xs={6}>
          wrve
        </Grid>
      </Grid>
    </div>
  );
};

export default File;
