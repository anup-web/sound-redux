import { normalize } from 'normalizr';
import { fetchSongs, fetchSongsSuccess } from '../actions/PlaylistActions';
import * as types from '../constants/ActionTypes';
import { SONG_URL, SONG_COMMENTS_URL, USER_SONGS_URL } from '../constants/ApiConstants';
import { songSchema } from '../constants/Schemas';
import callApi from '../utils/ApiUtils';

const fetchSongCommentsSuccess = (id, comments) => ({
  type: types.FETCH_SONG_COMMENTS_SUCCESS,
  entities: {
    songs: {
      [id]: { comments },
    },
  },
});

const fetchSongComments = id => async (dispatch) => {
  const { json } = await callApi(SONG_COMMENTS_URL.replace(':id', id));
  dispatch(fetchSongCommentsSuccess(id, json));
};

const fetchSong = (id, playlist) => async (dispatch) => {
  const { json } = await callApi(SONG_URL.replace(':id', id));
  const { userId } = json;

  const { entities, result } = normalize(json, songSchema);
  dispatch(fetchSongsSuccess(playlist, [result], entities, null, null));
  dispatch(fetchSongComments(id));
  dispatch(fetchSongs(playlist, USER_SONGS_URL.replace(':id', userId)));
};

const shouldFetchSong = (id, state) => {
  const { entities } = state;
  const { songs } = entities;
  const songExists = id in songs;
  const songHasWaveform = songExists ? songs[id].waveformUrl.indexOf('json') > -1 : null;

  return !songExists || !songHasWaveform;
};

const fetchSongIfNeeded = (id, playlist) => (dispatch, getState) => {
  if (shouldFetchSong(id, getState())) {
    dispatch(fetchSong(id, playlist));
  }
};

export default fetchSongIfNeeded;