/** @type { import('@storybook/preact').Preview } */
const preview = {
  parameters: {
    initialEntry: '/?path=/story/zoom--index',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
