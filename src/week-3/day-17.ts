import { OpenFileLineByLineAsArray } from "../helper.ts";

enum ParsingStatus {
  Nothing,
  Finished_A,
  Finished_B,
  Finished_C,
  Finished_Program,
}

type Instruction = {
  opcode: number;
  operand: number;
};

type Process = {
  a: number;
  b: number;
  c: number;
  program: Instruction[];
};

const A_START = "Register A: ";
const B_START = "Register B: ";
const C_START = "Register C: ";

const PROGRAM_START = "Program: ";

function printUsage() {
  console.log("Usage: day-17.ts [filename]");
}

function parseString(line: string, start: string): string {
  if (line.slice(0, start.length) !== start) {
    throw new Error(
      `Unexepected start, expected ${start} to start the line and got something else`,
    );
  }

  return line.slice(start.length);
}

function parseNumber(line: string, start: string): number {
  const number = parseInt(parseString(line, start));

  if (isNaN(number)) {
    throw new Error(`Parsed number is NaN, line (${line}) may be invalid`);
  }
  return number;
}

// Parse computer/process from file
function parseComputer(lines: string[]): Process {
  let parsing_status: ParsingStatus = ParsingStatus.Nothing;

  let a: number | undefined;
  let b: number | undefined;
  let c: number | undefined;

  let process: Process = { a: -1, b: -1, c: -1, program: [] };

  for (let i = 0; i < lines.length; i++) {
    const trimmed_line = lines[i].trim();
    if (trimmed_line !== "") {
      if (parsing_status === ParsingStatus.Nothing && a === undefined) {
        parsing_status = ParsingStatus.Finished_A;
        a = parseNumber(trimmed_line, A_START);
      } else if (
        parsing_status === ParsingStatus.Finished_A &&
        b === undefined
      ) {
        parsing_status = ParsingStatus.Finished_B;
        b = parseNumber(trimmed_line, B_START);
      } else if (
        parsing_status === ParsingStatus.Finished_B &&
        c === undefined
      ) {
        parsing_status = ParsingStatus.Finished_C;
        c = parseNumber(trimmed_line, C_START);
      } else if (
        parsing_status === ParsingStatus.Finished_C &&
        a !== undefined &&
        b !== undefined &&
        c !== undefined
      ) {
        parsing_status = ParsingStatus.Finished_Program;

        const program_numbers = parseString(trimmed_line, PROGRAM_START)
          .split(",")
          .map(Number);

        if (program_numbers.length <= 0) {
          throw new Error("Program is empty");
        }

        if (program_numbers.length % 2 !== 0) {
          throw new Error(
            "Program numbers are not even, even tho they should be a pair of opcodes and operands",
          );
        }

        process = { a, b, c, program: [] };

        for (let l = 1; l < program_numbers.length; l += 2) {
          if (isNaN(program_numbers[l])) {
            throw new Error(
              `Got NaN in one of the program numbers at line ${i + 1}`,
            );
          }

          const instruction: Instruction = {
            opcode: program_numbers[l - 1],
            operand: program_numbers[l],
          };

          process.program.push(instruction);
        }
      } else {
        throw new Error(`Unexpected non empty line on line ${i + 1}`);
      }
    }
  }

  return process;
}

// Get combo operand from literal operand
function comboOperand(
  operand: number,
  a: number,
  b: number,
  c: number,
): number {
  switch (operand) {
    case 0:
    case 1:
    case 2:
    case 3:
      return operand;
    case 4:
      return a;
    case 5:
      return b;
    case 6:
      return c;
    default:
      throw new Error(
        `Unexpected operand (${operand}), we only support operands from 0 to 6 included`,
      );
  }
}

// Divide instruction
function dv(a: number, combo_operand: number): number {
  const numerator = a;
  const denominator = 2 ** combo_operand;

  return Math.trunc(numerator / denominator);
}

// Execute process
function execute(process: Process): number[] {
  let instruction_pointer: number = 0;

  const output: number[] = [];

  // Repeat until we are out of the program size
  while (instruction_pointer < process.program.length) {
    const current_instruction = process.program[instruction_pointer];
    const combo_operand = comboOperand(
      current_instruction.operand,
      process.a,
      process.b,
      process.c,
    );

    switch (current_instruction.opcode) {
      // adv instruction (division)
      case 0: {
        process.a = dv(process.a, combo_operand);
        break;
      }
      // bxl instruction
      case 1: {
        process.b = process.b ^ current_instruction.operand;
        break;
      }
      // bst instruction
      case 2: {
        process.b = combo_operand % 8;
        break;
      }
      // jnz instruction
      case 3: {
        if (process.a !== 0) {
          instruction_pointer = current_instruction.operand - 1;
        }
        break;
      }
      // bxc instruction
      case 4: {
        process.b = process.b ^ process.c;
        break;
      }
      // out instruction
      case 5: {
        output.push(combo_operand % 8);
        break;
      }
      // bdv instruction
      case 6: {
        process.b = dv(process.a, combo_operand);
        break;
      }
      // cdv instruction
      case 7: {
        process.c = dv(process.a, combo_operand);
        break;
      }
    }

    instruction_pointer++;
  }

  return output;
}

// Format output into the way that it's intended
function formatOutput(output: number[]): string {
  let formatted: string = output[0].toString();
  for (let i = 1; i < output.length; i++) {
    formatted = formatted.concat(",", output[i].toString());
  }

  return formatted;
}

async function main() {
  const filename = Deno.args[0];
  if (filename === null) {
    printUsage();
    throw new Error(
      "Please put a filename to the input file as first argument!",
    );
  }

  const lines: string[] = await OpenFileLineByLineAsArray(filename);
  const process: Process = parseComputer(lines);

  const output: number[] = execute(process);
  const formatted_output: string = formatOutput(output);

  console.log(`part one: ${formatted_output}`);
}

main();
