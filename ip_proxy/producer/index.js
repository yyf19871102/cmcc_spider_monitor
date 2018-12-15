/**
 * @auth 杨羽飞
 * @time 2018-10-20 18:35:29
 * @desc
 */
const fs        = require('fs');
const path      = require('path');
const Promise   = require('bluebird');

const impls = [];

// 加载所有代理模块
fs.readdirSync(__dirname).forEach(fileName => {
	if (fileName.startsWith('impl_') && fileName.endsWith('.js')) {
		impls.push(require(path.join(__dirname, fileName)));
	}
});

exports.produce = async () => {
	let resultList = [];
	
	let ps = [];
	for (let impl of impls) ps.push(impl.produce());
	
	await Promise.all(ps);
};