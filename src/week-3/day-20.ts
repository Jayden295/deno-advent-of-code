import { OpenFileLineByLineAsArray, Location } from "../helper.ts";

enum ParsingStatus {
  Nothing,
  ParsingMaze,
  FinishedMaze,
}

type mapItem = {
  char: string;
  distance: number;
  cheats: number[]; // Distance of cheats that can be used to skip there
};

function printUsage() {
  console.log("Usage: day-20.ts [filename]");
}

function parseMaze(lines: string[]): { maze: mapItem[][]; start: Location } {
  const maze: mapItem[][] = [];
  let start: Location = { x: -1, y: -1 };

  let parsing_status = ParsingStatus.Nothing;

  for (let i = 0; i < lines.length; i++) {
    const trimmed_line = lines[i].trim();

    if (trimmed_line !== "") {
      if (
        parsing_status === ParsingStatus.Nothing ||
        parsing_status === ParsingStatus.ParsingMaze
      ) {
        parsing_status = ParsingStatus.ParsingMaze;
        maze.push(
          trimmed_line
            .split("")
            .map((str) => ({ char: str, distance: Infinity, cheats: [] })),
        );

        const s_index = trimmed_line.indexOf("S");

        if (0 <= s_index) {
          start = { x: s_index, y: i };
        }
      } else {
        throw new Error(
          `Finished parsing maze but got an non empty line at ${i + 1}`,
        );
      }
    } else {
      if (parsing_status === ParsingStatus.ParsingMaze) {
        parsing_status = ParsingStatus.FinishedMaze;
      }
    }
  }

  return { maze, start };
}

// Uses a dijkstra algorithm to solve the maze
// Does the skips at each thing and once we reach it we calculate the skip size
function count_skips(map: mapItem[][], start: Location, min_skip: number) {
  map[start.y][start.x].distance = 0;
  const queue: Location[] = [start];

  const possible_movements: Location[] = [
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];

  const possible_cheats: Location[] = [
    { x: -2, y: 0 },
    { x: -1, y: -1 },
    { x: 0, y: -2 },
    { x: 1, y: -1 },
    { x: 2, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 2 },
    { x: -1, y: 1 },
  ];

  let count = 0;

  while (0 < queue.length) {
    const location = queue.shift()!;

    if (map[location.y][location.x].char === "E") {
      return count;
    }

    for (const movement of possible_movements) {
      const future_location: Location = {
        x: location.x + movement.x,
        y: location.y + movement.y,
      };

      if (
        0 <= future_location.x &&
        0 <= future_location.y &&
        future_location.y < map.length &&
        future_location.x < map[future_location.y].length &&
        (map[future_location.y][future_location.x].char === "." ||
          map[future_location.y][future_location.x].char === "E")
      ) {
        const new_distance = map[location.y][location.x].distance + 1;

        if (new_distance < map[future_location.y][future_location.x].distance) {
          map[future_location.y][future_location.x].distance = new_distance;

          // Add to count every skipped distance that is bigger then 100
          count += map[future_location.y][future_location.x].cheats
            .map((n) => new_distance - n)
            .filter((n) => n >= min_skip).length;

          queue.push(future_location);
        }
      }
    }

    // Try each possible cheats and if they are valid then add it
    for (const movement of possible_cheats) {
      const future_location: Location = {
        x: location.x + movement.x,
        y: location.y + movement.y,
      };

      if (
        0 <= future_location.x &&
        0 <= future_location.y &&
        future_location.y < map.length &&
        future_location.x < map[future_location.y].length &&
        (map[future_location.y][future_location.x].char === "." ||
          map[future_location.y][future_location.x].char === "E")
      ) {
        const new_distance = map[location.y][location.x].distance + 2;
        map[future_location.y][future_location.x].cheats.push(new_distance);
      }
    }
  }

  // Maze can't even be solved
  return -1;
}

async function main() {
  const filename = Deno.args[0];
  if (filename === null) {
    printUsage();
    throw new Error("Expected filename of input as first argument");
  }

  const lines = await OpenFileLineByLineAsArray(filename);
  const maze = parseMaze(lines);

  const skips = count_skips(maze.maze, maze.start, 100);
  console.log(`part 1 count of skips: ${skips}`);
}

main();
