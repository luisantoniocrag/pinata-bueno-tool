import { ReadStream } from 'fs';
import axios from 'axios';
const FormData = require('form-data');

const pinataApiKey = "9aab924d9c6eeb5cad63";
const pinataSecretApiKey = "2843022459b4a601c333a89453a867787f00ec96fea8f7edd1a7efb734c37e22"

export const pinFileToIPFS = (image: ReadStream, name: string ) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    //we gather a local file for this example, but any valid readStream source will work here.
    let data = new FormData();
    data.append('file', image);

    //You'll need to make sure that the metadata is in the form of a JSON object that's been convered to a string
    //metadata is optional
    const metadata = JSON.stringify({
        name: name
    });

    data.append('pinataMetadata', metadata);

    //pinataOptions are optional
    const pinataOptions = JSON.stringify({
        cidVersion: 0,
        customPinPolicy: {
            regions: [
                {
                    id: 'FRA1',
                    desiredReplicationCount: 1
                },
                {
                    id: 'NYC1',
                    desiredReplicationCount: 2
                }
            ]
        }
    });
    data.append('pinataOptions', pinataOptions);

    return axios
        .post(url, data, {
            maxBodyLength: 300000,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                pinata_api_key: pinataApiKey,
                pinata_secret_api_key: pinataSecretApiKey
            }
        })
        .then(function (response) {
            return response.data;
        })
        .catch(function (error) {
            console.error(error);
            return;
        });
};