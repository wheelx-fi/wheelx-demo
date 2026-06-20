'use client';

import {
  Box,
  HStack,
  Image,
  Text,
  Portal,
  Select,
  createListCollection,
  Spinner,
  Center,
  VStack,
  Input,
  Button,
} from '@chakra-ui/react';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLoadChainsData } from '../components/ChainsDataLoader';
import { useChainsStore } from '../store/chainsStore';
import type { ChainInfo } from '../api/types';
import { HiArrowLongRight } from 'react-icons/hi2';
import { PiCopy } from "react-icons/pi";
import { AiOutlineDollarCircle } from "react-icons/ai";
import { ToggleTip } from "@/components/ui/ToggleTip"
import { LuInfo } from "react-icons/lu"
import { AiOutlinePercentage } from "react-icons/ai";
import { IoMdTime } from "react-icons/io";
import { RiErrorWarningFill } from "react-icons/ri";
import SdaResult from '@/components/Sda/Result';
import QRCode from 'qrcode';
import { useSDAStore } from '../store/sdaStore';

// ── Component ────────────────────────────────────────────────────────────
const SDAPage = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [receiveAddress, setReceiveAddress] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useLoadChainsData();
  const { chains, tokens: apiTokens } = useChainsStore();
  const { saveFormData } = useSDAStore();

  // ── Filtered chains (exclude testnets) ────────────────────────────
  const filteredChains: ChainInfo[] = useMemo(
    () => (chains || []).filter((c) => !c.is_testnet),
    [chains],
  );

  // Chain lookup map: chain_id → ChainInfo
  const chainsMap = useMemo(
    () => Object.fromEntries(filteredChains.map((c) => [c.chain_id, c])),
    [filteredChains],
  );

  // ── Selected state + computed effective values ──────────────────
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [selectedTokenKey, setSelectedTokenKey] = useState<string | null>(null);

  // Second pair: "From" selects
  const [fromChainId, setFromChainId] = useState<number | null>(null);
  const [fromTokenKey, setFromTokenKey] = useState<string | null>(null);

  // ── QR Code generation ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    if (!receiveAddress) {
      Promise.resolve().then(() => {
        if (!cancelled) setQrCodeUrl('');
      });
      return () => { cancelled = true; };
    }
    QRCode.toDataURL(receiveAddress, {
      width: 140,
      margin: 0,
      color: { dark: '#000000', light: '#FFFFFFFF' },
    }).then((url) => {
      if (!cancelled) setQrCodeUrl(url);
    }).catch(() => {
      if (!cancelled) setQrCodeUrl('');
    });
    return () => { cancelled = true; };
  }, [receiveAddress]);

  // Default to first chain
  const effectiveChainId = selectedChainId ?? filteredChains[0]?.chain_id ?? null;
  const effectiveFromChainId = fromChainId ?? filteredChains[0]?.chain_id ?? null;

  // ── Tokens for selected chain (all from API, no whitelist) ────────
  const enrichedTokens = useMemo(() => {
    if (!effectiveChainId || !apiTokens) return [];
    const seen = new Set<string>();
    return apiTokens
      .filter((t) => t.chain_id === effectiveChainId)
      .filter((t) => {
        const key = t.address?.toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((t) => ({
        symbol: t.symbol,
        native: t.tags?.includes('native' as never) ?? false,
        logo: t.logo || '/images/default-token-icon.png',
        name: t.name ?? t.symbol,
        address: t.address,
        decimals: t.decimals,
      }));
  }, [effectiveChainId, apiTokens]);

  // Log tokens when chain switches (debug)
  useEffect(() => {
    if (!effectiveChainId || !enrichedTokens.length) return;
    const chain = chainsMap[effectiveChainId];
    console.log(
      `[${chain?.name ?? effectiveChainId}] Tokens:`,
      enrichedTokens.map((t) => ({ symbol: t.symbol, address: t.address })),
    );
  }, [effectiveChainId, enrichedTokens, chainsMap]);

  // Default token: native first, then first available
  const effectiveTokenKey = useMemo(() => {
    if (!effectiveChainId || enrichedTokens.length === 0) return null;
    const native = enrichedTokens.find((t) => t.native);
    const defaultTok = native ?? enrichedTokens[0];
    return `${effectiveChainId}:${defaultTok.symbol}`;
  }, [effectiveChainId, enrichedTokens]);

  const displayTokenKey = selectedTokenKey ?? effectiveTokenKey;

  // ── From-chain tokens ─────────────────────────────────────────────
  const fromEnrichedTokens = useMemo(() => {
    if (!effectiveFromChainId || !apiTokens) return [];
    const seen = new Set<string>();
    return apiTokens
      .filter((t) => t.chain_id === effectiveFromChainId)
      .filter((t) => {
        const key = t.address?.toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((t) => ({
        symbol: t.symbol,
        native: t.tags?.includes('native' as never) ?? false,
        logo: t.logo || '/images/default-token-icon.png',
        name: t.name ?? t.symbol,
        address: t.address,
        decimals: t.decimals,
      }));
  }, [effectiveFromChainId, apiTokens]);

  const effectiveFromTokenKey = useMemo(() => {
    if (!effectiveFromChainId || fromEnrichedTokens.length === 0) return null;
    const native = fromEnrichedTokens.find((t) => t.native);
    const defaultTok = native ?? fromEnrichedTokens[0];
    return `${effectiveFromChainId}:${defaultTok.symbol}`;
  }, [effectiveFromChainId, fromEnrichedTokens]);

  const displayFromTokenKey = fromTokenKey ?? effectiveFromTokenKey;

  // ── From collections ──────────────────────────────────────────────
  const fromTokenCollection = useMemo(() => {
    if (!fromEnrichedTokens.length) return null;
    return createListCollection({
      items: fromEnrichedTokens.map((t) => ({
        label: t.symbol,
        value: `${effectiveFromChainId}:${t.symbol}`,
      })),
    });
  }, [fromEnrichedTokens, effectiveFromChainId]);

  const fromSelectedChain = effectiveFromChainId ? chainsMap[effectiveFromChainId] : null;
  const fromSelectedToken = useMemo(
    () =>
      displayFromTokenKey
        ? fromEnrichedTokens.find(
          (t) => `${effectiveFromChainId}:${t.symbol}` === displayFromTokenKey,
        )
        : null,
    [displayFromTokenKey, fromEnrichedTokens, effectiveFromChainId],
  );

  // ── From handlers ─────────────────────────────────────────────────
  const handleFromChainChange = useCallback((e: { value: string[] }) => {
    const id = Number(e.value[0]);
    setFromChainId(id);
    setFromTokenKey(null);
  }, []);

  const handleFromTokenChange = useCallback((e: { value: string[] }) => {
    setFromTokenKey(e.value[0]);
  }, []);

  // ── Chakra collections ───────────────────────────────────────────
  const chainCollection = useMemo(() => {
    if (!filteredChains.length) return null;
    return createListCollection({
      items: filteredChains.map((c) => ({
        label: c.name,
        value: c.chain_id.toString(),
      })),
    });
  }, [filteredChains]);

  const tokenCollection = useMemo(() => {
    if (!enrichedTokens.length) return null;
    return createListCollection({
      items: enrichedTokens.map((t) => ({
        label: t.symbol,
        address: t.address,
        decimals: t.decimals,
        value: `${effectiveChainId}:${t.symbol}`,
      })),
    });
  }, [enrichedTokens, effectiveChainId]);

  // ── Selected item lookups ────────────────────────────────────────
  const selectedChain = effectiveChainId ? chainsMap[effectiveChainId] : null;
  const selectedToken = useMemo(
    () =>
      displayTokenKey
        ? enrichedTokens.find((t) => `${effectiveChainId}:${t.symbol}` === displayTokenKey)
        : null,
    [displayTokenKey, enrichedTokens, effectiveChainId],
  );

  // ── Handlers ─────────────────────────────────────────────────────
  const handleChainChange = useCallback((e: { value: string[] }) => {
    const id = Number(e.value[0]);
    setSelectedChainId(id);
    setSelectedTokenKey(null); // reset token to default for new chain
  }, []);

  const handleTokenChange = useCallback((e: { value: string[] }) => {
    setSelectedTokenKey(e.value[0]);
  }, []);

  const handleSave = useCallback(() => {
    saveFormData({
      chainName: selectedChain?.name ?? '',
      chainId: selectedChain?.chain_id ?? null,
      chainLogo: selectedChain?.chain_icon ?? '',
      tokenLogo: selectedToken?.logo ?? '',
      tokenName: selectedToken?.name ?? '',
      tokenAddress: selectedToken?.address ?? '',
      receiveAddress,
    });
  }, [selectedChain, selectedToken, receiveAddress, saveFormData]);

  const handleNext = useCallback(() => {
    saveFormData({
      chainName: selectedChain?.name ?? '',
      chainId: selectedChain?.chain_id ?? null,
      chainLogo: selectedChain?.chain_icon ?? '',
      tokenLogo: selectedToken?.logo ?? '',
      tokenName: selectedToken?.name ?? '',
      tokenAddress: selectedToken?.address ?? '',
      receiveAddress,
    });
    setActiveIndex(1);
  }, [selectedChain, selectedToken, receiveAddress, saveFormData]);

  const handleCopyAddress = useCallback(async () => {
    if (!receiveAddress) return;
    try {
      await navigator.clipboard.writeText(receiveAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API not available
    }
  }, [receiveAddress]);

  // ── Loading ──────────────────────────────────────────────────────
  const isLoading = !chains || !chainCollection;

  // ── UI helpers ───────────────────────────────────────────────────
  const chainIconSize = { w: '18px', h: '18px' };
  const tokenIconSize = { w: '18px', h: '18px' };


  {/* ── Step 1: Chain + Token Selects ──────────────────────── */ }
  const step1 = () => {
    if (activeIndex !== 0) {
      return null;
    }
    if (isLoading) {
      return (
        <Center py={'40px'}>
          <Spinner
            size="md"
            color={'blue.500'}
          />
        </Center>
      )
    }
    return (
      <Box>
        <HStack
          alignItems="flex-start"
          gap={'12px'}
          marginBottom={'15px'}
        >
          {/* ── Chain Select ─────────────────────────────────── */}
          <Box flex={1}>
            <Select.Root
              collection={chainCollection!}
              width="100%"
              gap={0}
              value={effectiveChainId ? [effectiveChainId.toString()] : []}
              onValueChange={handleChainChange}
            >
              <Select.HiddenSelect />
              <Select.Label
                fontSize={'13px'}
                color={'txt-weak'}
                marginBottom={'5px'}
              >
                Receive Networks <span style={{ color: 'red' }}>*</span>
              </Select.Label>
              <Select.Control>
                <Select.Trigger>
                  {selectedChain ? (
                    <HStack gap={'8px'}>
                      <Image
                        src={selectedChain.chain_icon || '/images/default-token-icon.png'}
                        alt={selectedChain.name}
                        {...chainIconSize}
                        borderRadius={'full'}
                        marginLeft={'8px'}
                      />
                      <Text fontSize={'13px'}>{selectedChain.name}</Text>
                    </HStack>
                  ) : (
                    <Select.ValueText placeholder="Select network" />
                  )}
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {chainCollection!.items.map((item) => {
                      const chain = chainsMap[Number(item.value)];
                      return (
                        <Select.Item
                          item={item}
                          key={item.value}
                          padding={'5px 0'}
                        >
                          <HStack gap={'8px'}>
                            <Image
                              src={chain?.chain_icon || '/images/default-token-icon.png'}
                              alt={item.label}
                              {...chainIconSize}
                              borderRadius={'full'}
                              marginLeft={'8px'}
                            />
                            <Text fontSize={'13px'}>{item.label}</Text>
                          </HStack>
                          <Select.ItemIndicator marginRight={'8px'} />
                        </Select.Item>
                      );
                    })}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Box>
          {/* ── Token Select ─────────────────────────────────── */}
          <Box flex={1}>
            <Select.Root
              collection={tokenCollection!}
              width="100%"
              gap={0}
              value={displayTokenKey ? [displayTokenKey] : []}
              onValueChange={handleTokenChange}
              key={effectiveChainId}
            >
              <Select.HiddenSelect />
              <Select.Label
                fontSize={'13px'}
                color={'txt-weak'}
                marginBottom={'5px'}
              >
                Receive Tokens <span style={{ color: 'red' }}>*</span>
              </Select.Label>
              <Select.Control>
                <Select.Trigger>
                  {selectedToken ? (
                    <HStack gap={'8px'}>
                      <Image
                        src={selectedToken.logo}
                        alt={selectedToken.symbol}
                        {...tokenIconSize}
                        borderRadius={'full'}
                        marginLeft={'8px'}
                      />
                      <Text fontSize={'13px'}>{selectedToken.symbol}</Text>
                    </HStack>
                  ) : (
                    <Select.ValueText placeholder="Select token" />
                  )}
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator marginRight={'8px'} />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {tokenCollection!.items.map((item) => {
                      const tok = enrichedTokens.find(
                        (t) => `${effectiveChainId}:${t.symbol}` === item.value,
                      );
                      return (
                        <Select.Item
                          item={item}
                          key={item.value + item.address}
                          padding={'5px 0'}
                        >
                          <HStack gap={'8px'}>
                            <Image
                              src={tok!.logo}
                              alt={item.label}
                              {...tokenIconSize}
                              borderRadius={'full'}
                              marginLeft={'8px'}
                            />
                            <Text fontSize={'13px'}>{item.label}</Text>
                          </HStack>
                          <Select.ItemIndicator marginRight={'8px'} />
                        </Select.Item>
                      );
                    })}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Box>
        </HStack>
        <HStack
          alignItems="flex-start"
          gap={'12px'}
          marginBottom={'15px'}
        >
          <VStack
            flex={1}
            gap={0}
          >
            <Box
              fontSize={'12px'}
              color={'txt-weak'}
              marginBottom={'5px'}
              whiteSpace={'nowrap'}
              w={'100%'}
            >
              Minimum Deposit Amount
              <span style={{ color: 'red' }}>*</span>
            </Box>
            <Input
              type="number"
              paddingLeft={'10px'}
              color="txt-normal"
            />
          </VStack>
          <VStack
            flex={1}
            gap={0}
          >
            <Box
              fontSize={'12px'}
              color={'txt-weak'}
              marginBottom={'5px'}
              whiteSpace={'nowrap'}
              w={'100%'}
            >
              Maximum Deposit Amount
            </Box>
            <Input
              type="number"
              paddingLeft={'10px'}
              color="txt-normal"
            />
          </VStack>
        </HStack>
        <HStack
          alignItems="flex-start"
          gap={'12px'}
          marginBottom={'15px'}
        >
          <VStack
            flex={1}
            gap={0}
          >
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
              onChange={(e) => setReceiveAddress(e.target.value)}
            />
          </VStack>
        </HStack>
        <HStack
          justifyContent={'space-between'}
          paddingBottom={'15px'}
        >
          <Button
            w={'100px'}
            bgColor={'transparent'}
            border={'1px solid #101010'}
            color={'#000'}
            h={'30px'}
            fontSize={'12px'}
            borderRadius={'10px'}
            lineHeight={'28px'}
            onClick={handleSave}
          >
            SAVE
          </Button>
          <Button
            w={'100px'}
            h={'30px'}
            fontSize={'12px'}
            lineHeight={'30px'}
            borderRadius={'10px'}
            position={'relative'}
            bgColor={'#0F40F4'}
            color={'#fff'}
            onClick={handleNext}
          >
            NEXT
            <HiArrowLongRight />
          </Button>
        </HStack>
      </Box>
    )
  }

  {/* ── Step 2: From Network + Token Selects ────────────────── */ }
  const step2 = () => {
    if (isLoading && activeIndex === 1) {
      return (
        <Center py={'40px'}>
          <Spinner size="md" color={'blue.500'} />
        </Center>
      );
    }
    if (activeIndex === 1) {
      return (
        <Box>
          <HStack
            alignItems="flex-start"
            gap={'12px'}
            marginBottom={'15px'}
          >
            {/* ── From Chain Select ─────────────────────────────── */}
            <Box flex={1}>
              <Select.Root
                collection={chainCollection!}
                width="100%"
                gap={0}
                value={effectiveFromChainId ? [effectiveFromChainId.toString()] : []}
                onValueChange={handleFromChainChange}
              >
                <Select.HiddenSelect />
                <Select.Label
                  fontSize={'13px'}
                  color={'txt-weak'}
                  marginBottom={'5px'}
                >
                  From Networks
                </Select.Label>
                <Select.Control>
                  <Select.Trigger>
                    {fromSelectedChain ? (
                      <HStack gap={'8px'}>
                        <Image
                          src={fromSelectedChain.chain_icon || '/images/default-token-icon.png'}
                          alt={fromSelectedChain.name}
                          {...chainIconSize}
                          borderRadius={'full'}
                          marginLeft={'8px'}
                        />
                        <Text fontSize={'13px'}>{fromSelectedChain.name}</Text>
                      </HStack>
                    ) : (
                      <Select.ValueText placeholder="Select network" />
                    )}
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator marginRight={'8px'} />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {chainCollection!.items.map((item) => {
                        const chain = chainsMap[Number(item.value)];
                        return (
                          <Select.Item
                            item={item}
                            key={item.value}
                            padding={'5px 0'}
                          >
                            <HStack gap={'8px'}>
                              <Image
                                src={chain?.chain_icon || '/images/default-token-icon.png'}
                                alt={item.label}
                                {...chainIconSize}
                                borderRadius={'full'}
                                marginLeft={'8px'}
                              />
                              <Text fontSize={'13px'}>{item.label}</Text>
                            </HStack>
                            <Select.ItemIndicator marginRight={'8px'} />
                          </Select.Item>
                        );
                      })}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Box>
            {/* ── From Token Select ─────────────────────────────── */}
            <Box flex={1}>
              <Select.Root
                collection={fromTokenCollection!}
                width="100%"
                gap={0}
                value={displayFromTokenKey ? [displayFromTokenKey] : []}
                onValueChange={handleFromTokenChange}
                key={effectiveFromChainId}
              >
                <Select.HiddenSelect />
                <Select.Label
                  fontSize={'13px'}
                  color={'txt-weak'}
                  marginBottom={'5px'}
                >
                  TokensTokens
                </Select.Label>
                <Select.Control>
                  <Select.Trigger>
                    {fromSelectedToken ? (
                      <HStack gap={'8px'}>
                        <Image
                          src={fromSelectedToken.logo}
                          alt={fromSelectedToken.symbol}
                          {...tokenIconSize}
                          borderRadius={'full'}
                          marginLeft={'8px'}
                        />
                        <Text fontSize={'13px'}>{fromSelectedToken.symbol}</Text>
                      </HStack>
                    ) : (
                      <Select.ValueText placeholder="Select token" />
                    )}
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator marginRight={'8px'} />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {fromTokenCollection!.items.map((item) => {
                        const tok = fromEnrichedTokens.find(
                          (t) => `${effectiveFromChainId}:${t.symbol}` === item.value,
                        );
                        return (
                          <Select.Item
                            item={item}
                            key={item.value}
                            padding={'5px 0'}
                          >
                            <HStack gap={'8px'}>
                              <Image
                                src={tok!.logo}
                                alt={item.label}
                                {...tokenIconSize}
                                borderRadius={'full'}
                                marginLeft={'8px'}
                              />
                              <Text fontSize={'13px'}>{item.label}</Text>
                            </HStack>
                            <Select.ItemIndicator marginRight={'8px'} />
                          </Select.Item>
                        );
                      })}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Box>
          </HStack>
          <VStack>
            <Box>Scan the QR code or copy the address to transfer</Box>
            <Box>( Min $6 )</Box>
            <Box
              w={'160px'}
              h={'160px'}
              border={'1px solid #BBBBBB'}
              backgroundColor={'#fff'}
              borderRadius={'5px'}
              padding={'10px'}
            >
              {qrCodeUrl ? (
                <Image src={qrCodeUrl} alt="QR Code" w={'140px'} h={'140px'} />
              ) : (
                <Box w={'140px'} h={'140px'} />
              )}
            </Box>
            <Box color={'txt-normal'} padding={'4px 0'}>{receiveAddress || 'None wallet address'}</Box>
            <Button
              marginBottom={'15px'}
              padding={'0 20px'}
              h={'30px'}
              fontSize={'12px'}
              borderRadius={'30px'}
              onClick={handleCopyAddress}
            ><PiCopy style={{ width: '14px', height: '14px' }} />{copied ? 'Copied!' : 'Copy Address'}</Button>
            <Box
              w={'100%'}
              color={'txt-weak'}
              padding={'13px 12px'}
              backgroundColor={'rgba(239,239,239,.59)'}
              borderRadius={'6px'}
              fontSize={'12px'}
              marginBottom={'20px'}
            >
              <HStack justifyContent={'space-between'} gap={0} marginBottom={'6px'}>
                <HStack gap={0}><Box color={'txt-light'} marginRight={'4px'}><AiOutlineDollarCircle /></Box>Price impact</HStack>
                <HStack gap={0}>
                  <Box marginRight={'5px'}>-2.5%</Box>
                  <ToggleTip content="This is some additional information.">
                    <Button variant="ghost" h="22px" minW={0}>
                      <LuInfo />
                    </Button>
                  </ToggleTip>
                </HStack>
              </HStack>
              <HStack justifyContent={'space-between'} gap={0} marginBottom={'6px'}>
                <HStack gap={0}><Box color={'txt-light'} marginRight={'4px'}><AiOutlinePercentage /></Box>Slippage</HStack>
                <HStack gap={0}>
                  <Box marginRight={'5px'}>1.5%</Box>
                  <ToggleTip content="This is some additional information.">
                    <Button variant="ghost" h="22px" minW={0}>
                      <LuInfo />
                    </Button>
                  </ToggleTip>
                </HStack>
              </HStack>
              <HStack justifyContent={'space-between'} gap={0} marginBottom={'10px'}>
                <HStack gap={0}><Box color={'txt-light'} marginRight={'4px'}><IoMdTime /></Box>Est. Time</HStack>
                <HStack>
                  <Box h="22px">2 mins</Box>
                </HStack>
              </HStack>
              <HStack
                gap={0}
                padding={'8px 10px'}
                backgroundColor={'rgba(252,202,0,.13)'}
                borderRadius={'5px'}
              >
                <RiErrorWarningFill style={{ width: '20px', height: '20px', color: 'FCCA00', flexShrink: 0 }} />
                <Box lineHeight={'1.2'} paddingLeft={'10px'}>Sending the wrong token or from a different network may result in a loss of funds.</Box>
              </HStack>
            </Box>

          </VStack>
          <SdaResult value={'set'} />
        </Box>
      )
    }
    return null;
  }

  return (
    <Box padding={['40px 20px', '40px 0', '40px 0']}>
      <Box
        position="relative"
        margin={'0 auto'}
        w={['100%', '460px', '460px']}
        h={'auto'}
        minH={'370px'}
        border={'1px solid #bbb'}
        borderRadius={'5px'}
        bgColor={'#fff'}
        boxShadow={'0 0 5px rgba(0,0,0,.4)'}
        padding={'0 15px 40px'}
      >
        {/* ── Header ────────────────────────────────────────────── */}
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
          <Text
            fontSize={['10px', '12px', '14px']}
            color={'txt-weak'}
            flex={1}
          >
            Demo
          </Text>
          <HStack
            gap={0}
            h={'28px'}
            borderRadius={'28px'}
            border={'1px solid #BBBBBB'}
            padding={'0 5px'}
          >
            {['Recipient', 'Deposit'].map((item, index) => (
              <HStack
                key={index}
                gap={0}
                h={'20px'}
                padding={'0 5px'}
                borderRadius={'20px'}
                background={activeIndex === index ? '#0F40F5' : 'transparent'}
                cursor="pointer"
                onClick={() => setActiveIndex(index)}
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
        {step1()}
        {step2()}
        <Box
          position={'absolute'}
          h={'40px'}
          left={'15px'}
          right={'15px'}
          bottom={0}
          borderTop={'1px dashed #bbb'}
          textAlign={'center'}
          color={'txt-weak'}
          opacity={0.6}
          fontSize={'10px'}
          lineHeight={'40px'}
        >
          Powered By WheelX Smart Payment Service
        </Box>
      </Box>
    </Box>
  );
};

export default SDAPage;
