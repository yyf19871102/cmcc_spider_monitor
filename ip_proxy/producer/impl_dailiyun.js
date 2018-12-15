/**
 * @auth 杨羽飞
 * @time 2018-10-20 18:19:51
 * @desc
 */
const AbstractProducer  = require('./abstract_producer');
const SysConf          	= require('../../config');

class Dailiyun extends AbstractProducer {
	constructor() {
		super();
		
		this.reqConf = {
			uri : 'http://yuncaispider.v4.dailiyun.com/query.txt',
			method  : 'GET',
			qs  : {
				key     : 'NP3EBB116F',
				count   : SysConf.IP_PROXY.FETCH.COUNT,
				detail  : true
			},
			timeout : SysConf.IP_PROXY.FETCH.TIMEOUT
		};
		
		this.user = 'yuncaispider'; // 云代理用户名
		this.passwd = 'zyzxyuncai'; // 云代理密码
	}
	
	handleRes(res) {
		let ipList = [];
		
		res.split('\n').forEach(line => {
			let tmp = line.split(',');
			
			// 有endtime的入库
			if (tmp.length > 4) {
				let ip = `http://${this.user}:${this.passwd}@${tmp[0]}`;
				let endTime = parseInt(tmp[4]) * 1000;
				
				ipList.push({ip, endTime});
			}
		});
		
		return ipList;
	}
}

module.exports = new Dailiyun();