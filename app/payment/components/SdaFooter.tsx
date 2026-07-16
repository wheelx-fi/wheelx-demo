'use client';

import { Box } from '@chakra-ui/react';

export function SdaFooter() {
  return (
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
      Powered By WheelX Payment
    </Box>
  );
}
