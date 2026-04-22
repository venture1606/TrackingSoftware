import React, { useState } from 'react';
import {
  InputGroup,
  InputLeftElement,
  Input,
  Icon,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

const SearchCompo = ({ placeholder = "Search...", onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <InputGroup size="sm" width={{ base: "100%", md: "240px" }} flexShrink={0}>
      <InputLeftElement pointerEvents="none">
        <SearchIcon color="gray.400" />
      </InputLeftElement>
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleSearch}
        borderRadius="full"
        bg="white"
        _focus={{
          borderColor: 'blue.400',
          boxShadow: '0 0 0 1px #3182ce',
        }}
      />
    </InputGroup>
  );
};

export default SearchCompo;
