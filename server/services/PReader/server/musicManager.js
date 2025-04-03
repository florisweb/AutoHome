
import { promises as fs } from "node:fs";
import { readdir } from 'node:fs/promises'

import { fileURLToPath } from 'url';
import path from 'path';
const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));

// import { pdf } from "pdf-to-img";

// import { Jimp } from "jimp";
// import pkg from 'jimp';
// const { Jimp } = pkg;



const MusicManager = new class {
    #pathToRawMusic = __dirname + '/rawMusic';
    #pathToConvertedMusic = __dirname + '/convertedMusic';
    constructor() {
        fs.watch(this.#pathToRawMusic, {}, async (eventType, relativePath) => {
            try {
                console.log('changed!: name', relativePath);
                this.#convertPDF(relativePath);
            } catch (e) {Logger.log('Error while updating state: ' + e, 'AUTOCLOUD')}
        });
    }

    async getAvailableMusic() {
        let out = (await readdir(this.#pathToRawMusic)).filter(p => !p.includes('.DS_Store')).map(p => {
            return {
                name: p.split('.pdf')[0],
                pages: 3, // TODO
            }
        });
        console.log('getAvailableMusic', out);
        return out;
    }

    async getAvailableMusicPages() {
        return (await readdir(this.#pathToConvertedMusic)).filter(p => !p.includes('.DS_Store')).map(r => r.split('.base64')[0]);
    }

    async getMusicImage(_imageName) {
        // return new Promise(async (resolve, error) => {
            let path = `${this.#pathToConvertedMusic}/${_imageName}.base64`;
            console.log('req', path);
            return fs.readFile(path, 'utf8');
            // .then(() => {
            //     reo
            // })

            //  (err, data) => {
            //     console.log('read', path, data);
            //     if (err) {
            //         console.error('Error reading the file:', err);
            //         error(err);
            //         return;
            //     }
            //     resolve(data);
            // });
        // });
    }


    async #convertPDF(_name) {
      // let counter = 1;
      // const document = await pdf(`${this.#pathToRawMusic}/${_name}.pdf`, { scale: 1.15 });
      // for await (const image of document) {
      //   await storeImgAsBase64(image, `${this.#pathToConvertedMusic}/${_name}_[${counter}]`);
      //   counter++;
      // }
    }


    // async #convertImgBufferToBase64(_imgBuffer, _name) {
    //     const image = await Jimp.fromBuffer(_imgBuffer);
    //     image.greyscale();
    //     image.rotate(-90);

    //     let bitMapOut = [];
    //     let curByte = 0;
    //     let horizontalPadding = 8 - (image.bitmap.width % 8);
    //     const channels = 4;

    //     for (let i = 0; i < image.bitmap.data.length; i += channels)
    //     {
    //         let x = (i % (channels * image.bitmap.width)) / channels;
    //         curByte = curByte << 1 | (image.bitmap.data[i] > 127 ? 0 : 1);

    //         if (x === image.bitmap.width - 1) // Add padding when last pixel is passed
    //         {
    //             curByte = curByte << horizontalPadding;
    //         } 

    //         if ((x % 8 === (8 - 1) && x !== 0) || x === image.bitmap.width - 1)
    //         {
    //             bitMapOut.push(curByte);
    //             curByte = 0;
    //         }
    //     }

    //     let buffer = Buffer.from(bitMapOut);
    //     let encoded = buffer.toString('base64');
    //     return fs.writeFile(`${_name}.base64`, encoded);
    // }
}

export default MusicManager;