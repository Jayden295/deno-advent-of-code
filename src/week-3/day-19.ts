import { OpenFileLineByLineAsArray } from "../helper.ts";

enum ParsingStatus {
  Nothing,
  FinishedPatterns,
  StartedDesired,
  FinishedDesired,
}

function printUsage() {
  console.log("Usage: day-19.ts [filename]");
}

// Parse availible and desired designs from a list of lines
function parseTowels(lines: string[]): {
  availible_patterns: string[];
  desired_designs: string[];
} {
  let parsing_status = ParsingStatus.Nothing;

  let availible_patterns: string[] = [];
  const desired_designs: string[] = [];

  // Loop though every line
  for (let i = 0; i < lines.length; i++) {
    const trimmed_line = lines[i].trim();

    if (trimmed_line !== "") {
      if (parsing_status === ParsingStatus.Nothing) {
        parsing_status = ParsingStatus.FinishedPatterns;
        availible_patterns = trimmed_line.split(",").map((s) => s.trim());
      } else if (
        parsing_status === ParsingStatus.FinishedPatterns ||
        parsing_status === ParsingStatus.StartedDesired
      ) {
        parsing_status = ParsingStatus.StartedDesired;
        desired_designs.push(trimmed_line);
      } else {
        throw new Error(
          `Unexpected line at line ${i + 1}, we already finished parsing`,
        );
      }
    } else if (parsing_status === ParsingStatus.StartedDesired) {
      parsing_status = ParsingStatus.FinishedDesired;
    }
  }

  return { availible_patterns, desired_designs };
}

function checkDesign(
  availible_patterns: string[],
  desired_design: string,
  cache: Map<string, boolean> = new Map(),
): boolean {
  if (desired_design === "") {
    return true;
  }
  if (cache.get(desired_design) !== undefined)
    return cache.get(desired_design)!;

  for (const pattern of availible_patterns) {
    if (desired_design.startsWith(pattern)) {
      if (
        checkDesign(
          availible_patterns,
          desired_design.slice(pattern.length),
          cache,
        ) === true
      )
        return true;
    }
  }

  cache.set(desired_design, false);
  return false;
}

function countPossibleDesigns(
  availible_patterns: string[],
  desired_designs: string[],
) {
  let count = 0;
  for (let i = 0; i < desired_designs.length; i++) {
    if (checkDesign(availible_patterns, desired_designs[i]) === true) {
      count++;
    }
    // console.log(`${i}/${desired_designs.length}`);
  }

  return count;
}

async function main() {
  const filename = Deno.args[0];
  if (filename === null) {
    printUsage();
    throw new Error("No filename provided as first argument");
  }

  const lines = await OpenFileLineByLineAsArray(filename);
  const output = parseTowels(lines);

  const availible_patterns = output.availible_patterns;
  const desired_designs = output.desired_designs;
  console.log(countPossibleDesigns(availible_patterns, desired_designs));
}

main();
