import React, {useEffect} from "react";
import api from "../../api";
import axios from "axios";

import {useState} from "react";
import heic2any from 'heic2any';

// pintura
import 'pintura/pintura.css';
import {
  // editor
  locale_en_gb,
  createDefaultImageReader,
  createDefaultImageWriter,

  //helpers
  blobToFile,

  // plugins
  setPlugins,
  plugin_crop,
  plugin_crop_locale_en_gb,
  plugin_finetune,
  plugin_finetune_locale_en_gb,
  plugin_finetune_defaults,
  plugin_filter,
  plugin_filter_locale_en_gb,
  plugin_filter_defaults,
  plugin_annotate,
  legacyDataToImageState,
  openEditor,
  processImage,
  createDefaultImageOrienter,
} from 'pintura';

// filepond
import 'filepond/dist/filepond.min.css';
import 'filepond/dist/filepond.css';
import 'filepond-plugin-media-preview/dist/filepond-plugin-media-preview.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import FilePondPluginImageEditor from 'filepond-plugin-image-editor';

import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginMediaPreview from 'filepond-plugin-media-preview';

registerPlugin(FilePondPluginImageEditor, FilePondPluginMediaPreview);

setPlugins(plugin_crop, plugin_finetune, plugin_filter, plugin_annotate);
const imageReader = createDefaultImageReader({
  preprocessImageFile: async (file, options, onprogress) => {
    // If is not of type HEIC we skip the file
    if (!/heic|heif/.test(file.type)) return file;

    // Let's turn the HEIC image into JPEG so the browser can read it
    const blob: Blob | Blob[] = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.94,
    });

    // The editor expects a File so let's convert our Blob
    return blobToFile(blob as Blob, file.name);
  },
});

interface OwnProps {
  imageCropAspectRatio: number,
  presignedUrlEndpoint: string,
  initialFiles: Array<any>,
}

const S3FilePond: React.FC<OwnProps> = (props) => {
  const {imageCropAspectRatio, presignedUrlEndpoint, initialFiles} = props;
  const [filename, setFilename] = useState();
  const [files, setFiles] = useState();
  const  handleInit = () => {
    console.log('FilePond instance has initialised');
  }
  useEffect(() => {
    setFiles(initialFiles);
    if ( initialFiles.length >0 ) {
      const imageUrl = new URL( initialFiles[0].source)
      setFilename(imageUrl.pathname);
    }
  }, [initialFiles]);

  const filepondEditorSettings =  {
    legacyDataToImageState: legacyDataToImageState,
    createEditor: openEditor,
    imageReader: [() => imageReader],
    imageWriter: [createDefaultImageWriter],
    imageProcessor: processImage,

    editorOptions: {
      handleEvent: async (type, detail) => {
        if (type === 'process') {
          return new Promise(resolve => {
            setTimeout(() => {
              const event = new Event('imageFileChanged');
              resolve(
              document.dispatchEvent(event)
              );
            }, 0);
          })
        }
      },
      imageOrienter: createDefaultImageOrienter(),
      imageCropAspectRatio: imageCropAspectRatio,
      ...plugin_finetune_defaults,
      ...plugin_filter_defaults,
      locale: {
        ...locale_en_gb,
        ...plugin_crop_locale_en_gb,
        ...plugin_finetune_locale_en_gb,
        ...plugin_filter_locale_en_gb,
      },
    },
  };

  return (
  <div>
    <FilePond
      files={files}
      allowMultiple={true}
      imageEditorInstantEdit={false}
      imagePreviewMaxFileSize='50MB'
      imagePreviewHeight={200}
      allowImageResize={true}
      imageResizeTargetWidth={250}
      imageResizeTargetHeight={null}
      itemInsertLocation="after"
      maxFileSize='100MB'
      maxTotalFileSize='100MB'
      imageEditor={filepondEditorSettings}
      server={{
        process: async function(fieldName, file, metadata, load, error, progress, abort) {
          // Get a presigned URL from the API
          const response = await api.get(presignedUrlEndpoint)

          console.log('Response: ', response.data);

          console.log('Uploading: ', file.name);
          let reader = new FileReader();
          reader.onload = async (e) => {
            const upload_url = response.data.uploadURL;
            console.log('Uploading to: ', upload_url);

            try {
              console.log(`Uploading ${e.target.result.byteLength} bytes to s3`);
              const result = await axios.put(
                upload_url, e.target.result,{
                  headers: { 'Content-Type': 'image/*' },
                  timeout: 9999999,
                  onUploadProgress: progressEvent => progress(true, progressEvent.loaded,  progressEvent.total)
                });
              console.log(result);
              // pass file unique id back to filepond
              setFilename(`/${response.data.filename}`);
              load(response.data.filename);
            } catch (e) {
              console.log(e)
            }
          }
          if (/heic|heif/.test(file.type)) {
            const blob: Blob | Blob[] = await heic2any({
              blob: file,
              toType: 'image/jpeg',
              quality: 0.84,
            });
            reader.readAsArrayBuffer(blob);
          } else {
            reader.readAsArrayBuffer(file)
          }
        },
        load: (source, load, error, progress, abort, headers) => {
          fetch(source, {
            credentials: 'omit',
            cache: "no-cache",
            headers: {
              'Access-Control-Request-Method': 'GET',
              'Content-Type': 'image/jpeg'
            }
          }).then((response) => response.blob()
          ).then( load ).catch( (e) => {
            error(e);
          })
        },
        revert: (uniqueFileId, load, error) => {
          // Should remove the earlier created temp file here
          // ...

          // Can call the error method if something is wrong, should exit after
          //error('oh my goodness');

          // Should call the load method when done, no parameters required
          load();
        },
      }}
      oninit={() => handleInit() }
      onupdatefiles={fileItems => {
        // Set currently active file objects to this.state
        setFiles(fileItems.map(fileItem => fileItem.file));
        if (fileItems.length === 0)
          setFilename('');
      }}>
    </FilePond>
    {filename && <img alt=""  width={"100%"} src={ `https://s3-media-upload-globalimpact-world.s3-accelerate.amazonaws.com${filename}` } />}

  </div>
);
}

export default S3FilePond;
