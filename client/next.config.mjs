//Voice-Pipeline needed:
// const CopyPlugin = require("copy-webpack-plugin"); // CommonJS
import CopyPlugin from "copy-webpack-plugin";

// reload node_modules on change
const watchNodeModules = false;

const wasmPaths = [
  "./node_modules/onnxruntime-web/dist/ort-wasm.wasm",
  "./node_modules/onnxruntime-web/dist/ort-wasm-threaded.wasm",
  "./node_modules/onnxruntime-web/dist/ort-wasm-simd.wasm",
  "./node_modules/onnxruntime-web/dist/ort-wasm-simd.jsep.wasm",
  "./node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm",
  "./node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.wasm",
  "./node_modules/onnxruntime-web/dist/ort-training-wasm-simd.wasm",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@convex": "./convex",
      "@interview": "./app/interview",
    };

    // //Voice-Pipeline needed: not sure if this is needed
    // config.resolve.fallback = {
    //   ...config.resolve.fallback,

    //   fs: false,
    // };

    //Voice-Pipeline needed: local dev server - copy wasm into static/chunks/app
    config.plugins.push(
      new CopyPlugin({
        patterns: wasmPaths.map((p) => ({ from: p, to: "static/chunks/" })),
      })
    );

    if (watchNodeModules) {
      // It's recommended to opt-out of managedPaths if editing files in
      // node_modules directly.
      // @see https://github.com/webpack/webpack/issues/11612#issuecomment-705790881
      // @see https://webpack.js.org/configuration/other-options/#managedpaths
      config.snapshot.managedPaths = [];

      // config.watchOptions isn't directly writable, so we use defineProperty.
      Object.defineProperty(config, "watchOptions", {
        ...Object.getOwnPropertyDescriptor(config, "watchOptions"),
        value: {
          ...config.watchOptions,
          ignored: /^((?:[^/]*(?:\/|$))*)(\.(git|next))(\/((?:[^/]*(?:\/|$))*)(?:$|\/))?/,
        },
      });

      // This seems to work without any changes to watchOptions.followSymlinks
      // or resolve.symlinks, but in case it ever becomes relevant:
      // @see https://github.com/webpack/webpack/issues/11612#issuecomment-1448208868
    }
    return config;
  },
};

export default nextConfig;
