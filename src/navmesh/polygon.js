import _ from 'lodash';
import { Graph, Point } from './graph';
import { getTileProperty, tileIsOneOf, tileHasName } from '../tiles';
import { PPTL } from '../constants';
import { assert } from '../utils/asserts';


/**
 * @param {Point} p1
 * @param {Point} p2
 * @param {Point} p3
 * @returns {boolean} true if all points are colinear
 */
function threePointsInLine(p1, p2, p3) {
  const x1 = p2.x - p1.x;
  const x2 = p2.x - p3.x;
  const y1 = p2.y - p1.y;
  const y2 = p2.y - p3.y;
  if (x1 === 0 || x2 === 0) {
    return x1 === x2;
  }
  // Use line slopes to calculate if all three points are in a line
  return y1 * x2 === y2 * x1;
}


/**
 * Given the tagpro map and a traversable tile location, return if there is an NT wall (or the edge
 *   of the map) on the left.
 */
function wallOnLeft(map, x, y) {
  if (x === 0) {
    return true;
  }
  const id = map[x - 1][y];
  if (tileIsOneOf(id, ['ANGLE_WALL_1', 'ANGLE_WALL_2'])) {
    return false;
  }
  return !getTileProperty(id, 'traversable');
}


/**
 * Given the tagpro map and a traversable tile location, return if there is an NT wall (or the edge
 *   of the map) on the right.
 */
function wallOnRight(map, x, y) {
  if (x === map.length - 1) {
    return true;
  }
  const id = map[x + 1][y];
  if (tileIsOneOf(id, ['ANGLE_WALL_3', 'ANGLE_WALL_4'])) {
    return false;
  }
  return !getTileProperty(id, 'traversable');
}


/**
 * Given the tagpro map and a traversable tile location, return if there is an NT wall (or the edge
 *   of the map) on top.
 */
function wallOnTop(map, x, y) {
  if (y === 0) {
    return true;
  }
  const id = map[x][y - 1];
  if (tileIsOneOf(id, ['ANGLE_WALL_2', 'ANGLE_WALL_3'])) {
    return false;
  }
  return !getTileProperty(id, 'traversable');
}


/**
 * Given the tagpro map and a traversable tile location, return if there is an NT wall (or the edge
 *   of the map) below it.
 */
function wallOnBottom(map, x, y) {
  if (y === map[0].length - 1) {
    return true;
  }
  const id = map[x][y + 1];
  if (tileIsOneOf(id, ['ANGLE_WALL_1', 'ANGLE_WALL_4'])) {
    return false;
  }
  return !getTileProperty(id, 'traversable');
}


/**
 * Given a cell location, return if the cell above/below/left/right of it is traversable
 */
function traversableInDirection(map, x, y, direction) {
  switch (direction) {
    case 'UP':
      return y !== 0 && getTileProperty(map[x][y - 1], 'traversable');
    case 'DOWN':
      return y !== map[0].length - 1 && getTileProperty(map[x][y + 1], 'traversable');
    case 'LEFT':
      return x !== 0 && getTileProperty(map[x - 1][y], 'traversable');
    case 'RIGHT':
      return x !== map.length - 1 && getTileProperty(map[x + 1][y], 'traversable');
    default:
      assert(false, `${direction} not in UP, DOWN, LEFT, RIGHT`);
      return null;
  }
}


/**
 * Given an angle wall location, return true if it is traversable. (An NT angle wall has NT tiles
 * surrounding it).
 */
function isAngleWallTraversable(map, x, y) {
  const id = map[x][y];
  if (tileHasName(id, 'ANGLE_WALL_1')) {
    return traversableInDirection(map, x, y, 'UP') || traversableInDirection(map, x, y, 'RIGHT');
  }
  if (tileHasName(id, 'ANGLE_WALL_2')) {
    return traversableInDirection(map, x, y, 'DOWN') || traversableInDirection(map, x, y, 'RIGHT');
  }
  if (tileHasName(id, 'ANGLE_WALL_3')) {
    return traversableInDirection(map, x, y, 'DOWN') || traversableInDirection(map, x, y, 'LEFT');
  }
  if (tileHasName(id, 'ANGLE_WALL_4')) {
    return traversableInDirection(map, x, y, 'UP') || traversableInDirection(map, x, y, 'LEFT');
  }
  assert(false, `Tile at ${x}, ${y} was not an angle wall`);
  return null;
}


/**
 * Get a list of tiles which are on the edge of the traversability space.
 *
 * input:
 *
 *   00000000000
 *   01001111110
 *   01101001110
 *   01101001110
 *   01101111110
 *   00000000000
 *
 * output (with returned tiles represented as 1s)
 *
 *   00000000000
 *   01001111110
 *   01101001010
 *   01101001010
 *   01101111110
 *   00000000000
 *
 * @param {{string|number}[][]} map
 * @returns {{x: number, y: number}[]}
 */
