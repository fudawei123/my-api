const express = require("express");
const router = express.Router();
const {BadRequest} = require("http-errors");
const {v4: uuidv4} = require("uuid");
const moment = require("moment");
const multer = require("multer");
const path = require('path');
const multiparty = require('multiparty');
const fse = require('fs-extra');
const {success, failure} = require("../../utils/responses");
const {config, client, singleFileUpload} = require("../../utils/aliyun");
const getImageMetaData = require("../../utils/getImageMetadata");

/**
 * 阿里云 OSS 客户端上传
 * POST /uploads/aliyun
 */
router.post("/aliyun", function (req, res) {
    try {
        singleFileUpload(req, res, async function (error) {
            if (error) {
                return failure(req, res, error);
            }

            if (!req.file) {
                return failure(req, res, new BadRequest("请选择要上传的文件。"));
            }

            const { id, ...file } = req.file
            const metadata = await getImageMetaData(file.url);
            success(res, "上传成功。", {
                ...file,
                userId: req.userId,
                fullpath: file.path + "/" + file.filename,
                metadata
            });
        });
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 获取直传阿里云 OSS 授权信息
 * GET /uploads/aliyun_direct
 */
router.get("/aliyun_direct", async function (req, res, next) {
    // 有效期
    const date = moment().add(1, "days");

    // 自定义上传目录及文件名
    const key = `uploads/${uuidv4()}`;

    // 上传安全策略
    const policy = {
        expiration: date.toISOString(), // 限制有效期
        conditions: [
            ["content-length-range", 0, 5 * 1024 * 1024], // 限制上传文件的大小为：5MB
            {bucket: client.options.bucket}, // 限制上传的 bucket
            ["eq", "$key", key], // 限制上传的文件名
            [
                "in",
                "$content-type",
                ["image/jpeg", "image/png", "image/gif", "image/webp"],
            ], // 限制文件类型
        ],
    };

    // 签名
    const formData = await client.calculatePostSignature(policy);

    // bucket 域名（阿里云上传地址）
    const host = `https://${config.bucket}.${
        (await client.getBucketLocation()).location
    }.aliyuncs.com`.toString();

    // 返回参数
    const params = {
        expire: date.format("YYYY-MM-DD HH:mm:ss"),
        policy: formData.policy,
        signature: formData.Signature,
        accessid: formData.OSSAccessKeyId,
        host,
        key,
        url: host + "/" + key,
    };

    success(res, "获取阿里云 OSS 授权信息成功。", params);
});

/**
 * 上传图片到本地服务器
 * GET /uploads/local
 */
// 设置存储配置
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // 确保这个文件夹已经存在
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + file.originalname);
    },
});
const upload = multer({storage: storage});
router.post("/local", upload.single("file"), (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            throw new BadRequest("请选择要上传的文件。");
        }
        success(res, "上传成功。");
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 分片上传
 * POST /uploads/chunk
 */
// 存放切片的地方
const UPLOAD_DIR = path.resolve(__dirname, '../', 'uploads')
router.post("/chunk", function (req, res) {
    const form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
        // console.log(fields);  // 切片的描述
        // console.log(files);  // 切片的二进制资源被处理成对象
        const [file] = files.file
        const [fileName] = fields.fileName
        const [chunkName] = fields.chunkName
        // 保存切片
        const chunkDir = path.resolve(UPLOAD_DIR, `${fileName}-chunks`)
        if (!fse.existsSync(chunkDir)) { // 该路径是否有效
            fse.mkdirSync(chunkDir)
        }
        // 存入
        fse.moveSync(file.path, `${chunkDir}/${chunkName}`)

        success(res, "切片上传成功");

    })
})

/**
 * 合并切片
 * POST /uploads/merge
 */
// 合并切片
function pipeStream(path, writeStream) {
    return new Promise((resolve, reject) => {
        const readStream = fse.createReadStream(path)
        readStream.on('end', () => {
            fse.removeSync(path)  // 被读取完的切片移除掉
            resolve()
        })
        readStream.pipe(writeStream)
    })
}

async function mergeFileChunk(filePath, fileName, size) {
    // 拿到所有切片所在文件夹的路径
    const chunkDir = path.resolve(UPLOAD_DIR, `${fileName}-chunks`)
    // 拿到所有切片
    let chunksList = fse.readdirSync(chunkDir)
    // console.log(chunksList);
    // 万一切片是乱序的
    chunksList.sort((a, b) => a.split('-')[1] - b.split('-')[1])

    const result = chunksList.map((chunkFileName, index) => {
        const chunkPath = path.resolve(chunkDir, chunkFileName)
        // ！！！！！合并
        return pipeStream(chunkPath, fse.createWriteStream(filePath, {
            start: index * size,
            end: (index + 1) * size
        }))

    })

    // console.log(result);
    await Promise.all(result)
    fse.removeSync(chunkDir) // 删除切片目录
    return true

}

router.post("/merge", async function (req, res) {
    const {fileName, size} = req.body
    const filePath = path.resolve(UPLOAD_DIR, fileName)  // 完整文件的路径
    // 合并切片
    const result = await mergeFileChunk(filePath, fileName, size)
    if (result) { // 切片合并完成
        success(res, "文件合并完成");
    }
})

module.exports = router;
