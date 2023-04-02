import React from "react";
import { SimpleGrid } from "@chakra-ui/react";
import FileCard from "./fileCard";
import { Polybase } from "@polybase/client";

const db = new Polybase({
  defaultNamespace:
    "pk/0xf699df4b2989f26513d93e14fd6e0befd620460546f3706a4e35b10ac3838457a031504254ddac46f6519fcf548ec892cc33043ce74c5fa9018ef5948a685e1d/pixie2",
});

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
