// System specs - 12 logical cores
// 8 GB RAM

// async await
// CPU - 9.7% of 12 cores
// Memory - 45MB
// Time - 13 seconds
// const fs = require("fs/promises");
// console.log("started");
// (async () => {
// 	console.time("writeMany");
// 	const fileHandler = await fs.open("./test.txt", "w");

// 	for (let i = 0; i < 1000000; i++) {
// 		await fileHandler.write(i + 1 + " ");
// 	}
// 	console.timeEnd("writeMany");
// })();
// console.log("stoped");

// Memory - 20 MB
// Time - 1.462s
// callback
// const fs = require("fs");
// console.log("started");
// (() => {
// 	console.time("writeMany");
// 	fs.open("./test.txt", "w", (error, fd) => {
// 		for (let i = 0; i < 1000000; i++) {
// 			fs.writeSync(fd, `${i}`);
// 		}
// 		console.timeEnd("writeMany");
// 	});
// })();
// console.log("stoped");

// Memory - 200 MB
// Time - 400ms
// callback
// const fs = require("fs/promises");
// console.log("started");
// (async () => {
// 	console.time("writeMany");
// 	const fileHandler = await fs.open("./test.txt", "w");
// 	const readStream = fileHandler.createWriteStream();
// 	for (let i = 0; i < 1000000; i++) {
// 		readStream.write(`${i + 1} `);
// 	}
// 	console.timeEnd("writeMany");
// })();
// console.log("stoped");

// Memory - 44 MB
// Time - 560ms
// MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 drain listeners added to [WriteStream].
const fs = require("fs/promises");
let count = 0;
const NUMBERS = 1000000;

console.log("started");
(async () => {
	console.time("writeMany");
	const fileHandler = await fs.open(__dirname + "/test.txt", "w");
	const writeStream = fileHandler.createWriteStream();
	console.log(writeStream.writableHighWaterMark);
	let count = 0;
	let i = 0;
	const writeMany = () => {
		for (; i < NUMBERS; i++) {
			count++;
			if (i === NUMBERS - 1) {
				return writeStream.end(`${i + 1} `);
			}
			if (!writeStream.write(`${i + 1} `)) {
				i++;
				return;
			}
		}
	};
	writeMany();
	writeStream.on("drain", () => {
		writeMany();
	});

	writeStream.on("finish", () => {
		console.timeEnd("writeMany");
		fileHandler.close();
		console.log(count);
	});
	writeStream.on("close", () => {
		console.log("at very end");
	});
})();
console.log("stopped");
