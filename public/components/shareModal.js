import * as React from "react";
import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import lighthouse from "@lighthouse-web3/sdk";
import { ethers } from "ethers";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function ShareModal({ open, setOpen, cid }) {
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [address, setAddress] = useState(null);

  const signAuthMessage = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const publicKey = (await signer.getAddress()).toLowerCase();
    const messageRequested = (await lighthouse.getAuthMessage(publicKey)).data
      .message;
    const signedMessage = await signer.signMessage(messageRequested);
    return { publicKey: publicKey, signedMessage: signedMessage };
  };

  const shareFile = async (shareTo) => {
    if (!shareTo) {
      console.log("no address found", address);
    }
    // Then get auth message and sign
    // Note: message should be signed by owner of file.
    const { publicKey, signedMessage } = await signAuthMessage();
    console.log("shareTo", shareTo, cid, publicKey, signedMessage);

    try {
      const res = await lighthouse.shareFile(
        publicKey,
        [shareTo],
        cid,
        signedMessage
      );

      console.log(res);
    } catch (error) {
      console.log("Error while sharing access", error);
    }

    /*
      data: {
        cid: "QmTTa7rm2nMjz6wCj9pvRsadrCKyDXm5Vmd2YyBubCvGPi",
        shareTo: "0x201Bcc3217E5AA8e803B41d1F5B6695fFEbD5CeD"
      }
    */
    /*Visit: 
        https://files.lighthouse.storage/viewFile/<cid>  
      To view encrypted file
    */
  };
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      shareFile(address);
    }
  };

  return (
    <div>
      <Button onClick={handleOpen}>Open modal</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Share this file
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Enter the wallet address of the person you want to share this file
            with.
          </Typography>
          <TextField
            fullWidth
            id="outlined-controlled"
            label="Address"
            value={address}
            onChange={(event) => {
              setAddress(event.target.value);
            }}
            onKeyPress={handleKeyPress}
          />
        </Box>
      </Modal>
    </div>
  );
}
