import * as net from "net";

/**
 * @method getFreePort
 * @param host
 * @returns {Promise<number>}
 */
async function getFreePort(host : string = "localhost"): Promise<number> {
	return new Promise((resolve, reject) => {
		const server = net.createServer();

		server.on("listening", () => {
			const addr = server.address();
			if (!addr) {
				return reject(new Error("Unable to find a free port - got null address listening on localhost"));
			}
			if (typeof addr === "string") {
				return reject(new Error(`Unable to find a free port - got string address '${addr}' listening on localhost`));
			}
			resolve(addr.port);
			server.close();
		});

		server.on("error", (e: Error & {code?: string}) => {
			let err;
			if (e.code === "EADDRINUSE" || e.code === "EACCES") {
				err = new Error("Unable to find a free port");
			} else {
				err = e;
			}

			reject(err);
		});

		// By providing 0 we let the operative system find an arbitrary port
		server.listen(0, host);
	});
};

export = getFreePort;
