import OpenAI from 'openai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateTests = async (componentName: string, component: string) => {
  const prompt = `
    Write test for Vue component that i will send to you
    - Use defaultProps
    - Follow Arrange Act Assert pattern. Separate them with new lines. Don't write comments.
    - Do not write comments
    - Use "test" instead of "it"
    - Use Vitest instead of Jest
    - Set wrapper in beforeEach
    - Use faker-js for any data
    - Use getters (named like getFooWrapper) for any elements except root wrapper

    Component code is:

    ${componentName}:
    ${component}

    For test file use this template:

    import { mount, VueWrapper } from '@vue/test-utils';
    import ${componentName}, { type ${componentName}Props } from '.';
    import { faker } from '@faker-js/faker';

    const defaultProps: ${componentName}Props = {};

    describe('${componentName}', () => {
      let wrapper: VueWrapper;

      beforeEach(() => {
        wrapper = mount(${componentName}, { shallow: true, props: defaultProps });
      });

      test.todo('Example', () => {});
    });

    In your respnse don't include any text except code.
    Your respnse must contain all code and cover all important scenarios.

    Output result as raw text, without markdown formatting.
  `;

  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-3.5-turbo',
  });

  const response = chatCompletion.choices[0].message.content;

  return response ? response : null;
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  return response
    .status(200)
    .send(await generateTests('VFooBar', request.body.component));
}
