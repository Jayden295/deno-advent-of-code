// SPDX-License-Identifier: GPL-3.0-or-later
import { Location, OpenFileLineByLineAsArray } from "../helper.ts";

enum ParsingStatus {
  Nothing,
  Parsing,
  Finished,
}

type mapItem = {
  char: string;
  distance: number;
  best_path: boolean;
};

function printUsage() {
  console.log("Usage: day-16.ts [filename]");
}

// Return maze and start location of a maze
function parseMaze(lines: string[]): { maze: mapItem[][]; start: Location } {
  let parsing_status: ParsingStatus = ParsingStatus.Nothing;
  const maze: mapItem[][] = [];
  const start: Location = { x: -1, y: -1 };

  // Loop though every line
  for (let i = 0; i < lines.length; i++) {
    const trimmed_line: string = lines[i].trim();

    if (trimmed_line !== "") {
      if (parsing_status !== ParsingStatus.Finished) {
        parsing_status = ParsingStatus.Parsing;

        // Add the trimmed line to the map
        const map_line: mapItem[] = [];
        for (const char of trimmed_line) {
          map_line.push({
            char,
            distance: Infinity,
            best_path: false,
          });
        }
        maze.push(map_line);

        // Update the start location
        const x: number = trimmed_line.indexOf("S");
        if (0 <= x) {
          start.x = x;
          start.y = i;
        }
      } else {
        throw new Error(
          `Non empty line at line ${i} even though we finished parsing the maze`,
        );
      }
    } // If this is an empty line and we are parsing, finish it
    else if (parsing_status === ParsingStatus.Parsing) {
      parsing_status = ParsingStatus.Finished;
    }
  }

  return { maze, start };
}

// Dijkstra algorithm
// Location and direction at which we are starting with
// Best distance is a number we need to be able to count every best node properly
// Without it we get too many best nodes
// Recursive algorithm
function dijkstra(
  map: mapItem[][],
  location: Location,
  direction: Location,
  best_distance: number = -1,
): { distance: number; best_path: boolean } {
  // If we hit the end, check if took the best path and return current distance and true
  if (map[location.y][location.x].char === "E") {
    if (
      best_distance === -1 ||
      map[location.y][location.x].distance === best_distance
    ) {
      map[location.y][location.x].best_path = true;
      return {
        distance: map[location.y][location.x].distance,
        best_path: true,
      };
    }
  }

  // Increase distance by one
  map[location.y][location.x].distance++;

  // Possible movements with the current direction sorted first
  const possible_movements: Location[] = [
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ].sort((a) => {
    if (a.x === direction.x && a.y === direction.y) {
      return -1;
    } else {
      return 0;
    }
  });

  // Possible outputs, so that we can run every single path possible
  const possible_outputs: { distance: number; best_path: boolean }[] = [];

  for (let i = 0; i < possible_movements.length; i++) {
    // If we are on 1 (meaning the original direction didn't work)
    // Add 1000 to the current distance
    if (i === 1) {
      map[location.y][location.x].distance += 1000;
    }

    const future_location: Location = {
      x: location.x + possible_movements[i].x,
      y: location.y + possible_movements[i].y,
    };

    if (
      0 <= future_location.y &&
      0 <= future_location.x &&
      future_location.y < map.length &&
      future_location.x < map[future_location.y].length &&
      map[location.y][location.x].distance <= // Not the best check in the world, but it works fairly well
        map[future_location.y][future_location.x].distance &&
      (map[future_location.y][future_location.x].char === "." ||
        map[future_location.y][future_location.x].char === "E")
    ) {
      map[future_location.y][future_location.x].distance =
        map[location.y][location.x].distance;

      const output = dijkstra(
        map,
        future_location,
        possible_movements[i],
        best_distance,
      );
      if (output.best_path === true) {
        map[location.y][location.x].best_path = true;
        possible_outputs.push(output);
      }
    }
  }

  // Find the smallest possible output and output that
  possible_outputs.sort((a, b) => {
    if (a.distance < b.distance) {
      return -1;
    } else {
      return 1;
    }
  });
  if (0 < possible_outputs.length) {
    return possible_outputs[0];
  }

  // Return invalid if we found nothing
  return { distance: -1, best_path: false };
}

async function main() {
  const filename = Deno.args[0];
  if (filename === null) {
    printUsage();
    throw new Error("No filename provided");
  }

  const lines = await OpenFileLineByLineAsArray(filename);
  const output = parseMaze(lines);

  const original_maze = output.maze;
  const start = output.start;
  const start_direction: Location = { x: 1, y: 0 };
  original_maze[start.y][start.x].distance = 0;

  const solved_maze_part_one = dijkstra(
    structuredClone(original_maze),
    start,
    start_direction,
  );
  console.log(`lowest possible score: ${solved_maze_part_one.distance}`);

  const maze_with_path = structuredClone(original_maze);
  dijkstra(
    maze_with_path,
    start,
    start_direction,
    solved_maze_part_one.distance,
  );

  let count = 0;
  for (const line of maze_with_path) {
    for (const item of line) {
      if (item.best_path === true) {
        count++;
      }
    }
  }

  console.log(`tiles part of at least one of the best paths: ${count}`);
}

main();
