import React, { useState } from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
  Icon,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

const FilterIcon = (props) => (
  <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </Icon>
);

const FilterCompo = ({ filters = [], onFilterChange }) => {
  const [selectedFilter, setSelectedFilter] = useState('All');

  const handleSelect = (filter) => {
    setSelectedFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  return (
    <Menu>
      <MenuButton 
        as={Button} 
        rightIcon={<ChevronDownIcon />} 
        variant="outline"
        size="sm"
        fontSize="xs"
        colorScheme="gray"
      >
        <FilterIcon mr={2} />
        {selectedFilter}
      </MenuButton>
      <MenuList>
        <MenuItem onClick={() => handleSelect('All')}>All</MenuItem>
        <MenuDivider />
        {filters.map((filter) => (
          <MenuItem key={filter} onClick={() => handleSelect(filter)}>
            {filter}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default FilterCompo;
