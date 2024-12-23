// SPDX-License-Identifier: GPL-3.0-or-later
import { OpenFileLineByLineAsArray } from "../helper.ts";

enum Reason {
  Loop = "loop",
  Out = "out",
}

interface Guard {
  x: number;
  y: number;
  x_dir: number;
  y_dir: number;
}

interface xy {
  x: Array<number>;
  y: Array<number>;
}

interface mapLocation {
  char: string;
  location_visited: boolean;
  directions_already_done: xy;
}

function printUsage() {
  console.log("Usage: day-6.ts [filename]");
}

// Find where the guard initial position is in a map
function findGuard(map: Array<Array<mapLocation>>): Guard | undefined {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      // Also record it's initial direction
      let x_dir = 0;
      let y_dir = 0;

      switch (map[y][x].char) {
        case "^":
          y_dir = -1;
          return { x, y, x_dir, y_dir };
        case ">":
          x_dir = 1;
          return { x, y, x_dir, y_dir };
        case "<":
          x_dir = -1;
          return { x, y, x_dir, y_dir };
        case "v":
          y_dir = 1;
          return { x, y, x_dir, y_dir };
      }
    }
  }
}

// Create a map using an array of lines
// A map essentially is the same array of lines
// But with a location_visited which is a bool that says if we were there previously
function createMap(lines: Array<string>): Array<Array<mapLocation>> {
  const map: Array<Array<mapLocation>> = Array(0);

  for (const line of lines) {
    const map_line: Array<mapLocation> = [];

    for (const char of line) {
      const location_visited = false;
      const xy: xy = { x: [], y: [] };
      const map_char: mapLocation = {
        char,
        location_visited,
        directions_already_done: xy,
      };
      map_line.push(map_char);
    }

    map.push(map_line);
  }

  return map;
}

// Returns every distinct position the guard was in
function findGuardPatrolRoute(
  map: Array<Array<mapLocation>>,
  position: Guard,
  prevent_loop: boolean,
) {
  let distinct_positions = 0;
  const pos = structuredClone(position);

  pos.x += pos.x_dir;
  pos.y += pos.y_dir;

  do {
    // If the current char is a # (wall), go back and turn 90 degres clockwise
    if (map[pos.y][pos.x].char === "#") {
      pos.x -= pos.x_dir;
      pos.y -= pos.y_dir;

      if (pos.y_dir === -1) {
        pos.y_dir = 0;
        pos.x_dir = 1;
      } else if (pos.x_dir === 1) {
        pos.x_dir = 0;
        pos.y_dir = 1;
      } else if (pos.y_dir === 1) {
        pos.y_dir = 0;
        pos.x_dir = -1;
      } else if (pos.x_dir === -1) {
        pos.x_dir = 0;
        pos.y_dir = -1;
      }
    }

    // To prevent loop, we mark every location that we pass with a direction
    // If we pass the same location with the same direction then we are in a loop
    if (prevent_loop === true) {
      const directions_already_done = map[pos.y][pos.x].directions_already_done;

      if (directions_already_done.x.indexOf(pos.x_dir) !== -1) {
        return { distinct_positions, reason: Reason.Loop };
      }

      if (directions_already_done.y.indexOf(pos.y_dir) !== -1) {
        return { distinct_positions, reason: Reason.Loop };
      }

      if (pos.x_dir !== 0) {
        directions_already_done.x.push(pos.x_dir);
      }

      if (pos.y_dir !== 0) {
        directions_already_done.y.push(pos.y_dir);
      }
    }

    // If we are in a new location add 1 to distinct positions
    if (map[pos.y][pos.x].location_visited === false) {
      map[pos.y][pos.x].location_visited = true;
      distinct_positions++;
    }

    pos.x += pos.x_dir;
    pos.y += pos.y_dir;
  } while (
    0 <= pos.y && 0 <= pos.x && pos.y < map.length && pos.x < map[pos.y].length
  );

  return { distinct_positions, reason: Reason.Out };
}

function findObstaclePositions(
  map: Array<Array<mapLocation>>,
  initial_pos: Guard,
) {
  let count = 0;

  // Loop though every position that is one that has been visited
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (
        !(map[y][x].char === "^" || map[y][x].char === ">" ||
          map[y][x].char === "<" || map[y][x].char === "v") &&
        (map[y][x].location_visited === true)
      ) {
        // Copy the map to prevent changing it
        const map_copy = structuredClone(map);
        map_copy[y][x].char = "#";

        const output = findGuardPatrolRoute(map_copy, initial_pos, true);
        if (output.reason === Reason.Loop) {
          count++;
        }
      }
    }
  }

  return count;
}

const filename = Deno.args[0];
if (filename == null) {
  printUsage();
  Deno.exit(1);
}

const lines = await OpenFileLineByLineAsArray(filename);
const map = createMap(lines);

const guardLocation = findGuard(map);
if (guardLocation === undefined) {
  throw new Error("Couldn't find guard in input file!");
}

const movementCount = findGuardPatrolRoute(
  map,
  guardLocation,
  false, // If you set this to true, the map will also be changed (my mental state is declining and I hate javascript)
);

console.log(
  `number of distinct positions: ${movementCount.distinct_positions}`,
);

const number_of_obstacles = findObstaclePositions(map, guardLocation);
console.log(`number of obstacles that can be added: ${number_of_obstacles}`);
