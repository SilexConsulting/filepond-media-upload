# Demo: Pintura and filepond with Amazon S3 Pre-Signed-URL's

# Requirements
- This demo requires that you have a working username and password on uat.globalimpact.world
- I have compiled and run this using node 14.18.1 and npm 6.14.15.

# Installation

Copy the following Pictura modules from your downloaded package into the `local_modules` directory:

```
filepond
filepond-plugin-image-editor
pintura
react-pintura
```

Then run: 
```
npm install
``` 
followed by 
```
npm start
```

This will start the application on localhost:3001.

The application will start by setting the filepond to contain a publicly accessible existing image 
stored in S3.
