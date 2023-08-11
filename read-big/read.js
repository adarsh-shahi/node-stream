const fs = require("fs/promises");

(async () => {
	console.time("sike");
	const fileHandleRead = await fs.open(
		__dirname + "/../write-many/test.txt",
		"r"
	);
	const fileHandleWrite = await fs.open(__dirname + "/dest.txt", "w");

	const readStream = fileHandleRead.createReadStream();
	const writeStream = fileHandleWrite.createWriteStream();
	console.log(readStream.readableHighWaterMark);
	console.log(writeStream.writableHighWaterMark);

	let previousStart = "";
	let drainCount = 0;
	let drainCount2 = 0;
	let count = 0;

	readStream.on("data", (chunk) => {
		const data = chunk.toString("utf-8");
		const numbers = data.split(" ");

		numbers[0] = previousStart + numbers[0];
		if (numbers[numbers.length - 1] === "") {
			previousStart = "";
			numbers.pop();
		} else if (
			Number(numbers[numbers.length - 1]) - 1 !==
			Number(numbers[numbers.length - 2])
		) {
			previousStart = numbers[numbers.length - 1];
			numbers.pop();
		} else previousStart = "";
		if (numbers[0] === "") numbers.shift();

		numbers.forEach((number) => {
			if (number % 2 === 0) {
				count++;
				if (!writeStream.write(`${number}\n`)) {
					// console.log(
					// 	"write water mark value at full: " + writeStream.writableLength
					// );
					drainCount2++;
					readStream.pause();
				}
			}
		});
	});

	writeStream.on("drain", () => {
		drainCount++;
		readStream.resume();
	});

	readStream.on("end", () => {
		fileHandleRead.close();
		fileHandleWrite.close();
		console.log(drainCount);
		console.log(drainCount2);
		console.timeEnd("sike");
		console.log("Done reading data");
		console.log(count);
	});
})();
