// SPDX-License-Identifier: GPL-3.0-or-later
import { OpenFileLineByLine } from "./helper.ts";

function PrintUsage() {
  console.log("Usage: day-2.ts [filename]");
}

// Parse inputs from file,
// Returns a arrays (reports) of array of numbers (levels)
async function ParseInputsFromFile(filename: string) {
  const lines = await OpenFileLineByLine(filename);
  const inputs = [];

  for await (let line of lines) {
    const report: Array<number> = [];
    let parsed_number = parseInt(line);

    // Loop though each number in the line
    do {
      report.push(parsed_number);

      // Remove the parsed number so we can parse the next one
      line = line.replace(
        String(parsed_number),
        "",
      );
      parsed_number = parseInt(line);
    } while (!isNaN(parsed_number));

    inputs.push(report);
  }

  return inputs;
}

// Checks one report with or without the problem dampener
// Outputs if it is safe or not
// and (only if problem dampener is on) the invalid indexes of it
function CheckReport(report: Array<number>, problem_dampener: boolean) {
  let increasing = null;
  let safe = true;
  const invalid_indexes = [];

  for (let i = 1; i < report.length; i++) {
    const previous_level = report[i - 1];
    const current_level = report[i];

    // Levels increasing
    if (previous_level < current_level) {
      // If we are still increasing and didn't decrease before
      if (increasing == null || increasing == true) {
        increasing = true;

        // Make sure that the difference is between 1 and 3 (included)
        const difference = current_level - previous_level;
        if (difference < 1 || 3 < difference) {
          if (problem_dampener == true) {
            invalid_indexes.push(i - 1);
            invalid_indexes.push(i);
            i++;
            safe = false;
          } else {
            safe = false;
            break;
          }
        }
      } else {
        if (problem_dampener == true) {
          invalid_indexes.push(i - 1);
          invalid_indexes.push(i);
          i++;
          safe = false;
        } else {
          safe = false;
          break;
        }
      }
    } // Levels decreasing
    else if (previous_level > current_level) {
      // Make sure that we have been decreasing since the start
      if (increasing == null || increasing == false) {
        increasing = false;

        // Make sure difference is between 1 and 3 (included)
        const difference = previous_level - current_level;
        if (difference < 1 || 3 < difference) {
          if (problem_dampener === true) {
            invalid_indexes.push(i - 1);
            invalid_indexes.push(i);
            i++;
            safe = false;
          } else {
            safe = false;
            break;
          }
        }
      } else {
        if (problem_dampener === true) {
          invalid_indexes.push(i - 1);
          invalid_indexes.push(i);
          i++;
          safe = false;
        } else {
          safe = false;
          break;
        }
      }
    } // Levels are the same
    else {
      if (problem_dampener === true) {
        invalid_indexes.push(i - 1);
        invalid_indexes.push(i);
        i++;
        safe = false;
      } else {
        safe = false;
        break;
      }
    }
  }

  return { safe, invalid_indexes };
}

// Calculate safe reports from inputs
// Can calculate with problem dampener or not
function CalculateSafeReports(
  inputs: Array<Array<number>>,
  problem_dampener: boolean,
) {
  let number_of_safe_reports = 0;

  // Loop though each report
  for (const report of inputs) {
    let checked_report = CheckReport(report, problem_dampener);

    // Invalid indexes is only filled if problem dampener is true
    const invalid_indexes = checked_report.invalid_indexes;

    // Loop though each invalid index to see which one works
    for (let i = 0; i < invalid_indexes.length; i++) {
      if (checked_report.safe == true) {
        break;
      }

      const dampened_report = report.slice();
      dampened_report.splice(invalid_indexes[i], 1);
      checked_report = CheckReport(dampened_report, false);
    }

    if (checked_report.safe == true) {
      number_of_safe_reports++;
    }
  }

  return number_of_safe_reports;
}

const filename = Deno.args[0];
if (filename == null) {
  PrintUsage();
  Deno.exit(1);
}

const inputs = await ParseInputsFromFile(filename);
const number_of_safe_reports = CalculateSafeReports(inputs, false);
const with_problem_dampener = CalculateSafeReports(inputs, true);

console.log(`number of safe reports: ${number_of_safe_reports}`);
console.log(
  `number of safe reports (with problem dampener): ${with_problem_dampener}`,
);
