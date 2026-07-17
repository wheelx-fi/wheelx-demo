'use client';

import { Flex, Heading, HStack, Image, Box, Button, Menu } from '@chakra-ui/react';
import { LuChevronDown } from 'react-icons/lu';
// import { useWallet } from '@/app/hooks/useWallet';

const links = [
  { label: 'GitHub', href: 'https://github.com/wheelx-fi/wheelx-demo' },
  { label: 'Demo Guide', href: 'https://app.supademo.com/demo/cmreaz2ke01chzy0j3auy6hjl' },
  { label: 'API Integration', href: 'https://docs.wheelx.fi/overview/features/wheelx-payment' },
  { label: 'Contact Us', href: 'mailto:support@wheelx.fi' },
];

const linkStyle = { color: '#a0aec0', textDecoration: 'none', fontSize: '14px' };

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
          WheelX Payment Demo
        </Heading>
      </HStack>

      {/* ── Desktop: all links in a row ── */}
      <HStack gap={'14px'} display={{ base: 'none', md: 'flex' }}>
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith('mailto:') ? undefined : '_blank'}
            rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
            style={linkStyle}
          >
            {link.label}
          </a>
        ))}
      </HStack>

      {/* ── Mobile: "More" dropdown ── */}
      <Box display={{ base: 'block', md: 'none' }}>
        <Menu.Root>
          <Menu.Trigger asChild>
            <Button variant="ghost" color="#a0aec0" size="sm" outline={'none'} _hover={{ bg: 'transparent' }} _active={{ bg: 'transparent' }} _expanded={{ bg: 'transparent' }}>
              More
              <LuChevronDown />
            </Button>
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content minW="160px" bg="#1a1f35" borderColor="#2d3555">
              {links.map((link) => (
                <Menu.Item
                  key={link.label}
                  value={link.label}
                  color="#fff"
                  fontSize="14px"
                  // _hover={{ bg: '#2d3555' }}
                  cursor="pointer"
                  asChild
                >
                  <a
                    href={link.href}
                    target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    style={{ color: '#fff', textDecoration: 'none', display: 'block', width: '100%', padding: '10px 15px' }}
                  >
                    {link.label}
                  </a>
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      </Box>
    </Flex>
  );
};
export default Header;
