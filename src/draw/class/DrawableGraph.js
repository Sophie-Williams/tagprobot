import _ from 'lodash';

import { Graph } from '../../interpret/class/Graph';


export class DrawableGraph extends Graph {
  /**
   * @param {number} vertexThickness - radius of the vertices in pixels
   * @param {number} vertexColor - a hex color
   * @param {number} vertexAlpha - an alpha from 0.0-1.0
   */
  constructor(vertexThickness, vertexAlpha, vertexColor) {
    super();
    this.drawingsOn = false;
    this.drawingIndices = {}; // map from vertex/edge to its location in the drawing container
    this.indexToGraphObject = []; // map from index in drawing container to vertex/edge
    this.vertexThickness = vertexThickness;
    this.vertexAlpha = vertexAlpha;
    this.vertexColor = vertexColor;
    this.drawingContainer = new PIXI.DisplayObjectContainer();
  }

  turnOffDrawings() {
    if (this.drawingsOn) tagpro.renderer.layers.foreground.removeChild(this.drawingContainer);
    this.drawingsOn = false;
  }

  turnOnDrawings() {
    if (!this.drawingsOn) tagpro.renderer.layers.foreground.addChild(this.drawingContainer);
    this.drawingsOn = true;
  }

  addVertexDrawing(vertex) {
    const vertexDrawing = new PIXI.Graphics();
    vertexDrawing.lineStyle(this.vertexThickness, this.vertexColor, this.vertexAlpha);
    vertexDrawing.drawCircle(vertex.x, vertex.y, this.vertexThickness);
    this.drawingContainer.addChildAt(vertexDrawing, this.indexToGraphObject.length);
    this.drawingIndices[vertex] = this.indexToGraphObject.length;
    this.indexToGraphObject.push(vertex);
  }

  removeVertexDrawing(vertex) {
    // The index where the drawing we're removing is
    const drawingIndex = this.drawingIndices[vertex];
    // Remove the last drawing from the container
    const lastDrawing = this.drawingContainer.removeChildAt(this.indexToGraphObject.length - 1);

    // Replace the drawing we're removing with the last drawing
    if (drawingIndex < this.indexToGraphObject.length - 1) {
      this.drawingContainer.removeChildAt(drawingIndex);
      this.drawingContainer.addChildAt(lastDrawing, drawingIndex);
      // Update data structures accordingly
      this.drawingIndices[_.last(this.indexToGraphObject)] = drawingIndex;
      this.indexToGraphObject[drawingIndex] = this.indexToGraphObject.pop();
    } else {
      this.indexToGraphObject.pop();
    }
    delete this.drawingIndices[vertex];
  }

  addVertex(point) {
    if (!super.addVertex(point)) return false;
    this.addVertexDrawing(point);
    return true;
  }

  removeVertex(vertex) {
    if (!super.removeVertex(vertex)) return false;
    this.removeVertexDrawing(vertex);
    return true;
  }
}
