import type { Preview } from '@storybook/react'
import '../src/sass/styles.scss'

const preview: Preview = {
  parameters: {
    actions: {
      // The updated way to match action event handlers
      includeParameters: /^on[A-Z].*/,
    },
    controls: {
      // TODO: refactor jsDocs in Calendar control
      //expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    // Updated sorting configuration syntax remains similar
    storySort: {
      order: [
        'About Big Calendar',
        'About Our Examples',
        'props',
        'Examples',
        'Guides',
        'Addons',
        ['Introduction', 'props'],
      ],
    },
    // Default view mode remains the same
    viewMode: 'docs',
  },
}

export default preview
