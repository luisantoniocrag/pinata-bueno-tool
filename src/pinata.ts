import { ReadStream } from 'fs';
import axios from 'axios';
const FormData = require('form-data');
const Bottleneck = require('bottleneck')

const pinataApiKey = "a4f74909475060e86bc5";
const pinataSecretApiKey = "20613c8666de34e2dfe80bef777b236aa9b3057cb58b5841bdd76d84ec6d0165"

//https://docs.pinata.cloud/rate-limits
//current pinata rate limit is 30 requests per minute (2 seconds per request)
const axiosCallRateLimiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 2333
})

export const pinFileToIPFS = async (image: ReadStream, name: string ) => {
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

    try {
        const response = await axiosCallRateLimiter.schedule(() => axios.post(url, data, {
            maxBodyLength: Infinity,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data.getBoundary()}`,
                pinata_api_key: pinataApiKey,
                pinata_secret_api_key: pinataSecretApiKey
            }
        }))
        return response.data
    } catch(error) {
        return console.error(error)
    }
};