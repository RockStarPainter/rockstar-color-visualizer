// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

// Helper function for handling image scaling needed for SAM
// const handleImageScale = (image: HTMLImageElement) => {
//   // Input images to SAM must be resized so the longest side is 1024
//   const LONG_SIDE_LENGTH = 1024;
//   let w = image.naturalWidth;
//   let h = image.naturalHeight;
//   const samScale = LONG_SIDE_LENGTH / Math.max(h, w);
//   return { height: h, width: w, samScale };
// };

// export { handleImageScale };

const handleImageScale = (image: HTMLImageElement) => {
  // Set the maximum side length for scaling
  const LONG_SIDE_LENGTH = 1024;
  const w = image.naturalWidth;
  const h = image.naturalHeight;

  // Calculate the scaling factor (samScale)
  const samScale = LONG_SIDE_LENGTH / Math.max(h, w);

  // Apply the scaling factor to width and height
  const scaledWidth = Math.round(w * samScale);
  const scaledHeight = Math.round(h * samScale);

  console.log('Original Dimensions:', w, h);
  console.log('Scaled Dimensions:', scaledWidth, scaledHeight);

  // Return the scaled dimensions along with the scaling factor
  return { height: scaledHeight, width: scaledWidth, samScale };
};

export { handleImageScale };

