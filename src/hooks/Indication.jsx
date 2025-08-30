// Indication.js
import React, { useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useSelector, useDispatch } from 'react-redux';
import { clearMessage } from '../redux/slices/common';

const Indication = () => {
  const toast = useToast();
  const dispatch = useDispatch();

  const { message, status, description } = useSelector(state => state.common);

  useEffect(() => {
    if (message && status) {
      toast({
        title: message,
        description: description,
        status: status,
        duration: 5000,
        isClosable: true,
      });

      dispatch(clearMessage());
    }
  }, [message, status, description, toast, dispatch]);

  return null;
};

export default Indication;
