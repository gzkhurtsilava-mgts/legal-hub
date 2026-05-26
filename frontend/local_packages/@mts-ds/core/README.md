# @mts-ds/core

## Истории Storybook

Поддерживаются форматы `js`, `ts`, `mdx`.
Шаблон имени файла: `<name>.stories.ts` или `<name>.stories.mdx`
Истории размещаются внутри пути `./src`, рядом с файлом для которого она пишется.

Например, для `./src/exports/typography.scss` файл истории можно разместить тут `./src/exports/typography.stories.mdx` или тут `./src/exports/typography.stories.ts`

Пример TS `typography.stories.ts`:
```typescript
export default {
  title: "Typography TS",
};

import "./typography.scss";

const Template = () => {
  return `<div class="mts-h1-bold">Story content</div>`;
};

export const Demo = Template.bind({});
```

Пример MDX `typography.stories.mdx`:
```mdxjs
import { Canvas, Meta, Story, Title } from "@storybook/addon-docs";

<Meta title="Typography MDX" />

<Title />

<div className="mts-h1-bold">Custom page content</div>

export const Template = () => {
  return `<div class="mts-h1-bold">Story content</div>`;
};

## Markdown content

<Canvas>
  <Story name="Demo">{Template.bind({})}</Story>
</Canvas>
```

## Image Snapshot тестирование

Для image-snapshot тестирования настроен `jest` + `jest-image-snapshot`.
Перед запуском тестов нужно запустить `Storybook` в качестве веб-сервера.

Пример теста:
```javascript
import "expect-puppeteer";

describe("typography", async () => {
  beforeAll(async () => {
    await page.goto(
      "http://localhost:6006/iframe.html?args=&id=typography-ts--demo&viewMode=story"
    );
  });

  it(`should print`, async () => {
    await page.setViewport({ width: 960, height: 150 });
    const screenshot = await page.screenshot();
    expect(screenshot).toMatchImageSnapshot();
  });
});
```
