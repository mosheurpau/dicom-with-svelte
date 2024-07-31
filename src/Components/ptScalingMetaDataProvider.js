import { utilities as csUtils } from "@cornerstonejs/core";

const scalingPerImageId = {};

// @ts-ignore
function addInstance(imageId, scalingMetaData) {
  const imageURI = csUtils.imageIdToURI(imageId);
  // @ts-ignore
  scalingPerImageId[imageURI] = scalingMetaData;
}

// @ts-ignore
function get(type, imageId) {
  if (type === "scalingModule") {
    const imageURI = csUtils.imageIdToURI(imageId);
    // @ts-ignore
    return scalingPerImageId[imageURI];
  }
}

export default { addInstance, get };
