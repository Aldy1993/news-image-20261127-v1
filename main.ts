// The World — Friday 27 November 2026.
//
// Entry program for the make.fun news-image-20261127 bounty. It copies the
// front-page image (entry.png, drawn for this day's news) into the output
// directory, after verifying the PNG chunk structure byte by byte.
//
// Run:  MAKEFUN_OUTPUT_DIR=out node main.ts
// The program is deterministic: it writes the same bytes on every run.

const fs = require("node:fs");
const path = require("node:path");

const SCRIPT_DIR = typeof __dirname !== "undefined" ? __dirname : path.dirname(process.argv[1]);
const SRC = path.join(SCRIPT_DIR, "entry.png");
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const OUT = path.join(OUT_DIR, "entry.png");

function crc32(buf) {
  // Bit-by-bit CRC-32 (IEEE), no lookup table.
  let crc = 0xffffffff;
  for (const byte of buf) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function readU32(buf, off) {
  return buf.readUInt32BE(off);
}

function inspectPng(data) {
  // Returns { chunks, width, height } or throws on any structural problem.
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (data.length < 8 || !data.subarray(0, 8).equals(sig)) {
    throw new Error("not a PNG file");
  }
  let off = 8;
  const chunks = [];
  let width = 0;
  let height = 0;
  let seenIend = false;
  while (off + 8 <= data.length) {
    const len = readU32(data, off);
    const type = data.toString("latin1", off + 4, off + 8);
    const body = data.subarray(off + 8, off + 8 + len);
    if (body.length !== len || off + 12 + len > data.length) {
      throw new Error("truncated chunk " + type);
    }
    const stored = readU32(data, off + 8 + len);
    const computed = crc32(Buffer.concat([Buffer.from(type, "latin1"), body]));
    if (stored !== computed) {
      throw new Error("bad CRC in chunk " + type);
    }
    chunks.push(type);
    if (type === "IHDR") {
      width = readU32(body, 0);
      height = readU32(body, 4);
    }
    if (type === "IEND") {
      seenIend = true;
      off += 12 + len;
      break;
    }
    off += 12 + len;
  }
  if (!seenIend) {
    throw new Error("missing IEND chunk");
  }
  if (off !== data.length) {
    throw new Error("trailing bytes after IEND");
  }
  return { chunks, width, height };
}

function main() {
  const data = fs.readFileSync(SRC);
  if (data.length > 1048576) {
    throw new Error("entry.png is over the 1 MiB cap: " + data.length + " bytes");
  }
  const info = inspectPng(data);
  if (info.width !== 1024 || info.height !== 1024) {
    throw new Error("expected 1024x1024, got " + info.width + "x" + info.height);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT, data);
  const back = fs.readFileSync(OUT);
  if (!back.equals(data)) {
    throw new Error("read-back mismatch");
  }
  console.log(
    "entry.png: %d bytes, %d chunks (%s), %dx%d, copied to %s",
    data.length,
    info.chunks.length,
    info.chunks.join(","),
    info.width,
    info.height,
    OUT,
  );
}

main();
