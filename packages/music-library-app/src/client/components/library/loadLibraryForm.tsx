import { FileInput, FormGroup } from "@blueprintjs/core";
import classNames from "classnames";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Roarr as log } from "roarr";

import { appStore } from "../../store/appStore";
import styles from "./loadLibraryForm.module.scss";

const XML_INPUT_PROPS = {
  accept: ".xml",
};

export default function LoadLibraryForm() {
  const setLibraryInputFilepath = appStore.use.setLibraryInputFilepath();

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files?.length) {
        setLibraryInputFilepath(event.target.files[0].path);
      }
    },
    [setLibraryInputFilepath],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      log.debug(`[client] accepted input library file: ${acceptedFiles[0].path}`);
      setLibraryInputFilepath(acceptedFiles[0].path);
    },
    [setLibraryInputFilepath],
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/xml": [".xml"],
    },
    maxFiles: 1,
    onDrop,
  });

  return (
    <FormGroup>
      <FileInput
        className={styles.fileInput}
        text="Select XML file"
        fill={true}
        onInputChange={handleInputChange}
        inputProps={XML_INPUT_PROPS}
      />
      <div className={styles.separator}>or</div>
      <div
        className={classNames(styles.dropzone, { [styles.active]: isDragActive })}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {isDragActive ? <span>Drop XML file here...</span> : <span>Drag and drop XML file</span>}
      </div>
    </FormGroup>
  );
}
