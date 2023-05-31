# React Transcribe

このリポジトリは、React で Amazon Transcribe を使った音声入力を行うサンプルコードです。  

## Overview

Amazon Transcribe でストリーミング文字起こしは、[@aws-sdk/client-transcribe-streaming](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-transcribe-streaming/) を利用して実装します。  
こちらで紹介されているサンプルコードをベースに、実装を行なっていきます。  

ブラウザから音声入力を行う場合は、 [microphone-stream](https://github.com/microphone-stream/microphone-stream#readme) を利用します。  
**しかし、デフォルトの状態では、Polyfill のエラーが発生して実行することができません。**  

当リポジトリは、Polyfill の設定にフォーカスしたサンプルコードです。  
webpack と Vite で実装方法が異なるため、それぞれのサンプルコードを用意しています。  
ただし、`src/hooks/useTranscribe.ts` は webpack と Vite どちらも同じコードです。  

## Preparation

Amazon Transcribe が実行可能な IAM ユーザを作成してください（コンソールアクセスは不要）  
アクセスキーを作成して、アクセスキーとシークレットアクセスキーをメモしておいてください（.envに設定します）

## webpack

[Create React App](https://create-react-app.dev/) を利用して構築しています。  

`webpack/.env` で以下のように環境変数を設定してください。  

```bash
REACT_APP_REGION=any-region-name
REACT_APP_ACCESS_KEY_ID=iam-user-access-key
REACT_APP_SECRET_ACCESS_KEY=iam-user-secret-access-key
```

[@aws-sdk/client-transcribe-streaming](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-transcribe-streaming/) のサンプルコードをそのまま実行すると、以下のようなエラーが発生して実行できません。  

```bash
BREAKING CHANGE: webpack < 5 used to include polyfills for node.js core modules by default.
This is no longer the case. Verify if you need this module and configure a polyfill for it.
```

Polyfill の設定できていませんので、必要なパッケージをインストールします。

```bash
npm install buffer process
```

ビルドエラーは解消しますが、Transcribe を実行すると以下のエラーが発生します。

```bash
index.js:35 Uncaught ReferenceError: Buffer is not defined
    at fromArrayBuffer (index.js:35:1)
    at Object.bufferFrom [as default] (index.js:60:1)
    at ScriptProcessorNode.recorderProcess (microphone-stream.js:108:1)
```

`index.tsx` に、polyfill のコードを追加することでエラーが解消されます。  

```tsx
import { Buffer } from "buffer";
import * as process from "process";

window.process = process;
window.Buffer = Buffer;
```

## Vite

[create vite](https://vitejs.dev/guide/#scaffolding-your-first-vite-project) を利用して構築しています。  

`vite/.env` で以下のように環境変数を設定してください。  

```bash
VITE_REGION=any-region-name
VITE_ACCESS_KEY_ID=iam-user-access-key
VITE_SECRET_ACCESS_KEY=iam-user-secret-access-key
```

webpack と同じように、polyfill の設定を行います。  
vite では `process` は利用しないので、設定しません。  

npm package のインストール

```bash
npm install buffer
```

`main.tsx` に polyfill のコードを追加

```tsx

import { Buffer } from "buffer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).Buffer = Buffer;
```

Vite では上記の設定だけでは不十分で、以下のエラーが発生します。  

```bash
Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'call')
    at MicrophoneStream2.Readable (_stream_readable.js:178:10)
    at new MicrophoneStream2 (microphone-stream.js:46:28)
    at startTranscription (useTranscribe.ts:120:17)
    at HTMLUnknownElement.callCallback2 (react-dom.development.js:4164:14)
    at Object.invokeGuardedCallbackDev (react-dom.development.js:4213:16)
    at invokeGuardedCallback (react-dom.development.js:4277:31)
    at invokeGuardedCallbackAndCatchFirstError (react-dom.development.js:4291:25)
    at executeDispatch (react-dom.development.js:9041:3)
    at processDispatchQueueItemsInOrder (react-dom.development.js:9073:7)
    at processDispatchQueue (react-dom.development.js:9086:5)
```

そこで、[vite-plugin-node-polyfills](https://github.com/davidmyersdev/vite-plugin-node-polyfills) を導入します。  
これは、Node.js の Core Modules を polyfill するための Vite プラグインです。

```bash
npm install -D vite-plugin-node-polyfills
```

インストールしたら、`vite/vite.config.ts` を以下の通り修正します。

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
  ],
});
```

これでエラーが解消されます。
