module.exports = {
	name: "chronomage",
	log_date_format: "YYYY-MM-DD HH:mm Z",
	time: true,
	apps: [
		{
			name: "chronomage",
			script: "dist/src/index.js",
		},
	],
};
