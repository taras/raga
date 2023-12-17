import { Button, ButtonGroup, Props } from "@blueprintjs/core";

import { useVoidCallback } from "../common/hooks";
import { appStore } from "../store/appStore";

export type LibraryActionsProps = Props;

export default function LibraryActions(props: LibraryActionsProps) {
    const isLibraryLoaded = appStore.use.libraryLoadingState() !== "none";
    const loadLibrary = appStore.use.loadSwinsianLibrary();

    const handleLoad = useVoidCallback(loadLibrary);
    const handleLoadFromDisk = useVoidCallback(() => loadLibrary({ reloadFromDisk: true }));

    return (
        <div className={props.className}>
            <ButtonGroup>
                <Button
                    text={`${isLibraryLoaded ? "Reload" : "Load"} library`}
                    onClick={handleLoad}
                />
                <Button text="Reload from disk" onClick={handleLoadFromDisk} />
            </ButtonGroup>
            <br />
            <br />
            <ButtonGroup>
                <WriteModifiedLibraryButton />
            </ButtonGroup>
        </div>
    );
}

function WriteModifiedLibraryButton() {
    const libraryWriteState = appStore.use.libraryWriteState();
    const writeModifiedLibrary = appStore.use.writeModiifedLibrary();

    const handleWriteModifiedLibrary = useVoidCallback(writeModifiedLibrary);

    return (
        <Button
            text="Write modified library to disk"
            disabled={libraryWriteState === "none"}
            loading={libraryWriteState === "busy"}
            intent="primary"
            onClick={handleWriteModifiedLibrary}
        />
    );
}
