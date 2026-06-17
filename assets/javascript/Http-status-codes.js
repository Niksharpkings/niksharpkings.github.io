const httpStatusCodes = {
	informational: [
		{ code: 100, name: "Continue", description: "Request headers received, continue request body." },
		{ code: 101, name: "Switching Protocols", description: "Server is switching protocols as requested." },
		{ code: 102, name: "Processing", description: "Server has received and is processing the request." },
		{ code: 103, name: "Early Hints", description: "Hints sent before final response, often for preload links." }
	],
	success: [
		{ code: 200, name: "OK", description: "Request succeeded." },
		{ code: 201, name: "Created", description: "Request succeeded and created a new resource." },
		{ code: 202, name: "Accepted", description: "Request accepted for processing, not completed yet." },
		{ code: 203, name: "Non-Authoritative Information", description: "Returned metadata is from a transformed source." },
		{ code: 204, name: "No Content", description: "Request succeeded with no response body." },
		{ code: 205, name: "Reset Content", description: "Client should reset the view that sent the request." },
		{ code: 206, name: "Partial Content", description: "Partial response to a range request." },
		{ code: 207, name: "Multi-Status", description: "Multiple status values for different operations." },
		{ code: 208, name: "Already Reported", description: "Members already enumerated in a previous part of the response." },
		{ code: 226, name: "IM Used", description: "Server fulfilled request using instance manipulations." }
	],
	redirection: [
		{ code: 300, name: "Multiple Choices", description: "Multiple response options are available." },
		{ code: 301, name: "Moved Permanently", description: "Resource permanently moved to a new URL." },
		{ code: 302, name: "Found", description: "Resource temporarily found at a different URL." },
		{ code: 303, name: "See Other", description: "Response should be retrieved with GET at another URI." },
		{ code: 304, name: "Not Modified", description: "Cached resource is still valid." },
		{ code: 305, name: "Use Proxy", description: "Requested resource must be accessed through a proxy (deprecated)." },
		{ code: 306, name: "Unused", description: "Reserved status code, no longer used." },
		{ code: 307, name: "Temporary Redirect", description: "Temporary redirect; repeat request with same method." },
		{ code: 308, name: "Permanent Redirect", description: "Permanent redirect; repeat request with same method." }
	],
	clientError: [
		{ code: 400, name: "Bad Request", description: "Server cannot process the request due to client error." },
		{ code: 401, name: "Unauthorized", description: "Authentication is required." },
		{ code: 402, name: "Payment Required", description: "Reserved for future use." },
		{ code: 403, name: "Forbidden", description: "Server understood request but refuses to authorize it." },
		{ code: 404, name: "Not Found", description: "Requested resource was not found." },
		{ code: 405, name: "Method Not Allowed", description: "Method is not allowed for this resource." },
		{ code: 406, name: "Not Acceptable", description: "No acceptable representation found." },
		{ code: 407, name: "Proxy Authentication Required", description: "Proxy authentication is required." },
		{ code: 408, name: "Request Timeout", description: "Server timed out waiting for request." },
		{ code: 409, name: "Conflict", description: "Request conflicts with current resource state." },
		{ code: 410, name: "Gone", description: "Resource is no longer available and will not return." },
		{ code: 411, name: "Length Required", description: "Content-Length header is required." },
		{ code: 412, name: "Precondition Failed", description: "Preconditions in request headers were not met." },
		{ code: 413, name: "Content Too Large", description: "Request content is too large for server limits." },
		{ code: 414, name: "URI Too Long", description: "Request URI is longer than server can process." },
		{ code: 415, name: "Unsupported Media Type", description: "Media type is unsupported for this resource." },
		{ code: 416, name: "Range Not Satisfiable", description: "Requested range cannot be fulfilled." },
		{ code: 417, name: "Expectation Failed", description: "Expectation in request headers cannot be met." },
		{ code: 418, name: "I'm a Teapot", description: "Server refuses to brew coffee because it is a teapot." },
		{ code: 421, name: "Misdirected Request", description: "Request directed to a server unable to produce response." },
		{ code: 422, name: "Unprocessable Content", description: "Request syntax is correct but semantically invalid." },
		{ code: 423, name: "Locked", description: "Resource is locked." },
		{ code: 424, name: "Failed Dependency", description: "Request failed due to dependency failure." },
		{ code: 425, name: "Too Early", description: "Server is unwilling to risk processing replayed request." },
		{ code: 426, name: "Upgrade Required", description: "Client should switch to a different protocol." },
		{ code: 428, name: "Precondition Required", description: "Origin server requires a conditional request." },
		{ code: 429, name: "Too Many Requests", description: "Client sent too many requests in a given time." },
		{ code: 431, name: "Request Header Fields Too Large", description: "Request header fields are too large." },
		{ code: 451, name: "Unavailable For Legal Reasons", description: "Resource unavailable due to legal demand." }
	],
	serverError: [
		{ code: 500, name: "Internal Server Error", description: "Unexpected server-side error occurred." },
		{ code: 501, name: "Not Implemented", description: "Server does not support requested functionality." },
		{ code: 502, name: "Bad Gateway", description: "Invalid response received from upstream server." },
		{ code: 503, name: "Service Unavailable", description: "Server is temporarily unable to handle request." },
		{ code: 504, name: "Gateway Timeout", description: "Upstream server did not respond in time." },
		{ code: 505, name: "HTTP Version Not Supported", description: "HTTP version in request is not supported." },
		{ code: 506, name: "Variant Also Negotiates", description: "Server has internal content negotiation error." },
		{ code: 507, name: "Insufficient Storage", description: "Server cannot store the representation needed." },
		{ code: 508, name: "Loop Detected", description: "Server detected an infinite loop while processing." },
		{ code: 510, name: "Not Extended", description: "Further extensions to request are required." },
		{ code: 511, name: "Network Authentication Required", description: "Client must authenticate for network access." }
	]
};

