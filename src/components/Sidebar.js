import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import '../SongList.css';

const API_URL = 'https://cms.samespace.com/items/songs';

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function Sidebar({ onSongChange, searchTerm, setSearchTerm }) {
    const [songs, setSongs] = useState([]);
    const [songsWithDurations, setSongsWithDurations] = useState([]);

    useEffect(() => {
        async function fetchSongs() {
            try {
                const response = await fetch(API_URL);
                const data = await response.json();
                const songsData = data.data;
                const durationsPromises = songsData.map(async (song) => {
                    const audio = new Audio(song.url);
                    return new Promise((resolve) => {
                        audio.onloadedmetadata = () => {
                            resolve({
                                ...song,
                                duration: formatDuration(audio.duration),
                            });
                        };
                    });
                });
                const songsWithDurations = await Promise.all(durationsPromises);
                setSongs(songsWithDurations);
            } catch (error) {
                console.error('Error fetching songs:', error);
            }
        }
        fetchSongs();
    }, []);

    return (
        <div className="sidebar">
            <div className="header">
                <div className="tab-container">
                    <button className="tab active">For You</button>
                    <button className="tab">Top Tracks</button>
                </div>
                <div className="search-container">
                    <input 
                        type="text" 
                        className="search-bar" 
                        placeholder="Search Song, Artist" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                </div>
            </div>
            <div className="song-list">
                {songs
                    .filter(song => song.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((song) => (
                        <div key={song.id} onClick={() => onSongChange(song)} className="song-item">
                            <div className="song-details">
                                <img src={`https://cms.samespace.com/assets/${song.cover}`} alt={song.title} className="song-cover" />
                                <div className="song-info">
                                    <h4 className="song-title">{song.name}</h4>
                                    <p className="song-artist">{song.artist}</p>
                                </div>
                            </div>
                            <div className="song-duration">{song.duration}</div>
                        </div>
                    ))}
            </div>
        </div>
    );
}

export default Sidebar;
