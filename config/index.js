/**
 * @author yangyufei
 * @date 2018-12-13 19:54:41
 * @desc
 */
const _     = require('lodash');
const fs    = require('fs');
const path  = require('path');

const ENV   = process.env.NODE_ENV || 'development';

let config = {
	// 错误相关信息
	ERROR_OBJ   : {
		SUCCESS     : {code: 0, msg: '操作成功！'},

		DEFAULT     : {code: 100, msg: '系统错误！'},
		TIMEOUT     : {code: 101, msg: '请求访问超时！'},
		RETRYOUT    : {code: 102, msg: '超过最大重试次数！'},
		PARSEJSON   : {code: 103, msg: '异常非json数据！'},
		BAD_REQUEST : {code: 104, msg: 'uri请求错误！'},
		BAD_CONFIG  : {code: 105, msg: '配置错误！'},
		CHECK_RULE  : {code: 106, msg: '网站接口/页面规则校验不通过！'},
		BAD_OUTPUT  : {code: 107, msg: '输出数据校验失败！'}
	},

	// 网络状态
	NET_STATE       : {
		DISCONNECT  : -1, // 网络不通
		GOOD        : 1, // 通畅
	},

    // IP代理模块配置
	IP_PROXY        : {
        FETCH   : {
            COUNT   : 200, // 一次初始化多少个代理
            TIMEOUT : 5000, // 超时时长
            CRON    : '*/5 * * * * *', // 访问代理源频率
            RETRY   : 5, // 最大重试次数
        },

        CONNECT_TEST: {
            ENABLE  : true, // 是否开启网络连接性测试
            SITE    : 'http://www.baidu.com', //测试地址
            TIMEOUT : 1000, // 访问超时
            COUNT   : 5, // 测试次数
            CRON    : '0 * * * * *', // 每分钟测试一次
            INTERVAL: 1000 * 60, // 一分钟
        },

        NET_STATE   : {
            DISCONNECT  : -1, // 网络不通
            GOOD        : 1, // 通畅
        },

        // redis中的相关键名
        KEYS    : {
            CONNECT_STATE       : 'network:connect:state', // 当前网络基本状态
            CONNECT_TEST_TIME   : 'network:connect:lastTestTime', // 上次检查网络状态时间
            CONNECT_LOCK        : 'network:connect:lock', // 网络状态检查锁

            PROXY_POOL          : 'network:proxy:pool', // 代理池
            PROXY_BLACK_LIST    : 'network:proxy:blackList', // 劣质代理
            PROXY_WHITE_LIST    : 'network:proxy:whiteList', // 优质代理
        },
    }
};

// 读取config目录下所有配置文件，并合并到system当中
fs.readdirSync(__dirname).forEach(fileName => {
	let stats = fs.statSync(path.join(__dirname, fileName));

	if (!stats.isDirectory() && fileName.startsWith(`${ENV}_`) && fileName.endsWith('.js')) {
		let key = fileName.replace(`${ENV}_`, '').replace('.js', '').toUpperCase();
		let value = require(path.join(__dirname, fileName));
		config.hasOwnProperty(key) ? _.merge(config[key], value) : (config[key] = value);
	}
});

module.exports = config;