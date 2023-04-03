import React from "react";
import { HStack, Text } from "@chakra-ui/react";
function TimestampDisplay({ timestamp }) {
  const date = new Date(timestamp);
  const dateString = date.toLocaleDateString(); // format date as string
  const timeString = date.toLocaleTimeString(); // format time as string

  return (
    <HStack justifyContent="space-between">
      <Text>Uploaded at:</Text>{" "}
      <Text>
        {dateString} {timeString}
      </Text>
    </HStack>
  );
}

export default TimestampDisplay;
