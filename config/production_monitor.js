/**
 * @author yangyufei
 * @date 2018-12-14 17:57:52
 * @desc
 */
module.exports = {
    ENABLE  : true, // 是否启动监控程序

    CRON    : '0 0 7 * * *', // 监控模块发送邮件时间配置
    APP_DIR : '/home/wltx/app/', // 所有需要监控的项目的根路径

    MAIL    : {
        // 邮箱代理
        transporter : {
            host    : 'smtp.163.com', // 代理邮箱域名
            port:    465, // 端口号
            secure  :true,
            auth    : {
                user: 'yyf19871102@163.com', // 邮箱号
                pass: '0601114034' // 密码
            }
        },

        from        : 'yyf19871102@163.com', // 发送人
        to          : 'yyf19871102@163.com', // 接受人，多个收件人之间使用英文逗号分隔
    }
};