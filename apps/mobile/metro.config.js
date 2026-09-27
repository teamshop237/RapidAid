const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const previewModule = "@/protocols/developmentProtocolPreview";
const disabledPreview = path.resolve(__dirname, "src/protocols/developmentProtocolPreview.disabled.ts");
const animationModule = "@/components/developmentProcedureAnimations";
const disabledAnimations = path.resolve(__dirname, "src/components/developmentProcedureAnimations.disabled.tsx");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === previewModule && !context.dev) {
    return { type: "sourceFile", filePath: disabledPreview };
  }
  if (moduleName === animationModule && !context.dev) {
    return { type: "sourceFile", filePath: disabledAnimations };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
