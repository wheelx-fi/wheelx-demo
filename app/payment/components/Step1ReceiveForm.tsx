'use client';

import {
  Box,
  HStack,
  VStack,
  Input,
  Button,
  Center,
  Spinner,
} from '@chakra-ui/react';
import type { ListCollection } from '@chakra-ui/react';
import type { ChainInfo } from '../../api/types';
import { HiArrowLongRight } from 'react-icons/hi2';
import { ChainSelectDropdown } from './ChainSelectDropdown';
import { TokenSelectDropdown } from './TokenSelectDropdown';
import { ToggleTip } from '@/components/ui/ToggleTip';
import { LuInfo } from 'react-icons/lu';

export interface EnrichedToken {
  symbol: string;
  native: boolean;
  logo: string;
  name: string;
  address: string | undefined;
  decimals: number;
  categories?: string[];
}

interface Step1ReceiveFormProps {
  isLoading: boolean;
  effectiveChainId: number | null;
  onChainChange: (e: { value: string[] }) => void;
  selectedChain: ChainInfo | null;
  chainCollection: ListCollection<{ label: string; value: string }> | null;
  chainsMap: Record<number, ChainInfo>;
  tokenCollection: ListCollection<{ label: string; value: string; address: string | undefined; decimals: number }> | null;
  displayTokenKey: string | null;
  onTokenChange: (e: { value: string[] }) => void;
  selectedToken: EnrichedToken | null;
  enrichedTokens: EnrichedToken[];
  receiveAddress: string;
  onAddressChange: (value: string) => void;
  addressError: string | null;
  amount: string;
  onAmountChange: (value: string) => void;
  amountError: string | null;
  onNext: () => void;
  chainIconSize: { w: string; h: string };
  tokenIconSize: { w: string; h: string };
}

export function Step1ReceiveForm({
  isLoading,
  effectiveChainId,
  onChainChange,
  selectedChain,
  chainCollection,
  chainsMap,
  tokenCollection,
  displayTokenKey,
  onTokenChange,
  selectedToken,
  enrichedTokens,
  receiveAddress,
  onAddressChange,
  addressError,
  amount,
  onAmountChange,
  amountError,
  onNext,
  chainIconSize,
  tokenIconSize,
}: Step1ReceiveFormProps) {
  if (isLoading) {
    return (
      <Center py={'40px'}>
        <Spinner size="md" color={'blue.500'} />
      </Center>
    );
  }

  return (
    <Box>
      <HStack alignItems="flex-start" gap={'12px'} marginBottom={'15px'}>
        <ChainSelectDropdown
          collection={chainCollection!}
          value={effectiveChainId ? [effectiveChainId.toString()] : []}
          onValueChange={onChainChange}
          label="Receive Networks"
          required
          selectedItem={selectedChain ? { chain_icon: selectedChain.chain_icon, name: selectedChain.name } : null}
          chainsMap={chainsMap}
          iconSize={chainIconSize}
        />
        <TokenSelectDropdown
          collection={tokenCollection!}
          value={displayTokenKey ? [displayTokenKey] : []}
          onValueChange={onTokenChange}
          label="Receive Tokens"
          required
          selectedItem={selectedToken}
          tokensList={enrichedTokens}
          resetKey={effectiveChainId ?? 'loading'}
          iconSize={tokenIconSize}
        />
      </HStack>
      <HStack alignItems="flex-start" gap={'12px'} marginBottom={amountError ? '5px' : '15px'}>
        <VStack flex={1} gap={0}>
          <HStack
            fontSize={'12px'}
            color={'txt-weak'}
            marginBottom={'5px'}
            whiteSpace={'nowrap'}
            w={'100%'}
            gap={'2px'}
          >
            Receive Amount <ToggleTip
              content="Enter the amount you want to receive. The sender will cover the network gas fee and transaction fee, so you'll receive the full amount with no deductions."
              contentProps={{ maxWidth: '280px' }}
            >
              <Button variant="ghost" minW={0} h={'12px'}>
                <LuInfo style={{ width: '12px', height: '12px' }} />
              </Button>
            </ToggleTip>
            {/* <span style={{ color: 'red' }}>*</span> */}
          </HStack>
          <Input
            type="text"
            paddingLeft={'10px'}
            color="txt-normal"
            value={amount}
            onChange={(e) => {
              // Allow only digits and a single decimal point
              const sanitized = e.target.value
                .replace(/[^\d.]/g, '')
                .replace(/(\..*)\./g, '$1');
              onAmountChange(sanitized);
            }}
            borderColor={amountError ? 'red.500' : undefined}
          />
        </VStack>
      </HStack>
      <HStack alignItems="flex-start" gap={'12px'} marginBottom={addressError ? '5px' : '15px'}>
        <VStack flex={1} gap={0}>
          <Box
            fontSize={'12px'}
            color={'txt-weak'}
            marginBottom={'5px'}
            whiteSpace={'nowrap'}
            w={'100%'}
          >
            Receive Address
            <span style={{ color: 'red' }}>*</span>
          </Box>
          <Input
            type="text"
            paddingLeft={'10px'}
            color="txt-normal"
            value={receiveAddress}
            onChange={(e) => onAddressChange(e.target.value)}
            borderColor={addressError ? 'red.500' : undefined}
          />
        </VStack>
      </HStack>
      {addressError && (
        <Box color={'red.500'} fontSize={'11px'} marginBottom={'15px'} paddingLeft={'2px'}>
          {addressError}
        </Box>
      )}

      {amountError && (
        <Box color={'red.500'} fontSize={'11px'} marginBottom={'15px'} paddingLeft={'2px'}>
          {amountError}
        </Box>
      )}

      <HStack justifyContent={'flex-end'} paddingBottom={'15px'}>
        <Button
          w={'100px'}
          h={'30px'}
          fontSize={'12px'}
          lineHeight={'30px'}
          borderRadius={'10px'}
          position={'relative'}
          bgColor={'#0F40F4'}
          color={'#fff'}
          onClick={onNext}
        >
          NEXT
          <HiArrowLongRight />
        </Button>
      </HStack>
    </Box>
  );
}
