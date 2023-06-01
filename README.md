# Amazon Transcribe with React

This repository is sample code for streaming transcription using Amazon Transcribe in React.  

## Overview

Streaming transcription with Amazon Transcribe is implemented using [@aws-sdk/client-transcribe-streaming](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-transcribe-streaming/).  
The implementation will be based on this sample code.  

Use [microphone-stream](https://github.com/microphone-stream/microphone-stream#readme) for audio input from a browser.  
**But if Polyfill is not configured, it can't run it with an error.**

This repository is sample code focused on Polyfill configuration.  
Since `webpack` and `Vite` have different implementations, we have included sample code for each.  
However, `src/hooks/useTranscribe.ts` is the same code for both `webpack` and `Vite`.  

## Preparation

Create an IAM user that can run Amazon Transcribe (No console access required).  
Create an access key, Please note that the access key and secret access key will be set later in `.env`.  

## webpack

It is built using [Create React App](https://create-react-app.dev/).  

Set environment variables in `webpack/.env` as follows.  

```bash
REACT_APP_REGION=any-region-name
REACT_APP_ACCESS_KEY_ID=iam-user-access-key
REACT_APP_SECRET_ACCESS_KEY=iam-user-secret-access-key
```

Start with the following command.

```bash
cd webpack
npm run start
```

This sample code configured Polyfill, so no error occurs.
However, if Polyfill is not configured, the following error occurs and execution fails.

```bash
BREAKING CHANGE: webpack < 5 used to include polyfills for node.js core modules by default.
This is no longer the case. Verify if you need this module and configure a polyfill for it.
```

Install the required packages in Polyfill.

```bash
npm install buffer process
```

The build error is resolved, but the following error occurs when Transcribe is run.  

```bash
index.js:35 Uncaught ReferenceError: Buffer is not defined
    at fromArrayBuffer (index.js:35:1)
    at Object.bufferFrom [as default] (index.js:60:1)
    at ScriptProcessorNode.recorderProcess (microphone-stream.js:108:1)
```

Adding the polyfill code to `index.tsx` resolves the error.  

```tsx
import { Buffer } from "buffer";
import * as process from "process";

window.process = process;
window.Buffer = Buffer;
```

## Vite

It is built using [create vite](https://vitejs.dev/guide/#scaffolding-your-first-vite-project).  

Set environment variables in `vite/.env` as follows.  

```bash
VITE_REGION=any-region-name
VITE_ACCESS_KEY_ID=iam-user-access-key
VITE_SECRET_ACCESS_KEY=iam-user-secret-access-key
```

Start with the following command.

```bash
cd vite
npm run dev
```

This sample code configured Polyfill, so no error occurs.
However, if Polyfill is not configured, Error as with webpack's sample code.

Set up Polyfill as in webpack's sample code.  
In `vite`, `process` is not used.

Install the required packages in Polyfill.

```bash
npm install buffer
```

Adding the polyfill code to `main.tsx`

```tsx

import { Buffer } from "buffer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).Buffer = Buffer;
```

In Vite, even with the above settings, the following error occurs.  

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

You can solve this by adding a Vite plugin to polyfill Core Modules in Node.js.  
Install [vite-plugin-node-polyfills](https://github.com/davidmyersdev/vite-plugin-node-polyfills).

```bash
npm install -D vite-plugin-node-polyfills
```

Set `vite/vite.config.ts` as follows.  

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

This will resolve the error.
