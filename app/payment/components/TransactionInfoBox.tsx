'use client';

import {
  Box,
  HStack,
  // VStack,
  // Text,
  // Select,
  Button,
} from '@chakra-ui/react';
import { TiArrowSortedDown } from 'react-icons/ti';
import { AiOutlineDollarCircle, AiOutlinePercentage } from 'react-icons/ai';
import { IoMdTime } from 'react-icons/io';
import { LuInfo } from 'react-icons/lu';
import { ToggleTip } from '@/components/ui/ToggleTip';

interface TransactionInfoBoxProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  loading: boolean;
  priceImpact: string;
  slippage: string;
  estimatedTime: string;
}

export function TransactionInfoBox({
  isExpanded,
  onToggleExpand,
  loading,
  priceImpact,
  slippage,
  estimatedTime,
}: TransactionInfoBoxProps) {
  return (
    <Box
      w={'100%'}
      color={'txt-weak'}
      padding={'13px 12px'}
      backgroundColor={'rgba(239,239,239,.59)'}
      borderRadius={'6px'}
      fontSize={'12px'}
      marginBottom={'20px'}
    >
      <HStack justifyContent={'space-between'} gap={0} marginBottom={!isExpanded ? '0' : '6px'}>
        <HStack gap={0}>
          <Box color={'txt-light'} marginRight={'4px'}>
            <AiOutlineDollarCircle />
          </Box>
          Price impact
        </HStack>
        <HStack gap={0}>
          <Box marginRight={'5px'}>
            {loading ? 'Loading...' : priceImpact || '-'}
          </Box>
          <ToggleTip content="The total fee impact including bridge fee, gas fee, and swap fee.">
            <Button variant="ghost" h="22px" minW={0}>
              <LuInfo style={{ width: '14px', height: '14px' }} />
            </Button>
          </ToggleTip>
          <Box
            cursor="pointer"
            w={'14px'}
            h={'14px'}
            onClick={onToggleExpand}
            transition="transform 0.2s"
            transform={isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}
            marginLeft={'6px'}
          >
            <TiArrowSortedDown style={{ width: '14px', height: '14px' }} />
          </Box>
        </HStack>
      </HStack>

      {isExpanded && (
        <>
          <HStack justifyContent={'space-between'} gap={0} marginBottom={'6px'}>
            <HStack gap={0}>
              <Box color={'txt-light'} marginRight={'4px'}>
                <AiOutlinePercentage />
              </Box>
              Slippage
            </HStack>
            <HStack gap={0}>
              <Box marginRight={'5px'}>
                {loading ? 'Loading...' : slippage || '-'}
              </Box>
              <ToggleTip content="Slippage tolerance for this quote.">
                <Button variant="ghost" h="22px" minW={0}>
                  <LuInfo style={{ width: '14px', height: '14px' }} />
                </Button>
              </ToggleTip>
              <Box w={'14px'} h={'14px'} marginLeft={'6px'} />
            </HStack>
          </HStack>
          <HStack justifyContent={'space-between'} gap={0} >
            <HStack gap={0}>
              <Box color={'txt-light'} marginRight={'4px'}>
                <IoMdTime />
              </Box>
              Est. Time
            </HStack>
            <HStack>
              <Box h="22px">
                {loading ? 'Loading...' : estimatedTime || '-'}
              </Box>
              <Box w={'14px'} h={'14px'} marginLeft={'6px'} />
            </HStack>
          </HStack>
        </>
      )}
    </Box>
  );
}
