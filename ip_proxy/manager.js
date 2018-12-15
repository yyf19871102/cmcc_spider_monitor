/**
 * @auth 杨羽飞
 * @time 2018-10-22 08:03:27
 * @desc 监控网络状态
 */
const schedule  = require('node-schedule');
const Redlock   = require('redlock');
const moment    = require('moment');
const Promise   = require('bluebird');

const SysConf   = require('../config');
const tools     = require('../common/tools');
const redis     = require('../db_manager/redis').redis;
const dateFormat= require('../common/date_format');
const logger    = require('../common/logger');
const producer  = require('./producer');

const redlock   = new Redlock([redis]);

logger.info('开启网络监控守护进程...');

/**
 * 监控网络状态：连续ping5次百度，由一次成功代表网络状态通畅
 */
SysConf.IP_PROXY.CONNECT_TEST.ENABLE && schedule.scheduleJob(SysConf.IP_PROXY.CONNECT_TEST.CRON, async () => {
	let lockTime = 10 * 1000;
	let waitTime = 5 * 1000;
	
	while (true) {
		try {
		    // 加锁
			let lock = await redlock.lock(SysConf.IP_PROXY.KEYS.CONNECT_LOCK, lockTime);
			
			let netState = SysConf.IP_PROXY.NET_STATE.DISCONNECT;
			let reqConf = {
				uri     : SysConf.IP_PROXY.CONNECT_TEST.SITE,
				method  : 'GET',
				timeout : SysConf.IP_PROXY.CONNECT_TEST.TIMEOUT
			};
			
			// 连续测试n次
			for (let loop = 1; loop <= SysConf.IP_PROXY.CONNECT_TEST.COUNT; loop ++) {
				try {
					await tools.timeoutRequest(reqConf);
					netState = SysConf.IP_PROXY.NET_STATE.GOOD;
					break;
				} catch (e) {
					logger.error(e);
				}
			}
			
			await redis.set(SysConf.IP_PROXY.KEYS.CONNECT_STATE, netState);
			await redis.set(SysConf.IP_PROXY.KEYS.CONNECT_TEST_TIME, dateFormat.getFullDateTime());
			
			await lock.unlock();
			break;
		} catch (e) {
			logger.error(e);
			if (e.name === 'LockError') {
				await Promise.delay(waitTime);
				
				let lastTestTime = await redis.get(SysConf.IP_PROXY.KEYS.CONNECT_TEST_TIME);
				
				if (lastTestTime && moment().diff(moment(lastTestTime)) < SysConf.IP_PROXY.CONNECT_TEST.INTERVAL) return;
			} else {
				logger.error(e);
			}
		}
	}
});

/**
 * 更新代理IP池
 */
schedule.scheduleJob(SysConf.IP_PROXY.FETCH.CRON, async () => {
	await producer.produce();
	await redis.zremrangebyscore(SysConf.IP_PROXY.KEYS.PROXY_POOL, 0, new Date().getTime());
});