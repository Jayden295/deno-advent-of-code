import { Location, OpenFileLineByLineAsArray } from "../helper.ts";

const P_START = "p=";
const V_START = " v=";

interface Robot {
  position: Location;
  velocity: Location;
}

function printUsage() {
  console.log("Usage: day-14.ts [filename] [time_for_part_one] [maximum_amount_of_tries (part_two)]");
}

// Parse robot position and velocity from line
function parseLine(
  line: string,
  FIRST_START: string,
  SECOND_START: string,
): Robot {
  // Parse position
  if (line.slice(0, FIRST_START.length) !== FIRST_START) {
    throw new Error(
      `Unable to parse the first part of the current line (${line})`,
    );
  }

  const end_of_first = line.indexOf(SECOND_START.slice(0, 1));
  const section_first: string = line.slice(FIRST_START.length, end_of_first);

  const parsed_first = section_first.split(",");
  const first = parsed_first.map(Number);
  for (const number of first) {
    if (isNaN(number)) {
      throw new Error(`Unable to convert to number in current line (${line})`);
    }
  }

  const position: Location = { x: first[0], y: first[1] };

  // Parse velocity
  if (
    line.slice(end_of_first, end_of_first + SECOND_START.length) !==
      SECOND_START
  ) {
    throw new Error(
      `Unable to parse the second part of the current line (${line})`,
    );
  }

  const section_second: string = line.slice(
    end_of_first + SECOND_START.length,
    line.length,
  );

  const parsed_second = section_second.split(",");
  const second = parsed_second.map(Number);
  for (const number of second) {
    if (isNaN(number)) {
      throw new Error(`Unable to convert to number in current line (${line})`);
    }
  }

  const velocity: Location = { x: second[0], y: second[1] };

  const robot: Robot = { position, velocity };
  return robot;
}

// Returns a list of robots from multiple lines
function parseRobots(lines: string[]): Robot[] {
  const robots: Robot[] = [];

  for (const line of lines) {
    const trimmed_line: string = line.trim();

    if (trimmed_line !== "") {
      const robot: Robot = parseLine(
        trimmed_line,
        P_START,
        V_START,
      );

      robots.push(robot);
    }
  }

  return robots;
}

function moveRobotsAfter(
  robots: Robot[],
  size: Location,
  seconds: number,
): { safety_factor: number; maybe_tree: boolean } {
  const quadrants = [
    [0, 0],
    [0, 0],
  ];

  const map = Array.from({ length: size.y }, () => ".".repeat(size.x));

  const middle_limit: Location = {
    x: Math.floor(size.x / 2),
    y: Math.floor(size.y / 2),
  };

  for (const robot of robots) {
    // Future positions
    let future_x = (robot.position.x + robot.velocity.x * seconds) % size.x;
    if (future_x < 0) {
      future_x += size.x;
    }

    let future_y = (robot.position.y + robot.velocity.y * seconds) % size.y;
    if (future_y < 0) {
      future_y += size.y;
    }

    // Update quadrant
    if (future_x < middle_limit.x) {
      if (future_y < middle_limit.y) {
        quadrants[0][0]++;
      } else if (future_y > middle_limit.y) {
        quadrants[1][0]++;
      }
    } else if (future_x > middle_limit.x) {
      if (future_y < middle_limit.y) {
        quadrants[0][1]++;
      } else if (future_y > middle_limit.y) {
        quadrants[1][1]++;
      }
    }

    // Update map
    const as_array = [...map[future_y]];
    as_array[future_x] = "#";
    map[future_y] = as_array.join("");
  }

  const safety_factor = quadrants[0][0] * quadrants[0][1] * quadrants[1][0] *
    quadrants[1][1];

    // Loop over each line of the map to see if we potentially have a tree
  for (const line of map) {
    if (line.includes("###########")) {
      console.log("MAYBE THIS ONE IS A TREE");

      // Print the whole tree if we think we found it
      for (const line of map) {
        console.log(line);
      }

      console.log("MAYBE THIS ONE IS A TREE");
      return { safety_factor, maybe_tree: true };
    }
  }

  return { safety_factor, maybe_tree: false };
}

async function main() {
  const filename: string = Deno.args[0];
  if (filename === null) {
    printUsage();
    throw new Error("Please write a valid filename and other arguments")
  }

  const time_for_part_one: number = parseInt(Deno.args[1]);
  if (isNaN(time_for_part_one)) {
    printUsage();
    throw new Error("Please write a valid time for part one and other arguments");
  }

  const amount_of_tries: number = parseInt(Deno.args[2]);
  if (isNaN(amount_of_tries)) {
    printUsage();
    throw new Error("Please write a valid amount of tries and other arguments")
  }

  const lines: string[] = await OpenFileLineByLineAsArray(filename);
  const robots: Robot[] = parseRobots(lines);
  const size: Location = { x: 101, y: 103 };

  // Loop over each second to see if we get something that looks like a tree
  // If we looped on the part one amount of time, then output it's safety factor
  for (let i = 0; i < amount_of_tries; i++) {
    const info = moveRobotsAfter(robots, size, i);
    if (i === time_for_part_one) {
        console.log(`part one safety factor (after ${time_for_part_one} seconds): ${info.safety_factor}`);
    }

    if (info.maybe_tree === true) {
      console.log(`seconds passed: ${i}`);
      console.log(``);
    }
  }
}

main();
