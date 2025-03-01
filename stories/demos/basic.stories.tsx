import React from 'react'
import Basic from './exampleCode/basic'

const meta = {
  title: 'Examples/Basic',
  component: Basic,
  parameters: {
    docs: {
      page: null,
    },
  },
}

export default meta


export const BasicExample = {
  render: () => <Basic />,
}
