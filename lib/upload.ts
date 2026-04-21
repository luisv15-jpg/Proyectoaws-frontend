import AWS from 'aws-sdk';

// Configurar AWS
AWS.config.update({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

export async function uploadToS3(file: File, folder: string = 'products'): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
      const key = `${folder}/${fileName}`;
      
      const params = {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: key,
        Body: Buffer.from(buffer),
        ContentType: file.type,
        ACL: 'public-read',
      };
      
      try {
        const result = await s3.upload(params).promise();
        resolve(result.Location);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}