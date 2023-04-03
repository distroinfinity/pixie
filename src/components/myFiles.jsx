import React from "react";
import { SimpleGrid } from "@chakra-ui/react";
import FileCard from "./fileCard";

const MyFiles = ({ files, setFiles }) => {
  return (
    <SimpleGrid
      spacing={4}
      templateColumns="repeat(auto-fill, minmax(200px, 1fr))"
      minH={"60vh"}
    >
      {files?.length > 0
        ? files.map((fileId, index) => (
            <div key={index}>
              <FileCard fileId={fileId} />
            </div>
          ))
        : "No files Yet"}
    </SimpleGrid>
  );
};

export default MyFiles;
