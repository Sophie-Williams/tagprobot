import test from 'tape';
import * as helpers from '../src/helpers';

test('test getTraversableTiles', t => {
  // plan to do one assert
  t.plan(1);
  // initialize current player as red
  const me = { team: helpers.RED_TEAM };

  // create a dummy map from bombs, spikes, gates, and regular tiles
  const bomb = helpers.tileTypes.BOMB;
  const spike = helpers.tileTypes.SPIKE;
  const redgate = helpers.tileTypes.RED_GATE;
  const bluegate = helpers.tileTypes.BLUE_GATE;
  const blank = helpers.tileTypes.REGULAR_FLOOR;

  /* eslint-disable no-multi-spaces*/
  const map = [
    [bomb,    blank,    redgate],
    [redgate, bluegate, blank],
    [blank,   spike,    bomb],
  ];
  /* eslint-enable no-multi-spaces*/

  // this is what we expect the function to return
  const traversable = [
    [0, 1, 1],
    [1, 0, 1],
    [1, 0, 0],
  ];

  // do the assertion
  t.same(helpers.getTraversableTiles(map, me), traversable);
});