// SPDX-License-Identifier: GPL-3.0-or-later
import { OpenFileLineByLineAsArray } from "./helper.ts";

interface mapLocation {
  char: string;
  location_visited: boolean;
}

function printUsage() {
  console.log("Usage: day-4.ts [filename]");
}

// Find where the guard initial position is in a map
function findGuard(map: Array<Array<mapLocation>>) {
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
function createMap(lines: Array<string>) {
  const map: Array<Array<mapLocation>> = Array(0);

  for (const line of lines) {
    const map_line: Array<mapLocation> = [];

    for (const char of line) {
      const location_visited = false;
      const map_char = { char, location_visited };
      map_line.push(map_char);
    }

    map.push(map_line);
  }

  return map;
}

// Returns every distinct position the guard was in
function findGuardPatrolRoute(
  lines: Array<Array<mapLocation>>,
  x: number,
  y: number,
  x_dir: number,
  y_dir: number,
) {
  let distinct_positions = 0;

  do {
    // If the current char is a # (wall), go back and turn 90 degres clockwise
    if (lines[y][x].char === "#") {
      x -= x_dir;
      y -= y_dir;

      if (y_dir === -1) {
        y_dir = 0;
        x_dir = 1;
      } else if (x_dir === 1) {
        x_dir = 0;
        y_dir = 1;
      } else if (y_dir === 1) {
        y_dir = 0;
        x_dir = -1;
      } else if (x_dir === -1) {
        x_dir = 0;
        y_dir = -1;
      }
    }

    // If we are in a new location add 1 to distinct positions
    if (lines[y][x].location_visited === false) {
      lines[y][x].location_visited = true;
      distinct_positions++;
    }

    x += x_dir;
    y += y_dir;
  } while (y < lines.length && x < lines[y].length);

  return distinct_positions;
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
  guardLocation.x,
  guardLocation.y,
  guardLocation.x_dir,
  guardLocation.y_dir,
);

console.log(movementCount);