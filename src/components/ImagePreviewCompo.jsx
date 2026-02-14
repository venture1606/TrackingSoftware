import React from "react";
import { Flex, Text, Icon } from "@chakra-ui/react";
import { AttachmentIcon } from "@chakra-ui/icons";

const ImagePreviewCompo = ({ url, isView, onClick }) => {
  if (!url) {
    return isView ? <Text color="gray.300" fontSize="sm">-</Text> : null;
  }

  return (
    <Flex 
      align="center" 
      justify="center"
      gap={2} 
      cursor="pointer" 
      color="blue.500" 
      _hover={{ color: "blue.700", textDecoration: "underline" }}
      onClick={onClick}
      transition="all 0.2s"
    >
      <Icon as={AttachmentIcon} w={3} h={3} />
      <Text fontSize="xs" fontWeight="bold">
        View <Text as="span" fontSize="10px" fontWeight="medium" color="gray.400">(Image)</Text>
      </Text>
    </Flex>
  );
};

export default ImagePreviewCompo;
