# imgsec

'imgsec' is an image encryption and decryption desktop application. It used the XOR encryption algorithm to encrypt the image using a random key, and then later on, it used that same key to decrypt the image.

## Interface

![interface](https://github.com/csenasrullah/imgsec/assets/150243557/ae14511b-181a-44aa-a6b7-5e870e925b4c)


## Installation
Install npm by running

```sh
npm install
```

## Usage

Run it directly using npm.

```sh
npm start
```

## Technical Issues

You must reload the interface to decrypt an image after encrypting. To do that, hit ctrl+R, or you need to go to the file menu, and there you will find the reload option. Just click it and have fun.

![Reload](https://github.com/csenasrullah/imgsec/assets/150243557/9dbedd93-682d-4387-b06b-260391ebd432)



## Appriciation
This project is highly inspired by @TheNinza. In other words, I just give it a graphic look. Please have a look at his projects too.


## Limitations

The encryption and decryption on the PNG images are perfect. The png image format is almost lossless in data compression. On the other hand, in jpg and jpeg, the encryption and decryption of the image are lossy operations; sometimes they lose their clarity and sharpness as well as their resolution. So, I will suggest using this encryption and decryption for PNG images.


## Supports
Feel free to share your thoughts. Spread Love <3
