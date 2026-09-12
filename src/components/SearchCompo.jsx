import React, { useState, useEffect } from "react";
import {
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Input,
  IconButton,
} from "@chakra-ui/react";
import { SearchIcon, CloseIcon } from "@chakra-ui/icons";

const SearchCompo = ({
  placeholder = "Search...",
  value,
  onSearch,
  width = { base: "100%", md: "220px" },
}) => {
  const isControlled = value !== undefined;
  const [internalTerm, setInternalTerm] = useState(value || "");

  useEffect(() => {
    if (isControlled) {
      setInternalTerm(value || "");
    }
  }, [value, isControlled]);

  const currentTerm = isControlled ? value || "" : internalTerm;

  const handleSearch = (e) => {
    const val = e.target.value;
    if (!isControlled) {
      setInternalTerm(val);
    }
    if (onSearch) {
      onSearch(val);
    }
  };

  const handleClear = () => {
    if (!isControlled) {
      setInternalTerm("");
    }
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <InputGroup size="sm" width={width} flexShrink={0}>
      <InputLeftElement pointerEvents="none">
        <SearchIcon color="gray.400" boxSize={3.5} />
      </InputLeftElement>
      <Input
        type="text"
        placeholder={placeholder}
        value={currentTerm}
        onChange={handleSearch}
        borderRadius="full"
        bg="white"
        fontSize="xs"
        pr={currentTerm ? "28px" : "10px"}
        _focus={{
          borderColor: "blue.400",
          boxShadow: "0 0 0 1px #3182ce",
        }}
      />
      {currentTerm && (
        <InputRightElement width="28px">
          <IconButton
            icon={<CloseIcon boxSize={2} />}
            size="xs"
            variant="ghost"
            color="gray.400"
            _hover={{ color: "gray.600", bg: "transparent" }}
            aria-label="Clear search"
            onClick={handleClear}
            h="20px"
            w="20px"
            minW="20px"
          />
        </InputRightElement>
      )}
    </InputGroup>
  );
};

export default SearchCompo;
