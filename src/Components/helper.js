// @ts-nocheck
import { api } from "dicomweb-client";
import dcmjs from "dcmjs";
import { utilities } from "@cornerstonejs/core";
import cornerstoneDICOMImageLoader from "@cornerstonejs/dicom-image-loader";

const { DicomMetaDictionary } = dcmjs.data;

const { calibratedPixelSpacingMetadataProvider } = utilities;

/**
 * Uses dicomweb-client to fetch metadata of a study, cache it in cornerstone,
 * and return a list of imageIds for the frames.
 *
 * @param {Object} params - Parameters for fetching and processing DICOM data.
 * @param {string} params.StudyInstanceUID - UID of the study to fetch.
 * @param {string} params.SeriesInstanceUID - UID of the series to fetch.
 * @param {string|null} [params.SOPInstanceUID=null] - Optional SOP Instance UID to filter results.
 * @param {string} params.wadoRsRoot - Base URL of the DICOMweb server.
 * @param {api.DICOMwebClient} [params.client=null] - Optional DICOMweb client instance.
 * @param {boolean} [params.convertMultiframe=true] - Flag to convert multi-frame images.
 * @returns {string[]} - An array of imageIds for instances in the study.
 */
export async function createImageIdsAndCacheMetaData({
  StudyInstanceUID,
  SeriesInstanceUID,
  SOPInstanceUID = null,
  wadoRsRoot,
  // @ts-ignore
  client = null,
  convertMultiframe = true,
}) {
  const SOP_INSTANCE_UID = "00080018";
  const SERIES_INSTANCE_UID = "0020000E";
  // @ts-ignore
  const MODALITY = "00080060";

  const studySearchOptions = {
    studyInstanceUID: StudyInstanceUID,
    seriesInstanceUID: SeriesInstanceUID,
  };

  // @ts-ignore
  client = client || new api.DICOMwebClient({ url: wadoRsRoot });
  let instances = [];

  try {
    instances = await client.retrieveSeriesMetadata(studySearchOptions);
  } catch (error) {
    console.error("Error retrieving series metadata:", error);
    return [];
  }

  if (instances.length === 0) {
    console.warn("No instances found for the given criteria.");
    return [];
  }

  if (SOPInstanceUID) {
    instances = instances.filter((instance) => {
      // @ts-ignore
      return instance[SOP_INSTANCE_UID]?.Value[0] === SOPInstanceUID;
    });
  }

  const imageIds = instances.map((instanceMetaData) => {
    const seriesUID =
      // @ts-ignore
      instanceMetaData[SERIES_INSTANCE_UID]?.Value[0] || "UNKNOWN";
    const sopUID =
      SOPInstanceUID ||
      // @ts-ignore
      instanceMetaData[SOP_INSTANCE_UID]?.Value[0] ||
      "UNKNOWN";

    // @ts-ignore
    const imageId = `wadors:${wadoRsRoot}/studies/${StudyInstanceUID.trim()}/series/${seriesUID.trim()}/instances/${sopUID.trim()}/frames/1`;

    cornerstoneDICOMImageLoader.wadors.metaDataManager.add(
      imageId,
      instanceMetaData
    );
    return imageId;
  });

  // Optionally handle multi-frame images
  if (convertMultiframe) {
    imageIds.forEach((imageId) => {
      let instanceMetaData =
        cornerstoneDICOMImageLoader.wadors.metaDataManager.get(imageId);

      if (instanceMetaData) {
        // Add calibrated pixel spacing
        try {
          // @ts-ignore
          const metadata =
            DicomMetaDictionary.naturalizeDataset(instanceMetaData);
          // Process or store the metadata as needed
        } catch (error) {
          console.error("Error processing metadata:", error);
        }
      }
    });
  }

  return imageIds;
}
