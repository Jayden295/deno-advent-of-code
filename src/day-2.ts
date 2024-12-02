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

// Calculate safe reports from inputs
function CalculateSafeReports(inputs: Array<Array<number>>) {
  let number_of_safe_reports = 0;

  // Loop though each report
  for (const report of inputs) {
    let safe = true;

    // null => unknown
    // true => increasing
    // false => decreasing
    let increasing = null;

    // Loop though each levels from level 1 (since we compare previous too)
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
            safe = false;
            break;
          }
        } else {
          safe = false;
          break;
        }
      } // Levels decreasing
      else if (previous_level > current_level) {

        // Make sure that we have been decreasing since the start
        if (increasing == null || increasing == false) {
          increasing = false;

          // Make sure difference is between 1 and 3 (included)
          const difference = previous_level - current_level;
          if (difference < 1 || 3 < difference) {
            safe = false;
            break;
          }
        } else {
          safe = false;
          break;
        }
      } // Levels are the same
      else {
        safe = false;
        break;
      }
    }

    if (safe == true)
      number_of_safe_reports++;
  }

  return number_of_safe_reports;
}

const filename = Deno.args[0];
if (filename == null) {
  PrintUsage();
  Deno.exit(1);
}

const inputs = await ParseInputsFromFile(filename);
const number_of_safe_reports = CalculateSafeReports(inputs);

console.log(`number of safe reports: ${number_of_safe_reports}`);
