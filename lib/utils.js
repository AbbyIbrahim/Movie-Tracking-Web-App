const { PER_PAGE } = require("../constants");

const getPageSkip = (page) => {
	const zeroBasePage = parseInt(page) - 1 || 0;
	return zeroBasePage * PER_PAGE;
};

const getPageHref = (type, url, page) => {
	if (!page && type === "prev") return;
	if (!page && type === "next")
		return `${url}${url.includes("?") ? "&" : "?"}page=2`;

	const pageQuery = `page=${page}`;
	const pageNum = type === "next" ? parseInt(page) + 1 : parseInt(page) - 1;

	if (!pageNum) return;

	return url.replace(pageQuery, `page=${pageNum}`);
};

module.exports = { getPageSkip, getPageHref };
