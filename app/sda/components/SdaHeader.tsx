'use client';

import { HStack, Image, Text } from '@chakra-ui/react';

const STEPS = ['Recipient', 'Deposit'] as const;

interface SdaHeaderProps {
  activeIndex: number;
  onStepChange: (index: number) => void;
}

export function SdaHeader({ activeIndex, onStepChange }: SdaHeaderProps) {
  return (
    <HStack
      alignItems={'center'}
      justifyContent={'flex-start'}
      h={'30px'}
      gap={0}
      padding={'12px 0'}
      boxSizing={'content-box'}
    >
      <Image
        src={'/images/app_icon_192.png'}
        alt="wheelx logo"
        w={'24px'}
        h={'24px'}
        borderRadius={'full'}
        marginRight={'5px'}
      />
      <Text
        fontSize={['12px', '14px', '16px']}
        color={'txt-light'}
        marginRight={'5px'}
        fontWeight={'bold'}
      >
        Smart Deposit
      </Text>
      <Text fontSize={['10px', '12px', '14px']} color={'txt-weak'} flex={1}>
        Demo
      </Text>
      <HStack
        gap={0}
        h={'28px'}
        borderRadius={'28px'}
        border={'1px solid #BBBBBB'}
        padding={'0 5px'}
      >
        {STEPS.map((item, index) => (
          <HStack
            key={index}
            gap={0}
            h={'20px'}
            padding={'0 5px'}
            borderRadius={'20px'}
            background={activeIndex === index ? '#0F40F5' : 'transparent'}
            cursor={index === 0 ? 'pointer' : 'default'}
            onClick={() => { if (index === 0) onStepChange(index); }}
          >
            <Text
              w={'14px'}
              h={'14px'}
              borderRadius={'14px'}
              backgroundColor={'#7F83F7'}
              fontSize={'10px'}
              textAlign={'center'}
              lineHeight={'14px'}
              marginRight={'4px'}
              color={'#fff'}
            >
              {index + 1}
            </Text>
            <Text
              color={activeIndex === index ? '#fff' : '#000'}
              fontSize={['10px', '12px', '14px']}
            >
              {item}
            </Text>
          </HStack>
        ))}
      </HStack>
    </HStack>
  );
}
