export default (v, digits = 0) => {
	if (v == null) return '?';
	if (v === 0) return '0';
	const isMinus = v < 0;
	if (isMinus) v = -v;
	const i = Math.floor(Math.log(v) / Math.log(1024));
	return (isMinus ? '-' : '') + (v / Math.pow(1024, i)).toFixed(digits).replace(/\.0+$/, '');
};
