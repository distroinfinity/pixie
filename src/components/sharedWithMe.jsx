import React from "react";
import { SimpleGrid } from "@chakra-ui/react";
import FileCard from "./fileCard";
const SharedWithMe = ({ fileIds }) => {
  return (
    <SimpleGrid
      spacing={4}
      templateColumns="repeat(auto-fill, minmax(200px, 1fr))"
      minH={"60vh"}
    >
      {fileIds?.length > 0
        ? fileIds.map((fileId, index) => (
            <div key={index}>
              <FileCard fileId={fileId} share={true} />
            </div>
          ))
        : "No files shared with you yet"}
    </SimpleGrid>
  );
};

export default SharedWithMe;
