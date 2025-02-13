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

define(['exports', './GeometryOffsetAttribute-2bff0974', './Transforms-fe4a2875', './Matrix2-a67cd174', './ComponentDatatype-0f8fc942', './defaultValue-81eec7ed', './RuntimeError-8952249c', './EllipseGeometryLibrary-148bd7a8', './GeometryAttribute-013ac666', './GeometryAttributes-32b29525', './IndexDatatype-2261ba8d'], (function (exports, GeometryOffsetAttribute, Transforms, Matrix2, ComponentDatatype, defaultValue, RuntimeError, EllipseGeometryLibrary, GeometryAttribute, GeometryAttributes, IndexDatatype) { 'use strict';

  const scratchCartesian1 = new Matrix2.Cartesian3();
  let boundingSphereCenter = new Matrix2.Cartesian3();

  function computeEllipse(options) {
    const center = options.center;
    boundingSphereCenter = Matrix2.Cartesian3.multiplyByScalar(
      options.ellipsoid.geodeticSurfaceNormal(center, boundingSphereCenter),
      options.height,
      boundingSphereCenter
    );
    boundingSphereCenter = Matrix2.Cartesian3.add(
      center,
      boundingSphereCenter,
      boundingSphereCenter
    );
    const boundingSphere = new Transforms.BoundingSphere(
      boundingSphereCenter,
      options.semiMajorAxis
    );
    const positions = EllipseGeometryLibrary.EllipseGeometryLibrary.computeEllipsePositions(
      options,
      false,
      true
    ).outerPositions;

    const attributes = new GeometryAttributes.GeometryAttributes({
      position: new GeometryAttribute.GeometryAttribute({
        componentDatatype: ComponentDatatype.ComponentDatatype.DOUBLE,
        componentsPerAttribute: 3,
        values: EllipseGeometryLibrary.EllipseGeometryLibrary.raisePositionsToHeight(
          positions,
          options,
          false
        ),
      }),
    });

    const length = positions.length / 3;
    const indices = IndexDatatype.IndexDatatype.createTypedArray(length, length * 2);
    let index = 0;
    for (let i = 0; i < length; ++i) {
      indices[index++] = i;
      indices[index++] = (i + 1) % length;
    }

    return {
      boundingSphere: boundingSphere,
      attributes: attributes,
      indices: indices,
    };
  }

  const topBoundingSphere = new Transforms.BoundingSphere();
  const bottomBoundingSphere = new Transforms.BoundingSphere();
  function computeExtrudedEllipse(options) {
    const center = options.center;
    const ellipsoid = options.ellipsoid;
    const semiMajorAxis = options.semiMajorAxis;
    let scaledNormal = Matrix2.Cartesian3.multiplyByScalar(
      ellipsoid.geodeticSurfaceNormal(center, scratchCartesian1),
      options.height,
      scratchCartesian1
    );
    topBoundingSphere.center = Matrix2.Cartesian3.add(
      center,
      scaledNormal,
      topBoundingSphere.center
    );
    topBoundingSphere.radius = semiMajorAxis;

    scaledNormal = Matrix2.Cartesian3.multiplyByScalar(
      ellipsoid.geodeticSurfaceNormal(center, scaledNormal),
      options.extrudedHeight,
      scaledNormal
    );
    bottomBoundingSphere.center = Matrix2.Cartesian3.add(
      center,
      scaledNormal,
      bottomBoundingSphere.center
    );
    bottomBoundingSphere.radius = semiMajorAxis;

    let positions = EllipseGeometryLibrary.EllipseGeometryLibrary.computeEllipsePositions(
      options,
      false,
      true
    ).outerPositions;
    const attributes = new GeometryAttributes.GeometryAttributes({
      position: new GeometryAttribute.GeometryAttribute({
        componentDatatype: ComponentDatatype.ComponentDatatype.DOUBLE,
        componentsPerAttribute: 3,
        values: EllipseGeometryLibrary.EllipseGeometryLibrary.raisePositionsToHeight(
          positions,
          options,
          true
        ),
      }),
    });

    positions = attributes.position.values;
    const boundingSphere = Transforms.BoundingSphere.union(
      topBoundingSphere,
      bottomBoundingSphere
    );
    let length = positions.length / 3;

    if (defaultValue.defined(options.offsetAttribute)) {
      let applyOffset = new Uint8Array(length);
      if (options.offsetAttribute === GeometryOffsetAttribute.GeometryOffsetAttribute.TOP) {
        applyOffset = GeometryOffsetAttribute.arrayFill(applyOffset, 1, 0, length / 2);
      } else {
        const offsetValue =
          options.offsetAttribute === GeometryOffsetAttribute.GeometryOffsetAttribute.NONE ? 0 : 1;
        applyOffset = GeometryOffsetAttribute.arrayFill(applyOffset, offsetValue);
      }

      attributes.applyOffset = new GeometryAttribute.GeometryAttribute({
        componentDatatype: ComponentDatatype.ComponentDatatype.UNSIGNED_BYTE,
        componentsPerAttribute: 1,
        values: applyOffset,
      });
    }

    let numberOfVerticalLines = defaultValue.defaultValue(options.numberOfVerticalLines, 16);
    numberOfVerticalLines = ComponentDatatype.CesiumMath.clamp(
      numberOfVerticalLines,
      0,
      length / 2
    );

    const indices = IndexDatatype.IndexDatatype.createTypedArray(
      length,
      length * 2 + numberOfVerticalLines * 2
    );

    length /= 2;
    let index = 0;
    let i;
    for (i = 0; i < length; ++i) {
      indices[index++] = i;
      indices[index++] = (i + 1) % length;
      indices[index++] = i + length;
      indices[index++] = ((i + 1) % length) + length;
    }

    let numSide;
    if (numberOfVerticalLines > 0) {
      const numSideLines = Math.min(numberOfVerticalLines, length);
      numSide = Math.round(length / numSideLines);

      const maxI = Math.min(numSide * numberOfVerticalLines, length);
      for (i = 0; i < maxI; i += numSide) {
        indices[index++] = i;
        indices[index++] = i + length;
      }
    }

    return {
      boundingSphere: boundingSphere,
      attributes: attributes,
      indices: indices,
    };
  }

  /**
   * A description of the outline of an ellipse on an ellipsoid.
   *
   * @alias EllipseOutlineGeometry
   * @constructor
   *
   * @param {Object} options Object with the following properties:
   * @param {Cartesian3} options.center The ellipse's center point in the fixed frame.
   * @param {Number} options.semiMajorAxis The length of the ellipse's semi-major axis in meters.
   * @param {Number} options.semiMinorAxis The length of the ellipse's semi-minor axis in meters.
   * @param {Ellipsoid} [options.ellipsoid=Ellipsoid.WGS84] The ellipsoid the ellipse will be on.
   * @param {Number} [options.height=0.0] The distance in meters between the ellipse and the ellipsoid surface.
   * @param {Number} [options.extrudedHeight] The distance in meters between the ellipse's extruded face and the ellipsoid surface.
   * @param {Number} [options.rotation=0.0] The angle from north (counter-clockwise) in radians.
   * @param {Number} [options.granularity=0.02] The angular distance between points on the ellipse in radians.
   * @param {Number} [options.numberOfVerticalLines=16] Number of lines to draw between the top and bottom surface of an extruded ellipse.
   *
   * @exception {DeveloperError} semiMajorAxis and semiMinorAxis must be greater than zero.
   * @exception {DeveloperError} semiMajorAxis must be greater than or equal to the semiMinorAxis.
   * @exception {DeveloperError} granularity must be greater than zero.
   *
   * @see EllipseOutlineGeometry.createGeometry
   *
   * @example
   * const ellipse = new Cesium.EllipseOutlineGeometry({
   *   center : Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883),
   *   semiMajorAxis : 500000.0,
   *   semiMinorAxis : 300000.0,
   *   rotation : Cesium.Math.toRadians(60.0)
   * });
   * const geometry = Cesium.EllipseOutlineGeometry.createGeometry(ellipse);
   */
  function EllipseOutlineGeometry(options) {
    options = defaultValue.defaultValue(options, defaultValue.defaultValue.EMPTY_OBJECT);

    const center = options.center;
    const ellipsoid = defaultValue.defaultValue(options.ellipsoid, Matrix2.Ellipsoid.WGS84);
    const semiMajorAxis = options.semiMajorAxis;
    const semiMinorAxis = options.semiMinorAxis;
    const granularity = defaultValue.defaultValue(
      options.granularity,
      ComponentDatatype.CesiumMath.RADIANS_PER_DEGREE
    );

    //>>includeStart('debug', pragmas.debug);
    if (!defaultValue.defined(center)) {
      throw new RuntimeError.DeveloperError("center is required.");
    }
    if (!defaultValue.defined(semiMajorAxis)) {
      throw new RuntimeError.DeveloperError("semiMajorAxis is required.");
    }
    if (!defaultValue.defined(semiMinorAxis)) {
      throw new RuntimeError.DeveloperError("semiMinorAxis is required.");
    }
    if (semiMajorAxis < semiMinorAxis) {
      throw new RuntimeError.DeveloperError(
        "semiMajorAxis must be greater than or equal to the semiMinorAxis."
      );
    }
    if (granularity <= 0.0) {
      throw new RuntimeError.DeveloperError("granularity must be greater than zero.");
    }
    //>>includeEnd('debug');

    const height = defaultValue.defaultValue(options.height, 0.0);
    const extrudedHeight = defaultValue.defaultValue(options.extrudedHeight, height);

    this._center = Matrix2.Cartesian3.clone(center);
    this._semiMajorAxis = semiMajorAxis;
    this._semiMinorAxis = semiMinorAxis;
    this._ellipsoid = Matrix2.Ellipsoid.clone(ellipsoid);
    this._rotation = defaultValue.defaultValue(options.rotation, 0.0);
    this._height = Math.max(extrudedHeight, height);
    this._granularity = granularity;
    this._extrudedHeight = Math.min(extrudedHeight, height);
    this._numberOfVerticalLines = Math.max(
      defaultValue.defaultValue(options.numberOfVerticalLines, 16),
      0
    );
    this._offsetAttribute = options.offsetAttribute;
    this._workerName = "createEllipseOutlineGeometry";
  }

  /**
   * The number of elements used to pack the object into an array.
   * @type {Number}
   */
  EllipseOutlineGeometry.packedLength =
    Matrix2.Cartesian3.packedLength + Matrix2.Ellipsoid.packedLength + 8;

  /**
   * Stores the provided instance into the provided array.
   *
   * @param {EllipseOutlineGeometry} value The value to pack.
   * @param {Number[]} array The array to pack into.
   * @param {Number} [startingIndex=0] The index into the array at which to start packing the elements.
   *
   * @returns {Number[]} The array that was packed into
   */
  EllipseOutlineGeometry.pack = function (value, array, startingIndex) {
    //>>includeStart('debug', pragmas.debug);
    if (!defaultValue.defined(value)) {
      throw new RuntimeError.DeveloperError("value is required");
    }
    if (!defaultValue.defined(array)) {
      throw new RuntimeError.DeveloperError("array is required");
    }
    //>>includeEnd('debug');

    startingIndex = defaultValue.defaultValue(startingIndex, 0);

    Matrix2.Cartesian3.pack(value._center, array, startingIndex);
    startingIndex += Matrix2.Cartesian3.packedLength;

    Matrix2.Ellipsoid.pack(value._ellipsoid, array, startingIndex);
    startingIndex += Matrix2.Ellipsoid.packedLength;

    array[startingIndex++] = value._semiMajorAxis;
    array[startingIndex++] = value._semiMinorAxis;
    array[startingIndex++] = value._rotation;
    array[startingIndex++] = value._height;
    array[startingIndex++] = value._granularity;
    array[startingIndex++] = value._extrudedHeight;
    array[startingIndex++] = value._numberOfVerticalLines;
    array[startingIndex] = defaultValue.defaultValue(value._offsetAttribute, -1);

    return array;
  };

  const scratchCenter = new Matrix2.Cartesian3();
  const scratchEllipsoid = new Matrix2.Ellipsoid();
  const scratchOptions = {
    center: scratchCenter,
    ellipsoid: scratchEllipsoid,
    semiMajorAxis: undefined,
    semiMinorAxis: undefined,
    rotation: undefined,
    height: undefined,
    granularity: undefined,
    extrudedHeight: undefined,
    numberOfVerticalLines: undefined,
    offsetAttribute: undefined,
  };

  /**
   * Retrieves an instance from a packed array.
   *
   * @param {Number[]} array The packed array.
   * @param {Number} [startingIndex=0] The starting index of the element to be unpacked.
   * @param {EllipseOutlineGeometry} [result] The object into which to store the result.
   * @returns {EllipseOutlineGeometry} The modified result parameter or a new EllipseOutlineGeometry instance if one was not provided.
   */
  EllipseOutlineGeometry.unpack = function (array, startingIndex, result) {
    //>>includeStart('debug', pragmas.debug);
    if (!defaultValue.defined(array)) {
      throw new RuntimeError.DeveloperError("array is required");
    }
    //>>includeEnd('debug');

    startingIndex = defaultValue.defaultValue(startingIndex, 0);

    const center = Matrix2.Cartesian3.unpack(array, startingIndex, scratchCenter);
    startingIndex += Matrix2.Cartesian3.packedLength;

    const ellipsoid = Matrix2.Ellipsoid.unpack(array, startingIndex, scratchEllipsoid);
    startingIndex += Matrix2.Ellipsoid.packedLength;

    const semiMajorAxis = array[startingIndex++];
    const semiMinorAxis = array[startingIndex++];
    const rotation = array[startingIndex++];
    const height = array[startingIndex++];
    const granularity = array[startingIndex++];
    const extrudedHeight = array[startingIndex++];
    const numberOfVerticalLines = array[startingIndex++];
    const offsetAttribute = array[startingIndex];

    if (!defaultValue.defined(result)) {
      scratchOptions.height = height;
      scratchOptions.extrudedHeight = extrudedHeight;
      scratchOptions.granularity = granularity;
      scratchOptions.rotation = rotation;
      scratchOptions.semiMajorAxis = semiMajorAxis;
      scratchOptions.semiMinorAxis = semiMinorAxis;
      scratchOptions.numberOfVerticalLines = numberOfVerticalLines;
      scratchOptions.offsetAttribute =
        offsetAttribute === -1 ? undefined : offsetAttribute;

      return new EllipseOutlineGeometry(scratchOptions);
    }

    result._center = Matrix2.Cartesian3.clone(center, result._center);
    result._ellipsoid = Matrix2.Ellipsoid.clone(ellipsoid, result._ellipsoid);
    result._semiMajorAxis = semiMajorAxis;
    result._semiMinorAxis = semiMinorAxis;
    result._rotation = rotation;
    result._height = height;
    result._granularity = granularity;
    result._extrudedHeight = extrudedHeight;
    result._numberOfVerticalLines = numberOfVerticalLines;
    result._offsetAttribute =
      offsetAttribute === -1 ? undefined : offsetAttribute;

    return result;
  };

  /**
   * Computes the geometric representation of an outline of an ellipse on an ellipsoid, including its vertices, indices, and a bounding sphere.
   *
   * @param {EllipseOutlineGeometry} ellipseGeometry A description of the ellipse.
   * @returns {Geometry|undefined} The computed vertices and indices.
   */
  EllipseOutlineGeometry.createGeometry = function (ellipseGeometry) {
    if (
      ellipseGeometry._semiMajorAxis <= 0.0 ||
      ellipseGeometry._semiMinorAxis <= 0.0
    ) {
      return;
    }

    const height = ellipseGeometry._height;
    const extrudedHeight = ellipseGeometry._extrudedHeight;
    const extrude = !ComponentDatatype.CesiumMath.equalsEpsilon(
      height,
      extrudedHeight,
      0,
      ComponentDatatype.CesiumMath.EPSILON2
    );

    ellipseGeometry._center = ellipseGeometry._ellipsoid.scaleToGeodeticSurface(
      ellipseGeometry._center,
      ellipseGeometry._center
    );
    const options = {
      center: ellipseGeometry._center,
      semiMajorAxis: ellipseGeometry._semiMajorAxis,
      semiMinorAxis: ellipseGeometry._semiMinorAxis,
      ellipsoid: ellipseGeometry._ellipsoid,
      rotation: ellipseGeometry._rotation,
      height: height,
      granularity: ellipseGeometry._granularity,
      numberOfVerticalLines: ellipseGeometry._numberOfVerticalLines,
    };
    let geometry;
    if (extrude) {
      options.extrudedHeight = extrudedHeight;
      options.offsetAttribute = ellipseGeometry._offsetAttribute;
      geometry = computeExtrudedEllipse(options);
    } else {
      geometry = computeEllipse(options);

      if (defaultValue.defined(ellipseGeometry._offsetAttribute)) {
        const length = geometry.attributes.position.values.length;
        const applyOffset = new Uint8Array(length / 3);
        const offsetValue =
          ellipseGeometry._offsetAttribute === GeometryOffsetAttribute.GeometryOffsetAttribute.NONE
            ? 0
            : 1;
        GeometryOffsetAttribute.arrayFill(applyOffset, offsetValue);
        geometry.attributes.applyOffset = new GeometryAttribute.GeometryAttribute({
          componentDatatype: ComponentDatatype.ComponentDatatype.UNSIGNED_BYTE,
          componentsPerAttribute: 1,
          values: applyOffset,
        });
      }
    }

    return new GeometryAttribute.Geometry({
      attributes: geometry.attributes,
      indices: geometry.indices,
      primitiveType: GeometryAttribute.PrimitiveType.LINES,
      boundingSphere: geometry.boundingSphere,
      offsetAttribute: ellipseGeometry._offsetAttribute,
    });
  };

  exports.EllipseOutlineGeometry = EllipseOutlineGeometry;

}));
//# sourceMappingURL=EllipseOutlineGeometry-147455ad.js.map
