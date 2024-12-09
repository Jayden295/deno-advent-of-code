import { isNumber, OpenFileLineByLineAsArray } from "../helper.ts";

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

// Check if the equation is valid or not with concat instructions
function checkEquationConcat(equation_pointer: Array<number>): boolean {
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

  // Multiply both first values
  const multiple = equation[1] * equation[2];

  equation[1] = multiple;
  equation.splice(2, 1);

  // If this is invalid try it with adding
  if (checkEquationConcat(equation) === false) {
    const equation_copy = structuredClone(equation_pointer);
    const adding = equation_copy[1] +
      equation_copy[2];
    equation_copy[1] = adding;
    equation_copy.splice(2, 1);

    // If this is still invalid try it with concat instruction
    if (checkEquationConcat(equation_copy) === false) {
      const another_equation_copy = structuredClone(equation_pointer);
      const concat = parseInt(
        another_equation_copy[1].toString().concat(
          another_equation_copy[2].toString(),
        ),
      );

      another_equation_copy[1] = concat;
      another_equation_copy.splice(2, 1);

      return checkEquationConcat(another_equation_copy);
    }
    return true;
  }

  return true;
}

// Calculate the number of total valid calibrations in equations
function calculateTotalCalibration(equations: Array<Array<number>>) {
  let total_calibration = 0;
  let total_calibration_concat = 0;

  for (let i = 0; i < equations.length; i++) {
    if (checkEquation(equations[i]) === true) {
      total_calibration += equations[i][0]
    }

    if (checkEquationConcat(equations[i]) === true) {
      total_calibration_concat += equations[i][0];
    }
  }

  return {total_calibration, total_calibration_concat};
}

const filename = Deno.args[0];
if (filename == null) {
  printUsage();
  Deno.exit(1);
}

const lines = await OpenFileLineByLineAsArray(filename);
const parsed = parse(lines);
const total_calibrations = calculateTotalCalibration(parsed);

console.log(`total calibration: ${total_calibrations.total_calibration}`);
console.log(`total calibration with concat: ${total_calibrations.total_calibration_concat}`);
