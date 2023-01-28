import { PlaylistDefinition } from "../playlists.mjs";
import { BasicTrackDefinition } from "../tracks.mjs";
import { MusicLibraryPlist } from "./plist.mjs";

type TrackDefinitionVisitor = (track: BasicTrackDefinition) => void;

export function forEachTrackInLibrary(library: MusicLibraryPlist, visitor: TrackDefinitionVisitor) {
    for (const trackId of Object.keys(library.Tracks)) {
        const trackDefinition = library.Tracks[trackId as unknown as number];
        visitor(trackDefinition);
    }
}

type PlaylistDefinitionVisitor = (playlist: PlaylistDefinition) => void;

export function forEachPlaylistInLibrary(
    library: MusicLibraryPlist,
    visitor: PlaylistDefinitionVisitor,
) {
    for (const playlist of library.Playlists) {
        if (playlist.Visible === false || playlist.Master === true) {
            return;
        }
        visitor(playlist);
    }
}
