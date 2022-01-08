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
  onChange: (e: any) => {}
}

const S3FilePond: React.FC<OwnProps> = (props) => {
  const {
    imageCropAspectRatio,
    presignedUrlEndpoint,
    initialFiles,
    onChange
  } = props;
  const [filename, setFilename] = useState();
  const [files, setFiles] = useState();
  const [baseUrl, setBaseUrl] = useState();
  useEffect(() => {
    setFiles(initialFiles);
    if ( initialFiles.length >0 ) {
      const imageUrl = new URL( initialFiles[0].source)
      setBaseUrl(imageUrl.origin);
      setFilename(imageUrl.pathname);
    }
  },
  // We only want the original file to render the first time
  // eslint-disable-next-line
  []);

  const handleFileChanged = (fileData) => {
    setFilename(`/${fileData.fileId}`);;
    onChange(fileData);
  }

  const filepondEditorSettings = {
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
          let reader = new FileReader();
          reader.onload = async (e) => {
            const upload_url = response.data.uploadURL;
            try {
              const result = await axios.put(
                upload_url, e.target.result,{
                  headers: { 'Content-Type': 'image/*' },
                  timeout: 9999999,
                  onUploadProgress: progressEvent => progress(true, progressEvent.loaded,  progressEvent.total)
                });
              // pass file unique id back to filepond
              const url = new URL(response.data.uploadURL);
              setBaseUrl(url.origin);
              handleFileChanged({fileId: response.data.filename, fileType: file.type, name: file.name});
              load(response.data.filename);
            } catch (e) {
              //perhaps this needs some error logging
              error(e);
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
          load();
        },
      }}
      onupdatefiles={fileItems => {
        // Set currently active file objects to this.state
        setFiles(fileItems.map(fileItem => fileItem.file));
        if (fileItems.length === 0)
          handleFileChanged({});
      }}>
    </FilePond>
    {filename && <img alt=""  width={"100%"} src={ `${baseUrl}${filename}` } />}

  </div>
);
}

export default S3FilePond;
