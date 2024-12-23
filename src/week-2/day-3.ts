// SPDX-License-Identifier: GPL-3.0-or-later
import { OpenFileLineByLine } from "../helper.ts";

const expected_mul = "mul(";
const expected_do = "do()";
const expected_dont = "don't()";

function printUsage() {
  console.log("Usage: day-2.ts [filename]");
}

function isNumber(char: string) {
  return /^\d+$/.test(char);
}

// Gets a line as an input, and returns how many chars were processed (i_parsed_number)
// And output_number which is not 0 when there was a valid mul instruction
function parseInstruction(line: string, enable: boolean) {
  let inside_valid_mul = false;
  let output_number: bigint = BigInt(0);

  const parsed_numbers = ["", ""];
  let i_parsed_number = 0;

  let i = 0;
  for (i = 0; i < line.length; i++) {
    // Check mul instruction
    if (line.substring(i, i + expected_mul.length) === expected_mul) {
      i += expected_mul.length;
      inside_valid_mul = true;
    } // Check do() instruction
    else if (line.substring(i, i + expected_do.length) === expected_do) {
      i += expected_do.length;
      enable = true;

      if (inside_valid_mul === true) {
        return { i, output_number, enable };
      }
    } // Check don't() instruction
    else if (line.substring(i, i + expected_dont.length) === expected_dont) {
      i += expected_dont.length;
      enable = false;

      if (inside_valid_mul === true) {
        return { i, output_number, enable };
      }
    }

    // If it is a , and it only happened once, add it to the second number
    if (line[i] === ",") {
      if (i_parsed_number === 0) {
        i_parsed_number++;
      } else {
        return { i, output_number, enable };
      }

      // If we finished the mul instruction
    } else if (line[i] === ")") {
      // If we indeed parsed 2 numbers
      if (parsed_numbers[0] != "" && parsed_numbers[1] != "") {
        // Multiply the two numbers together
        output_number = BigInt(
          parseInt(parsed_numbers[0]) * parseInt(parsed_numbers[1]),
        );
      }

      return { i, output_number, enable };

      // If we are in a mul instruction then parse
    } else if (inside_valid_mul === true) {
      if (isNumber(line[i])) {
        // Add the current char to the parsed_number
        parsed_numbers[i_parsed_number] = parsed_numbers[i_parsed_number]
          .concat(line[i]);
      } else {
        return { i, output_number, enable };
      }
    } else {
      return { i, output_number, enable };
    }
  }

  return { i, output_number, enable };
}

// Function that processes a file with a filename
// Returns the output of all of the mul instructions
async function processFile(filename: string) {
  const lines = await OpenFileLineByLine(filename);
  let part_one: bigint = BigInt(0);
  let part_two: bigint = BigInt(0);
  let enable = true;

  for await (const line of lines) {
    for (let i = 0; i < line.length; i++) {
      // If the current char is m, then it may be an instruction
      if (line[i] === "m" || line[i] === "d") {
        const output = parseInstruction(line.substring(i), enable);
        enable = output.enable;

        // Add the output.i to i to prevent processing chars twice
        if (output.i > 0) {
          i += output.i; // Remove 1 since we will add one again since this is a for loop
          part_one += output.output_number;

          if (output.enable === true) {
            part_two += output.output_number;
          }

          i--;
        }
      }
    }
  }

  return { part_one, part_two };
}

const filename = Deno.args[0];
if (filename == null) {
  printUsage();
  Deno.exit(1);
}

const instructions_output = await processFile(filename);

console.log(
  `output of all of the mul instructions: ${instructions_output.part_one}`,
);
console.log(
  `output of all of the mul instructions (with do's and don'ts): ${instructions_output.part_two}`,
);
