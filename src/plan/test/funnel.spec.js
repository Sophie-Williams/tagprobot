import test from 'tape';

import { isRoughly } from '../../global/utils';
import { Point } from '../../interpret/point';
import { Polypoint } from '../../interpret/polypoint';
import { Triangle } from '../../interpret/triangle';
import { PolypointState } from '../astar';
import {
  funnelPolypoints,
  getClearancePoint,
  __RewireAPI__ as FunnelRewireAPI,
} from '../funnel';


const mockGetClearancePoint = cornerPoint => cornerPoint;


test('funnelPolypoints()', tester => {
  tester.test('stretches around a corner to the top', t => {
    FunnelRewireAPI.__Rewire__('getClearancePoint', mockGetClearancePoint);
    const FP = [
      new Point(35, 75),
      new Point(107, 57),
      new Point(39, 132),
      new Point(95, 130), // first corner
      new Point(84, 180),
      new Point(157, 115),
      new Point(147, 195),
      new Point(218, 108), // second corner
      new Point(226, 166),
      new Point(286, 53),
      new Point(279, 188),
    ]; // funnel points
    const path = [
      new PolypointState(new Polypoint(71, 45, new Triangle(new Point(56, 28), FP[0], FP[1]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[0], FP[1], FP[2]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[1], FP[2], FP[3]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[2], FP[3], FP[4]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[3], FP[4], FP[5]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[4], FP[5], FP[6]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[5], FP[6], FP[7]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[6], FP[7], FP[8]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[7], FP[8], FP[9]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[8], FP[9], FP[10]))),
      new PolypointState(new Polypoint(293, 65, new Triangle(FP[9], FP[10], new Point(403, 118)))),
    ];

    const funnelledPoints = funnelPolypoints(path).map(state => state.point);
    t.same(funnelledPoints, [path[0].point, FP[3], FP[7], path[10].point]);

    FunnelRewireAPI.__ResetDependency__('getClearancePoint');
    t.end();
  });


  tester.test('stretches around a corner to the bottom', t => {
    FunnelRewireAPI.__Rewire__('getClearancePoint', mockGetClearancePoint);
    const FP = [
      new Point(35, 75),
      new Point(107, 57),
      new Point(39, 132),
      new Point(95, 130), // first corner
      new Point(84, 180),
      new Point(157, 115),
      new Point(147, 195),
      new Point(218, 108),
      new Point(226, 166), // second corner
      new Point(286, 53),
      new Point(279, 188), // third corner
    ]; // funnel points
    const path = [
      new PolypointState(new Polypoint(71, 45, new Triangle(new Point(56, 28), FP[0], FP[1]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[0], FP[1], FP[2]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[1], FP[2], FP[3]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[2], FP[3], FP[4]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[3], FP[4], FP[5]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[4], FP[5], FP[6]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[5], FP[6], FP[7]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[6], FP[7], FP[8]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[7], FP[8], FP[9]))),
      new PolypointState(new Polypoint(null, null, new Triangle(FP[8], FP[9], FP[10]))),
      new PolypointState(new Polypoint(293, 201, new Triangle(FP[9], FP[10], new Point(403, 118)))),
    ];

    const funnelledPoints = funnelPolypoints(path).map(state => state.point);
    t.same(funnelledPoints, [path[0].point, FP[3], FP[8], FP[10], path[10].point]);

    FunnelRewireAPI.__ResetDependency__('getClearancePoint');
    t.end();
  });


  tester.test('stretches properly around command center spawn point', t => {
    FunnelRewireAPI.__Rewire__('getClearancePoint', mockGetClearancePoint);
    const triangles = [
      new Triangle(new Point(760, 560), new Point(840, 600), new Point(800, 480)),
      new Triangle(new Point(800, 480), new Point(960, 640), new Point(840, 600)),
      new Triangle(new Point(840, 600), new Point(960, 640), new Point(960, 680)),
      new Triangle(new Point(840, 600), new Point(960, 680), new Point(960, 720)),
      new Triangle(new Point(1000, 720), new Point(960, 680), new Point(960, 720)),
      new Triangle(new Point(1120, 960), new Point(960, 720), new Point(1000, 720)),
      new Triangle(new Point(1120, 960), new Point(960, 720), new Point(1040, 1040)),
      new Triangle(new Point(920, 720), new Point(1040, 1040), new Point(960, 720)),
      new Triangle(new Point(920, 720), new Point(1040, 1040), new Point(880, 1080)),
      new Triangle(new Point(920, 720), new Point(880, 1080), new Point(760, 760)),
    ];
    const path = [
      new PolypointState(new Polypoint(696, 569, triangles[0])),
      new PolypointState(new Polypoint(null, null, triangles[1])),
      new PolypointState(new Polypoint(null, null, triangles[2])),
      new PolypointState(new Polypoint(null, null, triangles[3])),
      new PolypointState(new Polypoint(null, null, triangles[4])),
      new PolypointState(new Polypoint(null, null, triangles[5])),
      new PolypointState(new Polypoint(null, null, triangles[6])),
      new PolypointState(new Polypoint(null, null, triangles[7])),
      new PolypointState(new Polypoint(null, null, triangles[8])),
      new PolypointState(new Polypoint(880, 880, triangles[9])),
    ];

    const funnelledPoints = funnelPolypoints(path).map(state => state.point);
    t.same(funnelledPoints, [path[0].point, triangles[1].p3, triangles[3].p3, path[9].point]);

    FunnelRewireAPI.__ResetDependency__('getClearancePoint');
    t.end();
  });


  tester.test('funnels properly with only two states in path', t => {
    const triangles = [
      new Triangle(new Point(760, 560), new Point(840, 600), new Point(800, 480)),
      new Triangle(new Point(800, 480), new Point(960, 640), new Point(840, 600)),
    ];
    const path = [
      new PolypointState(new Polypoint(696, 569, triangles[0])),
      new PolypointState(new Polypoint(900, 600, triangles[1])),
    ];

    const funnelledPoints = funnelPolypoints(path).map(state => state.point);
    t.same(funnelledPoints, [path[0].point, path[1].point]);

    t.end();
  });
});


