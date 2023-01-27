// Packages
const AWS = require('aws-sdk');


// Configure S3 client
const s3 = new AWS.S3({
    signatureVersion: 'v4'
});


// Controllers
// ------------------------------------------------------------------------

module.exports.uploadFile = async (req, res, next) => {
    const { loggedInUser } = req.body;
    const file = req.file;

    const user = JSON.parse(loggedInUser)

    console.log('Loggedin User: ', user._id);
    console.log('File: ', file);

    if (!loggedInUser) {
        return res.status(401).json({ error: 'LoggedIn user is missing' });
    }

    if (!file) {
        return res.status(401).json({ error: 'No File selected' });
    }


    s3.headObject({ Bucket: 'krayo-bucket-test', Key: `${ user._id }/${ file.originalname }` }, async (err, data) => {
        console.log(err);
        console.log(data);
        if (err && err.code === 'NotFound') {
            const params = {
                Bucket: 'krayo-bucket-test',
                Key: `${ user._id }/${ file.originalname }`,
                Body: file.buffer,
                ContentType: file.mimetype
            };

            const data = await s3.listObjectsV2({ Bucket: 'krayo-bucket-test', Prefix: `${ user._id }/` }).promise();
            
            const files = data.Contents;

            // This is a linear approach. A more optimized approach would be to use a hashing algorithm such that finding duplicated can be done in O(1) as compared to linear O(N).
            // For collision purposes, we could use LL based hashing algorithms. Its the most easiest algorithm to implement in case of collisions
            for (let f of files) {
                const fData = await s3.getObject({ Bucket: 'krayo-bucket-test', Key: `${ f.Key }` }).promise();

                const s3FileBuffer = fData.Body;
                const fileBuffer = file.buffer;
                
                if (Buffer.compare(s3FileBuffer, fileBuffer) === 0) {
                    console.log('A file with the same contents already exists!');
                    return res.status(409).json({ error: 'A file with the same contents already exists!' });
                }
            }
            
            // The file neither the with same name, nor with the same contents exist, and hence can be uploaded onto the bucket
            s3.upload(params, (err, data) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: 'Error uploading file to S3' });
                } else {
                    return res.status(201).json({ message: 'File Uploaded to S3 successfully!', data });
                }
            });
        } else {
            // File with 'filename' already exists in the bucket
            console.log(`File with filename ${ file.originalname } already exists in the bucket`);
            const params1 = {
                Bucket: 'krayo-bucket-test',
                Key: `${ user._id }/${ file.originalname }`
            };
            s3.getObject(params1, (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    // Check if the contacts of both the files are the same
                    const s3FileBuffer = data.Body;
                    const fileBuffer = file.buffer;
                    if (Buffer.compare(s3FileBuffer, fileBuffer) === 0) {
                        console.log('Contents of both the files match');
                        return res.status(409).json({ error: 'Contents of both the files match' });
                    }

                    // Create a new file with a random 5 digit number in front of it
                    const randomNumber = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
                    const fileName = file.originalname.split('.')[0];
                    const mimetype = file.originalname.split('.')[1];
                    const params = {
                        Bucket: 'krayo-bucket-test',
                        Key: `${ user._id }/${ fileName }_${ randomNumber }.${ mimetype }`,
                        Body: file.buffer,
                        ContentType: file.mimetype
                    };

                    s3.upload(params, (err, data) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({ error: 'Could not upload file to S3 bucket!' });
                        } else {
                            return res.status(201).json({ message: 'Uploaded file successfully!' });
                        }
                    });
                }
            });
        }
    });
};


module.exports.getFiles = async (req, res, next) => {
    const { userID } = req.params;
    console.log('UserID: ', userID);

    const params = {
        Bucket: 'krayo-bucket-test',
        Prefix: `${ userID }/`
    };

    s3.listObjects(params, (err, data) => {
        if (err) {
            return res.status(500).json({ message: err });
        }
        console.log(data.Contents);
        const files = data.Contents.map((item) => {
            const file = {
                key: item.Key,
                lastModified: item.LastModified
            };

            return file;
        });

        return res.status(200).json({ files });
    });
};


module.exports.download = async (req, res, next) => {
    const { fileKey } = req.query;
    console.log('FileKEY: ', fileKey);
    
    const params = {
        Bucket: 'krayo-bucket-test',
        Key: `${ fileKey }`
    };

    const file = await s3.getObject(params);

    file.createReadStream().pipe(res);
};

// ------------------------------------------------------------------------