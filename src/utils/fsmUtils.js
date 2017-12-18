import _ from 'lodash';
import { getDist } from '../utils/geometry';


/**
 * @param {{point: {x: number, y: number}}[]} path - a list of objects with a point key.
 * @param {number} granularity - the euclidian distance the points along the path should be
 *   separated by.
 * @returns {{x: number, y: number}[]} a list of points along the path. These points result from
 *   connecting each point in the input path, then placing points along each line, separated by
 *   granularity
 */
export function getPointsAlongPath(path, granularity = 40) {
  const res = [];
  for (let i = 0; i < path.length - 1; i += 1) {
    const currPoint = path[i].point;
    const nextPoint = path[i + 1].point;
    const edgeLength = getDist(
      currPoint.x,
      currPoint.y,
      nextPoint.x,
      nextPoint.y,
    );
    const increments = Math.floor(edgeLength / granularity);
    const xIncr = (nextPoint.x - currPoint.x) / increments;
    const yIncr = (nextPoint.y - currPoint.y) / increments;
    res.push(currPoint);
    for (let j = 0; j < increments - 1; j += 1) {
      const prev = _.last(res);
      res.push({ x: prev.x + xIncr, y: prev.y + yIncr });
    }
  }
  res.push(_.last(path));
  return res;
}