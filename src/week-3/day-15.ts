import { Location, OpenFileLineByLineAsArray } from "../helper.ts";

enum ParseStatus {
  nothing,
  map,
  finished_map,
  movements,
  finished_movements,
}

function printUsage() {
  console.log("Usage: day-15.ts [filename]");
}

// Parse the input which is a bunch of lines
// Returns the map and the movements that will be done
// Also return the robot location, assumes that there is only 1 robot
function parseInput(lines: string[]): {
  map: string[];
  movements: string;
  robot: Location;
} {
  const map: string[] = [];
  let movements: string = "";
  let robot: Location = { x: -1, y: -1 };

  let parsing_map: ParseStatus = ParseStatus.nothing;

  for (let i = 0; i < lines.length; i++) {
    const trimmed_line = lines[i].trim();

    // Non empty lines/Lines to parse
    if (trimmed_line !== "") {
      if (
        parsing_map === ParseStatus.nothing ||
        parsing_map === ParseStatus.map
      ) {
        const potential_robot_x = trimmed_line.indexOf("@");
        if (potential_robot_x !== -1) {
          robot = { x: potential_robot_x, y: i };
        }

        map.push(trimmed_line);
        parsing_map = ParseStatus.map;
      } else if (
        parsing_map === ParseStatus.finished_map ||
        parsing_map === ParseStatus.movements
      ) {
        movements = movements.concat(trimmed_line);
        parsing_map = ParseStatus.movements;
      } else {
        throw new Error(
          `Unexpected character in current line (${i}), we have finished parsing the map and movements already`,
        );
      }
    } // For empty lines
    else {
      if (parsing_map === ParseStatus.map) {
        parsing_map = ParseStatus.finished_map;
      } else if (parsing_map === ParseStatus.movements) {
        parsing_map = ParseStatus.finished_movements;
      }
    }
  }

  return { map, movements, robot };
}

// Turn a normal sized map into a map twice as large
function turnMapTwiceAsLarge(map: string[]): {
  map: string[];
  robot: Location;
} {
  const new_map: string[] = [];
  let robot: Location = { x: -1, y: -1 };

  for (let y = 0; y < map.length; y++) {
    let new_line: string = "";

    for (let x = 0; x < map[y].length; x++) {
      switch (map[y][x]) {
        case "#":
        case ".":
          new_line = new_line.concat(map[y][x].repeat(2));
          break;
        case "@":
          robot = { x: new_line.length, y };
          new_line = new_line.concat("@.");
          break;
        case "O":
          new_line = new_line.concat("[]");
          break;
        default:
          throw new Error(
            `Unexepected character (${map[y][x]}) on line ${y + 1}`,
          );
      }
    }

    new_map.push(new_line);
  }

  return { map: new_map, robot };
}

