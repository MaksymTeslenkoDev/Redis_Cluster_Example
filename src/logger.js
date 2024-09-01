'use strict';

const fs = require('node:fs');
const path = require('node:path');

class StreamForLogger{
  #logFileStream;
  folderPath;
  date;

  constructor(folderPath) {
    this.folderPath = folderPath;
    this.date = new Date().toISOString().substring(0, 10);
    this.#createFileStream();
  }

  write(msg) {
    process.stdout.write(msg);
    const currentDate = new Date().toISOString().substring(0, 10);
    if (currentDate !== this.date) {
      this.date = currentDate;
      this.#createFileStream();
    }
    this.#logFileStream.write(msg);
  }

  #createFileStream() {
    if (this.#logFileStream) {
      this.#logFileStream.end();
    }
    const filePath = path.join(this.folderPath, `${this.date}.log`);
    this.#logFileStream = fs.createWriteStream(filePath, { flags: 'a' });
    return this.#logFileStream;
  }
}

module.exports = {
  StreamForLogger,
};
