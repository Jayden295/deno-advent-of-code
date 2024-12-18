//console.log(maze[1][13].score);
console.log(maze[9][3]);
let count = 0;
for (const line of maze) {
  for (const item of line) {
    //console.log(char);
    const encoder = new TextEncoder();
    let to_encode: string = item.char;
    if (item.valid_path === false) {
      to_encode = "#";
    }

    //console.log(item.score);

    //i;

    if (to_encode !== "#") {
      count++;
    }

    const data = encoder.encode(to_encode);
    const bytesWritten = await Deno.stdout.write(data); // 11
  }
  console.log("");
}

// Solve maze and return maze smallest possible score
function solveMaze(
  map: mapItem[][],
  location: Location,
  direction: Location,
  score: number,
): { score: number; valid_path: boolean; predecessors: number } {
  // If we are on the end, just return the score
  if (map[location.y][location.x].char === "E") {
    let valid_path = false;
    if (score === 11048) {
      valid_path = true;
    }

    map[location.y][location.x].valid_path = valid_path;
    if (
      map[location.y][location.x].path_score === -1 ||
      score < map[location.y][location.x].path_score
    ) {
      map[location.y][location.x].path_score = score;
    }
    return { score, valid_path: valid_path, predecessors: 1 };
  }

  let found: boolean = false;
  for (const dir of map[location.y][location.x].directions) {
    if (direction.x === dir.x && direction.y === dir.y) {
      found = true;
      break;
    }
  }
  if (found === false) {
    map[location.y][location.x].directions.push(direction);
  }
  map[location.y][location.x].score = score;

  const scores: number[] = [];
  let cool: number[] = [];
  let predecessors: number = 0;
  let valid_path: boolean = false;

  const possible_movements: Location[] = [
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];

  // For every movement possible
  for (const movement of possible_movements) {
    const future_location = {
      x: location.x + movement.x,
      y: location.y + movement.y,
    };

    // If we are in bounds and that the current score is not -1 or bigger then the current one
    // And if it is a free space/an ending space

    // GENERATEA  CHECKSUM OF THE CURRENT PATH
    // SO THAT WE CANT DO IT TWICE
    // also track directions!
    // (map[future_location.y][future_location.x].score === -1 ||
    //score <= map[future_location.y][future_location.x].score)
    let direction_already_done: boolean = false;

    if (
      0 <= future_location.y &&
      0 <= future_location.x &&
      future_location.y < map.length &&
      future_location.x < map[future_location.y].length
    ) {
      for (const dir of map[future_location.y][future_location.x].directions) {
        if (dir.x === movement.x && dir.y === movement.y) {
          direction_already_done = true;
        } else {
          direction_already_done = false;
        }
      }
    }

    // count amount of predecessors?
    if (
      0 <= future_location.y &&
      0 <= future_location.x &&
      future_location.y < map.length &&
      future_location.x < map[future_location.y].length &&
      (map[future_location.y][future_location.x].score === -1 ||
        score < map[future_location.y][future_location.x].score) && // FIXME: Check if we already went there in the current direction
      (map[future_location.y][future_location.x].char === "." ||
        map[future_location.y][future_location.x].char === "E")
    ) {
      let change_score_by = 1;
      predecessors++;

      // If both directions are not equal
      if (direction.x !== movement.x || direction.y !== movement.y) {
        change_score_by += 1000;
      }

      const output = solveMaze(
        map,
        future_location,
        movement,
        score + change_score_by,
      );

      if (output.valid_path === true) {
        valid_path = true;
        map[location.y][location.x].valid_path = true;
        // here we want the current direciton we are going in
        //map[location.y][location.x].directions.push();
      }

      cool.push(output.predecessors);
      scores.push(output.score);
    }
  }

  // Return the smallest of all scores
  // One nice thing is that it returns infinity if it's empty (maze can't be solved)
  //console.log(Math.min(...scores));

  if (location.y === 10 && location.x === 3) {
    //console.log(scores);
    //console.log(valid_path);
  }

  if (
    map[location.y][location.x].path_score === -1 ||
    Math.min(...scores) < map[location.y][location.x].path_score
  ) {
    map[location.y][location.x].path_score = Math.min(...scores);
  }

  for (let i = 0; i < scores.length; i++) {
    if (scores[i] === Math.min(...scores)) {
      console.log(predecessors);
      predecessors += cool[i];
      console.log(predecessors);
    }
  }

  return { score: Math.min(...scores), valid_path, predecessors };
}

function dijkstra(
  map: mapItem[][],
  location: Location,
  direction: Location,
): { distance: number; best_path: boolean } {
  const possible_movements: Location[] = [
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];

  if (map[location.y][location.x].char === "E") {
    // console.log(map[location.y][location.x]);
    if (map[location.y][location.x].distance === 11036) {
      map[location.y][location.x].best_path = true;
      return {
        distance: map[location.y][location.x].distance,
        best_path: true,
      };
    }
    return { distance: map[location.y][location.x].distance, best_path: false };
  }

  const distances: number[] = [];

  // For every movement possible
  let best_path: boolean = false;
  for (const movement of possible_movements) {
    const future_location = {
      x: location.x + movement.x,
      y: location.y + movement.y,
    };

    if (
      0 <= future_location.y &&
      0 <= future_location.x &&
      future_location.y < map.length &&
      future_location.x < map[future_location.y].length &&
      (map[future_location.y][future_location.x].char === "." ||
        map[future_location.y][future_location.x].char === "E")
    ) {
      let new_distance = map[location.y][location.x].distance + 1;
      if (
        map[direction.y + future_location.y][direction.x + future_location.x]
          .char === "#"
      ) {
        new_distance += 1000;
      }

      if (new_distance < map[future_location.y][future_location.x].distance) {
        if (
          new_distance !== map[future_location.y][future_location.x].distance
        ) {
          //console.log("what")
          map[future_location.y][future_location.x].previous = [];
        }

        map[future_location.y][future_location.x].previous.push(location);

        map[future_location.y][future_location.x].distance = new_distance;
        map[future_location.y][future_location.x].previous.push(
          future_location,
        );

        const output = dijkstra(map, future_location, movement);
        distances.push(output.distance);

        if (output.best_path === true) {
          best_path = true;
          map[location.y][location.x].best_path = true;
        }
      }
    }
  }

  map[location.y][location.x].explored = true;

  return { distance: Math.min(...distances), best_path };
}
