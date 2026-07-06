'use client';

import { useState } from 'react';
import {
  Box,
  HStack,
  VStack,
  //   Text,
  Image,
  Button,
  Center,
  Spinner,
  Dialog,
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
import { ToggleTip } from '@/components/ui/ToggleTip';
import { LuInfo } from 'react-icons/lu';
import { createToaster, Toaster, Toast } from '@chakra-ui/react';

const toaster = createToaster({
  placement: 'top-end',
  duration: 2000,
});

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
  receiveChainIsTron: boolean;
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
  receiveChainIsTron,
  chainIconSize,
  tokenIconSize,
}: Step2DepositFormProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const tokenSymbol = fromSelectedToken?.symbol ?? '';
  const chainName = fromSelectedChain?.name ?? '';

  const handleCopyConfirmed = () => {
    onCopyAddress();
    setDialogOpen(false);
    toaster.create({
      title: 'Copied!',
      type: 'success',
    });
  };

  if (isLoading) {
    return (
      <Center py={'40px'}>
        <Spinner size="md" color={'blue.500'} />
      </Center>
    );
  }

  return (
    <Box>
      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root>
            <Toast.Title>{toast.title}</Toast.Title>
            <Toast.CloseTrigger />
          </Toast.Root>
        )}
      </Toaster>
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

        <HStack>
          <Box>Scan the QR code or copy the address to transfer</Box>
          <ToggleTip
            content="This is a randomly generated, one-time-use deposit address. Once funds are sent using the selected network and token, WheelX will automatically identify and credit the deposit to your account or receiving address."
            contentProps={{ maxWidth: '280px' }}
          >
            <Button variant="ghost" minW={0} h={'14px'}>
              <LuInfo style={{ width: '14px', height: '14px' }} />
            </Button>
          </ToggleTip>
        </HStack>

        {/* Minimum deposit hint (Tron receive network only) */}
        {receiveChainIsTron && (
          <Box
            w={'100%'}
            padding={'6px 10px'}
            // backgroundColor={'rgba(252,202,0,.13)'}
            borderRadius={'5px'}
            fontSize={'12px'}
            textAlign={'center'}
            marginBottom={'8px'}
            color={'#666'}
          >
            (Min: $3)
          </Box>
        )}

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
          onClick={() => setDialogOpen(true)}
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
            {receiveChainIsTron && <>A minimum deposit of <strong style={{ color: '#0F40F5' }}>$3</strong> is required for the Tron network. </>}Sending the wrong token or from a different network may result in a loss of funds.By continuing, you agree to the <a href='https://wheelx.fi/legal/disclaimer' target='_blank' style={{ color: '#8887cb' }}>Terms of Use and Risk Disclosure</a>
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

      {/* Copy Address Confirmation Dialog */}
      <Dialog.Root
        open={dialogOpen}
        onOpenChange={({ open }) => setDialogOpen(open)}
        placement="center"
        motionPreset="scale"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW={['90vw', '460px', "460px"]}>
            <Dialog.Body padding="24px" fontSize="14px" lineHeight="1.6">
              Please double-check that you are sending {receiveChainIsTron ? <>at least <strong style={{ color: '#0F40F5' }}>$3</strong> worth of </> : null}<strong style={{ color: '#0F40F5' }}>{tokenSymbol}</strong> on <strong style={{ color: '#0F40F5' }}>{chainName}</strong>. Wrong token or network may result in loss of funds.
            </Dialog.Body>
            <Dialog.Footer padding="0 24px 20px 24px">
              <Button
                w="100%"
                h="36px"
                fontSize="14px"
                borderRadius="8px"
                onClick={handleCopyConfirmed}
              >
                Confirmed
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Order Result */}
      {showOrderResult && orderStatus ? (
        <SdaResult value={orderStatus} />
      ) : showDemoResult ? (
        <SdaResult value={'set'} />
      ) : null}
    </Box>
  );
}
