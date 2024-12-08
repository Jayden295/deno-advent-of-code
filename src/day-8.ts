import { OpenFileLineByLineAsArray } from "./helper.ts";

interface Location {
  x: number;
  y: number;
}

function printUsage() {
  console.log("Usage: day-7.ts [filename]");
}

// Returns a hashmap containing a list of points for a specific frequency
function parsePoints(lines: Array<string>) {
  const points_locations = new Map();

  for (let y = 0; y < lines.length; y++) {
    for (let x = 0; x < lines[y].length; x++) {
      // If character is alphanumeric
      if (lines[y][x].match(/^[0-9a-zA-Z]+$/)) {
        const location: Location = { x, y };
        const coordinates = points_locations.get(lines[y][x]);

        if (coordinates === undefined) {
          points_locations.set(lines[y][x], [location]);
        } else {
          coordinates.push(location);
        }
      } else if (lines[y][x] !== "." && lines[y][x] !== "#") {
        console.warn(
          `Warn: Unexpected character ${lines[y][x]} on line ${y + 1}`,
        );
      }
    }
  }

  return points_locations;
}

// Return the count of every unique location of a antinode
function countAntinodes(
  lines_pointer: Array<string>,
  points_locations: Map<string, Array<Location>>,
) {
  // To prevent changing the lines being provided
  const lines = structuredClone(lines_pointer);
  let antinode_count = 0;

  for (const coordinates of points_locations) {
    // Create pair of two points locations
    for (let i = 0; i < coordinates[1].length; i++) {
      for (let l = i + 1; l < coordinates[1].length; l++) {
        const pair = [coordinates[1][i], coordinates[1][l]];

        // Difference between the location of two pairs
        const difference: Location = {
          x: pair[0].x - pair[1].x,
          y: pair[0].y - pair[1].y,
        };

        const potential_antinodes: Array<Location> = [{
          x: pair[0].x + difference.x,
          y: pair[0].y + difference.y,
        }, {
          x: pair[1].x - difference.x,
          y: pair[1].y - difference.y,
        }];

        // Loop though every potential antinode and make sure they are inside
        for (const antinode of potential_antinodes) {
          if (0 <= antinode.y && antinode.y < lines.length) {
            if (0 <= antinode.x && antinode.x < lines[antinode.y].length) {
              // We only count unique antinodes so if it is already counted ignore it
              if (lines[antinode.y][antinode.x] !== "#") {
                const line = [...lines[antinode.y]];
                line[antinode.x] = "#";
                lines[antinode.y] = line.join("");

                antinode_count++;
              }
            }
          }
        }
      }
    }
  }

  return antinode_count;
}

const filename = Deno.args[0];
if (filename == null) {
  printUsage();
  Deno.exit(1);
}

const lines = await OpenFileLineByLineAsArray(filename);
const points_location = parsePoints(lines);
const antinode_count = countAntinodes(lines, points_location);
console.log(`unique antinode location count: ${antinode_count}`);
