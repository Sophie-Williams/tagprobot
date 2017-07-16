/*
 * takes in current location and target location (eg, the location of the flag) and the map
 * represented as a grid of 1 and 0, where 1s are traversable and 0s are not. Uses A* to calculate
 * the best path
 */
export default function getTarget(myX, myY, targetX, targetY, grid) {
  // TODO: handle edge cases regarding target and current position
  // diagonal is true if we consider diagonal steps on the grid
  const diagonal = false;
  const graph = new Graph(grid, { diagonal });
  const start = graph.grid[myX][myY];
  const end = graph.grid[targetX][targetY];
  // calculate shortest path list
  const shortestPath = astar.search(graph, start, end,
    { heuristic: diagonal ? astar.heuristics.diagonal : astar.heuristics.manhattan });

  // Find the furthest cell in the direction of the next cell
  let winner = 0;
  let j = 0;
  if (shortestPath.length > 1) {
    const dx = shortestPath[0].x - myX;
    const dy = shortestPath[0].y - myY;
    for (let i = 0; i < shortestPath.length; i++) {
      const ndx = shortestPath[i].x - myX;
      if (dx === ndx) {
        winner += 1;
      } else {
        break;
      }
    }
    for (; j < winner; j++) {
      const ndy = shortestPath[j].y - myY;
      if (dy !== ndy) {
        winner = j;
        break;
      }
    }
  }
  const next = shortestPath[j];
  // TODO: this seems to throw null pointer when bot doesn't know where the center flag is.
  const res = { x: next.x, y: next.y };
  return res;
}