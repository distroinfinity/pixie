import { useState, useRef } from "react";
import { Box, Text, useColorModeValue, VStack } from "@chakra-ui/react";

function DragAndDrop({ onFileSelect, setCaptureEvent, captureEvent }) {
  const [dragging, setDragging] = useState(false);
  const inputFileRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
    };
    reader.readAsDataURL(file);
    console.log("file dragged", event, file);
    setCaptureEvent(event);
    // onFileSelect(file);
  };

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    console.log("file input", event, file);
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
    };
    reader.readAsDataURL(file);
    setCaptureEvent(event);
    // onFileSelect(file);
  };

  const borderColor = useColorModeValue("gray.200", "gray.600");
  const backgroundColor = useColorModeValue("gray.100", "gray.700");
  const hoverBackgroundColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.500", "gray.400");

  return (
    <VStack
      border="2px dashed"
      borderColor={dragging ? "blue.500" : borderColor}
      backgroundColor={backgroundColor}
      color={textColor}
      cursor="pointer"
      padding="6"
      textAlign="center"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => {
        inputFileRef.current.click();
      }}
    >
      <img src={imageSrc ? imageSrc : "/pixie.png"} alt="Selected file" />

      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileInput}
        ref={inputFileRef}
      />
      <Text marginBottom="2">
        Drag and drop an image file, or click to select a file.
      </Text>
      <Text fontSize="sm" color="gray.400">
        JPEG, PNG, GIF up to 10MB
      </Text>
    </VStack>
  );
}

export default DragAndDrop;
