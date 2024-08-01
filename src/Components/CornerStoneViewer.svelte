<script lang="ts">
  import type { IViewport } from "@cornerstonejs/core/dist/types/types";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";

  const loading = writable(true);
  const isInverted = writable(false);
  const currentImageIndex = writable(0);
  let viewport: IViewport | null = null;
  let imageIds: string | any[] = [];

  /**
   * @type {HTMLDivElement}
   */
  let content: HTMLDivElement;
  let viewportType: string;

  onMount(async () => {
    if (typeof window !== "undefined") {
      try {
        // Import the helper functions for rendering engine setup
        const { setupRenderingEngine, getViewportType } = await import(
          "./renderingEngineSetup"
        );
        const { createImageIdsAndCacheMetaData } = await import("./helper");
        const { initDemo } = await import("./initDemo");

        // Initialize Cornerstone
        await initDemo();

        // Get the viewport type
        viewportType = getViewportType();

        // Fetch image IDs
        imageIds = await createImageIdsAndCacheMetaData({
          StudyInstanceUID:
            "1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463",
          SeriesInstanceUID:
            "1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561",
          wadoRsRoot: "https://d3t6nz73ql33tx.cloudfront.net/dicomweb",
        });

        console.log(imageIds);

        // Create and configure the element
        const element = document.createElement("div");
        element.style.width = "500px";
        element.style.height = "500px";
        content.appendChild(element);

        // Setup the rendering engine
        const renderingEngine = setupRenderingEngine(
          "myRenderingEngine",
          element,
          "CT_AXIAL_STACK",
          viewportType
        );

        viewport = renderingEngine.getViewport("CT_AXIAL_STACK");

        // Set the stack and render the viewport
        viewport.setStack(imageIds, 0);
        viewport.render();

        loading.set(false);
      } catch (error) {
        console.error("Error setting up Cornerstone:", error);
        loading.set(false);
      }
    }
  });

  const handleZoomIn = () => {
    if (viewport) {
      const currentZoom = viewport.getZoom();
      viewport.setZoom(currentZoom * 1.2); // Increase zoom by 20%
      viewport.render();
    }
  };

  const handleZoomOut = () => {
    if (viewport) {
      const currentZoom = viewport.getZoom();
      viewport.setZoom(currentZoom / 1.2); // Decrease zoom by 20%
      viewport.render();
    }
  };

  const handleRandomZoom = () => {
    if (viewport) {
      const randomZoom = Math.random() * 3 + 0.5; // Random zoom between 0.5 and 3.5
      viewport.setZoom(randomZoom);
      viewport.render();
    }
  };

  const handleRotateDelta = () => {
    if (viewport) {
      const currentRotation = viewport.getRotation();
      viewport.setRotation(currentRotation + 30); // Rotate by 30 degrees
      viewport.render();
    }
  };

  const handleResetViewport = () => {
    if (viewport && imageIds.length > 0) {
      viewport.setZoom(1.0);
      viewport.setRotation(0);
      viewport.setPan({ x: 0, y: 0 });
      viewport.setStack(imageIds, $currentImageIndex); // Ensure the image stack is set again
      viewport.render();
    }
  };

  const handleInvert = () => {
    if (viewport) {
      const invertValue = !$isInverted; // Toggle the invert state
      viewport.setProperties({ invert: invertValue }); // Update viewport properties
      viewport.render();
      isInverted.set(invertValue); // Update the state
    }
  };

  const handleNextImage = () => {
    if (viewport && $currentImageIndex < imageIds.length - 1) {
      const nextIndex = $currentImageIndex + 1;
      viewport.setStack(imageIds, nextIndex);
      viewport.render();
      currentImageIndex.set(nextIndex);
    }
  };

  const handlePreviousImage = () => {
    if (viewport && $currentImageIndex > 0) {
      const prevIndex = $currentImageIndex - 1;
      viewport.setStack(imageIds, prevIndex);
      viewport.render();
      currentImageIndex.set(prevIndex);
    }
  };
</script>

{#if $loading}
  <div>
    <progress class="progress w-56 my-32"></progress>
  </div>
{:else}
  <div class="bg-slate-700 border-4 border-slate-700 shadow-2xl">
    <div id="content" style="width: 100%; height: 100%;"></div>
    <div class="w-full" style="justify-content: center; margin-top: 10px;">
      <div class="mt-5 text-center">
        <button class="btn btn-sm" on:click={handleZoomIn}>Zoom In</button>
        <button
          class="btn btn-sm"
          on:click={handleZoomOut}
          style="margin-left: 10px;">Zoom Out</button
        >
        <button
          class="btn btn-sm"
          on:click={handleRandomZoom}
          style="margin-left: 10px;">Random Zoom</button
        >
      </div>

      <div class="my-5 text-center">
        <button
          class="btn btn-sm"
          on:click={handleRotateDelta}
          style="margin-left: 10px;">Rotate Delta 30</button
        >
        <button
          class="btn btn-sm"
          on:click={handleInvert}
          style="margin-left: 10px;">Invert</button
        >
        <button
          class="btn btn-sm"
          on:click={handleResetViewport}
          style="margin-left: 10px;">Reset Viewport</button
        >
      </div>

      <div class="my-5 text-center">
        <button
          class="btn btn-sm"
          on:click={handlePreviousImage}
          style="margin-left: 10px;">Previous Image</button
        >
        <button
          class="btn btn-sm"
          on:click={handleNextImage}
          style="margin-left: 10px;">Next Image</button
        >
      </div>
    </div>
  </div>
{/if}

<style>
  #content {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
  }
</style>
