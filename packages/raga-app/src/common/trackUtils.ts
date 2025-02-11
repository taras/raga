import type { AudioFileType, TrackDefinition } from "@adahiya/raga-lib";

// HACKHACK: /lib/cjs is not exporting values so we need to copy them out here
export const AUDIO_FILE_TYPES: AudioFileType[] = [
  "mp3",
  "m4a",
  "flac",
  "wav",
  "aif",
  "aiff",
  "aac",
];

export function getTrackFileType(trackDef: TrackDefinition): AudioFileType | undefined {
  const fileExtension = trackDef.Location.split(".").pop()!;
  if (Object.values(AUDIO_FILE_TYPES).includes(fileExtension as AudioFileType)) {
    return fileExtension as AudioFileType;
  }

  return undefined;
}
