'use client';

import { Flex, Heading, HStack, Image } from '@chakra-ui/react';
// import { useWallet } from '@/app/hooks/useWallet';

const Header = () => {
  // const { isConnected, shortAddress, balance, symbol, openConnectModal, disconnectWallet } =
  //   useWallet();

  return (
    <Flex
      as="header"
      bg="#1a1f35"
      borderBottom="1px solid #2d3555"
      justify="space-between"
      align="center"
      padding={'15px 30px'}
    >
      <HStack gap={0}>
        <Image
          src={'/wheelx.svg'}
          alt="WheelX"
          w="36px"
          h="36px"
          marginRight={'10px'}
        />
        <Heading
          color="white"
          fontSize={['16px', '20px', '24px']}
          lineHeight={'1.5'}
        >
          WheelX Widget Demo
        </Heading>
      </HStack>
      <HStack gap={'10px'}>
        <a
          href="https://github.com/wheelx-fi/wheelx-demo"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#a0aec0', textDecoration: 'none', fontSize: '14px' }}
        >
          GitHub
        </a>
        {/* {isConnected ? (
          <HStack gap={'10px'}>
            <Text
              color="#a0aec0"
              fontSize="14px"
            >
              {balance} {symbol}
            </Text>
            <Button
              size="sm"
              variant="outline"
              color="#a0aec0"
              borderColor="#2d3555"
              _hover={{ bg: '#2d3555' }}
              onClick={disconnectWallet}
            >
              {shortAddress}
            </Button>
          </HStack>
        ) : (
          <Button
            size="sm"
            bg="#0F40F5"
            color="white"
            _hover={{ bg: '#0d35cc' }}
            onClick={openConnectModal}
          >
            Connect Wallet
          </Button>
        )} */}
      </HStack>
    </Flex>
  );
};
export default Header;
