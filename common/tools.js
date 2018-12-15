/**
 * @author yangyufei
 * @date 2018-12-14 17:56:13
 * @desc
 */
const fs            = require('fs');
const path          = require('path');
const _             = require('lodash');
const Promise       = require('bluebird');
const rp            = require('request-promise');

const logger        = require('./logger');
const config        = require('../config');
const {ERROR_OBJ}   = config;

/**
 * 抛出指定异常
 * @param errObj
 * @param errMsg
 * @param errData
 */
exports.threw = (errObj = ERROR_OBJ.DEFAULT, errMsg = '', errData = {}) => {
	let code = errObj.code && !isNaN(errObj.code) ? errObj.code : ERROR_OBJ.DEFAULT.code;
	let msg = errObj.msg || ERROR_OBJ.DEFAULT.msg;

	let err = new Error(msg);
	err.code = code;
	err.data = errData;

	throw err;
};

/**
 * 带超时的request
 * @param reqConf
 * @returns {Promise<*>}
 */
exports.timeoutRequest = async reqConf => {
	let timeout = reqConf && reqConf.hasOwnProperty('timeout') && !isNaN(reqConf.timeout) && reqConf.timeout > 0 ? reqConf.timeout : null;

	if (timeout) {
		return await new Promise(async (resolve, reject) => {
			try {
				let data = await rp(reqConf);
				resolve(data);
			} catch (err) {
				reject(err);
			}
		}).timeout(timeout);
	} else {
		return await rp(reqConf);
	}
};