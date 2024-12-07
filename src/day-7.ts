import { isNumber, OpenFileLineByLineAsArray } from "./helper.ts";

function printUsage() {
  console.log("Usage: day-7.ts [filename]");
}

// Parse equations from file
// The first number in the equation is the test value
// The others are calibration numbers
function parse(lines: Array<string>): Array<Array<number>> {
  const equations: Array<Array<number>> = [];

  // Loop though every line in the file
  for (const line of lines) {
    // If it's an empty line ignore it
    if (line.trim() !== "") {
      const parsed_numbers: Array<string> = [];
      let i_numbers = 0;

      for (const char of line) {
        if (isNumber(char)) {
          if (parsed_numbers[i_numbers] !== undefined) {
            parsed_numbers[i_numbers] = parsed_numbers[i_numbers].concat(char);
          } else {
            parsed_numbers[i_numbers] = char;
          }
        } else if (char === ":") {
          if (parsed_numbers[i_numbers] === undefined) {
            throw new Error("Got a : even though we don't have a test value");
          }

          if (i_numbers !== 0) {
            throw new Error(
              "Got a : even though the test value is already defined",
            );
          }

          i_numbers++;
        } else if (char.trim() === "") {
          if (parsed_numbers[i_numbers] !== undefined) {
            i_numbers++;
          }
        } else {
          throw new Error(`Unexpected character (${char})`);
        }
      }

      // Convert each parsed number into an actual number type
      const numbers: Array<number> = [];
      for (const number of parsed_numbers) {
        const parsed_number = parseInt(number);

        if (parsed_number.toString() === number) {
          numbers.push(parseInt(number));
        } else {
          throw new Error(
            `Unable to convert parsed number (${number}) into actual number`,
          );
        }
      }

      equations.push(numbers);
    }
  }

  return equations;
}

// Check if the equation is valid or not
function checkEquation(equation_pointer: Array<number>): boolean {
  const equation = structuredClone(equation_pointer);

  // If we got only two values check if they are equal
  if (equation.length === 2) {
    if (equation[0] === equation[1]) {
      return true;
    } else {
      return false;
    }
  } else if (equation.length < 2) {
    return false;
  }

  // Try to divide and if it has a decimals then try a substraction
  const divide = equation[0] / equation[equation.length - 1];
  if (divide % 1 === 0) {
    // Divide could be valid so we continue using that divide

    // Since we already did the divide we replace the number with divide
    // And we remove the last number (the one we devided with)
    equation[0] = divide;
    equation.pop();

    // If the divide is actually invalid we try a substraction
    if (checkEquation(equation) === false) {
      const equation_copy = structuredClone(equation_pointer);
      const substraction = equation_copy[0] -
        equation_copy[equation_copy.length - 1];
      equation_copy[0] = substraction;
      equation_copy.pop();
      return checkEquation(equation_copy);
    }

    return true;
  } else {
    // Try substraction
    const substraction = equation[0] - equation[equation.length - 1];
    equation[0] = substraction;
    equation.pop();
    return checkEquation(equation);
  }
}

// Calculate the number of total valid calibrations in equations
function calculateTotalCalibration(equations: Array<Array<number>>) {
  let total_calibration = 0;

  for (let i = 0; i < equations.length; i++) {
    if (checkEquation(equations[i]) === true) {
      total_calibration += equations[i][0];
    }
  }

  return total_calibration;
}

const filename = Deno.args[0];
if (filename == null) {
  printUsage();
  Deno.exit(1);
}

const lines = await OpenFileLineByLineAsArray(filename);
const parsed = parse(lines);
const total_calibration = calculateTotalCalibration(parsed);
console.log(`total calibration: ${total_calibration}`);
