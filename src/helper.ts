// SPDX-License-Identifier: GPL-3.0-or-later
import { TextLineStream } from "@std/streams";

export async function OpenFileLineByLine(filename: string) {
  const file = await Deno.open(filename, { read: true });

  const lines = file
    .readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());
  return lines;
}

export async function OpenFileLineByLineAsArray(filename: string) {
  const lines_stream = await OpenFileLineByLine(filename);
  const lines = [];
  for await (const line of lines_stream) {
    lines.push(line);
  }

  return lines;
}

export function isNumber(char: string) {
  return /^\d+$/.test(char);
}
