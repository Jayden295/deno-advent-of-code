// SPDX-License-Identifier: GPL-3.0-or-later
import { OpenFileLineByLineAsArray, Location } from "../helper.ts";

enum ParsingStatus {
  Nothing,
  Parsing,
  Finished,
}

type mapItem = {
  char: string;
  distance: number;
  previous: Location[];
  explored: boolean;
  backtracked: boolean;
  best_path: boolean;
  directions: Location[];
  score: number;
  path_score: number;
  valid_path: boolean;
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
            previous: [],
            explored: false,
            backtracked: false,
            best_path: false,
            directions: [],
            score: -1,
            path_score: -1,
            valid_path: false,
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
    }
    // If this is an empty line and we are parsing, finish it
    else if (parsing_status === ParsingStatus.Parsing) {
      parsing_status = ParsingStatus.Finished;
    }
  }

  return { maze, start };
}

function bfs(map: mapItem[][], start: Location): number {
  const levels: Location[][] = [[start]];
  map[start.y][start.x].explored = true;

  let count = 0;

  // we count every thing before E as possible ways to go
  // update distance of every thing by 1 (prevents the odd edge cases)
  //
  // and then we bfs again but to go back and we count every best thing there
  let end: Location = { x: -1, y: -1 };
  while (levels.length > 0) {
    const level = levels.shift();
    count++;

    const next_level: Location[] = [];
    for (let i = 0; i < level.length; i++) {
      if (map[level[i].y][level[i].x].char === "E") {
        map[level[i].y][level[i].x].distance = count;
        end = { x: level[i].x, y: level[i].y };
        break;
      }

      map[level[i].y][level[i].x].distance = count;
      //console.log(count);

      const possible_movements: Location[] = [
        { x: -1, y: 0 },
        { x: 0, y: -1 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ];

      for (const movement of possible_movements) {
        const future_location = {
          x: level[i].x + movement.x,
          y: level[i].y + movement.y,
        };

        if (
          0 <= future_location.y &&
          0 <= future_location.x &&
          future_location.y < map.length &&
          future_location.x < map[future_location.y].length &&
          (map[future_location.y][future_location.x].char === "." ||
            map[future_location.y][future_location.x].char === "E") &&
          !map[future_location.y][future_location.x].explored
        ) {
          map[future_location.y][future_location.x].explored = true;
          next_level.push(future_location);
        }
      }
    }

    if (0 < next_level.length) {
      levels.push(next_level);
    }

    // count for every "level"
  }

  levels.push([end]);
  count = map[end.y][end.x].distance;

  let best_moves: number = 0;

  while (levels.length > 0) {
    const level = levels.shift();

    const next_level: Location[] = [];
    for (let i = 0; i < level.length; i++) {
      if (map[level[i].y][level[i].x].char === "S") {
        best_moves++;
        break;
      }

      map[level[i].y][level[i].x].distance = count;
      //console.log(count);

      const possible_movements: Location[] = [
        { x: -1, y: 0 },
        { x: 0, y: -1 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ];

      for (const movement of possible_movements) {
        const future_location = {
          x: level[i].x + movement.x,
          y: level[i].y + movement.y,
        };

        if (
          0 <= future_location.y &&
          0 <= future_location.x &&
          future_location.y < map.length &&
          future_location.x < map[future_location.y].length &&
          map[future_location.y][future_location.x].distance === count - 1 &&
          (map[future_location.y][future_location.x].char === "." ||
            map[future_location.y][future_location.x].char === "S") &&
          !map[future_location.y][future_location.x].backtracked
        ) {
          best_moves++;
          map[future_location.y][future_location.x].backtracked = true;
          next_level.push(future_location);
        }
      }
    }

    if (0 < next_level.length) {
      levels.push(next_level);
    }

    count--;

    // count for every "level"
  }

  console.log(`best moves: ${best_moves}`);
  return count;
}

function go_back(map: mapItem[][], location: Location): number {
  if (map[location.y][location.x].backtracked === true) {
    return 0;
  }

  map[location.y][location.x].backtracked = true;

  if (map[location.y][location.x].char === "S") {
    return 1;
  }

  let amount = 1;

  const previous = map[location.y][location.x].previous;

  for (const prev of previous) {
    amount += go_back(map, prev);
  }
  return amount;
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
  // const maze_copy = structuredClone(maze);
  console.log(bfs(maze, start));

  let count = 0;
  for (const line of maze) {
    for (const item of line) {
      //console.log(char);
      const encoder = new TextEncoder();
      let to_encode: string = item.char;
      if (item.backtracked === false) {
        to_encode = "#";
      }

      //console.log(item.score);

      //i;

      if (to_encode !== "#") {
        count++;
      }

      const data = encoder.encode(to_encode);
      const bytesWritten = await Deno.stdout.write(data); // 11
    }
    console.log("");
  }
  console.log(count);

  //maze[start.y][start.x].distance = 0;
  //const solved_maze = solveMaze(maze, start, { x: 1, y: 0 }, 0);

  //console.log(maze[7 ][5]);
  //console.log(go_back(maze, { x: 13, y: 1 }));

  //console.log(solved_maze);

  //console.log(count);
  //console.log(solved_maze);
  //console.log(`minimum achivable score in maze: ${solved_maze}`);
}

main();

}
// Solve maze and return maze smallest possible score
function solveMaze(
  map: mapItem[][],
  location: Location,
  direction: Location,
  score: number,
): { score: number; valid_path: boolean } {
  // If we are on the end, just return the score
  if (map[location.y][location.x].char === "E") {
    let valid_path = false;
    if (score === 28) {
      valid_path = true;
    }

    map[location.y][location.x].valid_path = valid_path;
    if (
      map[location.y][location.x].path_score === -1 ||
      score < map[location.y][location.x].path_score
    ) {
      map[location.y][location.x].path_score = score;
    }
    return { score, valid_path };
  }

  let found: boolean = false;
  for (const dir of map[location.y][location.x].directions) {
    if (direction.x === dir.x && direction.y === dir.y) {
      found = true;
      break;
    }
  }
  if (found === false) {
    map[location.y][location.x].directions.push(direction);
  }
  map[location.y][location.x].score = score;

  const scores: number[] = [];
  let cool: number[] = [];
  let predecessors: number = 0;
  let valid_path: boolean = false;

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

    let direction_already_done: boolean = false;

    if (
      0 <= future_location.y &&
      0 <= future_location.x &&
      future_location.y < map.length &&
      future_location.x < map[future_location.y].length
    ) {
      for (const dir of map[future_location.y][future_location.x].directions) {
        if (dir.x === movement.x && dir.y === movement.y) {
          direction_already_done = true;
        }
      }
    }

    // count amount of predecessors?
    // we shouldnt be allowed to go back
    //
    if (
      0 <= future_location.y &&
      0 <= future_location.x &&
      future_location.y < map.length &&
      future_location.x < map[future_location.y].length &&
      (map[future_location.y][future_location.x].score === -1 ||
        score <= map[future_location.y][future_location.x].score) && // FIXME: Check if we already went there in the current direction
      (map[future_location.y][future_location.x].char === "." ||
        map[future_location.y][future_location.x].char === "E")
    ) {
      //map[future_location.y][future_location.x].distance ===
      //  map[location.y][location.x].distance + 1;
      let change_score_by = 1;
      //predecessors++;

      // If both directions are not equal
      if (direction.x !== movement.x || direction.y !== movement.y) {
        // change_score_by += 1000;
      }

      const output = solveMaze(
        map,
        future_location,
        movement,
        score + change_score_by,
      );

      if (output.valid_path === true) {
        valid_path = true;
        map[location.y][location.x].valid_path = true;
        // here we want the current direciton we are going in
        //map[location.y][location.x].directions.push();
      }

      //cool.push(output.predecessors);
      scores.push(output.score);
    }
  }

  // Return the smallest of all scores
  // One nice thing is that it returns infinity if it's empty (maze can't be solved)
  //console.log(Math.min(...scores));

  if (location.y === 10 && location.x === 3) {
    //console.log(scores);
    //console.log(valid_path);
  }

  if (
    map[location.y][location.x].path_score === -1 ||
    Math.min(...scores) < map[location.y][location.x].path_score
  ) {
    map[location.y][location.x].path_score = Math.min(...scores);
  }

  for (let i = 0; i < scores.length; i++) {
    if (scores[i] === Math.min(...scores)) {
      //console.log(predecessors);
      predecessors += cool[i];
      // console.log(predecessors);
    }
  }

  return { score: Math.min(...scores), valid_path };
}