export function mapToEdgeTiles(map) {
  const res = [];
  for (let x = 0; x < map.length; x++) {
    for (let y = 0; y < map[0].length; y++) {
      // Angle walls have a traversability edge
      if (tileIsOneOf(
        map[x][y],
        ['ANGLE_WALL_1', 'ANGLE_WALL_2', 'ANGLE_WALL_3', 'ANGLE_WALL_4'],
      )) {
        if (isAngleWallTraversable(map, x, y)) {
          res.push({ x, y });
        }
      } else if (
        // Only store edges of traversable tiles
        getTileProperty(map[x][y], 'traversable') && (
          wallOnLeft(map, x, y) ||
          wallOnRight(map, x, y) ||
          wallOnTop(map, x, y) ||
          wallOnBottom(map, x, y)
        )
      ) {
        res.push({ x, y });
      }
    }
  }
  return res;
}

/**
 * Given the tagpro map, return a Graph object containing edges along the edge of traversability.
 *   Each edge should be one tile-length one (or sqrt(2), if it lies on the diagonal of a tile)
 * @param {{number|string}} map - the tagpro map
 * @returns {Graph}
 */
export function unmergedGraphFromTagproMap(map) {
  const edgeTiles = mapToEdgeTiles(map);
  const graph = new Graph();
  _.each(edgeTiles, tile => {
    const { x, y } = tile;
    const xp = x * PPTL;
    const yp = y * PPTL;
    const topLeft = new Point(xp, yp);
    const topRight = new Point(xp + PPTL, yp);
    const bottomLeft = new Point(xp, yp + PPTL);
    const bottomRight = new Point(xp + PPTL, yp + PPTL);
    if (tileIsOneOf(map[x][y], ['ANGLE_WALL_1', 'ANGLE_WALL_3'])) {
      graph.addVertex(topLeft);
      graph.addVertex(bottomRight);
      graph.addEdge(topLeft, bottomRight);
    } else if (tileIsOneOf(map[x][y], ['ANGLE_WALL_2', 'ANGLE_WALL_4'])) {
      graph.addVertex(bottomLeft);
      graph.addVertex(topRight);
      graph.addEdge(bottomLeft, topRight);
    }
    if (wallOnLeft(map, x, y) && !tileIsOneOf(map[x][y], ['ANGLE_WALL_1', 'ANGLE_WALL_2'])) {
      // Edge on left
      graph.addVertex(topLeft);
      graph.addVertex(bottomLeft);
      graph.addEdge(topLeft, bottomLeft);
    } if (wallOnRight(map, x, y) && !tileIsOneOf(map[x][y], ['ANGLE_WALL_3', 'ANGLE_WALL_4'])) {
      // Edge on right
      graph.addVertex(topRight);
      graph.addVertex(bottomRight);
      graph.addEdge(topRight, bottomRight);
    } if (wallOnTop(map, x, y) && !tileIsOneOf(map[x][y], ['ANGLE_WALL_2', 'ANGLE_WALL_3'])) {
      // Edge above
      graph.addVertex(topLeft);
      graph.addVertex(topRight);
      graph.addEdge(topLeft, topRight);
    } if (wallOnBottom(map, x, y) && !tileIsOneOf(map[x][y], ['ANGLE_WALL_1', 'ANGLE_WALL_4'])) {
      // Edge below
      graph.addVertex(bottomLeft);
      graph.addVertex(bottomRight);
      graph.addEdge(bottomLeft, bottomRight);
    }
  });
  return graph;
}


/**
 * Given the tagpro map, return a Graph object containing edges along the edge of traversability.
 *   Straight lines will be represented by a single edge (the edges are arbitrarily long). This is
 *   computed using the unmergedGraphFromTagproMap function above, and then merging edges that touch
 *   eachother and have the same slope.
 * @param {{number|string}} map - the tagpro map
 * @returns {Graph}
 */
export function graphFromTagproMap(map) {
  const unmergedGraph = unmergedGraphFromTagproMap(map);
  _.each(unmergedGraph.getVertices(), v => {
    const neighbors = unmergedGraph.neighbors(v);
    for (let j = 0; j < neighbors.length; j += 1) {
      for (let k = j + 1; k < neighbors.length; k += 1) {
        if (threePointsInLine(v, neighbors[j], neighbors[k])) {
          unmergedGraph.removeEdge(v, neighbors[j]);
          unmergedGraph.removeEdge(v, neighbors[k]);
          unmergedGraph.addEdge(neighbors[j], neighbors[k]);
        }
      }
    }
  });
  // Remove all vertices that no longer have a neighbor
  _.each(unmergedGraph.getVertices(), v => {
    if (unmergedGraph.neighbors(v).length === 0) {
      unmergedGraph.removeVertex(v);
    }
  });
  return unmergedGraph;
}