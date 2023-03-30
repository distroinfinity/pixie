import React from "react";
import { Text } from "@chakra-ui/react";
function TimestampDisplay({ timestamp }) {
  const date = new Date(timestamp);
  const dateString = date.toLocaleDateString(); // format date as string
  const timeString = date.toLocaleTimeString(); // format time as string

  return (
    <div>
      <Text fontSize='xl'>
        Uploaded at: {dateString} {timeString}
      </Text>
    </div>
  );
}

export default TimestampDisplay;
