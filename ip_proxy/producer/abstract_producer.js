/**
 * @auth 杨羽飞
 * @time 2018-10-20 17:39:03
 * @desc 抽象代理IP源
 */
const Promise   = require('bluebird');
const rp        = require('request-promise');

const SysConf   = require('../../config');
const tools     = require('../../common/tools');
const logger    = require('../../common/logger');
const redis     = require('../../db_manager/redis').redis;

class AbstractProducer {
	constructor() {
		if (!new.target) {
			throw new Error(`不允许实例化抽象类：AbstractProducer！`);
		}
		
		this.reqConf = {};
	}
	
	handleRes(res) {}

    /**
	 * 请求代理源并存入redis中
     * @returns {Promise<void>}
     */
	async produce() {
		let res;
		
		// 请求代理源
		for (let loop = 0 ; loop < SysConf.IP_PROXY.FETCH.COUNT; loop++ ) {
			try {
				res = await tools.timeoutRequest(this.reqConf);
				break;
			} catch (err) {
			}
		}
		
		if (res) {
			let list = this.handleRes(res);
			
			for (let ipObj of list) {
				ipObj.ip && ipObj.endTime && await redis.zadd(SysConf.IP_PROXY.KEYS.PROXY_POOL, ipObj.endTime, ipObj.ip);
			}
 		} else {
			logger.warn(`代理源无法访问：${this.reqConf.uri}`);
		}
	}
}

module.exports = AbstractProducer;