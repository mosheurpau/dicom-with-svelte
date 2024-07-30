import { RenderingEngine, Enums } from '@cornerstonejs/core';

/**
 * Initializes and returns a configured RenderingEngine instance.
 * @param {string} renderingEngineId - The ID for the RenderingEngine instance.
 * @param {HTMLElement} element - The HTML element to attach the viewport to.
 * @param {string} viewportId - The ID for the viewport.
 * @param {string} viewportType - The type of viewport to use.
 * @returns {RenderingEngine} - The initialized RenderingEngine instance.
 */
export function setupRenderingEngine(renderingEngineId, element, viewportId, viewportType) {
  const renderingEngine = new RenderingEngine(renderingEngineId);

  const viewportInput = {
    viewportId,
    element,
    type: viewportType || 'defaultViewportType', // Fallback type
  };

  renderingEngine.enableElement(viewportInput);

  return renderingEngine;
}

/**
 * Returns the viewport type from Enums.
 * @returns {string} - The viewport type, defaulting to 'defaultViewportType' if not available.
 */
export function getViewportType() {
  return Enums?.ViewportType?.STACK || 'defaultViewportType'; // Fallback type
}
