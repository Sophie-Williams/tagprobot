export const THICKNESSES = {
  path: 38,
  triangulation: 4,
  localGoal: 4,
};

export const COLORS = {
  path: {
    ally: 0x00ff00, // bright green
    enemy: 0x99333, // dark red
  },
  keys: 0x753daf, // purple
  triangulation: {
    edge: 0xff0090, // pink
    fixedEdge: 0x42aaf4, // bright blue
    vertex: 0xa5005d, // darker pink
  },
  polypoints: {
    edge: 0x006600, // dark green
  },
  localGoal: 0x000000, // black
};

export const ALPHAS = {
  path: 0.50,
  keys: {
    on: 0.75,
    off: 0.20,
  },
  triangulation: {
    edge: 0.20,
    fixedEdge: 1.00,
    vertex: 0.20,
  },
  polypoints: {
    edge: 0.20,
    vertex: 0.20,
  },
  localGoal: 0.50,
};