// Attempt to move a box
// Recursive algorithm
function attemptMoveBox(
  map_pointer: string[],
  location: Location,
  direction: Location,
): { map: string[]; location: Location } {
  let map = structuredClone(map_pointer);
  const future_location: Location = {
    x: location.x + direction.x,
    y: location.y + direction.y,
  };

  // If the future location is empty, just move it and end there
  if (map[future_location.y][future_location.x] === ".") {
    // If we are moving diagonally, we need to care about the pairs
    if (direction.y !== 0) {
      let pair: Location[] = [];

      // If we are moving a pair make sure we are moving them together
      if (map[location.y][location.x] === "[") {
        pair = [location, { x: location.x + 1, y: location.y }];
      } else if (map[location.y][location.x] === "]") {
        pair = [location, { x: location.x - 1, y: location.y }];
      }

      // If the future location of the second pair is empty, move both of them
      if (
        0 < pair.length &&
        map[pair[1].y + direction.y][pair[1].x + direction.x] === "."
      ) {
        const modifiable_future = [...map[pair[1].y + direction.y]];
        modifiable_future[pair[1].x + direction.x] = map[pair[1].y][pair[1].x];
        map[pair[1].y + direction.y] = modifiable_future.join("");

        const modifiable_current = [...map[pair[1].y]];
        modifiable_current[pair[1].x] = ".";
        map[pair[1].y] = modifiable_current.join("");
      } else if (0 < pair.length) {
        // If it failed, don't move the pair
        const output = attemptMoveBox(map, pair[1], direction);
        map = output.map;
        return { map, location: location };
      }
    }

    // Move one when it's small/the other part of the pair
    const modifiable_future = [...map[future_location.y]];
    modifiable_future[future_location.x] = map[location.y][location.x];
    map[future_location.y] = modifiable_future.join("");

    const modifiable_current = [...map[location.y]];
    modifiable_current[location.x] = ".";
    map[location.y] = modifiable_current.join("");
    return { map, location: future_location };
  }

  // If it's a wall, don't move
  if (map[future_location.y][future_location.x] === "#") {
    return { map, location };
  }

  // If it's a box, there might be enough space so call it again
  if (
    map[future_location.y][future_location.x] === "O" ||
    map[future_location.y][future_location.x] === "[" ||
    map[future_location.y][future_location.x] === "]"
  ) {
    let output = attemptMoveBox(map, future_location, direction);

    if (output.map[future_location.y][future_location.x] === ".") {
      output = attemptMoveBox(output.map, location, direction);
      map = output.map;
      return { map, location: future_location };
    }

    return { map, location };
  }

  throw new Error("Unexpected character in map");
}

// Move a bunch of boxes following the movements the robot doas
function moveBoxes(
  map_pointer: string[],
  movements: string,
  robot: Location,
): string[] {
  let new_map = structuredClone(map_pointer);
  let new_robot_location: Location = structuredClone(robot);
  let output: { map: string[]; location: Location };

  for (let i = 0; i < movements.length; i++) {
    switch (movements[i]) {
      case "<":
        output = attemptMoveBox(new_map, new_robot_location, { x: -1, y: 0 });
        new_map = output.map;
        new_robot_location = output.location;

        break;
      case ">":
        output = attemptMoveBox(new_map, new_robot_location, { x: 1, y: 0 });
        new_map = output.map;
        new_robot_location = output.location;

        break;
      case "^":
        output = attemptMoveBox(new_map, new_robot_location, { x: 0, y: -1 });
        new_map = output.map;
        new_robot_location = output.location;

        break;
      case "v":
        output = attemptMoveBox(new_map, new_robot_location, { x: 0, y: 1 });
        new_map = output.map;
        new_robot_location = output.location;

        break;
      default:
        throw new Error(
          `Unexpected character in movements (movement number ${i}`,
        );
    }
  }

  return new_map;
}

function calculateEveryBoxCoordinates(map: string[]) {
  let sum = 0;

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === "O" || map[y][x] === "[") {
        sum += 100 * y + x;
      }
    }
  }

  return sum;
}

async function main() {
  const filename = Deno.args[0];
  if (filename === null) {
    printUsage();
    throw new Error(
      "Please write the filename of the puzzle input as first argument",
    );
  }

  const lines = await OpenFileLineByLineAsArray(filename);
  const parsed_input = parseInput(lines);

  const movements = parsed_input.movements;

  const map = parsed_input.map;
  const robot: Location = parsed_input.robot;

  const parsed_bigger_map = turnMapTwiceAsLarge(map);
  const bigger_map = parsed_bigger_map.map;
  const robot_on_bigger_map = parsed_bigger_map.robot;

  const new_map = moveBoxes(map, movements, robot);
  const sum = calculateEveryBoxCoordinates(new_map);

  const new_bigger_map = moveBoxes(bigger_map, movements, robot_on_bigger_map);
  const bigger_sum = calculateEveryBoxCoordinates(new_bigger_map);

  console.log(`part 1 sum of all boxes: ${sum}`);
  console.log(`part 2 sum of all bigger boxes: ${bigger_sum}`);
}

main();
