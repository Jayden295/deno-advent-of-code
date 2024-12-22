import { Location, OpenFileLineByLineAsArray } from "../helper.ts";

const NUMERIC = createMap(["789", "456", "123", "#0A"], "A");
const DIRECTIONAL = createMap(["#^A", "<v>"], "A");

type code = {
  to_type: string;
  numeric: number;
};

type mapItem = {
  char: string;
  distance: number;
  sequence: string;
};

function parseCodes(lines: string[]): code[] {
  const codes: code[] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed_line = lines[i].trim();

    if (trimmed_line !== "") {
      const numeric = parseInt(trimmed_line.slice(0, trimmed_line.length - 1));
      if (isNaN(numeric)) {
        throw new Error(
          `Unable to parse numeric part of the code at line ${i + 1}`,
        );
      }
      codes.push({ to_type: trimmed_line, numeric });
    }
  }

  if (codes.length <= 0) {
    throw new Error(
      "Got an empty file, cannot parse codes, are you sure you put the correct file as input?",
    );
  }

  return codes;
}

// Create a map from a bunch of lines
function createMap(
  lines: string[],
  indexOf: string,
): { map: mapItem[][]; index: Location } {
  let index: Location = { x: -1, y: -1 };

  const map: mapItem[][] = lines.map((line, y) => {
    const map_line: mapItem[] = [];
    for (let x = 0; x < line.length; x++) {
      map_line.push({
        char: line[x],
        distance: Infinity,
        sequence: "",
      });
      if (line[x] === indexOf) index = { x, y };
    }
    return map_line;
  });

  return { map, index };
}

// Dijkstra algorithm to find distance and sequence required to get to a goal
function dijkstra(
  map: mapItem[][],
  location: Location,
  goal: string,
  direction: { char: string; direction: Location } = {
    char: "",
    direction: { x: -1, y: -1 },
  },
  start: boolean = true,
): { distance: number; sequence: string; location: Location } {
  // If we hit the end, check if took the best path and return current distance and true
  if (map[location.y][location.x].char === goal) {
    //map[location.y][location.x].best_path = true;
    return {
      distance: map[location.y][location.x].distance,
      sequence: map[location.y][location.x].sequence.concat("A"),
      location,
    };
  }

  // Increase distance by one
  map[location.y][location.x].distance++;

  // Possible movements with the current direction sorted first
  const possible_movements: { char: string; direction: Location }[] = [
    { char: "<", direction: { x: -1, y: 0 } },
    { char: "v", direction: { x: 0, y: 1 } },
    { char: "^", direction: { x: 0, y: -1 } },
    { char: ">", direction: { x: 1, y: 0 } },
  ].sort((a) => {
    if (a.char === direction.char) {
      return -1;
    } else {
      return 0;
    }
  });

  // Possible outputs, so that we can run every single path possible
  const possible_outputs: {
    distance: number;
    sequence: string;
    location: Location;
  }[] = [];

  for (let i = 0; i < possible_movements.length; i++) {
    // If we are on 1 (meaning the original direction didn't work)
    // Add 1
    if (i === 1 && start === false) {
      map[location.y][location.x].distance++;
    }

    const future_location: Location = {
      x: location.x + possible_movements[i].direction.x,
      y: location.y + possible_movements[i].direction.y,
    };

    if (
      0 <= future_location.y &&
      0 <= future_location.x &&
      future_location.y < map.length &&
      future_location.x < map[future_location.y].length &&
      map[location.y][location.x].distance <= // Not the best check in the world, but it works fairly well
        map[future_location.y][future_location.x].distance &&
      map[future_location.y][future_location.x].char !== "#"
    ) {
      map[future_location.y][future_location.x].distance =
        map[location.y][location.x].distance;

      map[future_location.y][future_location.x].sequence = map[location.y][
        location.x // this is the odd thing
      ].sequence.concat(possible_movements[i].char);

      const output = dijkstra(
        map,
        future_location,
        goal,
        possible_movements[i],
        false,
      );
      if (output.distance !== -1) {
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
  return { distance: -1, sequence: "", location: { x: -1, y: -1 } };
}

// Wrapper around dijkstra to set the start and prevent changing the actual map
function dijkstra_wrapper(
  map_pointer: mapItem[][],
  start: Location,
  goal: string,
): { distance: number; sequence: string; location: Location } {
  const map = structuredClone(map_pointer);
  map[start.y][start.x].distance = 0;
  return dijkstra(map, start, goal);
}

// Get the sequence required to print one number
function getLengthDigit(
  start: Location,
  char: string,
): { sequence: string; end: Location } {
  const numeric_robot = dijkstra_wrapper(NUMERIC.map, start, char.toString());
  if (numeric_robot === undefined) {
    throw new Error(
      `Couldn't find ${char} inside of NUMERIC.map, this shouldn't happen...`,
    );
  }

  let output = "";
  let robot_start = DIRECTIONAL.index;

  for (const rchar of numeric_robot.sequence) {
    const robot_output = dijkstra_wrapper(DIRECTIONAL.map, robot_start, rchar);
    if (robot_output === undefined) {
      throw new Error(
        `Couldn't find ${rchar} inside of DIRECTIONAL.map, this shouldn't happen...`,
      );
    }

    robot_start = robot_output.location;

    let human_start = DIRECTIONAL.index;
    for (const hchar of robot_output.sequence) {
      const human_output = dijkstra_wrapper(
        DIRECTIONAL.map,
        human_start,
        hchar,
      );
      if (human_output === undefined) {
        throw new Error(
          `Couldn't find ${hchar} inside of DIRECTIONAL.map, this shouldn't happen...`,
        );
      }

      human_start = human_output.location;
      output = output.concat(human_output.sequence);
    }
  }

  return {
    sequence: output,
    end: numeric_robot.location,
  };
}

// Get the length required to type one code
function getLengthCode(to_type: string) {
  let start = NUMERIC.index;

  let code_sequence: string = "";
  for (const char of to_type) {
    const output = getLengthDigit(start, char);
    start = output.end;
    code_sequence = code_sequence.concat(output.sequence);
  }

  return code_sequence.length;
}

// Calculate the complexity of one code
function getComplexityCode(code: code) {
  const length = getLengthCode(code.to_type);
  return length * code.numeric;
}

// Calculate the total complexity
function calculateTotalComplexity(codes: code[]): number {
  let total_complexity = 0;
  for (const code of codes) {
    total_complexity += getComplexityCode(code);
  }

  return total_complexity;
}

async function main() {
  const filename = Deno.args[0];
  if (filename === null) {
    console.log("Usage: day-21.ts [filename]");
    throw new Error("Expected filename as first argument");
  }

  const lines: string[] = await OpenFileLineByLineAsArray(filename);
  const codes: code[] = parseCodes(lines);

  const total_complexity = calculateTotalComplexity(codes);

  console.log(`total complexity: ${total_complexity}`);
}

main();
