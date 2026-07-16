'use client';

import { Box, HStack, Image, Text, Portal, Select } from '@chakra-ui/react';
import type { ListCollection } from '@chakra-ui/react';

interface TokenItem {
  label: string;
  value: string;
  address: string | undefined;
  decimals: number;
}

interface EnrichedToken {
  logo: string;
  symbol: string;
}

interface TokenSelectDropdownProps {
  collection: ListCollection<TokenItem>;
  value: string[];
  onValueChange: (e: { value: string[] }) => void;
  label: string;
  required?: boolean;
  selectedItem: EnrichedToken | null;
  /** Flat list of enriched tokens used for rendering each dropdown item's icon */
  tokensList: EnrichedToken[];
  /** Unique key to force re-mount when chain changes */
  resetKey: string | number;
  iconSize: { w: string; h: string };
}

export function TokenSelectDropdown({
  collection,
  value,
  onValueChange,
  label,
  required = false,
  selectedItem,
  tokensList,
  resetKey,
  iconSize,
}: TokenSelectDropdownProps) {
  return (
    <Box flex={1}>
      <Select.Root
        collection={collection}
        width="100%"
        gap={0}
        value={value}
        onValueChange={onValueChange}
        key={resetKey}
      >
        <Select.HiddenSelect />
        <Select.Label fontSize={'13px'} color={'txt-weak'} marginBottom={'5px'}>
          {label}
          {required && <span style={{ color: 'red' }}>*</span>}
        </Select.Label>
        <Select.Control>
          <Select.Trigger>
            {selectedItem ? (
              <HStack gap={'8px'}>
                <Image
                  src={selectedItem.logo}
                  alt={selectedItem.symbol}
                  {...iconSize}
                  borderRadius={'full'}
                  marginLeft={'8px'}
                />
                <Text fontSize={'13px'}>{selectedItem.symbol}</Text>
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
              {collection.items.map((item) => {
                const tok = tokensList.find(
                  (t) => t.symbol === item.label,
                );
                return (
                  <Select.Item
                    item={item}
                    key={item.value + item.address}
                    padding={'5px 0'}
                  >
                    <HStack gap={'8px'}>
                      <Image
                        src={tok?.logo || ''}
                        alt={item.label}
                        {...iconSize}
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
  );
}
