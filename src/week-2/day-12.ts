import { Location, OpenFileLineByLineAsArray } from "../helper.ts";

interface mapItem {
  char: string;
  location_visited: boolean;
}

interface plotSize {
  area: number;
  perimeter: number;
  corners: number;
}

function printUsage() {
  console.log("Usage: day-10.ts [filename]");
}

// Parse lines
// Take each line of the file while removing whitespace
function parse(lines: string[]): mapItem[][] {
  const map: mapItem[][] = [];
  let finished: boolean = false;

  for (let i = 0; i < lines.length; i++) {
    const trimmed_line = lines[i].trim();

    if (trimmed_line !== "") {
      if (finished === false) {
        const converted_line: mapItem[] = [];
        for (const char of trimmed_line) {
          converted_line.push({ char, location_visited: false });
        }
        map.push(converted_line);
      } else {
        throw new Error(`Unexpected non empty line at line ${i + 1}`);
      }
    } // Say that we finished parsing the map once we get an empty line
    else if (0 < map.length) {
      finished = true;
    }
  }

  return map;
}

// Get total price for the current region
// Modifies map and says it's modified
function getRegionPrice(map: mapItem[][], current: Location): plotSize {
  const possible_movement: Location[] = [
    { x: 0, y: -1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];

  const current_map_item: mapItem = map[current.y][current.x];

  // Start area at one since the current one we are on is one
  let area: number = 1;
  let perimeter: number = 0;
  let corners: number = countCorner(map, current);

  current_map_item.location_visited = true;

  for (const movement of possible_movement) {
    const to_test: Location = {
      x: movement.x + current.x,
      y: movement.y + current.y,
    };

    // Check if index is within bounds
    if (
      0 <= to_test.y && to_test.y < map.length && 0 <= to_test.x &&
      to_test.x < map[to_test.y].length
    ) {
      const map_item_to_test: mapItem = map[to_test.y][to_test.x];

      if (
        current_map_item.char === map_item_to_test.char
      ) {
        if (
          map_item_to_test.location_visited === false
        ) {
          map_item_to_test.location_visited = true;

          const neighbour_price: plotSize = getRegionPrice(map, to_test);

          corners += neighbour_price.corners;
          area += neighbour_price.area;
          perimeter += neighbour_price.perimeter;
        }
      } else {
        perimeter++;
      }
    } else {
      perimeter++;
    }
  }

  return { area, perimeter, corners };
}

// Count amount of corners in one map item
function countCorner(map: mapItem[][], current: Location): number {
  const expected_char: string = map[current.y][current.x].char;
  let corners: number = 0;

  // Don't get fooled, we move the x by 1 and move the y by -1 seperately
  const possible_start_of_corners: Location[] = [
    { x: 1, y: -1 },
    { x: -1, y: -1 },
    { x: 1, y: 1 },
    { x: -1, y: 1 },
  ];

  for (const possible_start of possible_start_of_corners) {
    const test_x = possible_start.x + current.x;
    const test_y = possible_start.y + current.y;

    let y_valid = false;
    let x_valid = false;
    let xy_valid = false;

    if (
      0 <= test_y && test_y < map.length && 0 <= current.x &&
      current.x < map[test_y].length && map[test_y][current.x].char === expected_char
    ) {
      y_valid = true;
    }

    if (
      0 <= current.y && current.y < map.length && 0 <= test_x &&
      test_x < map[current.y].length && map[current.y][test_x].char === expected_char
    ) {
      x_valid = true;
    }

    if (
      0 <= test_y && test_y < map.length && 0 <= test_x &&
      test_x < map[test_y].length && map[test_y][test_x].char === expected_char
    ) {
      xy_valid = true;
    }

    if (x_valid === true && y_valid === true && xy_valid === false) {
      corners++;
    }

    if (x_valid === false && y_valid === false) {
      corners++;
    }
  }

  return corners;
}

// Loop though every character to get total price
function getTotalPrice(
  map_pointer: mapItem[][],
): { normal_price: number; bulk_price: number } {
  const map: mapItem[][] = structuredClone(map_pointer);
  let normal_price: number = 0;
  let bulk_price: number = 0;

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x].location_visited === false) {
        const output: plotSize = getRegionPrice(map, { x, y });

        normal_price += output.area * output.perimeter;
        bulk_price += output.area * output.corners;
      }
    }
  }

  return { normal_price, bulk_price };
}

async function main() {
  const filename: string = Deno.args[0];
  if (filename === null) {
    printUsage();
    Deno.exit(1);
  }

  const lines: string[] = await OpenFileLineByLineAsArray(filename);
  const map: mapItem[][] = parse(lines);

  const prices = getTotalPrice(map);

  console.log(`normal (non bulk) price (part 1) : ${prices.normal_price}`);
  console.log(`bulk price (part 2) : ${prices.bulk_price}`);
}

main();
