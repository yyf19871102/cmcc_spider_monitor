/**
 * @author yangyufei
 * @date 2018-12-14 07:58:34
 * @desc
 */
const fs        = require('fs');
const path      = require('path');
const _         = require('lodash');
const moment    = require('moment');
const schedule  = require('node-schedule');
const Promise   = require('bluebird');
const nodemailer= require('nodemailer');

const SysConf   = require('../config');
const dateFormat= require('../common/date_format');
const logger    = require('../common/logger');
const transporter= nodemailer.createTransport(SysConf.MONITOR.MAIL.transporter);

// 统计文件夹下out文件中有生成了多少条数据
const statisticsRecords = dirPath => {
    let count = 0;
    // 只统计头一天的数据
    let lastDay = moment().add(-1, 'days').format('YYYY-MM-DD');

    fs.readdirSync(dirPath).forEach(fileName => {
        let state = fs.statSync(path.join(dirPath, fileName));

        if (state.isFile()) {
            if (/out|done/.test(fileName)) {
                let content = fs.readFileSync(path.join(dirPath, fileName), 'utf-8');
                let recordsCount = content.split('\n').length - 1;

                count += recordsCount > 0 ? recordsCount : 0;
            }
        }

        if (state.isDirectory() && (!/\d{4}-\d{2}-\d{2}/g.test(fileName) || /\d{4}-\d{2}-\d{2}/g.test(fileName) && fileName === lastDay)) {
            count += statisticsRecords(path.join(dirPath, fileName));
        }
    });

    return count;
};

/**
 * 监控各个发布爬虫生成的out文件
 * @returns {Array}
 */
const inspectOut = () => {
    let appDir = SysConf.MONITOR.APP_DIR;

    let resultList = [];
    for (let dirName of fs.readdirSync(appDir)) {
        let projectPath = path.join(appDir, dirName);

        // 判断是不是文件夹
        if (fs.statSync(projectPath).isDirectory()) {
            // 加载app下的配置文件
            let configPath = path.join(projectPath, 'config', 'index.js');

            !fs.existsSync(configPath) && (configPath = path.join(projectPath, 'config.js'));

            if (!fs.existsSync(configPath)) continue;

            let appConfig;

            try {
                appConfig = require(configPath);
            } catch (err) {}

            // 判断该爬虫是否需要加入监控
            if (!appConfig || !appConfig.hasOwnProperty('MONITOR') || appConfig.MONITOR !== true) continue;

            let projectName = appConfig.NAME;
            let spiderConf = appConfig.SPIDER;
            let outDirPath = path.join(spiderConf.outDir, spiderConf.dirName || projectName); // out文件根目录

            let result = {name: appConfig.SITE_NAME, count: 0};

            if (fs.existsSync(outDirPath)) {
                result.count = statisticsRecords(outDirPath);
            }

            resultList.push(result);
        }
    }

    return resultList
};

/**
 * 生成统计结果并发送邮件
 * @returns {Promise<void>}
 */
const sendMail  = async () => {
    let lastDay = moment().add(-1, 'days').format('YYYY-MM-DD');

    let html = '';

    try {
        let resultList = inspectOut();

        html = `<p><b>${lastDay} 共部署${resultList.length}个爬虫，各个爬虫的生成结果如下：</b></p>`;

        _.sortBy(resultList, item => item.name).forEach((result, index) => {
            html += result.count > 0 ? `<p><b>${index + 1}. </b>${result.name} 抓取数据量：${result.count}</p>` : `<p><b style="color:red">${index + 1}. ${result.name} 抓取数据量：${result.count}</b></p>`;
        });
    } catch (err) {
        logger.warn(err);
        html = '<p>统计抓取结果发生错误，具体信息请查看日志文件！</p>'
    }

    // 邮件详情
    let mailOptions = {
        from    : SysConf.MONITOR.MAIL.from,
        to      : SysConf.MONITOR.MAIL.to,
        subject : `${dateFormat.getDate()} 爬虫抓取数据统计`,
        html,
    };

    await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, msg) => {
            err ? reject(err) : resolve(msg);
        })
    });

    logger.info('邮件发送成功！')
};

if (SysConf.MONITOR.ENABLE) {
    logger.info('爬虫监控模块已经启动');
    schedule.scheduleJob(SysConf.MONITOR.CRON, sendMail);
} else {
    logger.warn('爬虫监控模块未开启...');
    schedule.scheduleJob('0 0 7 * * *', () => {
        logger.warn('爬虫监控模块未开启...');
    })
}