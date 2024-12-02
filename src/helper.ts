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
