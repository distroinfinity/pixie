import * as React from "react";
import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { red } from "@mui/material/colors";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { Share } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ShareModal from "./shareModal";
import { ethers } from "ethers";
import lighthouse from "@lighthouse-web3/sdk";
import { Polybase } from "@polybase/client";

const db = new Polybase({
  defaultNamespace:
    "pk/0xf699df4b2989f26513d93e14fd6e0befd620460546f3706a4e35b10ac3838457a031504254ddac46f6519fcf548ec892cc33043ce74c5fa9018ef5948a685e1d/pixie",
});

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function FileCard({ fileid }) {
  const [expanded, setExpanded] = useState(false);
  const [fileURL, setFileURL] = useState(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);

  async function loadFile() {
    let file = await db.collection("Files").record(fileid).get();
    console.log("fetched file", file.data);
    setFile(file.data);
  }
  useEffect(() => {
    // load file data from polybase
    loadFile();
  }, []);

  const sign_auth_message = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const publicKey = (await signer.getAddress()).toLowerCase();
    const messageRequested = (await lighthouse.getAuthMessage(publicKey)).data
      .message;
    const signedMessage = await signer.signMessage(messageRequested);
    return { publicKey: publicKey, signedMessage: signedMessage };
  };

  /* Decrypt file */
  const decrypt = async (cid) => {
    // Fetch file encryption key
    const { publicKey, signedMessage } = await sign_auth_message();
    console.log(publicKey, signedMessage);
    /*
      fetchEncryptionKey(cid, publicKey, signedMessage)
        Parameters:
          CID: CID of the file to decrypt
          publicKey: public key of the user who has access to file or owner
          signedMessage: message signed by the owner of publicKey
    */
    const keyObject = await lighthouse.fetchEncryptionKey(
      cid,
      publicKey,
      signedMessage
    );

    // Decrypt file
    /*
      decryptFile(cid, key, mimeType)
        Parameters:
          CID: CID of the file to decrypt
          key: the key to decrypt the file
          mimeType: default null, mime type of file
    */

    const fileType = "image/jpeg";
    const decrypted = await lighthouse.decryptFile(
      cid,
      keyObject.data.key,
      fileType
    );
    console.log(decrypted);
    /*
      Response: blob
    */

    // View File
    const url = URL.createObjectURL(decrypted);
    console.log("file url", url);
    setFileURL(url);
  };

  return (
    <>
      <ShareModal
        open={open}
        setOpen={setOpen}
        cid={file?.cid}
        fileid={fileid}
      />
      <Card sx={{ maxWidth: 300 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
              R
            </Avatar>
          }
          action={
            <IconButton aria-label="settings">
              <MoreVertIcon />
            </IconButton>
          }
          title="File Name"
          subheader="Date"
        />
        <CardMedia
          component="img"
          height="194"
          image={fileURL ? fileURL : "/images/imgPlaceholder.png"}
          alt="Paella dish"
        />

        <CardContent>
          {/* <Typography variant="body2" color="text.secondary">
          Enter A description if you want
        </Typography> */}
        </CardContent>
        <CardActions disableSpacing>
          <IconButton
            onClick={() => {
              decrypt(file?.cid);
            }}
            aria-label="add to favorites"
          >
            {/* <FavoriteIcon /> */}
            {fileURL ? <LockOpenIcon /> : <LockIcon />}
          </IconButton>
          <IconButton
            aria-label="share"
            onClick={() => {
              setOpen(true);
            }}
          >
            <Share />
          </IconButton>
        </CardActions>
      </Card>
    </>
  );
}