# CMCC-NODEJS爬虫监控模块
提供ip代理集中管理、nodejs爬虫生成任务监控功能。使用nodejs编写。
### 1.ip代理模块
#### 启动
    > cd ./ip_proxy
    > pm2 start manager.js --name ip-proxy
#### 添加代理源
所有代理源都继承了`./ip_proxy/producer/abstract_producer.js`。继承代理源应该以`impl_`开头并放置在`./ip_proxy/producer`目录下；具体实现可以参考`impl_dailiyun.js`文件。
### 2.爬虫监控
当前爬虫监控模块只有一个功能：根据配置的定时任务检查生成out文件并将结果发送邮件进行通知报告。

具体流程如下：

* 第一步：扫描爬虫应用根目录（具体配置见`./config/indexjs`）下的所有爬虫应用；
* 第二步：加载该爬虫的配置文件`config`；如果该配置文件不存在或者该配置文件中不包含`MONITOR`选项或是其`MONITOR`选项为false则表示不需要监控该应用；
* 第三步：获取该爬虫的out输出根目录；
* 第四步：扫描该根目录下所有头天生成的out和done文件，并统计数据条数；
* 第五步：将所有结果汇总并生成结果报告并发送邮件；

#### 启动
    > pm2 start monitor --name spider-monitor
### 3.下个版本规划
* 加入接口和页面规则的校验模块；
* 加入运维工具，包括以下功能
    + 可以查看指定爬虫指定时间段内抓取数据量；
    + 清理log文件
    + 清理out文件