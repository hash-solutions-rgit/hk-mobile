import React from "react";
import WebView from "react-native-webview";
import {} from "expo/";

const ShopNowWebView = () => {
  return (
    <WebView
      source={{ uri: "https://hauskorper.co.uk/" }}
      allowsInlineMediaPlayback
    />
  );
};

export default ShopNowWebView;
