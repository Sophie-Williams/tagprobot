import _ from 'lodash';

import { assert } from '../global/utils';
import { PPTL } from '../global/constants';
import { tileLocations } from './setup';
import { tileHasName } from './tileInfo';
import { amBlue, isCenterFlag } from './gameState';
import { Point } from '../global/class/Point';


/**
 * @param {string} tileName
 * @returns {{xt: number, yt: number}} a tile which is at the center of mass of all occurrences of
 *   tileName in the tagpro map
 */
export function centerOfMass(tileName) {
  let xSum = 0;
  let ySum = 0;
  let count = 0;
  for (let xt = 0, xl = tagpro.map.length; xt < xl; xt++) {
    for (let yt = 0, yl = tagpro.map[0].length; yt < yl; yt++) {
      if (tileHasName(tagpro.map[xt][yt], tileName)) {
        xSum += xt;
        ySum += yt;
        count += 1;
      }
    }
  }
  if (count === 0) return null;
  return { xt: Math.floor(xSum / count), yt: Math.floor(ySum / count) };
}


/**
 * Assumes that the potential location of the tile has been stored by calling initLocations().
 *   Runtime: O(1)
 * @param {(number | number[])} tileNames - either a number representing a tileType, or an array of
 *   such numbers
 * @returns {Point} the position of the center of one of the specified tile types
 */
export function findCachedTile(tileNames) {
  const tileNameArray = [].concat(tileNames);
  for (let i = 0; i < tileNameArray.length; i++) {
    const name = tileNameArray[i];
    if (_.has(tileLocations, name)) {
      const { xt, yt } = tileLocations[name];
      if (tileHasName(tagpro.map[xt][yt], name)) {
        return new Point((xt * PPTL) + (PPTL / 2), (yt * PPTL) + (PPTL / 2));
      }
    }
  }
  return null;
}


/**
 * @returns {Point} the location of the ally flag station
 */
export function findAllyFlagStation() {
  assert(!isCenterFlag(), 'tried to find ally flag station in a center flag game');
  return amBlue() ? findCachedTile(['BLUE_FLAG', 'BLUE_FLAG_TAKEN']) :
    findCachedTile(['RED_FLAG', 'RED_FLAG_TAKEN']);
}


/**
 * @returns {Point} the location of the enemy flag station
 */
export function findEnemyFlagStation() {
  assert(!isCenterFlag(), 'tried to find enemy flag station in a center flag game');
  return amBlue() ? findCachedTile(['RED_FLAG', 'RED_FLAG_TAKEN']) :
    findCachedTile(['BLUE_FLAG', 'BLUE_FLAG_TAKEN']);
}


/**
 * @returns {Point} the location of the center flag station
 */
export function findCenterFlagStation() {
  assert(isCenterFlag(), 'tried to find center flag station in a two flag game');
  return findCachedTile(['YELLOW_FLAG', 'YELLOW_FLAG_TAKEN']);
}


/**
 * @returns {Point} the location of the ally endzone
 */
export function findAllyEndzone() {
  return amBlue() ? findCachedTile('BLUE_ENDZONE') : findCachedTile('RED_ENDZONE');
}


/**
 * @returns {Point} the location of the enemy endzone
 */
export function findEnemyEndzone() {
  return amBlue() ? findCachedTile('RED_ENDZONE') : findCachedTile('BLUE_ENDZONE');
}
