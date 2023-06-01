export default (v) => {
	if (v == null) return '?';
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	if (v === 0) return sizes[0];
	const i = Math.floor(Math.log(v) / Math.log(1024));
	return sizes[i];
};
