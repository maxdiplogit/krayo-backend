const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
const multer = require('multer');


const app = express();


const s3 = new AWS.S3({
    signatureVersion: 'v4'
});
const upload = multer();


const params = {
    Bucket: 'krayo-bucket-test',
    CORSConfiguration: {
        CORSRules: [
            {
                AllowedHeaders: [
                    '*'
                ],
                AllowedMethods: [
                    'GET'
                ],
                AllowedOrigins: [
                    '*'
                ],
                ExposeHeaders: [
                    'ETag'
                ]
            }
        ]
    }
};


s3.putBucketCors(params, (err, data) => {
    if (err) {
        console.log(err);
    } else {
        console.log(data);
    }
});


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res, next) => {
    res.send('Krayo Backend');
});


app.post('/upload', upload.single('file'), async (req, res, next) => {
    const { email } = req.body;
    const file = req.file;
    console.log(email);
    console.log(file);

    // Configuring S3 upload parameters
    const params = {
        Bucket: 'krayo-bucket-test',
        Key: `${ email }/${ file.originalname }`,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Error uploading file to S3' });
        } else {
            return res.status(201).json({ message: 'File Uploaded to S3 successfully!', data });
        }
    });
});

app.get('/getFiles/:email', async (req, res, next) => {
    const { email } = req.params;
    console.log(email);

    const params = {
        Bucket: 'krayo-bucket-test',
        Prefix: `${ email }/`
    };

    s3.listObjects(params, (err, data) => {
        if (err) {
            return res.status(500).json({ message: err });
        }
        console.log(data.Contents);
        const files = data.Contents.map((item) => {
            const file = {
                key: item.Key,
                lastModified: item.lastModified
            };
            
            const urlParams = {
                Bucket: 'krayo-bucket-test',
                Key: item.Key,
                Expires: 60
            }
            
            file.url = s3.getSignedUrl('getObject', urlParams);
            return file;
        });

        return res.status(200).json({ files });
    });
});


app.listen(4500, () => {
    console.log('Server started listening on port 4500 ...');
});