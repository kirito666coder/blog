import React, { useState } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function CodeBlock({
  code,
  language = 'javascript',
}: {
  code: string;
  language?: string;
}) {
  const [height, setHeight] = useState(50);

  const safeCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-typescript.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-bash.min.js"></script>

  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: #000;
    }

    pre {
      margin: 0;
      padding: 14px;
      background: #000;
      overflow-x: auto;
      border-radius: 10px;
    }

    code {
      font-family: monospace;
      font-size: 13px;
      color: #e6edf3;
    }

    .token.comment { color: #8b949e; }
    .token.keyword { color: #ff7b72; }
    .token.string { color: #a5d6ff; }
    .token.function { color: #d2a8ff; }
    .token.number { color: #79c0ff; }
  </style>
</head>

<body>
  <pre><code class="language-${language}">
${safeCode}
  </code></pre>

  <script>
    Prism.highlightAll();

    function sendHeight() {
      const height = document.body.scrollHeight;
      window.ReactNativeWebView.postMessage(height.toString());
    }

    window.onload = sendHeight;
    setTimeout(sendHeight, 50);
    setTimeout(sendHeight, 200);
  </script>
</body>
</html>
  `;

  return (
    <View style={{ marginVertical: 12, borderRadius: 10, overflow: 'hidden' }}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        scrollEnabled={false}
        javaScriptEnabled
        onMessage={(event) => {
          const h = Number(event.nativeEvent.data);
          if (h && h > 0) setHeight(h);
        }}
        style={{
          height,
          backgroundColor: 'black',
        }}
      />
    </View>
  );
}
