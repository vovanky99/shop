import axios from 'axios';
import { GenerateSignatureCloudinary } from '~/api/General/HandleData';

export default async function CldUploadImg(file, handleUploadProgress = () => {}) {
  let signature = null;
  const cloud_name = process.env.REACT_APP_CLOUDINARY_NAME;
  const cloud_key = process.env.REACT_APP_CLOUDINARY_KEY;
  const cloud_secret = process.env.REACT_APP_CLOUDINARY_SECRET;
  const cloud_preset = process.env.REACT_APP_CLOUDINARY_PRESET_IMAGES;

  const dataSignature = {
    // file: file,
    upload_preset: cloud_preset,
    // api_key: cloud_key,
  };

  await GenerateSignatureCloudinary(dataSignature)
    .then((result) => {
      if (result?.signature) {
        signature = result;
      }
    })
    .catch((e) => console.log(e));
  if (signature) {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', `${cloud_preset}`);
    data.append('api_key', `${cloud_key}`);
    data.append('api_secret', `${cloud_secret}`);
    data.append('signature', `${signature?.signature}`);
    data.append('timestamp', `${signature?.timestamp}`);
    try {
      axios.defaults.withCredentials = '';
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/upload?return_delete_token=true`,
        data,
        {
          onUploadProgress: handleUploadProgress,
        },
      );
      return res.data;
    } catch (e) {
      console.log(e);
    }
  }
}
