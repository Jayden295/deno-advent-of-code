import { Location, OpenFileLineByLineAsArray } from "../helper.ts";

const BUTTON_A_X_START = "Button A: X+";
const BUTTON_B_X_START = "Button B: X+";

const BUTTON_AB_Y_START = ", Y+";

const PRIZE_X_START = "Prize: X=";
const PRIZE_Y_START = ", Y=";

export interface Machine {
  a: Location;
  b: Location;
  prize: Location;
}

function printUsage() {
  console.log("Usage: day-13.ts [filename]");
}

// Parses one line, returns the parsed x and y
function parseLine(line: string, X_START: string, Y_START: string): Location {
  // Parse X
  if (line.slice(0, X_START.length) !== X_START) {
    throw new Error(`Unable to parse the x part of the current line (${line})`);
  }

  const end_of_x = line.indexOf(Y_START.slice(0, 1));
  const parsed_x: string = line.slice(X_START.length, end_of_x);
  const x: number = parseInt(parsed_x);
  if (x.toString() !== parsed_x) {
    throw new Error(
      `X (${parsed_x}) is not a number in the current line (${line})`,
    );
  }

  // Parse Y
  if (line.slice(end_of_x, end_of_x + Y_START.length) !== Y_START) {
    throw new Error(`Unable to parse the y part of the current line (${line})`);
  }

  const parsed_y = line.slice(
    end_of_x + Y_START.length,
    line.length,
  );
  const y: number = parseInt(parsed_y);

  if (y.toString() !== parsed_y) {
    throw new Error(
      `Y (${parsed_y}) is not a number in the current line (${line})`,
    );
  }

  const parsed: Location = { x: x, y: y };
  return parsed;
}

function parseLines(lines: string[]): Machine[] {
  const machines: Machine[] = [];

  for (let i = 0; i < lines.length; i++) {
    let trimmed_line: string = lines[i].trim();

    if (trimmed_line !== "") {
      const a: Location = parseLine(
        trimmed_line,
        BUTTON_A_X_START,
        BUTTON_AB_Y_START,
      );

      i++;
      trimmed_line = lines[i].trim();
      const b: Location = parseLine(
        trimmed_line,
        BUTTON_B_X_START,
        BUTTON_AB_Y_START,
      );

      i++;
      trimmed_line = lines[i].trim();
      const prize: Location = parseLine(
        trimmed_line,
        PRIZE_X_START,
        PRIZE_Y_START,
      );

      machines.push({ a, b, prize });
    }
  }

  return machines;
}

// Return the least amount of tokens used to suceed
// At the machine, returns 0 if it's impossible without more then 100 tries
function countTokensUsed(machine: Machine): number {
  for (let nb = 1; nb <= 100; nb++) {
    const na = (machine.prize.x - nb * machine.b.x) / machine.a.x;
    if (
      na % 1 === 0 && na <= 100 &&
      machine.prize.y === na * machine.a.y + nb * machine.b.y
    ) {
      return na * 3 + nb;
    }
  }

  return 0;
}

// Part one, returns amount of tokens used for a bunch of machines
function partOne(machines: Machine[]): number {
  let tokens_used: number = 0;

  for (const machine of machines) {
    tokens_used += countTokensUsed(machine);
  }

  return tokens_used;
}

async function main() {
  const filename: string = Deno.args[0];
  if (filename === null) {
    printUsage();
    Deno.exit(1);
  }

  const lines: string[] = await OpenFileLineByLineAsArray(filename);
  const machines: Machine[] = parseLines(lines);

  const part_one: number = partOne(machines);
  console.log(`part 1 (tokens used): ${part_one}`);
}

main();
