import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'box-icon': { name: string, type?: string, color?: string };
    }
  }
}
