/**
 * Cesium - https://github.com/CesiumGS/cesium
 *
 * Copyright 2011-2020 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/main/LICENSE.md for full licensing details.
 */

define(['./AxisAlignedBoundingBox-ca5327b9', './Matrix2-a67cd174', './defaultValue-81eec7ed', './TerrainEncoding-b43af31a', './IndexDatatype-2261ba8d', './ComponentDatatype-0f8fc942', './RuntimeError-8952249c', './Transforms-fe4a2875', './WebMercatorProjection-3225007f', './createTaskProcessorWorker', './AttributeCompression-e6061e33', './WebGLConstants-508b9636', './_commonjsHelpers-3aae1032-26891ab7', './combine-3c023bda'], (function (AxisAlignedBoundingBox, Matrix2, defaultValue, TerrainEncoding, IndexDatatype, ComponentDatatype, RuntimeError, Transforms, WebMercatorProjection, createTaskProcessorWorker, AttributeCompression, WebGLConstants, _commonjsHelpers3aae1032, combine) { 'use strict';

  /**
   * Provides terrain or other geometry for the surface of an ellipsoid.  The surface geometry is
   * organized into a pyramid of tiles according to a {@link TilingScheme}.  This type describes an
   * interface and is not intended to be instantiated directly.
   *
   * @alias TerrainProvider
   * @constructor
   *
   * @see EllipsoidTerrainProvider
   * @see CesiumTerrainProvider
   * @see VRTheWorldTerrainProvider
   * @see GoogleEarthEnterpriseTerrainProvider
   */
  function TerrainProvider() {
    RuntimeError.DeveloperError.throwInstantiationError();
  }

  Object.defineProperties(TerrainProvider.prototype, {
    /**
     * Gets an event that is raised when the terrain provider encounters an asynchronous error..  By subscribing
     * to the event, you will be notified of the error and can potentially recover from it.  Event listeners
     * are passed an instance of {@link TileProviderError}.
     * @memberof TerrainProvider.prototype
     * @type {Event<TerrainProvider.ErrorEvent>}
     * @readonly
     */
    errorEvent: {
      get: RuntimeError.DeveloperError.throwInstantiationError,
    },

    /**
     * Gets the credit to display when this terrain provider is active.  Typically this is used to credit
     * the source of the terrain. This function should
     * not be called before {@link TerrainProvider#ready} returns true.
     * @memberof TerrainProvider.prototype
     * @type {Credit}
     * @readonly
     */
    credit: {
      get: RuntimeError.DeveloperError.throwInstantiationError,
    },

    /**
     * Gets the tiling scheme used by the provider.  This function should
     * not be called before {@link TerrainProvider#ready} returns true.
     * @memberof TerrainProvider.prototype
     * @type {TilingScheme}
     * @readonly
     */
    tilingScheme: {
      get: RuntimeError.DeveloperError.throwInstantiationError,
    },

    /**
     * Gets a value indicating whether or not the provider is ready for use.
     * @memberof TerrainProvider.prototype
     * @type {Boolean}
     * @readonly
     */
    ready: {
      get: RuntimeError.DeveloperError.throwInstantiationError,
    },

    /**
     * Gets a promise that resolves to true when the provider is ready for use.
     * @memberof TerrainProvider.prototype
     * @type {Promise.<Boolean>}
     * @readonly
     */
    readyPromise: {
      get: RuntimeError.DeveloperError.throwInstantiationError,
    },

    /**
     * Gets a value indicating whether or not the provider includes a water mask.  The water mask
     * indicates which areas of the globe are water rather than land, so they can be rendered
     * as a reflective surface with animated waves.  This function should not be
     * called before {@link TerrainProvider#ready} returns true.
     * @memberof TerrainProvider.prototype
     * @type {Boolean}
     * @readonly
     */
    hasWaterMask: {
      get: RuntimeError.DeveloperError.throwInstantiationError,
    },

    /**
     * Gets a value indicating whether or not the requested tiles include vertex normals.
     * This function should not be called before {@link TerrainProvider#ready} returns true.
     * @memberof TerrainProvider.prototype
     * @type {Boolean}
     * @readonly
     */
    hasVertexNormals: {
      get: RuntimeError.DeveloperError.throwInstantiationError,
    },

    /**
     * Gets an object that can be used to determine availability of terrain from this provider, such as
     * at points and in rectangles.  This function should not be called before
     * {@link TerrainProvider#ready} returns true.  This property may be undefined if availability
     * information is not available.
     * @memberof TerrainProvider.prototype
     * @type {TileAvailability}
     * @readonly
     */
    availability: {
      get: RuntimeError.DeveloperError.throwInstantiationError,
    },
  });

  const regularGridIndicesCache = [];

  /**
   * Gets a list of indices for a triangle mesh representing a regular grid.  Calling
   * this function multiple times with the same grid width and height returns the
   * same list of indices.  The total number of vertices must be less than or equal
   * to 65536.
   *
   * @param {Number} width The number of vertices in the regular grid in the horizontal direction.
   * @param {Number} height The number of vertices in the regular grid in the vertical direction.
   * @returns {Uint16Array|Uint32Array} The list of indices. Uint16Array gets returned for 64KB or less and Uint32Array for 4GB or less.
   */
  TerrainProvider.getRegularGridIndices = function (width, height) {
    //>>includeStart('debug', pragmas.debug);
    if (width * height >= ComponentDatatype.CesiumMath.FOUR_GIGABYTES) {
      throw new RuntimeError.DeveloperError(
        "The total number of vertices (width * height) must be less than 4,294,967,296."
      );
    }
    //>>includeEnd('debug');

    let byWidth = regularGridIndicesCache[width];
    if (!defaultValue.defined(byWidth)) {
      regularGridIndicesCache[width] = byWidth = [];
    }

    let indices = byWidth[height];
    if (!defaultValue.defined(indices)) {
      if (width * height < ComponentDatatype.CesiumMath.SIXTY_FOUR_KILOBYTES) {
        indices = byWidth[height] = new Uint16Array(
          (width - 1) * (height - 1) * 6
        );
      } else {
        indices = byWidth[height] = new Uint32Array(
          (width - 1) * (height - 1) * 6
        );
      }
      addRegularGridIndices(width, height, indices, 0);
    }

    return indices;
  };

  const regularGridAndEdgeIndicesCache = [];

  /**
   * @private
   */
  TerrainProvider.getRegularGridIndicesAndEdgeIndices = function (width, height) {
    //>>includeStart('debug', pragmas.debug);
    if (width * height >= ComponentDatatype.CesiumMath.FOUR_GIGABYTES) {
      throw new RuntimeError.DeveloperError(
        "The total number of vertices (width * height) must be less than 4,294,967,296."
      );
    }
    //>>includeEnd('debug');

    let byWidth = regularGridAndEdgeIndicesCache[width];
    if (!defaultValue.defined(byWidth)) {
      regularGridAndEdgeIndicesCache[width] = byWidth = [];
    }

    let indicesAndEdges = byWidth[height];
    if (!defaultValue.defined(indicesAndEdges)) {
      const indices = TerrainProvider.getRegularGridIndices(width, height);

      const edgeIndices = getEdgeIndices(width, height);
      const westIndicesSouthToNorth = edgeIndices.westIndicesSouthToNorth;
      const southIndicesEastToWest = edgeIndices.southIndicesEastToWest;
      const eastIndicesNorthToSouth = edgeIndices.eastIndicesNorthToSouth;
      const northIndicesWestToEast = edgeIndices.northIndicesWestToEast;

      indicesAndEdges = byWidth[height] = {
        indices: indices,
        westIndicesSouthToNorth: westIndicesSouthToNorth,
        southIndicesEastToWest: southIndicesEastToWest,
        eastIndicesNorthToSouth: eastIndicesNorthToSouth,
        northIndicesWestToEast: northIndicesWestToEast,
      };
    }

    return indicesAndEdges;
  };

  const regularGridAndSkirtAndEdgeIndicesCache = [];

  /**
   * @private
   */
  TerrainProvider.getRegularGridAndSkirtIndicesAndEdgeIndices = function (
    width,
    height
  ) {
    //>>includeStart('debug', pragmas.debug);
    if (width * height >= ComponentDatatype.CesiumMath.FOUR_GIGABYTES) {
      throw new RuntimeError.DeveloperError(
        "The total number of vertices (width * height) must be less than 4,294,967,296."
      );
    }
    //>>includeEnd('debug');

    let byWidth = regularGridAndSkirtAndEdgeIndicesCache[width];
    if (!defaultValue.defined(byWidth)) {
      regularGridAndSkirtAndEdgeIndicesCache[width] = byWidth = [];
    }

    let indicesAndEdges = byWidth[height];
    if (!defaultValue.defined(indicesAndEdges)) {
      const gridVertexCount = width * height;
      const gridIndexCount = (width - 1) * (height - 1) * 6;
      const edgeVertexCount = width * 2 + height * 2;
      const edgeIndexCount = Math.max(0, edgeVertexCount - 4) * 6;
      const vertexCount = gridVertexCount + edgeVertexCount;
      const indexCount = gridIndexCount + edgeIndexCount;

      const edgeIndices = getEdgeIndices(width, height);
      const westIndicesSouthToNorth = edgeIndices.westIndicesSouthToNorth;
      const southIndicesEastToWest = edgeIndices.southIndicesEastToWest;
      const eastIndicesNorthToSouth = edgeIndices.eastIndicesNorthToSouth;
      const northIndicesWestToEast = edgeIndices.northIndicesWestToEast;

      const indices = IndexDatatype.IndexDatatype.createTypedArray(vertexCount, indexCount);
      addRegularGridIndices(width, height, indices, 0);
      TerrainProvider.addSkirtIndices(
        westIndicesSouthToNorth,
        southIndicesEastToWest,
        eastIndicesNorthToSouth,
        northIndicesWestToEast,
        gridVertexCount,
        indices,
        gridIndexCount
      );

      indicesAndEdges = byWidth[height] = {
        indices: indices,
        westIndicesSouthToNorth: westIndicesSouthToNorth,
        southIndicesEastToWest: southIndicesEastToWest,
        eastIndicesNorthToSouth: eastIndicesNorthToSouth,
        northIndicesWestToEast: northIndicesWestToEast,
        indexCountWithoutSkirts: gridIndexCount,
      };
    }

    return indicesAndEdges;
  };

  /**
   * @private
   */
  TerrainProvider.addSkirtIndices = function (
    westIndicesSouthToNorth,
    southIndicesEastToWest,
    eastIndicesNorthToSouth,
    northIndicesWestToEast,
    vertexCount,
    indices,
    offset
  ) {
    let vertexIndex = vertexCount;
    offset = addSkirtIndices(
      westIndicesSouthToNorth,
      vertexIndex,
      indices,
      offset
    );
    vertexIndex += westIndicesSouthToNorth.length;
    offset = addSkirtIndices(
      southIndicesEastToWest,
      vertexIndex,
      indices,
      offset
    );
    vertexIndex += southIndicesEastToWest.length;
    offset = addSkirtIndices(
      eastIndicesNorthToSouth,
      vertexIndex,
      indices,
      offset
    );
    vertexIndex += eastIndicesNorthToSouth.length;
    addSkirtIndices(northIndicesWestToEast, vertexIndex, indices, offset);
  };

  function getEdgeIndices(width, height) {
    const westIndicesSouthToNorth = new Array(height);
    const southIndicesEastToWest = new Array(width);
    const eastIndicesNorthToSouth = new Array(height);
    const northIndicesWestToEast = new Array(width);

    let i;
    for (i = 0; i < width; ++i) {
      northIndicesWestToEast[i] = i;
      southIndicesEastToWest[i] = width * height - 1 - i;
    }

    for (i = 0; i < height; ++i) {
      eastIndicesNorthToSouth[i] = (i + 1) * width - 1;
      westIndicesSouthToNorth[i] = (height - i - 1) * width;
    }

    return {
      westIndicesSouthToNorth: westIndicesSouthToNorth,
      southIndicesEastToWest: southIndicesEastToWest,
      eastIndicesNorthToSouth: eastIndicesNorthToSouth,
      northIndicesWestToEast: northIndicesWestToEast,
    };
  }

  function addRegularGridIndices(width, height, indices, offset) {
    let index = 0;
    for (let j = 0; j < height - 1; ++j) {
      for (let i = 0; i < width - 1; ++i) {
        const upperLeft = index;
        const lowerLeft = upperLeft + width;
        const lowerRight = lowerLeft + 1;
        const upperRight = upperLeft + 1;

        indices[offset++] = upperLeft;
        indices[offset++] = lowerLeft;
        indices[offset++] = upperRight;
        indices[offset++] = upperRight;
        indices[offset++] = lowerLeft;
        indices[offset++] = lowerRight;

        ++index;
      }
      ++index;
    }
  }

  function addSkirtIndices(edgeIndices, vertexIndex, indices, offset) {
    let previousIndex = edgeIndices[0];

    const length = edgeIndices.length;
    for (let i = 1; i < length; ++i) {
      const index = edgeIndices[i];

      indices[offset++] = previousIndex;
      indices[offset++] = index;
      indices[offset++] = vertexIndex;

      indices[offset++] = vertexIndex;
      indices[offset++] = index;
      indices[offset++] = vertexIndex + 1;

      previousIndex = index;
      ++vertexIndex;
    }

    return offset;
  }

  /**
   * Specifies the quality of terrain created from heightmaps.  A value of 1.0 will
   * ensure that adjacent heightmap vertices are separated by no more than
   * {@link Globe.maximumScreenSpaceError} screen pixels and will probably go very slowly.
   * A value of 0.5 will cut the estimated level zero geometric error in half, allowing twice the
   * screen pixels between adjacent heightmap vertices and thus rendering more quickly.
   * @type {Number}
   */
  TerrainProvider.heightmapTerrainQuality = 0.25;

  /**
   * Determines an appropriate geometric error estimate when the geometry comes from a heightmap.
   *
   * @param {Ellipsoid} ellipsoid The ellipsoid to which the terrain is attached.
   * @param {Number} tileImageWidth The width, in pixels, of the heightmap associated with a single tile.
   * @param {Number} numberOfTilesAtLevelZero The number of tiles in the horizontal direction at tile level zero.
   * @returns {Number} An estimated geometric error.
   */
  TerrainProvider.getEstimatedLevelZeroGeometricErrorForAHeightmap = function (
    ellipsoid,
    tileImageWidth,
    numberOfTilesAtLevelZero
  ) {
    return (
      (ellipsoid.maximumRadius *
        2 *
        Math.PI *
        TerrainProvider.heightmapTerrainQuality) /
      (tileImageWidth * numberOfTilesAtLevelZero)
    );
  };

  /**
   * Requests the geometry for a given tile.  This function should not be called before
   * {@link TerrainProvider#ready} returns true.  The result must include terrain data and
   * may optionally include a water mask and an indication of which child tiles are available.
   * @function
   *
   * @param {Number} x The X coordinate of the tile for which to request geometry.
   * @param {Number} y The Y coordinate of the tile for which to request geometry.
   * @param {Number} level The level of the tile for which to request geometry.
   * @param {Request} [request] The request object. Intended for internal use only.
   *
   * @returns {Promise.<TerrainData>|undefined} A promise for the requested geometry.  If this method
   *          returns undefined instead of a promise, it is an indication that too many requests are already
   *          pending and the request will be retried later.
   */
  TerrainProvider.prototype.requestTileGeometry =
    RuntimeError.DeveloperError.throwInstantiationError;

  /**
   * Gets the maximum geometric error allowed in a tile at a given level.  This function should not be
   * called before {@link TerrainProvider#ready} returns true.
   * @function
   *
   * @param {Number} level The tile level for which to get the maximum geometric error.
   * @returns {Number} The maximum geometric error.
   */
  TerrainProvider.prototype.getLevelMaximumGeometricError =
    RuntimeError.DeveloperError.throwInstantiationError;

  /**
   * Determines whether data for a tile is available to be loaded.
   * @function
   *
   * @param {Number} x The X coordinate of the tile for which to request geometry.
   * @param {Number} y The Y coordinate of the tile for which to request geometry.
   * @param {Number} level The level of the tile for which to request geometry.
   * @returns {Boolean|undefined} Undefined if not supported by the terrain provider, otherwise true or false.
   */
  TerrainProvider.prototype.getTileDataAvailable =
    RuntimeError.DeveloperError.throwInstantiationError;

  /**
   * Makes sure we load availability data for a tile
   * @function
   *
   * @param {Number} x The X coordinate of the tile for which to request geometry.
   * @param {Number} y The Y coordinate of the tile for which to request geometry.
   * @param {Number} level The level of the tile for which to request geometry.
   * @returns {undefined|Promise<void>} Undefined if nothing need to be loaded or a Promise that resolves when all required tiles are loaded
   */
  TerrainProvider.prototype.loadTileDataAvailability =
    RuntimeError.DeveloperError.throwInstantiationError;

  /**
   * A function that is called when an error occurs.
   * @callback TerrainProvider.ErrorEvent
   *
   * @this TerrainProvider
   * @param {TileProviderError} err An object holding details about the error that occurred.
   */

  const maxShort = 32767;

  const cartesian3Scratch = new Matrix2.Cartesian3();
  const scratchMinimum = new Matrix2.Cartesian3();
  const scratchMaximum = new Matrix2.Cartesian3();
  const cartographicScratch = new Matrix2.Cartographic();
  const toPack = new Matrix2.Cartesian2();

  function createVerticesFromQuantizedTerrainMesh(
    parameters,
    transferableObjects
  ) {
    const quantizedVertices = parameters.quantizedVertices;
    const quantizedVertexCount = quantizedVertices.length / 3;
    const octEncodedNormals = parameters.octEncodedNormals;
    const edgeVertexCount =
      parameters.westIndices.length +
      parameters.eastIndices.length +
      parameters.southIndices.length +
      parameters.northIndices.length;
    const includeWebMercatorT = parameters.includeWebMercatorT;

    const exaggeration = parameters.exaggeration;
    const exaggerationRelativeHeight = parameters.exaggerationRelativeHeight;
    const hasExaggeration = exaggeration !== 1.0;
    const includeGeodeticSurfaceNormals = hasExaggeration;

    const rectangle = Matrix2.Rectangle.clone(parameters.rectangle);
    const west = rectangle.west;
    const south = rectangle.south;
    const east = rectangle.east;
    const north = rectangle.north;

    const ellipsoid = Matrix2.Ellipsoid.clone(parameters.ellipsoid);

    const minimumHeight = parameters.minimumHeight;
    const maximumHeight = parameters.maximumHeight;

    const center = parameters.relativeToCenter;
    const fromENU = Transforms.Transforms.eastNorthUpToFixedFrame(center, ellipsoid);
    const toENU = Matrix2.Matrix4.inverseTransformation(fromENU, new Matrix2.Matrix4());

    let southMercatorY;
    let oneOverMercatorHeight;
    if (includeWebMercatorT) {
      southMercatorY = WebMercatorProjection.WebMercatorProjection.geodeticLatitudeToMercatorAngle(
        south
      );
      oneOverMercatorHeight =
        1.0 /
        (WebMercatorProjection.WebMercatorProjection.geodeticLatitudeToMercatorAngle(north) -
          southMercatorY);
    }

    const uBuffer = quantizedVertices.subarray(0, quantizedVertexCount);
    const vBuffer = quantizedVertices.subarray(
      quantizedVertexCount,
      2 * quantizedVertexCount
    );
    const heightBuffer = quantizedVertices.subarray(
      quantizedVertexCount * 2,
      3 * quantizedVertexCount
    );
    const hasVertexNormals = defaultValue.defined(octEncodedNormals);

    const uvs = new Array(quantizedVertexCount);
    const heights = new Array(quantizedVertexCount);
    const positions = new Array(quantizedVertexCount);
    const webMercatorTs = includeWebMercatorT
      ? new Array(quantizedVertexCount)
      : [];
    const geodeticSurfaceNormals = includeGeodeticSurfaceNormals
      ? new Array(quantizedVertexCount)
      : [];

    const minimum = scratchMinimum;
    minimum.x = Number.POSITIVE_INFINITY;
    minimum.y = Number.POSITIVE_INFINITY;
    minimum.z = Number.POSITIVE_INFINITY;

    const maximum = scratchMaximum;
    maximum.x = Number.NEGATIVE_INFINITY;
    maximum.y = Number.NEGATIVE_INFINITY;
    maximum.z = Number.NEGATIVE_INFINITY;

    let minLongitude = Number.POSITIVE_INFINITY;
    let maxLongitude = Number.NEGATIVE_INFINITY;
    let minLatitude = Number.POSITIVE_INFINITY;
    let maxLatitude = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < quantizedVertexCount; ++i) {
      const rawU = uBuffer[i];
      const rawV = vBuffer[i];

      const u = rawU / maxShort;
      const v = rawV / maxShort;
      const height = ComponentDatatype.CesiumMath.lerp(
        minimumHeight,
        maximumHeight,
        heightBuffer[i] / maxShort
      );

      cartographicScratch.longitude = ComponentDatatype.CesiumMath.lerp(west, east, u);
      cartographicScratch.latitude = ComponentDatatype.CesiumMath.lerp(south, north, v);
      cartographicScratch.height = height;

      minLongitude = Math.min(cartographicScratch.longitude, minLongitude);
      maxLongitude = Math.max(cartographicScratch.longitude, maxLongitude);
      minLatitude = Math.min(cartographicScratch.latitude, minLatitude);
      maxLatitude = Math.max(cartographicScratch.latitude, maxLatitude);

      const position = ellipsoid.cartographicToCartesian(cartographicScratch);

      uvs[i] = new Matrix2.Cartesian2(u, v);
      heights[i] = height;
      positions[i] = position;

      if (includeWebMercatorT) {
        webMercatorTs[i] =
          (WebMercatorProjection.WebMercatorProjection.geodeticLatitudeToMercatorAngle(
            cartographicScratch.latitude
          ) -
            southMercatorY) *
          oneOverMercatorHeight;
      }

      if (includeGeodeticSurfaceNormals) {
        geodeticSurfaceNormals[i] = ellipsoid.geodeticSurfaceNormal(position);
      }

      Matrix2.Matrix4.multiplyByPoint(toENU, position, cartesian3Scratch);

      Matrix2.Cartesian3.minimumByComponent(cartesian3Scratch, minimum, minimum);
      Matrix2.Cartesian3.maximumByComponent(cartesian3Scratch, maximum, maximum);
    }

    const westIndicesSouthToNorth = copyAndSort(parameters.westIndices, function (
      a,
      b
    ) {
      return uvs[a].y - uvs[b].y;
    });
    const eastIndicesNorthToSouth = copyAndSort(parameters.eastIndices, function (
      a,
      b
    ) {
      return uvs[b].y - uvs[a].y;
    });
    const southIndicesEastToWest = copyAndSort(parameters.southIndices, function (
      a,
      b
    ) {
      return uvs[b].x - uvs[a].x;
    });
    const northIndicesWestToEast = copyAndSort(parameters.northIndices, function (
      a,
      b
    ) {
      return uvs[a].x - uvs[b].x;
    });

    let occludeePointInScaledSpace;
    if (minimumHeight < 0.0) {
      // Horizon culling point needs to be recomputed since the tile is at least partly under the ellipsoid.
      const occluder = new TerrainEncoding.EllipsoidalOccluder(ellipsoid);
      occludeePointInScaledSpace = occluder.computeHorizonCullingPointPossiblyUnderEllipsoid(
        center,
        positions,
        minimumHeight
      );
    }

    let hMin = minimumHeight;
    hMin = Math.min(
      hMin,
      findMinMaxSkirts(
        parameters.westIndices,
        parameters.westSkirtHeight,
        heights,
        uvs,
        rectangle,
        ellipsoid,
        toENU,
        minimum,
        maximum
      )
    );
    hMin = Math.min(
      hMin,
      findMinMaxSkirts(
        parameters.southIndices,
        parameters.southSkirtHeight,
        heights,
        uvs,
        rectangle,
        ellipsoid,
        toENU,
        minimum,
        maximum
      )
    );
    hMin = Math.min(
      hMin,
      findMinMaxSkirts(
        parameters.eastIndices,
        parameters.eastSkirtHeight,
        heights,
        uvs,
        rectangle,
        ellipsoid,
        toENU,
        minimum,
        maximum
      )
    );
    hMin = Math.min(
      hMin,
      findMinMaxSkirts(
        parameters.northIndices,
        parameters.northSkirtHeight,
        heights,
        uvs,
        rectangle,
        ellipsoid,
        toENU,
        minimum,
        maximum
      )
    );

    const aaBox = new AxisAlignedBoundingBox.AxisAlignedBoundingBox(minimum, maximum, center);
    const encoding = new TerrainEncoding.TerrainEncoding(
      center,
      aaBox,
      hMin,
      maximumHeight,
      fromENU,
      hasVertexNormals,
      includeWebMercatorT,
      includeGeodeticSurfaceNormals,
      exaggeration,
      exaggerationRelativeHeight
    );
    const vertexStride = encoding.stride;
    const size =
      quantizedVertexCount * vertexStride + edgeVertexCount * vertexStride;
    const vertexBuffer = new Float32Array(size);

    let bufferIndex = 0;
    for (let j = 0; j < quantizedVertexCount; ++j) {
      if (hasVertexNormals) {
        const n = j * 2.0;
        toPack.x = octEncodedNormals[n];
        toPack.y = octEncodedNormals[n + 1];
      }

      bufferIndex = encoding.encode(
        vertexBuffer,
        bufferIndex,
        positions[j],
        uvs[j],
        heights[j],
        toPack,
        webMercatorTs[j],
        geodeticSurfaceNormals[j]
      );
    }

    const edgeTriangleCount = Math.max(0, (edgeVertexCount - 4) * 2);
    const indexBufferLength = parameters.indices.length + edgeTriangleCount * 3;
    const indexBuffer = IndexDatatype.IndexDatatype.createTypedArray(
      quantizedVertexCount + edgeVertexCount,
      indexBufferLength
    );
    indexBuffer.set(parameters.indices, 0);

    const percentage = 0.0001;
    const lonOffset = (maxLongitude - minLongitude) * percentage;
    const latOffset = (maxLatitude - minLatitude) * percentage;
    const westLongitudeOffset = -lonOffset;
    const westLatitudeOffset = 0.0;
    const eastLongitudeOffset = lonOffset;
    const eastLatitudeOffset = 0.0;
    const northLongitudeOffset = 0.0;
    const northLatitudeOffset = latOffset;
    const southLongitudeOffset = 0.0;
    const southLatitudeOffset = -latOffset;

    // Add skirts.
    let vertexBufferIndex = quantizedVertexCount * vertexStride;
    addSkirt(
      vertexBuffer,
      vertexBufferIndex,
      westIndicesSouthToNorth,
      encoding,
      heights,
      uvs,
      octEncodedNormals,
      ellipsoid,
      rectangle,
      parameters.westSkirtHeight,
      southMercatorY,
      oneOverMercatorHeight,
      westLongitudeOffset,
      westLatitudeOffset
    );
    vertexBufferIndex += parameters.westIndices.length * vertexStride;
    addSkirt(
      vertexBuffer,
      vertexBufferIndex,
      southIndicesEastToWest,
      encoding,
      heights,
      uvs,
      octEncodedNormals,
      ellipsoid,
      rectangle,
      parameters.southSkirtHeight,
      southMercatorY,
      oneOverMercatorHeight,
      southLongitudeOffset,
      southLatitudeOffset
    );
    vertexBufferIndex += parameters.southIndices.length * vertexStride;
    addSkirt(
      vertexBuffer,
      vertexBufferIndex,
      eastIndicesNorthToSouth,
      encoding,
      heights,
      uvs,
      octEncodedNormals,
      ellipsoid,
      rectangle,
      parameters.eastSkirtHeight,
      southMercatorY,
      oneOverMercatorHeight,
      eastLongitudeOffset,
      eastLatitudeOffset
    );
    vertexBufferIndex += parameters.eastIndices.length * vertexStride;
    addSkirt(
      vertexBuffer,
      vertexBufferIndex,
      northIndicesWestToEast,
      encoding,
      heights,
      uvs,
      octEncodedNormals,
      ellipsoid,
      rectangle,
      parameters.northSkirtHeight,
      southMercatorY,
      oneOverMercatorHeight,
      northLongitudeOffset,
      northLatitudeOffset
    );

    TerrainProvider.addSkirtIndices(
      westIndicesSouthToNorth,
      southIndicesEastToWest,
      eastIndicesNorthToSouth,
      northIndicesWestToEast,
      quantizedVertexCount,
      indexBuffer,
      parameters.indices.length
    );

    transferableObjects.push(vertexBuffer.buffer, indexBuffer.buffer);

    return {
      vertices: vertexBuffer.buffer,
      indices: indexBuffer.buffer,
      westIndicesSouthToNorth: westIndicesSouthToNorth,
      southIndicesEastToWest: southIndicesEastToWest,
      eastIndicesNorthToSouth: eastIndicesNorthToSouth,
      northIndicesWestToEast: northIndicesWestToEast,
      vertexStride: vertexStride,
      center: center,
      minimumHeight: minimumHeight,
      maximumHeight: maximumHeight,
      occludeePointInScaledSpace: occludeePointInScaledSpace,
      encoding: encoding,
      indexCountWithoutSkirts: parameters.indices.length,
    };
  }

  function findMinMaxSkirts(
    edgeIndices,
    edgeHeight,
    heights,
    uvs,
    rectangle,
    ellipsoid,
    toENU,
    minimum,
    maximum
  ) {
    let hMin = Number.POSITIVE_INFINITY;

    const north = rectangle.north;
    const south = rectangle.south;
    let east = rectangle.east;
    const west = rectangle.west;

    if (east < west) {
      east += ComponentDatatype.CesiumMath.TWO_PI;
    }

    const length = edgeIndices.length;
    for (let i = 0; i < length; ++i) {
      const index = edgeIndices[i];
      const h = heights[index];
      const uv = uvs[index];

      cartographicScratch.longitude = ComponentDatatype.CesiumMath.lerp(west, east, uv.x);
      cartographicScratch.latitude = ComponentDatatype.CesiumMath.lerp(south, north, uv.y);
      cartographicScratch.height = h - edgeHeight;

      const position = ellipsoid.cartographicToCartesian(
        cartographicScratch,
        cartesian3Scratch
      );
      Matrix2.Matrix4.multiplyByPoint(toENU, position, position);

      Matrix2.Cartesian3.minimumByComponent(position, minimum, minimum);
      Matrix2.Cartesian3.maximumByComponent(position, maximum, maximum);

      hMin = Math.min(hMin, cartographicScratch.height);
    }
    return hMin;
  }

  function addSkirt(
    vertexBuffer,
    vertexBufferIndex,
    edgeVertices,
    encoding,
    heights,
    uvs,
    octEncodedNormals,
    ellipsoid,
    rectangle,
    skirtLength,
    southMercatorY,
    oneOverMercatorHeight,
    longitudeOffset,
    latitudeOffset
  ) {
    const hasVertexNormals = defaultValue.defined(octEncodedNormals);

    const north = rectangle.north;
    const south = rectangle.south;
    let east = rectangle.east;
    const west = rectangle.west;

    if (east < west) {
      east += ComponentDatatype.CesiumMath.TWO_PI;
    }

    const length = edgeVertices.length;
    for (let i = 0; i < length; ++i) {
      const index = edgeVertices[i];
      const h = heights[index];
      const uv = uvs[index];

      cartographicScratch.longitude =
        ComponentDatatype.CesiumMath.lerp(west, east, uv.x) + longitudeOffset;
      cartographicScratch.latitude =
        ComponentDatatype.CesiumMath.lerp(south, north, uv.y) + latitudeOffset;
      cartographicScratch.height = h - skirtLength;

      const position = ellipsoid.cartographicToCartesian(
        cartographicScratch,
        cartesian3Scratch
      );

      if (hasVertexNormals) {
        const n = index * 2.0;
        toPack.x = octEncodedNormals[n];
        toPack.y = octEncodedNormals[n + 1];
      }

      let webMercatorT;
      if (encoding.hasWebMercatorT) {
        webMercatorT =
          (WebMercatorProjection.WebMercatorProjection.geodeticLatitudeToMercatorAngle(
            cartographicScratch.latitude
          ) -
            southMercatorY) *
          oneOverMercatorHeight;
      }

      let geodeticSurfaceNormal;
      if (encoding.hasGeodeticSurfaceNormals) {
        geodeticSurfaceNormal = ellipsoid.geodeticSurfaceNormal(position);
      }

      vertexBufferIndex = encoding.encode(
        vertexBuffer,
        vertexBufferIndex,
        position,
        uv,
        cartographicScratch.height,
        toPack,
        webMercatorT,
        geodeticSurfaceNormal
      );
    }
  }

  function copyAndSort(typedArray, comparator) {
    let copy;
    if (typeof typedArray.slice === "function") {
      copy = typedArray.slice();
      if (typeof copy.sort !== "function") {
        // Sliced typed array isn't sortable, so we can't use it.
        copy = undefined;
      }
    }

    if (!defaultValue.defined(copy)) {
      copy = Array.prototype.slice.call(typedArray);
    }

    copy.sort(comparator);

    return copy;
  }
  var createVerticesFromQuantizedTerrainMesh$1 = createTaskProcessorWorker(
    createVerticesFromQuantizedTerrainMesh
  );

  return createVerticesFromQuantizedTerrainMesh$1;

}));
//# sourceMappingURL=createVerticesFromQuantizedTerrainMesh.js.map
