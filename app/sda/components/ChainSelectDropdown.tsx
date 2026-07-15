'use client';

import { Box, HStack, Image, Text, Portal, Select } from '@chakra-ui/react';
import type { ListCollection } from '@chakra-ui/react';

interface ChainSelectDropdownProps {
  collection: ListCollection<{ label: string; value: string }>;
  value: string[];
  onValueChange: (e: { value: string[] }) => void;
  label: string;
  required?: boolean;
  selectedItem: { chain_icon?: string; name: string } | null;
  chainsMap: Record<number, { chain_icon?: string; name: string }>;
  iconSize: { w: string; h: string };
}

export function ChainSelectDropdown({
  collection,
  value,
  onValueChange,
  label,
  required = false,
  selectedItem,
  chainsMap,
  iconSize,
}: ChainSelectDropdownProps) {
  return (
    <Box flex={1}>
      <Select.Root
        collection={collection}
        width="100%"
        gap={0}
        value={value}
        onValueChange={onValueChange}
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
                  src={selectedItem.chain_icon || '/images/default-token-icon.png'}
                  alt={selectedItem.name}
                  {...iconSize}
                  borderRadius={'full'}
                  marginLeft={'8px'}
                />
                <Text fontSize={'13px'}>{selectedItem.name}</Text>
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
              {collection.items.map((item) => {
                const chain = chainsMap[Number(item.value)];
                return (
                  <Select.Item item={item} key={item.value} padding={'5px 0'}>
                    <HStack gap={'8px'}>
                      <Image
                        src={chain?.chain_icon || '/images/default-token-icon.png'}
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
