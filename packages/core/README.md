<p align="center">
    <img alt="logo" src="https://vant4-kit.netlify.app/logo.png" width="220" height="220" style="margin-bottom: 10px;">
</p>

<h1 align="center">Vant4-Kit</h1>

<p align="center">一款基于Vant 4.x 的增强库，旨在加速开发，早点下班</p>

---

## Getting Started

文档地址：[vant4-kit](https://vant4-kit.netlify.app/)

## Installation

```bash
# npm
npm install @yucheng2/vant4-kit --save

# yarn
yarn add @yucheng2/vant4-kit

# pnpm
pnpm add @yucheng2/vant4-kit

```

## Usage

```ts
import { createApp } from "vue";
import Vant from "vant";
// 1. Import the Vant
import Vant4Kit from "@yucheng2/vant4-kit";
// 2. Import the @yucheng2/vant4-kit
import "@yucheng2/vant4-kit/dist/index.css";

const app = createApp();

// 3. Register the components
app.use(Vant);
app.use(Vant4Kit);
```

```html
<template>
  <x-form ref="formRef" :model="FormValue" :items="formOptions" />
</template>
```
