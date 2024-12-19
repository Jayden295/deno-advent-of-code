import { OpenFileLineByLineAsArray, Location } from "../helper.ts";

type memoryItem = {
  corrupted: boolean;
  distance: number;
};

function printUsage() {
  console.log("Usage: day-18.ts [filename]");
}

function parseBytes(lines: string[]): Location[] {
  const falling_bytes: Location[] = [];
  for (let i = 0; i < lines.length; i++) {
    const xy = lines[i].trim().split(",").map(Number);
    if (0 <= xy.indexOf(NaN)) {
      throw new Error(`Unable to parse xy coordinates at line ${i + 1}`);
    }

    if (xy.length !== 2) {
      throw new Error(
        `Got more or less xy arguments in one line at line ${i + 1}`,
      );
    }

    falling_bytes.push({ x: xy[0], y: xy[1] });
  }

  return falling_bytes;
}

function initialiseMemorySpace(
  size: Location,
  falling_bytes: Location[],
  max: number,
): memoryItem[][] {
  const map: memoryItem[][] = new Array(size.y + 1)
    .fill(null)
    .map(() =>
      new Array(size.x + 1)
        .fill(null)
        .map(() => ({ corrupted: false, distance: Infinity })),
    );

  max = Math.min(falling_bytes.length, max);
  for (let i = 0; i < max; i++) {
    map[falling_bytes[i].y][falling_bytes[i].x].corrupted = true;
  }
  return map;
}

// Dijkstra algorithm
// This time it isn't recursive
function dijkstra(map: memoryItem[][], start: Location): number {
  map[start.y][start.x].distance = 0;

  const queue: Location[] = [start];

  const possible_movements: Location[] = [
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];

  while (0 < queue.length) {
    const location = queue.shift()!;

    if (
      location.y === map.length - 1 &&
      location.x === map[map.length - 1].length - 1
    ) {
      return map[location.y][location.x].distance;
    }

    for (const movement of possible_movements) {
      const future_location = {
        x: location.x + movement.x,
        y: location.y + movement.y,
      };

      if (
        0 <= future_location.x &&
        0 <= future_location.y &&
        future_location.y < map.length &&
        future_location.x < map[future_location.y].length &&
        map[future_location.y][future_location.x].corrupted === false
      ) {
        const new_distance = map[location.y][location.x].distance + 1;

        if (new_distance < map[future_location.y][future_location.x].distance) {
          map[future_location.y][future_location.x].distance = new_distance;
          queue.push(future_location);
        }
      }
    }
  }

  return -1;
}

async function main() {
  const filename = Deno.args[0];
  if (filename === null) {
    printUsage();
    throw new Error("Expected filename as first argument");
  }

  const lines = await OpenFileLineByLineAsArray(filename);
  const falling_bytes: Location[] = parseBytes(lines);
  const memory_space = initialiseMemorySpace(
    { x: 70, y: 70 },
    falling_bytes,
    1024,
  );

  const smallest_path = dijkstra(memory_space, { x: 0, y: 0 });

  console.log(`part 1 size of the shortest path: ${smallest_path}`);
}

main();