const allHttpStatusCodes = [
	...httpStatusCodes.informational,
	...httpStatusCodes.success,
	...httpStatusCodes.redirection,
	...httpStatusCodes.clientError,
	...httpStatusCodes.serverError
];

const httpStatusCodeMap = allHttpStatusCodes.reduce((accumulator, item) => {
	accumulator[item.code] = item;
	return accumulator;
}, {});

function getHttpStatus(code) {
	return httpStatusCodeMap[Number(code)] || null;
}

function getHttpStatusName(code) {
	const status = getHttpStatus(code);
	return status ? status.name : "Unknown Status";
}

function getHttpStatusDescription(code) {
	const status = getHttpStatus(code);
	return status ? status.description : "No description available for this status code.";
}

globalThis.httpStatusCodes = httpStatusCodes;
globalThis.allHttpStatusCodes = allHttpStatusCodes;
globalThis.getHttpStatus = getHttpStatus;
globalThis.getHttpStatusName = getHttpStatusName;
globalThis.getHttpStatusDescription = getHttpStatusDescription;

function renderHttpStatusHelper() {
	const result = document.getElementById('http-status-helper-result');
	const error = document.getElementById('http-status-helper-error');
	const list = document.getElementById('http-status-helper-list');

	if (!result || !error || !list) {
		return;
	}

	const getPassLabel = (code) => (Number(code) < 400 ? 'Pass' : "Don't pass");
	const getPassClass = (code) => (Number(code) < 400 ? 'http-status-pass' : 'http-status-dont-pass');

	try {
		if (typeof globalThis.getHttpStatus !== 'function' || !Array.isArray(globalThis.allHttpStatusCodes)) {
			throw new TypeError('HTTP status helpers are not available right now.');
		}

		const status = globalThis.getHttpStatus(404);
		result.textContent = status
			? `${status.code} ${status.name} - ${status.description}`
			: 'No HTTP status data was returned.';
		error.textContent = '';

		const sortedStatuses = [...globalThis.allHttpStatusCodes].sort((a, b) => a.code - b.code);
		const listItems = sortedStatuses
			.map((item) => `<li><span class="http-status-code">${item.code}</span> ${item.name}: <span class="${getPassClass(item.code)}">${getPassLabel(item.code)}</span></li>`)
			.join('');

		list.innerHTML = `
			<h3>All HTTP Status Codes</h3>
			<ul>${listItems}</ul>
		`;
	} catch (exception) {
		result.textContent = 'HTTP Status Helper';
		error.textContent = `Error: ${exception.message}`;
		list.innerHTML = '';
		console.error('HTTP Status Helper error:', exception);
	}
}

document.addEventListener('DOMContentLoaded', renderHttpStatusHelper);
