import _ from 'lodash';

import { assert } from './utils';


const startTime = Date.now(); // time when script started, in milliseconds
/**
 * Stores timing information for calculating computational time of processes
 *   {{string} processName: {start: {number|undefined}, times: {number[]}}}
 */
const timings = {};
export const TIMING_RUN_AVG_LEN = 180; // number of samples to hold on to when calculating timing


/**
 * @param {number} millisTime - a time in milliseconds
 * @returns {string} the number of seconds since millisTime with 3 decimal places
 */
function secondsSince(millisTime) {
  return (Date.now() - millisTime) / 1000;
}


/**
 * Sends a time stamped message to the info stream of the console
 */
export function timeLog(message) {
  console.debug(`${secondsSince(startTime).toFixed(3)}: ${message}`);
}


/**
 * Stores the current time under timings[procesName].start
 * @param {string} processName
 */
function startTiming(processName) {
  _.defaults(timings, { [processName]: { start: null } });
  const timing = timings[processName];
  assert(
    _.isNull(timing.start),
    `tried to start timing a process that was already being timed: ${processName}`,
  );
  timing.start = Date.now();
}


/**
 * Stops timing processName and pushes the calculated time to an array of times to be used for a
 *   running average
 * @param {string} processName
 */
function stopTiming(processName) {
  assert(
    _.has(timings, processName) && !_.isNull(timings[processName].start),
    `tried to stop timing a process that is not being timed: ${processName}`,
  );
  const timing = timings[processName];
  _.defaults(timing, { times: [] });
  if (timing.times.length === TIMING_RUN_AVG_LEN) {
    timing.times.shift();
  }
  timing.times.push(secondsSince(timing.start));
  timing.start = null;
}


/**
 * Times func and stores timing information in timings
 * @param {function} func - a function to time
 * @param {[]} args - the arguments to pass to func
 * @returns - the return from calling func with args
 */
export function time(func, args = []) {
  startTiming(func.name);
  const output = func(...args);
  stopTiming(func.name);
  return output;
}


export function logTimingsReport() {
  let totalTime = 0;
  _.forEach(timings, timing => {
    timing.time = _.mean(timing.times);
    totalTime += timing.time;
  });
  console.debug(`Mean per-frame time report: total(${totalTime.toFixed(6)})`);
  _.forEach(_.sortBy(_.keys(timings), processName => -timings[processName].time), processName => {
    const name = processName.padEnd(34);
    const { time: avgTime, times } = timings[processName];
    console.debug(`  ${name}: avg(${avgTime.toFixed(6)}), max(${_.max(times).toFixed(6)})`);
    timings[processName].times = [];
  });
}