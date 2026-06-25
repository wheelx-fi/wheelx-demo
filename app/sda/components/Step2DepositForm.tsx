'use client';

import {
  Box,
  HStack,
  VStack,
  //   Text,
  Image,
  Button,
  Center,
  Spinner,
} from '@chakra-ui/react';
import type { ListCollection } from '@chakra-ui/react';
import type { ChainInfo } from '../../api/types';
import { PiCopy } from 'react-icons/pi';
import { RiErrorWarningFill } from 'react-icons/ri';
import SdaResult from '@/components/Sda/Result';
import { ChainSelectDropdown } from './ChainSelectDropdown';
import { TokenSelectDropdown } from './TokenSelectDropdown';
import { TransactionInfoBox } from './TransactionInfoBox';
import type { EnrichedToken } from './Step1ReceiveForm';

interface Step2DepositFormProps {
  isLoading: boolean;
  chainCollection: ListCollection<{ label: string; value: string }> | null;
  chainsMap: Record<number, ChainInfo>;
  effectiveFromChainId: number | null;
  onFromChainChange: (e: { value: string[] }) => void;
  fromSelectedChain: ChainInfo | null;
  fromTokenCollection: ListCollection<{ label: string; value: string; address: string | undefined; decimals: number }> | null;
  displayFromTokenKey: string | null;
  onFromTokenChange: (e: { value: string[] }) => void;
  fromSelectedToken: EnrichedToken | null;
  fromEnrichedTokens: EnrichedToken[];
  quoteLoading: boolean;
  quoteError: string | null;
  qrCodeUrl: string;
  displayAddress: string;
  copied: boolean;
  onCopyAddress: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  txInfo: { priceImpact: string; slippage: string; estimatedTime: string } | null;
  orderStatus: string | undefined;
  showOrderResult: boolean;
  showDemoResult: boolean;
  chainIconSize: { w: string; h: string };
  tokenIconSize: { w: string; h: string };
}

export function Step2DepositForm({
  isLoading,
  chainCollection,
  chainsMap,
  effectiveFromChainId,
  onFromChainChange,
  fromSelectedChain,
  fromTokenCollection,
  displayFromTokenKey,
  onFromTokenChange,
  fromSelectedToken,
  fromEnrichedTokens,
  quoteLoading,
  quoteError,
  qrCodeUrl,
  displayAddress,
  copied,
  onCopyAddress,
  isExpanded,
  onToggleExpand,
  txInfo,
  orderStatus,
  showOrderResult,
  showDemoResult,
  chainIconSize,
  tokenIconSize,
}: Step2DepositFormProps) {
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
          value={effectiveFromChainId ? [effectiveFromChainId.toString()] : []}
          onValueChange={onFromChainChange}
          label="From Networks"
          selectedItem={fromSelectedChain ? { chain_icon: fromSelectedChain.chain_icon, name: fromSelectedChain.name } : null}
          chainsMap={chainsMap}
          iconSize={chainIconSize}
        />
        <TokenSelectDropdown
          collection={fromTokenCollection!}
          value={displayFromTokenKey ? [displayFromTokenKey] : []}
          onValueChange={onFromTokenChange}
          label="Tokens"
          selectedItem={fromSelectedToken}
          tokensList={fromEnrichedTokens}
          resetKey={effectiveFromChainId ?? 'loading'}
          iconSize={tokenIconSize}
        />
      </HStack>

      <VStack>
        {/* Quote loading spinner */}
        {quoteLoading && (
          <Center py={2}>
            <Spinner size="sm" color={'blue.500'} />
          </Center>
        )}

        {/* Quote error */}
        {quoteError && !quoteLoading && (
          <Box
            w={'100%'}
            color={'red.500'}
            fontSize={'12px'}
            textAlign={'center'}
            padding={'4px 0'}
            marginBottom={'8px'}
          >
            {quoteError}
          </Box>
        )}

        <Box>Scan the QR code or copy the address to transfer</Box>

        {/* QR Code Card */}
        <Box
          w={'160px'}
          h={'160px'}
          border={'1px solid #BBBBBB'}
          backgroundColor={'#fff'}
          borderRadius={'5px'}
          padding={'10px'}
          position={'relative'}
        >
          {qrCodeUrl ? (
            <Image src={qrCodeUrl} alt="QR Code" w={'140px'} h={'140px'} />
          ) : (
            <Box w={'140px'} h={'140px'} />
          )}
          <Box
            position={'absolute'}
            w={'36px'}
            h={'36px'}
            borderRadius={'36px'}
            backgroundColor={'#fff'}
            left={'50%'}
            top={'50%'}
            transform={'translate3d(-50%,-50%,0)'}
          >
            <Image
              src={fromSelectedChain?.chain_icon || '/images/default-token-icon.png'}
              alt="From chain"
              w={'24px'}
              h={'24px'}
              position={'absolute'}
              left={'50%'}
              top={'50%'}
              transform={'translate3d(-50%,-50%,0)'}
              borderRadius={'full'}
            />
            <Image
              src={fromSelectedToken?.logo || '/images/default-token-icon.png'}
              alt="From token"
              w={'10px'}
              h={'10px'}
              position={'absolute'}
              bottom={'5px'}
              right={'5px'}
              borderRadius={'full'}
            />
          </Box>
        </Box>

        <Box color={'txt-normal'} padding={'4px 0'}>
          {displayAddress || 'Waiting for deposit address...'}
        </Box>

        <Button
          marginBottom={'15px'}
          padding={'0 20px'}
          h={'30px'}
          fontSize={'12px'}
          borderRadius={'30px'}
          onClick={onCopyAddress}
          disabled={!displayAddress}
        >
          <PiCopy style={{ width: '14px', height: '14px' }} />
          {copied ? 'Copied!' : 'Copy Address'}
        </Button>

        {/* Warning */}
        <HStack
          gap={0}
          padding={'8px 10px'}
          backgroundColor={'rgba(252,202,0,.13)'}
          borderRadius={'5px'}
          marginBottom={'5px'}
        >
          <RiErrorWarningFill
            style={{ width: '20px', height: '20px', color: 'FCCA00', flexShrink: 0 }}
          />
          <Box lineHeight={'1.2'} paddingLeft={'10px'}>
            Sending the wrong token or from a different network may result in a loss of funds.
          </Box>
        </HStack>

        {/* Transaction Info */}
        <TransactionInfoBox
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
          loading={quoteLoading}
          priceImpact={txInfo?.priceImpact ?? '-'}
          slippage={txInfo?.slippage ?? '-'}
          estimatedTime={txInfo?.estimatedTime ?? '-'}
        />
      </VStack>

      {/* Order Result */}
      {showOrderResult && orderStatus ? (
        <SdaResult value={orderStatus} />
      ) : showDemoResult ? (
        <SdaResult value={'set'} />
      ) : null}
    </Box>
  );
}
