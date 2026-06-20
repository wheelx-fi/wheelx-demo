import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        'brand-purple': {
          value: '#8143FF',
        },
        'brand-grey1': {
          value: '#071D2C',
        },
        'brand-grey2': {
          value: '#5D5C5D',
        },
        'brand-grey3': {
          value: '#BEBEBE',
        },
        'brand-grey4': {
          value: '#81728C',
        },
        'state-progress': {
          value: '#0890FE',
        },
        'state-success': {
          value: '#00CBB3',
        },
        'state-error': {
          value: '#FF4267',
        },
        'state-warning': {
          value: '#F2BD19',
        },
        'txt-normal': {
          value: '#333',
        },
        'txt-light': {
          value: '#101010',
        },
        'txt-weak': {
          value: '#6c6c6c',
        },
        'txt-warning': {
          value: '#FC3D2C',
        },
        'txt-success': {
          value: '#67c23a',
        },
        'txt-info': {
          value: '#909399',
        },
        'txt-placeholder': {
          value: '#c0c4cc',
        },
      },
    },
    semanticTokens: {},
    keyframes: {
      spin: {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
