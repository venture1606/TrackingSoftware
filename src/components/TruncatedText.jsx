import React from 'react';
import { Tooltip, Text } from '@chakra-ui/react';

const TruncatedText = ({ text, limit = 25, ...props }) => {
  const isTruncated = text && text.length > limit;
  const displayText = isTruncated ? `${text.substring(0, limit)}...` : text;

  return (
    <Tooltip label={text} isDisabled={!isTruncated} hasArrow>
      <Text 
        as="span" 
        cursor={isTruncated ? "help" : "default"} 
        whiteSpace="nowrap"
        {...props}
      >
        {displayText}
      </Text>
    </Tooltip>
  );
};

export default TruncatedText;
