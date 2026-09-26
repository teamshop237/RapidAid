const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const previewModule = "@/protocols/developmentProtocolPreview";
const disabledPreview = path.resolve(__dirname, "src/protocols/developmentProtocolPreview.disabled.ts");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === previewModule && !context.dev) {
    return { type: "sourceFile", filePath: disabledPreview };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