test('getClearancePoint()', tester => {
  tester.test('works for top-left clearance', t => {
    FunnelRewireAPI.__Rewire__('CLEARANCE', Math.sqrt(2));
    const cornerPoint = new Point(0, 0);
    const prevPoint = new Point(0, -1);
    const nextPoint = new Point(-1, 0);

    const clearancePoint = getClearancePoint(cornerPoint, prevPoint, nextPoint);
    const expected = new Point(1, 1);
    t.true(isRoughly(clearancePoint.x, expected.x));
    t.true(isRoughly(clearancePoint.y, expected.y));

    FunnelRewireAPI.__ResetDependency__('CLEARANCE');
    t.end();
  });


  tester.test('works for top-right clearance', t => {
    FunnelRewireAPI.__Rewire__('CLEARANCE', Math.sqrt(2));
    const cornerPoint = new Point(0, 0);
    const prevPoint = new Point(0, -1);
    const nextPoint = new Point(1, 0);

    const clearancePoint = getClearancePoint(cornerPoint, prevPoint, nextPoint);
    const expected = new Point(-1, 1);
    t.true(isRoughly(clearancePoint.x, expected.x));
    t.true(isRoughly(clearancePoint.y, expected.y));

    FunnelRewireAPI.__ResetDependency__('CLEARANCE');
    t.end();
  });


  tester.test('works for bottom-left clearance', t => {
    FunnelRewireAPI.__Rewire__('CLEARANCE', Math.sqrt(2));
    const cornerPoint = new Point(0, 0);
    const prevPoint = new Point(0, 1);
    const nextPoint = new Point(1, 0);

    const clearancePoint = getClearancePoint(cornerPoint, prevPoint, nextPoint);
    const expected = new Point(-1, -1);
    t.true(isRoughly(clearancePoint.x, expected.x));
    t.true(isRoughly(clearancePoint.y, expected.y));

    FunnelRewireAPI.__ResetDependency__('CLEARANCE');
    t.end();
  });


  tester.test('works for bottom-right clearance', t => {
    FunnelRewireAPI.__Rewire__('CLEARANCE', Math.sqrt(2));
    const cornerPoint = new Point(0, 0);
    const prevPoint = new Point(0, 1);
    const nextPoint = new Point(-1, 0);

    const clearancePoint = getClearancePoint(cornerPoint, prevPoint, nextPoint);
    const expected = new Point(1, -1);
    t.true(isRoughly(clearancePoint.x, expected.x));
    t.true(isRoughly(clearancePoint.y, expected.y));

    FunnelRewireAPI.__ResetDependency__('CLEARANCE');
    t.end();
  });
});