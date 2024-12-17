// SPDX-License-Identifier: GPL-3.0-or-later
import { OpenFileLineByLineAsArray, Location } from "../helper.ts";

enum ParsingStatus {
  Nothing,
  Parsing,
  Finished,
}

type mapItem = {
  char: string;
  score: number;
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
          map_line.push({ char, score: -1 });
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
    }
    // If this is an empty line and we are parsing, finish it
    else if (parsing_status === ParsingStatus.Parsing) {
      parsing_status = ParsingStatus.Finished;
    }
  }

  return { maze, start };
}

// Solve maze and return maze smallest possible score
function solveMaze(
  map: mapItem[][],
  location: Location,
  direction: Location,
  score: number,
): number {
  // If we are on the end, just return the score
  if (map[location.y][location.x].char === "E") {
    return score;
  }

  map[location.y][location.x].score = score;

  const scores: number[] = [];

  const possible_movements: Location[] = [
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];

  // For every movement possible
  for (const movement of possible_movements) {
    const future_location = {
      x: location.x + movement.x,
      y: location.y + movement.y,
    };

    // If we are in bounds and that the current score is not -1 or bigger then the current one
    // And if it is a free space/an ending space
    if (
      0 <= future_location.y &&
      0 <= future_location.x &&
      future_location.y < map.length &&
      future_location.x < map[future_location.y].length &&
      (map[future_location.y][future_location.x].score === -1 ||
        score <= map[future_location.y][future_location.x].score) &&
      (map[future_location.y][future_location.x].char === "." ||
        map[future_location.y][future_location.x].char === "E")
    ) {
      let change_score_by = 1;

      // If both directions are not equal
      if (direction.x !== movement.x || direction.y !== movement.y) {
        change_score_by += 1000;
      }

      scores.push(
        solveMaze(map, future_location, movement, score + change_score_by),
      );
    }
  }

  // Return the smallest of all scores
  // One nice thing is that it returns infinity if it's empty (maze can't be solved)
  return Math.min(...scores);
}

async function main() {
  const filename = Deno.args[0];
  if (filename === null) {
    printUsage();
    throw new Error("No filename provided");
  }

  const lines = await OpenFileLineByLineAsArray(filename);
  const output = parseMaze(lines);

  const maze = output.maze;
  const start = output.start;

  const minimum_score = solveMaze(maze, start, { x: 1, y: 0 }, 0);
  console.log(`minimum achivable score in maze: ${minimum_score}`);
}

main();
