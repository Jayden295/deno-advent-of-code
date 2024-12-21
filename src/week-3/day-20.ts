import { OpenFileLineByLineAsArray, Location } from "../helper.ts";

enum ParsingStatus {
  Nothing,
  ParsingMaze,
  FinishedMaze,
}

type mapItem = {
  char: string;
  distance: number;
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
            .map((str) => ({ char: str, distance: Infinity })),
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
// Returns a list of path locations
function dijkstra(map: mapItem[][], start: Location): Location[] | undefined {
  map[start.y][start.x].distance = 0;
  const queue: Location[] = [start];

  const possible_movements: Location[] = [
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];

  const path_locations: Location[] = [];

  while (0 < queue.length) {
    const location = queue.shift()!;
    path_locations.push(location);

    if (map[location.y][location.x].char === "E") {
      return path_locations;
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
          queue.push(future_location);
        }
      }
    }
  }

  // Maze can't even be solved
}

// Count the amount of skips possible for a path
function count_skips(
  max_cheats: number,
  min_skip: number,
  path_locations: Location[],
) {
  let skips = 0;

  for (let original = 0; original < path_locations.length - 1; original++) {
    for (
      let potential_skip = original + 1;
      potential_skip < path_locations.length;
      potential_skip++
    ) {
      const diff: Location = {
        x: Math.abs(
          path_locations[original].x - path_locations[potential_skip].x,
        ),
        y: Math.abs(
          path_locations[original].y - path_locations[potential_skip].y,
        ),
      };

      const total_diff = diff.x + diff.y;

      if (total_diff <= max_cheats) {
        const saved = potential_skip - original - total_diff;

        if (saved >= min_skip) {
          skips++;
        }
      }
    }
  }

  return skips;
}

async function main() {
  const filename = Deno.args[0];
  if (filename === null) {
    printUsage();
    throw new Error("Expected filename of input as first argument");
  }

  const lines = await OpenFileLineByLineAsArray(filename);
  const maze = parseMaze(lines);

  const path_locations = dijkstra(maze.maze, maze.start);

  if (path_locations === undefined) {
    throw new Error(
      "Maze is not solvable, are you sure you didn't block a path?",
    );
  }

  const skips_one = count_skips(2, 100, path_locations);
  const skips_two = count_skips(20, 100, path_locations);
  console.log(`part 1 count of skips (10 allowed): ${skips_one}`);
  console.log(`part 2 count of skips (20 allowed): ${skips_two}`);
}

main();
