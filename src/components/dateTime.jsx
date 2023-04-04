import React from "react";
import { HStack, Text, Skeleton } from "@chakra-ui/react";
function TimestampDisplay({ timestamp }) {
  const date = new Date(timestamp);
  const dateString = date.toLocaleDateString(); // format date as string
  const timeString = date.toLocaleTimeString(); // format time as string

  return (
    <HStack justifyContent="space-between">
      <Text>Uploaded at:</Text>{" "}
      <Skeleton isLoaded={dateString && timeString}>
        <Text>
          {dateString} {timeString}
        </Text>
      </Skeleton>
    </HStack>
  );
}

export default TimestampDisplay;
