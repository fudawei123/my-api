const express = require('express');
const router = express.Router();

const xlsx = require('node-xlsx');
const path = require('path');
let multer = require('multer');
let moment = require('moment');
let fs = require('fs');

router.get('/download1', (req, res) => {
    // 在 xlsx.parse方法的第二个参数中设置 cellDates: true
    // 可以将时间转为 ISO 8601
    let excelData = xlsx.parse(
        path.join(__dirname, '../public/excel/test.xlsx'),
        { cellDates: true }
    );

    // 组装数据

    res.setHeader('Content-Disposition', 'attachment; filename=test.xlsx');

    res.send(xlsx.build(excelData));
});

router.get('/download2', (req, res) => {
    // 假设我们mysql数据库查询得到了excelData这个数据结果
    let excelData = [
        // 第一个sheet内容
        {
            name: '男', // 给第一个sheet指名字
            data: [
                ['姓名', '密码', '出生日'], // 第一行
                ['付大伟', '123456', '1988-01-14'], // 第二行
            ],
        },
        // 第二个sheet内容
        {
            name: '女', // 给第二个sheet指名字
            data: [
                ['姓名', '密码', '出生日'], // 同上
                ['朱林风', '123456', '1989-04-17'],
            ],
        },
    ];

    // excel表格内容配置单元格宽度
    let optionArr = {
        // 指定sheet1相应宽度
        '!cols': [{ wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 50 }],
        // 指定sheet2相应宽度
        cols: [{ wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 50 }],
    };

    // 设置响应头
    // res.setHeader(
    //   'Content-Type',
    //   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    // );
    res.setHeader('Content-Disposition', 'attachment; filename=test.xlsx');

    // xlsx.build方法第二个参数接收的是单元格的配置参数
    res.send(xlsx.build(excelData, optionArr));
});

let Storage = multer.diskStorage({
    destination: (req, file, callback) => {
        // 指定当前这个文件存放的目录
        // 如果没有这个目录将会报错
        callback(null, 'public/upload');
    },
    filename: (req, file, callback) => {
        // 文件命名：当前时间戳 + "_" + 源文件名称
        callback(null, new Date().getTime() + '_' + file.originalname);
    },
});
// 我们这里支持多文件上传，上传名为 file。
let upload = multer({
    storage: Storage,
    limits: {
        fileSize: 1024 * 1024 * 10, //  限制文件大小
        files: 5, // 限制上传数量
    },
}).array('file', 99999);

router.post('/upload', function (req, res) {
    upload(req, res, (err) => {
        if (err) {
            res.send({ code: '1', msg: '导入失败', err: err });
        } else {
            // 获取这个文件的路径
            const fileUrl = req.files[0].path;
            // 解析 xlsx 文件,处理时间否者时间会发生变化
            var sheets = xlsx.parse(fileUrl, { cellDates: true });
            // 获取工作薄中的数据
            // 数据格式为：[ { name: 'mySheetName', data: [ [Array], [Array] ] } ]
            var arr = []; // 全部表中的数据
            sheets.forEach((sheet) => {
                for (var i = 1; i < sheet['data'].length; i++) {
                    //excel第一行是是表头，所以从1开始循环
                    var row = sheet['data'][i]; // 获取行数据
                    if (row && row.length > 0) {
                        // moment处理 ISO 8601格式的时间,
                        var dateTime = moment(row[2]);
                        arr.push({
                            name: row[0], // row[0]对应表格里A列
                            password: row[1], // row[1]对应表格里B列
                            // 使用偏移与时间时间保持一致
                            brith: dateTime
                                .utc('+8:00')
                                .format('YYYY-MM-DD HH:mm'),
                        });
                    }
                }
            });
            // 读取成功1分钟后将这个文件删除掉
            setTimeout(() => {
                fs.unlinkSync(fileUrl);
            }, 1000 * 60);
            res.send({
                code: '0',
                msg: '导入成功',
                data: arr,
                total: arr.length,
            });
        }
    });
});

module.exports = router;
