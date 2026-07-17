'use client'

import { Box, HStack, VStack } from "@chakra-ui/react"

const resultBoxStyle = {
  position: 'absolute',
  boxShadow: '0 0 6px 0px rgba(0,0,0,.4)',
  border: '1px solid #CECECE',
  backgroundColor: '#fff',
  gap: 0,
  color: 'txt-normal',
  bottom: '15px',
  left: '15px',
  right: '15px',
  padding: '8px 12px 8px 0',
  fontSize: '12px',
  justifyContent: 'flex-start',
  zIndex: 10
}
const resultIconStyle = {
  width: '50px',
  h: '50px',
  marginRight: '10px',
  background: 'url(/images/result_icon.png) no-repeat 0 0/50px'
}
const resultTitleStyle = {
  fontWeight: 'bold',
  marginBottom: '3px'
}
const resultContStyle = {
  gap: 0,
  alignItems: 'flex-start',
  flex: 1
}

interface SdaResultProp {
  value: string
}

const SdaResult = (props: SdaResultProp) => {
  const { value } = props;

  // Map OrderStatus / legacy values to display states
  const isInProgress = value === 'set' || value === 'Open';
  const isSuccess = value === 'sueecss' || value === 'Filled';
  const isFailed = value === 'fail' || value === 'Failed';
  const isRefund = value === 'back' || value === 'Refund';

  if (isInProgress) {
    return (
      <HStack {...resultBoxStyle}>
        <Box
          {...resultIconStyle}
          backgroundPosition={'0 0'}
        ></Box>
        <VStack {...resultContStyle}>
          <Box {...resultTitleStyle}>Deposit in progress</Box>
          <Box color={'txt-weak'}>Please wait for blockchain confirmation</Box>
        </VStack>
      </HStack>
    );
  }

  if (isSuccess) {
    return (
      <HStack {...resultBoxStyle}>
        <Box
          {...resultIconStyle}
          backgroundPosition={'0 -50px'}
        ></Box>
        <VStack {...resultContStyle}>
          <Box {...resultTitleStyle}>Deposit successful</Box>
          <Box color={'txt-weak'}>The funds have been credited to your account</Box>
        </VStack>
      </HStack>
    );
  }

  if (isFailed) {
    return (
      <HStack {...resultBoxStyle}>
        <Box
          {...resultIconStyle}
          backgroundPosition={'0 -100px'}
        ></Box>
        <VStack {...resultContStyle}>
          <Box {...resultTitleStyle}>Deposit failed</Box>
          <Box color={'txt-weak'}>Please contact support for assistance</Box>
        </VStack>
      </HStack>
    );
  }

  if (isRefund) {
    return (
      <HStack {...resultBoxStyle}>
        <Box
          {...resultIconStyle}
          backgroundPosition={'0 -150px'}
        ></Box>
        <VStack {...resultContStyle}>
          <Box {...resultTitleStyle}>Funds Returned</Box>
          <Box color={'txt-weak'}>The funds have been returned to the sending address</Box>
        </VStack>
      </HStack>
    );
  }

  return null;
};

export default SdaResult