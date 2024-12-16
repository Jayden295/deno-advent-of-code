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
  if (map[future_location.y][future_location.x] === "O") {
    let output = attemptMoveBox(map, future_location, direction);
    map = output.map;
    if (map[future_location.y][future_location.x] === ".") {
      output = attemptMoveBox(map, location, direction);
      map = output.map;
      return { map, location: future_location };
    }

    return { map, location };
  }

  // Maybe there could be a bug because we ignore @
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
        //console.log(new_map);
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
      if (map[y][x] === "O") {
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

  const map = parsed_input.map;
  const movements = parsed_input.movements;
  const robot: Location = parsed_input.robot;

  const new_map = moveBoxes(map, movements, robot);
  const sum = calculateEveryBoxCoordinates(new_map);

  console.log(`part 1 sum of all boxes: ${sum}`);
}

main();
