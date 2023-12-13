import { TrackDefinition } from "@adahiya/music-library-tools-lib";

// see https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Containers
const WEB_AUDIO_SUPPORTED_FILE_EXTENSIONS = ["mp3", "wav", "flac", "aac"];

export function isSupportedWebAudioFileFormat(trackDef: TrackDefinition): boolean {
    const { Location } = trackDef;
    for (const ext of WEB_AUDIO_SUPPORTED_FILE_EXTENSIONS) {
        if (Location.endsWith(ext)) {
            return true;
        }
    }
    return false;
}
